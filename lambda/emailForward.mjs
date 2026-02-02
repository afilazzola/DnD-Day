import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { SESClient, SendRawEmailCommand } from "@aws-sdk/client-ses";

const REGION = "ca-central-1";

const s3 = new S3Client({ region: REGION });
const ses = new SESClient({ region: REGION });

// 🔴 CHANGE THIS
const DESTINATION_EMAIL = "youemail@domain.com";

// 🔒 Verified SES sender
const SOURCE_EMAIL = "info@legendarydnd.ca";

// Loop prevention header (we add it on send, and skip if we see it on receive)
const LOOP_HEADER_NAME = "X-SES-Forwarded-By";
const LOOP_HEADER_VALUE = "legendarydnd-forwarder";

export const handler = async (event) => {
  console.log("SES Event:", JSON.stringify(event, null, 2));

  const record = event.Records?.[0]?.ses;
  if (!record) throw new Error("Missing SES record");

  const mail = record.mail;

  // Skip messages we already forwarded (prevents loops)
  const alreadyForwarded = (mail.headers || []).some(
    (h) =>
      (h.name || "").toLowerCase() === LOOP_HEADER_NAME.toLowerCase() &&
      (h.value || "") === LOOP_HEADER_VALUE
  );
  if (alreadyForwarded) {
    console.log("Loop detected via header, skipping");
    return;
  }

  const bucket = process.env.SES_BUCKET;
  const prefix = process.env.SES_PREFIX || "";
  const messageId = mail.messageId;

  if (!bucket) throw new Error("Missing env var SES_BUCKET");

  const key = `${prefix}${messageId}`;
  console.log("Fetching S3 object:", bucket, key);

  const s3Object = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
  const rawEmailBuf = await streamToBuffer(s3Object.Body);

  const rawEmailStr = rawEmailBuf.toString("utf8");

  const originalFrom = mail.commonHeaders?.from?.join(", ") || "";
  const originalSubject = mail.commonHeaders?.subject || "";

  // ✅ BULLETPROOF rewrite: rebuild headers, strip sender-like headers
  const rewritten = rebuildEmail({
    rawEmailStr,
    verifiedFrom: `LegendaryDnD <${SOURCE_EMAIL}>`,
    replyTo: originalFrom || undefined,
    subjectPrefix: "FWD: ",
    subjectFallback: originalSubject,
    loopHeaderName: LOOP_HEADER_NAME,
    loopHeaderValue: LOOP_HEADER_VALUE,
  });

  await ses.send(
    new SendRawEmailCommand({
      RawMessage: { Data: Buffer.from(rewritten, "utf8") },
      Source: SOURCE_EMAIL,
      Destinations: [DESTINATION_EMAIL],
    })
  );

  console.log("Email forwarded successfully to", DESTINATION_EMAIL);
};

const streamToBuffer = async (stream) => {
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
};

/**
 * Rebuilds headers cleanly so SES identity checks don't see the original Gmail sender.
 * Removes: From, Sender, Return-Path, Resent-From, Resent-Sender, Reply-To
 * Adds: From (verified), Reply-To (original), Subject (prefixed), loop header
 */
function rebuildEmail({
  rawEmailStr,
  verifiedFrom,
  replyTo,
  subjectPrefix,
  subjectFallback,
  loopHeaderName,
  loopHeaderValue,
}) {
  // Normalize line endings for parsing
  const normalized = rawEmailStr.replace(/\r\n/g, "\n");

  // Split headers/body at first blank line
  const splitIdx = normalized.indexOf("\n\n");
  if (splitIdx === -1) {
    // Fallback: if we can't split, at least prepend our headers
    return [
      `${loopHeaderName}: ${loopHeaderValue}`,
      `From: ${verifiedFrom}`,
      replyTo ? `Reply-To: ${replyTo}` : null,
      `Subject: ${subjectPrefix}${subjectFallback || ""}`,
      "",
      normalized,
    ]
      .filter(Boolean)
      .join("\r\n");
  }

  const headerBlock = normalized.slice(0, splitIdx);
  const bodyBlock = normalized.slice(splitIdx + 2);

  // Unfold continuation lines then split into header lines
  const unfolded = headerBlock.replace(/\n([ \t]+)/g, " ");
  const headerLines = unfolded.split("\n").filter(Boolean);

  // Strip sender-like headers that can trigger SES identity verification
  const strip = new Set([
    "from",
    "sender",
    "return-path",
    "reply-to",
    "resent-from",
    "resent-sender",
  ]);

  const kept = [];
  for (const line of headerLines) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const name = line.slice(0, idx).trim().toLowerCase();
    if (!strip.has(name)) kept.push(line.trim());
  }

  // Determine subject to use (try kept headers first)
  let subject = subjectFallback || "";
  const subjectLine = kept.find((l) => l.toLowerCase().startsWith("subject:"));
  if (subjectLine) {
    subject = subjectLine.slice(8).trim();
    // remove existing subject so we can re-add with prefix
    const i = kept.indexOf(subjectLine);
    if (i >= 0) kept.splice(i, 1);
  }

  const finalSubject =
    subjectPrefix && subject && !subject.startsWith(subjectPrefix)
      ? `${subjectPrefix}${subject}`
      : subject || `${subjectPrefix || ""}${subjectFallback || ""}`.trim();

  const rebuiltHeaders = [
    `${loopHeaderName}: ${loopHeaderValue}`,
    `From: ${verifiedFrom}`,
    replyTo ? `Reply-To: ${replyTo}` : null,
    `Subject: ${finalSubject}`,
    ...kept,
  ].filter(Boolean);

  // Rebuild with CRLF (important for email format)
  return `${rebuiltHeaders.join("\r\n")}\r\n\r\n${bodyBlock.replace(/\n/g, "\r\n")}`;
}

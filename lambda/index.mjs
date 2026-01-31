const SCORE_THRESHOLD = 0.6;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Accept, Authorization',
  'Access-Control-Max-Age': '86400'
};

const json = (status, body) => ({
  statusCode: status,
  headers: { 'Content-Type': 'application/json', ...corsHeaders },
  body: JSON.stringify(body),
});

// Map subject codes to readable names
const subjectLabels = {
  general: 'General Question',
  signup: 'Signup / Registration',
  character: 'Character Questions',
  logistics: 'Event Logistics',
  other: 'Other'
};

export const handler = async (event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  // Handle CORS preflight
  if (event.requestContext?.http?.method === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }

  try {
    let body;

    // Handle different body formats
    if (event.body) {
      try {
        body = JSON.parse(event.body);
      } catch (e) {
        console.log('Failed to parse JSON, raw body:', event.body);
        return json(400, { ok: false, reason: 'invalid_json' });
      }
    } else {
      return json(400, { ok: false, reason: 'empty_body' });
    }

    console.log('Parsed body:', body);

    // Honeypot check (field name: website)
    if (body.website && String(body.website).trim() !== '') {
      console.log('Honeypot triggered');
      return json(400, { ok: false, reason: 'honeypot' });
    }

    // Basic validation
    if (!body.name || !body.email || !body.message) {
      console.log('Missing required fields:', {
        hasName: !!body.name,
        hasEmail: !!body.email,
        hasMessage: !!body.message
      });
      return json(400, { ok: false, reason: 'missing_fields' });
    }

    // Get reCAPTCHA token
    const token = body.recaptchaToken || body.recaptcha || body['g-recaptcha-response'];
    const action = body.recaptchaAction || body.action || 'contact_submit';

    if (!token) {
      console.log('Missing reCAPTCHA token. Available fields:', Object.keys(body));
      return json(400, { ok: false, reason: 'missing_token' });
    }

    console.log('Verifying reCAPTCHA token...');

    // reCAPTCHA verification
    const verifyResp = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: process.env.CAPTCHA_SECRET_KEY,
        response: token,
      }),
    });

    if (!verifyResp.ok) {
      console.log('reCAPTCHA API request failed:', verifyResp.status, verifyResp.statusText);
      return json(500, { ok: false, reason: 'recaptcha_api_error' });
    }

    const result = await verifyResp.json();
    console.log('reCAPTCHA result:', result);

    // Check basic success first
    if (!result.success) {
      console.log('reCAPTCHA verification failed:', result['error-codes']);
      return json(403, {
        ok: false,
        reason: 'recaptcha_verification_failed',
        details: { errors: result['error-codes'] }
      });
    }

    // Action validation
    const actionOk = !action || result.action === action;

    // Score validation
    const scoreOk = (result.score ?? 0) >= SCORE_THRESHOLD;

    // Time validation - 5 minutes
    const freshEnough = !result.challenge_ts ||
      (Date.now() - Date.parse(result.challenge_ts) <= 5 * 60 * 1000);

    console.log('Validation checks:', {
      success: result.success,
      actionOk,
      scoreOk,
      freshEnough,
      score: result.score,
      action: result.action,
      hostname: result.hostname
    });

    const passed = result.success && actionOk && scoreOk && freshEnough;

    if (!passed) {
      console.log('reCAPTCHA validation failed', {
        success: result.success,
        score: result.score,
        action: result.action,
        hostname: result.hostname,
        actionOk,
        scoreOk,
        freshEnough,
        errors: result['error-codes']
      });

      return json(403, {
        ok: false,
        reason: 'recaptcha_validation_failed',
        details: {
          score: result.score,
          action: result.action,
          hostname: result.hostname,
          checks: { actionOk, scoreOk, freshEnough }
        }
      });
    }

    // Extract form data
    const { name, email, subject, message } = body;
    const subjectLabel = subjectLabels[subject] || subject || 'General Question';

    // Send email via SES SMTP
    console.log('Sending email...');
    const nodemailer = await import('nodemailer');
    const transporter = nodemailer.default.createTransport({
      host: 'email-smtp.ca-central-1.amazonaws.com',
      port: 587,
      secure: false,
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
      auth: {
        user: process.env.SES_USERNAME,
        pass: process.env.SES_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_TO,
      replyTo: `${name} <${email}>`,
      subject: `DnD Day Contact - ${subjectLabel}`,
      text: `Name: ${name}\nEmail: ${email}\nSubject: ${subjectLabel}\n\nMessage:\n${message}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #c9a227; border-bottom: 2px solid #c9a227; padding-bottom: 10px;">
            DnD Day - Contact Form
          </h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; width: 100px;">Name:</td>
              <td style="padding: 8px 0;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Email:</td>
              <td style="padding: 8px 0;"><a href="mailto:${email}">${email}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Subject:</td>
              <td style="padding: 8px 0;">${subjectLabel}</td>
            </tr>
          </table>
          <div style="margin-top: 20px; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
            <p style="font-weight: bold; margin-top: 0;">Message:</p>
            <p style="white-space: pre-wrap;">${message.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>')}</p>
          </div>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">
            Sent from the DnD Day - Operation Golden Sword contact form
          </p>
        </div>
      `
    };

    console.log('Mail options configured, sending...');
    await transporter.sendMail(mailOptions);
    console.log('Email sent via SES SMTP');

    return json(200, { ok: true, message: 'Email sent successfully' });

  } catch (error) {
    console.error('Lambda error:', error);
    return json(500, {
      ok: false,
      reason: 'internal_error',
      message: 'Failed to process request'
    });
  }
};

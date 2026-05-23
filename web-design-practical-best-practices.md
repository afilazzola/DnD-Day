# Practical Web Design Best Practices

Based on the transcript, these are the practical design takeaways only: typography, layout, hierarchy, spacing, color, and contrast.

## Typography

Use a **type scale system** instead of eyeballing font sizes.

Start with a base paragraph size, typically around **16px**, then scale headings upward consistently. The transcript recommends a **Major Third scale**, where each step is about **25% larger** than the previous one.

Example scale:

| Element | Approximate size |
|---|---:|
| Body text | 16px |
| Small heading / H6 | 20px |
| H5 | 25px |
| Larger headings | Continue scaling upward by about 25% |

Use **rem values** rather than fixed pixels when possible, because rem-based sizing handles scaling more cleanly.

### Letter spacing

For **body text**, leave letter spacing alone. Default spacing is usually the most legible.

For **large headings**, slightly tighten letter spacing so the text feels cleaner and more polished.

### Line height

Use about **150% line height** for paragraphs.

Example:

| Font size | Recommended line height |
|---:|---:|
| 16px | 24px |
| 18px | 27px |
| 20px | 30px |

For larger headings, reduce the line height slightly so they feel tighter, stronger, and easier to scan.

## Layout

Use a grid system instead of manually placing elements until they “feel right.”

Recommended responsive grid:

| Device | Grid |
|---|---:|
| Desktop | 12 columns |
| Tablet | 8 columns |
| Mobile | 4 columns |

This keeps layouts flexible and easier to align across screen sizes.

## Spacing

Use an **8-point spacing system**.

That means spacing should usually be multiples of 8:

```text
8, 16, 24, 32, 40, 48, 56, 64
```

This gives the design rhythm and prevents random-looking gaps.

Practical spacing rules:

- Keep related items close together.
- Use larger gaps between major sections.
- Keep margins and padding consistent.
- Avoid cramming content into tight areas.
- Use whitespace to make the page easier to scan.

## Visual Hierarchy

Design for scanning, not reading.

Use hierarchy to guide the eye from the most important content to the least important content.

Key principles:

| Principle | Practical use |
|---|---|
| Proximity | Keep related items close together. |
| Size | Make important content larger. |
| Contrast | Use weight, color, opacity, or size to show importance. |
| Alignment | Keep clean lines so the structure is obvious. |

Do not rely on color alone to show importance. Combine color with size, weight, spacing, or placement.

## Color

Limit the palette. Use **two or three main colors** total, each with a clear role.

A useful rule is **60 / 30 / 10**:

| Share | Use |
|---:|---|
| 60% | Neutral colors for backgrounds and main text. |
| 30% | Secondary colors for cards, sections, headers, or visuals. |
| 10% | Accent colors for buttons, CTAs, and important emphasis. |

Use **opacity variations** instead of constantly adding new colors.

One strong color used at different opacities usually looks more cohesive than several unrelated colors.

## Contrast

Always check foreground text against its background.

Minimum contrast targets:

| Text type | Minimum contrast |
|---|---:|
| Large text | 3:1 |
| Smaller/body text | 4.5:1 |

A color combination can look nice but still fail if people cannot read it easily.

Practical contrast rules:

- Use dark text on light backgrounds or light text on dark backgrounds.
- Avoid light gray text on white.
- Avoid colored text on colored backgrounds unless the contrast is strong.
- Important text should have the highest contrast.
- Secondary text can be lower contrast, but still needs to be readable.

## Practical Checklist

Use this as a quick review before finalizing a design.

### Typography

- [ ] Body text starts around 16px.
- [ ] Headings follow a consistent type scale.
- [ ] Font sizes use rem values where possible.
- [ ] Body text letter spacing is left at default.
- [ ] Large headings have slightly tighter letter spacing.
- [ ] Paragraph line height is around 150%.
- [ ] Heading line height is tighter than paragraph line height.

### Layout and Spacing

- [ ] Desktop layout uses a consistent grid, such as 12 columns.
- [ ] Tablet layout adapts to fewer columns, such as 8.
- [ ] Mobile layout adapts to fewer columns, such as 4.
- [ ] Spacing uses multiples of 8.
- [ ] Related items are grouped close together.
- [ ] Major sections have enough whitespace between them.
- [ ] Elements are consistently aligned.

### Visual Hierarchy

- [ ] The most important content is visually obvious first.
- [ ] Size is used to show importance.
- [ ] Weight, color, or opacity is used to support hierarchy.
- [ ] The page is easy to scan.
- [ ] The design does not rely only on color to communicate meaning.

### Color and Contrast

- [ ] The palette is limited to two or three main colors.
- [ ] Neutral, secondary, and accent colors each have clear roles.
- [ ] Accent colors are reserved for important actions or emphasis.
- [ ] Opacity is used for variation instead of adding too many colors.
- [ ] Large text meets at least 3:1 contrast.
- [ ] Body text meets at least 4.5:1 contrast.

## Condensed Takeaway

Use a consistent type scale, set paragraph line height around 150%, tighten large heading spacing, build layouts on responsive grids, use spacing in multiples of 8, limit your color palette, use opacity for variation, and check contrast every time.

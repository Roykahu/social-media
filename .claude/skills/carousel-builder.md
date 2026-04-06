# Carousel Builder Skill

Rules for generating 8-12 slide Instagram carousel content for @roy_automates.

## Slide Structure

### Slide 1: Hook (REQUIRED)
The first slide must stop the scroll. Use one of these hook formulas:

| Formula | Example |
|---------|---------|
| **Bold Stat** | "40 hours saved per month. Here's how." |
| **Contrarian Take** | "You don't need an AI strategy. You need this instead." |
| **Question** | "Why are 90% of teams using Claude wrong?" |
| **Before/After** | "Before Claude: 3 days. After: 45 minutes." |
| **List Promise** | "7 Claude prompts that replaced an entire workflow" |

- Max 12 words on the hook slide
- Use highlight colour (#E8A838) for the key number or word
- Dark background (#141413), large bold text

### Slides 2-10: Body (3-8 slides)
One insight per slide. Rules:
- **Max 30 words per slide**
- Lead with the insight, not the explanation
- Use numbered slides (e.g., "1/7", "2/7") for list formats
- Alternate between bg_primary (#141413) and bg_light (#faf9f5) for visual rhythm
- Include one accent element per slide (icon, stat, or highlighted word)

### Slide 11 (or second-to-last): Summary
- Recap the key takeaway in 1-2 sentences
- This is the "save-worthy" slide — make it screenshot-able
- Use bg_light background with accent_roy (#C9502C) text for emphasis

### Slide 12 (or last): CTA
- Drive to website, booking link, or training inquiry
- Must feel native to the topic, not generic
- Include: CTA text, website URL, current offer name, urgency line
- Use accent_roy (#C9502C) for the CTA button/link visual

## Nano Banana Image Prompts

Generate one image prompt per slide following this format:

```
[Slide type] for Instagram carousel. [Visual description].
Style: dark editorial, #141413 background, clean sans-serif typography,
[accent colour] highlights. Premium, minimal, cinematic.
Text overlay: "[The actual slide text]"
```

Use these accent colours:
- Hook slides: #E8A838 (amber highlight)
- Body slides: alternate #C9502C (terracotta) and #E8A838 (amber)
- Summary slide: #C9502C (terracotta)
- CTA slide: #C9502C (terracotta)

## Thumbnail Prompts (3 per carousel)

Generate 3 thumbnail prompt variations:

1. **Text-forward:** Bold typography on dark background, key phrase from hook
2. **Subject-forward:** Cinematic portrait/silhouette with subtle text overlay
3. **Data-forward:** Large stat/number with minimal context text

All thumbnails: dark editorial (#141413), terracotta accent (#C9502C), warm amber highlights (#E8A838).

## Content Rules

- Every carousel must map to one content pillar (TEACH, PROVE, INSPIRE, SELL)
- The pillar determines the CTA intensity:
  - TEACH → soft CTA ("Link in bio for more")
  - PROVE → medium CTA ("We trained [company]. Book yours.")
  - INSPIRE → soft CTA ("Follow for more insights")
  - SELL → direct CTA ("[Offer] — [Urgency]. Book now →")
- Write in Roy's voice: direct, confident, no fluff
- Reference African business context naturally when relevant

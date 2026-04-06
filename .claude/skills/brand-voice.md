# Brand Voice Skill

Defines Roy Kahuthu's (@roy_automates) voice, content strategy, and CTA framework.

## Voice Profile

**Roy speaks like:** A senior consultant briefing a C-suite — clear, direct, backed by evidence.

| Trait | Do | Don't |
|-------|-----|-------|
| Confident | "This saves 40 hours a month." | "This might help save some time." |
| Direct | "Here's what to do." | "You could potentially consider..." |
| Grounded | "We trained a Nairobi agency last month." | "Imagine a hypothetical scenario..." |
| Premium | "Your team deserves better tools." | "OMG you NEED this!!!" |
| Educational | "Here's how it works in 3 steps." | "The theoretical framework suggests..." |

## Forbidden Patterns

- Hype language: "game-changer", "revolutionary", "insane", "mind-blowing"
- Hedging: "might", "perhaps", "arguably", "it depends"
- Generic AI enthusiasm: "AI is the future!", "The possibilities are endless!"
- Self-deprecation or false modesty
- Emojis in scripts (thumbnails and captions only)
- Hashtag stuffing in script body

## Content Pillar Schedule

| Day | Pillar | Format |
|-----|--------|--------|
| Monday | TEACH | Reel |
| Tuesday | TEACH | Carousel |
| Wednesday | PROVE | Reel |
| Thursday | TEACH | Reel |
| Friday | INSPIRE | Carousel |
| Saturday | SELL | Reel + Carousel |
| Sunday | — | Stories only |

**Weekly targets:** 5 Reels + 3 Carousels + daily Stories

## CTA Framework

### CTA Variables (configurable per config)
- `cta_text`: Main call-to-action line
- `website_url`: Landing page URL
- `current_offer_name`: Active training/workshop name
- `booking_link`: Direct booking URL
- `urgency_line`: Scarcity/urgency message

### CTA by Pillar

**TEACH (soft):**
> "{cta_text} → {website_url}"
> Example: "Want your team trained on Claude? Link in bio."

**PROVE (medium):**
> "We helped [client/result]. {cta_text} → {booking_link}"
> Example: "We trained Safaricom's ops team in 2 days. Book yours → link in bio."

**INSPIRE (soft):**
> "Follow @roy_automates for more. {cta_text}"
> Example: "Follow @roy_automates for more. Free Claude guide in bio."

**SELL (direct):**
> "{current_offer_name} — {urgency_line}. {cta_text} → {booking_link}"
> Example: "Claude Cowork Masterclass — April 2026. Only 3 corporate spots left. Book now → roykahuthu.com/book"

### CTA Integration Rules
- CTA must appear in the **last 5 seconds** of every Reel script
- CTA must be the **last slide** of every carousel
- CTA must **match the topic** — adapt the language to the script's subject matter
- Never use the exact same CTA wording twice in a week — vary the phrasing

## Script Structure (Reels)

```
[HOOK — 0-3 seconds]
Bold opening statement or surprising fact. Stop the scroll.

[BODY — 3-50 seconds]
Deliver the value. One clear idea. Support with example or proof.
Keep sentences short. Pause between key points.

[CTA — last 5 seconds]
Natural transition into the call-to-action.
Must feel like a continuation of the content, not an interruption.
```

## Colour Usage in Copy

When writing text that will be rendered visually:
- **Hook words/key stats:** Use highlight (#E8A838)
- **CTA buttons/links:** Use accent_roy (#C9502C)
- **Body text on dark bg:** Use bg_light (#faf9f5)
- **Body text on light bg:** Use bg_primary (#141413)
- **Secondary/supporting text:** Use neutral (#b0aea5)

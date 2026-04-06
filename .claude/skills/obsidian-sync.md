# Obsidian Sync Skill

Rules for writing structured markdown files to the Obsidian vault.

## Vault Folder Structure

```
OBSIDIAN_VAULT_PATH/
├── Scripts/          # Reel scripts from pipeline
├── Carousel-Copy/    # Carousel slide decks
├── Ideas/            # Raw concept dumps, brainstorms
├── Brand-Guide/      # Brand assets, CTA templates
│   └── Thumbnails/   # Thumbnail prompt files
└── Analytics/        # Performance tracking notes
```

## File Naming Convention

```
YYYY-MM-DD_[pillar]_[slug].md
```

- `pillar`: lowercase — teach, prove, inspire, sell
- `slug`: 3-5 word kebab-case summary of the content
- Examples:
  - `2026-04-06_teach_claude-sop-briefing.md`
  - `2026-04-06_prove_agency-training-results.md`

## YAML Frontmatter (Required)

Every file must start with this frontmatter block:

```yaml
---
date: YYYY-MM-DD
pillar: teach | prove | inspire | sell
format: reel | carousel | story | idea
status: draft | ready | posted
competitor_source: "@username"  # who was analyzed to inspire this
estimated_views: N              # view count of the source video
config_name: "Config Name"      # pipeline config used
tags:
  - claude
  - training
---
```

## Status Lifecycle

1. **draft** — freshly generated, not yet reviewed
2. **ready** — reviewed and approved for production
3. **posted** — published to Instagram

## Content Body Structure

### For Reel Scripts (Scripts/)
```markdown
## Hook
[Opening line — first 3 seconds]

## Script
[Full script body]

## New Concepts
[Claude-generated adapted concepts]

## CTA
[Call to action for the last 5 seconds]
```

### For Carousels (Carousel-Copy/)
```markdown
## Slides
### Slide 1: Hook
[Bold statement or stat]

### Slide 2-N: Body
[One insight per slide]

### Slide N+1: Summary
[Key takeaway]

### Slide N+2: CTA
[Drive to website/training]

## Thumbnail Prompts
1. [Prompt 1]
2. [Prompt 2]
3. [Prompt 3]
```

## Rules

- Never overwrite existing files — skip if file already exists (idempotent)
- Always use UTF-8 encoding
- No HTML in markdown — pure markdown only
- Keep file sizes under 50KB
- One concept per file — don't combine multiple videos into one note

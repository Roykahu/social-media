# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## What This Is

**@roy_automates Content OS** — an AI-powered content creation system for Instagram. Scrapes competitors' viral Reels, analyzes with Gemini, generates adapted concepts with Claude, builds carousels, produces Remotion video templates, and syncs everything to Obsidian. Built for Roy Kahuthu's Claude training brand targeting African corporates.

---

## How to Run

```bash
cd app
npm install
npm run dev
# Open http://localhost:3000
```

**Required environment variables** (in `.env` at project root — see `.env.example`):
- `APIFY_API_TOKEN` — Apify Instagram scraper
- `GEMINI_API_KEY` — Google Gemini video analysis
- `ANTHROPIC_API_KEY` — Claude concept generation
- `OBSIDIAN_VAULT_PATH` — Absolute path to Obsidian vault (for sync)
- `GOOGLE_AI_STUDIO_API_KEY` — Gemini image generation (thumbnails)
- `TRAINING_CTA_*` — CTA text, website, booking link, offer, urgency

---

## Tech Stack

- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind CSS** + **shadcn/ui** components
- **CSV files** for data storage (in `data/` directory)
- **Apify** — Instagram scraping
- **Google Gemini 2.0 Flash** — Video analysis (upload + multimodal)
- **Claude Sonnet** — New concept generation

---

## How The System Works

### Pipeline Overview

1. **Input** — Select a config and parameters (max videos, top-K, days lookback) via the Run page
2. **Load Config** — Retrieve analysis prompt, new concepts prompt, and creator list from CSV
3. **Scrape** — For each competitor creator, scrape recent Instagram Reels via Apify
4. **Filter & Rank** — Filter by date, sort by views, take top-K most viral
5. **Analyze** — Download video, upload to Gemini, analyze (extracts Concept, Hook, Retention, Reward, Script)
6. **Generate** — Send analysis + brand context to Claude for adapted video concepts
7. **Save** — Append results to `data/videos.csv`, viewable in the Videos page with thumbnails

### Two Customizable Prompts Per Config

- **Analysis Instruction** — How Gemini should break down the video
- **New Concepts Instruction** — How Claude should adapt the reference for the brand
- **Training CTA Fields** — Auto-injected into generated concepts (ctaText, websiteUrl, etc.)

### Carousel Builder
- Input a topic or select from existing video concepts
- Claude generates 8-12 slide structure with image prompts + 3 thumbnail prompts
- Saved to `data/carousels.csv`

### Obsidian Sync
- `python scripts/obsidian_sync.py` exports videos + carousels as .md files to Obsidian vault
- YAML frontmatter with date, pillar, format, status, competitor source

### Remotion Templates
- 4 branded video components in `remotion/`: HookOpener, TipOverlay, CTAOutro, StatHighlight
- Render: `cd remotion && npx remotion render [CompositionId] output.mp4`

### NotebookLM Briefs
- `python scripts/notebooklm_brief.py script.md` converts scripts to production briefs with [VISUAL], [STAT], [MOTION] annotations

### Thumbnail Generation
- `python scripts/thumbnail_gen.py` generates images from carousel thumbnail prompts via Google AI Studio

---

## Workspace Structure

```
.
├── CLAUDE.md                              # This file
├── .env                                   # API keys (not committed)
├── app/                                   # Next.js application
│   ├── src/
│   │   ├── app/                           # Pages and API routes
│   │   │   ├── page.tsx                   # Dashboard (redirects to /videos)
│   │   │   ├── videos/page.tsx            # Videos browser with thumbnails
│   │   │   ├── run/page.tsx               # Pipeline runner with live progress
│   │   │   ├── carousel/page.tsx          # Carousel Builder (NEW)
│   │   │   ├── configs/page.tsx           # Config management + CTA fields
│   │   │   ├── creators/page.tsx          # Creator management
│   │   │   └── api/                       # API routes (configs, creators, videos, pipeline, carousel)
│   │   ├── lib/                           # Core logic
│   │   │   ├── pipeline.ts               # Pipeline orchestration
│   │   │   ├── apify.ts                  # Apify scraper client
│   │   │   ├── gemini.ts                 # Gemini video analysis client
│   │   │   ├── claude.ts                 # Claude concept generation + CTA injection
│   │   │   ├── csv.ts                    # CSV read/write (configs, creators, videos, carousels)
│   │   │   └── types.ts                  # TypeScript interfaces
│   │   └── components/                    # UI components (shadcn + custom)
│   └── package.json
├── remotion/                              # Remotion video templates (separate project)
│   ├── theme.ts                           # Brand colours + typography constants
│   ├── src/
│   │   ├── HookOpener.tsx                 # 3s animated text hook
│   │   ├── TipOverlay.tsx                 # Lower-third tip card
│   │   ├── CTAOutro.tsx                   # 4s branded outro
│   │   └── StatHighlight.tsx              # Animated stat counter
│   └── package.json
├── scripts/                               # Python CLI scripts (run manually)
│   ├── obsidian_sync.py                   # Export to Obsidian vault
│   ├── thumbnail_gen.py                   # Generate images via Google AI Studio
│   └── notebooklm_brief.py               # Convert scripts to production briefs
├── data/                                  # CSV data storage
│   ├── configs.csv                        # Pipeline configs + CTA fields
│   ├── creators.csv                       # Instagram creator accounts
│   ├── videos.csv                         # Analyzed video results
│   └── carousels.csv                      # Generated carousel content
├── context/                               # Background context for Claude
│   └── brand.md                           # Brand guide (colours, tone, pillars)
├── .claude/skills/                        # Claude skill reference files
│   ├── obsidian-sync.md                   # Obsidian writing rules
│   ├── remotion-video-generation.md       # Remotion dev rules
│   ├── kling-3-prompting.md               # Kling prompt rules (deferred)
│   ├── carousel-builder.md                # Carousel structure rules
│   └── brand-voice.md                     # Roy's voice + CTA framework
├── plans/                                 # Implementation plans
├── requirements.txt                       # Python dependencies
├── .env.example                           # Environment variable template
└── .claude/commands/                      # Slash commands (prime, create-plan, implement)
```

---

## App Pages

| Page | Path | Description |
|------|------|-------------|
| Dashboard | `/` | Redirects to Videos |
| Videos | `/videos` | Browse results with thumbnails, expandable analysis & concepts |
| Run Pipeline | `/run` | Select config, set params, run with live progress streaming |
| Carousel | `/carousel` | Generate 8-12 slide carousels with image + thumbnail prompts |
| Creators | `/creators` | CRUD for competitor Instagram accounts |
| Configs | `/configs` | CRUD for pipeline configs (prompts, categories, CTA fields) |

---

## Commands

### /prime
Initialize a new session with full context awareness.

### /create-plan [request]
Create a detailed implementation plan in `plans/`.

### /implement [plan-path]
Execute a plan step by step.

---

## Critical Instruction: Maintain This File

After any change to the workspace, ask:
1. Does this change add new functionality?
2. Does it modify the workspace structure documented above?
3. Should a new command be listed?
4. Does context/ need updates?

If yes, update the relevant sections.

---

## Session Workflow

1. **Start**: Run `/prime` to load context
2. **Work**: Use commands or direct Claude with tasks
3. **Plan changes**: Use `/create-plan` before significant additions
4. **Execute**: Use `/implement` to execute plans
5. **Maintain**: Claude updates CLAUDE.md and context/ as the workspace evolves

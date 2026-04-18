# @roy_automates Instagram Growth System — Implementation Plan

## Context

Roy is a Claude Educator in Nairobi building a complete AI-powered content creation OS for his Instagram account @roy_automates. The existing codebase is a working Next.js 16 app ("Virality System") that scrapes competitor Instagram Reels via Apify, analyzes them with Gemini 2.0 Flash, and generates adapted concepts with Claude. It has 5 pages, CSV-based storage, SSE pipeline streaming, and a polished dark glass-morphism UI.

This plan extends that base with 6 modules: Obsidian sync, carousel builder, Remotion templates, NotebookLM briefs, thumbnail generation, and a CTA injector — plus brand system files and Claude skills.

**Kling Video Polish (Module 3) is DEFERRED** — Roy will add it later when he has the API key.

---

## PHASE 0: Codebase Audit (COMPLETE)

**Existing assets:**
- 5 pages: Videos (`/videos`), Run Pipeline (`/run`), Creators (`/creators`), Configs (`/configs`), Dashboard (`/` → redirects)
- API routes: CRUD for configs/creators/videos + pipeline SSE + image proxy
- Lib: `pipeline.ts`, `apify.ts`, `gemini.ts`, `claude.ts`, `csv.ts`, `types.ts`
- Components: `app-sidebar.tsx` (4 nav items), `top-bar.tsx`, `markdown-content.tsx` + shadcn/ui
- Data: `configs.csv` (3 rows), `creators.csv` (12 rows), `videos.csv` (~4,494 rows)
- Scripts: `build-presentation.py`, `tiktok-ai-trends.mjs`
- APIs: APIFY_API_TOKEN, GEMINI_API_KEY, ANTHROPIC_API_KEY

**No conflicts found.** All modules are additive. Existing pipeline stays intact.

---

## PHASE 1: Brand System | Complexity: LOW

Create brand constants and 5 Claude skill reference files.

### Files to create (7 new)
| File | Purpose |
|------|---------|
| `remotion/theme.ts` | TS constants: `bg_primary: "#141413"`, `bg_light: "#faf9f5"`, `neutral: "#b0aea5"`, `accent_roy: "#C9502C"`, `highlight: "#E8A838"` + typography rules |
| `context/brand.md` | Human-readable brand guide: colors, tone (direct, Nairobi-rooted, premium), pillars (TEACH 3x, PROVE 1x, INSPIRE 1x, SELL 1x), audience (African corporates + agencies) |
| `.claude/skills/obsidian-sync.md` | Rules for writing .md to vault — YAML frontmatter format, folder conventions, status lifecycle |
| `.claude/skills/remotion-video-generation.md` | Remotion dev rules: `useCurrentFrame()`, `interpolate()`, deterministic-only, brand theme import |
| `.claude/skills/kling-3-prompting.md` | Kling prompt structure: scene/camera/lighting/mood/subject, editorial color grading (kept for future use) |
| `.claude/skills/carousel-builder.md` | 8-12 slide structure, hook formulas, CTA patterns, Nano Banana prompt format |
| `.claude/skills/brand-voice.md` | Roy's voice, pillar rotation schedule, CTA templates, color usage rules |

### Verification
- Manual review of all files

---

## PHASE 2: .env Scaffold + Training CTA Config | Complexity: LOW-MEDIUM

### Files to create (1 new)
| File | Purpose |
|------|---------|
| `.env.example` | Scaffold with all env vars (existing 3 + new: OBSIDIAN_VAULT_PATH, GOOGLE_AI_STUDIO_API_KEY, TRAINING_CTA_TEXT/WEBSITE_URL/BOOKING_LINK/CURRENT_OFFER/URGENCY_LINE). Kling keys commented out as deferred. |

### Files to modify (5 existing)
| File | Change |
|------|--------|
| [types.ts](app/src/lib/types.ts) | Add 5 optional CTA fields to `Config`: `ctaText?`, `websiteUrl?`, `currentOfferName?`, `bookingLink?`, `urgencyLine?` |
| [csv.ts](app/src/lib/csv.ts#L31) | Add 5 CTA columns to `CONFIG_COLUMNS` array at line 31. `relax_column_count: true` handles backward compat with old CSV rows |
| [configs/page.tsx](app/src/app/configs/page.tsx#L19) | Extend `emptyConfig` with 5 new fields. Add collapsible "Training CTA" section below "New Concepts Instruction" textarea. Update `openEdit` at line 50 to populate CTA fields |
| [api/configs/route.ts](app/src/app/api/configs/route.ts#L14) | Add 5 CTA fields to `newConfig` construction in POST handler. PUT already uses spread so it works automatically |
| [claude.ts](app/src/lib/claude.ts) | Add optional `ctaContext` param to `generateNewConcepts()`. When present, append `# CTA REQUIREMENTS` section to the prompt |
| [pipeline.ts](app/src/lib/pipeline.ts#L189) | Pass config CTA fields through to `generateNewConcepts()` call |

### Verification
- `npm run dev` → Configs page → create config with CTA fields → reload → verify persistence

---

## PHASE 3: Obsidian Sync | Complexity: MEDIUM

### Files to create (1 new)
| File | Purpose |
|------|---------|
| `scripts/obsidian_sync.py` | Reads `data/videos.csv`, writes .md files to `OBSIDIAN_VAULT_PATH` with YAML frontmatter (date, pillar, format, status:draft, competitor_source, estimated_views). Creates vault folders: `/Scripts`, `/Carousel-Copy`, `/Ideas`, `/Brand-Guide`, `/Analytics`. Idempotent (skips existing files). |

**File naming:** `YYYY-MM-DD_[configName-slug]_[creator]_[id-8chars].md`

**Execution:** Manual — `python scripts/obsidian_sync.py`

### Dependencies (pip)
- `python-dotenv`

### Verification
- Set `OBSIDIAN_VAULT_PATH` in .env → run script → verify .md files appear with correct frontmatter

---

## PHASE 4: Carousel Builder + Thumbnail Prompts | Complexity: HIGH

### Files to create (3 new)
| File | Purpose |
|------|---------|
| [carousel/page.tsx](app/src/app/carousel/page.tsx) | New page: topic input OR select from existing video concepts, pillar dropdown (TEACH/PROVE/INSPIRE/SELL), generates 8-12 slides via Claude. Shows slide preview cards + thumbnail prompts with copy buttons. Lists previous carousels. |
| [api/carousel/route.ts](app/src/app/api/carousel/route.ts) | GET: return all carousels. POST: accept `{topic, pillar, sourceVideoId?}`, call Claude with brand guide + carousel skill rules, return structured carousel JSON. Save to `data/carousels.csv` |
| `scripts/thumbnail_gen.py` | Reads thumbnail prompts from carousels.csv, calls Google AI Studio API (GOOGLE_AI_STUDIO_API_KEY already available) to generate images, saves to `data/thumbnails/` |

### Files to modify (3 existing)
| File | Change |
|------|--------|
| [types.ts](app/src/lib/types.ts) | Add `CarouselSlide` and `Carousel` interfaces (slides + thumbnailPrompts stored as JSON strings in CSV) |
| [csv.ts](app/src/lib/csv.ts) | Add `CAROUSEL_COLUMNS`, `readCarousels()`, `writeCarousels()`, `appendCarousel()` — same pattern as video functions |
| [app-sidebar.tsx](app/src/components/app-sidebar.tsx#L19) | Add `{ title: "Carousel", href: "/carousel", icon: LayoutGrid }` to `navItems` array |

### Also update
- `scripts/obsidian_sync.py` — add carousel sync to `/Carousel-Copy` folder

### Dependencies (pip, for thumbnail_gen.py)
- `google-generativeai`

### Verification
- Open Carousel Builder → enter topic → generate → verify slides render → check carousels.csv → copy thumbnail prompt

---

## ~~PHASE 5: Kling Video Polish~~ — DEFERRED

Skipped for now. Roy will add the Kling module later when he has the API key. The `.claude/skills/kling-3-prompting.md` skill file is still created in Phase 1 for future reference.

---

## PHASE 5: Remotion Template System | Complexity: HIGH

### Files to create (7 new)
| File | Purpose |
|------|---------|
| `remotion/package.json` | Separate project: `@remotion/cli`, `@remotion/core`, `@remotion/bundler`, react 19, typescript 5 |
| `remotion/tsconfig.json` | TypeScript config for Remotion |
| `remotion/remotion.config.ts` | Standard Remotion config |
| `remotion/src/Root.tsx` | Registers 4 compositions with fps/width/height/duration |
| `remotion/src/HookOpener.tsx` | 3s (90 frames @30fps) animated text hook — scale up, fade in, accent underline slide. Props: `{hookText}` |
| `remotion/src/TipOverlay.tsx` | Lower-third tip card — slides up, accent border glow. Props: `{tipText, icon?}` |
| `remotion/src/CTAOutro.tsx` | 4s (120 frames) branded outro — logo fade, URL slide up. Props: `{ctaText, websiteUrl}` |
| `remotion/src/StatHighlight.tsx` | Animated number count-up + label fade in. Props: `{stat, label}` |

All components import from `./theme.ts` (created in Phase 1). All use `useCurrentFrame()` + `interpolate()` only — zero `Math.random()`, zero `Date.now()`.

### Dependencies (npm, in remotion/)
- `@remotion/cli` ^4, `@remotion/core` ^4, `@remotion/bundler` ^4
- `react` ^19, `react-dom` ^19, `typescript` ^5

### Verification
- `cd remotion && npm install && npx remotion preview` → all 4 compositions render in Remotion Studio

---

## PHASE 6: NotebookLM Brief Generator | Complexity: MEDIUM

### Files to create (1 new)
| File | Purpose |
|------|---------|
| `scripts/notebooklm_brief.py` | Input: path to long-form script .md. Calls Claude API to restructure with section headers, `[VISUAL: ...]`, `[STAT: ...]`, `[MOTION: ...]` annotations + 3 visual scene concepts per section. Saves to Obsidian vault. |

### Dependencies (pip)
- `anthropic`

### Verification
- `python scripts/notebooklm_brief.py path/to/script.md` → verify structured output with annotations

---

## PHASE 7: End-to-End Integration Test | Complexity: MEDIUM

### Steps
1. Add target creators to `data/creators.csv`: wright_mode, chase.h.ai, nyandia_gachago, tapewarp.ai, kylewhitrow + roy_automates (self-track)
2. Create Roy's config in `data/configs.csv` with content pillars, analysis/concepts prompts, and CTA fields
3. Run pipeline on wright_mode via Run page
4. Generate 1 carousel from a resulting concept via Carousel Builder
5. Run `python scripts/obsidian_sync.py` → verify vault files
6. Run `python scripts/notebooklm_brief.py` on a generated script → verify brief
7. Run `python scripts/thumbnail_gen.py` → verify image generation

### Files to modify (2 data files)
- `data/creators.csv` — append 6 new creators
- `data/configs.csv` — append Roy's config

---

## Dependency Summary

### pip (create `requirements.txt` at project root)
```
python-dotenv
anthropic
google-generativeai
requests
```

### npm (in `app/`) — No new packages needed
### npm (in `remotion/`) — @remotion/cli, @remotion/core, @remotion/bundler, react, react-dom, typescript

---

## Sidebar Navigation (Final State)
```
Videos          → /videos         (Film icon)
Run Pipeline    → /run            (Play icon)
Carousel        → /carousel       (LayoutGrid icon)      ← NEW
Creators        → /creators       (Users icon)
Configs         → /configs        (Settings2 icon)
```

---

## CLAUDE.md Updates Required After Implementation
- Add Modules to "How The System Works" section
- Add new pages to "App Pages" table
- Add new env vars to documentation
- Add new scripts to workspace structure
- Add Remotion folder to workspace structure
- Add skills to .claude/ documentation

# Session Handoff — @roy_automates Content OS

**Session date:** 2026-04-17 (continued 2026-04-18)
**Read this first to get full context for the next session.**

---

## TL;DR

Roy's @roy_automates Instagram content OS is **fully built, tested end-to-end, deployed to production**. The AI backend was swapped from Gemini+Claude to OpenAI mid-session. 13 new creators added under the `roy-automates` category. 6 videos analyzed successfully in the live test.

- **Repo:** https://github.com/Roykahu/social-media (commit `0476028`)
- **Production:** https://app-nine-bice-19.vercel.app
- **Local:** `c:\Users\ROY\Downloads\social-media-main\social-media-main\`
- **Vercel team scope:** `roys-projects-3c5446a1`

---

## What was built (8 phases)

The original session planned 8 phases. All shipped except Phase 5 (Kling video polish — deferred). See [`SESSION_2026-04-17_PLAN.md`](./SESSION_2026-04-17_PLAN.md) for the original plan.

| Phase | Module | Status |
|-------|--------|--------|
| 1 | Brand system (`remotion/theme.ts` + `context/brand.md` + 5 skills) | ✅ Done |
| 2 | CTA config fields (Config type + Configs page UI + claude.ts→openai.ts CTA injection) | ✅ Done |
| 3 | Obsidian sync (`scripts/obsidian_sync.py`) | ✅ Done |
| 4 | Carousel Builder page + API + thumbnail_gen.py | ✅ Done |
| 5 | ~~Kling video polish~~ | ⏸️ Deferred (no API key yet) |
| 6 | Remotion templates (4 components: HookOpener, TipOverlay, CTAOutro, StatHighlight) | ✅ Done |
| 7 | NotebookLM brief generator (`scripts/notebooklm_brief.py`) | ✅ Done |
| 8 | E2E pipeline test on roy-automates creators | ✅ Done — 6 videos analyzed |
| Bonus | OpenAI swap (replaced Gemini + Claude) | ✅ Done |
| Bonus | GitHub repo + Vercel deploy + env vars pushed | ✅ Done |

---

## Current AI backend — IMPORTANT

**Gemini and Claude SDKs are no longer used in the pipeline.** Roy switched to OpenAI mid-session ("for now") because he had an OpenAI key but no Gemini/Anthropic credits.

| Was | Now |
|-----|-----|
| Gemini 2.0 Flash (multimodal video upload + analysis) | GPT-4o Vision on the Reel **thumbnail** (no video upload) |
| Claude Sonnet 4.5 for concept generation | GPT-4o for concept generation |
| Claude Sonnet 4.5 for carousel generation | GPT-4o JSON mode for carousel generation |

**Active client:** `app/src/lib/openai.ts`
**Unused (kept for reference):** `app/src/lib/gemini.ts`, `app/src/lib/claude.ts`

If Roy wants to revert to Gemini+Claude, edit `app/src/lib/pipeline.ts` imports and the `app/src/app/api/carousel/route.ts` to swap back. The function signatures are intentionally compatible.

**Quality note:** GPT-4o vision can only see the thumbnail (first frame) of each Reel, not the full video. Apify also returns `caption` and `hashtags` which we pass as text context. Analysis is therefore lower-fidelity than the original Gemini Files API approach. If quality drops in Roy's content output, re-add Gemini.

---

## How to resume in next session

### 1. Quick orient
Read these in order:
1. This file (you're here)
2. [`CLAUDE.md`](../CLAUDE.md) at project root — workspace doc
3. [`context/brand.md`](../context/brand.md) — brand voice/colours/pillars
4. [`SESSION_2026-04-17_PLAN.md`](./SESSION_2026-04-17_PLAN.md) — original 8-phase plan

### 2. Start the dev server
**From PowerShell (recommended):**
```powershell
cd app
npm run dev
```

**From bash (Windows shell quirk — `next` not in PATH):**
```bash
cd 'c:/Users/ROY/Downloads/social-media-main/social-media-main/app'
node node_modules/next/dist/bin/next dev
```

App opens at http://localhost:3000.

### 3. Test the pipeline
Use the existing test script:
```bash
bash /c/tmp/test_pipeline.sh
```
Or POST to `http://localhost:3000/api/pipeline` with:
```json
{"configName":"Roy Automates - AI Training","maxVideos":5,"topK":1,"nDays":30}
```

---

## Key files you'll touch

### App code (`app/src/`)
- `lib/openai.ts` — **all AI calls go through here** (vision + text + carousel JSON)
- `lib/pipeline.ts` — orchestration: scrape → analyze → generate concepts → save
- `lib/apify.ts` — Instagram scraper (added `caption` + `hashtags` to ApifyReel)
- `lib/csv.ts` — read/write configs.csv, creators.csv, videos.csv, carousels.csv
- `lib/types.ts` — Config (with 5 CTA fields), Creator, Video, Carousel, CarouselSlide
- `app/configs/page.tsx` — Configs CRUD UI with collapsible "Training CTA Settings" section
- `app/carousel/page.tsx` — Carousel Builder UI
- `app/api/carousel/route.ts` — Carousel generation endpoint (uses OpenAI JSON mode)
- `components/app-sidebar.tsx` — nav (Videos, Run, **Carousel**, Creators, Configs)

### Brand system
- `remotion/theme.ts` — colour + typography constants (single source of truth)
- `context/brand.md` — human-readable brand guide for Claude context

### Skills (`.claude/skills/`)
Five skill files I created — Claude reads these for project-specific rules:
1. `brand-voice.md` — Roy's voice + content pillars (TEACH 3x, PROVE 1x, INSPIRE 1x, SELL 1x) + CTA framework
2. `carousel-builder.md` — 8-12 slide structure, hook formulas, image prompt format
3. `obsidian-sync.md` — vault folder structure, YAML frontmatter rules
4. `remotion-video-generation.md` — `useCurrentFrame()` + `interpolate()` rules, deterministic-only
5. `kling-3-prompting.md` — Kept for future Kling integration (deferred)

### Python scripts (`scripts/`)
- `obsidian_sync.py` — exports videos + carousels as `.md` to `OBSIDIAN_VAULT_PATH`
- `thumbnail_gen.py` — Google AI Studio Imagen for carousel thumbnails
- `notebooklm_brief.py` — converts long scripts to production briefs with `[VISUAL]`/`[STAT]`/`[MOTION]` annotations

### Remotion (`remotion/src/`)
4 branded video components, all deterministic (`useCurrentFrame()` + `interpolate()`):
- `HookOpener.tsx` — 3s text hook with scale + accent underline
- `TipOverlay.tsx` — lower-third tip card
- `CTAOutro.tsx` — 4s branded outro
- `StatHighlight.tsx` — animated stat counter

Run: `cd remotion && npm install && npx remotion preview`

---

## Data state

### `data/configs.csv` (4 rows, 10 columns)
Header now includes 5 CTA columns: `ctaText, websiteUrl, currentOfferName, bookingLink, urgencyLine`.
Existing 3 rows have empty CTA fields. **New: `Roy Automates - AI Training`** with full CTA filled in.

### `data/creators.csv` (27 rows)
Existing 13 + **13 new under `roy-automates` category**:
wright_mode, imjonathanacuna, hisanxai, brodyautomates, joshualarosa.ai, liamjohnston.ai, droppablestudio, thomas.lentine, lisaworldverse, itstylergermain, wassimyounes_, hooked._.exe, v.i.s.h.ai

### `data/videos.csv` (4,500 rows)
Original ~4,494 + 6 new from the E2E test (all from roy-automates category, all OpenAI-analyzed with CTA injected).

### `data/carousels.csv`
Empty — Carousel Builder UI works but no carousels generated yet.

---

## Environment variables

Local `.env` and Vercel env both have:

| Key | Status |
|-----|--------|
| `APIFY_API_TOKEN` | ✅ Set (Roy's token) |
| `OPENAI_API_KEY` | ✅ Set (replaces both Gemini and Anthropic) |
| `GOOGLE_AI_STUDIO_API_KEY` | ✅ Set (for thumbnail generation only) |
| `OBSIDIAN_VAULT_PATH` | ✅ `C:/Users/ROY/Documents` |
| `TRAINING_CTA_TEXT/WEBSITE_URL/BOOKING_LINK/CURRENT_OFFER/URGENCY_LINE` | ✅ Set |
| `GEMINI_API_KEY`, `ANTHROPIC_API_KEY` | Empty (legacy, unused) |

**Vercel:** All keys live in Production + Preview + Development environments.
**Pull from Vercel:** `cd app && vercel env pull ../.env --token <TOKEN> --scope roys-projects-3c5446a1`. ⚠️ This OVERWRITES local `.env` — back it up first.

---

## Quirks and gotchas (don't trip on these)

### 1. Apify free tier memory cap
8192MB total across all concurrent Actor runs. When at cap, requests fail with HTTP 402 `actor-memory-limit-exceeded`. In the E2E test, 5 of 13 creators failed for this reason. Either wait, upgrade, or run the pipeline with fewer creators at a time. **Not a code bug.**

### 2. Instagram CDN URLs need browser headers
`scontent-*.cdninstagram.com/*` returns 400/403 to clients without `User-Agent: Chrome/...` and `Referer: https://www.instagram.com/`. The `openai.ts` `fetchAsDataUrl()` helper handles this — downloads the image with browser headers, base64-encodes it, and sends as a data URL to OpenAI. **If you add new image-fetching code, use this helper.**

### 3. Windows bash shell can't find `next`
`npm run dev` in bash fails because `node_modules/.bin/next` isn't created on Windows. Workarounds:
- Use PowerShell for `npm run dev` (recommended)
- Or invoke directly: `node node_modules/next/dist/bin/next dev`

### 4. Project git repo
The git repo lives at `c:/Users/ROY/Downloads/social-media-main/social-media-main/.git/` — created from scratch in this session. Earlier the project was tracked under `c:/Users/ROY/.git` (the entire home folder), which is unrelated.

### 5. Restart dev server after `.env` changes
Next.js reads env vars at startup. After editing `.env`, kill and restart the dev server.

### 6. Vercel team scope required
Roy's Vercel CLI commands need `--scope roys-projects-3c5446a1` because his account has no default scope set.

---

## Outstanding items / next session candidates

### High-value next moves
1. **Test the Carousel Builder end-to-end** — UI works (page renders, API responds), but no carousels generated yet. Open `/carousel`, enter a topic, click Generate, verify slides render and `data/carousels.csv` is written.
2. **Re-run pipeline on the 5 failed creators** once Apify memory frees up. Or upgrade Apify plan.
3. **Add Playwright MCP testing** — Roy installed `@playwright/mcp` but it requires Claude Code restart to activate. Use it for visual UI testing of the Carousel Builder, Run page, etc.
4. **Run the Obsidian sync** — `python scripts/obsidian_sync.py` to export the 6 new videos to `C:/Users/ROY/Documents` as `.md` files.
5. **Generate thumbnails for any carousel** — `python scripts/thumbnail_gen.py` (uses GOOGLE_AI_STUDIO_API_KEY which IS set).

### Medium priority
6. **Update `gemini.ts` / `claude.ts`** — either delete them (they're unused) or keep for future revert. Currently they live alongside `openai.ts`.
7. **Build out Phase 5 Kling Video Polish** when Roy gets the Kling API key. The skill file exists at `.claude/skills/kling-3-prompting.md`.
8. **Add a `Carousels` browse page** — currently the Carousel Builder shows previously generated ones inline, but there's no dedicated browse page like `/videos`.
9. **Add server-side env var validation** — currently failures only surface at request time (e.g. "OPENAI_API_KEY not set"). A startup check would be friendlier.

### Low priority / nice-to-have
10. **Remove duplicate package-lock.json warning** — Next.js detects two lockfiles (`c:/Users/ROY/package-lock.json` and the project's). Set `turbopack.root` in `next.config.ts` to silence.
11. **Add caption/hashtag enrichment to existing videos.csv** — old rows lack the new caption field; could backfill via Apify.
12. **Rotate exposed credentials** — Roy shared the Vercel token in chat earlier; recommend rotating at https://vercel.com/account/tokens.

---

## What I learned that's worth keeping

1. **OpenAI vision works on Instagram thumbnails when you proxy the fetch.** Direct URLs fail; base64 data URLs work.
2. **Apify Instagram scraper returns `caption` and `hashtags`** — original `ApifyReel` interface didn't declare them but they're in the JSON. Now declared.
3. **Vercel CLI requires `--scope` in non-interactive mode** for accounts with multiple teams (or no default).
4. **CSV column expansion is safe** with `csv-parse`'s `relax_column_count: true` — old rows still parse, new columns just appear as `undefined`.
5. **The Configs page form already used `...spread` on PUT** so adding new fields just required updating `emptyConfig`, the `openEdit` populator, and the form JSX. The API route's PUT didn't need changes.

---

## Skills I'd recommend the next session use

Browse the available skills via the system reminder, but these may be helpful:

- **`update-config`** — if you need to add hooks or change Claude Code permissions for this project
- **`claude-api`** — if extending OpenAI calls (it has prompt caching guidance and migration help). Ironically named for Claude but has general LLM API patterns
- **`firecrawl:firecrawl`** — if scraping additional public content (e.g. competitor websites, training landing pages) outside of Apify
- **`gsd:*` family** — if Roy wants to formalize this into a phased GSD workflow with verification gates
- **The 5 brand skills I created in `.claude/skills/`** — these auto-load when relevant work matches their description

---

## File map (quick reference)

```
c:/Users/ROY/Downloads/social-media-main/social-media-main/
├── CLAUDE.md                          # Workspace doc (start here)
├── .env                               # API keys (NOT in git)
├── .env.example                       # Template
├── requirements.txt                   # Python deps
├── .planning/
│   ├── SESSION_2026-04-17_HANDOFF.md  # This file
│   └── SESSION_2026-04-17_PLAN.md     # Original 8-phase plan
├── .claude/
│   ├── commands/  (prime, create-plan, implement)
│   └── skills/    (brand-voice, carousel-builder, obsidian-sync, remotion-video-generation, kling-3-prompting)
├── context/
│   ├── brand.md                       # ⭐ Brand bible
│   ├── business-info.md
│   ├── current-data.md
│   ├── personal-info.md
│   └── strategy.md
├── data/
│   ├── configs.csv     (4 rows, 10 cols, includes Roy Automates)
│   ├── creators.csv    (27 rows, 13 in roy-automates category)
│   ├── videos.csv      (~4,500 rows incl. 6 new from E2E test)
│   └── carousels.csv   (empty)
├── app/                               # Next.js 16 + TypeScript
│   ├── src/app/
│   │   ├── page.tsx                   # Redirects to /videos
│   │   ├── videos/page.tsx
│   │   ├── run/page.tsx
│   │   ├── carousel/page.tsx          # NEW
│   │   ├── creators/page.tsx
│   │   ├── configs/page.tsx           # Updated with CTA section
│   │   └── api/
│   │       ├── configs/route.ts       # Updated with CTA fields
│   │       ├── creators/route.ts
│   │       ├── creators/refresh/route.ts
│   │       ├── videos/route.ts
│   │       ├── pipeline/route.ts
│   │       ├── proxy-image/route.ts
│   │       └── carousel/route.ts      # NEW (uses OpenAI)
│   ├── src/lib/
│   │   ├── openai.ts                  # ⭐ Active AI client (NEW)
│   │   ├── claude.ts                  # Unused (legacy)
│   │   ├── gemini.ts                  # Unused (legacy)
│   │   ├── apify.ts                   # Updated with caption/hashtags
│   │   ├── pipeline.ts                # Updated to use OpenAI
│   │   ├── csv.ts                     # Updated with carousels + CTA cols
│   │   ├── types.ts                   # Updated with Carousel + CTA fields
│   │   └── utils.ts
│   └── src/components/
│       ├── app-sidebar.tsx            # Updated with Carousel nav
│       ├── top-bar.tsx
│       └── markdown-content.tsx
├── remotion/                          # Separate project, own package.json
│   ├── theme.ts                       # ⭐ Brand constants
│   ├── package.json
│   ├── tsconfig.json
│   └── src/  (Root, HookOpener, TipOverlay, CTAOutro, StatHighlight)
└── scripts/
    ├── obsidian_sync.py
    ├── thumbnail_gen.py
    ├── notebooklm_brief.py
    ├── build-presentation.py          # Pre-existing
    ├── build-html-presentation.py     # Pre-existing
    └── tiktok-ai-trends.mjs           # Pre-existing
```

import { NextResponse } from "next/server";
import { v4 as uuid } from "uuid";
import Anthropic from "@anthropic-ai/sdk";
import { readCarousels, appendCarousel } from "@/lib/csv";
import type { Carousel } from "@/lib/types";

const BRAND_CONTEXT = `You are generating content for @roy_automates (Roy Kahuthu), a Claude Educator in Nairobi, Kenya.
Brand voice: direct, confident, no fluff. Nairobi-rooted but globally credible. Premium but approachable.
Audience: Corporate L&D managers, CTOs, and digital agency founders in Africa.
Colours: bg #141413 (near-black), accent #C9502C (terracotta for CTAs), highlight #E8A838 (amber for stats/hooks).`;

export async function GET() {
  const carousels = readCarousels();
  return NextResponse.json(carousels);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { topic, pillar, sourceVideoId, ctaText, websiteUrl } = body;

  if (!topic) {
    return NextResponse.json({ error: "topic is required" }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not set" }, { status: 500 });
  }

  const client = new Anthropic({ apiKey });

  const ctaInfo = ctaText
    ? `\nCTA details: "${ctaText}" → ${websiteUrl || "link in bio"}`
    : "";

  const message = await client.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: `${BRAND_CONTEXT}

# TASK
Generate an Instagram carousel (8-12 slides) on this topic:
"${topic}"

Content pillar: ${pillar || "TEACH"}
${ctaInfo}

# OUTPUT FORMAT
Return ONLY valid JSON with this exact structure (no markdown, no code fences):
{
  "slides": [
    {
      "slideNumber": 1,
      "type": "hook",
      "headline": "Bold hook text (max 12 words)",
      "body": "",
      "imagePrompt": "Nano Banana image prompt for this slide..."
    },
    {
      "slideNumber": 2,
      "type": "body",
      "headline": "Insight headline",
      "body": "Supporting detail (max 30 words)",
      "imagePrompt": "Nano Banana image prompt..."
    }
  ],
  "thumbnailPrompts": [
    "Text-forward thumbnail: ...",
    "Subject-forward thumbnail: ...",
    "Data-forward thumbnail: ..."
  ]
}

# RULES
- Slide 1 must be type "hook" with a scroll-stopping headline (bold stat, contrarian take, or question)
- Slides 2-N must be type "body" with one insight each, max 30 words body text
- Second-to-last slide must be type "summary" with a save-worthy key takeaway
- Last slide must be type "cta" driving to training/website
- Generate 8-12 slides total
- Each imagePrompt should describe a dark editorial visual (#141413 bg) with clean sans-serif typography and brand accent colours (#C9502C terracotta, #E8A838 amber)
- Generate exactly 3 thumbnailPrompts: text-forward, subject-forward, data-forward
- All text in Roy's voice: direct, confident, speaks to corporate ROI`,
      },
    ],
  });

  const block = message.content[0];
  const rawText = block.type === "text" ? block.text : "";

  // Parse JSON from Claude response — handle potential markdown wrapping
  let parsed;
  try {
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    parsed = JSON.parse(jsonMatch ? jsonMatch[0] : rawText);
  } catch {
    return NextResponse.json(
      { error: "Failed to parse carousel JSON from Claude", raw: rawText },
      { status: 500 }
    );
  }

  const carousel: Carousel = {
    id: uuid(),
    topic,
    pillar: pillar || "TEACH",
    sourceVideoId: sourceVideoId || "",
    slides: JSON.stringify(parsed.slides || []),
    thumbnailPrompts: JSON.stringify(parsed.thumbnailPrompts || []),
    dateCreated: new Date().toISOString().slice(0, 10),
  };

  appendCarousel(carousel);

  return NextResponse.json({
    ...carousel,
    slides: parsed.slides,
    thumbnailPrompts: parsed.thumbnailPrompts,
  }, { status: 201 });
}

import { NextResponse } from "next/server";
import { v4 as uuid } from "uuid";
import { readCarousels, appendCarousel } from "@/lib/csv";
import { generateCarousel } from "@/lib/openai";
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

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "OPENAI_API_KEY not set" }, { status: 500 });
  }

  const ctaInfo = ctaText
    ? `\nCTA details: "${ctaText}" → ${websiteUrl || "link in bio"}`
    : "";

  let parsed: { slides: unknown[]; thumbnailPrompts: string[] };
  try {
    parsed = await generateCarousel(topic, pillar || "TEACH", BRAND_CONTEXT, ctaInfo);
  } catch (err) {
    return NextResponse.json(
      { error: `OpenAI generation failed: ${err instanceof Error ? err.message : err}` },
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

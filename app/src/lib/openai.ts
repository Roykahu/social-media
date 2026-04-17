import OpenAI from "openai";

export interface ReelContext {
  thumbnailUrl: string;
  creator: string;
  views: number;
  likes: number;
  comments: number;
  caption?: string;
  hashtags?: string[];
  postUrl: string;
}

export interface CtaContext {
  ctaText?: string;
  websiteUrl?: string;
  currentOfferName?: string;
  bookingLink?: string;
  urgencyLine?: string;
}

const VISION_MODEL = "gpt-4o";
const TEXT_MODEL = "gpt-4o";

function getClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY not set");
  return new OpenAI({ apiKey });
}

/**
 * Fetch an image from Instagram's CDN with browser-like headers,
 * then return it as a base64 data URL that OpenAI can consume directly.
 * Instagram returns 403/400 to clients that don't look like browsers.
 */
async function fetchAsDataUrl(imageUrl: string): Promise<string> {
  const response = await fetch(imageUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      Referer: "https://www.instagram.com/",
    },
  });
  if (!response.ok) {
    throw new Error(`Image download failed: ${response.status} ${response.statusText}`);
  }
  const contentType = response.headers.get("content-type") || "image/jpeg";
  const buffer = Buffer.from(await response.arrayBuffer());
  return `data:${contentType};base64,${buffer.toString("base64")}`;
}

/**
 * Analyze an Instagram Reel using its thumbnail + post metadata.
 * Replaces the previous Gemini-based video analysis.
 *
 * Note: OpenAI doesn't accept full video files like Gemini Files API.
 * We send the thumbnail (which is the first frame for most Reels) plus
 * caption + engagement metadata as context.
 */
export async function analyzeReel(
  reel: ReelContext,
  analysisPrompt: string
): Promise<string> {
  const client = getClient();

  const metadataBlock = [
    `Creator: @${reel.creator}`,
    `Views: ${reel.views.toLocaleString()}`,
    `Likes: ${reel.likes.toLocaleString()}`,
    `Comments: ${reel.comments.toLocaleString()}`,
    reel.caption ? `Caption: ${reel.caption}` : "",
    reel.hashtags && reel.hashtags.length > 0
      ? `Hashtags: ${reel.hashtags.map((h) => `#${h}`).join(" ")}`
      : "",
    `Post URL: ${reel.postUrl}`,
  ].filter(Boolean).join("\n");

  const userText = `# CONTEXT
You are analyzing a viral Instagram Reel. The image is the cover/first-frame thumbnail of the Reel.

${metadataBlock}

# YOUR ANALYSIS INSTRUCTION
${analysisPrompt}

Begin your analysis below. Output structured markdown.`;

  // Download the thumbnail with browser headers (Instagram CDN blocks bots),
  // then send to OpenAI as base64 — avoids the 400 errors when OpenAI tries to
  // fetch the URL itself.
  let imageDataUrl: string;
  try {
    imageDataUrl = await fetchAsDataUrl(reel.thumbnailUrl);
  } catch (err) {
    // Fall back to text-only analysis if the image is unreachable
    console.warn(`Thumbnail fetch failed for @${reel.creator}, falling back to text-only:`, err);
    const fallback = await client.chat.completions.create({
      model: TEXT_MODEL,
      max_tokens: 2048,
      messages: [{ role: "user", content: userText + "\n\n(Note: thumbnail image was unavailable; analyze from metadata only.)" }],
    });
    const text = fallback.choices[0]?.message?.content || "";
    const i = text.indexOf("#");
    return i >= 0 ? text.slice(i) : text;
  }

  const response = await client.chat.completions.create({
    model: VISION_MODEL,
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: userText },
          {
            type: "image_url",
            image_url: {
              url: imageDataUrl,
              detail: "high",
            },
          },
        ],
      },
    ],
  });

  const content = response.choices[0]?.message?.content || "";
  // Strip leading prose before first markdown header (matches existing Gemini behavior)
  const idx = content.indexOf("#");
  return idx >= 0 ? content.slice(idx) : content;
}

/**
 * Generate adapted video concepts from an analysis using OpenAI.
 * Replaces the previous Claude-based concept generation.
 */
export async function generateNewConcepts(
  videoAnalysis: string,
  newConceptsPrompt: string,
  ctaContext?: CtaContext
): Promise<string> {
  const client = getClient();

  let ctaSection = "";
  if (ctaContext && ctaContext.ctaText) {
    ctaSection = `

# CTA REQUIREMENTS
Every generated concept MUST end with a contextually-matched call-to-action in the final 5 seconds.
The CTA must feel native to the script topic, not pasted on.

Use these CTA details:
- CTA text: ${ctaContext.ctaText}
- Website: ${ctaContext.websiteUrl || ""}
- Current offer: ${ctaContext.currentOfferName || ""}
- Booking link: ${ctaContext.bookingLink || ""}
- Urgency: ${ctaContext.urgencyLine || ""}

Adapt the CTA language to match each concept's topic naturally.`;
  }

  const response = await client.chat.completions.create({
    model: TEXT_MODEL,
    max_tokens: 4096,
    messages: [
      {
        role: "system",
        content: "You're an expert in creating viral Reels on Instagram.",
      },
      {
        role: "user",
        content: `# OBJECTIVE
Take as input viral video analysis from a competitor and based on it generate new concepts. Adapt this reference for the brand.

# REFERENCE VIDEO ANALYSIS
------
${videoAnalysis}
------

# INSTRUCTIONS FOR NEW CONCEPTS
------
${newConceptsPrompt}
------
${ctaSection}

# BEGIN YOUR WORK`,
      },
    ],
  });

  return response.choices[0]?.message?.content || "";
}

/**
 * Generate a structured Instagram carousel.
 * Returns parsed JSON object with slides + thumbnailPrompts arrays.
 */
export async function generateCarousel(
  topic: string,
  pillar: string,
  brandContext: string,
  ctaInfo: string
): Promise<{ slides: unknown[]; thumbnailPrompts: string[] }> {
  const client = getClient();

  const response = await client.chat.completions.create({
    model: TEXT_MODEL,
    max_tokens: 4096,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: brandContext,
      },
      {
        role: "user",
        content: `Generate an Instagram carousel (8-12 slides) on this topic:
"${topic}"

Content pillar: ${pillar}
${ctaInfo}

# OUTPUT FORMAT (JSON only)
{
  "slides": [
    {
      "slideNumber": 1,
      "type": "hook",
      "headline": "Bold hook text (max 12 words)",
      "body": "",
      "imagePrompt": "Image prompt for this slide..."
    },
    {
      "slideNumber": 2,
      "type": "body",
      "headline": "Insight headline",
      "body": "Supporting detail (max 30 words)",
      "imagePrompt": "Image prompt..."
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
- Body slides type "body" with one insight each, max 30 words body text
- Second-to-last slide must be type "summary" with a save-worthy key takeaway
- Last slide must be type "cta" driving to training/website
- Generate 8-12 slides total
- Each imagePrompt: dark editorial visual (#141413 bg) with clean sans-serif typography and brand accents (#C9502C terracotta, #E8A838 amber)
- Generate exactly 3 thumbnailPrompts: text-forward, subject-forward, data-forward
- Direct, confident voice. Speaks to corporate ROI.`,
      },
    ],
  });

  const content = response.choices[0]?.message?.content || "{}";
  return JSON.parse(content);
}

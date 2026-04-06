import Anthropic from "@anthropic-ai/sdk";

export interface CtaContext {
  ctaText?: string;
  websiteUrl?: string;
  currentOfferName?: string;
  bookingLink?: string;
  urgencyLine?: string;
}

export async function generateNewConcepts(
  videoAnalysis: string,
  newConceptsPrompt: string,
  ctaContext?: CtaContext
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");

  const client = new Anthropic({ apiKey });

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

  const message = await client.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: `# ROLE
You're an expert in creating viral Reels on Instagram.

# OBJECTIVE
Take as input viral video from my competitor and based on it generate new concepts for me. Adapt this reference for me.

# REFERENCE VIDEO DESCRIPTION
------
${videoAnalysis}
------

# MY INSTRUCTIONS FOR NEW CONCEPTS
------
${newConceptsPrompt}
------
${ctaSection}

# BEGIN YOUR WORK`,
      },
    ],
  });

  const block = message.content[0];
  return block.type === "text" ? block.text : "";
}

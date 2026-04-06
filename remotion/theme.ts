/**
 * @roy_automates Brand Theme
 * Used by Remotion components and referenced across the project.
 */

export const colors = {
  /** Near-black — primary background, Claude's dark */
  bg_primary: "#141413",
  /** Warm cream — light background, Claude's light */
  bg_light: "#faf9f5",
  /** Warm mid-gray — neutral text and borders */
  neutral: "#b0aea5",
  /** Terracotta — Roy's human signature, Nairobi earth tone, CTAs */
  accent_roy: "#C9502C",
  /** Warm amber — stats, hook words, emphasis */
  highlight: "#E8A838",
} as const;

export const typography = {
  /** Clean sans-serif stack for all text */
  fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
  heading: {
    fontWeight: 700,
    textTransform: "uppercase" as const,
    letterSpacing: "0.02em",
    lineHeight: 1.1,
  },
  body: {
    fontWeight: 400,
    lineHeight: 1.6,
    letterSpacing: "0.01em",
  },
  sizes: {
    /** Hero / hook text */
    xl: 72,
    /** Section headings */
    lg: 48,
    /** Subheadings / stat labels */
    md: 32,
    /** Body / tip text */
    sm: 24,
    /** Captions / fine print */
    xs: 16,
  },
} as const;

/** Standard Instagram Reel dimensions (9:16) */
export const canvas = {
  width: 1080,
  height: 1920,
  fps: 30,
} as const;

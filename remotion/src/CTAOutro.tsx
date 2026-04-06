import { AbsoluteFill, useCurrentFrame, interpolate } from "@remotion/core";
import { colors, typography } from "../theme";

/**
 * CTAOutro — 4-second (120 frames @30fps) branded outro.
 * CTA text fades in, URL slides up from below, background has subtle gradient shift.
 */
export const CTAOutro: React.FC<{
  ctaText: string;
  websiteUrl: string;
}> = ({ ctaText, websiteUrl }) => {
  const frame = useCurrentFrame();

  // Background gradient shift
  const gradientPosition = interpolate(frame, [0, 120], [40, 60], {
    extrapolateRight: "clamp",
  });

  // CTA text fade in (frames 10–35)
  const ctaOpacity = interpolate(frame, [10, 35], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ctaTranslateY = interpolate(frame, [10, 35], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Divider line expand (frames 35–55)
  const dividerWidth = interpolate(frame, [35, 55], [0, 200], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // URL slide up (frames 45–65)
  const urlOpacity = interpolate(frame, [45, 65], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const urlTranslateY = interpolate(frame, [45, 65], [40, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Arrow pulse (frames 70–120)
  const arrowOpacity = interpolate(
    frame,
    [70, 85, 100, 115],
    [0.4, 1, 0.4, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 50% ${gradientPosition}%, #1a1918 0%, ${colors.bg_primary} 70%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 32,
        padding: 80,
      }}
    >
      {/* CTA Text */}
      <div
        style={{
          opacity: ctaOpacity,
          transform: `translateY(${ctaTranslateY}px)`,
          fontFamily: typography.fontFamily,
          fontSize: typography.sizes.lg,
          fontWeight: typography.heading.fontWeight,
          lineHeight: typography.heading.lineHeight,
          color: colors.bg_light,
          textAlign: "center",
          maxWidth: 800,
        }}
      >
        {ctaText}
      </div>

      {/* Divider */}
      <div
        style={{
          width: dividerWidth,
          height: 3,
          borderRadius: 2,
          backgroundColor: colors.accent_roy,
        }}
      />

      {/* Website URL */}
      <div
        style={{
          opacity: urlOpacity,
          transform: `translateY(${urlTranslateY}px)`,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            fontFamily: typography.fontFamily,
            fontSize: typography.sizes.md,
            fontWeight: 600,
            color: colors.accent_roy,
            letterSpacing: "0.03em",
          }}
        >
          {websiteUrl}
        </div>
        <div
          style={{
            opacity: arrowOpacity,
            fontSize: typography.sizes.md,
            color: colors.accent_roy,
          }}
        >
          →
        </div>
      </div>
    </AbsoluteFill>
  );
};

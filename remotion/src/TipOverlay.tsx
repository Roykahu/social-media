import { AbsoluteFill, useCurrentFrame, interpolate } from "@remotion/core";
import { colors, typography } from "../theme";

/**
 * TipOverlay — Lower-third tip card that slides up from bottom.
 * Holds in place with a subtle breathing glow on the accent border.
 */
export const TipOverlay: React.FC<{ tipText: string }> = ({ tipText }) => {
  const frame = useCurrentFrame();

  // Slide up from bottom (frames 0–25)
  const translateY = interpolate(frame, [0, 25], [200, 0], {
    extrapolateRight: "clamp",
  });
  const opacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Breathing border glow (frames 25–150)
  const borderOpacity = interpolate(
    frame,
    [25, 50, 75, 100, 125, 150],
    [0.5, 0.9, 0.5, 0.9, 0.5, 0.9],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Lightbulb icon fade in (frames 10–25)
  const iconOpacity = interpolate(frame, [10, 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "transparent",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        padding: 40,
        paddingBottom: 120,
      }}
    >
      <div
        style={{
          opacity,
          transform: `translateY(${translateY}px)`,
          width: "100%",
          maxWidth: 960,
          backgroundColor: colors.bg_light,
          borderRadius: 24,
          padding: "36px 44px",
          borderLeft: `5px solid ${colors.accent_roy}`,
          boxShadow: `0 0 ${30 * borderOpacity}px ${colors.accent_roy}40, 0 8px 32px rgba(0,0,0,0.4)`,
          display: "flex",
          alignItems: "center",
          gap: 28,
        }}
      >
        {/* Tip icon */}
        <div
          style={{
            opacity: iconOpacity,
            fontSize: 40,
            flexShrink: 0,
          }}
        >
          💡
        </div>

        {/* Tip text */}
        <div
          style={{
            fontFamily: typography.fontFamily,
            fontSize: typography.sizes.sm,
            fontWeight: typography.body.fontWeight,
            lineHeight: typography.body.lineHeight,
            color: colors.bg_primary,
          }}
        >
          {tipText}
        </div>
      </div>
    </AbsoluteFill>
  );
};

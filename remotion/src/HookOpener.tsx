import { AbsoluteFill, useCurrentFrame, interpolate } from "@remotion/core";
import { colors, typography } from "../theme";

/**
 * HookOpener — 3-second (90 frames @30fps) animated text hook.
 * Text scales up from 0.85 → 1.0, fades in, accent underline slides in from left.
 */
export const HookOpener: React.FC<{ hookText: string }> = ({ hookText }) => {
  const frame = useCurrentFrame();

  // Text animation (frames 0–20)
  const textOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });
  const textScale = interpolate(frame, [0, 20], [0.85, 1], {
    extrapolateRight: "clamp",
  });

  // Underline reveal (frames 15–45)
  const underlineWidth = interpolate(frame, [15, 45], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Subtle glow pulse on underline (frames 45–90)
  const glowOpacity = interpolate(frame, [45, 60, 75, 90], [0.4, 0.8, 0.4, 0.8], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.bg_primary,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 80,
      }}
    >
      <div
        style={{
          opacity: textOpacity,
          transform: `scale(${textScale})`,
          textAlign: "center",
          position: "relative",
        }}
      >
        <div
          style={{
            fontFamily: typography.fontFamily,
            fontSize: typography.sizes.xl,
            fontWeight: typography.heading.fontWeight,
            lineHeight: typography.heading.lineHeight,
            letterSpacing: typography.heading.letterSpacing,
            color: colors.bg_light,
            textTransform: "uppercase",
          }}
        >
          {hookText}
        </div>

        {/* Accent underline */}
        <div
          style={{
            marginTop: 24,
            height: 6,
            borderRadius: 3,
            backgroundColor: colors.accent_roy,
            width: `${underlineWidth}%`,
            opacity: glowOpacity,
            boxShadow: `0 0 20px ${colors.accent_roy}60`,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

import { AbsoluteFill, useCurrentFrame, interpolate } from "@remotion/core";
import { colors, typography } from "../theme";

/**
 * StatHighlight — Animated number count-up with label fade-in.
 * The stat counts up from 0, then the label fades in below.
 */
export const StatHighlight: React.FC<{
  stat: string;
  label: string;
}> = ({ stat, label }) => {
  const frame = useCurrentFrame();

  // Parse numeric value for count-up animation
  const numericValue = parseFloat(stat.replace(/[^0-9.]/g, "")) || 0;
  const prefix = stat.match(/^[^0-9]*/)?.[0] || "";
  const suffix = stat.match(/[^0-9]*$/)?.[0] || "";
  const isFloat = stat.includes(".");

  // Number count-up (frames 0–50)
  const currentNumber = interpolate(frame, [0, 50], [0, numericValue], {
    extrapolateRight: "clamp",
  });
  const displayNumber = isFloat
    ? currentNumber.toFixed(1)
    : Math.round(currentNumber).toString();

  // Number opacity and scale
  const numOpacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateRight: "clamp",
  });
  const numScale = interpolate(frame, [0, 15], [0.7, 1], {
    extrapolateRight: "clamp",
  });

  // Label fade in (frames 40–60)
  const labelOpacity = interpolate(frame, [40, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const labelTranslateY = interpolate(frame, [40, 60], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Subtle highlight glow (frames 50–90)
  const glowIntensity = interpolate(frame, [50, 65, 80, 90], [0, 0.6, 0.3, 0.5], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.bg_primary,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
        padding: 80,
      }}
    >
      {/* Stat number */}
      <div
        style={{
          opacity: numOpacity,
          transform: `scale(${numScale})`,
          fontFamily: typography.fontFamily,
          fontSize: 160,
          fontWeight: 800,
          color: colors.highlight,
          lineHeight: 1,
          textShadow: `0 0 ${60 * glowIntensity}px ${colors.highlight}50`,
          letterSpacing: "-0.02em",
        }}
      >
        {prefix}
        {displayNumber}
        {suffix}
      </div>

      {/* Label */}
      <div
        style={{
          opacity: labelOpacity,
          transform: `translateY(${labelTranslateY}px)`,
          fontFamily: typography.fontFamily,
          fontSize: typography.sizes.md,
          fontWeight: 500,
          color: colors.neutral,
          textAlign: "center",
          letterSpacing: "0.05em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
    </AbsoluteFill>
  );
};

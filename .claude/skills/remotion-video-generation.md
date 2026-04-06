# Remotion Video Generation Skill

Rules for writing Remotion components for @roy_automates branded video templates.

## Core Rules

1. **Deterministic only** — no `Math.random()`, no `Date.now()`, no side effects
2. **Use `useCurrentFrame()` + `interpolate()`** for all animations
3. **Import brand theme** from `./theme.ts` for all colours, fonts, and sizes
4. **Canvas: 1080x1920 at 30fps** (9:16 Instagram Reel format)

## Component Structure

```tsx
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { colors, typography, canvas } from "./theme";

export const MyComponent: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg_primary }}>
      <div style={{
        opacity,
        fontFamily: typography.fontFamily,
        color: colors.bg_light,
      }}>
        {text}
      </div>
    </AbsoluteFill>
  );
};
```

## Animation Patterns

### Fade In
```tsx
const opacity = interpolate(frame, [startFrame, startFrame + 15], [0, 1], {
  extrapolateRight: "clamp",
});
```

### Scale Up
```tsx
const scale = interpolate(frame, [0, 20], [0.8, 1], {
  extrapolateRight: "clamp",
});
// Apply: transform: `scale(${scale})`
```

### Slide In From Bottom
```tsx
const translateY = interpolate(frame, [0, 20], [100, 0], {
  extrapolateRight: "clamp",
});
// Apply: transform: `translateY(${translateY}px)`
```

### Underline Reveal (Left to Right)
```tsx
const width = interpolate(frame, [10, 30], [0, 100], {
  extrapolateRight: "clamp",
});
// Apply: width: `${width}%`
```

### Number Count-Up
```tsx
const count = Math.round(
  interpolate(frame, [0, 60], [0, targetNumber], {
    extrapolateRight: "clamp",
  })
);
```

## Rendering

```bash
# Preview in browser
npx remotion preview

# Render a specific composition
npx remotion render [CompositionId] output.mp4

# Render with custom props
npx remotion render HookOpener output.mp4 --props='{"hookText":"Stop scrolling."}'
```

## Do NOT

- Use `setTimeout`, `setInterval`, or any async timing
- Use CSS animations or transitions (use `interpolate()` instead)
- Use external image/video URLs (bundle assets locally)
- Use `Math.random()` — every frame must produce identical output
- Use any state hooks (`useState`, `useEffect`) for animation

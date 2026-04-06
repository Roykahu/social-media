# Kling 3 Prompting Skill

Rules for generating cinema-grade Kling API prompts for video post-production.

## Prompt Structure

Every Kling prompt must include these 6 fields:

### 1. Scene Description
What is happening in the frame. Be specific about environment and action.
> "A man sits at a modern desk in a dimly lit studio, speaking directly to camera with confident gestures."

### 2. Camera
Camera angle, movement, and framing.
> "Medium close-up, static tripod, slight shallow depth of field, subject centered."

### 3. Lighting
Light sources, direction, quality, and mood.
> "Key light from 45° camera-left, warm tungsten 3200K. Subtle rim light from behind, cool 5600K. No fill — let shadows fall naturally."

### 4. Mood / Atmosphere
The emotional and visual tone of the scene.
> "Cinematic, warm-dark, editorial. Intimate but authoritative. Think late-night interview, not morning show."

### 5. Subject Detail
What the subject looks like, is wearing, and how they carry themselves.
> "African man in his 30s, well-groomed, wearing a tailored dark crew-neck sweater. Posture upright, expression engaged and direct."

### 6. Colour Grade
Post-production colour treatment to apply.
> "Desaturated warm tones, lifted blacks to dark charcoal (#141413), skin tones preserved with slight warmth. Terracotta (#C9502C) pushed subtly in midtones. Amber (#E8A838) in highlights. No teal-and-orange. No crushed blacks."

## Brand Tone Rules

- **Always:** Cinematic, warm-dark, editorial
- **Never:** Bright, playful, saturated, corporate-clean, flat-lit
- Background environments: dark studios, modern offices with warm lighting, Nairobi cityscapes at dusk
- Wardrobe: tailored, minimal, premium (dark neutrals, occasional earth tones)
- No filters that look like Instagram presets — aim for film-grade

## Example Complete Prompt

```
SCENE: A man records a talking head video at a sleek desk. Behind him, a large monitor displays code. The room has a warm, moody ambiance.

CAMERA: Medium shot, static, f/2.8 shallow DOF. Subject positioned at rule-of-thirds left.

LIGHTING: Single key light from camera-right, warm tungsten. Practical desk lamp adds amber fill. Monitor provides cool backlight on shoulders.

MOOD: Cinematic editorial. Confident knowledge-sharing atmosphere. Premium tech creator aesthetic.

SUBJECT: Well-dressed African man in dark henley, silver watch. Direct eye contact, measured hand gestures.

COLOUR GRADE: Warm desaturated palette. Blacks lifted to #141413. Skin tones natural with slight warmth. Terracotta midtones, amber highlights. Film grain at 15%.
```

## Kling API Settings

| Parameter | Recommended Value |
|-----------|------------------|
| Model | kling-v2 |
| Mode | professional |
| Duration | 5-10s per clip |
| Aspect Ratio | 9:16 (vertical) |
| CFG Scale | 0.5 (balanced) |

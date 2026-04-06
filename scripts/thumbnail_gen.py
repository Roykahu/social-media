#!/usr/bin/env python3
"""
Thumbnail Generator — Generate thumbnail images using Google AI Studio (Gemini Image Gen).

Usage:
    python scripts/thumbnail_gen.py                    # Generate for all carousels
    python scripts/thumbnail_gen.py --carousel-id ID   # Generate for specific carousel

Reads thumbnail prompts from data/carousels.csv, generates images via Google AI Studio,
and saves them to data/thumbnails/<carousel-id>/.
"""

import argparse
import csv
import json
import os
from pathlib import Path

try:
    from dotenv import load_dotenv
except ImportError:
    print("Missing python-dotenv. Install: pip install python-dotenv")
    exit(1)

try:
    from google import genai
except ImportError:
    print("Missing google-genai. Install: pip install google-genai")
    exit(1)

PROJECT_DIR = Path(__file__).resolve().parent.parent
load_dotenv(PROJECT_DIR / ".env")

DATA_DIR = PROJECT_DIR / "data"
THUMBNAILS_DIR = DATA_DIR / "thumbnails"

API_KEY = os.environ.get("GOOGLE_AI_STUDIO_API_KEY", "")


def generate_thumbnails(carousel_id: str = ""):
    """Generate thumbnail images for carousels."""
    if not API_KEY:
        print("Error: GOOGLE_AI_STUDIO_API_KEY not set in .env")
        exit(1)

    carousels_csv = DATA_DIR / "carousels.csv"
    if not carousels_csv.exists():
        print("No carousels.csv found. Generate carousels first via the web app.")
        exit(1)

    client = genai.Client(api_key=API_KEY)

    with open(carousels_csv, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        rows = list(reader)

    if carousel_id:
        rows = [r for r in rows if r.get("id", "").startswith(carousel_id)]
        if not rows:
            print(f"No carousel found with ID starting with '{carousel_id}'")
            exit(1)

    total_generated = 0

    for row in rows:
        cid = row.get("id", "unknown")
        prompts_raw = row.get("thumbnailPrompts", "[]")

        try:
            prompts = json.loads(prompts_raw)
        except json.JSONDecodeError:
            print(f"  Skipping {cid[:8]} — invalid thumbnailPrompts JSON")
            continue

        if not prompts:
            print(f"  Skipping {cid[:8]} — no thumbnail prompts")
            continue

        output_dir = THUMBNAILS_DIR / cid[:8]
        output_dir.mkdir(parents=True, exist_ok=True)

        print(f"\nCarousel {cid[:8]} — {len(prompts)} prompts")

        for i, prompt in enumerate(prompts):
            output_path = output_dir / f"thumbnail_{i + 1}.png"
            if output_path.exists():
                print(f"  [{i + 1}] Already exists — skipping")
                continue

            print(f"  [{i + 1}] Generating: {prompt[:60]}...")

            try:
                response = client.models.generate_images(
                    model="imagen-3.0-generate-002",
                    prompt=prompt,
                    config=genai.types.GenerateImagesConfig(
                        number_of_images=1,
                        aspect_ratio="9:16",
                    ),
                )

                if response.generated_images:
                    image = response.generated_images[0]
                    image.image.save(str(output_path))
                    print(f"  [{i + 1}] Saved: {output_path}")
                    total_generated += 1
                else:
                    print(f"  [{i + 1}] No image returned")
            except Exception as e:
                print(f"  [{i + 1}] Error: {e}")

    print(f"\nDone! {total_generated} thumbnails generated.")
    print(f"Output: {THUMBNAILS_DIR}")


def main():
    parser = argparse.ArgumentParser(description="Generate carousel thumbnails via Google AI Studio")
    parser.add_argument("--carousel-id", default="", help="Generate for specific carousel ID (prefix match)")
    args = parser.parse_args()

    generate_thumbnails(args.carousel_id)


if __name__ == "__main__":
    main()

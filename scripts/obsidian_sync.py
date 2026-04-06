#!/usr/bin/env python3
"""
Obsidian Sync — Export pipeline results to Obsidian vault as markdown files.

Usage:
    python scripts/obsidian_sync.py

Reads data/videos.csv and data/carousels.csv, writes .md files to OBSIDIAN_VAULT_PATH.
Idempotent: skips files that already exist.
"""

import csv
import os
import re
from pathlib import Path
from datetime import datetime

try:
    from dotenv import load_dotenv
except ImportError:
    print("Missing python-dotenv. Install: pip install python-dotenv")
    exit(1)

PROJECT_DIR = Path(__file__).resolve().parent.parent
load_dotenv(PROJECT_DIR / ".env")

VAULT_PATH = os.environ.get("OBSIDIAN_VAULT_PATH", "")
DATA_DIR = PROJECT_DIR / "data"

# Vault folder structure
VAULT_FOLDERS = [
    "Scripts",
    "Carousel-Copy",
    "Ideas",
    "Brand-Guide",
    "Brand-Guide/Thumbnails",
    "Analytics",
]


def slugify(text: str, max_len: int = 40) -> str:
    """Convert text to kebab-case slug."""
    text = text.lower().strip()
    text = re.sub(r"[^a-z0-9\s-]", "", text)
    text = re.sub(r"[\s_]+", "-", text)
    text = re.sub(r"-+", "-", text).strip("-")
    return text[:max_len]


def ensure_vault_folders(vault: Path):
    """Create vault folder structure if needed."""
    for folder in VAULT_FOLDERS:
        (vault / folder).mkdir(parents=True, exist_ok=True)
    print(f"Vault folders ensured at: {vault}")


def sync_videos(vault: Path):
    """Sync videos.csv to Scripts/ folder."""
    videos_csv = DATA_DIR / "videos.csv"
    if not videos_csv.exists():
        print("No videos.csv found — skipping video sync.")
        return

    scripts_dir = vault / "Scripts"
    created = 0
    skipped = 0

    with open(videos_csv, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            video_id = row.get("id", "")[:8]
            creator = row.get("creator", "unknown")
            config_name = row.get("configName", "")
            date_posted = row.get("datePosted", "")
            date_added = row.get("dateAdded", "")
            views = row.get("views", "0")
            analysis = row.get("analysis", "")
            new_concepts = row.get("newConcepts", "")

            # Use datePosted if available, else dateAdded, else today
            date_str = date_posted or date_added or datetime.now().strftime("%Y-%m-%d")
            # Normalize date format
            if "T" in date_str:
                date_str = date_str.split("T")[0]

            slug = slugify(config_name) if config_name else "uncategorized"
            filename = f"{date_str}_{slug}_{creator}_{video_id}.md"
            filepath = scripts_dir / filename

            if filepath.exists():
                skipped += 1
                continue

            # Build frontmatter
            frontmatter = f"""---
date: {date_str}
pillar: teach
format: reel
status: draft
competitor_source: "@{creator}"
estimated_views: {views}
config_name: "{config_name}"
tags:
  - pipeline
  - {slugify(config_name) if config_name else "uncategorized"}
---"""

            body = f"""{frontmatter}

## Analysis

{analysis if analysis else "_No analysis available._"}

## New Concepts

{new_concepts if new_concepts else "_No concepts generated._"}
"""

            filepath.write_text(body, encoding="utf-8")
            created += 1

    print(f"Videos: {created} created, {skipped} skipped (already exist)")


def sync_carousels(vault: Path):
    """Sync carousels.csv to Carousel-Copy/ folder."""
    carousels_csv = DATA_DIR / "carousels.csv"
    if not carousels_csv.exists():
        print("No carousels.csv found — skipping carousel sync.")
        return

    carousel_dir = vault / "Carousel-Copy"
    created = 0
    skipped = 0

    with open(carousels_csv, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            carousel_id = row.get("id", "")[:8]
            topic = row.get("topic", "untitled")
            pillar = row.get("pillar", "teach").lower()
            date_created = row.get("dateCreated", datetime.now().strftime("%Y-%m-%d"))
            slides_json = row.get("slides", "")
            thumbnail_prompts = row.get("thumbnailPrompts", "")

            if "T" in date_created:
                date_created = date_created.split("T")[0]

            slug = slugify(topic)
            filename = f"{date_created}_{pillar}_{slug}_{carousel_id}.md"
            filepath = carousel_dir / filename

            if filepath.exists():
                skipped += 1
                continue

            frontmatter = f"""---
date: {date_created}
pillar: {pillar}
format: carousel
status: draft
topic: "{topic}"
tags:
  - carousel
  - {pillar}
---"""

            body = f"""{frontmatter}

## Slides

{slides_json if slides_json else "_No slides data._"}

## Thumbnail Prompts

{thumbnail_prompts if thumbnail_prompts else "_No thumbnail prompts._"}
"""

            filepath.write_text(body, encoding="utf-8")
            created += 1

    print(f"Carousels: {created} created, {skipped} skipped (already exist)")


def main():
    if not VAULT_PATH:
        print("Error: OBSIDIAN_VAULT_PATH not set in .env")
        print("Set it to the absolute path of your Obsidian vault folder.")
        exit(1)

    vault = Path(VAULT_PATH)
    if not vault.exists():
        print(f"Creating vault directory: {vault}")
        vault.mkdir(parents=True, exist_ok=True)

    print(f"Syncing to Obsidian vault: {vault}")
    print("=" * 50)

    ensure_vault_folders(vault)
    sync_videos(vault)
    sync_carousels(vault)

    print("=" * 50)
    print("Sync complete!")


if __name__ == "__main__":
    main()

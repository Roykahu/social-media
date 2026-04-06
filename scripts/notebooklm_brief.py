#!/usr/bin/env python3
"""
NotebookLM Brief Generator — Convert long-form scripts into structured production briefs.

Usage:
    python scripts/notebooklm_brief.py path/to/script.md
    python scripts/notebooklm_brief.py path/to/script.md --output path/to/output.md

Reads a long-form script, restructures it with visual/stat/motion annotations
via Claude API, and saves to Obsidian vault (or custom output path).
"""

import argparse
import os
import sys
from pathlib import Path

try:
    from dotenv import load_dotenv
except ImportError:
    print("Missing python-dotenv. Install: pip install python-dotenv")
    sys.exit(1)

try:
    import anthropic
except ImportError:
    print("Missing anthropic. Install: pip install anthropic")
    sys.exit(1)

PROJECT_DIR = Path(__file__).resolve().parent.parent
load_dotenv(PROJECT_DIR / ".env")

API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")
VAULT_PATH = os.environ.get("OBSIDIAN_VAULT_PATH", "")

SYSTEM_PROMPT = """You are a video production brief specialist for @roy_automates (Roy Kahuthu), a Claude Educator in Nairobi, Kenya.

Your job is to take a long-form script and restructure it into a NotebookLM-optimized source document that maximises cinematic video generation quality.

Output rules:
1. Clear section headers (## format)
2. Add [VISUAL: ...] annotations wherever a visual cue would enhance the video
3. Add [STAT: ...] annotations for any data points, numbers, or metrics that should be displayed on screen
4. Add [MOTION: ...] annotations for camera movement, transitions, or animation suggestions
5. After each major section, add a "### Visual Scene Concepts" subsection with exactly 3 cinematic scene descriptions

Style: cinematic, warm-dark, editorial. NOT bright or playful.
Brand colours: #141413 (near-black bg), #C9502C (terracotta accent), #E8A838 (amber highlight).
Tone: direct, confident, premium. Nairobi-rooted, globally credible."""


def generate_brief(script_content: str) -> str:
    """Send script to Claude and get structured brief back."""
    client = anthropic.Anthropic(api_key=API_KEY)

    message = client.messages.create(
        model="claude-sonnet-4-5-20250929",
        max_tokens=4096,
        system=SYSTEM_PROMPT,
        messages=[
            {
                "role": "user",
                "content": f"""Transform this script into a structured NotebookLM production brief:

---
{script_content}
---

Add [VISUAL], [STAT], and [MOTION] annotations throughout.
Add 3 visual scene concepts after each major section.
Preserve the core message but restructure for maximum video production clarity.""",
            }
        ],
    )

    block = message.content[0]
    return block.text if block.type == "text" else ""


def main():
    parser = argparse.ArgumentParser(
        description="Convert long-form scripts to NotebookLM production briefs"
    )
    parser.add_argument("script_path", help="Path to the script markdown file")
    parser.add_argument(
        "--output", "-o", default="", help="Output path (default: Obsidian vault Scripts/)"
    )
    args = parser.parse_args()

    if not API_KEY:
        print("Error: ANTHROPIC_API_KEY not set in .env")
        sys.exit(1)

    script_path = Path(args.script_path)
    if not script_path.exists():
        print(f"Error: Script file not found: {script_path}")
        sys.exit(1)

    print(f"Reading script: {script_path}")
    script_content = script_path.read_text(encoding="utf-8")

    if not script_content.strip():
        print("Error: Script file is empty")
        sys.exit(1)

    print("Generating production brief via Claude...")
    brief = generate_brief(script_content)

    if not brief:
        print("Error: Claude returned empty response")
        sys.exit(1)

    # Determine output path
    if args.output:
        output_path = Path(args.output)
    elif VAULT_PATH:
        vault = Path(VAULT_PATH)
        scripts_dir = vault / "Scripts"
        scripts_dir.mkdir(parents=True, exist_ok=True)
        stem = script_path.stem
        output_path = scripts_dir / f"{stem}-brief.md"
    else:
        output_path = script_path.parent / f"{script_path.stem}-brief.md"

    # Add frontmatter
    output_content = f"""---
date: {__import__('datetime').date.today().isoformat()}
type: production-brief
source: "{script_path.name}"
status: draft
tags:
  - notebooklm
  - production-brief
---

{brief}
"""

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(output_content, encoding="utf-8")

    print(f"Brief saved to: {output_path}")
    print(f"Word count: {len(brief.split())}")


if __name__ == "__main__":
    main()

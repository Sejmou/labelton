#!/usr/bin/env python3
f"""
Convert a JSON Ableton locator file to an Audacity labels text file.
The input JSON file is expected to be in the format of the output of the labelton NodeJS script (index.js in this repository).

Usage:
  python locator_json_to_audacity_labels_txt.py ableton-locators.json [audacity-labels.txt]

Example:
    python locator_json_to_audacity_labels_txt.py ableton-locators.json audacity-labels.txt

The output file can be imported into Audacity as labels via File > Import > Labels...
"""

import json
import sys
from pathlib import Path


def convert(json_path: str, output_path: str | None = None) -> Path:
    source = Path(json_path)
    dest = Path(output_path) if output_path else Path("audacity-labels.txt")

    with source.open("r", encoding="utf-8") as f:
        data = json.load(f)

    locators = data["locators"]
    assert isinstance(locators, list), "locators must be a list"
    assert all(
        isinstance(locator, dict) for locator in locators
    ), "each locator must be a dictionary"
    assert all(
        "timeSeconds" in locator for locator in locators
    ), "each locator must have a timeSeconds field"
    assert all(
        "name" in locator for locator in locators
    ), "each locator must have a name field"

    # Sort by timeSeconds so labels appear in order in Audacity
    locators.sort(key=lambda m: m["timeSeconds"])

    lines = []
    for index, locator in enumerate(locators):
        time = float(locator["timeSeconds"])
        assert isinstance(
            locator["name"], str
        ), f"Expected string for label name, got {type(locator['name'])} ({locator['name']}) at index {index}"
        name = locator["name"].replace("\t", " ").replace("\n", " ").replace("\r", "")
        # Audacity point labels: start == end
        lines.append(f"{time:.6f}\t{time:.6f}\t{name}")

    dest.write_text("\n".join(lines), encoding="utf-8")
    print(f"✓ Written {len(lines)} label(s) to: {dest}")
    return dest


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python json_to_audacity_labels.py <labels.json> [output.txt]")
        sys.exit(1)

    convert(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else None)

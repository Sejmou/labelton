# labelton

Export locators from the currently open Ableton Live project to a JSON file using `ableton-js`.

## What this does

- Connects to your running Ableton Live instance.
- Reads all song locators (Ableton cue points).
- Exports them to JSON with both:
  - `timeBeats` (Ableton-native time)
  - `timeSeconds` (portable time for external tools)

## Prerequisites

Before running this script, make sure:

1. Ableton Live is running.
2. The target project is open in Ableton Live.
3. The AbletonJS MIDI Remote Script is installed and active as a Control Surface.

AbletonJS script location is typically:

- `~/Music/Ableton/User Library/Remote Scripts/AbletonJS`

If this is not configured, the CLI will fail to connect.

## Install

```bash
pnpm install
```

## Usage

Default output path (`./ableton-locators.json`):

```bash
npm run export:locators
```

Explicit output path:

```bash
npm run export:locators -- --output ./exports/locators.json
```

or

```bash
node index.js -o ./exports/locators.json
```

CLI help:

```bash
node index.js --help
```

## Output format

Example:

```json
{
  "exportedAt": "2026-03-20T00:00:00.000Z",
  "source": "Ableton Live via ableton-js",
  "tempoBpm": 120,
  "locatorCount": 2,
  "locators": [
    {
      "index": 0,
      "id": "123",
      "name": "Intro",
      "timeBeats": 0,
      "timeSeconds": 0
    },
    {
      "index": 1,
      "id": "456",
      "name": "Drop",
      "timeBeats": 64,
      "timeSeconds": 32
    }
  ]
}
```

`timeSeconds` is computed from tempo:

`timeSeconds = timeBeats * (60 / tempoBpm)`

## Troubleshooting

If you see `Connection timed out`:

- Confirm Ableton Live is open.
- Confirm the AbletonJS script is installed correctly.
- Confirm the AbletonJS script is enabled in Live preferences (Control Surface).
- Re-run the command after opening/reloading your Live project.

# labelton

Export locators from the currently open Ableton Live project to a JSON file using `ableton-js`.

## What this does

- Connects to your running Ableton Live instance.
- Reads all song locators (Ableton cue points).
- Exports them to JSON with both:
  - `timeBeats` (Ableton-native time)
  - `timeSeconds` (portable time for external tools)

> CAVEAT: I've only tested this on my Mac running Ableton Live 10!

## Prerequisites

Unfortunately, the setup is potentially a bit complicated if you're not a software dev, but hopefully you can find your way around with your AI chatbot of choice.

Before running this script, make sure:

1. You have NodeJS installed (note: you don't have to use pnpm, it should work with npm as well - I hope at least :sweat_smile:)
2. You have downloaded and installed the MIDI scripts from the zip/tar archive of ableton-js v3.4.1 ([link](https://github.com/leolabs/ableton-js/releases/tag/v3.4.1)) - please refer to the [README of the project](https://github.com/leolabs/ableton-js/tree/v3.4.1) for details on how to install them.
   > NOTE: the latest version as of this writing (v4.0.4) did not seem to work for me, maybe a different version might work for you though if you're on Ableton Live 11 or later.

## Install

```bash
pnpm install
```

This will basically just install the NodeJS code for ableton-js (the NodeJS script communicates with the MIDI scripts you copied earlier; those in turn communicate with Ableton Live).

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

`timeSeconds` is computed from the project's tempo:

`timeSeconds = timeBeats * (60 / tempoBpm)`

## Troubleshooting

If you see `Connection timed out`:

- Confirm Ableton Live is open.
- Confirm the AbletonJS script is installed correctly.
- Confirm the AbletonJS script is enabled in Live preferences (Control Surface).
- Re-run the command after opening/reloading your Live project.

# labelton

This repo consists of two parts:

- A NodeJS script that exports locators from the currently open Ableton Live project to a JSON file using [`ableton-js`](https://github.com/leolabs/ableton-js/tree/v3.4.1)
- A Python script that converts the JSON file to an Audacity labels text file

## NodeJS script

### What this does

- Connects to your running Ableton Live instance.
- Reads all song locators (Ableton cue points).
- Exports them to a JSON file with the following fields:
  - `locators` (an array of objects with the following fields):
    - `index` (the index of the locator)
    - `id` (the ID of the locator)
    - `name` (the name of the locator)
    - `timeBeats` (Ableton-native time)
    - `timeSeconds` (portable time for external tools)
  - `exportedAt` (ISO timestamp of the export)
  - `source` (source of the data: "Ableton Live via ableton-js")
  - `tempoBpm` (the project's tempo in BPM)
  - `locatorCount` (the number of locators found)

The idea behind this is to be able to use the locator information in other audio editingtools, e.g. if you're exporting the stems and want to allow people using other programs to make use of the locators.

> CAVEAT: I've only tested this on my Mac running Ableton Live 10 with ableton-js v3.4.1 (I have used that specific version successfully in another project), but not on v4.0.4. I haven't tested any other versions.

### Prerequisites

Unfortunately, the Ableton setup is potentially a bit complicated if you're not a software dev, but hopefully you can find your way around with your AI chatbot of choice.
You'll need to run the `index.js` NodeJS script.

Before running the NodeJS script, make sure:

1. You have NodeJS installed (note: you don't have to use pnpm, it should work with npm as well - I hope at least :sweat_smile:)
2. You have downloaded and installed the MIDI scripts from the zip/tar archive of ableton-js v3.4.1 ([link](https://github.com/leolabs/ableton-js/releases/tag/v3.4.1)) - please refer to the [README of the project](https://github.com/leolabs/ableton-js/tree/v3.4.1) for details on how to install them.
   > NOTE: the latest version as of this writing (v4.0.4) did not seem to work for me, maybe a different version might work for you though if you're on Ableton Live 11 or later.

### Install

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

### Output format

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

### Troubleshooting

If you see `Connection timed out`:

- Confirm Ableton Live is open.
- Confirm the AbletonJS script is installed correctly.
- Confirm the AbletonJS script is enabled in Live preferences (Control Surface).
- Re-run the command after opening/reloading your Live project.

## Python script

### What this does

- Converts the JSON file exported by the NodeJS script to an Audacity labels text file.
- The input JSON file is expected to be in the format of the output of the NodeJS script.
- The output file can be imported into Audacity as labels via File > Import > Labels...

### Prerequisites

You'll need to have Python 3 installed. Apart from that, this doesn't need any special packages.

### Usage

```bash
python locator_json_to_audacity_labels_txt.py ableton-locators.json audacity-labels.txt
```

### Output format

The output file can be imported into Audacity as labels via File > Import > Labels...

Example:

```txt
0.000000	0.000000	Intro
560.000000	560.000000	Drop
```

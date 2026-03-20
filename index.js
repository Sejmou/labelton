#!/usr/bin/env node

const fs = require("node:fs/promises");
const path = require("node:path");

const DEFAULT_OUTPUT_FILENAME = "ableton-locators.json";
const CONNECTION_TIMEOUT_MS = 5000;

function printHelp() {
  console.log(`labelton - Export Ableton Live locators to JSON

Usage:
  node index.js [options]
  npm run export:locators -- [options]

Options:
  -o, --output <path>   Path to output JSON file
  -h, --help            Show this help

Examples:
  node index.js
  node index.js --output ./exports/locators.json
  npm run export:locators -- -o /tmp/locators.json
`);
}

function parseArgs(argv) {
  const result = {
    outputPath: path.resolve(process.cwd(), DEFAULT_OUTPUT_FILENAME),
    showHelp: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === "-h" || arg === "--help") {
      result.showHelp = true;
      continue;
    }

    if (arg === "-o" || arg === "--output") {
      const nextArg = argv[i + 1];
      if (!nextArg || nextArg.startsWith("-")) {
        throw new Error("Missing value for --output");
      }
      result.outputPath = path.resolve(process.cwd(), nextArg);
      i += 1;
      continue;
    }

    if (arg.startsWith("--output=")) {
      const value = arg.slice("--output=".length);
      if (!value) {
        throw new Error("Missing value for --output");
      }
      result.outputPath = path.resolve(process.cwd(), value);
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return result;
}

function toSeconds(beats, tempo) {
  return Number((beats * (60 / tempo)).toFixed(6));
}

async function run() {
  const args = parseArgs(process.argv.slice(2));

  if (args.showHelp) {
    printHelp();
    return;
  }

  let ableton = null;

  try {
    const { Ableton } = await import("ableton-js");
    ableton = new Ableton({ logger: console });

    console.log("Connecting to Ableton Live...");
    await ableton.start(CONNECTION_TIMEOUT_MS);
    console.log("Connected. Reading current project data...");

    const [tempo, cuePoints] = await Promise.all([
      ableton.song.get("tempo"),
      ableton.song.get("cue_points"),
    ]);

    if (!tempo || tempo <= 0) {
      throw new Error(`Invalid tempo received from Ableton: ${tempo}`);
    }

    console.log(
      `Found ${cuePoints.length} locator(s). Converting beat time to seconds using tempo ${tempo} BPM...`
    );

    const locators = cuePoints.map((cuePoint, index) => ({
      index,
      id: cuePoint.raw.id,
      name: cuePoint.raw.name,
      timeBeats: cuePoint.raw.time,
      timeSeconds: toSeconds(cuePoint.raw.time, tempo),
    }));

    const payload = {
      exportedAt: new Date().toISOString(),
      source: "Ableton Live via ableton-js",
      tempoBpm: tempo,
      locatorCount: locators.length,
      locators,
    };

    await fs.mkdir(path.dirname(args.outputPath), { recursive: true });
    await fs.writeFile(args.outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

    console.log(`Done. Wrote ${locators.length} locator(s) to ${args.outputPath}`);
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    console.error("Failed to export locators.");
    console.error(
      `Reason: ${reason}\n\nMake sure Ableton Live is running, your target project is open, and the AbletonJS MIDI Remote Script is installed and active.`
    );
    process.exitCode = 1;
  } finally {
    if (ableton) {
      try {
        await ableton.close();
      } catch {
        // Ignore shutdown errors to avoid masking root cause.
      }
    }
  }
}

run();

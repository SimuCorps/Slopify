#!/usr/bin/env node

import { readFileSync } from "fs";

// Read the commit message from the file
const commitMsgFile = process.argv[2];
const commitMsg = readFileSync(commitMsgFile, "utf8");

// Regex to match emoji characters
const emojiRegex =
  /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F000}-\u{1F02F}]|[\u{1F0A0}-\u{1F0FF}]|[\u{1F100}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F910}-\u{1F96B}]|[\u{1F980}-\u{1F9E0}]/u;

if (!emojiRegex.test(commitMsg)) {
  console.error("\x1b[31mError: Commit message must include at least one emoji! 🚫\x1b[0m");
  console.error("Example commit messages:");
  console.error("✨ Add new feature");
  console.error("🐛 Fix bug in login");
  console.error("🎨 Update styles");
  process.exit(1);
}

process.exit(0);


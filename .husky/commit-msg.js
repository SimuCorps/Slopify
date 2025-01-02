#!/usr/bin/env node

import { readFileSync } from "node:fs";
import emojiRegex from "emoji-regex";
import { exec } from "child_process";

// Function to play audio using system default video player
function playVideo(videoName) {
  const videoPath = `${process.cwd()}/static/video/${videoName}`;
  const command =
    process.platform === "darwin"
      ? `afplay "${videoPath}"` // macOS built-in audio player
      : process.platform === "win32"
        ? `start /min wmplayer "${videoPath}"` // Windows Media Player minimized
        : `paplay "${videoPath}"`; // PulseAudio on Linux

  return new Promise((resolve) => {
    exec(command, (error) => {
      if (error) {
        // Fallback to just opening with default app
        const fallbackCommand =
          process.platform === "darwin"
            ? `open "${videoPath}"`
            : process.platform === "win32"
              ? `start "${videoPath}"`
              : `xdg-open "${videoPath}"`;

        exec(fallbackCommand, (fallbackError) => {
          if (fallbackError) {
            console.error("Failed to play video:", fallbackError);
          }
          resolve();
        });
      } else {
        resolve();
      }
    });
  });
}

// Curated list of developer-friendly emojis
const devEmojis = [
  "✨", // sparkles - new feature
  "🚀", // rocket - deployment/performance
  "🧱", // brick - infrastructure
  "🌱", // seedling - initial commit
  "🐛", // bug - bug fix
  "🔧", // wrench - configuration
  "🎨", // art - styling/UI
  "♻️", // recycle - refactor
  "🔥", // fire - remove code/files
  "📦", // package - dependencies
  "🔒", // lock - security
  "📝", // memo - docs
  "🧪", // test tube - testing
  "⚡️", // zap - improvement
  "🔍", // magnifying glass - search
  "💡", // bulb - idea/solution
  "🏗️", // construction - WIP
  "🎯", // target - goals/focus
  "🛠️", // tools - development tools
  "🧹", // broom - cleanup
  "🚧", // construction - WIP
  "📊", // chart - analytics
  "🔌", // plug - plugins
  "🧩", // puzzle - solving
  "🎮", // game - fun stuff
  "🔨", // hammer - build
  "📱", // mobile - mobile development
  "🖥️", // desktop - desktop apps
  "🌐", // globe - web development
  "🔐", // locked with key - enhanced security
  "📈", // trending up - performance improvement
  "🔄", // arrows in circle - synchronization
  "💾", // floppy disk - save
  "🗑️", // wastebasket - delete
  "📡", // satellite - network/API
  "🔗", // link - connections
  "⚙️", // gear - settings
  "🎁", // gift - release
  "🚨", // emergency light - critical issues
  "💫", // dizzy - animations
  "🎭", // masks - testing environments
  "🔮", // crystal ball - predictions/ML
  "🎪", // circus tent - deployment environment
  "🎢", // roller coaster - development cycles
  "🎡", // ferris wheel - continuous integration
  "🎠", // carousel - version control
  "🎪", // circus tent - staging
  "🌈", // rainbow - diversity in code
  "🌊", // wave - data flow
  "🌋", // volcano - major breaking changes
  "🗽", // liberty - open source
  "🎵", // music note - audio features
  "🎬", // clapper board - video features
  "📸", // camera - image processing
  "🔋", // battery - optimization
  "💻", // laptop - development
  "🖨️", // printer - output
  "⌨️", // keyboard - input
  "🖱️", // mouse - user interface
  "📺", // tv - display
  "📱", // mobile phone - responsive design
  "🔎", // magnifying glass tilted right - deep search
  "🔍", // magnifying glass tilted left - search
  "📡", // satellite dish - API endpoints
  "🛰️", // satellite - cloud services
  "🚦", // traffic light - status indicators
  "⚓", // anchor - stable release
  "🧭", // compass - navigation
  "🎯", // direct hit - precision fixes
  "🎲", // game die - random functions
  "🔱", // trident - powerful features
  "⚔️", // crossed swords - merge conflicts
  "🛡️", // shield - security measures
  "⚖️", // balance scale - load balancing
  "🧮", // abacus - calculations
  "🔭", // telescope - long-term planning
  "🔬", // microscope - detailed analysis
  "🎓", // graduation cap - learning/tutorials
  "📚", // books - documentation
  "🎉", // party popper - celebration/launch
  "🌟", // glowing star - featured/important
  "🔔", // bell - notifications
  "🎚️", // level slider - adjustments
  "🎛️", // control knobs - fine tuning
  "🧰", // toolbox - utilities
  "🗄️", // file cabinet - storage
  "📥", // inbox - downloads/imports
  "📤", // outbox - uploads/exports
  "🔖", // bookmark - saved/favorites
  "📌", // pushpin - pinned items
  "🏷️", // label - tags
  "🗃️", // card file box - databases
  "📋", // clipboard - copy/paste
  "🗞️", // newspaper - news/updates
  "📰", // newspaper - blog/articles
  "📑", // bookmark tabs - multiple pages
  "🔆", // high brightness - display settings
  "🎆", // fireworks - celebrations
  "🌠", // shooting star - wishes/goals
  "🎨", // artist palette - design
  "🖼️", // framed picture - images
  "🎹", // musical keyboard - audio
  "🎺", // trumpet - announcements
  "📢", // loudspeaker - broadcasts
  "🔊", // speaker high volume - sound
  "🎙️", // studio microphone - voice/audio
  "🌍", // earth globe europe-africa - global
  "🔩", // nut and bolt - technical details
  "📎", // paperclip - attachments
  "🎳", // bowling - strike/success
  "🎰", // slot machine - random generation
  "🎲", // game die - chance/probability
  "🎯", // dart - precision/accuracy
  "🎪", // circus tent - big deployment
  "🎭", // performing arts - UI/UX
  "🎨", // artist palette - design
  "🎬", // clapper board - preview
  "📽️", // film projector - video
  "🎞️", // film frames - animation
  "📷", // camera - snapshot
  "🎥", // movie camera - recording
  "📹", // video camera - streaming
  "🔦", // flashlight - debugging
  "💎", // gem stone - optimization
  "🔑", // key - authentication
  "🗝️", // old key - legacy systems
  "📨", // incoming envelope - messages
  "✉️", // envelope - email
  "📫", // mailbox - inbox
  "📬", // mailbox with mail - notifications
  "📭", // mailbox with no mail - empty state
  "📮", // postbox - outbox
  "🗳️", // ballot box - voting/polling
  "✏️", // pencil - edit
  "📝", // memo - notes
  "📗", // green book - environment
  "📘", // blue book - blueprint
  "📙", // orange book - documentation
  "📓", // notebook - logging
  "📔", // notebook with decorative cover - styling
  "📒", // ledger - tracking
  "📕", // closed book - completed
  "🔖", // bookmark - saved
  "🏷️", // label - tagging
  "📐", // triangular ruler - measuring
  "📏", // straight ruler - alignment
  "✂️", // scissors - cut/crop
  "🖇️", // linked paperclips - connections
  "📍", // round pushpin - location
  "🗑️", // wastebasket - delete
  "🖲️", // trackball - navigation
  "🎮", // video game - gaming
  "🕹️", // joystick - control
  "🎲", // game die - random
  "🃏", // joker - wild card
  "🎴", // flower playing cards - patterns
  "🀄", // mahjong red dragon - complexity
  "🎯", // direct hit - target
  "🎱", // pool 8 ball - decision
  "🔮", // crystal ball - prediction
  "🎪", // circus tent - deployment
  "🎭", // performing arts - presentation
  "🖼️", // framed picture - preview
  "🎨", // artist palette - theme
  "🧵", // thread - connection
  "🧶", // yarn - dependency
  "📍", // round pushpin - location
  "💈", // barber pole - service
  "🎗️", // reminder ribbon - todo
  "🎟️", // admission tickets - access
  "🎫", // ticket - license
  "🎪", // circus tent - event
  "🎭", // performing arts - demo
  "🎨", // artist palette - design
  "🎬", // clapper board - preview
  "🎤", // microphone - voice
  "🎧", // headphone - audio
  "🎼", // musical score - sequence
  "🎹", // musical keyboard - input
  "🎷", // saxophone - jazz
  "🎺", // trumpet - announcement
  "🎸", // guitar - acoustic
  "🎻", // violin - classical
  "🥁", // drum - rhythm
  "🎯", // direct hit - target
  "🎳", // bowling - strike
  "🎮", // video game - gaming
];

// Curated list of rizz words
const slangWords = [
  // Original words
  "fanum",
  "ohio",
  "rizz",
  "rizzler",
  "gyatt",
  "ong",

  // Internet/Gaming terms
  "brain rot",
  "skibidi",
  "sigma",
  "sus",
  "noob",
  "yeet",
  "simp",
  "og",

  // Personality/Characteristics
  "mewing",
  "aura",
  "delulu",
  "savage",
  "pookie",
  "chad alpha",
  "chad",
  "alpha",
  "beta",
  "mog",

  // Common expressions
  "bruh",
  "salty",
  "ate",
  "zang",
  "bet",
  "lit",
  "low key",
  "bop",
  "ick",
  "cringe",
  "opp",
  "twin",
  "sheesh",
  "vibe",
  "bussin",
  "glaze",
  "dog water",
  "slay",
  "fam",
  "yapping",
  "yap",

  // Compound terms
  "skibidi ohio rizz",
  "skibidi rizz",
  "what the sigma",
  "fanum tax",
  "negative aura",
  "mad lit",
  "just put the fries in the bag",
  "hits different",

  // Truth/Lie related
  "cap",
  "no cap",

  // Style/Status
  "drip",
  "flex",
  "tea",
  "goat",
  "its giving",
];

// Function to generate emoji square
function generateEmojiSquare(size = 5) {
  const rowLength = size;
  const selectedEmojis = [];
  const availableEmojis = [...devEmojis];

  for (let row = 0; row < size; row++) {
    let currentRow = "";
    for (let col = 0; col < rowLength; col++) {
      // Pick random emoji from remaining available ones
      const randomIndex = Math.floor(Math.random() * availableEmojis.length);
      const emoji = availableEmojis[randomIndex];

      // Remove used emoji from available pool
      availableEmojis.splice(randomIndex, 1);

      currentRow += emoji + " ".repeat(4);
    }
    selectedEmojis.push(currentRow);
  }

  let square = "\nPick an emoji for your commit:\n\n";
  for (let i = 0; i < size; i++) {
    square += selectedEmojis[i] + "\n\n";
  }
  return square;
}

// Function to generate example rizz
function generateRizzExamples() {
  const examples = [
    "feat: no cap this update bussin fr fr ✨",
    "fix: bruh moment in the auth service 🐛",
    "docs: fam check this documentation update 📝",
    "style: added more drip to the UI 🎨",
    "refactor: ong cleaned up that spaghetti code ♻️",
  ];

  // Get 5 random slang words
  const shuffled = [...slangWords].sort(() => 0.5 - Math.random());
  const randomSlang = shuffled.slice(0, 5);

  return (
    examples.join("\n") +
    "\n\nSome rizzy terms you can use:\n" +
    randomSlang.join(", ")
  );
}

async function checkCommit() {
  // Read the commit message from the file
  const commitMsgFile = process.argv[2];
  const commitMsg = readFileSync(commitMsgFile, "utf8");
  const commitMsgLower = commitMsg.toLowerCase();

  // Check both conditions
  const hasEmoji = emojiRegex().test(commitMsg);
  const hasRizz = slangWords.some((word) =>
    commitMsgLower.includes(word.toLowerCase()),
  );

  let failed = false;

  // Check rizz first
  if (!hasRizz) {
    console.error("\x1b[31mError: Commit message has no rizz! 💀\x1b[0m");
    console.error("\nExample rizzy commits that would pass:\n");
    console.error(generateRizzExamples());
    console.error("\nMake it more rizzy and try again fr fr no cap");
    await playVideo("no_rizz.mp4");
    failed = true;
  }

  // Then check emoji
  if (!hasEmoji) {
    console.error(
      "\x1b[31mError: Commit message must include at least one emoji! 🚫\x1b[0m",
    );
    console.error(generateEmojiSquare());
    console.error("Example commit messages:");
    console.error(`❌ Fail: 'Add new feature'`);
    console.error(`✅ Pass: '✨ Add new feature'`);
    console.error("More examples:");
    console.error("✅ Pass: '🐛 Fix bug in login'");
    console.error("✅ Pass: '🎨 Update styles'");
    await playVideo("ganondorf_laugh.mp4");
    failed = true;
  }

  if (failed) {
    process.exit(1);
  }

  console.log("\x1b[32m✨ Sheesh! That commit message bussin fr fr\x1b[0m");
  await playVideo("wombo_combo.mp4");
  process.exit(0);
}

checkCommit().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});

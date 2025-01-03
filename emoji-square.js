#!/usr/bin/env node

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

// Define square size
const size = 6;
const rowLength = size;
const totalEmojis = size * rowLength;

// Get unique emojis by converting to Set and back to array
const uniqueEmojis = [...new Set(devEmojis)];

// Ensure we have enough unique emojis
if (totalEmojis > uniqueEmojis.length) {
  console.error(
    `Not enough unique emojis available. Need ${totalEmojis} but only have ${uniqueEmojis.length} unique emojis`,
  );
  process.exit(1);
}

// Get random emojis for the square
const selectedEmojis = [];
const availableEmojis = [...uniqueEmojis];

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

// Print the square with consistent spacing
console.log(" ".repeat(4));
console.log("Example Emojis:");
console.log(" ".repeat(4));

for (let i = 0; i < size; i++) {
  console.log(selectedEmojis[i]);
  console.log(); // Add blank line between rows
}
console.log(" ".repeat(4));

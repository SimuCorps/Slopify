import { rainbowCursor } from "https://unpkg.com/cursor-effects@latest/dist/esm.js";

const FLAGS = [
  ["#FE0000", "#FD8C00", "#FFE500", "#119F0B", "#0644B3", "#C22EDC"],
  ["#59C8F3", "#F2A6B5", "#fff", "#F2A6B5", "#59C8F3"],
];
let chosenFlag = FLAGS[Math.floor(Math.random() * FLAGS.length)];

new rainbowCursor({ colors: chosenFlag });

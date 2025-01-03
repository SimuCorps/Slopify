"use strict";

const coolVideo = () => {
  window.location = "https://youtu.be/dQw4w9WgXcQ";
};

// Konami Code Detection
const runOnKonami = (run) => {
  const KONAMI_KEYS = [
    "ArrowUp",
    "ArrowUp",
    "ArrowDown",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "ArrowLeft",
    "ArrowRight",
    "KeyB",
    "KeyA",
    "Enter",
  ];
  let currLevel = -1;
  document.addEventListener("keydown", (event) => {
    if (event.code === KONAMI_KEYS[currLevel + 1]) {
      currLevel++;
      if (currLevel === KONAMI_KEYS.length - 1) {
        run();
        currLevel = -1;
      }
    } else currLevel = -1;
  });
};

runOnKonami(coolVideo);

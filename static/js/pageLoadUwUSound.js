const audioElement = document.getElementById("pageLoadUwUSound");
document.addEventListener("DOMContentLoaded", () => {
  if (audioElement.paused) {
    audioElement.play().catch((error) => {
      console.error("Audio playback failed:", error);
    });
  }
});

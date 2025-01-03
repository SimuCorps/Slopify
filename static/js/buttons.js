const widenButton = document.getElementById("widenButton");
let widening = false;
let interval;

widenButton.addEventListener("click", () => {
  if (!widening) {
    widening = true;
    interval = setInterval(() => {
      let currentWidth = parseInt(window.getComputedStyle(widenButton).width);
      widenButton.style.width = currentWidth + 1 + "px";
    }, 10);
  } else {
    widening = false;
    clearInterval(interval);
  }
});

const lengthenButton = document.getElementById("lengthenButton");
let lengthening = false;
let lengthenInterval;

lengthenButton.addEventListener("click", () => {
  if (!lengthening) {
    lengthening = true;
    lengthenInterval = setInterval(() => {
      let currentHeight = parseInt(
        window.getComputedStyle(lengthenButton).height,
      );
      lengthenButton.style.height = currentHeight + 1 + "px";
    }, 10);
  } else {
    lengthening = false;
    clearInterval(lengthenInterval);
  }
});

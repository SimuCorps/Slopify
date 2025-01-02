document.addEventListener("DOMContentLoaded", function () {
  const goat = document.querySelector(".bouncing-rotating-image");
  let x = Math.random() * (window.innerWidth - 100);
  let y = Math.random() * (window.innerHeight - 100);
  let dx = 8;
  let dy = 8;
  function moveGoat() {
    const rect = goat.getBoundingClientRect();
    if (rect.right >= window.innerWidth || rect.left <= 0) {
      dx = -dx;
    }
    if (rect.bottom >= window.innerHeight || rect.top <= 0) {
      dy = -dy;
    }
    x += dx;
    y += dy;
    goat.style.left = `${x}px`;
    goat.style.top = `${y}px`;
    requestAnimationFrame(moveGoat);
  }
  goat.style.left = `${x}px`;
  goat.style.top = `${y}px`;
  moveGoat();
});

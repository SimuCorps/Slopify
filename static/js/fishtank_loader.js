document.addEventListener("DOMContentLoaded", function () {
  const container = document.querySelector(".fishtank-container");

  function initFishtank() {
    const projectTank = new FishTank("main-fishtank", {
      fishCount: 8,
      minSpeed: 0.3,
      maxSpeed: 1.5,
      buffer: 50,
    });
    projectTank.initialize();

    // Remove placeholder after initialization
    const placeholder = container.querySelector(".fishtank-placeholder");
    if (placeholder) {
      placeholder.style.opacity = "0";
      setTimeout(() => placeholder.remove(), 300);
    }
  }

  initFishtank();

  // Handle window resize
  window.addEventListener("resize", () => {
    const width = container.clientWidth;
    const canvas = document.getElementById("main-fishtank");
    canvas.width = width;
    canvas.height = width < 480 ? 250 : width < 768 ? 300 : 400;
  });
});

function handleAnimationEnd(event) {
  if (event.animationName === "fadeOut") {
    const link = document.getElementById("poeskatLink");
    link.style.pointerEvents = "none";
    setTimeout(() => {
      link.remove();
    }, 100); // Small delay to ensure the animation is complete
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const img = document.getElementById("ripPoeskat-image");
  if (img) {
      img.addEventListener("animationend", (event) => {
          handleAnimationEnd(event);
      });
  }
});
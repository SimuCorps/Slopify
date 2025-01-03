function handleAnimationEnd(event) {
  if (event.animationName === "fadeOut") {
    const link = document.getElementById("poeskatLink");
    link.style.pointerEvents = "none";
    setTimeout(() => {
      link.remove();
    }, 100); // Small delay to ensure the animation is complete
  }
}

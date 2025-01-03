/* Intensifies the page by adding a mouseover that shakes the target */
document.addEventListener("mouseover", (event) => {
  const target = event.target;

  target.classList.add("shake");

  // the animation can be retriggered on multiple mouseovers, it always cleans up after
  target.addEventListener(
    "animationend",
    () => {
      target.classList.remove("shake");
    },
    { once: true },
  );
});

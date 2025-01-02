function startAnimation(frames) {
  const frameRate = 50;
  let startTime = Date.now();

  function animate() {
    const elapsedTime = Date.now() - startTime;
    const frameIndex = Math.floor(elapsedTime / frameRate) % frames.length;

    console.clear();
    console.log(frames[frameIndex]);

    if (elapsedTime < frames.length * frameRate) {
      requestAnimationFrame(animate);
    }
  }

  animate();
}

fetch("static/text/play.txt")
  .then((response) => response.text())
  .then((frameData) => {
    const frames = frameData.split("SPLIT");
    startAnimation(frames);
  })
  .catch((error) => console.error("Error loading play.txt:", error));

const dvdElement = document.getElementById("dvd-bounce");
const minSpeed = 0.2;
const maxSpeed = 4;
const dvdWidth = 500;
const dvdHeight = 250;
let dvdX = Math.random() * (window.innerWidth - dvdWidth);
let dvdY = Math.random() * (window.innerHeight - dvdHeight);
let directionX = minSpeed + Math.random() * (maxSpeed - minSpeed);
let directionY = minSpeed + Math.random() * (maxSpeed - minSpeed);

function moveDvd() {
  // Update position
  dvdX += directionX;
  dvdY += directionY;

  // Check for collisions with viewport edges
  if (dvdX <= 0 || dvdX >= window.innerWidth - dvdWidth) {
    directionX = -directionX;
    // Change speed on bounce and ensure it never hits exactly in the corner
    directionX =
      Math.sign(directionX) *
      (minSpeed + Math.random() * (maxSpeed - minSpeed));
    dvdY += Math.random() * 10 - 5;
  }
  if (dvdY <= 0 || dvdY >= window.innerHeight - dvdHeight) {
    directionY = -directionY;
    // Change speed on bounce and ensure it never hits exactly in the corner
    directionY =
      Math.sign(directionY) *
      (minSpeed + Math.random() * (maxSpeed - minSpeed));
    dvdX += Math.random() * 10 - 5;
  }

  // Keep within bounds
  dvdX = Math.max(0, Math.min(window.innerWidth - dvdWidth, dvdX));
  dvdY = Math.max(0, Math.min(window.innerHeight - dvdHeight, dvdY));

  // Apply position
  dvdElement.style.transform = `translate(${dvdX}px, ${dvdY}px)`;
  requestAnimationFrame(moveDvd);
}

// Start the animation
requestAnimationFrame(moveDvd);

// Handle window resize
window.addEventListener("resize", () => {
  // Ensure both width and height stay within bounds on resize
  dvdX = Math.min(dvdX, window.innerWidth - dvdWidth);
  dvdY = Math.min(dvdY, window.innerHeight - dvdHeight);
});

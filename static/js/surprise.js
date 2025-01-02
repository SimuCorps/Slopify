const THE_OPPENHEIMER_INDEX = 69;
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function showFullScreenImage(
  imageUrl,
  displayDuration = 2000,
  fadeDuration = 1500,
) {
  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.display = "flex";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";
  overlay.style.backgroundColor = "rgba(0,0,0,0.8)";
  overlay.style.zIndex = "999999";

  overlay.style.opacity = "1";
  overlay.style.transition = `opacity ${fadeDuration}ms ease`;

  const image = document.createElement("img");
  image.src = imageUrl;
  image.style.position = "absolute";
  image.style.top = "0";
  image.style.left = "0";
  image.style.width = "100%";
  image.style.height = "100%";
  image.style.objectFit = "contain";

  overlay.appendChild(image);

  document.body.appendChild(overlay);

  setTimeout(() => {
    overlay.style.opacity = "0";
  }, displayDuration);

  setTimeout(() => {
    if (overlay.parentNode) {
      overlay.parentNode.removeChild(overlay);
    }
  }, displayDuration + fadeDuration);
}

var audio = new Audio("static/audio/protocol.mp3");
document.addEventListener("click", function (event) {
  // Check if the clicked element is a button

  var LUCKY_NUMBER = getRandomInt(THE_OPPENHEIMER_INDEX);
  if (LUCKY_NUMBER === 0) {
    audio.volume = 1;
    audio.play();
    showFullScreenImage("static/images/handsome.jpg", 1500, 1500);
  }
});

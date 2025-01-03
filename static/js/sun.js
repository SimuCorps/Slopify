/* some variables */
const sunBtn = document.getElementById("sunBtn");
const sunSect = document.getElementById("sun");
const noSound = new Audio("./static/audio/no.mp3");
const deadlySound = new Audio("./static/audio/deadly.mp3");

const whyBtn = document.createElement("button");
whyBtn.textContent = "why?";
whyBtn.id = "whyBtn";
whyBtn.type = "button";

/* when clicked */
sunBtn.addEventListener("click", () => {
  noSound.play();
  sunBtn.insertAdjacentElement("afterend", whyBtn);
});

/* just making the flashbang :3 */
const overlay = document.createElement("div");
overlay.style.position = "fixed";
overlay.style.top = "0";
overlay.style.left = "0";
overlay.style.width = "100%";
overlay.style.height = "100%";
overlay.style.backgroundColor = "white";
overlay.style.opacity = "0";
overlay.style.pointerEvents = "none";
overlay.style.transition = "opacity 0.1s ease-in, opacity 2s ease-out";
overlay.style.zIndex = "9999";
document.body.appendChild(overlay);

const deadlyGif = document.createElement("img");
deadlyGif.src = "./static/images/deadly.gif";
deadlyGif.alt = "The sun is a deadly lazer!";
deadlyGif.style.position = "absolute";
deadlyGif.style.top = "0";
deadlyGif.style.left = "0";
deadlyGif.style.width = "100%";
deadlyGif.style.height = "100%";
deadlyGif.style.opacity = "0.9";
deadlyGif.style.objectFit = "cover";
overlay.appendChild(deadlyGif);

whyBtn.addEventListener("click", () => {
  deadlySound.play();
  overlay.style.opacity = "1";
  overlay.style.transition = "opacity 0.1s ease-in";

  setTimeout(() => {
    overlay.style.transition = "opacity 1.5s ease-out";
    overlay.style.opacity = "0";
  }, 200);
});

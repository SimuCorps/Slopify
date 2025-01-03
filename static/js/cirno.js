const cirno = document.querySelector(".cirno-img");
const bakaAudio = document.querySelector("#baka-sound");

cirno.addEventListener("click", () => {
  bakaAudio.currentTime = 0;
  bakaAudio.play();
});

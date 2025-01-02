const astolfoImg = document.getElementById("astolfoImg");
const astolfoBtn = document.getElementById("astolfoBtn");

// Current number of astolfo images.
// If you want to add more images please make sure they are jpg images and update this counter.
const N = 11;

let currentImgNumber = 1;

astolfoBtn.addEventListener("click", () => {
  astolfoImg.src = `static/images/astolfo/astolfo${currentImgNumber}.jpg`;

  if (currentImgNumber == N) {
    currentImgNumber = 1;
  } else {
    currentImgNumber++;
  }
});

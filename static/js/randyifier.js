var randyButton = document.getElementById("randyifier");
randyButton.addEventListener("click", function () {
  var allImages = document.querySelectorAll("img");
  allImages.forEach((element) => {
    var imageNames = ["badass", "dukenukem", "genderbent", "outside", "selfie"];
    var randomImageName =
      imageNames[Math.floor(Math.random() * imageNames.length)];
    element.src = `static/images/randypitchford/${randomImageName}.jpg`;
  });
});

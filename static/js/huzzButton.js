const huzzification = document.getElementById("huzzButton");

huzzification.addEventListener("click", () => {
  const newHuzz = document.createElement("button");
  newHuzz.textContent = "Huzz";
  newHuzz.addEventListener("click", () => {
    huzzification.parentNode.appendChild(newHuzz.cloneNode(true));
  });
  huzzification.parentNode.appendChild(newHuzz);
});

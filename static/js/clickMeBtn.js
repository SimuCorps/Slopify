const clickMeBtn = document.getElementById("clickme");
const clickMeBtnRect = clickMeBtn.getBoundingClientRect();
const clickMeBtnWidth = clickMeBtnRect.width;
const clickMeBtnHeight = clickMeBtnRect.height;

clickMeBtn.addEventListener("mouseover", function () {
  let newTop = Math.random() * (window.innerHeight - clickMeBtnHeight);
  let newRight = Math.random() * (window.innerWidth - clickMeBtnWidth);

  clickMeBtn.style.position = "fixed";
  clickMeBtn.style.top = `${newTop}px`;
  clickMeBtn.style.right = `${newRight}px`;
});

window.addEventListener("scroll", function () {
  clickMeBtn.style.position = "static";
});

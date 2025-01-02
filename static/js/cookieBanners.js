function dismissBanner(id) {
  document.getElementById(id).style.display = "none";
}

window.onload = function () {
  document.getElementById("cookie-banner1").style.display = "flex";
  document.getElementById("cookie-banner2").style.display = "flex";
  document.getElementById("cookie-banner3").style.display = "flex";
};

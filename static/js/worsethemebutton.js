const worseThemeButton = document.getElementById("worseThemeButton");
      document.addEventListener("DOMContentLoaded", () => {
        const worseThemeButton = document.getElementById("worseThemeButton");
        worseThemeButton.addEventListener("click", () => {
          document.body.classList.toggle("worst-theme");
          worseThemeButton.textContent = document.body.classList.contains("worst-theme") 
            ? "Fix The Page Please!!" 
            : "This can't get any worse, right?";
        });
      });

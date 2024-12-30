const lengthenButton = document.getElementById("lengthenButton");
          let lengthening = false;
          let lengthenInterval;

          lengthenButton.addEventListener("click", () => {
            if (!lengthening) {
              lengthening = true;
              lengthenInterval = setInterval(() => {
                let currentHeight = parseInt(window.getComputedStyle(lengthenButton).height);
                lengthenButton.style.height = (currentHeight + 1) + "px";
              }, 10);
            } else {
              lengthening = false;
              clearInterval(lengthenInterval);
            }
          });

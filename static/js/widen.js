const widenButton = document.getElementById("widenButton");
          let widening = false;
          let interval;
      
          widenButton.addEventListener("click", () => {
            if (!widening) {
              widening = true;
              interval = setInterval(() => {
                let currentWidth = parseInt(window.getComputedStyle(widenButton).width);
                widenButton.style.width = (currentWidth + 1) + "px";
              }, 10);
            } else {
              widening = false;
              clearInterval(interval);
            }
          });

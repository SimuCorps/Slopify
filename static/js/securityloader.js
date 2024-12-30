      document.addEventListener("DOMContentLoaded", () => {
        const security = new AnnoyingSecurity();
        const form = document.getElementById("registration-form");
        const captchaContainer = document.getElementById("captcha-container");
        const captchaPrompt = document.getElementById("captcha-prompt");
        const captchaContent = document.getElementById("captcha-content");
        const captchaInput = document.getElementById("captcha-input");
        const submitCaptchaButton = document.getElementById("submit-captcha");
        const skipSecurityButton = document.getElementById("skip-security"); // Add this line

        let currentCaptcha = security.generateMathCaptcha();
        captchaPrompt.textContent = currentCaptcha.question;
        captchaInput.style.display = "block";

        submitCaptchaButton.addEventListener("click", async () => {
          let isValid = false;

          switch (security.captchaCount) {
            case 0:
              isValid = Number(captchaInput.value) == currentCaptcha.answer;
              break;
            case 1:
              isValid =
                currentCaptcha.correctAnswers.every((answer) =>
                  currentCaptcha.selectedShapes.has(answer)
                ) &&
                currentCaptcha.selectedShapes.size ===
                  currentCaptcha.correctAnswers.length;
              break;
            case 2:
              isValid = captchaInput.value.trim().length > 0;
              break;
          }

          if (isValid) {
            security.showNotification("CAPTCHA passed!", "info");
            security.captchaCount++;

            if (security.captchaCount >= 3) {
              captchaContainer.style.display = "none";
              form.style.display = "flex";
              security.revealNextRequirement();
            } else {
              switch (security.captchaCount) {
                case 1:
                  currentCaptcha = security.generateImageCaptcha();
                  captchaPrompt.textContent = currentCaptcha.instructions;
                  captchaContent.innerHTML = currentCaptcha.svg;
                  captchaInput.style.display = "none";

                  const selectedShapes = new Set();
                  currentCaptcha.selectedShapes = selectedShapes;

                  document
                    .querySelectorAll(".captcha-shape")
                    .forEach((shape) => {
                      shape.onclick = (e) => {
                        const index = Number(
                          e.target.getAttribute("data-index")
                        );
                        if (selectedShapes.has(index)) {
                          selectedShapes.delete(index);
                          e.target.style.stroke = "";
                          e.target.style.strokeWidth = "";
                        } else {
                          selectedShapes.add(index);
                          e.target.style.stroke = "#fff";
                          e.target.style.strokeWidth = "2";
                        }
                      };
                    });
                  break;

                case 2:
                  currentCaptcha = security.generatePhilosophicalCaptcha();
                  captchaPrompt.textContent = currentCaptcha.question;
                  captchaContent.innerHTML = "";
                  captchaInput.style.display = "block";
                  break;
              }
              captchaInput.value = "";
            }
          } else {
            security.showNotification("Wrong answer! Try again.", "error");
            if (security.captchaCount === 1) {
              currentCaptcha.selectedShapes.clear();
              document.querySelectorAll(".captcha-shape").forEach((shape) => {
                shape.style.stroke = "";
                shape.style.strokeWidth = "";
              });
            }
          }
        });

        form.addEventListener("submit", async (e) => {
          e.preventDefault();
          const username = document.getElementById("username").value;
          const password = document.getElementById("password").value;

          const success = await security.register(username, password);
          if (success) {
            document.getElementById("security-overlay").style.display = "none";
          }
        });

        // Handle "Skip Security" button
        skipSecurityButton.addEventListener("click", () => {
          // Skip the security process by hiding the overlay and showing the registration form
          document.getElementById("security-overlay").style.display = "none";
          form.style.display = "flex";
        });
      });

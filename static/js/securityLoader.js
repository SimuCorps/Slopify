function playPrettyGoodVideo() {
  // First video container (pretty good)
  const videoContainer1 = document.createElement("div");
  videoContainer1.style.width = "30%";
  videoContainer1.style.position = "fixed";
  videoContainer1.style.right = "20px";
  videoContainer1.style.top = "50%";
  videoContainer1.style.transform = "translateY(-50%)";
  videoContainer1.style.zIndex = "999";
  videoContainer1.style.borderRadius = "8px";
  videoContainer1.style.overflow = "hidden";
  videoContainer1.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";

  const video1 = document.createElement("video");
  video1.src = "static/video/pretty_good.mp4";
  video1.style.width = "100%";
  video1.style.display = "block";

  videoContainer1.appendChild(video1);
  document.body.appendChild(videoContainer1);

  // Second video container (armstrong)
  const videoContainer2 = document.createElement("div");
  videoContainer2.style.width = "30%";
  videoContainer2.style.position = "fixed";
  videoContainer2.style.left = "20px";
  videoContainer2.style.top = "50%"; // Changed from bottom to top
  videoContainer2.style.transform = "translateY(-50%)"; // Added to center vertically
  videoContainer2.style.zIndex = "999";
  videoContainer2.style.borderRadius = "8px";
  videoContainer2.style.overflow = "hidden";
  videoContainer2.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
  videoContainer2.style.display = "none"; // Hide initially

  const video2 = document.createElement("video");
  video2.src = "static/video/armstrong.mp4";
  video2.style.width = "100%";
  video2.style.display = "block";

  videoContainer2.appendChild(video2);
  document.body.appendChild(videoContainer2);

  // Play first video immediately
  video1.play();

  // Play second video when first one ends
  video1.onended = () => {
    videoContainer1.remove();
    videoContainer2.style.display = "block"; // Show second video container
    video2.play();
  };

  // Remove second container when it ends
  video2.onended = () => {
    videoContainer2.remove();
  };
}

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
            currentCaptcha.selectedShapes.has(answer),
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

            document.querySelectorAll(".captcha-shape").forEach((shape) => {
              shape.onclick = (e) => {
                const index = Number(e.target.getAttribute("data-index"));
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
    document.getElementById("security-overlay").style.display = "none";
    playPrettyGoodVideo();
  });
});

    const epilepticAudio = new Audio("static/audio/bustin.mp3");
    epilepticAudio.loop = true; // Enable looping
  
    let isEpilepticModeOn = false;
    let spawnInterval;
    let spawnCount = 10; // Start with 10 images
  
    function spawnImage() {
      const img = document.createElement("img");
      img.src = "static/images/ray-parker-jr.webp";
      img.style.position = "absolute";
      img.style.width = "100px";
      img.style.height = "auto";
      img.style.left = Math.random() * window.innerWidth + "px";
      img.style.top = Math.random() * window.innerHeight + "px";
      img.style.transition = "transform 3s ease-in-out";
  
      document.body.appendChild(img);
  
      setTimeout(() => {
        img.style.transform = `translateY(-${window.innerHeight}px)`;
        setTimeout(() => img.remove(), 3000);
      }, 100);
    }
  
    document.getElementById("epicButton").addEventListener("click", () => {
      const images = document.querySelectorAll("img");
      if (isEpilepticModeOn) {
        document.body.classList.remove("epileptic-mode");
        epilepticAudio.pause();
        epilepticAudio.currentTime = 0;
        clearInterval(spawnInterval);
        images.forEach(img => {
          if (img.src.includes("/static/images/")) {
            img.src = img.dataset.originalSrc || img.src;
          }
        });
      } else {
        document.body.classList.add("epileptic-mode");
        epilepticAudio.volume = 1;
        epilepticAudio.play();
  
        spawnCount = 10; // Start with 10 images
        spawnInterval = setInterval(() => {
          spawnCount++;
          for (let i = 0; i < spawnCount; i++) {
            spawnImage();
          }
        }, 3000);
  
        images.forEach(img => {
          if (img.src.includes("/static/images/")) {
            img.dataset.originalSrc = img.src;
            img.src = "static/images/ray-parker-jr.webp";
          }
        });
      }
      isEpilepticModeOn = !isEpilepticModeOn;
    });

document.addEventListener("DOMContentLoaded", function() {
  const canvas = document.getElementById("flappyMuskCanvas");
  const ctx = canvas.getContext("2d");

  const gravity = 0.4;
  const jump = -10;
  const pipeWidth = 50;
  const pipeGap = 150;
  let gameOver = false;
  let gameStarted = false;
  let rainbowMode = false;

  const elonImage = new Image();
  elonImage.src = "static/images/elon_head.png";

  const bird = {
    x: 40,
    y: canvas.height / 2,
    width: 30,
    height: 30,
    velocity: 0,
  };

  let pipes = [];

  function createInitialPipes() {
    pipes = [];
    for (let i = 0; i < 3; i++) {
      const pipeX = canvas.width + i * 200;
      const pipeHeight = Math.floor(Math.random() * (canvas.height - pipeGap - 20)) + 10;
      pipes.push({ x: pipeX, top: pipeHeight, bottom: pipeHeight + pipeGap });
    }
  }

  function drawBird() {
    ctx.drawImage(elonImage, bird.x, bird.y, bird.width, bird.height);
  }

  function drawPipes() {
    pipes.forEach(pipe => {
      if (rainbowMode) {
        const gradient = ctx.createLinearGradient(pipe.x, 0, pipe.x + pipeWidth, 0);
        gradient.addColorStop(0, "red");
        gradient.addColorStop(0.2, "orange");
        gradient.addColorStop(0.4, "yellow");
        gradient.addColorStop(0.6, "green");
        gradient.addColorStop(0.8, "blue");
        gradient.addColorStop(1, "purple");
        ctx.fillStyle = gradient;
      } else {
        ctx.fillStyle = "#b8bb26";
      }
      // Top pipe
      ctx.fillRect(pipe.x, 0, pipeWidth, pipe.top);
      // Bottom pipe
      ctx.fillRect(pipe.x, pipe.bottom, pipeWidth, canvas.height - pipe.bottom);
    });
  }

  function updatePipes() {
    pipes.forEach(pipe => {
      pipe.x -= 2;
      if (pipe.x + pipeWidth < 0) {
        pipe.x = canvas.width;
        pipe.top = Math.floor(Math.random() * (canvas.height - pipeGap - 20)) + 10;
        pipe.bottom = pipe.top + pipeGap;
      }
    });
  }

  function checkCollision() {
    if (bird.y + bird.height >= canvas.height || bird.y <= 0) {
      return true;
    }
    return pipes.some(pipe => (
      bird.x + bird.width > pipe.x &&
      bird.x < pipe.x + pipeWidth &&
      (bird.y < pipe.top || bird.y + bird.height > pipe.bottom)
    ));
  }

  function resetGame() {
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    gameOver = false;
    gameStarted = false;
    createInitialPipes();
    gameLoop(); // Restart the game loop
  }

  function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawPipes();
    drawBird();

    if (gameStarted) {
      bird.velocity += gravity;
      bird.y += bird.velocity;
    }

    updatePipes();

    if (checkCollision()) {
      gameOver = true;
    }

    // Show Game Over
    if (gameOver) {
      ctx.fillStyle = "#ff0000";
      ctx.font = "24px Arial";
      ctx.textAlign = "center";
      const middleY = canvas.height / 2;

      ctx.fillText("Game Over!", canvas.width / 2, middleY - 20);
      ctx.fillText("Click or Press Space to Retard", canvas.width / 2, middleY + 20);
      return;
    }

    // Show "Click or Space to Start" message if the game hasn't started
    if (!gameStarted) {
      ctx.fillStyle = "#ffffff";
      ctx.font = "18px Arial";
      ctx.textAlign = "center";
      ctx.fillText("Click or Press Space to Start", canvas.width / 2, canvas.height / 2 - 40);
    }

    requestAnimationFrame(gameLoop);
  }

  function jumpAction() {
    if (gameOver) {
      resetGame();
    } else {
      if (!gameStarted) {
        gameStarted = true; // Start the game on the first action
      }
      bird.velocity = jump;
    }
  }

  function toggleRainbowMode() {
    rainbowMode = !rainbowMode;
  }

  canvas.addEventListener("click", jumpAction);

  document.addEventListener("keydown", function(e) {
    if (e.code === "Space") {
      e.preventDefault();
      jumpAction();
    }
  });

  document.getElementById("flappyMuskButton").addEventListener("click", toggleRainbowMode);

  elonImage.onload = () => {
    createInitialPipes();
    gameLoop();
  };
});
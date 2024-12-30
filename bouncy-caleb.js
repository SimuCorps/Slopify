const canvasRef = document.getElementById("caleb-canvas");
const ctx = canvasRef.getContext("2d");
let drawnObjects = [];

const canvasWidth = 800;
const canvasHeight = 600;
const calebNum = 4;
const calebWidth = 100;
const calebHeight = 100;
const calebMinSpeed = 10;
const calebMaxSpeed = 100;
const calebSplitNum = 2;
const calebStartingMass = 100;

function resizeCanvas() {
  canvasRef.width = canvasWidth;
  canvasRef.height = canvasHeight;
}

resizeCanvas();

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function isPointInRect(
  pointX,
  pointY,
  rectPosX,
  rectPosY,
  rectWidth,
  rectHeight,
) {
  return (
    rectPosX < pointX &&
    pointX < rectWidth &&
    rectPosY < pointY &&
    pointY < rectHeight
  );
}

function AABB(
  rect1PosX,
  rect1PosY,
  rect1Width,
  rect1Height,
  rect2PosX,
  rect2PosY,
  rect2Width,
  rect2Height,
) {
  return (
    rect1PosX < rect2Width &&
    rect1Width > rect2PosX &&
    rect1PosY < rect2Height &&
    rect1Height > rect2PosY
  );
}

function BouncyObject(imagePath, width = 100, height = 100) {
  this.img = new Image(width, height);
  this.img.src = imagePath;
  this.x = 0;
  this.y = 0;
  this.dx = 1;
  this.dy = 1;
  this.mass = calebStartingMass;
  this.width = width;
  this.height = height;
  this.rightSide = this.x + this.width;
  this.bottomSide = this.y + this.height;

  this.draw = () => {
    ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
  };

  this.img.onload = this.draw;

  this.checkCollisions = (delta) => {
    if (this.bottomSide > canvasRef.height) {
      this.dy *= -1;
      this.y = canvasRef.height - this.height;
    }
    if (this.rightSide > canvasRef.width) {
      this.dx *= -1;
      this.x = canvasRef.width - this.width;
    }
    if (this.x < 0) {
      this.dx *= -1;
      this.x = 0;
    }
    if (this.y < 0) {
      this.dy *= -1;
      this.y = 0;
    }

    let oldX = this.x - this.dx * delta;
    let oldY = this.y - this.dy * delta;

    drawnObjects
      .filter((ob) => ob != this)
      .forEach((ob) => {
        if (
          AABB(
            this.x,
            oldY,
            this.x + this.width,
            oldY + this.height,
            ob.x,
            ob.y,
            ob.x + ob.width,
            ob.y + ob.height,
          )
        ) {
          this.dx *= -1;
          ob.dx *= -1;
          this.x = oldX;
          return;
        }
        if (
          AABB(
            oldX,
            this.y,
            oldX + this.width,
            this.y + this.height,
            ob.x,
            ob.y,
            ob.x + ob.width,
            ob.y + ob.height,
          )
        ) {
          this.dy *= -1;
          ob.dy *= -1;
          this.y = oldY;
          return;
        }
      });
  };

  this.sussyCollisions = (delta) => {
    drawnObjects
      .filter((ob) => ob != this)
      .forEach((ob) => {
        if (
          AABB(
            this.x,
            this.y,
            this.x + this.width,
            this.y + this.height,
            ob.x,
            ob.y,
            ob.x + ob.width,
            ob.y + ob.height,
          )
        ) {
          objXAverage = (ob.x + ob.width) / 2;
          objYAverage = (ob.y + ob.height) / 2;
          selfXAverage = (self.x + self.width) / 2;
          selfYAverage = (self.y + self.height) / 2;
          let xDiff = objXAverage - selfXAverage;
          let yDiff = objYAverage - selfYAverage;

          if (Math.abs(xDiff) < Math.abs(yDiff)) {
            if (xDiff > 0) {
              this.dx *= -1;
              this.x = ob.x - objXAverage;
            } else {
              this.dx *= -1;
              this.x = ob.x + objXAverage;
            }
          } else {
            if (yDiff > 0) {
              this.dy *= -1;
              this.y = ob.y + objYAverage;
            } else {
              this.dy *= -1;
              this.y = ob.y - objYAverage;
            }
          }
        }
      });
    if (this.bottomSide > canvasRef.height) {
      this.dy *= -1;
      this.y = canvasRef.height - this.height;
    }
    if (this.rightSide > canvasRef.width) {
      this.dx *= -1;
      this.x = canvasRef.width - this.width;
    }
    if (this.x < 0) {
      this.dx *= -1;
      this.x = 0;
    }
    if (this.y < 0) {
      this.dy *= -1;
      this.y = 0;
    }
  };

  this.update = (delta) => {
    this.x += this.dx * delta;
    this.y += this.dy * delta;
    this.rightSide = this.x + this.width;
    this.bottomSide = this.y + this.height;
    this.checkCollisions(delta);

    this.draw();
  };
}

function init() {
  for (i = 0; i < calebNum; i++) {
    const randX = getRandomInt(canvasRef.width);
    const randY = getRandomInt(canvasRef.height);
    const caleb = new BouncyObject(
      "static/images/caleb.webp",
      calebWidth,
      calebHeight,
    );
    caleb.x = randX;
    caleb.y = randY;
    caleb.name = "Caleb" + i;
    caleb.dx = Math.random() * calebMaxSpeed + calebMinSpeed;
    caleb.dy = Math.random() * calebMaxSpeed + calebMinSpeed;

    if (getRandomInt(2) == 0) {
      caleb.dx *= -1;
    }
    if (getRandomInt(2) == 0) {
      caleb.dy *= -1;
    }
    drawnObjects.push(caleb);
  }

  canvasRef.onmousedown = (e) => {
    drawnObjects.forEach((obj) => {
      if (
        isPointInRect(
          e.offsetX,
          e.offsetY,
          obj.x,
          obj.y,
          obj.x + obj.width,
          obj.y + obj.height,
        )
      ) {
        drawnObjects = drawnObjects.filter((o) => o != obj);
        mitosis(obj);
      }
    });
  };
}

init();

let old = new Date().getTime();

function mitosis(obj) {
  for (i = 0; i < calebSplitNum; i++) {
    const caleb = new BouncyObject(
      "static/images/caleb.webp",
      obj.width / calebSplitNum,
      obj.height / calebSplitNum,
    );
    caleb.name = obj.name + ">" + i;
    caleb.x = obj.x;
    caleb.y = obj.y;
    caleb.dx = obj.dx;
    caleb.dy = obj.dy;
    drawnObjects.push(caleb);
  }
}

function update() {
  current = new Date().getTime();
  let delta = (current - old) / 1000;
  old = current;

  ctx.clearRect(0, 0, canvasRef.width, canvasRef.height);
  drawnObjects.forEach((obj) => {
    obj.update(delta);
  });
  requestAnimationFrame(update);
}

update();

/*
ORIGINAL oneko.js: https://github.com/adryd325/oneko.js
FORKED from this fork https://github.com/kyrie25/spicetify-oneko
MODIFIED BY KOSAN https://github.com/MegaKosan

-   Chucked out all the spicetify related stuff ironically lol
    Left click drag is the same as kyrie25's version
*   Moved sleeping to right-clicking
+   Double clicking now iterates through all the skin variants
*/

(async function oneko() {
  const nekoEl = document.createElement("div");
  let nekoPosX = window.innerWidth * 0.5,
    nekoPosY = window.innerHeight * 0.2,
    mousePosX = 0,
    mousePosY = 0,
    frameCount = 0,
    idleTime = 0,
    idleAnimation = null,
    idleAnimationFrame = 0,
    forceSleep = false,
    grabbing = false,
    grabStop = true,
    nudge = false,
    variant = "tora";

  function parseLocalStorage(key, fallback) {
    try {
      const value = localStorage.getItem(`oneko:${key}`);
      console.log(key, value);
      return typeof value === typeof fallback ? value : fallback;
    } catch (e) {
      console.error(e);
      return fallback;
    }
  }

  const nekoSpeed = 7,
    variants = [
      ["marisa_a", "Marisa Variant A"],
      ["dog", "Dog"],
      ["classic", "Classic"],
    ],
    spriteSets = {
      idle: [[-3, -3]],
      alert: [[-7, -3]],
      scratchSelf: [
        [-5, 0],
        [-6, 0],
        [-7, 0],
      ],
      scratchWallN: [
        [0, 0],
        [0, -1],
      ],
      scratchWallS: [
        [-7, -1],
        [-6, -2],
      ],
      scratchWallE: [
        [-2, -2],
        [-2, -3],
      ],
      scratchWallW: [
        [-4, 0],
        [-4, -1],
      ],
      tired: [[-3, -2]],
      sleeping: [
        [-2, 0],
        [-2, -1],
      ],
      N: [
        [-1, -2],
        [-1, -3],
      ],
      NE: [
        [0, -2],
        [0, -3],
      ],
      E: [
        [-3, 0],
        [-3, -1],
      ],
      SE: [
        [-5, -1],
        [-5, -2],
      ],
      S: [
        [-6, -3],
        [-7, -2],
      ],
      SW: [
        [-5, -3],
        [-6, -1],
      ],
      W: [
        [-4, -2],
        [-4, -3],
      ],
      NW: [
        [-1, 0],
        [-1, -1],
      ],
    }, // Get keys with 2 or more sprites
    keys = Object.keys(spriteSets).filter((key) => spriteSets[key].length > 1),
    usedKeys = new Set();

  function create() {
    variant = parseLocalStorage("variant", "marisa_a");

    if (!variants.some((v) => v[0] === variant)) {
      variant = "marisa_a";
    }

    nekoEl.id = "oneko";
    nekoEl.style.width = "32px";
    nekoEl.style.height = "32px";
    nekoEl.style.position = "fixed";
    // nekoEl.style.pointerEvents = "none";
    nekoEl.style.backgroundImage = `url('static/images/oneko/oneko-${variant}.png')`;
    nekoEl.style.imageRendering = "pixelated";
    nekoEl.style.left = `${nekoPosX - 16}px`;
    nekoEl.style.top = `${nekoPosY - 16}px`;
    //nekoEl.style.zIndex = "99";

    document.body.appendChild(nekoEl);

    window.addEventListener("mousemove", (e) => {
      if (forceSleep) return;

      mousePosX = e.clientX;
      mousePosY = e.clientY;
    });

    window.addEventListener("resize", () => {
      if (!forceSleep) return;
      // If neko is outside the window and is forced to sleep, wake her up
      if (
        nekoPosX - window.innerWidth > 32 ||
        nekoPosY - window.innerHeight > 32 ||
        // Also when she is about to go outside the window
        mousePosX - window.innerWidth > 32 ||
        mousePosY - window.innerHeight > 32
      ) {
        forceSleep = false;
        resetIdleAnimation();
      }
    });

    // Handle dragging of the cat
    nekoEl.addEventListener("mousedown", (e) => {
      if (e.button !== 0) return;
      grabbing = true;
      e.preventDefault();
      let startX = e.clientX;
      let startY = e.clientY;
      let startNekoX = nekoPosX;
      let startNekoY = nekoPosY;
      let grabInterval;

      const mousemove = (e) => {
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        const absDeltaX = Math.abs(deltaX);
        const absDeltaY = Math.abs(deltaY);

        // Scratch in the opposite direction of the drag
        if (absDeltaX > absDeltaY && absDeltaX > 10) {
          setSprite(deltaX > 0 ? "scratchWallW" : "scratchWallE", frameCount);
        } else if (absDeltaY > absDeltaX && absDeltaY > 10) {
          setSprite(deltaY > 0 ? "scratchWallN" : "scratchWallS", frameCount);
        }

        if (
          grabStop ||
          absDeltaX > 10 ||
          absDeltaY > 10 ||
          Math.sqrt(deltaX ** 2 + deltaY ** 2) > 10
        ) {
          grabStop = false;
          clearTimeout(grabInterval);
          grabInterval = setTimeout(() => {
            grabStop = true;
            nudge = false;
            startX = e.clientX;
            startY = e.clientY;
            startNekoX = nekoPosX;
            startNekoY = nekoPosY;
          }, 150);
        }

        nekoPosX = startNekoX + e.clientX - startX;
        nekoPosY = startNekoY + e.clientY - startY;
        nekoEl.style.left = `${nekoPosX - 16}px`;
        nekoEl.style.top = `${nekoPosY - 16}px`;
      };

      const mouseup = () => {
        grabbing = false;
        nudge = true;
        resetIdleAnimation();
        window.removeEventListener("mousemove", mousemove);
        window.removeEventListener("mouseup", mouseup);
      };

      window.addEventListener("mousemove", mousemove);
      window.addEventListener("mouseup", mouseup);
    });

    //Double Click to go through skins
    nekoEl.addEventListener("dblclick", (e) => {
      e.preventDefault();

      let activeVariantIndex = -1; // Default index if not found, it iterates up to default or 0

      // Iterate through the variants array to find the index of the active variant
      for (let i = 0; i < variants.length; i++) {
        //console.log("PASS "+i+"| Variant in array: " + variants[i][0]);
        //console.log("Variant in localStorage: " + localStorage.getItem('oneko:variant'));
        //console.log("Comparing:", variants[i][0], "===", localStorage.getItem('oneko:variant'));
        if (variants[i][0] == localStorage.getItem("oneko:variant")) {
          //console.log("BREAKING THA LOOP");
          activeVariantIndex = i; // Update the index if found
          break; // Exit the loop once found
        }
      }

      if (activeVariantIndex + 1 < variants.length) {
        setVariant(variants[activeVariantIndex + 1]);
      } else {
        setVariant(variants[0]);
      }

    });

    //Right click for force-sleep
    nekoEl.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      forceSleep = !forceSleep;
      nudge = false;
      if (!forceSleep) {
        resetIdleAnimation();
        return;
      }
    });

    window.onekoInterval = setInterval(frame, 100);
  }

  function getSprite(name, frame) {
    return spriteSets[name][frame % spriteSets[name].length];
  }

  function setSprite(name, frame) {
    const sprite = getSprite(name, frame);
    nekoEl.style.backgroundPosition = `${sprite[0] * 32}px ${sprite[1] * 32}px`;
  }

  function resetIdleAnimation() {
    idleAnimation = null;
    idleAnimationFrame = 0;
  }

  function idle() {
    idleTime += 1;

    // every ~ 20 seconds
    if (
      idleTime > 10 &&
      Math.floor(Math.random() * 200) == 0 &&
      idleAnimation == null
    ) {
      let avalibleIdleAnimations = ["sleeping", "scratchSelf"];

      if (nekoPosX < 32) {
        avalibleIdleAnimations.push("scratchWallW");
      }
      if (nekoPosY < 32) {
        avalibleIdleAnimations.push("scratchWallN");
      }
      if (nekoPosX > window.innerWidth - 32) {
        avalibleIdleAnimations.push("scratchWallE");
      }
      if (nekoPosY > window.innerHeight - 32) {
        avalibleIdleAnimations.push("scratchWallS");
      }
      idleAnimation =
        avalibleIdleAnimations[
          Math.floor(Math.random() * avalibleIdleAnimations.length)
          ];
    }

    if (forceSleep) {
      avalibleIdleAnimations = ["sleeping"];
      idleAnimation = "sleeping";
    }

    switch (idleAnimation) {
      case "sleeping":
        if (idleAnimationFrame < 8 && nudge && forceSleep) {
          setSprite("idle", 0);
          break;
        } else if (nudge) {
          nudge = false;
          resetIdleAnimation();
        }
        if (idleAnimationFrame < 8) {
          setSprite("tired", 0);
          break;
        }
        setSprite("sleeping", Math.floor(idleAnimationFrame / 4));
        if (idleAnimationFrame > 192 && !forceSleep) {
          resetIdleAnimation();
        }
        break;
      case "scratchWallN":
      case "scratchWallS":
      case "scratchWallE":
      case "scratchWallW":
      case "scratchSelf":
        setSprite(idleAnimation, idleAnimationFrame);
        if (idleAnimationFrame > 9) {
          resetIdleAnimation();
        }
        break;
      default:
        setSprite("idle", 0);
        return;
    }
    idleAnimationFrame += 1;
  }

  function frame() {
    frameCount += 1;

    if (grabbing) {
      grabStop && setSprite("alert", 0);
      return;
    }

    const diffX = nekoPosX - mousePosX;
    const diffY = nekoPosY - mousePosY;
    const distance = Math.sqrt(diffX ** 2 + diffY ** 2);

    // Cat has to sleep on top of the progress bar
    if (
      forceSleep &&
      Math.abs(diffY) < nekoSpeed &&
      Math.abs(diffX) < nekoSpeed
    ) {
      // Make the cat sleep exactly on the top of the progress bar
      nekoPosX = mousePosX;
      nekoPosY = mousePosY;
      nekoEl.style.left = `${nekoPosX - 16}px`;
      nekoEl.style.top = `${nekoPosY - 16}px`;

      idle();
      return;
    }

    if ((distance < nekoSpeed || distance < 48) && !forceSleep) {
      idle();
      return;
    }

    idleAnimation = null;
    idleAnimationFrame = 0;

    if (idleTime > 1) {
      setSprite("alert", 0);
      // count down after being alerted before moving
      idleTime = Math.min(idleTime, 7);
      idleTime -= 1;
      return;
    }

    direction = diffY / distance > 0.5 ? "N" : "";
    direction += diffY / distance < -0.5 ? "S" : "";
    direction += diffX / distance > 0.5 ? "W" : "";
    direction += diffX / distance < -0.5 ? "E" : "";
    setSprite(direction, frameCount);

    nekoPosX -= (diffX / distance) * nekoSpeed;
    nekoPosY -= (diffY / distance) * nekoSpeed;

    nekoPosX = Math.min(Math.max(16, nekoPosX), window.innerWidth - 16);
    nekoPosY = Math.min(Math.max(16, nekoPosY), window.innerHeight - 16);

    nekoEl.style.left = `${nekoPosX - 16}px`;
    nekoEl.style.top = `${nekoPosY - 16}px`;
  }

  create();

  function getRandomSprite() {
    let unusedKeys = keys.filter((key) => !usedKeys.has(key));
    if (unusedKeys.length === 0) {
      usedKeys.clear();
      unusedKeys = keys;
    }
    const index = Math.floor(Math.random() * unusedKeys.length);
    const key = unusedKeys[index];
    usedKeys.add(key);
    return [getSprite(key, 0), getSprite(key, 1)];
  }

  function setVariant(arr) {
    console.log("Setting oneko variant to: " + arr[1]);

    variant = arr[0];
    localStorage.setItem("oneko:variant", `${variant}`);
    nekoEl.style.backgroundImage = `url('static/images/oneko/oneko-${variant}.png')`;
  }

})();

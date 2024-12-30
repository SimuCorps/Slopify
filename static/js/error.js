window.addEventListener("DOMContentLoaded", () => {
  const system = new Windows95("body");
});

class Windows95 {
  cursorDragPos = null;
  errorDragging = null;
  errorLimit = 50;
  errors = [];
  sound = {
    chord: new Howl({
      src: ["static/audio/chord.wav"],
      autoplay: false,
      loop: false,
      volume: 1.0,
    }),
  };

  constructor(el) {
    this.el = document.querySelector(el);
    this.el?.addEventListener("click", this.errorLoop.bind(this));
    this.el?.addEventListener("keyup", this.errorLoop.bind(this));
    this.el?.addEventListener("mousedown", this.dragErrorStart.bind(this));
    this.el?.addEventListener("touchstart", this.dragErrorStart.bind(this));
    this.el?.addEventListener("mousemove", this.dragError.bind(this));
    this.el?.addEventListener("touchmove", this.dragError.bind(this));
    this.el?.addEventListener("mouseup", this.dragErrorEnd.bind(this));
    this.el?.addEventListener("mouseleave", this.dragErrorEnd.bind(this));
    this.el?.addEventListener("contextmenu", this.dragErrorEnd.bind(this));
    this.el?.addEventListener("touchend", this.dragErrorEnd.bind(this));
    this.spawnError(0, 0, true);
  }

  async errorLoop(e) {
    const { code, target } = e;

    if (code === "Enter" || code === "NumpadEnter" || (!code && target?.hasAttribute("data-ok"))) {
      const activeError = this.errors.find(error => error.id === target?.getAttribute("data-ok") || error.active);
      if (activeError) {
        activeError.close();
        this.errors = this.errors.filter(error => !error.isClosing);
        this.errors[this.errors.length - 1]?.activate();
        let spawns = Utils.randomInt(this.errors.length ? 0 : 1, 5);
        let overLimit = (this.errors.length + spawns) - this.errorLimit;
        if (overLimit > 0) spawns = this.errorLimit - this.errors.length;
        for (let s = 0; s < spawns; ++s) {
          await new Promise((res) => setTimeout(res, 100));
          if (this.errors.length) this.spawnError();
          else this.spawnError(0, 0);
        }
      }
    } else if (!code) {
      this.switchError(e);
    }
  }

  dragError(e) {
    if (this.errorDragging) {
      let moveX = 0;
      let moveY = 0;
      if (e.touches?.length) {
        const [touch] = e.touches;
        moveX = touch.clientX - this.cursorDragPos.x;
        moveY = touch.clientY - this.cursorDragPos.y;
        this.errorDragging.moveBy(moveX, moveY);
        this.cursorDragPos.x = touch.clientX;
        this.cursorDragPos.y = touch.clientY;
      } else {
        moveX = e.clientX - this.cursorDragPos.x;
        moveY = e.clientY - this.cursorDragPos.y;
        this.errorDragging.moveBy(moveX, moveY);
        this.cursorDragPos.x = e.clientX;
        this.cursorDragPos.y = e.clientY;
      }
    }
  }

  dragErrorStart(e) {
    let { target } = e;
    if (target?.nodeName !== "BUTTON") {
      let headerFound = false;
      do {
        headerFound = target?.hasAttribute("data-header");
        target = target?.parentElement;
      } while (target && !headerFound);
      if (headerFound) {
        this.errorDragging = this.errors.find(error => error.el.id === target.id);
        this.switchError(e);
        if (e.touches?.length) {
          const [touch] = e.touches;
          this.cursorDragPos = { x: touch.clientX, y: touch.clientY };
        } else {
          this.cursorDragPos = { x: e.clientX, y: e.clientY };
        }
      }
    }
  }

  dragErrorEnd() {
    this.cursorDragPos = null;
    this.errorDragging = null;
  }

  spawnError(x, y, muted) {
    this.errors.forEach(error => {
      error.deactivate();
    });
    this.errors.push(new Windows95Error(this.el, x, y));
    if (!muted) this.sound.chord.play();
  }

  switchError(e) {
    this.errors.find(error => error.active)?.deactivate();
    let { target } = e;
    do {
      target = target?.parentElement;
    } while (target && !target?.hasAttribute("data-window"));
    if (target) {
      const errorFound = this.errors.find(error => error.el.id === target.id);
      if (errorFound) {
        this.errors.push(this.errors.splice(this.errors.indexOf(errorFound), 1)[0]);
        this.errors[this.errors.length - 1]?.activate();
      }
    }
  }
}

class Windows95Error {
  activeClass = "window--active";
  active = false;
  el = null;
  id = Utils.randomInt().toString(16);
  isClosing = false;
  x = 0;
  y = 0;

  constructor(parentEl, x, y) {
    this.parent = parentEl;
    const windowEls = Array.from(this.parent.querySelectorAll("[data-window]"));
    const windowNew = windowEls[windowEls.length - 1]?.cloneNode(true);
    if (this.parent && windowNew) {
      this.el = windowNew;
      this.parent.appendChild(windowNew);
      windowNew.id = `error-${this.id}`;
      windowNew.hidden = false;
      windowNew.querySelector("[data-desc]").textContent = this.errorMessage;
      const halfElWidth = Math.round(this.parent.offsetWidth / 2);
      const halfElHeight = Math.round(this.parent.offsetHeight / 2);
      const halfWinWidth = Math.round(windowNew.offsetWidth / 2);
      const halfWinHeight = Math.round(windowNew.offsetHeight / 2);
      if (x === undefined) this.x = Utils.randomInt(-halfElWidth + halfWinWidth, halfElWidth - halfWinWidth);
      else this.x = x;
      if (y === undefined) this.y = Utils.randomInt(-halfElHeight + halfWinHeight, halfElHeight - halfWinHeight);
      else this.y = y;
      const label = `error-label-${this.id}`;
      const desc = `error-desc-${this.id}`;
      windowNew.setAttribute("aria-labelledby", label);
      windowNew.setAttribute("aria-describedby", desc);
      windowNew.querySelector("[data-label]").id = label;
      windowNew.querySelector("[data-desc]").id = desc;
      windowNew.querySelector("[data-ok]").setAttribute("data-ok", this.id);
      windowNew.style.left = `calc(50% - ${halfWinWidth}px)`;
      windowNew.style.transform = `translate(${this.x}px,${this.y}px)`;
      this.activate();
    }
  }

  get errorMessage() {
    const errorList = [
      "You need to lock in",
      "Did you try turning it off and on again?",
      "What the sigma",
      "Say 'On Skibidi' to fix this",
      "Click OK to fix this error",
      "You're cooked",
      "Please try again",
      "Just give up",
      "Did you lock in yet?",
      "You made a mistake",
      "uhhhh",
      "whar 💀",
      "It comes tuah point",
      "SUCCess",
      "Bruh Moment™",
      "RAHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH",
      "???????????????????",
      "FWÆH",
      "This is illegal: The feds have been informed and are on their way",
      "You're in danger...",
      "You disrespected the frog, now you must pay.",
      "WINDOWS ME HAS BEEN INSTALLED, PREPARE FOR THE WORST",
    ];
    return errorList[Utils.randomInt(0, errorList.length - 1)];
  }

  activate() {
    this.el.classList.add(this.activeClass);
    this.el.setAttribute("aria-hidden", false);
    this.active = true;
    this.parent.appendChild(this.el);
  }

  deactivate() {
    this.el.classList.remove(this.activeClass);
    this.el.setAttribute("aria-hidden", true);
    this.active = false;
  }

  close() {
    this.deactivate();
    this.parent.removeChild(this.el);
    this.isClosing = true;
  }

  moveBy(x, y) {
    this.x += x;
    this.y += y;
    this.el.style.transform = `translate(${this.x}px,${this.y}px)`;
  }
}

class Utils {
  static randomInt(min = 0, max = 2 ** 32) {
    const percent = crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32;
    const relativeValue = (max - min) * percent;
    return min + Math.round(relativeValue);
  }
}
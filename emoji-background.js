class EmojiBackground {
  constructor() {
    this.emojis = [];
    this.emojiElements = [];
    this.container = document.createElement("div");
    this.container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            pointer-events: none;
            z-index: -1;
            overflow: hidden;
        `;
    document.body.appendChild(this.container);
    this.initialize();
  }

  async initialize() {
    await this.loadEmojis();
    this.createEmojis();
    this.animate();
  }

  async loadEmojis() {
    try {
      const response = await fetch("all-emojis.txt");
      const text = await response.text();
      // Split by newlines and filter out empty lines
      this.emojis = text.split("\n").filter((emoji) => emoji.trim());

      if (this.emojis.length === 0) {
        throw new Error("No emojis loaded");
      }
    } catch (error) {
      console.error("Error loading emojis:", error);
      // Fallback emojis in case the file can't be loaded
      this.emojis = [
        "😀",
        "😃",
        "😄",
        "😁",
        "😆",
        "😅",
        "😂",
        "🤣",
        "🥲",
        "🥹",
        "☺️",
      ];
    }
  }

  createEmoji() {
    const emoji = document.createElement("div");
    const randomEmoji =
      this.emojis[Math.floor(Math.random() * this.emojis.length)];

    emoji.textContent = randomEmoji;
    emoji.style.cssText = `
            position: absolute;
            font-size: ${20 + Math.random() * 30}px;
            opacity: ${0.3 + Math.random() * 0.7};
            transform: rotate(${Math.random() * 360}deg);
            user-select: none;
        `;

    // Start position (right side of screen, random height)
    emoji.style.left = "100%";
    emoji.style.top = `${Math.random() * 100}%`;

    // Animation properties
    emoji.speedX = 1 + Math.random() * 2;
    emoji.speedY = (Math.random() - 0.5) * 0.5;
    emoji.rotation = (Math.random() - 0.5) * 2;

    this.container.appendChild(emoji);
    this.emojiElements.push(emoji);

    return emoji;
  }

  createEmojis() {
    // Create initial set of emojis
    for (let i = 0; i < 20; i++) {
      const emoji = this.createEmoji();
      // Distribute initial positions across the screen
      emoji.style.left = `${Math.random() * 100}%`;
    }
  }

  animate() {
    const updateEmoji = (emoji) => {
      const rect = emoji.getBoundingClientRect();
      const left = parseFloat(emoji.style.left);
      const top = parseFloat(emoji.style.top);
      const rotation =
        parseFloat(emoji.style.transform.replace(/[^0-9-]+/g, "")) || 0;

      // Update position
      emoji.style.left = `${left - emoji.speedX}%`;
      emoji.style.top = `${top + emoji.speedY}%`;
      emoji.style.transform = `rotate(${rotation + emoji.rotation}deg)`;

      // If emoji is off screen, reset it
      if (rect.right < 0) {
        emoji.style.left = "100%";
        emoji.style.top = `${Math.random() * 100}%`;
      }
    };

    const animate = () => {
      this.emojiElements.forEach(updateEmoji);
      requestAnimationFrame(animate);
    };

    animate();
  }
}

// Initialize the emoji background
window.addEventListener("DOMContentLoaded", () => {
  new EmojiBackground();
});

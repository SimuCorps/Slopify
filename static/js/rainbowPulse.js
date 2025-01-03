function rainbowPulse() {
  const hue0 = (Date.now() / 10) % 360;
  const hue2 = (hue0 + 250) % 360;
  document.body.style.background = `linear-gradient(90deg, hsl(${hue0}, 70%, 20%), hsl(${hue2}, 70%, 30%))`;
  requestAnimationFrame(rainbowPulse);
}

rainbowPulse();

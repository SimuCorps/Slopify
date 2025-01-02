window.addEventListener("DOMContentLoaded", () => {
  const hellProtection = new HellProtection();
  hellProtection.activate();
});

class HellProtection {
  activate() {
    // do not read out loud
    const forbiddenActionWordRegex = /([Ss]+[Ee]+[Xx]+)/g;

    const goodActionsList = [
      "praying",
      "singing together",
      "walk",
      "hug (not too close)",
      "help people in need",
      "thinking about god(s)",
      // feel free to add more, but make them god-friendly though!!!
    ];

    const inputs = document.querySelectorAll("input");

    inputs.forEach((input) => {
      input.addEventListener("keyup", (event) => {
        const checkedValue = event.currentTarget.value;

        if (checkedValue.match(forbiddenActionWordRegex)) {
          const selectedGoodAction =
            goodActionsList[Math.floor(Math.random() * goodActionsList.length)];

          event.currentTarget.value = checkedValue.replace(
            forbiddenActionWordRegex,
            selectedGoodAction,
          );
        }
      });
    });
  }
}

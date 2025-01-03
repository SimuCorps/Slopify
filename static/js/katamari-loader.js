// Wait for Katamari iframe to be ready
window.addEventListener("message", function (event) {
  if (event.data.type === "KATAMARI_READY") {
    // Collect interesting DOM elements
    const elements = document.querySelectorAll(
      "div:not(.katamari-container), p, img, h1, h2, h3, button",
    );
    const elementData = Array.from(elements).map((el) => ({
      html: el.outerHTML,
      style: window.getComputedStyle(el).cssText,
    }));

    // Send elements to Katamari iframe
    document.getElementById("katamariFrame").contentWindow.postMessage(
      {
        type: "INJECT_ELEMENTS",
        elements: elementData,
      },
      "*",
    );
  }
});

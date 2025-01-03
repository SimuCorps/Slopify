(function () {
  const script = document.createElement("script");
  script.src = "/rightad.js";
  script.onload = () => {};
  script.onerror = () => {
    const modal = document.createElement("div");
    modal.id = "ads-blocked-modal";
    Object.assign(modal.style, {
      position: "fixed",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      color: "white",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: "1000",
      flexDirection: "column",
      textAlign: "center",
      overflow: "hidden",
    });

    const message = document.createElement("div");
    message.innerText =
      "Please turn off your ad blocker to continue using this site.\nBy using this site, you agree that we can track your every move and remotely operate your appliances.\nIf you do not agree, you can use the close button to ignore this message.";
    message.style.fontSize = "24px";
    message.style.marginBottom = "20px";
    modal.appendChild(message);

    const gif = document.createElement("img");
    gif.src = "/blocked.gif";
    gif.alt = "Blocked";
    Object.assign(gif.style, {
      width: "200px",
      height: "200px",
      marginBottom: "20px",
    });
    modal.appendChild(gif);

    const closeButton = document.createElement("button");
    closeButton.innerText = "Close";
    Object.assign(closeButton.style, {
      padding: "10px 20px",
      fontSize: "18px",
      cursor: "pointer",
      position: "absolute",
    });

    modal.appendChild(closeButton);
    document.body.appendChild(modal);

    let posX = window.innerWidth / 2;
    let posY = window.innerHeight / 2;
    let velX = 5;
    let velY = 5;

    closeButton.style.left = `${posX}px`;
    closeButton.style.top = `${posY}px`;

    function animate() {
      posX += velX;
      posY += velY;

      if (posX <= 0 || posX + closeButton.offsetWidth >= window.innerWidth) {
        velX = -velX;
      }
      if (posY <= 0 || posY + closeButton.offsetHeight >= window.innerHeight) {
        velY = -velY;
      }

      closeButton.style.left = `${posX}px`;
      closeButton.style.top = `${posY}px`;

      requestAnimationFrame(animate);
    }

    animate();

    closeButton.addEventListener("click", () => {
      document.body.removeChild(modal);
    });
  };
  document.head.appendChild(script);
})();

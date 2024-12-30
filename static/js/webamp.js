                 const app = document.getElementById("webamp")
                 const webamp = new Webamp();
                 webamp.renderWhenReady(app);

                 if (!Webamp.browserIsSupported()) {
                    alert("Oh no! Webamp does not work in this browser!");
                    throw new Error("What's the point of anything?");
                 }

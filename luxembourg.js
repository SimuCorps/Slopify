class WhatTheFuck {
    /**
     * @returns {string}
     */
    what() {
        return "What the fuck?"
    }
}

/**
* @param {string} name
* @returns {HTMLElement}
*/
function getStuff(name) {
    const stuff = document.getElementById(name)
    if (stuff == null) {
        console.error("Excuse me, what the fuck?")
        throw new WhatTheFuck()
    }

    return stuff
}

function main() {
    const creation = getStuff("creation")
    const schisse = getStuff("schisse")

    let mainHeader = document.createElement("h1")
    mainHeader.innerText = "Luxembourg"

    let body = document.getElementsByTagName("body")[0]
    let anthem = new Audio("https://upload.wikimedia.org/wikipedia/commons/f/f6/Ons_Heemecht.ogg")
    let anthemPlaying = false;
    anthem.loop = true

    creation.onclick = () => {
        alert("Hello?")
        setInterval(() => {
            body.innerHTML = "Click anywhere to spawn Luxembourg"
            schisse.innerHTML = ""
        }, 100)

        creation.parentElement.removeChild(creation)

        schisse.appendChild(mainHeader)

        let container = document.createElement("div")
        container.style.position = "fixed"
        container.style.width = "3840px"
        container.style.height = "2160px"
        container.style.zIndex = "9999999999"
        container.style.backgroundColor = "red"

        body.prepend(container)

        setInterval(() => {
            let luxembourg = document.createElement("img")
            luxembourg.setAttribute("src", "https://upload.wikimedia.org/wikipedia/commons/d/da/Flag_of_Luxembourg.svg")
            luxembourg.setAttribute("alt", "Can't load, bozo!")
            luxembourg.setAttribute("width", "128")
            // let style = `transform: translate(${event.x}, ${event.y}); position: absolute;`
            const x = Math.random() * 3840 - 1920;
            const y = Math.random() * 2160 - 1080;
            luxembourg.style.transform = `translateX(${x}px) translateY(${y}px)`
            luxembourg.style.position = "fixed"
            luxembourg.style.zIndex = "9999999999999999999999999999999999"

            body.appendChild(luxembourg)
            if (!anthemPlaying) {
                anthem.play()
                anthemPlaying = true
            }

            alert("something")
        }, 10)
    }
}

main()

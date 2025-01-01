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
    const maincontent = getStuff("maincontent")
    const schisse = getStuff("schisse")

    let mainHeader = document.createElement("h1")
    mainHeader.innerText = "Luxembourg"

    let luxembourg = document.createElement("img")
    luxembourg.setAttribute("src", "https://en.wikipedia.org/wiki/File:Flag_of_Luxembourg.svg")

    creation.onclick = () => {
        console.log("hello")
        maincontent.innerHTML = ""
        schisse.innerHTML = ""

        schisse.appendChild(mainHeader)

        document.onmousedown = (event) => {
            luxembourg.style.cssText = `transform: translate(${event.x, event.y})`
            maincontent.appendChild(luxembourg)
            console.log("Hello?")
        }
    }
}

main()

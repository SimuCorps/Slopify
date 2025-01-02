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


    creation.onclick = () => {
        console.log("hello")
        maincontent.innerHTML = ""
        schisse.innerHTML = ""

        schisse.appendChild(mainHeader)

        document.addEventListener("mousedown", (event) => {
            let luxembourg = document.createElement("img")
            luxembourg.setAttribute("src", "https://upload.wikimedia.org/wikipedia/commons/d/da/Flag_of_Luxembourg.svg")
            luxembourg.setAttribute("alt", "Can't load, bozo!")
            luxembourg.setAttribute("width", "128")
            luxembourg.style.cssText = `transform: translate(${event.x, event.y}); position: absolute;`

            maincontent.appendChild(luxembourg)
            console.log("Hello?")
        })
    }
}

main()

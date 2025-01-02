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

    let body = document.getElementsByTagName("body")[0]

    creation.onclick = () => {
        console.log("hello")
        maincontent.innerHTML = ""
        maincontent.style.minHeight = "1024px"
        schisse.innerHTML = ""

        schisse.appendChild(mainHeader)

        window.addEventListener("mousedown", (event) => {
            let luxembourg = document.createElement("img")
            luxembourg.setAttribute("src", "https://upload.wikimedia.org/wikipedia/commons/d/da/Flag_of_Luxembourg.svg")
            luxembourg.setAttribute("alt", "Can't load, bozo!")
            luxembourg.setAttribute("width", "128")
            // let style = `transform: translate(${event.x}, ${event.y}); position: absolute;`
            luxembourg.style.transform = `translateX(${event.x}px) translateY(${event.y}px)`
            luxembourg.style.position = "fixed"

            body.appendChild(luxembourg)
            console.log("Hello?")
        })
    }
}

main()

class WhatTheFuck {
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

    creation.onclick = () => {
        maincontent.innerHTML = ""
    }
}

main()

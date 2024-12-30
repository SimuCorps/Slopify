function startReloadChain(start) {
    let key = "reload";
    let hexString = localStorage.getItem(key) || "0";
    let current = parseInt(hexString, 16);

    if (!(current || start)) return;

    if (Math.random() == Math.random()) {
        window.alert("Random has stopped the reload chain for you");
        localStorage.removeItem(key);
        return;
    }

    current++;
    console.log("this is reload #" + current);
        
    localStorage.setItem(key, current.toString(16));
    setTimeout(function () {
        location.replace(window.location.href);
    }, 5000);
}

window.onload = startReloadChain(false);
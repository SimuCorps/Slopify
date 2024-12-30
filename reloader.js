function startReloadChain(start) {
    let key = "reload";
    let hexString = localStorage.getItem(key) || "0";
    let current = parseInt(hexString, 16);

    if (!(current || start)) return;

    let newLocation = window.location.href;
    if (Math.random() > 0.7) {
        window.alert("Someone has saved u from the reload chain");
        localStorage.removeItem(key);
        newLocation = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    } else {
        current++;
        console.log("this is reload #" + current);
        localStorage.setItem(key, current.toString(16));
    }

    setTimeout(function () {
        location.replace(newLocation);
    }, 1000);
}

window.onload = startReloadChain(false);
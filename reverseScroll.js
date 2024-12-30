let isReversed = false;
let lastScrollTop = 0;

function reverseScroll(e) {
    e.preventDefault();
    
    const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const delta = e.deltaY || -e.wheelDelta || e.detail;
    
    if (isReversed) {
        window.scrollTo(0, currentScrollTop - delta);
    } else {
        window.scrollTo(0, currentScrollTop + delta);
    }
}

function toggleScrollDirection() {
    isReversed = !isReversed;
    console.log(`Scroll direction ${isReversed ? 'reversed' : 'normal'}`);
}

function setRandomInterval() {
    const minTime = 2000;
    const maxTime = 5000; 
    const randomTime = Math.floor(Math.random() * (maxTime - minTime + 1)) + minTime;
    
    setTimeout(() => {
        toggleScrollDirection();
        setRandomInterval();
    }, randomTime);
}

window.addEventListener('wheel', reverseScroll, { passive: false });
window.addEventListener('DOMMouseScroll', reverseScroll, { passive: false }); 

setRandomInterval();
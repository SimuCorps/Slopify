const frog = document.getElementById('frog');
const moreVibeAudio = document.getElementById('moreVibeAudio');
const vibeAudio = document.getElementById('vibeAudio');

function vibe() {
    moreVibeAudio.pause(); moreVibeAudio.currentTime = 0;
    vibeAudio.pause(); vibeAudio.currentTime = 0;
    const asd = Math.round(Math.random() * 690);
    console.log(asd)
    if (String(asd).includes("69") || String(asd).includes("42")) {
        frog.src = 'static/images/rick.gif';
        moreVibeAudio.play();
    } else {
        vibeAudio.play();
    }

    frog.id = 'dancing-frog';
}

// no more dancing and no more rick
vibeAudio.addEventListener('ended', () => frog.id = 'frog');
moreVibeAudio.addEventListener('ended', function() {
    frog.id = 'frog';
    frog.src = 'static/images/frog.webp';
});
moreVibeAudio.addEventListener('ended', () => frog.src = 'static/images/frog.webp');
moreVibeAudio.addEventListener('pause', () => frog.src = 'static/images/frog.webp');

if (window.location.search.includes("slopcursion=true")) {
	document.getElementById('slopcursion').style.display = 'none';
}

// TODO: Delete dead code
// TODO: Refactor random number generation

// document.body.style.background = 'hsl('+Math.floor(Math.random() * 255)+', 40%, 50%)';
// document.getElementsByTagName('header')[0].style.background = 'hsl('+Math.floor(Math.random() * 255)+', 50%, 40%)';
// document.getElementsByTagName('footer')[0].style.background = 'hsl('+Math.floor(Math.random() * 255)+', 50%, 40%)';
document.getElementById('vibeButton').addEventListener('click', vibe);

function enableQuotes() {
  if (!("speechSynthesis" in window)) {
    alert("Your browser does not support the wisdom of the frog.");
    return;
  }

  fetch("static/js/quotes.json")
    .then((response) => response.json())
    .then((data) => {
      function readRandomQuote() {
        const randomQuote = data[Math.floor(Math.random() * data.length)];
        readQuote(randomQuote);
        const randomTime = Math.floor(Math.random() * 25000) + 10000; // 10-35 seconds
        setTimeout(readRandomQuote, randomTime);
      }
      readRandomQuote();
    });
}

function readQuote(theQuote) {
  var msg = new SpeechSynthesisUtterance();
  msg.text = theQuote;
  msg.rate = 0.3;
  msg.pitch = 0.1;
  window.speechSynthesis.speak(msg);
}

document.getElementById("wisdomButton").addEventListener("click", enableQuotes);

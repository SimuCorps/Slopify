// Wednesdayify wednesdays, my dudes
const wednesday = document.createElement('div');
wednesday.style = `
position: absolute;
left: 0;
top: 0;
width: 100%;
height: 100%;
z-index: 9002;
pointer-events: none;
opacity: .15;
background: url('https://i.kym-cdn.com/photos/images/original/001/091/264/665.jpg');
background-repeat: no-repeat;
background-size: 100% 100%;
`;

const clock = setInterval(() => {
    if (Date().substr(0, 3) === 'Wed') {
        if (wednesday.parentElement) {
            return;
        }
        document.body.appendChild(wednesday);
    }
    else {
        if (!wednesday.parentElement) {
            return;
        }
        wednesday.remove()
    }
}, 60*60);

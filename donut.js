var pretag = document.getElementById("donut");

var tmr1 = undefined,
    tmr2 = undefined;
var A = 1,
    B = 1;

var asciiframe = () => {
    var b = [];
    var z = [];
    A += 0.07;
    B += 0.03;
    var cA = Math.cos(A),
        sA = Math.sin(A),
        cB = Math.cos(B),
        sB = Math.sin(B);
    for (var k = 0; k < 1760; k++) {
        b[k] = k % 80 == 79 ? "\n" : " ";
        z[k] = 0;
    }
    for (var j = 0; j < 6.28; j += 0.07) {
        // j <=> theta
        var ct = Math.cos(j),
            st = Math.sin(j);
        for (i = 0; i < 6.28; i += 0.02) {
            // i <=> phi
            var sp = Math.sin(i),
                cp = Math.cos(i),
                h = ct + 1.75, // R1 + R2*cos(theta)
                D = 1 / (sp * h * sA + st * cA + 5), // this is 1/z
                t = sp * h * cA - st * sA; // this is a clever factoring of some of the terms in x' and y'

            var x = 0 | (40 + 30 * D * (cp * h * cB - t * sB)),
                y = 0 | (12 + 15 * D * (cp * h * sB + t * cB)),
                o = x + 80 * y,
                N =
                    0 |
                    (8 *
                        ((st * sA - sp * ct * cA) * cB -
                            sp * ct * sA -
                            st * cA -
                            cp * ct * sB));
            if (y < 22 && y >= 0 && x >= 0 && x < 79 && D > z[o]) {
                z[o] = D;
                b[o] = ".,-~:;=!*#$@"[N > 0 ? N : 0];
            }
        }
    }
    pretag.innerHTML = b.join("");
};

setInterval(asciiframe, 50)
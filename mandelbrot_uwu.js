let _maxIterations = 30;  // maxIter
let _zoomFactor = 1;  // zoom
let _centerX = -0.5;  // offsetX
let _centerY = 0;  // offsetY
let _canvasWidth = 400;  // w
let _canvasHeight = 400;  // h
let _renderSpeed = 8;  // plotSpeed
let _fontStyle;
let _fractalCanvas;

function initializeCanvas() {
  _fractalCanvas = document.getElementById("fractalCanvas");
  let _context = _fractalCanvas.getContext("2d");

  if (!_context) {
    console.error("No se puede inicializar el contexto de canvas.");
    return;
  }

  _fractalCanvas.width = _canvasWidth;
  _fractalCanvas.height = _canvasHeight;
  _context.clearRect(0, 0, _canvasWidth, _canvasHeight);
  _context.font = "15px Arial";
  _context.textAlign = "center";
}

function renderFractal() {
  let _context = _fractalCanvas.getContext("2d");
  for (let _i = 0; _i < _renderSpeed; _i++) {
    let _xPos = Math.floor(Math.random() * _canvasWidth);
    let _yPos = Math.floor(Math.random() * _canvasHeight);

    let _realPart = mapRange(_xPos, 0, _canvasWidth, _centerX - _zoomFactor, _centerX + _zoomFactor);
    let _imagPart = mapRange(_yPos, 0, _canvasHeight, _centerY - _zoomFactor, _centerY + _zoomFactor);
    let _iterations = mandelbrotSet(_realPart, _imagPart);
    let _color = generateColor(_iterations);
    _context.fillStyle = _color;
    _context.font = "15px Arial";
    let _rotation = Math.random() * 2 * Math.PI;

    _context.save();
    _context.translate(_xPos, _yPos);
    _context.rotate(_rotation);
    _context.fillText("uwu", 0, 0);
    _context.restore();
  }
}

function mandelbrotSet(real, imag) {
  let _cReal = real;
  let _cImag = imag;
  let _zReal = 0;
  let _zImag = 0;
  let _iterations = 0;
  while (_zReal * _zReal + _zImag * _zImag <= 4 && _iterations < _maxIterations) {
    let _temp = _zReal * _zReal - _zImag * _zImag + _cReal;
    _zImag = 2 * _zReal * _zImag + _cImag;
    _zReal = _temp;
    _iterations++;
  }
  return _iterations;
}

function generateColor(iterations) {
  if (iterations === _maxIterations) {
    return "black";
  } else {
    let _t = iterations / _maxIterations;
    let _r = Math.floor(255 * _t);
    let _g = Math.floor(255 * (1 - _t));
    let _b = Math.floor(255 * (0.5 + 0.5 * Math.sin(_t * Math.PI)));
    return `rgb(${_r}, ${_g}, ${_b})`;
  }
}

function mapRange(value, inMin, inMax, outMin, outMax) {
  return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

document.addEventListener("DOMContentLoaded", () => {
  initializeCanvas();
  setInterval(renderFractal, 1000 / 30); // Llamar renderFractal() 30 veces por segundo
});

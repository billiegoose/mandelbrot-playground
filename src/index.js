import { HSVtoRGB } from "./utils/HSVtoRGB.js"
import { drawGL } from "./shader.js"
import { iter } from "./utils/iter.js"
import { debounce } from "./utils/debounce.js"
import { zoom } from "./utils/zoom.js"
import { evalPoint } from "./utils/evalPoint.js"
import { pan } from './utils/pan.js'

// import { add as addRust, iter as iterRust } from "./draw.rs";

const hasExperimentalIsInputPending = navigator.scheduling && navigator.scheduling.isInputPending;

// console.log(addRust(2, 3), iterRust(0, 0, 255));
const canvas = document.getElementById("canvas");
const canvas2 = document.getElementById("canvas2");
const ctx = canvas.getContext("2d");
const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

const WIDTH = canvas.clientWidth;
const HEIGHT = canvas.clientHeight;
console.log(WIDTH, HEIGHT);

// let bounds = [{r: -2, i: -1}, {r: 1, i: 1}];
// let bounds = [
//   { r: -1.0239051845552098, i: -0.36249787751053836 },
//   { r: -1.0239051835666346, i: -0.362497876851488 }
// ];
let bounds = [{"r":0.2361513689220573,"i":-0.5210970613723728},{"r":0.23662026741217732,"i":-0.5207844623789595}]

const drawCanvas = (
  canvasWidth,
  canvasHeight,
  lowerBoundr,
  lowerBoundi,
  upperBoundr,
  upperBoundi,
  data
) => {
  let n = 0;
  let min = 255;

  const gWIDTH = upperBoundr - lowerBoundr;
  const gLEFT = lowerBoundr;
  const scaleX = gWIDTH / (canvasWidth - 1);

  const gHEIGHT = upperBoundi - lowerBoundi;
  const gTOP = upperBoundi;
  const scaleY = -gHEIGHT / (canvasHeight - 1);
  document.getElementById('scale').value = (2 / gHEIGHT).toExponential(2);

  // let val;
  let color;
  for (let y = 0; y < canvasHeight; y++) {
    for (let x = 0; x < canvasWidth; x++) {
      let count = Math.max(0, iter(x * scaleX + gLEFT, y * scaleY + gTOP));
      color = count === 1024 ? {r: 0, g: 0, b: 0} : HSVtoRGB(
        count / 100.0,
        0.9,
        1.0
      );
      // min = Math.min(min, val);
      data[n] = color.r;
      data[n + 1] = color.g;
      data[n + 2] = color.b;
      data[n + 3] = 255;
      n += 4;
    }
    if (hasExperimentalIsInputPending) {
      if (navigator.scheduling.isInputPending(['wheel'])) {
        console.log('wheel break!')
        return false;
      }
      if (
        isMouseDown
        && navigator.scheduling.isInputPending(['mousemove'])
        && !navigator.scheduling.isInputPending(['mouseup'])
      ) {
        return false;
      }
    }
  }
  return true;
};

const draw = () => {
  let start = performance.now();

  let finished = drawCanvas(
    WIDTH,
    HEIGHT,
    bounds[0].r,
    bounds[0].i,
    bounds[1].r,
    bounds[1].i,
    imageData.data
  );
  if (!finished) return;

  console.log("draw");
  ctx.putImageData(imageData, 0, 0);
  let finish = performance.now();
  document.getElementById("ms").value = Math.floor(finish - start);
  console.log(JSON.stringify(bounds));
};

draw();

const draw2 = () => {
  let start = performance.now();

  drawGL(
    WIDTH,
    HEIGHT,
    bounds[0].r,
    bounds[0].i,
    bounds[1].r,
    bounds[1].i
  );

  console.log("draw2");
  let finish = performance.now();
  document.getElementById("ms2").value = Math.floor(finish - start);
  console.log(JSON.stringify(bounds));
  // compute scale - redundant but needed so we can print the value
  const gHEIGHT = bounds[1].i - bounds[0].i;
  document.getElementById('scale2').value = (2 / gHEIGHT).toExponential(2);
};

draw2();

canvas.addEventListener("wheel", event => {
  event.preventDefault();
  bounds = zoom(event.offsetX, event.offsetY, event.deltaY, bounds, {WIDTH, HEIGHT})
  draw();
  draw2();
});


canvas2.addEventListener("wheel", event => {
  event.preventDefault();
  bounds = zoom(event.offsetX, event.offsetY, event.deltaY, bounds, {WIDTH, HEIGHT})
  draw2();
});

let prevMouseXY = null;
let isMouseDown = false;


const canvasOnMouseMove = event => {
  event.preventDefault();
  document.getElementById("output").value = evalPoint(event.offsetX, event.offsetY, bounds, {WIDTH, HEIGHT}).toFixed(2);
  if (isMouseDown) {
    if (prevMouseXY) {
      bounds = pan(event.offsetX, event.offsetY, prevMouseXY[0], prevMouseXY[1], bounds, {WIDTH, HEIGHT})
    }
    prevMouseXY = [event.offsetX, event.offsetY];
    draw();
    draw2();
  }
}

if (hasExperimentalIsInputPending) {
  canvas.addEventListener("mousemove", canvasOnMouseMove);
} else {
  canvas.addEventListener(
    "mousemove",
    debounce(canvasOnMouseMove),
    16
  );
}

canvas.addEventListener("mousedown", event => {
  isMouseDown = true;
});

canvas2.addEventListener(
  "mousemove",
  debounce(event => {
    event.preventDefault();
    document.getElementById("output2").value = evalPoint(event.offsetX, event.offsetY, bounds, {WIDTH, HEIGHT}).toFixed(2);
    if (isMouseDown) {
      if (prevMouseXY) {
        bounds = pan(event.offsetX, event.offsetY, prevMouseXY[0], prevMouseXY[1], bounds, {WIDTH, HEIGHT})
        }
      prevMouseXY = [event.offsetX, event.offsetY];
      draw2();
    }
  }),
  16
);

canvas2.addEventListener("mousedown", event => {
  isMouseDown = true;
});

document.addEventListener("mouseup", event => {
  isMouseDown = false;
  prevMouseXY = null;
});

var htmlCanvas = document.getElementById("canvas_worker");
var offscreen = htmlCanvas.transferControlToOffscreen();

var worker = new Worker("worker.js"); 
worker.postMessage({WIDTH, HEIGHT, canvas: offscreen}, [offscreen]);

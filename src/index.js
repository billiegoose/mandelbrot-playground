import { drawGL } from "./shader.js"
import { debounce } from "./utils/debounce.js"
import { zoom } from "./utils/zoom.js"
import { evalPoint } from "./utils/evalPoint.js"
import { pan } from './utils/pan.js'

const canvas = document.getElementById("canvas");

const WIDTH = canvas.clientWidth;
const HEIGHT = canvas.clientHeight;
console.log(WIDTH, HEIGHT);


// let bounds = [{r: -2, i: -1}, {r: 0, i: 1}];
// let bounds = [
//   { r: -1.0239051845552098, i: -0.36249787751053836 },
//   { r: -1.0239051835666346, i: -0.362497876851488 }
// ];
// let bounds = [{"r":0.2361513689220573,"i":-0.5210970613723728},{"r":0.23662026741217732,"i":-0.5207844623789595}]
let bounds = [{"r":0.23623027407123423,"i":-0.52110955067061},{"r":0.23656280789412965,"i":-0.5207770168477384}]
// let bounds = [{"r":-0.9324446099555789,"i":-0.3096720420214256},{"r":-0.9319455324854043,"i":-0.3091729645512239}]

const draw2 = () => {
  let start = performance.now();

  // console.log(JSON.stringify(bounds));
  drawGL(
    WIDTH,
    HEIGHT,
    bounds[0].r,
    bounds[0].i,
    bounds[1].r,
    bounds[1].i
  );

  let finish = performance.now();
  document.getElementById("ms2").value = Math.floor(finish - start);
  // compute scale - redundant but needed so we can print the value
  const gHEIGHT = bounds[1].i - bounds[0].i;
  document.getElementById('scale2').value = (2 / gHEIGHT).toExponential(2);
};

draw2();

canvas.addEventListener("wheel", event => {
  event.preventDefault();

  // compute scale - redundant but needed so we can print the value
  const gHEIGHT = bounds[1].i - bounds[0].i;
  const scale = (2 / gHEIGHT);
  if (!(scale > 1.0e+5 && event.deltaY < 0)) {
    bounds = zoom(event.offsetX, event.offsetY, event.deltaY, bounds, {WIDTH, HEIGHT})
  }
  console.log(JSON.stringify(bounds));
  draw2();
});

let prevMouseXY = null;
let isMouseDown = false;

canvas.addEventListener(
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

canvas.addEventListener("mousedown", event => {
  isMouseDown = true;
});

document.addEventListener("mouseup", event => {
  isMouseDown = false;
  prevMouseXY = null;
});

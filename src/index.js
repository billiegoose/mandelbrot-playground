import { drawGL } from "./shader.js"
import { zoom } from "./utils/zoom.js"
import { twoFingerZoom } from "./utils/twoFingerZoom.js"
import { pan } from './utils/pan.js'
import { mean2d } from './utils/mean2d.js'
import { meanDistanceFromPoint } from './utils/meanDistanceFromPoint.js'
import { bounds as computeBounds } from './utils/bounds.js'

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
// let bounds = [{"r":-0.6530943327215649,"i":-0.482019631958442},{"r":-0.6530775111828098,"i":-0.482002810419688}]

// let center = {
//   r: (bounds[0].r + bounds[1].r) / 2,
//   i: (bounds[0].i + bounds[1].i) / 2,
// };

// let magnification = 2 / (bounds[1].i - bounds[0].i);

// let { center, magnification } = {"center":{"r":-0.5392733540563709,"i":-0.6638421653545289},"magnification":101205.15090285588}
let { center, magnification } = {"center":{"r":0.23639654098268192,"i":-0.5209432837591742},"magnification":6014.425789017409}

console.log(JSON.stringify({center, magnification}))

const draw2 = () => {
  const bs = computeBounds(center, magnification, WIDTH / HEIGHT);
  drawGL(
    WIDTH,
    HEIGHT,
    bs[0].r,
    bs[0].i,
    bs[1].r,
    bs[1].i,
  );
  // compute magnification - redundant but needed so we can print the value
  document.getElementById('zoom').value = (magnification).toExponential(2);
};

draw2();

canvas.addEventListener("wheel", event => {
  event.preventDefault();

  [center, magnification] = zoom(event.offsetX, event.offsetY, event.deltaY, center, magnification, {WIDTH, HEIGHT})

  console.log(JSON.stringify({center, magnification}));
  draw2();
});

let pointers = {}; // {x:number, y:number}

canvas.addEventListener("pointerdown", event => {
  const offsetX = event.clientX - canvas.offsetLeft;
  const offsetY = event.clientY - canvas.offsetTop;
  pointers[event.pointerId] = {
    x: offsetX,
    y: offsetY,
  };
  canvas.setPointerCapture(event.pointerId);
});

canvas.addEventListener(
  "pointermove",
  event => {
    // Ignore mouse movement unless dragging
    if (!pointers[event.pointerId]) return;

    const oldCenterPoint = mean2d(pointers);
    const oldDistance = meanDistanceFromPoint(pointers, oldCenterPoint);

    const offsetX = event.clientX - canvas.offsetLeft;
    const offsetY = event.clientY - canvas.offsetTop;

    pointers[event.pointerId].x = offsetX;
    pointers[event.pointerId].y = offsetY;

    const newCenterPoint = mean2d(pointers);
    const newDistance = meanDistanceFromPoint(pointers, newCenterPoint);

    if (oldCenterPoint) {
      center = pan(
        newCenterPoint.x, newCenterPoint.y,
        oldCenterPoint.x, oldCenterPoint.y,
        center, magnification, {WIDTH, HEIGHT}
      )
    }

    if (oldDistance !== null && newDistance !== oldDistance) {
      const delta = oldDistance / newDistance;
      [center, magnification] = twoFingerZoom(newCenterPoint.x, newCenterPoint.y, delta, center, magnification, {WIDTH, HEIGHT})
    }

    draw2();
  },
);

canvas.addEventListener("pointerup", event => {
  delete pointers[event.pointerId];
});

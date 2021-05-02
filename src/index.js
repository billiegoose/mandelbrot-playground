import './polyfills/fullscreen.js'
import { init } from "./shader.js"
import { zoom } from "./utils/zoom.js"
import { twoFingerZoom } from "./utils/twoFingerZoom.js"
import { pan } from './utils/pan.js'
import { mean2d } from './utils/mean2d.js'
import { meanDistanceFromPoint } from './utils/meanDistanceFromPoint.js'
import { bounds as computeBounds } from './utils/bounds.js'
import { downloadBlob } from './utils/downloadBlob.js'

const canvas = document.getElementById("canvas");

let startingPoints = [
  {"center":{"r":-1.0239051840609221,"i":-0.3624978771810132},"magnification":37878.30727990172},
  {"center":{"r":0.23639654098268192,"i":-0.5209432837591742},"magnification":6014.425789017409},
  {"center":{"r":-0.9321950712204916,"i":-0.30942250328632476},"magnification":4007.393880536437},
  {"center":{"r":-0.6222253796499786,"i":-0.4685170012224668},"magnification":823.6171727317933},
  {"center":{"r":0.20266332778338675,"i":-0.5610397851311674},"magnification":771.5575389485568},
  {"center":{"r":0.3606476653154053,"i":-0.5872207249038313},"magnification":312.04201503197106},
  {"center":{"r":0.42450104979379727,"i":0.2075254504178545},"magnification":4440.9884561736035},
];

const pick = Math.floor(Math.random() * startingPoints.length);
let { center, magnification } = startingPoints[pick];

if (location.search) {
  const query = new URLSearchParams(location.search);
  const m = query.get('m');
  const r = query.get('r');
  const i = query.get('i');
  if (m) magnification = parseFloat(m);
  if (r) center.r = parseFloat(r);
  if (i) center.i = parseFloat(i);
}

let drawGL, WIDTH, HEIGHT

function setupSize () {
  WIDTH = canvas.clientWidth;
  HEIGHT = canvas.clientHeight;

  canvas.width = WIDTH;
  canvas.height = HEIGHT;

  drawGL = init();
  draw2();
}

setupSize();

const observer = new ResizeObserver(setupSize);
observer.observe(canvas, { box: 'content-box' });

function draw2 () {
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
  document.getElementById('zoom').innerHTML = (magnification).toExponential(2).replace(/e((\+|\-)\d)/, '×10<sup>$1</sup>').replace('+', '');
  document.getElementById('center').value = `${center.r.toFixed(6)} ${center.i < 0 ? '-' : '+'} ${Math.abs(center.i).toFixed(6)}𝑖`
}

canvas.addEventListener("wheel", event => {
  event.preventDefault();
  [center, magnification] = zoom(event.offsetX, event.offsetY, event.deltaY, center, magnification, {WIDTH, HEIGHT})
  draw2();
});

let pointers = {}; // {[id string]: {x:number, y:number}}

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

function shareURL() {
  const query = new URLSearchParams({
    m: magnification,
    r: center.r,
    i: center.i,
  })
  const url = new URL(location);
  url.search = `?${query}`;
  return url;
}

document.getElementById('save').addEventListener('click', () => {
  draw2();
  canvas.toBlob((blob) => {
    const filename = `mandelbrot_${magnification.toFixed(8)}z_${center.r.toFixed(8)}r_${center.i.toFixed(8)}i.png`
    downloadBlob(blob, filename);
  }, "image/png");
});

document.addEventListener('dblclick', () => {
  if (!document.fullscreenEnabled) return;

  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else {
    canvas.requestFullscreen();
  }
});

document.getElementById('share').addEventListener('click', () => {
  if (navigator.share) {
    navigator.share({
      title: 'Mandelbrot Link',
      text: 'Check out this sweet spot on the Mandelbrot set!',
      url: shareURL()
    })
  } else {
    window.open(shareURL(), '_blank');
  }
});

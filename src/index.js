"use strict";
import { drawGL } from "./shader.js"
// import { add as addRust, iter as iterRust } from "./draw.rs";

// console.log(addRust(2, 3), iterRust(0, 0, 255));
const canvas = document.getElementById("canvas");
const canvas2 = document.getElementById("canvas2");
const ctx = canvas.getContext("2d");
const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

const WIDTH = canvas.clientWidth;
const HEIGHT = canvas.clientHeight;
console.log(WIDTH, HEIGHT);

let bounds = [{r: -2, i: -1}, {r: 1, i: 1}];
// let bounds = [
//   { r: -1.0239051845552098, i: -0.36249787751053836 },
//   { r: -1.0239051835666346, i: -0.362497876851488 }
// ];

const makeXY = bounds => {
  const gWIDTH = bounds[1].r - bounds[0].r;
  const gHEIGHT = bounds[1].i - bounds[0].i;
  const gLEFT = bounds[0].r;
  const gTOP = bounds[1].i;
  const scaleX = gWIDTH / (WIDTH - 1);
  const scaleY = -gHEIGHT / (HEIGHT - 1);
  return (r, c) => ({ r: c * scaleX + gLEFT, i: r * scaleY + gTOP });
};

let depthScale = 255;

const add = (c1, c2) => ({ r: c1.r + c2.r, i: c1.i + c2.i });

const mult = (c, scaler) => ({ r: c.r * scaler, i: c.i * scaler });

// Note: iter and iterRust seem to be about the same speed. Probably any speed gains are offset by the back-and-forth between JS and Rust.
const iter = (r, i, depthScale) => {
  let pzr = 0;
  let pzi = 0;
  let zr = 0;
  let zi = 0;
  let n = 0;
  for (n = 0; n < depthScale; n++) {
    zr = pzr * pzr - pzi * pzi + r;
    zi = 2 * pzr * pzi + i;

    if (zr * zr + zi * zi > 4) {
      return n;
    }
    pzr = zr;
    pzi = zi;
  }
  return n;
};

const drawCanvas = (
  canvasWidth,
  canvasHeight,
  lowerBoundr,
  lowerBoundi,
  upperBoundr,
  upperBoundi,
  depthScale,
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
  document.getElementById('scale').value = `${(2 / gHEIGHT).toExponential(2)}`;

  let val;
  for (let y = 0; y < canvasHeight; y++) {
    for (let x = 0; x < canvasWidth; x++) {
      val =
        Math.floor(
          iter(x * scaleX + gLEFT, y * scaleY + gTOP, depthScale)
        ) -
        (depthScale - 255);
      min = Math.min(min, val);
      data[n] = val;
      data[n + 1] = val;
      data[n + 2] = val;
      data[n + 3] = 255;
      n += 4;
    }
  }
  depthScale += min;
  return depthScale;
};

const draw = () => {
  let start = performance.now();

  depthScale = drawCanvas(
    WIDTH,
    HEIGHT,
    bounds[0].r,
    bounds[0].i,
    bounds[1].r,
    bounds[1].i,
    depthScale,
    imageData.data
  );

  console.log("draw");
  ctx.putImageData(imageData, 0, 0);
  let finish = performance.now();
  document.getElementById("ms").value = Math.floor(finish - start) + " ms";
};

draw();
draw();
draw();

const draw2 = () => {
  let start = performance.now();

  drawGL(
    WIDTH,
    HEIGHT,
    bounds[0].r,
    bounds[0].i,
    bounds[1].r,
    bounds[1].i,
    depthScale
  );

  console.log("draw2");
  let finish = performance.now();
  document.getElementById("ms2").value = Math.floor(finish - start) + " ms";
};

draw2();

canvas.addEventListener("wheel", event => {
  const xy = makeXY(bounds);
  const c = xy(event.offsetY, event.offsetX);
  const negc = mult(c, -1);
  event.preventDefault();
  // Compute new bounds
  // 1. offset
  bounds[0] = add(bounds[0], negc);
  bounds[1] = add(bounds[1], negc);
  // 2. scale
  const scale = Math.max(1 + event.deltaY * 0.01, 0.7);
  bounds[0] = mult(bounds[0], scale);
  bounds[1] = mult(bounds[1], scale);
  // 3. onset
  bounds[0] = add(bounds[0], c);
  bounds[1] = add(bounds[1], c);
  draw();
});


canvas2.addEventListener("wheel", event => {
  const xy = makeXY(bounds);
  const c = xy(event.offsetY, event.offsetX);
  const negc = mult(c, -1);
  event.preventDefault();
  // Compute new bounds
  // 1. offset
  bounds[0] = add(bounds[0], negc);
  bounds[1] = add(bounds[1], negc);
  // 2. scale
  const scale = Math.max(1 + event.deltaY * 0.01, 0.7);
  bounds[0] = mult(bounds[0], scale);
  bounds[1] = mult(bounds[1], scale);
  // 3. onset
  bounds[0] = add(bounds[0], c);
  bounds[1] = add(bounds[1], c);
  draw2();
  draw();
});

let prevMouseXY = null;
let isMouseDown = false;

canvas.addEventListener(
  "mousemove",
  debounce(event => {
    const xy = makeXY(bounds);
    const c = xy(event.offsetY, event.offsetX);
    document.getElementById("output").value = iter(c.r, c.i, depthScale) + " iterations; ";
    if (isMouseDown) {
      if (prevMouseXY) {
        let prevC = xy(...prevMouseXY);
        let diff = add(mult(c, -1), prevC);
        bounds[0] = add(bounds[0], diff);
        bounds[1] = add(bounds[1], diff);
      }
      prevMouseXY = [event.offsetY, event.offsetX];
      draw();
    }
    event.preventDefault();
  }),
  16
);

canvas.addEventListener("mousedown", event => {
  isMouseDown = true;
});


canvas2.addEventListener(
  "mousemove",
  debounce(event => {
    const xy = makeXY(bounds);
    const c = xy(event.offsetY, event.offsetX);
    document.getElementById("output").value = iter(c.r, c.i, depthScale) + " iterations; ";
    if (isMouseDown) {
      if (prevMouseXY) {
        let prevC = xy(...prevMouseXY);
        let diff = add(mult(c, -1), prevC);
        bounds[0] = add(bounds[0], diff);
        bounds[1] = add(bounds[1], diff);
      }
      prevMouseXY = [event.offsetY, event.offsetX];
      draw2();
      draw();
    }
    event.preventDefault();
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

// https://github.com/hayes/just-debounce/blob/master/index.js
function debounce(fn, delay, at_start, guarantee) {
  var timeout;
  var args;
  var self;

  return function debounced() {
    self = this;
    args = Array.prototype.slice.call(arguments);

    if (timeout && (at_start || guarantee)) {
      return;
    } else if (!at_start) {
      clear();

      timeout = setTimeout(run, delay);
      return timeout;
    }

    timeout = setTimeout(clear, delay);
    fn.apply(self, args);

    function run() {
      clear();
      fn.apply(self, args);
    }

    function clear() {
      clearTimeout(timeout);
      timeout = null;
    }
  };
}

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

// let bounds = [{r: -2, i: -1}, {r: 1, i: 1}];
// let bounds = [
//   { r: -1.0239051845552098, i: -0.36249787751053836 },
//   { r: -1.0239051835666346, i: -0.362497876851488 }
// ];
let bounds = [{"r":0.2361513689220573,"i":-0.5210970613723728},{"r":0.23662026741217732,"i":-0.5207844623789595}]

const makeXY = bounds => {
  const gWIDTH = bounds[1].r - bounds[0].r;
  const gHEIGHT = bounds[1].i - bounds[0].i;
  const gLEFT = bounds[0].r;
  const gTOP = bounds[1].i;
  const scaleX = gWIDTH / (WIDTH - 1);
  const scaleY = -gHEIGHT / (HEIGHT - 1);
  return (r, c) => ({ r: c * scaleX + gLEFT, i: r * scaleY + gTOP });
};

const add = (c1, c2) => ({ r: c1.r + c2.r, i: c1.i + c2.i });

const mult = (c, scaler) => ({ r: c.r * scaler, i: c.i * scaler });

// Note: iter and iterRust seem to be about the same speed. Probably any speed gains are offset by the back-and-forth between JS and Rust.
const iter = (r, i) => {
  let pzr = 0;
  let pzrs = 0;
  let pzis = 0;
  let zr = 0;
  let zi = 0;
  let n = 0;
  for (n = 0; n < 1024; n++) {
    if (pzrs + pzis > 4) {
      break;
    }
    zr = pzrs - pzis + r;
    zi = pzr * zi;
    zi += zi;
    zi += i;

    pzr = zr;
    pzrs = pzr * pzr;
    pzis = zi * zi;
  }
  if (n === 1024) return n;
  const smoothingMagic = 1.0 - Math.log( (Math.log2(pzrs + pzis) / 2.0) / Math.log(2.0) ) / Math.log(2.0);
  return n + smoothingMagic;
};

// HSVtoRGB source: https://stackoverflow.com/a/17243070
function HSVtoRGB(h, s, v) {
  var r, g, b, i, f, p, q, t;
  if (arguments.length === 1) {
      s = h.s, v = h.v, h = h.h;
  }
  i = Math.floor(h * 6);
  f = h * 6 - i;
  p = v * (1 - s);
  q = v * (1 - f * s);
  t = v * (1 - (1 - f) * s);
  switch (i % 6) {
      case 0: r = v, g = t, b = p; break;
      case 1: r = q, g = v, b = p; break;
      case 2: r = p, g = v, b = t; break;
      case 3: r = p, g = q, b = v; break;
      case 4: r = t, g = p, b = v; break;
      case 5: r = v, g = p, b = q; break;
  }
  return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
  };
}

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
  const hasExperimentalIsInputPending = navigator.scheduling && navigator.scheduling.isInputPending;

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
      if (hasExperimentalIsInputPending) {
        if (navigator.scheduling.isInputPending(['wheel'])) break;
      }
    }
  }
  return;
};

const draw = () => {
  let start = performance.now();

  drawCanvas(
    WIDTH,
    HEIGHT,
    bounds[0].r,
    bounds[0].i,
    bounds[1].r,
    bounds[1].i,
    imageData.data
  );

  console.log("draw");
  ctx.putImageData(imageData, 0, 0);
  let finish = performance.now();
  document.getElementById("ms").value = Math.floor(finish - start);
  console.log(JSON.stringify(bounds));
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
  draw2();
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
});

let prevMouseXY = null;
let isMouseDown = false;

canvas.addEventListener(
  "mousemove",
  debounce(event => {
    const xy = makeXY(bounds);
    const c = xy(event.offsetY, event.offsetX);
    document.getElementById("output").value = iter(c.r, c.i).toFixed(2);
    if (isMouseDown) {
      if (prevMouseXY) {
        let prevC = xy(...prevMouseXY);
        let diff = add(mult(c, -1), prevC);
        bounds[0] = add(bounds[0], diff);
        bounds[1] = add(bounds[1], diff);
      }
      prevMouseXY = [event.offsetY, event.offsetX];
      draw();
      draw2();
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
    document.getElementById("output2").value = iter(c.r, c.i).toFixed(2);

    if (isMouseDown) {
      if (prevMouseXY) {
        let prevC = xy(...prevMouseXY);
        let diff = add(mult(c, -1), prevC);
        bounds[0] = add(bounds[0], diff);
        bounds[1] = add(bounds[1], diff);
      }
      prevMouseXY = [event.offsetY, event.offsetX];
      draw2();
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

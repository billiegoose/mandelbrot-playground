const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

const WIDTH = canvas.clientWidth;
const HEIGHT = canvas.clientHeight;
console.log(WIDTH, HEIGHT);

let bounds = [[-2, -1], [1, 1]];

const makeXY = bounds => {
  const gWIDTH = bounds[1][0] - bounds[0][0];
  const gHEIGHT = bounds[1][1] - bounds[0][1];
  const gLEFT = bounds[0][0];
  const gTOP = bounds[1][1];
  const scaleX = gWIDTH / (WIDTH - 1);
  const scaleY = -gHEIGHT / (HEIGHT - 1);
  return (r, c) => [c * scaleX + gLEFT, r * scaleY + gTOP];
};

let minx = 0;

let depthScale = 255;

const add = (c1, c2) => [c1[0] + c2[0], c1[1] + c2[1]];

const mult = (c, scaler) => [c[0] * scaler, c[1] * scaler];

const square = (c) => [c[0] * c[0] - c[1] * c[1], 2 * c[0] * c[1]];

const norm = (c) => Math.sqrt(c[0] * c[0] + c[1] * c[1]);

const iter = c => {
  let z = [0, 0];
  let i = 0;
  for (i = 0; i < depthScale; i++) {
    z = add(square(z), c);
    if (norm(z) > 2) {
      return i;
    }
  }
  return i;
};

const draw = () => {
  let i = 0;
  let min = 255;
  const xy = makeXY(bounds);
  for (let r = 0; r < HEIGHT; r++) {
    for (let c = 0; c < WIDTH; c++) {
      const [x, y] = xy(r, c);
      minx = Math.max(minx, y);
      const val = Math.floor(iter([x, y])) - (depthScale - 255);
      min = Math.min(min, val);
      imageData.data[i] = val;
      imageData.data[i + 1] = val;
      imageData.data[i + 2] = val;
      imageData.data[i + 3] = 255;
      i += 4;
    }
  }
  depthScale += min;
  console.log('draw')
  ctx.putImageData(imageData, 0, 0);
};

draw();

canvas.addEventListener("wheel", event => {
  const xy = makeXY(bounds);
  const c = xy(event.offsetY, event.offsetX);
  const negc = [-c[0], -c[1]];
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

let prevMouseXY = null;
let isMouseDown = false;

canvas.addEventListener(
  "mousemove",
  debounce(event => {
    const xy = makeXY(bounds);
    const c = xy(event.offsetY, event.offsetX);
    document.getElementById("output").value = iter(c);
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

canvas.addEventListener("mouseup", event => {
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

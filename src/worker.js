import { HSVtoRGB } from './utils/HSVtoRGB.js'
import { iter } from './utils/iter.js'

var ctx
var WIDTH
var HEIGHT
var imageData
let bounds = [{"r":0.2361513689220573,"i":-0.5210970613723728},{"r":0.23662026741217732,"i":-0.5207844623789595}]


onmessage = function(evt) {
  if (evt.data.WIDTH) {
    WIDTH = evt.data.WIDTH
  }
  if (evt.data.HEIGHT) {
    HEIGHT = evt.data.HEIGHT
  }
  if (evt.data.canvas) {
    var canvas = evt.data.canvas;
    ctx = canvas.getContext("2d");
    imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    draw();
  } else if (evt.data.bounds) {

  }
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
  // document.getElementById("ms").value = Math.floor(finish - start);
  console.log(JSON.stringify(bounds));
};

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
  // document.getElementById('scale').value = (2 / gHEIGHT).toExponential(2);

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
  }
  return true;
};


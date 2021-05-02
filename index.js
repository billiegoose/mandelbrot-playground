// UTILITY FUNCTIONS

const add = (c1, c2) => ({ r: c1.r + c2.r, i: c1.i + c2.i });
const mult = (c, scaler) => ({ r: c.r * scaler, i: c.i * scaler });

function lerp2d (x, y, bounds, { WIDTH, HEIGHT}) {
  const gWIDTH = bounds[1].r - bounds[0].r;
  const gHEIGHT = bounds[1].i - bounds[0].i;
  const gLEFT = bounds[0].r;
  const gTOP = bounds[1].i;
  const scaleX = gWIDTH / WIDTH;
  const scaleY = -gHEIGHT / HEIGHT;
  return { r: x * scaleX + gLEFT, i: y * scaleY + gTOP };
}

function computeBounds (center, magnification, aspect) {
  let h = 2 / magnification;
  let w = aspect * h;
  return [
    { r: center.r - w/2, i: center.i - h/2 },
    { r: center.r + w/2, i: center.i + h/2 },
  ];
}

function clampMagnification (magnification) {
  const HIGHEST = 1e5;
  const LOWEST = 0.75;
  return Math.max(Math.min(magnification, HIGHEST), LOWEST)
}

function zoom (x, y, delta, center, magnification, { WIDTH, HEIGHT }) {
  const bounds = computeBounds(center, magnification, WIDTH / HEIGHT);
  const c = lerp2d(x, y, bounds, { WIDTH, HEIGHT});
  const negc = mult(c, -1);
  // Compute new bounds
  // 1. offset
  center = add(center, negc);
  // 2. scale
  const scale = Math.max(1 + delta * 0.01, 0.7);
  const oldMagnification = magnification;
  magnification /= scale;
  magnification = clampMagnification(magnification);
  const clampedScale = oldMagnification / magnification;
  center = mult(center, clampedScale);
  // 3. onset
  center = add(center, c);

  return [center, magnification];
}

function twoFingerZoom (ox, oy, scale, center, magnification, {WIDTH, HEIGHT}) {
  const bounds = computeBounds(center, magnification, WIDTH / HEIGHT);
  const c = lerp2d(ox, oy, bounds, { WIDTH, HEIGHT});
  const negc = mult(c, -1);
  // Compute new bounds
  // 1. offset
  center = add(center, negc);
  // 2. scale
  const oldMagnification = magnification;
  magnification /= scale;
  magnification = clampMagnification(magnification);
  const clampedScale = oldMagnification / magnification;
  center = mult(center, clampedScale);
  // 3. onset
  center = add(center, c);
  return [center, magnification];
}

function clampCenter (center) {
  const RADIUS = 1.5;
  const CENTER = {r: -0.5, i: 0};

  const v = add(center, mult(CENTER, -1));
  const d = Math.sqrt(v.r ** 2 + v.i ** 2);
  if (d > RADIUS) {
    const scale = RADIUS / d;
    center = add(mult(v, scale), CENTER);
  }
  return center;
}

function pan (x, y, x0, y0, center, magnification, {WIDTH, HEIGHT}) {
  const bounds = computeBounds(center, magnification, WIDTH / HEIGHT);
  const c = lerp2d(x, y, bounds, {WIDTH, HEIGHT});
  const prevC = lerp2d(x0, y0, bounds, {WIDTH, HEIGHT});
  const diff = add(mult(c, -1), prevC);
  center = add(center, diff);
  center = clampCenter(center);
  return center;
}

function mean2d(points) {
  const mean = {x: 0, y: 0};
  let n = 0;
  for (const id in points) {
    n++;
    mean.x += points[id].x;
    mean.y += points[id].y;
  }

  if (n === 0) return null;

  mean.x /= n;
  mean.y /= n;
  return mean;
}

function meanDistanceFromPoint(points, mean) {
  let distance = 0;
  let n = 0;
  for (const id in points) {
    n++;
    const dx2 = (mean.x - points[id].x) ** 2;
    const dy2 = (mean.y - points[id].y) ** 2;
    distance += Math.sqrt(dx2 + dy2);
  }

  if (n === 0) return null;

  return distance / n;
}

function downloadBlob(blob, name = 'file.txt') {
  // Convert your blob into a Blob URL (a special url that points to an object in the browser's memory)
  const blobUrl = URL.createObjectURL(blob);

  window.open(blobUrl, '_blank');
}

// MAIN

const canvas = document.getElementById("canvas");
let WIDTH = canvas.clientWidth;
let HEIGHT = canvas.clientHeight;

// Setup shader
const vertexShaderSource = `
#version 100
attribute vec2 position;
void main() {
gl_Position = vec4(position.x, position.y, 0.0, 1.0);
}`

const fragmentShaderSource = `
#ifdef GL_ES
precision highp float;
#endif

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;
uniform float scaleX;
uniform float scaleY;
uniform float gLEFT;
uniform float gTOP;

// hsv2rgb source: https://stackoverflow.com/a/17897228
// All components are in the range [0…1], including hue.
vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

vec3 mandelbrot(vec2 pos){
  float zx = pos.x * scaleX + gLEFT;
  float zy = pos.y * scaleY + gTOP;
  
  const int maxIter = 1024;
  
  float cx = zx * 1.0;
  float cy = zy * 1.0;
  
  float count = 0.0;
  
  for(int i = 0; i < maxIter; ++i){
    if (zx * zx + zy * zy > 4.0) break;
    
    float temp = zx * zx - zy * zy;
    
    zy = 2.0 * zx * zy + cy;
    zx = temp + cx;
    
    count += 1.0;
  }
  if (count == float(maxIter)) return vec3(0.0, 0.0, 0.0);
  float smoothingMagic = 1.0 - log( (log2(zy * zy + zx * zx) / 2.0) / log(2.0) ) / log(2.0);
  return hsv2rgb(vec3((count + smoothingMagic) / 100.0, 0.9, 1.0));
}

void main( void ) {
  vec2 position = gl_FragCoord.xy / resolution;
  vec3 color = mandelbrot(position);
  gl_FragColor = vec4(color, 1.0 );
}`

canvas.width = WIDTH;
canvas.height = HEIGHT;
const gl = canvas.getContext("webgl");

gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);

let vertexShader = compileShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
let fragmentShader = compileShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
let program = buildProgram(gl, vertexShader, fragmentShader);

/* create a vertex buffer for a full-screen triangle */
var buffer = gl.createBuffer(gl.ARRAY_BUFFER);
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);

/* set up the position attribute */
let a_position = gl.getAttribLocation(program, "position");
gl.enableVertexAttribArray(a_position);
gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, 0, 0);

function drawGL(
  canvasWidth,
  canvasHeight,
  lowerBoundr,
  lowerBoundi,
  upperBoundr,
  upperBoundi
) {
  const gWIDTH = upperBoundr - lowerBoundr;
  const gLEFT = lowerBoundr;
  const scaleX = gWIDTH;

  const gHEIGHT = upperBoundi - lowerBoundi;
  const gTOP = lowerBoundi;
  const scaleY = gHEIGHT;

  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  var resolutionLocation = gl.getUniformLocation(program, "resolution");
  gl.uniform2f(resolutionLocation, canvasWidth, canvasHeight);

  var a_scaleX = gl.getUniformLocation(program, "scaleX");
  gl.uniform1f(a_scaleX, scaleX);
  var a_gLEFT = gl.getUniformLocation(program, "gLEFT");
  gl.uniform1f(a_gLEFT, gLEFT);

  var a_scaleY = gl.getUniformLocation(program, "scaleY");
  gl.uniform1f(a_scaleY, scaleY);
  var a_gTOP = gl.getUniformLocation(program, "gTOP");
  gl.uniform1f(a_gTOP, gTOP);

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

function compileShader (gl, source, type) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return shader;
}

function buildProgram (gl, vertexShader, fragmentShader) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.detachShader(program, vertexShader);
  gl.detachShader(program, fragmentShader);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const linkErrLog = gl.getProgramInfoLog(program);
    gl.useProgram(null);
    gl.deleteProgram(program);
    throw new Error("Shader program did not link successfully. " + "Error log: " + linkErrLog);
  }
  gl.useProgram(program);
  return program;
}

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

function setupSize () {
  WIDTH = canvas.clientWidth;
  HEIGHT = canvas.clientHeight;

  canvas.width = WIDTH;
  canvas.height = HEIGHT;

  draw();
  updateSaveLink();
}

setupSize();

const observer = new ResizeObserver(setupSize);
observer.observe(canvas, { box: 'content-box' });

function draw () {
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

function updateSaveLink() {
  const imageLink = document.getElementById('save-link');
  URL.revokeObjectURL(imageLink.href);
  draw();
  canvas.toBlob(blob => imageLink.href = URL.createObjectURL(blob), "image/png");
}

canvas.addEventListener("wheel", event => {
  event.preventDefault();
  [center, magnification] = zoom(event.offsetX, event.offsetY, event.deltaY, center, magnification, {WIDTH, HEIGHT})
  draw();
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

    draw();
  },
);

canvas.addEventListener("pointerup", event => {
  delete pointers[event.pointerId];
  updateSaveLink();
});

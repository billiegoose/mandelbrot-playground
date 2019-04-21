// TODO: Learn how I can make the shader interactive.

const vertexShaderSource = `
#version 100
void main() {
gl_Position = vec4(0.0, 0.0, 0.0, 1.0);
gl_PointSize = 600.0;
}`

const fragmentShaderSource = `
#ifdef GL_ES
precision mediump float;
#endif

#extension GL_OES_standard_derivatives : enable

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;
uniform float scaleX;
uniform float scaleY;
uniform float gLEFT;
uniform float gTOP;
uniform int depthScale;

float mandelbrot(vec2 pos){
  float zx = pos.x * scaleX + gLEFT; // 3.5 - 2.5;
  float zy = pos.y * scaleY + gTOP; // 2.0 - 1.5;
  
  const int maxItter = 1024;
  
  float cx = zx * 1.0;
  float cy = zy * 1.0;
  
  // float itteration = 1.0;
  float itteration = 0.0;
  
  for(int i = 0; i < maxItter; ++i){
    if (zx * zx + zy * zy > 4.0) break;
    
    float temp = zx * zx - zy * zy;
    
    zy = 2.0 * zx * zy + cy;
    zx = temp + cx;
    
    // itteration *= 0.95;
    // itteration += 1.0 / float(maxItter);
    if (i > depthScale - 255) itteration += 1.0 / 255.0;
  }
  // return 1.0 - itteration;
  return itteration;
}

void main( void ) {
  vec2 position = gl_FragCoord.xy / resolution;
  vec3 color = vec3(0.0);
        color += mandelbrot(position);
  gl_FragColor = vec4(color, 1.0 );
}`

let gl = getContext(document.getElementById("canvas2"));

gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);

let vertexShader = compileShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
let fragmentShader = compileShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
let program = buildProgram(gl, vertexShader, fragmentShader);

var resolutionLocation = gl.getUniformLocation(program, "resolution");
gl.uniform2f(resolutionLocation, 600.0, 400.0);
console.log(resolutionLocation);

var scaleX = gl.getUniformLocation(program, "scaleX");
gl.uniform1f(scaleX, 3);
var gLEFT = gl.getUniformLocation(program, "gLEFT");
gl.uniform1f(gLEFT, -2);

var scaleY = gl.getUniformLocation(program, "scaleY");
gl.uniform1f(scaleY, 2.0);
var gTOP = gl.getUniformLocation(program, "gTOP");
gl.uniform1f(gTOP, -1);

var depthScale = gl.getUniformLocation(program, "depthScale");
gl.uniform1i(depthScale, 255);

gl.enableVertexAttribArray(0);
const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.vertexAttribPointer(0, 1, gl.FLOAT, false, 0, 0);

gl.drawArrays(gl.POINTS, 0, 1);

function cleanup(gl, buffer, program) {
  gl.useProgram(null);
  if (buffer) gl.deleteBuffer(buffer);
  if (program) gl.deleteProgram(program);
}

function getContext (canvas) {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  return canvas.getContext("webgl");
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

export function drawGL(
  canvasWidth,
  canvasHeight,
  lowerBoundr,
  lowerBoundi,
  upperBoundr,
  upperBoundi,
  depthScale
) {
  const gWIDTH = upperBoundr - lowerBoundr;
  const gLEFT = lowerBoundr;
  const scaleX = gWIDTH;

  const gHEIGHT = upperBoundi - lowerBoundi;
  const gTOP = lowerBoundi;
  const scaleY = gHEIGHT;

  var resolutionLocation = gl.getUniformLocation(program, "resolution");
  gl.uniform2f(resolutionLocation, canvasWidth, canvasHeight);

  var a_scaleX = gl.getUniformLocation(program, "scaleX");
  gl.uniform1f(a_scaleX, scaleX);
  console.log('scaleX', scaleX);
  var a_gLEFT = gl.getUniformLocation(program, "gLEFT");
  gl.uniform1f(a_gLEFT, gLEFT);
  console.log('gLEFT', gLEFT);

  var a_scaleY = gl.getUniformLocation(program, "scaleY");
  gl.uniform1f(a_scaleY, scaleY);
  console.log('scaleY', scaleY);
  var a_gTOP = gl.getUniformLocation(program, "gTOP");
  gl.uniform1f(a_gTOP, gTOP);
  console.log('gTOP', gTOP);

  var a_depthScale = gl.getUniformLocation(program, "depthScale");
  gl.uniform1i(a_depthScale, depthScale);

  gl.enableVertexAttribArray(0);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.vertexAttribPointer(0, 1, gl.FLOAT, false, 0, 0);

  gl.drawArrays(gl.POINTS, 0, 1);
}

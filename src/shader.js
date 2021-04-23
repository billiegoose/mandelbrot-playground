// TODO: Learn how I can make the shader interactive.

const vertexShaderSource = `
#version 100
void main() {
gl_Position = vec4(0.0, 0.0, 0.0, 1.0);
gl_PointSize = 600.0;
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

// ------
// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

uniform float ONE;
/*
About LUMA_FP64_CODE_ELIMINATION_WORKAROUND
The purpose of this workaround is to prevent shader compilers from
optimizing away necessary arithmetic operations by swapping their sequences
or transform the equation to some 'equivalent' from.
The method is to multiply an artifical variable, ONE, which will be known to
the compiler to be 1 only at runtime. The whole expression is then represented
as a polynomial with respective to ONE. In the coefficients of all terms, only one a
and one b should appear
err = (a + b) * ONE^6 - a * ONE^5 - (a + b) * ONE^4 + a * ONE^3 - b - (a + b) * ONE^2 + a * ONE
*/
// Divide float number to high and low floats to extend fraction bits
vec2 split(float a) {
  const float SPLIT = 4097.0;
  float t = a * SPLIT;
#if defined(LUMA_FP64_CODE_ELIMINATION_WORKAROUND)
  float a_hi = t * ONE - (t - a);
  float a_lo = a * ONE - a_hi;
#else
  float a_hi = t - (t - a);
  float a_lo = a - a_hi;
#endif
  return vec2(a_hi, a_lo);
}
// Divide float number again when high float uses too many fraction bits
vec2 split2(vec2 a) {
  vec2 b = split(a.x);
  b.y += a.y;
  return b;
}
// Special sum operation when a > b
vec2 quickTwoSum(float a, float b) {
#if defined(LUMA_FP64_CODE_ELIMINATION_WORKAROUND)
  float sum = (a + b) * ONE;
  float err = b - (sum - a) * ONE;
#else
  float sum = a + b;
  float err = b - (sum - a);
#endif
  return vec2(sum, err);
}
// General sum operation
vec2 twoSum(float a, float b) {
  float s = (a + b);
#if defined(LUMA_FP64_CODE_ELIMINATION_WORKAROUND)
  float v = (s * ONE - a) * ONE;
  float err = (a - (s - v) * ONE) * ONE * ONE * ONE + (b - v);
#else
  float v = s - a;
  float err = (a - (s - v)) + (b - v);
#endif
  return vec2(s, err);
}
vec2 twoSub(float a, float b) {
  float s = (a - b);
#if defined(LUMA_FP64_CODE_ELIMINATION_WORKAROUND)
  float v = (s * ONE - a) * ONE;
  float err = (a - (s - v) * ONE) * ONE * ONE * ONE - (b + v);
#else
  float v = s - a;
  float err = (a - (s - v)) - (b + v);
#endif
  return vec2(s, err);
}
vec2 twoSqr(float a) {
  float prod = a * a;
  vec2 a_fp64 = split(a);
#if defined(LUMA_FP64_CODE_ELIMINATION_WORKAROUND)
  float err = ((a_fp64.x * a_fp64.x - prod) * ONE + 2.0 * a_fp64.x *
    a_fp64.y * ONE * ONE) + a_fp64.y * a_fp64.y * ONE * ONE * ONE;
#else
  float err = ((a_fp64.x * a_fp64.x - prod) + 2.0 * a_fp64.x * a_fp64.y) + a_fp64.y * a_fp64.y;
#endif
  return vec2(prod, err);
}
vec2 twoProd(float a, float b) {
  float prod = a * b;
  vec2 a_fp64 = split(a);
  vec2 b_fp64 = split(b);
  float err = ((a_fp64.x * b_fp64.x - prod) + a_fp64.x * b_fp64.y +
    a_fp64.y * b_fp64.x) + a_fp64.y * b_fp64.y;
  return vec2(prod, err);
}
vec2 sum_fp64(vec2 a, vec2 b) {
  vec2 s, t;
  s = twoSum(a.x, b.x);
  t = twoSum(a.y, b.y);
  s.y += t.x;
  s = quickTwoSum(s.x, s.y);
  s.y += t.y;
  s = quickTwoSum(s.x, s.y);
  return s;
}
vec2 sub_fp64(vec2 a, vec2 b) {
  vec2 s, t;
  s = twoSub(a.x, b.x);
  t = twoSub(a.y, b.y);
  s.y += t.x;
  s = quickTwoSum(s.x, s.y);
  s.y += t.y;
  s = quickTwoSum(s.x, s.y);
  return s;
}
vec2 mul_fp64(vec2 a, vec2 b) {
  vec2 prod = twoProd(a.x, b.x);
  // y component is for the error
  prod.y += a.x * b.y;
#if defined(LUMA_FP64_HIGH_BITS_OVERFLOW_WORKAROUND)
  prod = split2(prod);
#endif
  prod = quickTwoSum(prod.x, prod.y);
  prod.y += a.y * b.x;
#if defined(LUMA_FP64_HIGH_BITS_OVERFLOW_WORKAROUND)
  prod = split2(prod);
#endif
  prod = quickTwoSum(prod.x, prod.y);
  return prod;
}
vec2 div_fp64(vec2 a, vec2 b) {
  float xn = 1.0 / b.x;
#if defined(LUMA_FP64_HIGH_BITS_OVERFLOW_WORKAROUND)
  vec2 yn = mul_fp64(a, vec2(xn, 0));
#else
  vec2 yn = a * xn;
#endif
  float diff = (sub_fp64(a, mul_fp64(b, yn))).x;
  vec2 prod = twoProd(xn, diff);
  return sum_fp64(yn, prod);
}
vec2 sqrt_fp64(vec2 a) {
  if (a.x == 0.0 && a.y == 0.0) return vec2(0.0, 0.0);
  if (a.x < 0.0) return vec2(0.0 / 0.0, 0.0 / 0.0);
  float x = 1.0 / sqrt(a.x);
  float yn = a.x * x;
#if defined(LUMA_FP64_CODE_ELIMINATION_WORKAROUND)
  vec2 yn_sqr = twoSqr(yn) * ONE;
#else
  vec2 yn_sqr = twoSqr(yn);
#endif
  float diff = sub_fp64(a, yn_sqr).x;
  vec2 prod = twoProd(x * 0.5, diff);
#if defined(LUMA_FP64_HIGH_BITS_OVERFLOW_WORKAROUND)
  return sum_fp64(split(yn), prod);
#else
  return sum_fp64(vec2(yn, 0.0), prod);
#endif
}
// ------

// Join a vec2 high precision float back into a low-precision float
float join(vec2 a) {
  float a_hi = a.x;
  float a_lo = a.y;
  return a_hi + a_lo;
}

// hsv2rgb source: https://stackoverflow.com/a/17897228
// All components are in the range [0…1], including hue.
vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

vec3 mandelbrot(vec2 pos){
  vec2 zx = sum_fp64(mul_fp64(split(pos.x), split(scaleX)), split(gLEFT));
  vec2 zy = sum_fp64(mul_fp64(split(pos.y), split(scaleY)), split(gTOP));
  
  const int maxIter = 1024;
  
  vec2 cx = zx;
  vec2 cy = zy;
  
  float count = 0.0;

  vec2 TWO = split(2.0);
  
  for(int i = 0; i < maxIter; ++i){
    if (join(sum_fp64(mul_fp64(zx, zx), mul_fp64(zy, zy))) > 4.0) break;
    
    vec2 temp = sub_fp64(mul_fp64(zx, zx), mul_fp64(zy, zy));
    
    zy = sum_fp64(mul_fp64(mul_fp64(TWO, zx), zy), cy);
    zx = sum_fp64(temp, cx);
    
    count += 1.0;
  }
  if (count == float(maxIter)) return vec3(0.0, 0.0, 0.0);
  float _temp = join(sum_fp64(mul_fp64(zy, zy), mul_fp64(zx, zx)));
  float smoothingMagic = 1.0 - log( (log2(_temp) / 2.0) / log(2.0) ) / log(2.0);
  return hsv2rgb(vec3((count + smoothingMagic) / 100.0, 0.9, 1.0));
}

void main( void ) {
  vec2 position = gl_FragCoord.xy / resolution;
  vec3 color = mandelbrot(position);
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


var one = gl.getUniformLocation(program, "ONE");
gl.uniform1f(one, 1);

var scaleX = gl.getUniformLocation(program, "scaleX");
gl.uniform1f(scaleX, 3);
var gLEFT = gl.getUniformLocation(program, "gLEFT");
gl.uniform1f(gLEFT, -2);

var scaleY = gl.getUniformLocation(program, "scaleY");
gl.uniform1f(scaleY, 2.0);
var gTOP = gl.getUniformLocation(program, "gTOP");
gl.uniform1f(gTOP, -1);

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
  upperBoundi
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
  var a_gLEFT = gl.getUniformLocation(program, "gLEFT");
  gl.uniform1f(a_gLEFT, gLEFT);

  var a_scaleY = gl.getUniformLocation(program, "scaleY");
  gl.uniform1f(a_scaleY, scaleY);
  var a_gTOP = gl.getUniformLocation(program, "gTOP");
  gl.uniform1f(a_gTOP, gTOP);

  gl.enableVertexAttribArray(0);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.vertexAttribPointer(0, 1, gl.FLOAT, false, 0, 0);

  gl.drawArrays(gl.POINTS, 0, 1);
}

export function init() {
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

  let gl = getContext(document.getElementById("canvas"));

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
  var a_position = gl.getAttribLocation(program, "position");
  gl.enableVertexAttribArray(a_position);
  gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, 0, 0);

  return function drawGL(
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

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }  
}

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

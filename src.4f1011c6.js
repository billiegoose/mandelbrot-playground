parcelRequire=function(e,r,t,n){var i,o="function"==typeof parcelRequire&&parcelRequire,u="function"==typeof require&&require;function f(t,n){if(!r[t]){if(!e[t]){var i="function"==typeof parcelRequire&&parcelRequire;if(!n&&i)return i(t,!0);if(o)return o(t,!0);if(u&&"string"==typeof t)return u(t);var c=new Error("Cannot find module '"+t+"'");throw c.code="MODULE_NOT_FOUND",c}p.resolve=function(r){return e[t][1][r]||r},p.cache={};var l=r[t]=new f.Module(t);e[t][0].call(l.exports,p,l,l.exports,this)}return r[t].exports;function p(e){return f(p.resolve(e))}}f.isParcelRequire=!0,f.Module=function(e){this.id=e,this.bundle=f,this.exports={}},f.modules=e,f.cache=r,f.parent=o,f.register=function(r,t){e[r]=[function(e,r){r.exports=t},{}]};for(var c=0;c<t.length;c++)try{f(t[c])}catch(e){i||(i=e)}if(t.length){var l=f(t[t.length-1]);"object"==typeof exports&&"undefined"!=typeof module?module.exports=l:"function"==typeof define&&define.amd?define(function(){return l}):n&&(this[n]=l)}if(parcelRequire=f,i)throw i;return f}({"Sp40":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.drawGL=x;var r="\n#version 100\nvoid main() {\ngl_Position = vec4(0.0, 0.0, 0.0, 1.0);\ngl_PointSize = 600.0;\n}",n="\n#ifdef GL_ES\nprecision highp float;\n#endif\n\nuniform float time;\nuniform vec2 mouse;\nuniform vec2 resolution;\nuniform float scaleX;\nuniform float scaleY;\nuniform float gLEFT;\nuniform float gTOP;\n\n// hsv2rgb source: https://stackoverflow.com/a/17897228\n// All components are in the range [0…1], including hue.\nvec3 hsv2rgb(vec3 c)\n{\n    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);\n    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);\n    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);\n}\n\nvec3 mandelbrot(vec2 pos){\n  float zx = pos.x * scaleX + gLEFT;\n  float zy = pos.y * scaleY + gTOP;\n  \n  const int maxIter = 1024;\n  \n  float cx = zx * 1.0;\n  float cy = zy * 1.0;\n  \n  float count = 0.0;\n  \n  for(int i = 0; i < maxIter; ++i){\n    if (zx * zx + zy * zy > 4.0) break;\n    \n    float temp = zx * zx - zy * zy;\n    \n    zy = 2.0 * zx * zy + cy;\n    zx = temp + cx;\n    \n    count += 1.0;\n  }\n  if (count == float(maxIter)) return vec3(0.0, 0.0, 0.0);\n  float smoothingMagic = 1.0 - log( (log2(zy * zy + zx * zx) / 2.0) / log(2.0) ) / log(2.0);\n  return hsv2rgb(vec3((count + smoothingMagic) / 100.0, 0.9, 1.0));\n}\n\nvoid main( void ) {\n  vec2 position = gl_FragCoord.xy / resolution;\n  vec3 color = mandelbrot(position);\n  gl_FragColor = vec4(color, 1.0 );\n}",e=s(document.getElementById("canvas2"));e.viewport(0,0,e.drawingBufferWidth,e.drawingBufferHeight),e.clearColor(0,0,0,1),e.clear(e.COLOR_BUFFER_BIT);var o=v(e,r,e.VERTEX_SHADER),t=v(e,n,e.FRAGMENT_SHADER),a=d(e,o,t),i=e.getUniformLocation(a,"resolution");e.uniform2f(i,600,400),console.log(i);var c=e.getUniformLocation(a,"scaleX");e.uniform1f(c,3);var f=e.getUniformLocation(a,"gLEFT");e.uniform1f(f,-2);var l=e.getUniformLocation(a,"scaleY");e.uniform1f(l,2);var g=e.getUniformLocation(a,"gTOP");e.uniform1f(g,-1),e.enableVertexAttribArray(0);var u=e.createBuffer();function m(r,n,e){r.useProgram(null),n&&r.deleteBuffer(n),e&&r.deleteProgram(e)}function s(r){return r.width=r.clientWidth,r.height=r.clientHeight,r.getContext("webgl")}function v(r,n,e){var o=r.createShader(e);return r.shaderSource(o,n),r.compileShader(o),o}function d(r,n,e){var o=r.createProgram();if(r.attachShader(o,n),r.attachShader(o,e),r.linkProgram(o),r.detachShader(o,n),r.detachShader(o,e),r.deleteShader(n),r.deleteShader(e),!r.getProgramParameter(o,r.LINK_STATUS)){var t=r.getProgramInfoLog(o);throw r.useProgram(null),r.deleteProgram(o),new Error("Shader program did not link successfully. Error log: "+t)}return r.useProgram(o),o}function x(r,n,o,t,i,c){var f=o,l=i-o,g=t,u=c-t,m=e.getUniformLocation(a,"resolution");e.uniform2f(m,r,n);var s=e.getUniformLocation(a,"scaleX");e.uniform1f(s,l);var v=e.getUniformLocation(a,"gLEFT");e.uniform1f(v,f);var d=e.getUniformLocation(a,"scaleY");e.uniform1f(d,u);var x=e.getUniformLocation(a,"gTOP");e.uniform1f(x,g),e.enableVertexAttribArray(0);var h=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,h),e.vertexAttribPointer(0,1,e.FLOAT,!1,0,0),e.drawArrays(e.POINTS,0,1)}e.bindBuffer(e.ARRAY_BUFFER,u),e.vertexAttribPointer(0,1,e.FLOAT,!1,0,0),e.drawArrays(e.POINTS,0,1);
},{}],"H99C":[function(require,module,exports) {
"use strict";var e=require("./shader.js");function t(e){return o(e)||r(e)||n()}function n(){throw new TypeError("Invalid attempt to spread non-iterable instance")}function r(e){if(Symbol.iterator in Object(e)||"[object Arguments]"===Object.prototype.toString.call(e))return Array.from(e)}function o(e){if(Array.isArray(e)){for(var t=0,n=new Array(e.length);t<e.length;t++)n[t]=e[t];return n}}var a=navigator.scheduling&&navigator.scheduling.isInputPending,i=document.getElementById("canvas"),u=document.getElementById("canvas2"),f=i.getContext("2d"),l=f.getImageData(0,0,i.width,i.height),s=i.clientWidth,c=i.clientHeight;console.log(s,c);var d=[{r:.2361513689220573,i:-.5210970613723728},{r:.23662026741217732,i:-.5207844623789595}],v=function(e){var t=e[1].r-e[0].r,n=e[1].i-e[0].i,r=e[0].r,o=e[1].i,a=t/(s-1),i=-n/(c-1);return function(e,t){return{r:t*a+r,i:e*i+o}}},g=function(e,t){return{r:e.r+t.r,i:e.i+t.i}},m=function(e,t){return{r:e.r*t,i:e.i*t}},h=function(e,t){var n=0,r=0,o=0,a=0,i=0;for(i=0;i<1024&&!(r+o>4);i++)a*=n,a+=a,r=(n=r-o+e)*n,o=(a+=t)*a;return 1024===i?i:i+(1-Math.log(Math.log2(r+o)/2/Math.log(2))/Math.log(2))};function p(e,t,n){var r,o,a,i,u,f,l,s;switch(1===arguments.length&&(t=e.s,n=e.v,e=e.h),f=n*(1-t),l=n*(1-(u=6*e-(i=Math.floor(6*e)))*t),s=n*(1-(1-u)*t),i%6){case 0:r=n,o=s,a=f;break;case 1:r=l,o=n,a=f;break;case 2:r=f,o=n,a=s;break;case 3:r=f,o=l,a=n;break;case 4:r=s,o=f,a=n;break;case 5:r=n,o=f,a=l}return{r:Math.round(255*r),g:Math.round(255*o),b:Math.round(255*a)}}var y=function(e,t,n,r,o,i,u){var f,l=0,s=n,c=(o-n)/(e-1),d=i-r,v=i,g=-d/(t-1);document.getElementById("scale").value=(2/d).toExponential(2);for(var m=0;m<t;m++)for(var y=0;y<e;y++){var E=Math.max(0,h(y*c+s,m*g+v));if(f=1024===E?{r:0,g:0,b:0}:p(E/100,.9,1),u[l]=f.r,u[l+1]=f.g,u[l+2]=f.b,u[l+3]=255,l+=4,a){if(navigator.scheduling.isInputPending(["wheel"]))return console.log("wheel break!"),!1;if(b&&navigator.scheduling.isInputPending(["mousemove"])&&!navigator.scheduling.isInputPending(["mouseup"]))return!1}}return!0},E=function(){var e=performance.now();if(y(s,c,d[0].r,d[0].i,d[1].r,d[1].i,l.data)){console.log("draw"),f.putImageData(l,0,0);var t=performance.now();document.getElementById("ms").value=Math.floor(t-e),console.log(JSON.stringify(d))}};E(),E(),E();var w=function(){var t=performance.now();(0,e.drawGL)(s,c,d[0].r,d[0].i,d[1].r,d[1].i),console.log("draw2");var n=performance.now();document.getElementById("ms2").value=Math.floor(n-t),console.log(JSON.stringify(d));var r=d[1].i-d[0].i;document.getElementById("scale2").value=(2/r).toExponential(2)};w(),i.addEventListener("wheel",function(e){var t=v(d)(e.offsetY,e.offsetX),n=m(t,-1);e.preventDefault(),d[0]=g(d[0],n),d[1]=g(d[1],n);var r=Math.max(1+.01*e.deltaY,.7);d[0]=m(d[0],r),d[1]=m(d[1],r),d[0]=g(d[0],t),d[1]=g(d[1],t),E(),w()}),u.addEventListener("wheel",function(e){var t=v(d)(e.offsetY,e.offsetX),n=m(t,-1);e.preventDefault(),d[0]=g(d[0],n),d[1]=g(d[1],n);var r=Math.max(1+.01*e.deltaY,.7);d[0]=m(d[0],r),d[1]=m(d[1],r),d[0]=g(d[0],t),d[1]=g(d[1],t),w()});var I=null,b=!1,M=function(e){var n=v(d),r=n(e.offsetY,e.offsetX);if(document.getElementById("output").value=h(r.r,r.i).toFixed(2),b){if(I){var o=n.apply(void 0,t(I)),a=g(m(r,-1),o);d[0]=g(d[0],a),d[1]=g(d[1],a)}I=[e.offsetY,e.offsetX],E(),w()}e.preventDefault()};function L(e,t,n,r){var o,a,i;return function(){if(i=this,a=Array.prototype.slice.call(arguments),!o||!n&&!r){if(!n)return u(),o=setTimeout(function(){u(),e.apply(i,a)},t);o=setTimeout(u,t),e.apply(i,a)}function u(){clearTimeout(o),o=null}}}a?i.addEventListener("mousemove",M):i.addEventListener("mousemove",L(M),16),i.addEventListener("mousedown",function(e){b=!0}),u.addEventListener("mousemove",L(function(e){var n=v(d),r=n(e.offsetY,e.offsetX);if(document.getElementById("output2").value=h(r.r,r.i).toFixed(2),b){if(I){var o=n.apply(void 0,t(I)),a=g(m(r,-1),o);d[0]=g(d[0],a),d[1]=g(d[1],a)}I=[e.offsetY,e.offsetX],w()}e.preventDefault()}),16),u.addEventListener("mousedown",function(e){b=!0}),document.addEventListener("mouseup",function(e){b=!1,I=null});
},{"./shader.js":"Sp40"}]},{},["H99C"], null)
//# sourceMappingURL=src.4f1011c6.js.map
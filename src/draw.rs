#[no_mangle]
pub fn add(a: i32, b: i32) -> i32 {
  return a + b
}

#[no_mangle]
pub fn iter(r: f64, i: f64, depthScale: u32) -> u32 {
  let mut pzr = 0f64;
  let mut pzi = 0f64;
  let mut zr = 0f64;
  let mut zi = 0f64;
  for n in 0u32..depthScale {
    zr = pzr * pzr - pzi * pzi + r;
    zi = 2f64 * pzr * pzi + i;

    if zr * zr + zi * zi > 4f64 {
      return n;
    }
    pzr = zr;
    pzi = zi;
  }
  return depthScale;
}

// #[no_mangle]
// pub fn drawCanvas(
//   canvasWidth: f64, canvasHeight: f64,
//   lowerBoundr: f64, lowerBoundi: f64,
//   upperBoundr: f64, upperBoundi: f64,
//   depthScale: f64, data) => {
//   let n = 0;
//   let min = 255;

//   const gWIDTH = upperBoundr - lowerBoundr;
//   const gLEFT = lowerBoundr;
//   const scaleX = gWIDTH / (canvasWidth - 1);

//   const gHEIGHT = upperBoundi - lowerBoundi;
//   const gTOP = upperBoundi;
//   const scaleY = -gHEIGHT / (canvasHeight - 1);

//   let val;
//   for (let y = 0; y < canvasHeight; y++) {
//     for (let x = 0; x < canvasWidth; x++) {
//       val = Math.floor(iterRust(x * scaleX + gLEFT, y * scaleY + gTOP, depthScale)) - (depthScale - 255);
//       min = Math.min(min, val);
//       data[n] = val;
//       data[n + 1] = val;
//       data[n + 2] = val;
//       data[n + 3] = 255;
//       n += 4;
//     }
//   }
//   depthScale += min;
//   return depthScale;
// };
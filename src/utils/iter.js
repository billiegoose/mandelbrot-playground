// Note: iter and iterRust seem to be about the same speed. Probably any speed gains are offset by the back-and-forth between JS and Rust.
export const iter = (r, i) => {
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
    zi += zi + i;

    pzr = zr;
    pzrs = pzr * pzr;
    pzis = zi * zi;
  }
  if (n === 1024) return n;
  const smoothingMagic = 1.0 - Math.log( (Math.log2(pzrs + pzis) / 2.0) / Math.log(2.0) ) / Math.log(2.0);
  return n + smoothingMagic;
};

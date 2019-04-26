import Decimal from 'decimal.js'

// Note: iter and iterRust seem to be about the same speed. Probably any speed gains are offset by the back-and-forth between JS and Rust.
export const iter = (r, i) => {
  let pzr = new Decimal(0);
  let pzrs = new Decimal(0);
  let pzis = new Decimal(0);
  let zr = new Decimal(0);
  let zi = new Decimal(0);
  let n = 0;
  for (n = 0; n < 1024; n++) {
    if (pzrs.plus(pzis).greaterThan(4)) {
      break;
    }
    zr = pzrs.minus(pzis).plus(r);
    zi = pzr.times(zi);
    zi = zi.plus(zi).plus(i);

    pzr = zr;
    pzrs = pzr.times(pzr);
    pzis = zi.times(zi);
  }
  if (n === 1024) return n;
  const smoothingMagic = 1.0 - Math.log( (Math.log2(pzrs.toNumber() + pzis.toNumber()) / 2.0) / Math.log(2.0) ) / Math.log(2.0);
  return n + smoothingMagic;
};

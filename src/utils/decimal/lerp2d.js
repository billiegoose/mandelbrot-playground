export function lerp2d (x, y, bounds, { WIDTH, HEIGHT}) {
  const gWIDTH = bounds[1].r.minus(bounds[0].r);
  const gHEIGHT = bounds[1].i.minus(bounds[0].i);
  const gLEFT = bounds[0].r;
  const gTOP = bounds[1].i;
  const scaleX = gWIDTH.dividedBy(WIDTH);
  const scaleY = gHEIGHT.dividedBy(HEIGHT);
  return {
    "r": scaleX.times(x).plus(gLEFT),
    "i": scaleY.times(-y).plus(gTOP)
  };
}
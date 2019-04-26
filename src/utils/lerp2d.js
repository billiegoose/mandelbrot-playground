export function lerp2d (x, y, bounds, { WIDTH, HEIGHT}) {
  const gWIDTH = bounds[1].r - bounds[0].r;
  const gHEIGHT = bounds[1].i - bounds[0].i;
  const gLEFT = bounds[0].r;
  const gTOP = bounds[1].i;
  const scaleX = gWIDTH / WIDTH;
  const scaleY = -gHEIGHT / HEIGHT;
  return { r: x * scaleX + gLEFT, i: y * scaleY + gTOP };
}
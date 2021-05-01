export function bounds (center, magnification, aspect) {
  let h = 2 / magnification;
  let w = aspect * h;
  return [
    { r: center.r - w/2, i: center.i - h/2 },
    { r: center.r + w/2, i: center.i + h/2 },
  ];
}

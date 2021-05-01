import { add, mult } from "./complex";

const RADIUS = 1.5;
const CENTER = {r: -0.5, i: 0};

export const clampCenter = (center) => {
  const v = add(center, mult(CENTER, -1));
  const d = Math.sqrt(v.r ** 2 + v.i ** 2);
  if (d > RADIUS) {
    const scale = RADIUS / d;
    center = add(mult(v, scale), CENTER);
  }
  return center;
}

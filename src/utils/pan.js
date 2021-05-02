import { lerp2d} from './lerp2d.js'
import { add, mult } from './complex.js'
import { bounds as computeBounds } from './bounds.js'
import { clampCenter } from './clampCenter.js';

export const pan = (x, y, x0, y0, center, magnification, {WIDTH, HEIGHT}) => {
  const bounds = computeBounds(center, magnification, WIDTH / HEIGHT);
  const c = lerp2d(x, y, bounds, {WIDTH, HEIGHT});
  const prevC = lerp2d(x0, y0, bounds, {WIDTH, HEIGHT});
  const diff = add(mult(c, -1), prevC);
  center = add(center, diff);
  center = clampCenter(center);
  return center;
}

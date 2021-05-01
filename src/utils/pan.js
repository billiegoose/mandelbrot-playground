import { lerp2d} from './lerp2d.js'
import { add, mult } from './complex'
import { bounds as computeBounds } from './bounds'

export const pan = (x, y, x0, y0, center, magnification, {WIDTH, HEIGHT}) => {
  const bounds = computeBounds(center, magnification, WIDTH / HEIGHT);
  const c = lerp2d(x, y, bounds, {WIDTH, HEIGHT});
  const prevC = lerp2d(x0, y0, bounds, {WIDTH, HEIGHT});
  const diff = add(mult(c, -1), prevC);
  center = add(center, diff);
  return center;
}

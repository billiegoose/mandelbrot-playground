import { lerp2d} from './lerp2d.js'
import { add, mult } from './complex'

export const pan = (x, y, x0, y0, bounds, {WIDTH, HEIGHT}) => {
  const c = lerp2d(x, y, bounds, {WIDTH, HEIGHT});
  const prevC = lerp2d(x0, y0, bounds, {WIDTH, HEIGHT});
  let diff = add(mult(c, -1), prevC);
  bounds[0] = add(bounds[0], diff);
  bounds[1] = add(bounds[1], diff);
  return bounds
}
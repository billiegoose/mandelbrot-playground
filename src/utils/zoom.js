import { add, mult } from './complex.js'
import { lerp2d } from './lerp2d.js'


export const zoom = (x, y, delta, bounds, { WIDTH, HEIGHT }) => {
  const c = lerp2d(x, y, bounds, { WIDTH, HEIGHT});
  const negc = mult(c, -1);
  // Compute new bounds
  // 1. offset
  bounds[0] = add(bounds[0], negc);
  bounds[1] = add(bounds[1], negc);
  // 2. scale
  const scale = Math.max(1 + delta * 0.01, 0.7);
  bounds[0] = mult(bounds[0], scale);
  bounds[1] = mult(bounds[1], scale);
  // 3. onset
  bounds[0] = add(bounds[0], c);
  bounds[1] = add(bounds[1], c);
  return bounds;
}
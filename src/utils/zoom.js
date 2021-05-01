import { add, mult } from './complex.js'
import { lerp2d } from './lerp2d.js'
import { bounds as computeBounds } from './bounds.js'
import { clampMagnification } from './clampMagnification.js'

export const zoom = (x, y, delta, center, magnification, { WIDTH, HEIGHT }) => {
  const bounds = computeBounds(center, magnification, WIDTH / HEIGHT);
  const c = lerp2d(x, y, bounds, { WIDTH, HEIGHT});
  const negc = mult(c, -1);
  // Compute new bounds
  // 1. offset
  center = add(center, negc);
  // 2. scale
  const scale = Math.max(1 + delta * 0.01, 0.7);
  const oldMagnification = magnification;
  magnification /= scale;
  magnification = clampMagnification(magnification);
  const clampedScale = oldMagnification / magnification;
  center = mult(center, clampedScale);
  // 3. onset
  center = add(center, c);

  return [center, magnification];
}

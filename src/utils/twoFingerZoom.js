import { lerp2d} from './lerp2d.js'
import { add, mult } from './complex'
import { bounds as computeBounds } from './bounds.js'
import { clampMagnification } from './clampMagnification.js'

export const twoFingerZoomScale = (ox, oy, x, y, x0, y0) => {
  const d0 = Math.sqrt((x0 - ox) ** 2 + (y0 - oy) ** 2);
  const d1 = Math.sqrt((x - ox) ** 2 + (y - oy) ** 2);
  const scale = d0 / d1;
  document.getElementById('scale3').innerText = `${scale.toFixed(3)}`;
  return scale;
}

export const twoFingerZoom = (ox, oy, scale, center, magnification, {WIDTH, HEIGHT}) => {
  const bounds = computeBounds(center, magnification, WIDTH / HEIGHT);
  const c = lerp2d(ox, oy, bounds, { WIDTH, HEIGHT});
  const negc = mult(c, -1);
  // Compute new bounds
  // 1. offset
  center = add(center, negc);
  // 2. scale
  const oldMagnification = magnification;
  magnification /= scale;
  magnification = clampMagnification(magnification);
  const clampedScale = oldMagnification / magnification;
  center = mult(center, clampedScale);
  // 3. onset
  center = add(center, c);
  return [center, magnification];
}

import { lerp2d} from './lerp2d.js'
import { add, mult } from './complex'

export const twoFingerZoomScale = (ox, oy, x, y, x0, y0) => {
  const d0 = Math.sqrt((x0 - ox) ** 2 + (y0 - oy) ** 2);
  const d1 = Math.sqrt((x - ox) ** 2 + (y - oy) ** 2);
  const scale = d0 / d1;
  document.getElementById('scale3').innerText = `${scale.toFixed(3)}`;
  return scale;
}

export const twoFingerZoom = (ox, oy, scale, bounds, {WIDTH, HEIGHT}) => {
  const c = lerp2d(ox, oy, bounds, { WIDTH, HEIGHT});
  const negc = mult(c, -1);
  // Compute new bounds
  // 1. offset
  bounds[0] = add(bounds[0], negc);
  bounds[1] = add(bounds[1], negc);
  // 2. scale
  bounds[0] = mult(bounds[0], scale);
  bounds[1] = mult(bounds[1], scale);
  // 3. onset
  bounds[0] = add(bounds[0], c);
  bounds[1] = add(bounds[1], c);
  return bounds;
}

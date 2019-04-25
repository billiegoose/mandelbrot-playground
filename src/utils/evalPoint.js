import { lerp2d } from './lerp2d.js'
import { iter } from './iter.js'

export const evalPoint = (x, y, bounds, {WIDTH, HEIGHT}) => {
  const c = lerp2d(x, y, bounds, {WIDTH, HEIGHT});
  return iter(c.r, c.i);
}
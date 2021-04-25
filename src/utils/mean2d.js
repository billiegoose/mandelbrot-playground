export function mean2d(points) {
  const mean = {x: 0, y: 0};
  let n = 0;
  for (const id in points) {
    n++;
    mean.x += points[id].x;
    mean.y += points[id].y;
  }

  if (n === 0) return null;

  mean.x /= n;
  mean.y /= n;
  return mean;
}

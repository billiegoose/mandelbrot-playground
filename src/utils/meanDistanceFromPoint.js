export function meanDistanceFromPoint(points, mean) {
  let distance = 0;
  let n = 0;
  for (const id in points) {
    n++;
    const dx2 = (mean.x - points[id].x) ** 2;
    const dy2 = (mean.y - points[id].y) ** 2;
    distance += Math.sqrt(dx2 + dy2);
  }

  if (n === 0) return null;

  return distance / n;
}

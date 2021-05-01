const HIGHEST = 1e5;
const LOWEST = .75;

export const clampMagnification = (magnification) => {
  return Math.max(Math.min(magnification, HIGHEST), LOWEST)
}

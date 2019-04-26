export const add = (c1, c2) => (
  {
    r: c1.r.plus(c2.r),
    i: c1.i.plus(c2.i)
  }
);
export const mult = (c, scaler) => (
  {
    r: c.r.times(scaler),
    i: c.i.times(scaler)
  }
);

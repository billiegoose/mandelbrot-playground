export const add = (c1, c2) => ({ r: c1.r + c2.r, i: c1.i + c2.i });
export const mult = (c, scaler) => ({ r: c.r * scaler, i: c.i * scaler });

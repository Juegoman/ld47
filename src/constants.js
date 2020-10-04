export const RIGHT_BOUND = 190;
export const LEFT_BOUND = -1 * RIGHT_BOUND;
export const DEPTH = 80;
export const FRAME_PERIOD = 20;
export const CURVE = [...Array(DEPTH).keys()].map(n => Math.sqrt(DEPTH**2 - n**2));
export const curveFn = (i) => (-DEPTH + CURVE[i]) * 10;

/** Deterministická value-noise + fBm. Bez závislostí, stejný výsledek při každém běhu. */

function hash2(x: number, y: number, seed: number): number {
  let h = x * 374761393 + y * 668265263 + seed * 2147483647
  h = (h ^ (h >>> 13)) * 1274126177
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295
}

const smooth = (t: number) => t * t * (3 - 2 * t)

export function valueNoise(x: number, y: number, seed = 0): number {
  const xi = Math.floor(x), yi = Math.floor(y)
  const xf = x - xi, yf = y - yi
  const u = smooth(xf), v = smooth(yf)
  const a = hash2(xi, yi, seed)
  const b = hash2(xi + 1, yi, seed)
  const c = hash2(xi, yi + 1, seed)
  const d = hash2(xi + 1, yi + 1, seed)
  return (a * (1 - u) + b * u) * (1 - v) + (c * (1 - u) + d * u) * v
}

export function fbm(x: number, y: number, oktavy = 4, seed = 0): number {
  let sum = 0, amp = 0.5, freq = 1, norm = 0
  for (let i = 0; i < oktavy; i++) {
    sum += amp * valueNoise(x * freq, y * freq, seed + i * 17)
    norm += amp
    amp *= 0.5
    freq *= 2.07
  }
  return sum / norm
}

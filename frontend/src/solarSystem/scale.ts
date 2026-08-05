/**
 * Distance and size can't share one linear scale — Neptune orbits 78x farther
 * out than Mercury, and Jupiter's radius is 28x Mercury's. Each gets its own
 * compressed (sqrt / cube-root) scale so the whole system fits on screen with
 * every body still visible and distinguishable. Not to true relative scale.
 */

/** au -> pixel distance from the Sun, before zoom. */
export function distanceScaleAu(au: number): number {
  return 30 + 73 * Math.sqrt(au)
}

/** km (body radius) -> pixel radius, before zoom. Shared by planets and the Sun. */
export function sizeScaleKm(km: number): number {
  return Math.max(2.5, Math.cbrt(km) * 0.396 - 2.3)
}

import type { OrbitalElements } from './elements'

const DEG2RAD = Math.PI / 180
const AU_KM = 149597870.7
/** Standard gravitational parameter of the Sun, km^3/s^2. */
const GM_SUN = 1.32712440018e11

export interface HeliocentricPosition {
  /** Ecliptic-plane coordinates, au, Sun at origin. */
  x: number
  y: number
  z: number
  /** Heliocentric distance, au. */
  r: number
}

function normalizeDeg(deg: number): number {
  let d = deg % 360
  if (d < 0) d += 360
  return d
}

export function julianCenturiesSinceJ2000(date: Date): number {
  const julianDay = date.getTime() / 86400000 + 2440587.5
  return (julianDay - 2451545.0) / 36525
}

/** Solves Kepler's equation M = E - e*sin(E) for E (radians) via Newton-Raphson. */
function solveEccentricAnomaly(meanAnomalyDeg: number, e: number): number {
  const M = normalizeDeg(meanAnomalyDeg + 180) - 180 // wrap to [-180, 180)
  const Mrad = M * DEG2RAD
  let E = Mrad + e * Math.sin(Mrad)
  for (let i = 0; i < 10; i++) {
    const dM = Mrad - (E - e * Math.sin(E))
    const dE = dM / (1 - e * Math.cos(E))
    E += dE
    if (Math.abs(dE) < 1e-9) break
  }
  return E
}

/** Heliocentric ecliptic position of a planet at Julian centuries T since J2000.0. */
export function heliocentricPosition(el: OrbitalElements, T: number): HeliocentricPosition {
  const a = el.a0 + el.aDot * T
  const e = el.e0 + el.eDot * T
  const i = (el.i0 + el.iDot * T) * DEG2RAD
  const L = el.l0 + el.lDot * T
  const longPeri = el.longPeri0 + el.longPeriDot * T
  const longNode = el.longNode0 + el.longNodeDot * T

  const argPeri = (longPeri - longNode) * DEG2RAD
  const node = longNode * DEG2RAD
  const meanAnomaly = L - longPeri

  const E = solveEccentricAnomaly(meanAnomaly, e)
  const xOrb = a * (Math.cos(E) - e)
  const yOrb = a * Math.sqrt(1 - e * e) * Math.sin(E)

  const cosArgPeri = Math.cos(argPeri)
  const sinArgPeri = Math.sin(argPeri)
  const cosNode = Math.cos(node)
  const sinNode = Math.sin(node)
  const cosI = Math.cos(i)
  const sinI = Math.sin(i)

  const x =
    (cosArgPeri * cosNode - sinArgPeri * sinNode * cosI) * xOrb +
    (-sinArgPeri * cosNode - cosArgPeri * sinNode * cosI) * yOrb
  const y =
    (cosArgPeri * sinNode + sinArgPeri * cosNode * cosI) * xOrb +
    (-sinArgPeri * sinNode + cosArgPeri * cosNode * cosI) * yOrb
  const z = sinArgPeri * sinI * xOrb + cosArgPeri * sinI * yOrb

  return { x, y, z, r: Math.sqrt(x * x + y * y + z * z) }
}

/** Instantaneous orbital speed via the vis-viva equation, km/s. */
export function orbitalSpeedKmS(rAu: number, aAu: number): number {
  const rKm = rAu * AU_KM
  const aKm = aAu * AU_KM
  return Math.sqrt(GM_SUN * (2 / rKm - 1 / aKm))
}

/** Sidereal orbital period in Earth days, derived from the mean motion (L rate). */
export function orbitalPeriodDays(el: OrbitalElements): number {
  const degPerDay = el.lDot / 36525
  return 360 / degPerDay
}

/**
 * Keplerian orbital elements (heliocentric, mean ecliptic & equinox of J2000),
 * valid for 1800 AD - 2050 AD. These are the standard published elements used
 * for JPL's "approximate positions of the planets" method (a low-order fit to
 * the DE ephemerides, accurate to a few arcminutes over this date range) —
 * the same reference figures widely reproduced across astronomy references.
 *
 * a: semi-major axis (au)             e: eccentricity
 * I: inclination (deg)                L: mean longitude (deg)
 * longPeri: longitude of perihelion (deg)   longNode: longitude of ascending node (deg)
 * Each *Dot value is the rate of change per Julian century.
 */
export interface OrbitalElements {
  a0: number
  aDot: number
  e0: number
  eDot: number
  i0: number
  iDot: number
  l0: number
  lDot: number
  longPeri0: number
  longPeriDot: number
  longNode0: number
  longNodeDot: number
}

export interface PlanetColorStop {
  offset: number
  color: string
}

export interface Planet {
  key: string
  name: string
  radiusKm: number
  elements: OrbitalElements
  /** Radial gradient stops giving the planet a lit-sphere look, lightest first. */
  gradient: PlanetColorStop[]
  /** Optional flat horizontal cloud-band colors (gas giants). */
  bands?: string[]
  hasRings?: boolean
}

export const SUN_RADIUS_KM = 696000

export const PLANETS: Planet[] = [
  {
    key: 'mercury',
    name: 'Mercury',
    radiusKm: 2439.7,
    elements: {
      a0: 0.38709927, aDot: 0.00000037,
      e0: 0.20563593, eDot: 0.00001906,
      i0: 7.00497902, iDot: -0.00594749,
      l0: 252.25032350, lDot: 149472.67411175,
      longPeri0: 77.45779628, longPeriDot: 0.16047689,
      longNode0: 48.33076593, longNodeDot: -0.12534081,
    },
    gradient: [
      { offset: 0, color: '#c9c2b6' },
      { offset: 60, color: '#8f887c' },
      { offset: 100, color: '#5c5750' },
    ],
  },
  {
    key: 'venus',
    name: 'Venus',
    radiusKm: 6051.8,
    elements: {
      a0: 0.72333566, aDot: 0.00000390,
      e0: 0.00677672, eDot: -0.00004107,
      i0: 3.39467605, iDot: -0.00078890,
      l0: 181.97909950, lDot: 58517.81538729,
      longPeri0: 131.60246718, longPeriDot: 0.00268329,
      longNode0: 76.67984255, longNodeDot: -0.27769418,
    },
    gradient: [
      { offset: 0, color: '#f1e3c0' },
      { offset: 60, color: '#dcc48f' },
      { offset: 100, color: '#b89860' },
    ],
  },
  {
    key: 'earth',
    name: 'Earth',
    radiusKm: 6371.0,
    elements: {
      a0: 1.00000261, aDot: 0.00000562,
      e0: 0.01671123, eDot: -0.00004392,
      i0: -0.00001531, iDot: -0.01294668,
      l0: 100.46457166, lDot: 35999.37244981,
      longPeri0: 102.93768193, longPeriDot: 0.32327364,
      longNode0: 0, longNodeDot: 0,
    },
    gradient: [
      { offset: 0, color: '#7fb3e8' },
      { offset: 55, color: '#3f7cc9' },
      { offset: 100, color: '#1b3a6b' },
    ],
  },
  {
    key: 'mars',
    name: 'Mars',
    radiusKm: 3389.5,
    elements: {
      a0: 1.52371034, aDot: 0.00001847,
      e0: 0.09339410, eDot: 0.00007882,
      i0: 1.84969142, iDot: -0.00813131,
      l0: -4.55343205, lDot: 19140.30268499,
      longPeri0: -23.94362959, longPeriDot: 0.44441088,
      longNode0: 49.55953891, longNodeDot: -0.29257343,
    },
    gradient: [
      { offset: 0, color: '#e08e5f' },
      { offset: 55, color: '#c1440e' },
      { offset: 100, color: '#7a2b0a' },
    ],
  },
  {
    key: 'jupiter',
    name: 'Jupiter',
    radiusKm: 69911,
    elements: {
      a0: 5.20288700, aDot: -0.00011607,
      e0: 0.04838624, eDot: -0.00013253,
      i0: 1.30439695, iDot: -0.00183714,
      l0: 34.39644051, lDot: 3034.74612775,
      longPeri0: 14.72847983, longPeriDot: 0.21252668,
      longNode0: 100.47390909, longNodeDot: 0.20469106,
    },
    gradient: [
      { offset: 0, color: '#e8d3b0' },
      { offset: 60, color: '#c98a4b' },
      { offset: 100, color: '#8a5a30' },
    ],
    bands: ['#e8d3b0', '#c9a877', '#a9784f', '#d9b98a', '#b8895a', '#e0c9a0'],
  },
  {
    key: 'saturn',
    name: 'Saturn',
    radiusKm: 58232,
    elements: {
      a0: 9.53667594, aDot: -0.00125060,
      e0: 0.05386179, eDot: -0.00050991,
      i0: 2.48599187, iDot: 0.00193609,
      l0: 49.95424423, lDot: 1222.49362201,
      longPeri0: 92.59887831, longPeriDot: -0.41897216,
      longNode0: 113.66242448, longNodeDot: -0.28867794,
    },
    gradient: [
      { offset: 0, color: '#f0e3bb' },
      { offset: 60, color: '#d4bc82' },
      { offset: 100, color: '#a4865a' },
    ],
    bands: ['#f0e3bb', '#e0cd9c', '#d4bc82', '#e8d6a8'],
    hasRings: true,
  },
  {
    key: 'uranus',
    name: 'Uranus',
    radiusKm: 25362,
    elements: {
      a0: 19.18916464, aDot: -0.00196176,
      e0: 0.04725744, eDot: -0.00004397,
      i0: 0.77263783, iDot: -0.00242939,
      l0: 313.23810451, lDot: 428.48202785,
      longPeri0: 170.95427630, longPeriDot: 0.40805281,
      longNode0: 74.01692503, longNodeDot: 0.04240589,
    },
    gradient: [
      { offset: 0, color: '#c5f1ec' },
      { offset: 60, color: '#a9e8e0' },
      { offset: 100, color: '#6bbfb5' },
    ],
  },
  {
    key: 'neptune',
    name: 'Neptune',
    radiusKm: 24622,
    elements: {
      a0: 30.06992276, aDot: 0.00026291,
      e0: 0.00859048, eDot: 0.00005105,
      i0: 1.77004347, iDot: 0.00035372,
      l0: -55.12002969, lDot: 218.45945325,
      longPeri0: 44.96476227, longPeriDot: -0.32241464,
      longNode0: 131.78422574, longNodeDot: -0.00508664,
    },
    gradient: [
      { offset: 0, color: '#7690e0' },
      { offset: 55, color: '#3f5bc9' },
      { offset: 100, color: '#1c2f7a' },
    ],
  },
]

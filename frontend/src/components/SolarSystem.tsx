import { useEffect, useMemo, useState } from 'react'
import { PLANETS, SUN_RADIUS_KM } from '../solarSystem/elements'
import { heliocentricPosition, julianCenturiesSinceJ2000, orbitalPeriodDays, orbitalSpeedKmS } from '../solarSystem/kepler'
import { distanceScaleAu, sizeScaleKm } from '../solarSystem/scale'
import { useZoomPan } from '../solarSystem/useZoomPan'

function formatPeriod(days: number): string {
  return days < 500 ? `${days.toFixed(1)} days` : `${(days / 365.25).toFixed(2)} years`
}

export function SolarSystem() {
  const zp = useZoomPan<SVGSVGElement>()
  const [simTime, setSimTime] = useState(() => Date.now())
  const [playing, setPlaying] = useState(true)
  const [speedDaysPerSec, setSpeedDaysPerSec] = useState(4)
  const [selected, setSelected] = useState<string | null>(null)

  useEffect(() => {
    if (!playing) return
    let rafId: number
    let last = performance.now()
    const tick = (now: number) => {
      const dtSec = (now - last) / 1000
      last = now
      setSimTime((t) => t + speedDaysPerSec * dtSec * 86400000)
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [playing, speedDaysPerSec])

  const date = useMemo(() => new Date(simTime), [simTime])
  const T = useMemo(() => julianCenturiesSinceJ2000(date), [date])

  const positions = useMemo(
    () =>
      PLANETS.map((planet) => {
        const pos = heliocentricPosition(planet.elements, T)
        const dist = distanceScaleAu(pos.r)
        const angle = Math.atan2(pos.y, pos.x)
        return {
          planet,
          pos,
          screenX: dist * Math.cos(angle),
          screenY: -dist * Math.sin(angle),
        }
      }),
    [T],
  )

  const selectedInfo = useMemo(() => positions.find((p) => p.planet.key === selected) ?? null, [positions, selected])
  const sunRadius = sizeScaleKm(SUN_RADIUS_KM)

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-medium">Solar System</h1>
        <span className="text-sm text-[var(--text-muted)]">{date.toLocaleDateString()}</span>
      </div>

      <div
        className="relative mt-4 aspect-square w-full touch-none overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] active:cursor-grabbing"
        style={{ cursor: 'grab' }}
      >
        <svg ref={zp.ref} viewBox="-500 -500 1000 1000" className="h-full w-full select-none" {...zp.handlers}>
          <defs>
            <radialGradient id="grad-sun" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#fff6d5" />
              <stop offset="55%" stopColor="#ffd76a" />
              <stop offset="100%" stopColor="#f2a93b" />
            </radialGradient>
            {PLANETS.map((p) => (
              <radialGradient key={p.key} id={`grad-${p.key}`} cx="35%" cy="35%" r="65%">
                {p.gradient.map((stop, i) => (
                  <stop key={i} offset={`${stop.offset}%`} stopColor={stop.color} />
                ))}
              </radialGradient>
            ))}
            {PLANETS.filter((p) => p.bands).map((p) => (
              <clipPath key={p.key} id={`clip-${p.key}`}>
                <circle r={sizeScaleKm(p.radiusKm)} />
              </clipPath>
            ))}
          </defs>

          <g transform={`translate(${zp.transform.tx} ${zp.transform.ty}) scale(${zp.transform.scale})`}>
            {PLANETS.map((p) => (
              <circle
                key={p.key}
                r={distanceScaleAu(p.elements.a0)}
                fill="none"
                stroke="var(--border)"
                strokeWidth={1 / zp.transform.scale}
              />
            ))}

            <circle r={sunRadius} fill="url(#grad-sun)" />

            {positions.map(({ planet, screenX, screenY }) => {
              const r = sizeScaleKm(planet.radiusKm)
              const hitRadius = Math.max(r, 8 / zp.transform.scale)
              return (
                <g
                  key={planet.key}
                  transform={`translate(${screenX} ${screenY})`}
                  onClick={() => setSelected(planet.key)}
                  className="cursor-pointer"
                >
                  {planet.hasRings && (
                    <ellipse
                      rx={r * 2.3}
                      ry={r * 0.75}
                      fill="none"
                      stroke="#c9b482"
                      strokeWidth={r * 0.35}
                      opacity={0.55}
                    />
                  )}
                  {planet.bands ? (
                    <g clipPath={`url(#clip-${planet.key})`}>
                      {planet.bands.map((color, i) => (
                        <rect
                          key={i}
                          x={-r}
                          y={-r + (i * (2 * r)) / planet.bands!.length}
                          width={2 * r}
                          height={(2 * r) / planet.bands!.length + 0.5}
                          fill={color}
                        />
                      ))}
                      <circle r={r} fill={`url(#grad-${planet.key})`} opacity={0.35} />
                      {planet.key === 'jupiter' && (
                        <ellipse cx={r * 0.35} cy={r * 0.25} rx={r * 0.28} ry={r * 0.16} fill="#b5502f" opacity={0.7} />
                      )}
                    </g>
                  ) : (
                    <circle r={r} fill={`url(#grad-${planet.key})`} />
                  )}
                  <circle r={hitRadius} fill="transparent" />
                  {selected === planet.key && (
                    <circle r={r + 4 / zp.transform.scale} fill="none" stroke="var(--text)" strokeWidth={1 / zp.transform.scale} />
                  )}
                </g>
              )
            })}
          </g>
        </svg>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-[var(--text-muted)]">
        <button
          onClick={() => setPlaying((p) => !p)}
          className="rounded-md border border-[var(--border)] px-3 py-1 hover:border-[var(--text)] hover:text-[var(--text)]"
        >
          {playing ? 'Pause' : 'Play'}
        </button>
        <label className="flex items-center gap-2">
          Speed
          <input
            type="range"
            min={0.5}
            max={30}
            step={0.5}
            value={speedDaysPerSec}
            onChange={(e) => setSpeedDaysPerSec(Number(e.target.value))}
          />
          <span className="w-16 tabular-nums">{speedDaysPerSec}d/sec</span>
        </label>
        <button onClick={() => setSimTime(Date.now())} className="hover:text-[var(--text)]">
          Today
        </button>
        <div className="ml-auto flex gap-1">
          <button onClick={zp.zoomOut} className="rounded-md border border-[var(--border)] px-2.5 py-1 hover:border-[var(--text)] hover:text-[var(--text)]">
            −
          </button>
          <button onClick={zp.reset} className="rounded-md border border-[var(--border)] px-2.5 py-1 hover:border-[var(--text)] hover:text-[var(--text)]">
            Reset
          </button>
          <button onClick={zp.zoomIn} className="rounded-md border border-[var(--border)] px-2.5 py-1 hover:border-[var(--text)] hover:text-[var(--text)]">
            +
          </button>
        </div>
      </div>

      {selectedInfo ? (
        <div className="mt-3 rounded-md border border-[var(--border)] p-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="font-medium">{selectedInfo.planet.name}</span>
            <button onClick={() => setSelected(null)} className="text-[var(--text-muted)] hover:text-[var(--text)]">
              ✕
            </button>
          </div>
          <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-[var(--text-muted)]">
            <dt>Distance from Sun</dt>
            <dd>{selectedInfo.pos.r.toFixed(3)} au</dd>
            <dt>Orbital speed</dt>
            <dd>{orbitalSpeedKmS(selectedInfo.pos.r, selectedInfo.planet.elements.a0).toFixed(2)} km/s</dd>
            <dt>Orbital period</dt>
            <dd>{formatPeriod(orbitalPeriodDays(selectedInfo.planet.elements))}</dd>
            <dt>Radius</dt>
            <dd>{selectedInfo.planet.radiusKm.toLocaleString()} km</dd>
          </dl>
        </div>
      ) : (
        <p className="mt-3 text-sm text-[var(--text-muted)]">Click a planet for its distance, speed, and period.</p>
      )}

      <p className="mt-3 text-xs text-[var(--text-muted)]">
        Positions update live from standard heliocentric orbital elements (valid 1800–2050) via Kepler's equation —
        accurate to within a few arcminutes. Distances and sizes use independent compressed scales so the whole
        system fits on screen; they are not to true relative scale.
      </p>
    </div>
  )
}

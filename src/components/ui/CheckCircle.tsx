interface CheckCircleProps {
  value: number
  target: number
  size?: number
  onEdit?: () => void
}

const getPositiveColor = (pct: number, exceeded: boolean): string => {
  if (exceeded) return '#16a34a'
  if (pct >= 0.66) return '#1e3a5f'
  return '#0d9488'
}

export const CheckCircle = ({ value, target, size = 52, onEdit }: CheckCircleProps) => {
  const strokeWidth = 6
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const center = size / 2

  const hasTarget = target > 0
  const exceeded = hasTarget && value >= target
  const pct = hasTarget ? Math.min(value / target, 1) : 0
  const filled = pct * circumference
  const strokeColor = getPositiveColor(pct, exceeded)
  const displayValue = value > 0 ? `+${value}` : String(value)

  return (
    <button
      onClick={onEdit}
      className="shrink-0 flex flex-col items-center group"
      aria-label={`Progreso semanal: ${displayValue}${hasTarget ? ` de ${target}` : ''}`}
    >
      <div className="relative">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={center} cy={center} r={radius}
            fill="none" stroke="currentColor" strokeWidth={strokeWidth}
            strokeDasharray={hasTarget ? undefined : '4 4'}
            className="text-sepia-200 dark:text-sepia-700"
          />
          {pct > 0 && (
            <circle
              cx={center} cy={center} r={radius}
              fill="none" stroke={strokeColor} strokeWidth={strokeWidth}
              strokeDasharray={`${filled} ${circumference}`}
              strokeLinecap="round"
              transform={`rotate(-90 ${center} ${center})`}
              style={{ transition: 'stroke-dasharray 0.4s ease' }}
            />
          )}
          <text
            x={center} y={center - (hasTarget ? 2 : 1)}
            textAnchor="middle" fontSize={hasTarget ? '11' : '10'} fontWeight="700"
            fill={value === 0 ? '#b89f7c' : strokeColor}
          >
            {displayValue}
          </text>
          {hasTarget ? (
            <text x={center} y={center + 9} textAnchor="middle" fontSize="8" fill="#8b7355">
              /{target}
            </text>
          ) : (
            <text x={center} y={center + 10} textAnchor="middle" fontSize="9" fill="#b89f7c"
              className="group-hover:fill-[#1e3a5f] transition-colors">
              +meta
            </text>
          )}
        </svg>
        {exceeded && (
          <span className="absolute -top-1 -right-1 text-sm leading-none">✓</span>
        )}
      </div>
    </button>
  )
}

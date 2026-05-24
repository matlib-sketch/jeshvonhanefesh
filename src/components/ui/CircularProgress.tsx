import type { Middah } from '../../core/domain/types'

interface CircularProgressProps {
  middah: Middah
  value: number      // puntaje acumulado esta semana (puede ser negativo)
  target: number     // objetivo semanal (0 = sin objetivo)
  size?: number
  onEdit?: () => void
}

const getPositiveColor = (pct: number, exceeded: boolean): string => {
  if (exceeded) return '#16a34a'
  if (pct >= 0.66) return '#1e3a5f'
  return '#0d9488'
}

export const CircularProgress = ({ middah, value, target, size = 84, onEdit }: CircularProgressProps) => {
  const strokeWidth = 7
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const center = size / 2

  const hasTarget = target > 0
  const isNegative = value < 0
  const exceeded = hasTarget && value >= target

  const pct = hasTarget ? Math.min(Math.abs(value) / target, 1) : 0
  const filled = pct * circumference

  const strokeColor = isNegative ? '#dc2626' : getPositiveColor(pct, exceeded)
  const displayValue = value > 0 ? `+${value}` : String(value)

  const positiveTransform = `rotate(-90 ${center} ${center})`
  const negativeTransform  = `rotate(-90 ${center} ${center}) scale(-1 1) translate(-${size} 0)`

  return (
    <button
      onClick={onEdit}
      className="flex flex-col items-center gap-1.5 group"
      aria-label={`${middah.spanish}: ${displayValue}${hasTarget ? ` de ${target}` : ''}`}
    >
      <div className="relative">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Pista */}
          <circle
            cx={center} cy={center} r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeDasharray={hasTarget ? undefined : '4 4'}
            className={hasTarget ? 'text-sepia-200 dark:text-sepia-700' : 'text-sepia-200 dark:text-sepia-700'}
          />

          {/* Arco de progreso */}
          {pct > 0 && (
            <circle
              cx={center} cy={center} r={radius}
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeDasharray={`${filled} ${circumference}`}
              strokeLinecap="round"
              transform={isNegative ? negativeTransform : positiveTransform}
              style={{ transition: 'stroke-dasharray 0.4s ease' }}
            />
          )}

          {/* Valor actual */}
          <text
            x={center} y={center - (hasTarget ? 3 : 2)}
            textAnchor="middle"
            fontSize={hasTarget ? '13' : '12'}
            fontWeight="700"
            fill={isNegative ? '#dc2626' : value === 0 ? '#b89f7c' : strokeColor}
          >
            {displayValue}
          </text>

          {/* Objetivo o indicador de "sin meta" */}
          {hasTarget ? (
            <text x={center} y={center + 11} textAnchor="middle" fontSize="9" fill="#8b7355">
              /{target}
            </text>
          ) : (
            <text x={center} y={center + 12} textAnchor="middle" fontSize="11" fill="#b89f7c"
              className="group-hover:fill-[#1e3a5f] transition-colors">
              +meta
            </text>
          )}
        </svg>

        {exceeded && (
          <span className="absolute -top-1 -right-1 text-base leading-none">✓</span>
        )}
      </div>

      <div className="text-center max-w-[76px]">
        <p className="font-serif text-xs text-sepia-900 dark:text-sepia-100 leading-tight">
          {middah.hebrew}
        </p>
        <p className="text-[9px] text-sepia-500 leading-tight">{middah.spanish}</p>
      </div>
    </button>
  )
}

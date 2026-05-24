import type { Middah } from '../../core/domain/types'

interface CircularProgressProps {
  middah: Middah
  value: number      // puntaje acumulado esta semana (puede ser negativo)
  target: number     // objetivo semanal (positivo)
  size?: number
  onEdit?: () => void
}

const getColor = (pct: number, exceeded: boolean): string => {
  if (exceeded) return '#16a34a'      // verde — completado
  if (pct >= 0.66) return '#1e3a5f'  // azul profundo
  if (pct >= 0.33) return '#0d9488'  // teal
  return '#f59e0b'                    // ámbar
}

export const CircularProgress = ({ middah, value, target, size = 84, onEdit }: CircularProgressProps) => {
  const strokeWidth = 7
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const pct = target > 0 ? Math.max(0, Math.min(value / target, 1)) : 0
  const exceeded = value >= target && target > 0
  const filled = pct * circumference
  const color = getColor(pct, exceeded)
  const center = size / 2

  const displayValue = value > 0 ? `+${value}` : String(value)

  return (
    <button
      onClick={onEdit}
      className="flex flex-col items-center gap-1.5 group"
      aria-label={`${middah.spanish}: ${displayValue} de ${target}`}
    >
      <div className="relative">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Pista (track) */}
          <circle
            cx={center} cy={center} r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-sepia-200 dark:text-sepia-700"
          />
          {/* Progreso */}
          {pct > 0 && (
            <circle
              cx={center} cy={center} r={radius}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${filled} ${circumference}`}
              strokeLinecap="round"
              transform={`rotate(-90 ${center} ${center})`}
              style={{ transition: 'stroke-dasharray 0.4s ease' }}
            />
          )}
          {/* Valor actual */}
          <text
            x={center} y={center - 3}
            textAnchor="middle"
            fontSize="13"
            fontWeight="700"
            fill={value < 0 ? '#dc2626' : value === 0 ? '#8b7355' : color}
          >
            {displayValue}
          </text>
          {/* Objetivo */}
          <text
            x={center} y={center + 11}
            textAnchor="middle"
            fontSize="9"
            fill="#8b7355"
          >
            /{target}
          </text>
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

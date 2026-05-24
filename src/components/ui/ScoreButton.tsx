import type { Score } from '../../core/domain/types'

interface ScoreButtonProps {
  score: Score
  selected: boolean
  onClick: () => void
}

const labels: Record<Score, string> = {
  '-2': '−2',
  '-1': '−1',
  '0': '0',
  '1': '+1',
  '2': '+2',
}

const colors: Record<Score, { base: string; selected: string }> = {
  '-2': { base: 'border-red-300 text-red-600', selected: 'bg-red-600 border-red-600 text-white' },
  '-1': { base: 'border-orange-300 text-orange-600', selected: 'bg-orange-500 border-orange-500 text-white' },
  '0': { base: 'border-sepia-300 text-sepia-600', selected: 'bg-sepia-500 border-sepia-500 text-white' },
  '1': { base: 'border-teal-300 text-teal-700', selected: 'bg-teal-600 border-teal-600 text-white' },
  '2': { base: 'border-blue-300 text-blue-700', selected: 'bg-blue-deep border-blue-deep text-white' },
}

export const ScoreButton = ({ score, selected, onClick }: ScoreButtonProps) => {
  const key = String(score) as unknown as keyof typeof colors
  const color = colors[key]
  return (
    <button
      onClick={onClick}
      className={[
        'h-9 w-9 rounded-lg border-2 text-sm font-semibold transition-all duration-100',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
        'active:scale-95',
        selected ? color.selected : `${color.base} bg-transparent hover:opacity-80`,
      ].join(' ')}
      aria-pressed={selected}
      aria-label={labels[score]}
    >
      {labels[score]}
    </button>
  )
}

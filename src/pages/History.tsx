import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, subMonths, addMonths, isSameMonth, isToday } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { useEntriesStore } from '../core/stores/entriesStore'
import { getMiddahById, MIDDOT } from '../core/domain/middot'
import type { DailyEntry } from '../core/domain/types'

const SCORE_LABEL: Record<string, string> = {
  '-2': 'Fracaso', '-1': 'Débil', '0': 'Neutro', '1': 'Bien', '2': 'Excelente',
}

const scoreColor = (avg: number): string => {
  if (avg >= 1.5) return 'bg-blue-deep'
  if (avg >= 0.5) return 'bg-teal-500'
  if (avg >= -0.5) return 'bg-sepia-400'
  if (avg >= -1.5) return 'bg-orange-400'
  return 'bg-red-500'
}

const avgScore = (entry: DailyEntry): number | null => {
  const values = Object.values(entry.scores) as number[]
  if (!values.length) return null
  return values.reduce((a, b) => a + b, 0) / values.length
}

export const History = () => {
  const { t } = useTranslation()
  const { entries, loadRange } = useEntriesStore()
  const [month, setMonth] = useState(new Date())
  const [selected, setSelected] = useState<DailyEntry | null>(null)

  useEffect(() => {
    const from = format(startOfMonth(month), 'yyyy-MM-dd')
    const to = format(endOfMonth(month), 'yyyy-MM-dd')
    loadRange(from, to)
  }, [month])

  const entriesByDate = Object.fromEntries(entries.map((e) => [e.date, e]))
  const days = eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) })
  const startPad = getDay(startOfMonth(month))

  return (
    <div className="space-y-4 pb-6">
      <h1 className="text-xl font-semibold text-sepia-900 dark:text-sepia-50 px-1">
        {t('history.title')}
      </h1>

      {/* Navegación de mes */}
      <Card className="!p-3">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setMonth(subMonths(month, 1))}
            className="p-1 rounded-lg hover:bg-sepia-100 dark:hover:bg-sepia-800"
          >
            <ChevronLeft size={20} className="text-sepia-600" />
          </button>
          <h2 className="font-semibold text-sepia-900 dark:text-sepia-100 capitalize">
            {format(month, 'MMMM yyyy', { locale: es })}
          </h2>
          <button
            onClick={() => setMonth(addMonths(month, 1))}
            disabled={isSameMonth(month, new Date())}
            className="p-1 rounded-lg hover:bg-sepia-100 dark:hover:bg-sepia-800 disabled:opacity-30"
          >
            <ChevronRight size={20} className="text-sepia-600" />
          </button>
        </div>

        {/* Días de la semana */}
        <div className="grid grid-cols-7 text-center mb-1">
          {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map((d) => (
            <span key={d} className="text-xs text-sepia-400 font-medium py-1">{d}</span>
          ))}
        </div>

        {/* Grid del calendario */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: startPad }).map((_, i) => <div key={`pad-${i}`} />)}
          {days.map((day) => {
            const dateStr = format(day, 'yyyy-MM-dd')
            const entry = entriesByDate[dateStr]
            const avg = entry ? avgScore(entry) : null
            return (
              <button
                key={dateStr}
                onClick={() => entry && setSelected(entry)}
                className={[
                  'aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all',
                  isToday(day) ? 'ring-2 ring-blue-deep ring-offset-1' : '',
                  entry
                    ? `${scoreColor(avg!)} text-white hover:opacity-80 active:scale-95`
                    : 'text-sepia-400 dark:text-sepia-600 cursor-default',
                ].join(' ')}
              >
                {format(day, 'd')}
              </button>
            )
          })}
        </div>
      </Card>

      {/* Leyenda */}
      <div className="flex items-center gap-3 justify-center flex-wrap text-xs text-sepia-600">
        {[['bg-blue-deep', 'Excelente'], ['bg-teal-500', 'Bien'], ['bg-sepia-400', 'Neutro'], ['bg-orange-400', 'Débil'], ['bg-red-500', 'Fracaso']].map(([color, label]) => (
          <div key={label} className="flex items-center gap-1">
            <div className={`w-3 h-3 rounded-sm ${color}`} />
            <span>{label}</span>
          </div>
        ))}
      </div>

      {/* Modal de entrada */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center p-4" onClick={() => setSelected(null)}>
          <div
            className="w-full max-w-lg bg-white dark:bg-sepia-900 rounded-t-2xl max-h-[80vh] overflow-y-auto p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sepia-900 dark:text-sepia-50">
                {t('history.entryOf', { date: format(new Date(selected.date + 'T12:00:00'), "d 'de' MMMM", { locale: es }) })}
              </h3>
              <button onClick={() => setSelected(null)} className="p-1 rounded-lg hover:bg-sepia-100">
                <X size={20} className="text-sepia-500" />
              </button>
            </div>

            {/* Middah de foco */}
            {(() => {
              const m = getMiddahById(selected.weekMiddahFocus)
              return m ? (
                <div className="text-sm text-sepia-600 dark:text-sepia-400">
                  {t('history.focusMiddah')}: <span className="font-serif">{m.hebrew}</span> · {m.spanish}
                </div>
              ) : null
            })()}

            {/* Scores */}
            <div className="space-y-2">
              {MIDDOT.map((middah) => {
                const score = selected.scores[middah.id]
                if (score === undefined) return null
                return (
                  <div key={middah.id} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <span className="font-serif text-sm text-sepia-900 dark:text-sepia-100">{middah.hebrew}</span>
                      <span className="text-xs text-sepia-500 ml-1">· {middah.spanish}</span>
                    </div>
                    <span className={[
                      'text-xs font-semibold px-2 py-0.5 rounded-full',
                      score >= 1 ? 'bg-teal-100 text-teal-700' :
                      score <= -1 ? 'bg-red-100 text-red-700' :
                      'bg-sepia-100 text-sepia-600'
                    ].join(' ')}>
                      {score > 0 ? '+' : ''}{score} · {SCORE_LABEL[String(score)]}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Diario */}
            {selected.journal && (
              <div className="border-t border-sepia-100 dark:border-sepia-700 pt-4">
                <p className="text-xs font-semibold text-sepia-500 uppercase tracking-wide mb-2">
                  {t('history.journalTitle')}
                </p>
                <p className="text-sm text-sepia-700 dark:text-sepia-300 leading-relaxed whitespace-pre-wrap">
                  {selected.journal}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { format, subDays, eachDayOfInterval, parseISO, differenceInDays, startOfDay } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
} from 'recharts'
import { Card } from '../components/ui/Card'
import { useEntriesStore } from '../core/stores/entriesStore'
import { useSettingsStore } from '../core/stores/settingsStore'
import { MIDDOT } from '../core/domain/middot'
import { getCurrentCycleStartDate } from '../core/utils/cycle'

type Range = 30 | 90 | 365

const avgScore = (scores: Record<number, number>): number | null => {
  const vals = Object.values(scores) as number[]
  if (!vals.length) return null
  return vals.reduce((a, b) => a + b, 0) / vals.length
}

export const Progress = () => {
  const { t } = useTranslation()
  const { entries, loadRange } = useEntriesStore()
  const { settings } = useSettingsStore()
  const [range, setRange] = useState<Range>(30)

  const today = format(new Date(), 'yyyy-MM-dd')

  useEffect(() => {
    const from = format(subDays(new Date(), range), 'yyyy-MM-dd')
    loadRange(from, today)
  }, [range])

  const entriesByDate = Object.fromEntries(entries.map((e) => [e.date, e]))

  // Datos para el gráfico de líneas
  const days = eachDayOfInterval({
    start: subDays(new Date(), range - 1),
    end: new Date(),
  })

  const lineData = days
    .map((d) => {
      const dateStr = format(d, 'yyyy-MM-dd')
      const entry = entriesByDate[dateStr]
      const avg = entry ? avgScore(entry.scores) : null
      return {
        date: format(d, range === 365 ? 'MMM' : 'd/M', { locale: es }),
        avg: avg !== null ? parseFloat(avg.toFixed(2)) : null,
      }
    })
    .filter((_, i) => range !== 365 || i % 7 === 0) // para 365 días, mostrar semanalmente

  // Datos para el gráfico de barras por middah (últimas 4 semanas)
  const last28 = entries.filter((e) => {
    const diff = differenceInDays(new Date(), parseISO(e.date))
    return diff <= 28
  })

  const barData = MIDDOT.map((m) => {
    const scores = (last28.map((e) => e.scores[m.id]).filter((s) => s !== undefined)) as number[]
    const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
    return { name: m.transliteration, avg: parseFloat(avg.toFixed(2)), hebrew: m.hebrew }
  })

  // Streak
  let streak = 0
  let d = startOfDay(new Date())
  while (entriesByDate[format(d, 'yyyy-MM-dd')]) {
    streak++
    d = new Date(d.getTime() - 86400000)
  }

  // Adherencia en el ciclo actual
  let adherence = 0
  if (settings) {
    const cycleStart = getCurrentCycleStartDate(settings.cycleStartDate, today)
    const daysInCycle = differenceInDays(new Date(), cycleStart) + 1
    const recorded = entries.filter((e) => {
      const diff = differenceInDays(new Date(), parseISO(e.date))
      return diff < daysInCycle
    }).length
    adherence = Math.round((recorded / daysInCycle) * 100)
  }

  return (
    <div className="space-y-4 pb-6">
      <h1 className="text-xl font-semibold text-sepia-900 dark:text-sepia-50 px-1">
        {t('progress.title')}
      </h1>

      {/* Cards de estadísticas */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="text-center">
          <p className="text-3xl font-bold text-blue-deep dark:text-blue-400">{streak}</p>
          <p className="text-xs text-sepia-500 mt-1">{t('progress.streak')}</p>
          <p className="text-xs text-sepia-400">{streak === 1 ? 'día seguido' : 'días seguidos'}</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-teal-600 dark:text-teal-400">{adherence}%</p>
          <p className="text-xs text-sepia-500 mt-1">{t('progress.adherence')}</p>
          <p className="text-xs text-sepia-400">{t('progress.adherenceDesc')}</p>
        </Card>
      </div>

      {/* Gráfico de línea — promedio diario */}
      <Card elevated>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-sepia-700 dark:text-sepia-300">
            {t('progress.avgTitle')}
          </p>
          <div className="flex gap-1">
            {([30, 90, 365] as Range[]).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={[
                  'px-2 py-1 text-xs rounded-md font-medium transition-colors',
                  range === r
                    ? 'bg-blue-deep text-white'
                    : 'text-sepia-600 hover:bg-sepia-100 dark:hover:bg-sepia-800',
                ].join(' ')}
              >
                {t(`progress.range.${r}`)}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={lineData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e8dfc8" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
            <YAxis domain={[-2, 2]} ticks={[-2, -1, 0, 1, 2]} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
            <ReferenceLine y={0} stroke="#c4b49a" strokeDasharray="4 2" />
            <Tooltip
              formatter={(v: unknown) => [(v as number)?.toFixed(2), 'Promedio']}
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #d4c4a8' }}
            />
            <Line
              type="monotone"
              dataKey="avg"
              stroke="#1e3a5f"
              strokeWidth={2}
              dot={false}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Gráfico de barras por middah */}
      <Card elevated>
        <p className="text-sm font-semibold text-sepia-700 dark:text-sepia-300 mb-3">
          {t('progress.byMiddah')}
        </p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={barData} margin={{ top: 5, right: 5, left: -20, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e8dfc8" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 8 }}
              angle={-45}
              textAnchor="end"
              tickLine={false}
              axisLine={false}
            />
            <YAxis domain={[-2, 2]} ticks={[-2, -1, 0, 1, 2]} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
            <ReferenceLine y={0} stroke="#c4b49a" />
            <Tooltip
              formatter={(v: unknown) => [(v as number)?.toFixed(2), 'Promedio']}
              contentStyle={{ fontSize: 12, borderRadius: 8 }}
            />
            <Bar
              dataKey="avg"
              fill="#1e3a5f"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}

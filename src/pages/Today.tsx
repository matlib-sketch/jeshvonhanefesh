import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Save, CheckCircle, Info } from 'lucide-react'
import { HDate } from '@hebcal/core'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { ScoreButton } from '../components/ui/ScoreButton'
import { CircularProgress } from '../components/ui/CircularProgress'
import { MiddahInfoSheet } from '../components/ui/MiddahInfoSheet'
import { MiddahTargetModal } from '../components/ui/MiddahTargetModal'
import { useSettingsStore } from '../core/stores/settingsStore'
import { useEntriesStore } from '../core/stores/entriesStore'
import { getEntriesRange } from '../core/api/data'
import { getAllMiddot } from '../core/domain/middot'
import { getCurrentCycleNumber, getCurrentCycleWeek, getCurrentMiddahFocus, getCurrentWeekStart, getCurrentWeekEnd } from '../core/utils/cycle'
import type { DailyEntry, Middah, Score } from '../core/domain/types'

const SCORES: Score[] = [-2, -1, 0, 1, 2]

export const Today = () => {
  const { t } = useTranslation()
  const { settings, updateSettings } = useSettingsStore()
  const { todayEntry, loadToday, setScore, setJournal, saveToday } = useEntriesStore()
  const [saved, setSaved] = useState(false)
  const [infoMiddah, setInfoMiddah] = useState<Middah | null>(null)
  const [editingMiddah, setEditingMiddah] = useState<Middah | null>(null)
  const [weekEntries, setWeekEntries] = useState<DailyEntry[]>([])

  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const hebrewDate = new HDate(new Date()).toString()

  const cycleStart = settings?.cycleStartDate ?? todayStr
  const cycleNum = getCurrentCycleNumber(cycleStart, todayStr)
  const weekNum = getCurrentCycleWeek(cycleStart, todayStr)
  const focusMiddah = getCurrentMiddahFocus(cycleStart, todayStr)
  const disabledMiddot = settings?.disabledMiddot ?? []
  const allMiddot = getAllMiddot(settings?.customMiddot)
  const activeMiddot = allMiddot.filter((m) => !disabledMiddot.includes(m.id))
  const middahTargets = settings?.middahTargets ?? {}

  useEffect(() => {
    if (settings) loadToday(focusMiddah.id)
  }, [settings])

  // Cargar entradas de la semana para los círculos
  useEffect(() => {
    getEntriesRange(getCurrentWeekStart(), getCurrentWeekEnd())
      .then(setWeekEntries)
      .catch(() => {})
  }, [])

  const handleSave = async () => {
    await saveToday()
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleSaveTarget = async (middahId: number, target: number) => {
    const next = { ...middahTargets }
    if (target === 0) delete next[middahId]
    else next[middahId] = target
    await updateSettings({ middahTargets: next })
  }

  const weeklyScore = (middahId: number) => {
    const otherDays = weekEntries.filter((e) => e.date !== todayStr)
    const pastSum = otherDays.reduce((sum, e) => sum + (e.scores[middahId] ?? 0), 0)
    return pastSum + (todayEntry?.scores[middahId] ?? 0)
  }

  if (!settings || !todayEntry) {
    return (
      <div className="flex items-center justify-center h-64 text-sepia-500">
        {t('common.loading')}
      </div>
    )
  }

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="bg-blue-deep text-white rounded-xl p-4 space-y-1">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-blue-200 text-xs font-medium uppercase tracking-wide">
              {t('today.cycle', { cycle: cycleNum })} · {t('today.week', { week: weekNum })}
            </p>
            <h1 className="text-lg font-semibold mt-0.5">
              {format(new Date(), "EEEE d 'de' MMMM", { locale: es })}
            </h1>
          </div>
          <p className="font-serif text-blue-200 text-sm">{hebrewDate}</p>
        </div>
      </div>

      {/* ── Desafío semanal — tira de círculos ── */}
      <Card elevated className="!pb-3">
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-xs font-semibold text-sepia-500 uppercase tracking-wide">
            Desafío de la semana
          </h2>
          <p className="text-xs text-sepia-400">
            {format(new Date(getCurrentWeekStart() + 'T12:00:00'), "d", { locale: es })}
            {' – '}
            {format(new Date(getCurrentWeekEnd() + 'T12:00:00'), "d MMM", { locale: es })}
          </p>
        </div>

        {/* Círculos horizontales scrollables */}
        <div className="overflow-x-auto -mx-4">
          <div className="flex gap-3 px-4 pb-1" style={{ width: 'max-content' }}>
            {activeMiddot.map((middah) => (
              <CircularProgress
                key={middah.id}
                middah={middah}
                value={weeklyScore(middah.id)}
                target={middahTargets[middah.id] ?? 0}
                size={72}
                onEdit={() => setEditingMiddah(middah)}
              />
            ))}
          </div>
        </div>

        <p className="text-[10px] text-sepia-400 mt-2 px-0.5">
          Tocá cualquier círculo para cambiar tu objetivo semanal
        </p>
      </Card>

      {/* Middah de la semana */}
      <Card elevated className="space-y-3">
        <p className="text-xs font-semibold text-sepia-500 uppercase tracking-wide">
          {t('today.weekFocus')}
        </p>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <h2 className="font-serif text-2xl text-sepia-900 dark:text-sepia-50 leading-tight">
              {focusMiddah.hebrew}
            </h2>
            <p className="text-blue-deep dark:text-blue-400 font-semibold">
              {focusMiddah.transliteration} · {focusMiddah.spanish}
            </p>
          </div>
          <span className="text-3xl font-serif text-sepia-300">{focusMiddah.id}</span>
        </div>
        <p className="text-sm text-sepia-700 dark:text-sepia-300 leading-relaxed">
          {focusMiddah.description}
        </p>
        <div className="border-t border-sepia-100 dark:border-sepia-700 pt-3">
          <p className="text-xs font-semibold text-sepia-500 uppercase tracking-wide mb-1">
            {t('today.prompt')}
          </p>
          <p className="text-sm italic text-sepia-700 dark:text-sepia-300">
            {focusMiddah.dailyPrompt}
          </p>
        </div>
      </Card>

      {/* Lista de middot activas */}
      <div>
        <h3 className="text-xs font-semibold text-sepia-500 uppercase tracking-wide mb-2 px-1">
          {t('today.allMiddot')}
        </h3>
        <Card className="divide-y divide-sepia-100 dark:divide-sepia-700 !p-0 overflow-hidden">
          {activeMiddot.map((middah) => {
            const isFocus = middah.id === focusMiddah.id
            const currentScore = todayEntry.scores[middah.id]
            return (
              <div
                key={middah.id}
                className={[
                  'flex items-center gap-2 px-3 py-3',
                  isFocus ? 'bg-blue-50 dark:bg-blue-900/20' : '',
                ].join(' ')}
              >
                <button
                  onClick={() => setInfoMiddah(middah)}
                  className="flex-1 min-w-0 text-left group"
                  aria-label={`Ver definición de ${middah.spanish}`}
                >
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-serif text-sm text-sepia-400">{middah.id <= 13 ? middah.id : '+'}</span>
                    <span className="font-serif text-base text-sepia-900 dark:text-sepia-100 group-hover:text-blue-deep transition-colors">
                      {middah.hebrew}
                    </span>
                    {isFocus && (
                      <span className="text-[10px] font-bold text-blue-deep dark:text-blue-400 uppercase tracking-wide">
                        foco
                      </span>
                    )}
                    <Info size={12} className="text-sepia-300 group-hover:text-blue-deep transition-colors ml-0.5 shrink-0" />
                  </div>
                  <p className="text-xs text-sepia-500 dark:text-sepia-400">
                    {middah.transliteration} · {middah.spanish}
                  </p>
                </button>

                <div className="flex gap-1 shrink-0">
                  {SCORES.map((s) => (
                    <ScoreButton
                      key={s}
                      score={s}
                      selected={currentScore === s}
                      onClick={() => setScore(middah.id, s)}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </Card>
      </div>

      {/* Diario */}
      <div>
        <label className="block text-xs font-semibold text-sepia-500 uppercase tracking-wide mb-2 px-1">
          {t('today.journalLabel')}
        </label>
        <textarea
          value={todayEntry.journal}
          onChange={(e) => setJournal(e.target.value)}
          placeholder={t('today.journalPlaceholder')}
          rows={5}
          className="w-full rounded-xl border border-sepia-200 dark:border-sepia-700 bg-white dark:bg-sepia-900 px-4 py-3 text-sm text-sepia-900 dark:text-sepia-100 placeholder-sepia-400 focus:outline-none focus:ring-2 focus:ring-blue-deep resize-none"
        />
      </div>

      {/* Botón guardar */}
      <Button fullWidth size="lg" variant={saved ? 'secondary' : 'primary'} onClick={handleSave} disabled={saved}>
        {saved ? (
          <><CheckCircle size={18} /> {t('today.saved')}</>
        ) : (
          <><Save size={18} /> {t('today.save')}</>
        )}
      </Button>

      <MiddahInfoSheet middah={infoMiddah} onClose={() => setInfoMiddah(null)} />

      {editingMiddah && (
        <MiddahTargetModal
          middah={editingMiddah}
          currentTarget={middahTargets[editingMiddah.id] ?? 0}
          onSave={(target) => handleSaveTarget(editingMiddah.id, target)}
          onClose={() => setEditingMiddah(null)}
        />
      )}
    </div>
  )
}

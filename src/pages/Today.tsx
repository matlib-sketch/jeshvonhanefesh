import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Save, CheckCircle, Info } from 'lucide-react'
import { HDate } from '@hebcal/core'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { ScoreButton } from '../components/ui/ScoreButton'
import { MiddahInfoSheet } from '../components/ui/MiddahInfoSheet'
import { useSettingsStore } from '../core/stores/settingsStore'
import { useEntriesStore } from '../core/stores/entriesStore'
import { getAllMiddot } from '../core/domain/middot'
import { getCurrentCycleNumber, getCurrentCycleWeek, getCurrentMiddahFocus } from '../core/utils/cycle'
import type { Middah, Score } from '../core/domain/types'

const SCORES: Score[] = [-2, -1, 0, 1, 2]

export const Today = () => {
  const { t } = useTranslation()
  const { settings } = useSettingsStore()
  const { todayEntry, loadToday, setScore, setJournal, saveToday } = useEntriesStore()
  const [saved, setSaved] = useState(false)
  const [infoMiddah, setInfoMiddah] = useState<Middah | null>(null)

  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const hebrewDate = new HDate(new Date()).toString()

  const cycleStart = settings?.cycleStartDate ?? todayStr
  const cycleNum = getCurrentCycleNumber(cycleStart, todayStr)
  const weekNum = getCurrentCycleWeek(cycleStart, todayStr)
  const focusMiddah = getCurrentMiddahFocus(cycleStart, todayStr)
  const disabledMiddot = settings?.disabledMiddot ?? []
  const allMiddot = getAllMiddot(settings?.customMiddot)
  const activeMiddot = allMiddot.filter((m) => !disabledMiddot.includes(m.id))

  useEffect(() => {
    if (settings) loadToday(focusMiddah.id)
  }, [settings])

  const handleSave = async () => {
    await saveToday()
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
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
                {/* Área de texto — tap abre la definición */}
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

                {/* Botones de puntuación */}
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

      {/* Sheet de definición de middah */}
      <MiddahInfoSheet middah={infoMiddah} onClose={() => setInfoMiddah(null)} />
    </div>
  )
}

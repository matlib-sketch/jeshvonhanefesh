import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'
import { es } from 'date-fns/locale'
import { Plus, Check, Trash2, X } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { useGoalsStore } from '../core/stores/goalsStore'
import { MIDDOT } from '../core/domain/middot'
import type { Goal } from '../core/domain/types'

const today = new Date()

interface AddGoalFormProps {
  type: 'weekly' | 'monthly'
  onClose: () => void
}

const AddGoalForm = ({ type, onClose }: AddGoalFormProps) => {
  const { t } = useTranslation()
  const { addGoal } = useGoalsStore()
  const [text, setText] = useState('')
  const [middahId, setMiddahId] = useState<number | undefined>()

  const periodStart = format(
    type === 'weekly' ? startOfWeek(today, { locale: es }) : startOfMonth(today),
    'yyyy-MM-dd',
  )
  const periodEnd = format(
    type === 'weekly' ? endOfWeek(today, { locale: es }) : endOfMonth(today),
    'yyyy-MM-dd',
  )

  const handleSave = async () => {
    if (!text.trim()) return
    await addGoal({ type, text, middahId, periodStart, periodEnd, completed: false })
    onClose()
  }

  return (
    <div className="space-y-3 pt-2">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t('goals.placeholder')}
        rows={3}
        autoFocus
        className="w-full rounded-lg border border-sepia-200 dark:border-sepia-700 bg-sepia-50 dark:bg-sepia-800 px-3 py-2 text-sm text-sepia-900 dark:text-sepia-100 focus:outline-none focus:ring-2 focus:ring-blue-deep resize-none"
      />
      <select
        value={middahId ?? ''}
        onChange={(e) => setMiddahId(e.target.value ? Number(e.target.value) : undefined)}
        className="w-full rounded-lg border border-sepia-200 dark:border-sepia-700 bg-sepia-50 dark:bg-sepia-800 px-3 py-2 text-sm text-sepia-900 dark:text-sepia-100 focus:outline-none focus:ring-2 focus:ring-blue-deep"
      >
        <option value="">{t('goals.none')}</option>
        {MIDDOT.map((m) => (
          <option key={m.id} value={m.id}>
            {m.transliteration} · {m.spanish}
          </option>
        ))}
      </select>
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" onClick={onClose}>
          <X size={14} /> {t('common.cancel')}
        </Button>
        <Button size="sm" onClick={handleSave} disabled={!text.trim()}>
          <Check size={14} /> {t('common.save')}
        </Button>
      </div>
    </div>
  )
}

interface GoalItemProps {
  goal: Goal
  onToggle: () => void
  onDelete: () => void
}

const GoalItem = ({ goal, onToggle, onDelete }: GoalItemProps) => {
  const middah = MIDDOT.find((m) => m.id === goal.middahId)
  return (
    <div className="flex items-start gap-3 py-3">
      <button
        onClick={onToggle}
        className={[
          'mt-0.5 h-5 w-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors',
          goal.completed
            ? 'bg-teal-600 border-teal-600'
            : 'border-sepia-300 dark:border-sepia-600 hover:border-blue-deep',
        ].join(' ')}
      >
        {goal.completed && <Check size={12} className="text-white" strokeWidth={3} />}
      </button>
      <div className="flex-1 min-w-0">
        <p className={['text-sm leading-snug', goal.completed ? 'line-through text-sepia-400' : 'text-sepia-900 dark:text-sepia-100'].join(' ')}>
          {goal.text}
        </p>
        {middah && (
          <p className="text-xs text-sepia-500 mt-0.5">
            <span className="font-serif">{middah.hebrew}</span> · {middah.spanish}
          </p>
        )}
      </div>
      <button onClick={onDelete} className="p-1 text-sepia-400 hover:text-red-500 transition-colors">
        <Trash2 size={14} />
      </button>
    </div>
  )
}

export const Goals = () => {
  const { t } = useTranslation()
  const { goals, loadGoals, toggleGoal, removeGoal } = useGoalsStore()
  const [adding, setAdding] = useState<'weekly' | 'monthly' | null>(null)

  useEffect(() => { loadGoals() }, [])

  const weeklyGoals = goals.filter((g) => g.type === 'weekly')
  const monthlyGoals = goals.filter((g) => g.type === 'monthly')
  const historyGoals = goals.filter((g) => {
    const end = new Date(g.periodEnd)
    return end < today
  })

  const GoalSection = ({ title, items, type }: { title: string; items: Goal[]; type: 'weekly' | 'monthly' }) => (
    <Card className="space-y-1">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-sepia-700 dark:text-sepia-300">{title}</h3>
        <button
          onClick={() => setAdding(adding === type ? null : type)}
          className="flex items-center gap-1 text-xs text-blue-deep dark:text-blue-400 hover:underline"
        >
          <Plus size={14} /> {t('goals.add')}
        </button>
      </div>

      {adding === type && (
        <AddGoalForm type={type} onClose={() => setAdding(null)} />
      )}

      {items.length === 0 && adding !== type ? (
        <p className="text-sm text-sepia-400 py-2">{t('goals.empty')}</p>
      ) : (
        <div className="divide-y divide-sepia-100 dark:divide-sepia-700">
          {items.map((g) => (
            <GoalItem key={g.id} goal={g} onToggle={() => toggleGoal(g.id)} onDelete={() => removeGoal(g.id)} />
          ))}
        </div>
      )}
    </Card>
  )

  return (
    <div className="space-y-4 pb-6">
      <h1 className="text-xl font-semibold text-sepia-900 dark:text-sepia-50 px-1">
        {t('goals.title')}
      </h1>

      <GoalSection title={t('goals.weekly')} items={weeklyGoals} type="weekly" />
      <GoalSection title={t('goals.monthly')} items={monthlyGoals} type="monthly" />

      {historyGoals.length > 0 && (
        <Card>
          <h3 className="text-sm font-semibold text-sepia-700 dark:text-sepia-300 mb-2">
            {t('goals.history')}
          </h3>
          <div className="divide-y divide-sepia-100 dark:divide-sepia-700">
            {historyGoals.map((g) => (
              <GoalItem key={g.id} goal={g} onToggle={() => toggleGoal(g.id)} onDelete={() => removeGoal(g.id)} />
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

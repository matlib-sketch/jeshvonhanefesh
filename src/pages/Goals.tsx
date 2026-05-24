import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'
import { es } from 'date-fns/locale'
import { Plus, Check, Trash2, X } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { CircularProgress } from '../components/ui/CircularProgress'
import { useGoalsStore } from '../core/stores/goalsStore'
import { useSettingsStore } from '../core/stores/settingsStore'
import { useEntriesStore } from '../core/stores/entriesStore'
import { getAllMiddot } from '../core/domain/middot'
import { getCurrentWeekStart, getCurrentWeekEnd } from '../core/utils/cycle'
import type { Goal, Middah } from '../core/domain/types'

const today = new Date()

const weeklyScore = (entries: ReturnType<typeof useEntriesStore.getState>['entries'], middahId: number): number =>
  entries.reduce((sum, e) => sum + (e.scores[middahId] ?? 0), 0)

// --- Modal para editar el objetivo de una middah ---
interface MiddahTargetModalProps {
  middah: Middah
  currentTarget: number
  onSave: (target: number) => void
  onClose: () => void
}

const MiddahTargetModal = ({ middah, currentTarget, onSave, onClose }: MiddahTargetModalProps) => {
  const [target, setTarget] = useState(currentTarget > 0 ? currentTarget : 6)

  const handleSave = () => {
    onSave(target)
    onClose()
  }

  const handleClear = () => {
    onSave(0)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-white dark:bg-sepia-900 rounded-t-2xl flex flex-col"
        style={{ maxHeight: '90dvh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
          <div>
            <p className="font-serif text-lg text-sepia-900 dark:text-sepia-50">{middah.hebrew}</p>
            <p className="text-xs text-sepia-500">{middah.transliteration} · {middah.spanish}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-sepia-100">
            <X size={20} className="text-sepia-500" />
          </button>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto px-5 space-y-4 pb-2">
          <div>
            <label className="text-xs font-semibold text-sepia-500 uppercase tracking-wide block mb-1.5">
              Objetivo semanal (puntos a acumular)
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setTarget((t) => Math.max(1, t - 1))}
                className="h-12 w-12 rounded-xl border border-sepia-200 dark:border-sepia-700 text-xl font-bold text-sepia-700 hover:bg-sepia-100 transition-colors"
              >
                −
              </button>
              <span className="flex-1 text-center text-3xl font-bold text-sepia-900 dark:text-sepia-50">
                {target}
              </span>
              <button
                onClick={() => setTarget((t) => t + 1)}
                className="h-12 w-12 rounded-xl border border-sepia-200 dark:border-sepia-700 text-xl font-bold text-sepia-700 hover:bg-sepia-100 transition-colors"
              >
                +
              </button>
            </div>
            <p className="text-xs text-sepia-400 text-center mt-2">
              Acumulá +{target} puntos esta semana en {middah.spanish.toLowerCase()}
            </p>
          </div>
        </div>

        {/* Botones */}
        <div className="px-5 py-4 border-t border-sepia-100 dark:border-sepia-700 shrink-0 flex gap-2">
          {currentTarget > 0 && (
            <button
              onClick={handleClear}
              className="p-3 rounded-xl border border-sepia-200 text-sepia-400 hover:text-red-500 hover:border-red-200 transition-colors"
              title="Quitar objetivo"
            >
              <Trash2 size={16} />
            </button>
          )}
          <Button fullWidth onClick={handleSave}>
            <Check size={16} /> Guardar
          </Button>
        </div>
      </div>
    </div>
  )
}

// --- Item de objetivo de texto ---
interface GoalItemProps {
  goal: Goal
  middah?: Middah
  onToggle: () => void
  onDelete: () => void
}

const GoalItem = ({ goal, middah, onToggle, onDelete }: GoalItemProps) => (
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

// --- Formulario para objetivo de texto ---
const AddTextGoalForm = ({ type, onClose }: { type: 'weekly' | 'monthly'; onClose: () => void }) => {
  const { addGoal } = useGoalsStore()
  const [text, setText] = useState('')

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
    await addGoal({ type, text, periodStart, periodEnd, completed: false })
    onClose()
  }

  return (
    <div className="space-y-3 pt-2">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="¿Qué querés trabajar?"
        rows={3}
        autoFocus
        className="w-full rounded-lg border border-sepia-200 dark:border-sepia-700 bg-sepia-50 dark:bg-sepia-800 px-3 py-2 text-sm text-sepia-900 dark:text-sepia-100 focus:outline-none focus:ring-2 focus:ring-blue-deep resize-none"
      />
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" onClick={onClose}><X size={14} /> Cancelar</Button>
        <Button size="sm" onClick={handleSave} disabled={!text.trim()}><Check size={14} /> Guardar</Button>
      </div>
    </div>
  )
}

// --- Página principal ---
export const Goals = () => {
  const { t } = useTranslation()
  const { goals, loadGoals, toggleGoal, removeGoal } = useGoalsStore()
  const { settings, updateSettings } = useSettingsStore()
  const { entries, loadRange } = useEntriesStore()

  const [editingMiddah, setEditingMiddah] = useState<Middah | null>(null)
  const [addingTextType, setAddingTextType] = useState<'weekly' | 'monthly' | null>(null)

  useEffect(() => { loadGoals() }, [])
  useEffect(() => { loadRange(getCurrentWeekStart(), getCurrentWeekEnd()) }, [])

  if (!settings) return null

  const { disabledMiddot = [], middahTargets = {}, customMiddot = [] } = settings
  const allMiddot = getAllMiddot(customMiddot).filter((m) => !disabledMiddot.includes(m.id))

  const handleSaveTarget = async (middahId: number, target: number) => {
    const next = { ...middahTargets }
    if (target === 0) delete next[middahId]
    else next[middahId] = target
    await updateSettings({ middahTargets: next })
  }

  const weeklyTextGoals = goals.filter((g) => g.type === 'weekly')
  const monthlyTextGoals = goals.filter((g) => g.type === 'monthly')

  return (
    <div className="space-y-5 pb-6">
      <h1 className="text-xl font-semibold text-sepia-900 dark:text-sepia-50 px-1">
        {t('goals.title')}
      </h1>

      {/* ── Círculos — todas las middot ── */}
      <Card elevated>
        {/* Encabezado con fechas */}
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-sm font-semibold text-sepia-700 dark:text-sepia-300">
            Objetivo semanal
          </h2>
          <p className="text-xs text-sepia-400">
            {format(new Date(getCurrentWeekStart() + 'T12:00:00'), "d MMM", { locale: es })}
            {' – '}
            {format(new Date(getCurrentWeekEnd() + 'T12:00:00'), "d MMM", { locale: es })}
          </p>
        </div>

        {/* Leyenda */}
        <div className="flex items-start gap-2 bg-sepia-50 dark:bg-sepia-800 rounded-xl px-3 py-2.5 mb-4">
          <div className="mt-0.5 w-3 h-3 rounded-full border-2 border-blue-deep shrink-0" />
          <p className="text-xs text-sepia-600 dark:text-sepia-400 leading-snug">
            Cada círculo muestra los puntos acumulados esta semana en esa middah.
            Tocá cualquiera para fijar cuántos puntos querés lograr.
          </p>
        </div>

        {/* Grilla de círculos — siempre visible para todas las middot activas */}
        <div className="grid grid-cols-3 gap-x-3 gap-y-5 justify-items-center">
          {allMiddot.map((middah) => {
            const target = middahTargets[middah.id] ?? 0
            const value = weeklyScore(entries, middah.id)
            return (
              <CircularProgress
                key={middah.id}
                middah={middah}
                value={value}
                target={target}
                onEdit={() => setEditingMiddah(middah)}
              />
            )
          })}
        </div>
      </Card>

      {/* ── Objetivos de texto (semanales) ── */}
      <Card>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-sepia-700 dark:text-sepia-300">
            {t('goals.weekly')}
          </h3>
          <button
            onClick={() => setAddingTextType(addingTextType === 'weekly' ? null : 'weekly')}
            className="flex items-center gap-1 text-xs font-medium text-blue-deep dark:text-blue-400 hover:underline"
          >
            <Plus size={14} /> {t('goals.add')}
          </button>
        </div>
        {addingTextType === 'weekly' && (
          <AddTextGoalForm type="weekly" onClose={() => setAddingTextType(null)} />
        )}
        {weeklyTextGoals.length === 0 && addingTextType !== 'weekly' ? (
          <p className="text-sm text-sepia-400 py-2">{t('goals.empty')}</p>
        ) : (
          <div className="divide-y divide-sepia-100 dark:divide-sepia-700">
            {weeklyTextGoals.map((g) => (
              <GoalItem
                key={g.id} goal={g}
                middah={allMiddot.find((m) => m.id === g.middahId)}
                onToggle={() => toggleGoal(g.id)}
                onDelete={() => removeGoal(g.id)}
              />
            ))}
          </div>
        )}
      </Card>

      {/* ── Objetivos de texto (mensuales) ── */}
      <Card>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-sepia-700 dark:text-sepia-300">
            {t('goals.monthly')}
          </h3>
          <button
            onClick={() => setAddingTextType(addingTextType === 'monthly' ? null : 'monthly')}
            className="flex items-center gap-1 text-xs font-medium text-blue-deep dark:text-blue-400 hover:underline"
          >
            <Plus size={14} /> {t('goals.add')}
          </button>
        </div>
        {addingTextType === 'monthly' && (
          <AddTextGoalForm type="monthly" onClose={() => setAddingTextType(null)} />
        )}
        {monthlyTextGoals.length === 0 && addingTextType !== 'monthly' ? (
          <p className="text-sm text-sepia-400 py-2">{t('goals.empty')}</p>
        ) : (
          <div className="divide-y divide-sepia-100 dark:divide-sepia-700">
            {monthlyTextGoals.map((g) => (
              <GoalItem
                key={g.id} goal={g}
                middah={allMiddot.find((m) => m.id === g.middahId)}
                onToggle={() => toggleGoal(g.id)}
                onDelete={() => removeGoal(g.id)}
              />
            ))}
          </div>
        )}
      </Card>

      {/* Modal edición de objetivo */}
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

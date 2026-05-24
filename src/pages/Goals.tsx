import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'
import { es } from 'date-fns/locale'
import { Plus, Check, Trash2, X, Pencil } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { CircularProgress } from '../components/ui/CircularProgress'
import { useGoalsStore } from '../core/stores/goalsStore'
import { useSettingsStore } from '../core/stores/settingsStore'
import { useEntriesStore } from '../core/stores/entriesStore'
import { MIDDOT } from '../core/domain/middot'
import { getCurrentWeekStart, getCurrentWeekEnd } from '../core/utils/cycle'
import type { Goal } from '../core/domain/types'

const today = new Date()

// Suma de scores de una middah en las entradas dadas
const weeklyScore = (entries: ReturnType<typeof useEntriesStore.getState>['entries'], middahId: number): number =>
  entries.reduce((sum, e) => sum + (e.scores[middahId] ?? 0), 0)

// --- Modal para editar objetivo de una middah ---
interface MiddahTargetModalProps {
  middahId: number | null       // null = agregar nueva
  currentTarget: number
  usedIds: number[]             // IDs que ya tienen objetivo
  disabledIds: number[]
  onSave: (middahId: number, target: number) => void
  onDelete?: () => void
  onClose: () => void
}

const MiddahTargetModal = ({
  middahId, currentTarget, usedIds, disabledIds, onSave, onDelete, onClose,
}: MiddahTargetModalProps) => {
  const [selectedId, setSelectedId] = useState<number>(middahId ?? 0)
  const [target, setTarget] = useState(currentTarget || 6)

  const availableMiddot = MIDDOT.filter(
    (m) => !disabledIds.includes(m.id) && (middahId ? m.id === middahId : !usedIds.includes(m.id)),
  )

  const handleSave = () => {
    if (!selectedId || target <= 0) return
    onSave(selectedId, target)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-white dark:bg-sepia-900 rounded-t-2xl p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sepia-900 dark:text-sepia-50">
            {middahId ? 'Editar objetivo' : 'Nuevo objetivo de middah'}
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-sepia-100">
            <X size={20} className="text-sepia-500" />
          </button>
        </div>

        {/* Selección de middah */}
        {!middahId && (
          <div>
            <label className="text-xs font-semibold text-sepia-500 uppercase tracking-wide block mb-1.5">
              Middah
            </label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(Number(e.target.value))}
              className="w-full rounded-lg border border-sepia-200 dark:border-sepia-700 bg-sepia-50 dark:bg-sepia-800 px-3 py-2.5 text-sm text-sepia-900 dark:text-sepia-100 focus:outline-none focus:ring-2 focus:ring-blue-deep"
            >
              <option value={0}>Seleccioná una middah</option>
              {availableMiddot.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.hebrew} · {m.transliteration} · {m.spanish}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Target numérico */}
        <div>
          <label className="text-xs font-semibold text-sepia-500 uppercase tracking-wide block mb-1.5">
            Objetivo semanal (puntos a acumular)
          </label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setTarget((t) => Math.max(1, t - 1))}
              className="h-10 w-10 rounded-lg border border-sepia-200 dark:border-sepia-700 text-lg font-bold text-sepia-700 hover:bg-sepia-100 transition-colors"
            >
              −
            </button>
            <span className="flex-1 text-center text-2xl font-bold text-sepia-900 dark:text-sepia-50">
              {target}
            </span>
            <button
              onClick={() => setTarget((t) => t + 1)}
              className="h-10 w-10 rounded-lg border border-sepia-200 dark:border-sepia-700 text-lg font-bold text-sepia-700 hover:bg-sepia-100 transition-colors"
            >
              +
            </button>
          </div>
          <p className="text-xs text-sepia-400 text-center mt-1">
            Ej: objetivo {target} = acumulá +{target} puntos esta semana en esa middah
          </p>
        </div>

        <div className="flex gap-2 pt-1">
          {onDelete && (
            <button
              onClick={() => { onDelete(); onClose() }}
              className="p-2.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          )}
          <Button fullWidth onClick={handleSave} disabled={!selectedId || target <= 0}>
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

// --- Formulario para objetivo de texto ---
interface AddTextGoalFormProps {
  type: 'weekly' | 'monthly'
  onClose: () => void
}

const AddTextGoalForm = ({ type, onClose }: AddTextGoalFormProps) => {
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
        <Button variant="secondary" size="sm" onClick={onClose}>
          <X size={14} /> Cancelar
        </Button>
        <Button size="sm" onClick={handleSave} disabled={!text.trim()}>
          <Check size={14} /> Guardar
        </Button>
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

  const [editingMiddahId, setEditingMiddahId] = useState<number | null | 'new'>(null)
  const [addingTextType, setAddingTextType] = useState<'weekly' | 'monthly' | null>(null)

  useEffect(() => { loadGoals() }, [])
  useEffect(() => {
    loadRange(getCurrentWeekStart(), getCurrentWeekEnd())
  }, [])

  if (!settings) return null

  const { disabledMiddot = [], middahTargets = {} } = settings
  const activeTargets = Object.entries(middahTargets).filter(([, v]) => v > 0)

  const handleSaveTarget = async (middahId: number, target: number) => {
    await updateSettings({ middahTargets: { ...middahTargets, [middahId]: target } })
  }

  const handleDeleteTarget = async (middahId: number) => {
    const next = { ...middahTargets }
    delete next[middahId]
    await updateSettings({ middahTargets: next })
  }

  const weeklyTextGoals = goals.filter((g) => g.type === 'weekly')
  const monthlyTextGoals = goals.filter((g) => g.type === 'monthly')
  const usedMiddahIds = Object.keys(middahTargets).map(Number)

  return (
    <div className="space-y-5 pb-6">
      <h1 className="text-xl font-semibold text-sepia-900 dark:text-sepia-50 px-1">
        {t('goals.title')}
      </h1>

      {/* ── Círculos de objetivos por middah ── */}
      <Card elevated>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-sepia-700 dark:text-sepia-300">
              Middot esta semana
            </h2>
            <p className="text-xs text-sepia-400 mt-0.5">
              {format(new Date(getCurrentWeekStart() + 'T12:00:00'), "d MMM", { locale: es })}
              {' – '}
              {format(new Date(getCurrentWeekEnd() + 'T12:00:00'), "d MMM", { locale: es })}
            </p>
          </div>
          <button
            onClick={() => setEditingMiddahId('new')}
            disabled={activeTargets.length >= MIDDOT.filter(m => !disabledMiddot.includes(m.id)).length}
            className="flex items-center gap-1 text-xs font-medium text-blue-deep dark:text-blue-400 hover:underline disabled:opacity-40"
          >
            <Plus size={14} /> Agregar
          </button>
        </div>

        {activeTargets.length === 0 ? (
          <div className="text-center py-6 space-y-3">
            <p className="text-sm text-sepia-400">Sin objetivos de middot activos</p>
            <Button size="sm" variant="secondary" onClick={() => setEditingMiddahId('new')}>
              <Plus size={14} /> Agregar objetivo
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4 justify-items-center">
            {activeTargets.map(([idStr, target]) => {
              const id = Number(idStr)
              const middah = MIDDOT.find((m) => m.id === id)
              if (!middah) return null
              const value = weeklyScore(entries, id)
              return (
                <div key={id} className="relative">
                  <CircularProgress
                    middah={middah}
                    value={value}
                    target={target}
                    onEdit={() => setEditingMiddahId(id)}
                  />
                  <button
                    onClick={() => setEditingMiddahId(id)}
                    className="absolute -top-1 -right-1 p-1 rounded-full bg-sepia-100 dark:bg-sepia-800 opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity"
                    aria-label="Editar objetivo"
                  >
                    <Pencil size={10} className="text-sepia-500" />
                  </button>
                </div>
              )
            })}
          </div>
        )}
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
              <GoalItem key={g.id} goal={g} onToggle={() => toggleGoal(g.id)} onDelete={() => removeGoal(g.id)} />
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
              <GoalItem key={g.id} goal={g} onToggle={() => toggleGoal(g.id)} onDelete={() => removeGoal(g.id)} />
            ))}
          </div>
        )}
      </Card>

      {/* Modal de edición de target */}
      {editingMiddahId !== null && (
        <MiddahTargetModal
          middahId={editingMiddahId === 'new' ? null : editingMiddahId}
          currentTarget={editingMiddahId !== 'new' ? (middahTargets[editingMiddahId] ?? 0) : 6}
          usedIds={usedMiddahIds}
          disabledIds={disabledMiddot}
          onSave={handleSaveTarget}
          onDelete={editingMiddahId !== 'new' ? () => handleDeleteTarget(editingMiddahId as number) : undefined}
          onClose={() => setEditingMiddahId(null)}
        />
      )}
    </div>
  )
}

import { useState } from 'react'
import { Check, Trash2, X } from 'lucide-react'
import { Button } from './Button'
import type { Middah } from '../../core/domain/types'

interface Props {
  middah: Middah
  currentTarget: number
  onSave: (target: number) => void
  onClose: () => void
}

export const MiddahTargetModal = ({ middah, currentTarget, onSave, onClose }: Props) => {
  const [target, setTarget] = useState(currentTarget > 0 ? currentTarget : 5)

  const handleSave = () => { onSave(target); onClose() }
  const handleClear = () => { onSave(0); onClose() }

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 flex items-end justify-center" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-white dark:bg-sepia-900 rounded-t-2xl flex flex-col"
        style={{ maxHeight: '90dvh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
          <div>
            <p className="font-serif text-xl text-sepia-900 dark:text-sepia-50">{middah.hebrew}</p>
            <p className="text-xs text-sepia-500">{middah.transliteration} · {middah.spanish}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-sepia-100 dark:hover:bg-sepia-800">
            <X size={20} className="text-sepia-500" />
          </button>
        </div>

        {/* Contenido */}
        <div className="px-5 pb-2">
          <label className="text-xs font-semibold text-sepia-500 uppercase tracking-wide block mb-3">
            Objetivo semanal (puntos a acumular)
          </label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setTarget((t) => Math.max(1, t - 1))}
              className="h-14 w-14 rounded-xl border border-sepia-200 dark:border-sepia-700 text-2xl font-bold text-sepia-700 dark:text-sepia-300 hover:bg-sepia-100 dark:hover:bg-sepia-800 transition-colors"
            >
              −
            </button>
            <span className="flex-1 text-center text-4xl font-bold text-sepia-900 dark:text-sepia-50">
              {target}
            </span>
            <button
              onClick={() => setTarget((t) => t + 1)}
              className="h-14 w-14 rounded-xl border border-sepia-200 dark:border-sepia-700 text-2xl font-bold text-sepia-700 dark:text-sepia-300 hover:bg-sepia-100 dark:hover:bg-sepia-800 transition-colors"
            >
              +
            </button>
          </div>
          <p className="text-xs text-sepia-400 text-center mt-2">
            {target === 1
              ? '1 punto esta semana'
              : `Acumulá +${target} puntos esta semana en ${middah.spanish.toLowerCase()}`}
          </p>
        </div>

        {/* Botones */}
        <div className="px-5 py-4 border-t border-sepia-100 dark:border-sepia-700 shrink-0 flex gap-2">
          {currentTarget > 0 && (
            <button
              onClick={handleClear}
              className="p-3 rounded-xl border border-sepia-200 dark:border-sepia-700 text-sepia-400 hover:text-red-500 hover:border-red-200 transition-colors"
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

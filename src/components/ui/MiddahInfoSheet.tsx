import { X } from 'lucide-react'
import type { Middah } from '../../core/domain/types'

interface MiddahInfoSheetProps {
  middah: Middah | null
  onClose: () => void
}

export const MiddahInfoSheet = ({ middah, onClose }: MiddahInfoSheetProps) => {
  if (!middah) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-sepia-900 rounded-t-2xl p-5 space-y-4 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-serif text-3xl text-sepia-900 dark:text-sepia-50 leading-tight">
              {middah.hebrew}
            </h2>
            <p className="text-blue-deep dark:text-blue-400 font-semibold mt-0.5">
              {middah.transliteration} · {middah.spanish}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-sepia-100 dark:hover:bg-sepia-800 transition-colors mt-0.5"
          >
            <X size={20} className="text-sepia-500" />
          </button>
        </div>

        {/* Descripción */}
        <p className="text-sm text-sepia-700 dark:text-sepia-300 leading-relaxed">
          {middah.description}
        </p>

        {/* Pregunta del día */}
        <div className="border-t border-sepia-100 dark:border-sepia-700 pt-4">
          <p className="text-xs font-semibold text-sepia-500 uppercase tracking-wide mb-1.5">
            Pregunta de reflexión
          </p>
          <p className="text-sm italic text-sepia-700 dark:text-sepia-300 leading-relaxed">
            {middah.dailyPrompt}
          </p>
        </div>

        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-sepia-100 dark:bg-sepia-800 text-sepia-700 dark:text-sepia-300 text-sm font-medium hover:bg-sepia-200 transition-colors"
        >
          Cerrar
        </button>
      </div>
    </div>
  )
}

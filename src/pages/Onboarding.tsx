import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { Calendar, Bell } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { useSettingsStore } from '../core/stores/settingsStore'
import { MIDDOT } from '../core/domain/middot'
import i18n from '../web/i18n'

const LANGUAGES = [
  { code: 'es' as const, label: 'Español', native: 'Español' },
  { code: 'en' as const, label: 'English', native: 'English' },
  { code: 'he' as const, label: 'עברית', native: 'Hebrew', isHebrew: true },
]

const DEFAULT_TARGET = 5

// Círculo de demostración — ilustra el concepto visualmente
const DemoCircle = ({ target }: { target: number }) => {
  const r = 40
  const circ = 2 * Math.PI * r
  const fill = 0.65 * circ
  return (
    <svg width={100} height={100} viewBox="0 0 100 100">
      <circle cx={50} cy={50} r={r} fill="none" stroke="#e8dfc8" strokeWidth={9} />
      <circle
        cx={50} cy={50} r={r} fill="none"
        stroke="#1e3a5f" strokeWidth={9}
        strokeDasharray={`${fill} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 50 50)"
      />
      <text x={50} y={47} textAnchor="middle" fontSize="13" fontWeight="700" fill="#1e3a5f">
        +{Math.round(target * 0.65)}
      </text>
      <text x={50} y={61} textAnchor="middle" fontSize="10" fill="#8b7355">
        /{target}
      </text>
    </svg>
  )
}

export const Onboarding = () => {
  const navigate = useNavigate()
  const { updateSettings } = useSettingsStore()
  const [step, setStep] = useState(0)
  const [language, setLanguage] = useState<'es' | 'en' | 'he'>('es')
  const [cycleStartDate, setCycleStartDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [reminderTime, setReminderTime] = useState('21:00')
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  // Targets para el paso 4 — arranca con DEFAULT_TARGET para cada middah
  const [goalTargets, setGoalTargets] = useState<Record<number, number>>(
    Object.fromEntries(MIDDOT.map((m) => [m.id, DEFAULT_TARGET]))
  )

  const selectLanguage = async (lang: 'es' | 'en' | 'he') => {
    setLanguage(lang)
    i18n.changeLanguage(lang)
    await updateSettings({ language: lang })
    setStep(1)
  }

  const requestNotifications = async () => {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission()
      setNotificationsEnabled(perm === 'granted')
    }
  }

  const setTarget = (id: number, delta: number) =>
    setGoalTargets((prev) => ({ ...prev, [id]: Math.max(0, (prev[id] ?? DEFAULT_TARGET) + delta) }))

  const finish = async () => {
    // Filtrar middot con objetivo > 0
    const middahTargets = Object.fromEntries(
      Object.entries(goalTargets).filter(([, v]) => v > 0).map(([k, v]) => [Number(k), v])
    )
    await updateSettings({
      language,
      cycleStartDate,
      reminderTime,
      notificationsEnabled,
      middahTargets,
      onboardingCompleted: true,
    })
    navigate('/')
  }

  const TOTAL_STEPS = 4

  return (
    <div className="min-h-screen bg-sepia-50 dark:bg-sepia-950 flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">

        {/* ── Paso 0: Selección de idioma ── */}
        {step === 0 && (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center space-y-2">
              <h1 className="font-serif text-5xl text-sepia-900 dark:text-sepia-50">חשבון הנפש</h1>
              <p className="text-sepia-500 text-sm tracking-wide">Cheshbon HaNefesh</p>
            </div>
            <div className="space-y-3">
              {LANGUAGES.map(({ code, label, native, isHebrew }) => (
                <button
                  key={code}
                  onClick={() => selectLanguage(code)}
                  className={[
                    'w-full rounded-xl border-2 border-sepia-200 dark:border-sepia-700 bg-white dark:bg-sepia-900 p-4',
                    'flex items-center justify-between',
                    'hover:border-blue-deep dark:hover:border-blue-400 hover:shadow-md transition-all duration-150 active:scale-[0.98]',
                  ].join(' ')}
                >
                  <span className={['text-xl font-semibold text-sepia-900 dark:text-sepia-50', isHebrew ? 'font-serif' : ''].join(' ')}>
                    {label}
                  </span>
                  {native !== label && <span className="text-sm text-sepia-500">{native}</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Paso 1: Bienvenida ── */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center space-y-2">
              <h1 className="font-serif text-4xl text-sepia-900 dark:text-sepia-50">חשבון הנפש</h1>
              <p className="font-sans text-lg text-sepia-700 dark:text-sepia-300">Cheshbon HaNefesh</p>
            </div>
            <div className="bg-white dark:bg-sepia-900 rounded-xl p-5 shadow-sm border border-sepia-200 dark:border-sepia-700 space-y-4">
              <p className="text-sepia-700 dark:text-sepia-300 text-sm leading-relaxed">
                El Cheshbon HaNefesh es una práctica de auto-evaluación espiritual. Cada día examinás tu conducta en 13 middot —virtudes del carácter— para crecer de manera consciente e intencional.
              </p>
              <div className="border-t border-sepia-100 dark:border-sepia-700 pt-4 space-y-2">
                <p className="text-xs font-semibold text-sepia-500 uppercase tracking-wide">¿Cómo funciona?</p>
                {[
                  'El año se divide en ciclos de 13 semanas.',
                  'Cada semana tiene una middah de foco intensivo.',
                  'Cada día evaluás tus middot con una puntuación.',
                  'Seguís tu progreso con círculos semanales.',
                ].map((line, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-sepia-700 dark:text-sepia-300">
                    <span className="text-blue-deep dark:text-blue-400 mt-0.5">•</span>
                    <span>{line}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" size="md" onClick={() => setStep(0)}>←</Button>
              <Button fullWidth size="lg" onClick={() => setStep(2)}>Siguiente</Button>
            </div>
          </div>
        )}

        {/* ── Paso 2: Fecha de inicio ── */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center space-y-2">
              <Calendar size={40} className="mx-auto text-blue-deep dark:text-blue-400" />
              <h2 className="font-sans text-2xl font-semibold text-sepia-900 dark:text-sepia-50">Inicio del primer ciclo</h2>
            </div>
            <div className="bg-white dark:bg-sepia-900 rounded-xl p-5 shadow-sm border border-sepia-200 dark:border-sepia-700 space-y-4">
              <p className="text-sm text-sepia-700 dark:text-sepia-300 leading-relaxed">
                ¿Cuándo empezaste o querés empezar tu práctica? Esta fecha define el ritmo de los ciclos.
              </p>
              <div>
                <label className="block text-sm font-medium text-sepia-700 dark:text-sepia-300 mb-1.5">Fecha de inicio</label>
                <input
                  type="date"
                  value={cycleStartDate}
                  onChange={(e) => setCycleStartDate(e.target.value)}
                  className="w-full rounded-lg border border-sepia-300 dark:border-sepia-600 bg-transparent px-3 py-2.5 text-sepia-900 dark:text-sepia-100 focus:outline-none focus:ring-2 focus:ring-blue-deep"
                />
                <p className="mt-1.5 text-xs text-sepia-500">Podés cambiarla después en Configuración</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" size="lg" onClick={() => setStep(1)}>Volver</Button>
              <Button fullWidth size="lg" onClick={() => setStep(3)}>Siguiente</Button>
            </div>
          </div>
        )}

        {/* ── Paso 3: Recordatorio ── */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center space-y-2">
              <Bell size={40} className="mx-auto text-blue-deep dark:text-blue-400" />
              <h2 className="font-sans text-2xl font-semibold text-sepia-900 dark:text-sepia-50">Recordatorio diario</h2>
            </div>
            <div className="bg-white dark:bg-sepia-900 rounded-xl p-5 shadow-sm border border-sepia-200 dark:border-sepia-700 space-y-4">
              <p className="text-sm text-sepia-700 dark:text-sepia-300 leading-relaxed">
                ¿A qué hora querés que te recuerde hacer tu cheshbon?
              </p>
              <div>
                <label className="block text-sm font-medium text-sepia-700 dark:text-sepia-300 mb-1.5">Hora del recordatorio</label>
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="w-full rounded-lg border border-sepia-300 dark:border-sepia-600 bg-transparent px-3 py-2.5 text-sepia-900 dark:text-sepia-100 focus:outline-none focus:ring-2 focus:ring-blue-deep"
                />
              </div>
              {'Notification' in window && (
                <button
                  onClick={requestNotifications}
                  className={[
                    'w-full rounded-lg border px-4 py-3 text-sm font-medium transition-colors',
                    notificationsEnabled
                      ? 'border-teal-400 bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400'
                      : 'border-sepia-300 dark:border-sepia-600 text-sepia-700 dark:text-sepia-300 hover:bg-sepia-100',
                  ].join(' ')}
                >
                  {notificationsEnabled ? '✓ Notificaciones activadas' : 'Activar notificaciones'}
                </button>
              )}
              <p className="text-xs text-sepia-500">Podés activarlas después desde Configuración</p>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" size="lg" onClick={() => setStep(2)}>Volver</Button>
              <Button fullWidth size="lg" onClick={() => setStep(4)}>Siguiente</Button>
            </div>
          </div>
        )}

        {/* ── Paso 4: Desafío semanal ── */}
        {step === 4 && (
          <div className="flex flex-col gap-5 animate-fade-in" style={{ maxHeight: '85dvh' }}>
            {/* Explicación visual */}
            <div className="text-center space-y-3 shrink-0">
              <h2 className="font-sans text-2xl font-semibold text-sepia-900 dark:text-sepia-50">
                Tu desafío semanal
              </h2>
              <div className="flex items-center justify-center gap-6">
                <DemoCircle target={goalTargets[1] ?? DEFAULT_TARGET} />
                <div className="text-left space-y-1.5 max-w-[170px]">
                  <p className="text-sm text-sepia-700 dark:text-sepia-300 leading-snug">
                    Cada middah tiene un círculo que se va llenando con los puntos que acumulás durante la semana.
                  </p>
                  <p className="text-xs text-sepia-500">
                    Elegí tu objetivo para cada una. Podés cambiarlo cuando quieras.
                  </p>
                </div>
              </div>
            </div>

            {/* Lista de middot — scrollable */}
            <div className="flex-1 overflow-y-auto min-h-0 bg-white dark:bg-sepia-900 rounded-xl border border-sepia-200 dark:border-sepia-700">
              {MIDDOT.map((middah, i) => {
                const t = goalTargets[middah.id] ?? DEFAULT_TARGET
                return (
                  <div
                    key={middah.id}
                    className={['flex items-center gap-3 px-4 py-3', i > 0 ? 'border-t border-sepia-100 dark:border-sepia-800' : ''].join(' ')}
                  >
                    <span className="font-serif text-sm text-sepia-400 w-4 text-right shrink-0">{middah.id}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-serif text-sm text-sepia-900 dark:text-sepia-100 truncate">{middah.hebrew}</p>
                      <p className="text-[11px] text-sepia-500 truncate">{middah.spanish}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => setTarget(middah.id, -1)}
                        className="w-7 h-7 rounded-lg border border-sepia-200 dark:border-sepia-700 text-sepia-700 dark:text-sepia-300 hover:bg-sepia-100 dark:hover:bg-sepia-800 font-bold text-base leading-none flex items-center justify-center transition-colors"
                      >
                        −
                      </button>
                      <span className={['w-6 text-center text-sm font-bold', t === 0 ? 'text-sepia-400' : 'text-sepia-900 dark:text-sepia-50'].join(' ')}>
                        {t === 0 ? '—' : t}
                      </span>
                      <button
                        onClick={() => setTarget(middah.id, +1)}
                        className="w-7 h-7 rounded-lg border border-sepia-200 dark:border-sepia-700 text-sepia-700 dark:text-sepia-300 hover:bg-sepia-100 dark:hover:bg-sepia-800 font-bold text-base leading-none flex items-center justify-center transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Botones */}
            <div className="flex gap-3 shrink-0">
              <Button variant="secondary" size="lg" onClick={() => setStep(3)}>Volver</Button>
              <Button fullWidth size="lg" onClick={finish}>Comenzar mi práctica</Button>
            </div>
          </div>
        )}

        {/* Indicador de pasos (desde paso 1 en adelante) */}
        {step > 0 && (
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((s) => (
              <div
                key={s}
                className={[
                  'h-1.5 rounded-full transition-all duration-300',
                  s === step ? 'w-8 bg-blue-deep dark:bg-blue-400'
                  : s < step ? 'w-2 bg-blue-deep/40'
                  : 'w-2 bg-sepia-300 dark:bg-sepia-600',
                ].join(' ')}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

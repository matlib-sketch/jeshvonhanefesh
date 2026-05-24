import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { Calendar, Bell } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { useSettingsStore } from '../core/stores/settingsStore'
import i18n from '../web/i18n'

const LANGUAGES = [
  { code: 'es' as const, label: 'Español', native: 'Español' },
  { code: 'en' as const, label: 'English', native: 'English' },
  { code: 'he' as const, label: 'עברית', native: 'Hebrew', isHebrew: true },
]

export const Onboarding = () => {
  const navigate = useNavigate()
  const { updateSettings } = useSettingsStore()
  const [step, setStep] = useState(0)
  const [language, setLanguage] = useState<'es' | 'en' | 'he'>('es')
  const [cycleStartDate, setCycleStartDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [reminderTime, setReminderTime] = useState('21:00')
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)

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

  const finish = async () => {
    await updateSettings({
      language,
      cycleStartDate,
      reminderTime,
      notificationsEnabled,
      onboardingCompleted: true,
    })
    navigate('/')
  }

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
                  {native !== label && (
                    <span className="text-sm text-sepia-500">{native}</span>
                  )}
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
                  'Registrás reflexiones en un diario personal.',
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
              <h2 className="font-sans text-2xl font-semibold text-sepia-900 dark:text-sepia-50">
                Inicio del primer ciclo
              </h2>
            </div>
            <div className="bg-white dark:bg-sepia-900 rounded-xl p-5 shadow-sm border border-sepia-200 dark:border-sepia-700 space-y-4">
              <p className="text-sm text-sepia-700 dark:text-sepia-300 leading-relaxed">
                ¿Cuándo empezaste o querés empezar tu práctica? Esta fecha define el ritmo de los ciclos.
              </p>
              <div>
                <label className="block text-sm font-medium text-sepia-700 dark:text-sepia-300 mb-1.5">
                  Fecha de inicio
                </label>
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
              <h2 className="font-sans text-2xl font-semibold text-sepia-900 dark:text-sepia-50">
                Recordatorio diario
              </h2>
            </div>
            <div className="bg-white dark:bg-sepia-900 rounded-xl p-5 shadow-sm border border-sepia-200 dark:border-sepia-700 space-y-4">
              <p className="text-sm text-sepia-700 dark:text-sepia-300 leading-relaxed">
                ¿A qué hora querés que te recuerde hacer tu cheshbon?
              </p>
              <div>
                <label className="block text-sm font-medium text-sepia-700 dark:text-sepia-300 mb-1.5">
                  Hora del recordatorio
                </label>
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
              <Button fullWidth size="lg" onClick={finish}>Comenzar mi práctica</Button>
            </div>
          </div>
        )}

        {/* Indicador de pasos (solo desde paso 1 en adelante) */}
        {step > 0 && (
          <div className="flex justify-center gap-2 mt-8">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={[
                  'h-1.5 rounded-full transition-all duration-300',
                  s === step ? 'w-8 bg-blue-deep dark:bg-blue-400' : s < step ? 'w-2 bg-blue-deep/40' : 'w-2 bg-sepia-300 dark:bg-sepia-600',
                ].join(' ')}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

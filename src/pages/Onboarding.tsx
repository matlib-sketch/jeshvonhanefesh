import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { Calendar, Bell } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { useSettingsStore } from '../core/stores/settingsStore'

export const Onboarding = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { updateSettings } = useSettingsStore()
  const [step, setStep] = useState(1)
  const [cycleStartDate, setCycleStartDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [reminderTime, setReminderTime] = useState('21:00')
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)

  const requestNotifications = async () => {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission()
      setNotificationsEnabled(perm === 'granted')
    }
  }

  const finish = async () => {
    await updateSettings({
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

        {/* Step 1: Bienvenida */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center space-y-2">
              <h1 className="font-serif text-4xl text-sepia-900 dark:text-sepia-50">חשבון הנפש</h1>
              <p className="font-sans text-lg text-sepia-700 dark:text-sepia-300">
                {t('onboarding.step1.title')}
              </p>
            </div>

            <div className="bg-white dark:bg-sepia-900 rounded-xl p-5 shadow-sm border border-sepia-200 dark:border-sepia-700 space-y-4">
              <p className="text-sepia-700 dark:text-sepia-300 text-sm leading-relaxed">
                {t('onboarding.step1.body')}
              </p>
              <div className="border-t border-sepia-100 dark:border-sepia-700 pt-4 space-y-2">
                <p className="text-xs font-semibold text-sepia-500 uppercase tracking-wide">
                  {t('onboarding.step1.how')}
                </p>
                {['how1', 'how2', 'how3', 'how4'].map((k) => (
                  <div key={k} className="flex items-start gap-2 text-sm text-sepia-700 dark:text-sepia-300">
                    <span className="text-blue-deep dark:text-blue-400 mt-0.5">•</span>
                    <span>{t(`onboarding.step1.${k}`)}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button fullWidth size="lg" onClick={() => setStep(2)}>
              {t('onboarding.step1.next')}
            </Button>
          </div>
        )}

        {/* Step 2: Fecha de inicio */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center space-y-2">
              <Calendar size={40} className="mx-auto text-blue-deep dark:text-blue-400" />
              <h2 className="font-sans text-2xl font-semibold text-sepia-900 dark:text-sepia-50">
                {t('onboarding.step2.title')}
              </h2>
            </div>
            <div className="bg-white dark:bg-sepia-900 rounded-xl p-5 shadow-sm border border-sepia-200 dark:border-sepia-700 space-y-4">
              <p className="text-sm text-sepia-700 dark:text-sepia-300 leading-relaxed">
                {t('onboarding.step2.body')}
              </p>
              <div>
                <label className="block text-sm font-medium text-sepia-700 dark:text-sepia-300 mb-1.5">
                  {t('onboarding.step2.label')}
                </label>
                <input
                  type="date"
                  value={cycleStartDate}
                  onChange={(e) => setCycleStartDate(e.target.value)}
                  className="w-full rounded-lg border border-sepia-300 dark:border-sepia-600 bg-transparent px-3 py-2.5 text-sepia-900 dark:text-sepia-100 focus:outline-none focus:ring-2 focus:ring-blue-deep"
                />
                <p className="mt-1.5 text-xs text-sepia-500">{t('onboarding.step2.hint')}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" size="lg" onClick={() => setStep(1)}>
                {t('common.back')}
              </Button>
              <Button fullWidth size="lg" onClick={() => setStep(3)}>
                {t('onboarding.step2.next')}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Recordatorio */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center space-y-2">
              <Bell size={40} className="mx-auto text-blue-deep dark:text-blue-400" />
              <h2 className="font-sans text-2xl font-semibold text-sepia-900 dark:text-sepia-50">
                {t('onboarding.step3.title')}
              </h2>
            </div>
            <div className="bg-white dark:bg-sepia-900 rounded-xl p-5 shadow-sm border border-sepia-200 dark:border-sepia-700 space-y-4">
              <p className="text-sm text-sepia-700 dark:text-sepia-300 leading-relaxed">
                {t('onboarding.step3.body')}
              </p>
              <div>
                <label className="block text-sm font-medium text-sepia-700 dark:text-sepia-300 mb-1.5">
                  {t('onboarding.step3.label')}
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
                  {notificationsEnabled
                    ? '✓ Notificaciones activadas'
                    : t('onboarding.step3.notifications')}
                </button>
              )}
              <p className="text-xs text-sepia-500">{t('onboarding.step3.notificationsHint')}</p>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" size="lg" onClick={() => setStep(2)}>
                {t('common.back')}
              </Button>
              <Button fullWidth size="lg" onClick={finish}>
                {t('onboarding.step3.finish')}
              </Button>
            </div>
          </div>
        )}

        {/* Indicador de pasos */}
        <div className="flex justify-center gap-2 mt-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={[
                'h-1.5 rounded-full transition-all duration-300',
                s === step ? 'w-8 bg-blue-deep dark:bg-blue-400' : 'w-2 bg-sepia-300 dark:bg-sepia-600',
              ].join(' ')}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

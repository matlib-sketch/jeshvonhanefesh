import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { differenceInDays, parseISO } from 'date-fns'
import { BottomNav } from './components/ui/BottomNav'
import { Onboarding } from './pages/Onboarding'
import { Today } from './pages/Today'
import { History } from './pages/History'
import { Progress } from './pages/Progress'
import { Goals } from './pages/Goals'
import { Settings } from './pages/Settings'
import { ProfileSelector } from './pages/ProfileSelector'
import { useSettingsStore } from './core/stores/settingsStore'
import { useProfileStore } from './core/stores/profileStore'
import i18n from './web/i18n'
import { syncDailyReminder } from './web/notifications'

const AppShell = () => {
  const { settings } = useSettingsStore()

  if (!settings) return (
    <div className="flex items-center justify-center min-h-screen bg-sepia-50 dark:bg-sepia-950 text-sepia-500">
      Cargando...
    </div>
  )

  if (!settings.onboardingCompleted) return <Onboarding />

  const daysSinceStart = settings.cycleStartDate
    ? differenceInDays(new Date(), parseISO(settings.cycleStartDate))
    : 0
  const defaultRoute = daysSinceStart >= 7 ? '/history' : '/today'

  return (
    <div className="min-h-screen bg-sepia-50 dark:bg-sepia-950">
      <main className="max-w-lg mx-auto px-4 pt-6 pb-24">
        <Routes>
          <Route path="/" element={<Navigate to={defaultRoute} replace />} />
          <Route path="/today" element={<Today />} />
          <Route path="/history" element={<History />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to={defaultRoute} replace />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  )
}

function App() {
  const { loadSettings, settings } = useSettingsStore()
  const { loadProfiles, currentProfile, loading: profileLoading } = useProfileStore()

  useEffect(() => {
    loadProfiles()
  }, [])

  useEffect(() => {
    if (currentProfile) loadSettings()
  }, [currentProfile])

  useEffect(() => {
    if (!settings) return
    i18n.changeLanguage(settings.language)
    const root = document.documentElement
    if (settings.theme === 'dark') root.classList.add('dark')
    else if (settings.theme === 'light') root.classList.remove('dark')
    else {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) root.classList.add('dark')
      else root.classList.remove('dark')
    }
    document.documentElement.dir = settings.language === 'he' ? 'rtl' : 'ltr'
    void syncDailyReminder(settings.reminderTime)
  }, [settings])

  // Mientras verificamos el perfil
  if (profileLoading) return (
    <div className="flex items-center justify-center min-h-screen bg-sepia-50 dark:bg-sepia-950 text-sepia-500">
      Cargando...
    </div>
  )

  // Sin sesión activa → selector de perfiles
  if (!currentProfile) return <ProfileSelector />

  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  )
}

export default App

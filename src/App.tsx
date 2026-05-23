import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { BottomNav } from './components/ui/BottomNav'
import { Onboarding } from './pages/Onboarding'
import { Today } from './pages/Today'
import { History } from './pages/History'
import { Progress } from './pages/Progress'
import { Goals } from './pages/Goals'
import { Settings } from './pages/Settings'
import { useSettingsStore } from './core/stores/settingsStore'
import i18n from './web/i18n'

const AppShell = () => {
  const { settings } = useSettingsStore()

  if (!settings) return (
    <div className="flex items-center justify-center min-h-screen bg-sepia-50 dark:bg-sepia-950 text-sepia-500">
      Cargando...
    </div>
  )

  if (!settings.onboardingCompleted) {
    return <Onboarding />
  }

  return (
    <div className="min-h-screen bg-sepia-50 dark:bg-sepia-950">
      <main className="max-w-lg mx-auto px-4 pt-6 pb-24">
        <Routes>
          <Route path="/" element={<Today />} />
          <Route path="/history" element={<History />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  )
}

function App() {
  const { loadSettings, settings } = useSettingsStore()

  useEffect(() => {
    loadSettings()
  }, [])

  useEffect(() => {
    if (!settings) return

    i18n.changeLanguage(settings.language)

    const root = document.documentElement
    if (settings.theme === 'dark') {
      root.classList.add('dark')
    } else if (settings.theme === 'light') {
      root.classList.remove('dark')
    } else {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) root.classList.add('dark')
      else root.classList.remove('dark')
    }

    // Soporte RTL para hebreo
    document.documentElement.dir = settings.language === 'he' ? 'rtl' : 'ltr'
  }, [settings])

  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  )
}

export default App

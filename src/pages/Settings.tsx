import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import i18n from '../web/i18n'
import { Download, Upload, RotateCcw, Bell, Globe, Palette, Calendar } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { useSettingsStore } from '../core/stores/settingsStore'
import { exportAllData, importAllData, resetAllData } from '../core/storage/db'
import type { UserSettings } from '../core/domain/types'

export const Settings = () => {
  const { t } = useTranslation()
  const { settings, updateSettings } = useSettingsStore()
  const [resetConfirm, setResetConfirm] = useState('')
  const [showResetDialog, setShowResetDialog] = useState(false)
  const importRef = useRef<HTMLInputElement>(null)

  if (!settings) return null

  const handleChange = async <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    await updateSettings({ [key]: value })
    if (key === 'language') i18n.changeLanguage(value as string)
    if (key === 'theme') applyTheme(value as UserSettings['theme'])
  }

  const applyTheme = (theme: UserSettings['theme']) => {
    const root = document.documentElement
    if (theme === 'dark') root.classList.add('dark')
    else if (theme === 'light') root.classList.remove('dark')
    else {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) root.classList.add('dark')
      else root.classList.remove('dark')
    }
  }

  const handleExport = async () => {
    const data = await exportAllData()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cheshbon-hanefesh-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!confirm(t('settings.importConfirm'))) return
    const reader = new FileReader()
    reader.onload = async (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string)
        await importAllData(data)
        window.location.reload()
      } catch {
        alert('Error al importar el archivo. Verificá que sea un JSON válido.')
      }
    }
    reader.readAsText(file)
  }

  const handleReset = async () => {
    if (resetConfirm !== 'BORRAR') return
    await resetAllData()
    window.location.reload()
  }

  const SectionHeader = ({ icon: Icon, label }: { icon: React.ElementType; label: string }) => (
    <div className="flex items-center gap-2 mb-2">
      <Icon size={16} className="text-sepia-500" />
      <h3 className="text-xs font-semibold text-sepia-500 uppercase tracking-wide">{label}</h3>
    </div>
  )

  return (
    <div className="space-y-5 pb-6">
      <h1 className="text-xl font-semibold text-sepia-900 dark:text-sepia-50 px-1">
        {t('settings.title')}
      </h1>

      {/* Recordatorio */}
      <Card>
        <SectionHeader icon={Bell} label={t('settings.reminder')} />
        <input
          type="time"
          value={settings.reminderTime}
          onChange={(e) => handleChange('reminderTime', e.target.value)}
          className="w-full rounded-lg border border-sepia-200 dark:border-sepia-700 bg-transparent px-3 py-2.5 text-sepia-900 dark:text-sepia-100 focus:outline-none focus:ring-2 focus:ring-blue-deep"
        />
      </Card>

      {/* Inicio de ciclo */}
      <Card>
        <SectionHeader icon={Calendar} label={t('settings.cycleStart')} />
        <input
          type="date"
          value={settings.cycleStartDate}
          onChange={(e) => handleChange('cycleStartDate', e.target.value)}
          className="w-full rounded-lg border border-sepia-200 dark:border-sepia-700 bg-transparent px-3 py-2.5 text-sepia-900 dark:text-sepia-100 focus:outline-none focus:ring-2 focus:ring-blue-deep"
        />
      </Card>

      {/* Idioma */}
      <Card>
        <SectionHeader icon={Globe} label={t('settings.language')} />
        <div className="grid grid-cols-3 gap-2">
          {(['es', 'en', 'he'] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => handleChange('language', lang)}
              className={[
                'py-2 rounded-lg text-sm font-medium transition-colors border',
                settings.language === lang
                  ? 'bg-blue-deep text-white border-blue-deep'
                  : 'border-sepia-200 dark:border-sepia-700 text-sepia-700 dark:text-sepia-300 hover:bg-sepia-100',
              ].join(' ')}
            >
              {t(`settings.languages.${lang}`)}
            </button>
          ))}
        </div>
      </Card>

      {/* Tema */}
      <Card>
        <SectionHeader icon={Palette} label={t('settings.theme')} />
        <div className="grid grid-cols-3 gap-2">
          {(['light', 'dark', 'system'] as const).map((theme) => (
            <button
              key={theme}
              onClick={() => handleChange('theme', theme)}
              className={[
                'py-2 rounded-lg text-sm font-medium transition-colors border',
                settings.theme === theme
                  ? 'bg-blue-deep text-white border-blue-deep'
                  : 'border-sepia-200 dark:border-sepia-700 text-sepia-700 dark:text-sepia-300 hover:bg-sepia-100',
              ].join(' ')}
            >
              {t(`settings.theme${theme.charAt(0).toUpperCase() + theme.slice(1)}`)}
            </button>
          ))}
        </div>
      </Card>

      {/* Export / Import */}
      <Card className="space-y-3">
        <SectionHeader icon={Download} label="Datos" />
        <div className="space-y-2">
          <div>
            <Button fullWidth variant="secondary" onClick={handleExport}>
              <Download size={16} /> {t('settings.export')}
            </Button>
            <p className="text-xs text-sepia-500 mt-1 px-1">{t('settings.exportDesc')}</p>
          </div>
          <div>
            <Button fullWidth variant="secondary" onClick={() => importRef.current?.click()}>
              <Upload size={16} /> {t('settings.import')}
            </Button>
            <p className="text-xs text-sepia-500 mt-1 px-1">{t('settings.importDesc')}</p>
            <input ref={importRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
          </div>
        </div>
      </Card>

      {/* Reset */}
      <Card className="border-red-200 dark:border-red-900">
        <SectionHeader icon={RotateCcw} label={t('settings.reset')} />
        {!showResetDialog ? (
          <Button fullWidth variant="danger" onClick={() => setShowResetDialog(true)}>
            {t('settings.reset')}
          </Button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-red-700 dark:text-red-400">{t('settings.resetConfirm')}</p>
            <p className="text-xs text-sepia-600">{t('settings.resetConfirm2')}</p>
            <input
              type="text"
              value={resetConfirm}
              onChange={(e) => setResetConfirm(e.target.value)}
              placeholder="BORRAR"
              className="w-full rounded-lg border border-red-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => { setShowResetDialog(false); setResetConfirm('') }}>
                {t('common.cancel')}
              </Button>
              <Button variant="danger" size="sm" onClick={handleReset} disabled={resetConfirm !== 'BORRAR'}>
                Confirmar borrado
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

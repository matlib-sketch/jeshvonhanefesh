import { useState, useEffect } from 'react'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { useProfileStore } from '../core/stores/profileStore'
import type { ApiProfile } from '../core/api/users'

// ── Colores de avatar disponibles ──
const COLORS = [
  { hex: '#1e3a5f', name: 'Azul' },
  { hex: '#0d9488', name: 'Verde agua' },
  { hex: '#16a34a', name: 'Verde' },
  { hex: '#d97706', name: 'Ámbar' },
  { hex: '#dc2626', name: 'Rojo' },
  { hex: '#7c3aed', name: 'Violeta' },
]

// ── Círculo de avatar ──
const Avatar = ({ profile, size = 56 }: { profile: Pick<ApiProfile, 'name' | 'color'>; size?: number }) => (
  <div
    className="rounded-full flex items-center justify-center text-white font-bold shrink-0"
    style={{ width: size, height: size, backgroundColor: profile.color, fontSize: size * 0.38 }}
  >
    {profile.name.charAt(0).toUpperCase()}
  </div>
)

// ── Teclado numérico ──
const NumPad = ({ onDigit, onDelete }: { onDigit: (d: string) => void; onDelete: () => void }) => (
  <div className="grid grid-cols-3 gap-3 max-w-[256px] mx-auto select-none">
    {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
      <button
        key={d}
        onClick={() => onDigit(d)}
        className="h-16 rounded-2xl bg-sepia-100 dark:bg-sepia-800 text-2xl font-medium text-sepia-900 dark:text-sepia-100 active:bg-sepia-200 dark:active:bg-sepia-700 transition-colors"
      >
        {d}
      </button>
    ))}
    <div />
    <button
      onClick={() => onDigit('0')}
      className="h-16 rounded-2xl bg-sepia-100 dark:bg-sepia-800 text-2xl font-medium text-sepia-900 dark:text-sepia-100 active:bg-sepia-200 transition-colors"
    >
      0
    </button>
    <button
      onClick={onDelete}
      className="h-16 rounded-2xl bg-sepia-100 dark:bg-sepia-800 text-xl text-sepia-700 dark:text-sepia-300 active:bg-sepia-200 transition-colors flex items-center justify-center"
    >
      ⌫
    </button>
  </div>
)

// ── PIN dots ──
const PinDots = ({ length, error }: { length: number; error: boolean }) => (
  <div className={['flex gap-4 justify-center my-6', error ? 'animate-shake' : ''].join(' ')}>
    {[0, 1, 2, 3].map((i) => (
      <div
        key={i}
        className={[
          'w-4 h-4 rounded-full border-2 transition-all duration-150',
          length > i
            ? 'bg-blue-deep border-blue-deep scale-110'
            : 'border-sepia-300 dark:border-sepia-600',
          error ? 'border-red-500 bg-red-500' : '',
        ].join(' ')}
      />
    ))}
  </div>
)

// ── Vista PIN ──
const PinView = ({
  profile,
  onSuccess,
  onBack,
}: {
  profile: ApiProfile
  onSuccess: (profileId: string, pin: string) => Promise<boolean>
  onBack: () => void
}) => {
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)

  const addDigit = (d: string) => {
    if (pin.length >= 4) return
    const next = pin + d
    setPin(next)
    if (next.length === 4) submitPin(next)
  }

  const deleteDigit = () => setPin((p) => p.slice(0, -1))

  const submitPin = async (p: string) => {
    const ok = await onSuccess(profile.id, p)
    if (!ok) {
      setError(true)
      setTimeout(() => { setError(false); setPin('') }, 600)
    }
  }

  return (
    <div className="flex flex-col items-center gap-2 animate-fade-in">
      <button onClick={onBack} className="self-start p-2 rounded-lg hover:bg-sepia-100 dark:hover:bg-sepia-800 mb-2">
        <ArrowLeft size={20} className="text-sepia-600" />
      </button>

      <Avatar profile={profile} size={72} />
      <h2 className="text-xl font-semibold text-sepia-900 dark:text-sepia-50 mt-2">{profile.name}</h2>
      <p className="text-sm text-sepia-500">Ingresá tu PIN</p>

      <PinDots length={pin.length} error={error} />
      {error && <p className="text-sm text-red-500 -mt-4 mb-2">PIN incorrecto</p>}

      <NumPad onDigit={addDigit} onDelete={deleteDigit} />
    </div>
  )
}

// ── Vista Crear perfil ──
const CreateView = ({
  onCreate,
  onBack,
  isFirst,
}: {
  onCreate: (name: string, color: string, pin: string) => Promise<void>
  onBack: () => void
  isFirst: boolean
}) => {
  const [step, setStep] = useState<'name' | 'pin' | 'confirm'>('name')
  const [name, setName] = useState('')
  const [color, setColor] = useState(COLORS[0].hex)
  const [pin, setPin] = useState('')
  const [pinConfirm, setPinConfirm] = useState('')
  const [error, setError] = useState(false)

  const addDigit = (d: string) => {
    if (step === 'pin') {
      if (pin.length >= 4) return
      setPin((p) => p + d)
    } else {
      if (pinConfirm.length >= 4) return
      const next = pinConfirm + d
      setPinConfirm(next)
      if (next.length === 4) {
        if (next !== pin) {
          setError(true)
          setTimeout(() => { setError(false); setPinConfirm('') }, 600)
        } else {
          onCreate(name, color, pin)
        }
      }
    }
  }

  const deleteDigit = () => {
    if (step === 'pin') setPin((p) => p.slice(0, -1))
    else setPinConfirm((p) => p.slice(0, -1))
  }

  return (
    <div className="flex flex-col gap-4 animate-fade-in w-full">
      {!isFirst && (
        <button onClick={onBack} className="self-start p-2 rounded-lg hover:bg-sepia-100 dark:hover:bg-sepia-800">
          <ArrowLeft size={20} className="text-sepia-600" />
        </button>
      )}

      <div className="text-center space-y-1">
        <h1 className="font-serif text-3xl text-sepia-900 dark:text-sepia-50">חשבון הנפש</h1>
        <p className="text-sepia-500 text-sm">
          {isFirst ? 'Creá tu perfil para comenzar' : 'Nuevo perfil'}
        </p>
      </div>

      {step === 'name' && (
        <div className="space-y-5">
          {/* Avatar preview */}
          <div className="flex justify-center">
            <Avatar profile={{ name: name || '?', color }} size={80} />
          </div>

          {/* Nombre */}
          <div>
            <label className="text-xs font-semibold text-sepia-500 uppercase tracking-wide block mb-1.5">
              Tu nombre
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre"
              autoFocus
              className="w-full rounded-xl border border-sepia-200 dark:border-sepia-700 bg-white dark:bg-sepia-900 px-4 py-3 text-lg text-sepia-900 dark:text-sepia-100 focus:outline-none focus:ring-2 focus:ring-blue-deep"
            />
          </div>

          {/* Color */}
          <div>
            <label className="text-xs font-semibold text-sepia-500 uppercase tracking-wide block mb-2">
              Color de avatar
            </label>
            <div className="flex gap-3 justify-center">
              {COLORS.map((c) => (
                <button
                  key={c.hex}
                  onClick={() => setColor(c.hex)}
                  className={['w-10 h-10 rounded-full transition-all', color === c.hex ? 'ring-4 ring-offset-2 ring-blue-deep scale-110' : 'hover:scale-105'].join(' ')}
                  style={{ backgroundColor: c.hex }}
                  aria-label={c.name}
                />
              ))}
            </div>
          </div>

          <Button fullWidth size="lg" disabled={!name.trim()} onClick={() => setStep('pin')}>
            Continuar
          </Button>

          <button
            onClick={() => { if (name.trim()) onCreate(name, color, '') }}
            className="w-full text-center text-sm text-sepia-500 hover:text-sepia-700"
            disabled={!name.trim()}
          >
            Continuar sin PIN
          </button>
        </div>
      )}

      {(step === 'pin' || step === 'confirm') && (
        <div className="flex flex-col items-center gap-2">
          <Avatar profile={{ name, color }} size={56} />
          <p className="text-sepia-700 dark:text-sepia-300 font-medium">{name}</p>
          <p className="text-sm text-sepia-500">
            {step === 'pin' ? 'Elegí un PIN de 4 dígitos' : 'Repetí el PIN para confirmar'}
          </p>

          <PinDots length={step === 'pin' ? pin.length : pinConfirm.length} error={error} />
          {error && <p className="text-sm text-red-500 -mt-4 mb-2">Los PIN no coinciden</p>}

          <NumPad onDigit={addDigit} onDelete={deleteDigit} />

          {step === 'pin' && pin.length === 4 && (
            <Button size="sm" variant="secondary" onClick={() => setStep('confirm')} className="mt-2">
              Confirmar PIN →
            </Button>
          )}

          <button onClick={() => { setStep('name'); setPin(''); setPinConfirm('') }} className="text-sm text-sepia-500 hover:text-sepia-700 mt-2">
            Volver
          </button>
        </div>
      )}
    </div>
  )
}

// ── Pantalla principal ──
export const ProfileSelector = () => {
  const { profiles, loading, loginWithPin, loginDirect, createAndLogin, deleteProfile } = useProfileStore()
  const [mode, setMode] = useState<'select' | 'pin' | 'create'>('select')
  const [selectedProfile, setSelectedProfile] = useState<ApiProfile | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && profiles.length === 0) setMode('create')
  }, [loading, profiles])

  const handleSelectProfile = async (profile: ApiProfile) => {
    if (profile.has_pin) {
      setSelectedProfile(profile)
      setMode('pin')
    } else {
      await loginDirect(profile.id)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-sepia-50 dark:bg-sepia-950 flex items-center justify-center text-sepia-500">
      Cargando...
    </div>
  )

  return (
    <div className="min-h-screen bg-sepia-50 dark:bg-sepia-950 flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">

        {/* ── Crear perfil ── */}
        {mode === 'create' && (
          <CreateView
            onCreate={createAndLogin}
            onBack={() => setMode('select')}
            isFirst={profiles.length === 0}
          />
        )}

        {/* ── Entrada de PIN ── */}
        {mode === 'pin' && selectedProfile && (
          <PinView
            profile={selectedProfile}
            onSuccess={loginWithPin}
            onBack={() => { setMode('select'); setSelectedProfile(null) }}
          />
        )}

        {/* ── Selección de perfil ── */}
        {mode === 'select' && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center space-y-1">
              <h1 className="font-serif text-4xl text-sepia-900 dark:text-sepia-50">חשבון הנפש</h1>
              <p className="text-sepia-500 text-sm">¿Quién está practicando hoy?</p>
            </div>

            <div className="space-y-3">
              {profiles.map((profile) => (
                <div key={profile.id} className="flex items-center gap-3">
                  <button
                    onClick={() => handleSelectProfile(profile)}
                    className="flex-1 flex items-center gap-4 bg-white dark:bg-sepia-900 rounded-xl border-2 border-sepia-200 dark:border-sepia-700 p-4 hover:border-blue-deep dark:hover:border-blue-400 transition-all active:scale-[0.98]"
                  >
                    <Avatar profile={profile} size={48} />
                    <div className="text-left">
                      <p className="font-semibold text-sepia-900 dark:text-sepia-50">{profile.name}</p>
                      <p className="text-xs text-sepia-500">
                        {profile.has_pin ? 'Con PIN' : 'Sin PIN'}
                      </p>
                    </div>
                  </button>

                  {/* Eliminar perfil */}
                  {deleting === profile.id ? (
                    <div className="flex gap-1">
                      <button
                        onClick={() => deleteProfile(profile.id)}
                        className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 text-xs font-medium"
                      >
                        Confirmar
                      </button>
                      <button
                        onClick={() => setDeleting(null)}
                        className="p-2 rounded-lg bg-sepia-100 text-sepia-600 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleting(profile.id)}
                      className="p-2 rounded-lg text-sepia-400 hover:text-red-500 hover:bg-sepia-100 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={() => setMode('create')}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-sepia-300 dark:border-sepia-600 text-sepia-600 dark:text-sepia-400 hover:border-blue-deep hover:text-blue-deep transition-colors"
            >
              <Plus size={18} /> Agregar persona
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

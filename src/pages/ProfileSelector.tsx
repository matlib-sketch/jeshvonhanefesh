import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { useProfileStore } from '../core/stores/profileStore'
import { lookupByName, register, type ApiProfile } from '../core/api/users'

const COLORS = [
  { hex: '#1e3a5f', name: 'Azul' },
  { hex: '#0d9488', name: 'Verde agua' },
  { hex: '#16a34a', name: 'Verde' },
  { hex: '#d97706', name: 'Ámbar' },
  { hex: '#dc2626', name: 'Rojo' },
  { hex: '#7c3aed', name: 'Violeta' },
]

// ── Avatar ──────────────────────────────────────────────────────────────────
const Avatar = ({ name, color, size = 56 }: { name: string; color: string; size?: number }) => (
  <div
    className="rounded-full flex items-center justify-center text-white font-bold shrink-0"
    style={{ width: size, height: size, backgroundColor: color, fontSize: size * 0.38 }}
  >
    {name.charAt(0).toUpperCase()}
  </div>
)

// ── Teclado numérico ────────────────────────────────────────────────────────
const NumPad = ({ onDigit, onDelete }: { onDigit: (d: string) => void; onDelete: () => void }) => (
  <div className="grid grid-cols-3 gap-3 max-w-[256px] mx-auto select-none">
    {['1','2','3','4','5','6','7','8','9'].map((d) => (
      <button key={d} onClick={() => onDigit(d)}
        className="h-16 rounded-2xl bg-sepia-100 dark:bg-sepia-800 text-2xl font-medium text-sepia-900 dark:text-sepia-100 active:bg-sepia-200 dark:active:bg-sepia-700 transition-colors">
        {d}
      </button>
    ))}
    <div />
    <button onClick={() => onDigit('0')}
      className="h-16 rounded-2xl bg-sepia-100 dark:bg-sepia-800 text-2xl font-medium text-sepia-900 dark:text-sepia-100 active:bg-sepia-200 transition-colors">
      0
    </button>
    <button onClick={onDelete}
      className="h-16 rounded-2xl bg-sepia-100 dark:bg-sepia-800 text-xl text-sepia-700 dark:text-sepia-300 active:bg-sepia-200 transition-colors flex items-center justify-center">
      ⌫
    </button>
  </div>
)

// ── PIN dots ────────────────────────────────────────────────────────────────
const PinDots = ({ length, error }: { length: number; error: boolean }) => (
  <div className={['flex gap-4 justify-center my-6', error ? 'animate-shake' : ''].join(' ')}>
    {[0,1,2,3].map((i) => (
      <div key={i} className={[
        'w-4 h-4 rounded-full border-2 transition-all duration-150',
        length > i ? 'bg-blue-deep border-blue-deep scale-110' : 'border-sepia-300 dark:border-sepia-600',
        error ? 'border-red-500 bg-red-500' : '',
      ].join(' ')} />
    ))}
  </div>
)

// ── Vista de entrada de nombre ───────────────────────────────────────────────
const NameView = ({
  onFound,
  onRegister,
}: {
  onFound: (profile: ApiProfile) => void
  onRegister: () => void
}) => {
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleContinue = async () => {
    if (!name.trim()) return
    setLoading(true)
    setError('')
    try {
      const profile = await lookupByName(name.trim())
      if (profile) {
        onFound(profile)
      } else {
        setError('No encontramos una cuenta con ese nombre.')
      }
    } catch {
      setError('Error de conexión. Verificá tu internet.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center space-y-1">
        <h1 className="font-serif text-4xl text-sepia-900 dark:text-sepia-50">חשבון הנפש</h1>
        <p className="text-sepia-500 text-sm">¿Quién está practicando hoy?</p>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-sepia-500 uppercase tracking-wide mb-1.5">
            Tu nombre
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setError('') }}
            onKeyDown={(e) => e.key === 'Enter' && handleContinue()}
            placeholder="Ingresá tu nombre"
            autoFocus
            className="w-full rounded-xl border-2 border-sepia-200 dark:border-sepia-700 bg-white dark:bg-sepia-900 px-4 py-3 text-lg text-sepia-900 dark:text-sepia-100 focus:outline-none focus:border-blue-deep transition-colors"
          />
          {error && <p className="text-sm text-red-500 mt-1.5 px-1">{error}</p>}
        </div>

        <Button fullWidth size="lg" onClick={handleContinue} disabled={!name.trim() || loading}>
          {loading ? 'Buscando...' : 'Continuar →'}
        </Button>
      </div>

      <div className="text-center pt-4 border-t border-sepia-100 dark:border-sepia-800 space-y-1">
        <p className="text-xs text-sepia-500">¿Todavía no tenés cuenta?</p>
        <button
          onClick={onRegister}
          className="text-sm font-medium text-blue-deep dark:text-blue-400 hover:underline"
        >
          Crear una cuenta nueva
        </button>
      </div>
    </div>
  )
}

// ── Vista de PIN ─────────────────────────────────────────────────────────────
const PinView = ({
  profile,
  onBack,
}: {
  profile: ApiProfile
  onBack: () => void
}) => {
  const { loginWithPin } = useProfileStore()
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)

  const addDigit = (d: string) => {
    if (pin.length >= 4) return
    const next = pin + d
    setPin(next)
    if (next.length === 4) submitPin(next)
  }

  const submitPin = async (p: string) => {
    const ok = await loginWithPin(profile.id, p)
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
      <Avatar name={profile.name} color={profile.color} size={72} />
      <h2 className="text-xl font-semibold text-sepia-900 dark:text-sepia-50 mt-2">{profile.name}</h2>
      <p className="text-sm text-sepia-500">Ingresá tu PIN</p>
      <PinDots length={pin.length} error={error} />
      {error && <p className="text-sm text-red-500 -mt-4 mb-2">PIN incorrecto</p>}
      <NumPad onDigit={addDigit} onDelete={() => setPin((p) => p.slice(0, -1))} />
    </div>
  )
}

// ── Vista de registro ─────────────────────────────────────────────────────────
const RegisterView = ({ onBack }: { onBack: () => void }) => {
  const { createAndLogin } = useProfileStore()
  const [step, setStep] = useState<'info' | 'pin' | 'confirm'>('info')
  const [name, setName] = useState('')
  const [color, setColor] = useState(COLORS[0].hex)
  const [pin, setPin] = useState('')
  const [pinConfirm, setPinConfirm] = useState('')
  const [pinError, setPinError] = useState(false)
  const [registerError, setRegisterError] = useState('')
  const [loading, setLoading] = useState(false)

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
          setPinError(true)
          setTimeout(() => { setPinError(false); setPinConfirm('') }, 600)
        } else {
          doRegister(pin)
        }
      }
    }
  }

  const doRegister = async (finalPin: string) => {
    setLoading(true)
    setRegisterError('')
    try {
      await register(name.trim(), color, finalPin)
      createAndLogin()
    } catch (err) {
      setRegisterError((err as Error).message)
      setStep('info')
      setPin('')
      setPinConfirm('')
    } finally {
      setLoading(false)
    }
  }

  const skipPin = () => doRegister('')

  return (
    <div className="flex flex-col gap-4 animate-fade-in w-full">
      <button onClick={onBack} className="self-start p-2 rounded-lg hover:bg-sepia-100 dark:hover:bg-sepia-800">
        <ArrowLeft size={20} className="text-sepia-600" />
      </button>

      <div className="text-center space-y-1">
        <h1 className="font-serif text-3xl text-sepia-900 dark:text-sepia-50">חשבון הנפש</h1>
        <p className="text-sepia-500 text-sm">Nueva cuenta</p>
      </div>

      {registerError && (
        <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2 text-center">
          {registerError}
        </p>
      )}

      {step === 'info' && (
        <div className="space-y-5">
          <div className="flex justify-center">
            <Avatar name={name || '?'} color={color} size={80} />
          </div>
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
            onClick={skipPin}
            disabled={!name.trim() || loading}
            className="w-full text-center text-sm text-sepia-500 hover:text-sepia-700 disabled:opacity-40"
          >
            Continuar sin PIN
          </button>
        </div>
      )}

      {(step === 'pin' || step === 'confirm') && (
        <div className="flex flex-col items-center gap-2">
          <Avatar name={name} color={color} size={56} />
          <p className="text-sepia-700 dark:text-sepia-300 font-medium">{name}</p>
          <p className="text-sm text-sepia-500">
            {step === 'pin' ? 'Elegí un PIN de 4 dígitos' : 'Repetí el PIN para confirmar'}
          </p>
          <PinDots length={step === 'pin' ? pin.length : pinConfirm.length} error={pinError} />
          {pinError && <p className="text-sm text-red-500 -mt-4 mb-2">Los PIN no coinciden</p>}
          <NumPad onDigit={addDigit} onDelete={() => {
            if (step === 'pin') setPin((p) => p.slice(0, -1))
            else setPinConfirm((p) => p.slice(0, -1))
          }} />
          {step === 'pin' && pin.length === 4 && (
            <Button size="sm" variant="secondary" onClick={() => setStep('confirm')} className="mt-2">
              Confirmar PIN →
            </Button>
          )}
          <button onClick={() => { setStep('info'); setPin(''); setPinConfirm('') }}
            className="text-sm text-sepia-500 hover:text-sepia-700 mt-2">
            Volver
          </button>
        </div>
      )}
    </div>
  )
}

// ── Pantalla principal ───────────────────────────────────────────────────────
export const ProfileSelector = () => {
  const { loginDirect } = useProfileStore()
  const [mode, setMode] = useState<'name' | 'pin' | 'register'>('name')
  const [foundProfile, setFoundProfile] = useState<ApiProfile | null>(null)

  const handleFound = async (profile: ApiProfile) => {
    if (profile.has_pin) {
      setFoundProfile(profile)
      setMode('pin')
    } else {
      await loginDirect(profile.id)
    }
  }

  return (
    <div className="min-h-screen bg-sepia-50 dark:bg-sepia-950 flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        {mode === 'name' && (
          <NameView
            onFound={handleFound}
            onRegister={() => setMode('register')}
          />
        )}
        {mode === 'pin' && foundProfile && (
          <PinView
            profile={foundProfile}
            onBack={() => { setMode('name'); setFoundProfile(null) }}
          />
        )}
        {mode === 'register' && (
          <RegisterView onBack={() => setMode('name')} />
        )}
      </div>
    </div>
  )
}

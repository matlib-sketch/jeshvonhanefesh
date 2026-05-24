export const getToken = (): string | null => localStorage.getItem('authToken')
export const setToken = (t: string): void => { localStorage.setItem('authToken', t) }
export const clearToken = (): void => { localStorage.removeItem('authToken') }

export const getUserId = (): string | null => localStorage.getItem('authUserId')
export const setUserId = (id: string): void => { localStorage.setItem('authUserId', id) }
export const clearUserId = (): void => { localStorage.removeItem('authUserId') }

export const api = async <T = unknown>(path: string, options: RequestInit = {}): Promise<T> => {
  const token = getToken()
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...((options.headers as Record<string, string>) ?? {}),
    },
  })
  if (res.status === 401) {
    clearToken()
    clearUserId()
    window.location.reload()
    throw new Error('Sesión expirada')
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { message?: string }).message ?? `Error ${res.status}`)
  }
  return res.json() as T
}

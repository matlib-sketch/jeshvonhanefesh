import { Router } from 'express'
import { createHash, randomUUID } from 'crypto'
import { query } from '../db.js'
import { signToken } from '../auth.js'

const router = Router()

const hashPin = (pin) => {
  if (!pin) return ''
  return createHash('sha256').update(pin).digest('hex')
}

// GET /api/auth/users — lista de perfiles para la pantalla de selección
router.get('/users', async (_req, res) => {
  try {
    const { rows } = await query(
      `SELECT id, name, color, (pin_hash != '') AS has_pin, created_at
       FROM users ORDER BY created_at`
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, color, pin } = req.body
    if (!name?.trim()) return res.status(400).json({ message: 'Nombre requerido' })
    const id = randomUUID()
    await query(
      'INSERT INTO users (id, name, color, pin_hash) VALUES ($1, $2, $3, $4)',
      [id, name.trim(), color ?? '#1e3a5f', hashPin(pin ?? '')]
    )
    const token = signToken(id)
    res.json({ token, user: { id, name: name.trim(), color: color ?? '#1e3a5f' } })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { userId, pin } = req.body
    const { rows } = await query(
      'SELECT id, name, color, pin_hash FROM users WHERE id = $1',
      [userId]
    )
    if (!rows.length) return res.status(404).json({ message: 'Perfil no encontrado' })
    const user = rows[0]
    if (user.pin_hash && hashPin(pin ?? '') !== user.pin_hash) {
      return res.status(401).json({ message: 'PIN incorrecto' })
    }
    const token = signToken(user.id)
    res.json({ token, user: { id: user.id, name: user.name, color: user.color } })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// DELETE /api/auth/users/:id
router.delete('/users/:id', async (req, res) => {
  try {
    await query('DELETE FROM users WHERE id = $1', [req.params.id])
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router

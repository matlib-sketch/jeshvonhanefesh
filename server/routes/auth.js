import { Router } from 'express'
import { createHash, randomUUID } from 'crypto'
import { query } from '../db.js'
import { signToken, requireAuth } from '../auth.js'

const router = Router()

const hashPin = (pin) => {
  if (!pin) return ''
  return createHash('sha256').update(pin).digest('hex')
}

// GET /api/auth/me — usuario actual (requiere JWT)
router.get('/me', requireAuth, async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT id, name, color, (pin_hash != '') AS has_pin FROM users WHERE id = $1`,
      [req.userId]
    )
    if (!rows.length) return res.status(404).json({ message: 'Usuario no encontrado' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/auth/lookup?name=X — busca un usuario por nombre (sin exponer lista completa)
router.get('/lookup', async (req, res) => {
  try {
    const { name } = req.query
    if (!name?.trim()) return res.status(400).json({ message: 'Nombre requerido' })
    const { rows } = await query(
      `SELECT id, name, color, (pin_hash != '') AS has_pin FROM users WHERE LOWER(name) = LOWER($1) LIMIT 1`,
      [name.trim()]
    )
    if (!rows.length) return res.status(404).json({ message: 'No encontramos una cuenta con ese nombre' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, color, pin } = req.body
    if (!name?.trim()) return res.status(400).json({ message: 'Nombre requerido' })
    // Verificar nombre único (case-insensitive)
    const { rows: existing } = await query(
      'SELECT id FROM users WHERE LOWER(name) = LOWER($1)',
      [name.trim()]
    )
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Ya existe una cuenta con ese nombre. Elegí otro.' })
    }
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

// POST /api/auth/login — por userId o por nombre
router.post('/login', async (req, res) => {
  try {
    const { userId, name, pin } = req.body
    let q, params
    if (userId) {
      q = 'SELECT id, name, color, pin_hash FROM users WHERE id = $1'
      params = [userId]
    } else if (name) {
      q = 'SELECT id, name, color, pin_hash FROM users WHERE LOWER(name) = LOWER($1) LIMIT 1'
      params = [name.trim()]
    } else {
      return res.status(400).json({ message: 'Se requiere userId o name' })
    }
    const { rows } = await query(q, params)
    if (!rows.length) return res.status(404).json({ message: 'Cuenta no encontrada' })
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

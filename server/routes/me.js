import { Router } from 'express'
import { query, pool } from '../db.js'
import { requireAuth } from '../auth.js'

const router = Router()
router.use(requireAuth)

// ── Helpers ───────────────────────────────────────────

const toEntry = (r) => ({
  date: r.date,
  scores: r.scores,
  spiritualChecks: r.spiritual_checks ?? {},
  journal: r.journal,
  weekMiddahFocus: r.week_middah_focus,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
})

// ── Settings ──────────────────────────────────────────

router.get('/settings', async (req, res) => {
  try {
    const { rows } = await query(
      'SELECT data FROM settings WHERE user_id = $1',
      [req.userId]
    )
    res.json(rows[0]?.data ?? {})
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.put('/settings', async (req, res) => {
  try {
    await query(
      `INSERT INTO settings (user_id, data) VALUES ($1, $2::jsonb)
       ON CONFLICT (user_id) DO UPDATE SET data = settings.data || $2::jsonb`,
      [req.userId, JSON.stringify(req.body)]
    )
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── Entries ───────────────────────────────────────────

router.get('/entries', async (req, res) => {
  try {
    const { from, to } = req.query
    let text = `SELECT date, scores, spiritual_checks, journal, week_middah_focus, created_at, updated_at
                FROM entries WHERE user_id = $1`
    const params = [req.userId]
    if (from && to) {
      text += ' AND date BETWEEN $2 AND $3'
      params.push(from, to)
    }
    text += ' ORDER BY date'
    const { rows } = await query(text, params)
    res.json(rows.map(toEntry))
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.put('/entries/:date', async (req, res) => {
  try {
    const { scores, spiritualChecks, journal, weekMiddahFocus } = req.body
    await query(
      `INSERT INTO entries (user_id, date, scores, spiritual_checks, journal, week_middah_focus)
       VALUES ($1, $2, $3::jsonb, $4::jsonb, $5, $6)
       ON CONFLICT (user_id, date) DO UPDATE
         SET scores = $3::jsonb, spiritual_checks = $4::jsonb, journal = $5, week_middah_focus = $6, updated_at = NOW()`,
      [req.userId, req.params.date, JSON.stringify(scores ?? {}), JSON.stringify(spiritualChecks ?? {}), journal ?? '', weekMiddahFocus ?? null]
    )
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.delete('/entries/:date', async (req, res) => {
  try {
    await query(
      'DELETE FROM entries WHERE user_id = $1 AND date = $2',
      [req.userId, req.params.date]
    )
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── Goals ─────────────────────────────────────────────

router.get('/goals', async (req, res) => {
  try {
    const { rows } = await query(
      'SELECT id, data FROM goals WHERE user_id = $1 ORDER BY created_at DESC',
      [req.userId]
    )
    res.json(rows.map((r) => ({ id: r.id, ...r.data })))
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.post('/goals', async (req, res) => {
  try {
    const { id, ...data } = req.body
    await query(
      'INSERT INTO goals (id, user_id, data) VALUES ($1, $2, $3::jsonb)',
      [id, req.userId, JSON.stringify(data)]
    )
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.put('/goals/:id', async (req, res) => {
  try {
    const { id: _id, ...changes } = req.body
    await query(
      'UPDATE goals SET data = data || $1::jsonb WHERE id = $2 AND user_id = $3',
      [JSON.stringify(changes), req.params.id, req.userId]
    )
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.delete('/goals/:id', async (req, res) => {
  try {
    await query(
      'DELETE FROM goals WHERE id = $1 AND user_id = $2',
      [req.params.id, req.userId]
    )
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── Export ────────────────────────────────────────────

router.get('/export', async (req, res) => {
  try {
    const [entriesRes, goalsRes, settingsRes] = await Promise.all([
      query(
        'SELECT date, scores, spiritual_checks, journal, week_middah_focus, created_at, updated_at FROM entries WHERE user_id=$1 ORDER BY date',
        [req.userId]
      ),
      query('SELECT id, data FROM goals WHERE user_id=$1 ORDER BY created_at DESC', [req.userId]),
      query('SELECT data FROM settings WHERE user_id=$1', [req.userId]),
    ])
    res.json({
      entries: entriesRes.rows.map(toEntry),
      goals: goalsRes.rows.map((r) => ({ id: r.id, ...r.data })),
      settings: settingsRes.rows[0]?.data ?? {},
      exportedAt: new Date().toISOString(),
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── Import ────────────────────────────────────────────

router.post('/import', async (req, res) => {
  const client = await pool.connect()
  try {
    const { entries = [], goals = [], settings } = req.body
    await client.query('BEGIN')
    await client.query('DELETE FROM entries WHERE user_id = $1', [req.userId])
    await client.query('DELETE FROM goals WHERE user_id = $1', [req.userId])
    for (const entry of entries) {
      await client.query(
        `INSERT INTO entries (user_id, date, scores, spiritual_checks, journal, week_middah_focus)
         VALUES ($1, $2, $3::jsonb, $4::jsonb, $5, $6)
         ON CONFLICT (user_id, date) DO UPDATE
           SET scores=$3::jsonb, spiritual_checks=$4::jsonb, journal=$5, week_middah_focus=$6, updated_at=NOW()`,
        [req.userId, entry.date, JSON.stringify(entry.scores ?? {}), JSON.stringify(entry.spiritualChecks ?? {}), entry.journal ?? '', entry.weekMiddahFocus ?? null]
      )
    }
    for (const goal of goals) {
      const { id, ...data } = goal
      await client.query(
        'INSERT INTO goals (id, user_id, data) VALUES ($1, $2, $3::jsonb) ON CONFLICT (id) DO UPDATE SET data=$3::jsonb',
        [id, req.userId, JSON.stringify(data)]
      )
    }
    if (settings) {
      await client.query(
        `INSERT INTO settings (user_id, data) VALUES ($1, $2::jsonb)
         ON CONFLICT (user_id) DO UPDATE SET data=$2::jsonb`,
        [req.userId, JSON.stringify(settings)]
      )
    }
    await client.query('COMMIT')
    res.json({ ok: true })
  } catch (err) {
    await client.query('ROLLBACK')
    res.status(500).json({ message: err.message })
  } finally {
    client.release()
  }
})

// ── Reset ─────────────────────────────────────────────

router.delete('/data', async (req, res) => {
  try {
    await query('DELETE FROM entries WHERE user_id = $1', [req.userId])
    await query('DELETE FROM goals WHERE user_id = $1', [req.userId])
    await query('DELETE FROM settings WHERE user_id = $1', [req.userId])
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router

import express from 'express'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { initSchema } from './db.js'
import authRouter from './routes/auth.js'
import meRouter from './routes/me.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()

app.use(express.json({ limit: '10mb' }))

app.use('/api/auth', authRouter)
app.use('/api/me', meRouter)

// Serve the built React app for all non-API routes
const distPath = join(__dirname, '../dist')
app.use(express.static(distPath))
app.get('*', (_req, res) => {
  res.sendFile(join(distPath, 'index.html'))
})

const PORT = process.env.PORT ?? 3000

initSchema()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
  })
  .catch((err) => {
    console.error('Failed to initialize schema:', err)
    process.exit(1)
  })

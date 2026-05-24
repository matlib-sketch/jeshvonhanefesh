import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET ?? 'cheshbon-dev-secret-change-me'

export const signToken = (userId) =>
  jwt.sign({ userId }, SECRET, { expiresIn: '365d' })

export const requireAuth = (req, res, next) => {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No autenticado' })
  }
  try {
    const payload = jwt.verify(header.slice(7), SECRET)
    req.userId = payload.userId
    next()
  } catch {
    res.status(401).json({ message: 'Token inválido o expirado' })
  }
}

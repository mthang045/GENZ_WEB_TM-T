import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface JwtPayload {
  sub: string
  role?: string
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' })
  const token = auth.split(' ')[1]
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret') as JwtPayload
    // attach user id to request
    ;(req as any).userId = payload.sub
    ;(req as any).userRole = payload.role
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' })
  const token = auth.split(' ')[1]
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret') as JwtPayload
    if (payload.role !== 'admin') return res.status(403).json({ error: 'Forbidden' })
    // attach user id to request
    ;(req as any).userId = payload.sub
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

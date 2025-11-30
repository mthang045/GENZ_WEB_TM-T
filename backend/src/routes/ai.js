// Lấy lịch sử hội thoại của user
router.get('/chat/history', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const history = await ChatHistory.findOne({ userId });
    res.json({ messages: history?.messages || [] });
  } catch (err) {
    console.error('Lỗi lấy lịch sử chat:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

import express from 'express'
import { authMiddleware } from '../middleware/auth.js';
import ChatHistory from '../models/ChatHistory.js';

const router = express.Router()

// Simple in-memory rate limiter per IP (naive)
const RATE_LIMIT_WINDOW_MS = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX = 30 // max requests per window per IP
const rateMap = new Map()

function checkRate(ip) {
  const now = Date.now()
  const entry = rateMap.get(ip) || { count: 0, start: now }
  if (now - entry.start > RATE_LIMIT_WINDOW_MS) {
    entry.count = 1
    entry.start = now
    rateMap.set(ip, entry)
    return true
  }
  entry.count += 1
  rateMap.set(ip, entry)
  return entry.count <= RATE_LIMIT_MAX
}

// Yêu cầu đăng nhập mới được sử dụng chatbot
router.post('/chat', authMiddleware, async (req, res) => {
  try {
    const ip = req.ip || req.connection?.remoteAddress || 'unknown'
    if (!checkRate(ip)) {
      return res.status(429).json({ error: 'Too many requests' })
    }

    const { messages, model } = req.body || {}
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages array is required' })
    }

    const GEMINI_URL = process.env.GEMINI_API_URL
    const GEMINI_KEY = process.env.GEMINI_API_KEY
    const GEMINI_MODEL = model || process.env.GEMINI_MODEL || 'gemini-1.0'

    if (!GEMINI_URL || !GEMINI_KEY) {
      return res.status(500).json({ error: 'Gemini not configured on server' })
    }

    // Detect Google Generative Language endpoints and adapt payload/headers
    const isGoogleGenerative = GEMINI_URL.includes('generativelanguage.googleapis.com') || process.env.GEMINI_PROVIDER === 'google'

    let payload
    let headers = { 'Content-Type': 'application/json' }

    if (isGoogleGenerative) {
      // Convert messages to a single text payload. For multi-turn, you may
      // want to format system/user/assistant messages differently.
      const combined = messages.map(m => `${m.role}: ${m.content}`).join('\n')
      payload = {
        model: GEMINI_MODEL,
        contents: [
          {
            parts: [
              { text: combined }
            ]
          }
        ]
      }
      // Google generative API uses X-goog-api-key for API key auth (per your curl)
      headers['X-goog-api-key'] = GEMINI_KEY
    } else {
      payload = { model: GEMINI_MODEL, messages }
      headers['Authorization'] = `Bearer ${GEMINI_KEY}`
    }

    const resp = await fetch(GEMINI_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    })

    if (!resp.ok) {
      const text = await resp.text()
      console.error('Gemini proxy error', resp.status, text)
      return res.status(502).json({ error: 'Upstream AI error', details: text })
    }

    const data = await resp.json()

    // Try to extract assistant text from known shapes (including Google GLM)
    let assistant = null
    // Google: candidates -> content -> parts -> text
    if (data?.candidates && Array.isArray(data.candidates) && data.candidates.length > 0) {
      try {
        assistant = data.candidates
          .map(c => {
            if (c?.content?.parts && Array.isArray(c.content.parts)) {
              return c.content.parts.map(p => p.text || p).join('\n')
            }
            return JSON.stringify(c)
          })
          .join('\n---\n')
      } catch (e) {
        assistant = JSON.stringify(data.candidates)
      }
    } else if (data?.output && Array.isArray(data.output) && data.output[0]?.content) {
      assistant = data.output.map(o => o.content).join('\n')
    } else if (data?.choices?.[0]?.message?.content) {
      assistant = data.choices[0].message.content
    } else if (data?.reply) {
      assistant = data.reply
    } else if (typeof data === 'string') {
      assistant = data
    } else {
      assistant = JSON.stringify(data)
    }

    // Lưu lịch sử hội thoại vào MongoDB
    try {
      const userId = req.userId;
      if (userId) {
        // Lưu 2 message cuối: user và assistant
        const lastUserMsg = messages[messages.length - 1];
        const assistantMsg = { role: 'assistant', content: assistant };
        // Tìm hoặc tạo mới lịch sử
        await ChatHistory.findOneAndUpdate(
          { userId },
          {
            $push: {
              messages: {
                $each: [lastUserMsg, assistantMsg],
                $position: undefined
              }
            },
            $set: { updatedAt: new Date() }
          },
          { upsert: true, new: true }
        );
      }
    } catch (e) {
      console.error('Lỗi lưu lịch sử chat:', e);
    }
    return res.json({ assistant, raw: data })
  } catch (err) {
    console.error('AI proxy error', err)
    return res.status(500).json({ error: 'Internal server error', details: err?.message })
  }
})

export default router

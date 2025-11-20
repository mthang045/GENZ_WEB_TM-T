export async function sendAiChat(messages, model) {
  // messages: [{ role: 'user'|'system'|'assistant', content: '...' }, ...]
  const res = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, model })
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`AI proxy error ${res.status}: ${text}`)
  }
  const data = await res.json()
  // data.assistant is the textual reply; data.raw contains provider response
  return data
}

export default sendAiChat

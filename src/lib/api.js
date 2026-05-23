const API_BASE = import.meta.env.VITE_API_BASE || ''

async function parseResponse(response) {
  const data = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(data?.error || '请求失败')
  }
  return data
}

export async function fetchCheckins() {
  const response = await fetch(`${API_BASE}/api/checkins`)
  return parseResponse(response)
}

export async function createCheckin(entry) {
  const response = await fetch(`${API_BASE}/api/checkins`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(entry),
  })
  return parseResponse(response)
}


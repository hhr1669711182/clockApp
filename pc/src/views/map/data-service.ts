// 仅保留与 mapNew 相关可能使用的最小请求封装，可按需扩展
export interface RequestOptions {
  method?: 'GET' | 'POST'
  headers?: Record<string, string>
  timeout?: number
}

export async function request<T = any>(
  url: string,
  data?: Record<string, any>,
  options: RequestOptions = {}
) {
  const { method = 'GET', headers = {}, timeout = 60_000 } = options
  let finalUrl = url

  if (method === 'GET' && data) {
    const qs = new URLSearchParams()
    Object.entries(data).forEach(([k, v]) => qs.append(k, String(v)))
    finalUrl = `${url}${url.includes('?') ? '&' : '?'}${qs.toString()}`
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)

  try {
    const res = await fetch(finalUrl, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: method === 'GET' ? undefined : JSON.stringify(data || {}),
      signal: controller.signal
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
    return (await res.json()) as T
  } finally {
    clearTimeout(timer)
  }
}

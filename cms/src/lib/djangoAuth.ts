// Talks to the existing Django job board API as an admin service account.
// Payload never stores job/company/user/skill data itself — it always
// reads and writes through this token against the real Django database,
// so Django stays the single source of truth and the custom-built admin
// dashboard keeps working exactly as before.

const DJANGO_API_BASE_URL = process.env.DJANGO_API_BASE_URL || 'http://localhost:8000'
const DJANGO_ADMIN_EMAIL = process.env.DJANGO_ADMIN_EMAIL || ''
const DJANGO_ADMIN_PASSWORD = process.env.DJANGO_ADMIN_PASSWORD || ''

type CachedToken = {
  access: string
  refresh: string
  // epoch ms; SimpleJWT access tokens on this project are 15 minutes
  expiresAt: number
}

let cached: CachedToken | null = null

async function loginAsAdmin(): Promise<CachedToken> {
  if (!DJANGO_ADMIN_EMAIL || !DJANGO_ADMIN_PASSWORD) {
    throw new Error(
      'DJANGO_ADMIN_EMAIL / DJANGO_ADMIN_PASSWORD are not set — the CMS needs an admin ' +
        'service account on the job board to talk to the API.',
    )
  }

  const res = await fetch(`${DJANGO_API_BASE_URL}/api/v1/accounts/login/admin/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: DJANGO_ADMIN_EMAIL, password: DJANGO_ADMIN_PASSWORD }),
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new Error(`Django admin login failed (${res.status}): ${await res.text()}`)
  }

  const data = (await res.json()) as { access: string; refresh: string }
  return {
    access: data.access,
    refresh: data.refresh,
    // refresh a minute early to be safe
    expiresAt: Date.now() + 14 * 60 * 1000,
  }
}

async function refreshToken(refresh: string): Promise<CachedToken | null> {
  const res = await fetch(`${DJANGO_API_BASE_URL}/api/v1/accounts/token/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
    cache: 'no-store',
  })
  if (!res.ok) return null
  const data = (await res.json()) as { access: string }
  return { access: data.access, refresh, expiresAt: Date.now() + 14 * 60 * 1000 }
}

/** Returns a valid Django admin access token, logging in or refreshing as needed. */
export async function getDjangoAdminToken(): Promise<string> {
  if (cached && cached.expiresAt > Date.now()) {
    return cached.access
  }

  if (cached?.refresh) {
    const refreshed = await refreshToken(cached.refresh)
    if (refreshed) {
      cached = refreshed
      return cached.access
    }
  }

  cached = await loginAsAdmin()
  return cached.access
}

export function invalidateDjangoToken() {
  cached = null
}

export { DJANGO_API_BASE_URL }

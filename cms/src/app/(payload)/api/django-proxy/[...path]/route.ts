import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

import { DJANGO_API_BASE_URL, getDjangoAdminToken, invalidateDjangoToken } from '@/lib/djangoAuth'

// Every request here must come from someone logged into the Payload admin
// panel — this route is what actually reaches into the job board's data,
// so it must never be reachable by an anonymous caller.
async function requireCmsUser(req: NextRequest) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: req.headers })
  return user
}

async function forward(req: NextRequest, path: string[], body?: string) {
  const user = await requireCmsUser(req)
  if (!user) {
    return NextResponse.json({ detail: 'Not authenticated' }, { status: 401 })
  }

  const search = req.nextUrl.search || ''
  const targetPath = path.join('/')
  const url = `${DJANGO_API_BASE_URL}/api/v1/${targetPath}/${search}`

  const doFetch = async (token: string) =>
    fetch(url, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body,
      cache: 'no-store',
    })

  let token = await getDjangoAdminToken()
  let res = await doFetch(token)

  if (res.status === 401) {
    invalidateDjangoToken()
    token = await getDjangoAdminToken()
    res = await doFetch(token)
  }

  const text = await res.text()
  // A 204/205/304 response must not have a body — constructing a Response
  // with one throws ("Invalid response status code"). Django's DELETE
  // endpoints return 204 with an empty body, so drop the body for those.
  const noBodyStatuses = [204, 205, 304]
  if (noBodyStatuses.includes(res.status)) {
    return new NextResponse(null, { status: res.status })
  }
  return new NextResponse(text, {
    status: res.status,
    headers: { 'Content-Type': res.headers.get('Content-Type') || 'application/json' },
  })
}

type RouteParams = { params: Promise<{ path: string[] }> }

export async function GET(req: NextRequest, { params }: RouteParams) {
  const { path } = await params
  return forward(req, path)
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const { path } = await params
  return forward(req, path, await req.text())
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const { path } = await params
  return forward(req, path, await req.text())
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  const { path } = await params
  return forward(req, path, await req.text())
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const { path } = await params
  return forward(req, path)
}

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

// Temporary redirect from /api/auth/* to /api/identity/*
export async function GET(req: NextRequest) {
  const { pathname, search } = req.nextUrl
  const identityPath = pathname.replace('/api/auth', '/api/identity')
  const redirectUrl = new URL(`${identityPath}${search}`, req.url)

  // Return 302 temporary redirect
  return NextResponse.redirect(redirectUrl, 302)
}

export async function POST(req: NextRequest) {
  const { pathname, search } = req.nextUrl
  const identityPath = pathname.replace('/api/auth', '/api/identity')
  const redirectUrl = new URL(`${identityPath}${search}`, req.url)

  // Return 307 temporary redirect (preserves POST method)
  return NextResponse.redirect(redirectUrl, 307)
}

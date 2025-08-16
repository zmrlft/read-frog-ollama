import type { NextRequest } from 'next/server'
import process from 'node:process'
import { auth } from '@repo/auth'
import { toNextJsHandler } from 'better-auth/next-js'

const handler = toNextJsHandler(auth.handler)

// Log auth requests in development
const isDev = process.env.NODE_ENV === 'development'

async function loggedHandler(req: NextRequest, method: 'GET' | 'POST') {
  if (isDev) {
    // eslint-disable-next-line no-console
    console.log(`[auth-${method}]`, {
      url: req.url,
      method: req.method,
      headers: Object.fromEntries(req.headers.entries()),
      timestamp: new Date().toISOString(),
    })
  }

  const response = await handler[method](req)

  if (isDev) {
    // eslint-disable-next-line no-console
    console.log(`[auth-${method}-response]`, {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      timestamp: new Date().toISOString(),
    })
  }

  return response
}

export async function GET(req: NextRequest) {
  return loggedHandler(req, 'GET')
}

export async function POST(req: NextRequest) {
  return loggedHandler(req, 'POST')
}

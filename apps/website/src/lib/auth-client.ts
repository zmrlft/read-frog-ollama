import { AUTH_BASE_PATH } from '@repo/definitions'
import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
  basePath: AUTH_BASE_PATH,
})

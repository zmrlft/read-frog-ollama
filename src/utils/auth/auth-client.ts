import { createAuthClient } from 'better-auth/react'
import { WEBSITE_URL } from '../constants/url'

export const authClient = createAuthClient({
  baseURL: WEBSITE_URL,
})

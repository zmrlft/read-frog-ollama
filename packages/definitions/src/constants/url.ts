export const CHROME_EXTENSION_ORIGIN = 'chrome-extension://modkelfkcfjpgbfmnbnllalkiogfofhb'
export const EDGE_EXTENSION_ORIGIN = 'extension://cbcbomlgikfbdnoaohcjfledcoklcjbo'
export const TRUSTED_ORIGINS = [CHROME_EXTENSION_ORIGIN, EDGE_EXTENSION_ORIGIN]

export const WEBSITE_DEV_PORT = 8888
export const WEBSITE_DEV_URL = `http://localhost:${WEBSITE_DEV_PORT}`
export const WEBSITE_PROD_URL = 'https://www.readfrog.app'

// Domain constants for cookie monitoring and other domain-based operations
export const READFROG_DOMAIN = 'readfrog.app'
export const LOCALHOST_DOMAIN = 'localhost'
export const AUTH_DOMAINS = [READFROG_DOMAIN, LOCALHOST_DOMAIN] as const

// Auth cookie name patterns for better-auth
export const AUTH_COOKIE_PATTERNS = [
  'better-auth.session_token',
  'better-auth.session',
  'session',
  'auth-token',
] as const
export const AUTH_COOKIE_PREFIX = 'better-auth' as const

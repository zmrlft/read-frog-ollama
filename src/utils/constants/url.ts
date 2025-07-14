export const OFFICIAL_SITE_URL_PATTERNS = [
  'https://*.readfrog.app/*',
  'http://localhost/*',
]

export const WEBSITE_DEV_URL = 'http://localhost:8888'
export const WEBSITE_PROD_URL = 'https://www.readfrog.app'

export const WEBSITE_URL = import.meta.env.DEV ? WEBSITE_DEV_URL : WEBSITE_PROD_URL

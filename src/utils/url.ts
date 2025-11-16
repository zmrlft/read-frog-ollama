import { WEBSITE_DEV_URL, WEBSITE_PROD_URL } from '@read-frog/definitions'

export function getBaseUrl() {
  return import.meta.env.DEV ? WEBSITE_DEV_URL : WEBSITE_PROD_URL
}

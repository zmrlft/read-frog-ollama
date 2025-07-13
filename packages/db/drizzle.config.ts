import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  out: './migrations',
  schema: './src/schema/**/*.{ts,js}',
  dialect: 'postgresql',
  dbCredentials: {
    // TODO: typesafe way to get DATABASE_URL
    // eslint-disable-next-line node/prefer-global/process
    url: process.env.DATABASE_URL!,
  },
})

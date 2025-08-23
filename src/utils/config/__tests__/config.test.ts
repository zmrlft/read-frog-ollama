import { describe, expect, it } from 'vitest'
import { getConfigWithoutAPIKeys, hasAPIKey } from '../config'
import { LATEST_SCHEMA_VERSION } from '../migration'

describe('config utilities', () => {
  describe('getConfigWithoutAPIKeys', () => {
    for (let version = 2; version <= LATEST_SCHEMA_VERSION; version++) {
      const currentVersionStr = String(version).padStart(3, '0')

      it(`should remove api keys from config v${currentVersionStr}`, async () => {
        const currentConfigModule = await import(`./example/v${currentVersionStr}.ts`)
        const currentConfig = currentConfigModule.configExample

        const result = getConfigWithoutAPIKeys(currentConfig)
        expect(hasAPIKey(result)).toBe(false)
      })
    }
  })
})

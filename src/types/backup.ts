import type { Config } from './config/config'
import type { CONFIG_SCHEMA_VERSION_STORAGE_KEY, CONFIG_STORAGE_KEY } from '@/utils/constants/config'

export interface ConfigBackup {
  [CONFIG_SCHEMA_VERSION_STORAGE_KEY]: number
  [CONFIG_STORAGE_KEY]: Config
}

export interface ConfigBackupMetadata extends Record<string, unknown> {
  createdAt: number
  extensionVersion: string
}

export interface ConfigBackupWithMetadata extends ConfigBackup {
  metadata: ConfigBackupMetadata
  id: string
}

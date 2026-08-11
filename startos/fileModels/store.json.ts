import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

// Package-owned settings, kept outside the mounted PPQ_DATA_DIR subtree so the
// proxy neither sees them nor overwrites them.
const shape = z.object({
  debug: z.boolean().catch(false),
})

export const storeJson = FileHelper.json(
  { base: sdk.volumes.main, subpath: 'store.json' },
  shape,
)

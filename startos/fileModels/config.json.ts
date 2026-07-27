import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

// Package-owned settings file on the main volume. The upstream proxy is
// configured purely through environment variables; main.ts bridges these
// values into the daemon's env.
const shape = z.object({
  apiKey: z.string().optional().catch(undefined),
  debug: z.boolean().catch(false),
})

export const configJson = FileHelper.json(
  { base: sdk.volumes.main, subpath: 'config.json' },
  shape,
)

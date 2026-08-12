import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

// Upstream's own persistent config, at <PPQ_DATA_DIR>/config.json. The proxy
// loads the key from here at startup and rewrites the whole file when one is
// saved from the status page, so this shape must stay exactly upstream's and
// nothing else may live in it — see fileModels/store.json.ts.
const shape = z.object({
  apiKey: z.string().optional().catch(undefined),
})

export const configJson = FileHelper.json(
  { base: sdk.volumes.main, subpath: 'proxy/config.json' },
  shape,
)

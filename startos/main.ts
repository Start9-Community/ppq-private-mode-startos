import { i18n } from './i18n'
import { sdk } from './sdk'
import { manifest } from './manifest'
import { apiPort, dataDir } from './utils'
import { configureApiKey } from './actions/configureApiKey'
import { configJson } from './fileModels/config.json'
import { storeJson } from './fileModels/store.json'

export const main = sdk.setupMain(async ({ effects }) => {
  console.info(i18n('Starting PPQ Private Mode!'))

  // The proxy reads config.json once at startup, so watching it is what makes a
  // key saved by the Configure PPQ API Key action take effect: the write
  // restarts the daemon, which reloads the file. PPQ_API_KEY is left unset so
  // the proxy's own key store is the only thing that owns the key.
  const apiKey = await configJson.read((c) => c.apiKey).const(effects)
  const debug = await storeJson.read((s) => s.debug).const(effects)

  // Running the action clears its own task, but a key saved on the Status Page
  // never touches the action — so clear it here, on the restart that same save
  // triggers. Otherwise StartOS keeps asking for a key the user already set.
  if (apiKey) {
    await sdk.action.clearTask(effects, `${manifest.id}:${configureApiKey.id}`)
  }

  const subcontainer = sdk.SubContainer.of(
    effects,
    { imageId: 'proxy' },
    sdk.Mounts.of().mountVolume({
      volumeId: 'main',
      subpath: 'proxy',
      mountpoint: dataDir,
      readonly: false,
    }),
    'proxy-sub',
  )

  return sdk.Daemons.of(effects)
    .addOneshot('chown', {
      subcontainer,
      exec: {
        command: ['chown', '-R', 'node:node', dataDir],
        user: 'root',
      },
      requires: [],
    })
    .addDaemon('proxy', {
      subcontainer,
      exec: {
        command: ['node', '/app/dist/bin/server.js'],
        env: {
          PPQ_DATA_DIR: dataDir,
          HOST: '0.0.0.0',
          PORT: apiPort.toString(),
          DEBUG: debug ? 'true' : 'false',
        },
      },
      // The proxy only binds its port after remote attestation of the enclave
      // succeeds, so a listening port means the encrypted channel is verified
      // and ready.
      ready: {
        display: i18n('Encrypted Proxy'),
        fn: () =>
          sdk.healthCheck.checkPortListening(effects, apiPort, {
            successMessage: i18n(
              'The proxy is ready — enclave attestation verified',
            ),
            errorMessage: i18n(
              'The proxy is not ready (enclave attestation pending)',
            ),
          }),
      },
      requires: ['chown'],
    })
})

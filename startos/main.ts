import { i18n } from './i18n'
import { sdk } from './sdk'
import { apiPort } from './utils'
import { configJson } from './fileModels/config.json'

export const main = sdk.setupMain(async ({ effects }) => {
  console.info(i18n('Starting PPQ Private Mode!'))

  // Read reactively so the daemon restarts when the user changes settings.
  const apiKey = await configJson.read((c) => c.apiKey).const(effects)
  const debug = await configJson.read((c) => c.debug).const(effects)

  return sdk.Daemons.of(effects).addDaemon('proxy', {
    subcontainer: sdk.SubContainer.of(
      effects,
      { imageId: 'proxy' },
      sdk.Mounts.of().mountVolume({
        volumeId: 'main',
        subpath: null,
        mountpoint: '/data',
        readonly: false,
      }),
      'proxy-sub',
    ),
    exec: {
      command: ['node', '/app/dist/bin/server.js'],
      env: {
        PPQ_API_KEY: apiKey ?? '',
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
          successMessage: i18n('The proxy is ready — enclave attestation verified'),
          errorMessage: i18n('The proxy is not ready (enclave attestation pending)'),
        }),
    },
    requires: [],
  })
})

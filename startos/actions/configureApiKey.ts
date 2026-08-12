import { sdk } from '../sdk'
import { configJson } from '../fileModels/config.json'
import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'

const { InputSpec, Value } = sdk

const inputSpec = InputSpec.of({
  apiKey: Value.text({
    name: i18n('PPQ.AI API Key'),
    description: i18n(
      'Your API key from ppq.ai (Settings → API Keys). Leave blank to keep the key already saved, or to set one later from the Status Page.',
    ),
    required: false,
    default: null,
    masked: true,
    placeholder: 'sk-...',
    // Upstream's own shape check, applied here too — the Status Page rejects a
    // malformed key outright, but a key written straight to config.json would
    // only surface as a 401 on the first request.
    patterns: [
      {
        regex: '^sk-[A-Za-z0-9]{16,64}$',
        description: i18n('A PPQ.AI key starts with "sk-".'),
      },
    ],
  }),
  debug: Value.toggle({
    name: i18n('Verbose Logging'),
    description: i18n(
      'Log every request the proxy handles. Useful for troubleshooting.',
    ),
    default: false,
  }),
})

export const configureApiKey = sdk.Action.withInput(
  'configure-api-key',

  async ({ effects }) => ({
    name: i18n('Configure PPQ API Key'),
    description: i18n(
      'Set the PPQ.AI API key the proxy uses to authenticate. Requests are billed to this key.',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  inputSpec,

  // Prefill: the API key is never echoed back into the form.
  async ({ effects }) => ({
    debug: (await storeJson.read((s) => s.debug).once()) ?? false,
  }),

  async ({ effects, input }) => {
    await storeJson.merge(effects, { debug: input.debug })

    const apiKey = (input.apiKey ?? '').trim()
    if (apiKey) await configJson.merge(effects, { apiKey })
  },
)

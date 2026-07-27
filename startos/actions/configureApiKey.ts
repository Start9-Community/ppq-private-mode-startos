import { sdk } from '../sdk'
import { configJson } from '../fileModels/config.json'
import { i18n } from '../i18n'

const { InputSpec, Value } = sdk

const inputSpec = InputSpec.of({
  apiKey: Value.text({
    name: i18n('PPQ.AI API Key'),
    description: i18n(
      'Your API key from ppq.ai (Settings → API Keys). Leave blank to keep the key already saved.',
    ),
    required: false,
    default: null,
    masked: true,
    placeholder: 'sk-...',
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
  async ({ effects }) => {
    const debug = await configJson
      .read((c) => c.debug)
      .once()
      .catch(() => false)
    return { debug: debug ?? false }
  },

  async ({ effects, input }) => {
    const existingKey = await configJson
      .read((c) => c.apiKey)
      .once()
      .catch(() => undefined)

    const apiKey = (input.apiKey ?? '').trim() || existingKey
    if (!apiKey) {
      throw new Error(
        i18n('An API key is required. Create one at ppq.ai under Settings → API Keys.'),
      )
    }

    await configJson.merge(effects, { apiKey, debug: input.debug })
  },
)

export const DEFAULT_LANG = 'en_US'

const dict = {
  // main.ts
  'Starting PPQ Private Mode!': 0,
  'Encrypted Proxy': 1,
  'The proxy is ready — enclave attestation verified': 2,
  'The proxy is not ready (enclave attestation pending)': 3,
  // interfaces.ts
  'OpenAI-Compatible API': 4,
  'Point any OpenAI or Anthropic SDK client at this URL to use PPQ private (TEE) models with end-to-end encryption': 5,
  // actions/configureApiKey.ts
  'PPQ.AI API Key': 6,
  'Your API key from ppq.ai (Settings → API Keys). Leave blank to keep the key already saved.': 7,
  'Verbose Logging': 8,
  'Log every request the proxy handles. Useful for troubleshooting.': 9,
  'Configure PPQ API Key': 10,
  'Set the PPQ.AI API key the proxy uses to authenticate. Requests are billed to this key.': 11,
  'An API key is required. Create one at ppq.ai under Settings → API Keys.': 12,
  // init/taskConfigureApiKey.ts
  'Add your PPQ.AI API key to start the proxy': 13,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict

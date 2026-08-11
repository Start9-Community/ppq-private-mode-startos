export const DEFAULT_LANG = 'en_US'

const dict = {
  // main.ts
  'Starting PPQ Private Mode!': 0,
  'Encrypted Proxy': 1,
  'The proxy is ready — enclave attestation verified': 2,
  'The proxy is not ready (enclave attestation pending)': 3,
  // interfaces.ts
  'Status Page': 4,
  'Enclave attestation state, the available private models, and client setup snippets': 5,
  'OpenAI-Compatible API': 6,
  'Point any OpenAI or Anthropic SDK client at this URL to use PPQ private (TEE) models with end-to-end encryption': 7,
  // actions/configureApiKey.ts
  'PPQ.AI API Key': 8,
  'Your API key from ppq.ai (Settings → API Keys). Leave blank to keep the key already saved.': 9,
  'Verbose Logging': 10,
  'Log every request the proxy handles. Useful for troubleshooting.': 11,
  'Configure PPQ API Key': 12,
  'Set the PPQ.AI API key the proxy uses to authenticate. Requests are billed to this key.': 13,
  'An API key is required. Create one at ppq.ai under Settings → API Keys.': 14,
  // init/taskConfigureApiKey.ts
  'Add your PPQ.AI API key to start the proxy': 15,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict

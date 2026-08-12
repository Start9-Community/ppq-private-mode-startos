import { sdk } from './sdk'
import { apiPort } from './utils'
import { i18n } from './i18n'

export const setInterfaces = sdk.setupInterfaces(async ({ effects }) => {
  const multi = sdk.MultiHost.of(effects, 'main')
  const origin = await multi.bindPort(apiPort, {
    protocol: 'http',
  })
  const ui = sdk.createInterface(effects, {
    name: i18n('Status Page'),
    id: 'ui',
    description: i18n(
      'Enclave attestation state, the available private models, and client setup snippets',
    ),
    type: 'ui',
    masked: false,
    schemeOverride: null,
    username: null,
    path: '',
    query: {},
  })
  const api = sdk.createInterface(effects, {
    name: i18n('OpenAI-Compatible API'),
    id: 'api',
    description: i18n(
      'Point any OpenAI or Anthropic SDK client at this URL to use PPQ private (TEE) models with end-to-end encryption',
    ),
    type: 'api',
    masked: false,
    schemeOverride: null,
    username: null,
    path: '',
    query: {},
  })

  const receipt = await origin.export([ui, api])

  return [receipt]
})

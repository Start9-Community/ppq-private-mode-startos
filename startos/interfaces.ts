import { sdk } from './sdk'
import { apiPort } from './utils'
import { i18n } from './i18n'

// Host id (the sdk.MultiHost.of group) — distinct from the interface id exported on it.
export const apiHostId = 'api-multi'
export const apiInterfaceId = 'api'

export const setInterfaces = sdk.setupInterfaces(async ({ effects }) => {
  const apiMulti = sdk.MultiHost.of(effects, apiHostId)
  const apiMultiOrigin = await apiMulti.bindPort(apiPort, {
    protocol: 'http',
  })
  const api = sdk.createInterface(effects, {
    name: i18n('OpenAI-Compatible API'),
    id: apiInterfaceId,
    description: i18n(
      'Point any OpenAI or Anthropic SDK client at this URL to use PPQ private (TEE) models with end-to-end encryption',
    ),
    type: 'api',
    masked: true,
    schemeOverride: null,
    username: null,
    path: '',
    query: {},
  })

  const apiReceipt = await apiMultiOrigin.export([api])

  return [apiReceipt]
})

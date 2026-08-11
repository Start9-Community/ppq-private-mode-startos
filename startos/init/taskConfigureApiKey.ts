import { sdk } from '../sdk'
import { configJson } from '../fileModels/config.json'
import { configureApiKey } from '../actions/configureApiKey'
import { i18n } from '../i18n'

// The proxy cannot start without a PPQ.AI API key, so a critical task blocks
// startup until the user provides one.
export const taskConfigureApiKey = sdk.setupOnInit(async (effects) => {
  const apiKey = await configJson.read((c) => c.apiKey).once()

  if (!apiKey) {
    await sdk.action.createOwnTask(effects, configureApiKey, 'critical', {
      reason: i18n('Add your PPQ.AI API key to start the proxy'),
    })
  }
})

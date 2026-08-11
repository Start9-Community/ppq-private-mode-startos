import { sdk } from '../sdk'
import { configJson } from '../fileModels/config.json'
import { configureApiKey } from '../actions/configureApiKey'
import { i18n } from '../i18n'

// The proxy starts and serves its Status Page without a key, answering 401 to
// inference requests until one is set. So this prompt is important rather than
// critical: a critical task suspends every other control, which would leave the
// user unable to start the service and reach the Status Page's own key form.
export const taskConfigureApiKey = sdk.setupOnInit(async (effects) => {
  const apiKey = await configJson.read((c) => c.apiKey).once()

  if (!apiKey) {
    await sdk.action.createOwnTask(effects, configureApiKey, 'important', {
      reason: i18n(
        'Add your PPQ.AI API key here, or start the service and save one on the Status Page',
      ),
    })
  }
})

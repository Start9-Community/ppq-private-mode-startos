import { sdk } from '../sdk'
import { configureApiKey } from './configureApiKey'

export const actions = sdk.Actions.of().addAction(configureApiKey)

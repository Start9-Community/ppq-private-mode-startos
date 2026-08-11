import { setupManifest } from '@start9labs/start-sdk'
import { long, short } from './i18n'

export const manifest = setupManifest({
  id: 'ppq-private-mode',
  title: 'PPQ Private Mode',
  license: 'MIT',
  packageRepo: 'https://github.com/Start9-Community/ppq-private-mode-startos',
  upstreamRepo: 'https://github.com/PayPerQ/ppq-private-mode-proxy',
  marketingUrl: 'https://ppq.ai',
  donationUrl: null,
  description: { short, long },
  volumes: ['main'],
  images: {
    // Built from the upstream Dockerfile (git submodule ./ppq-private-mode-proxy).
    proxy: {
      source: {
        dockerBuild: {
          workdir: './ppq-private-mode-proxy',
        },
      },
      arch: ['x86_64', 'aarch64'],
    },
  },
  alerts: {
    install: null,
    update: null,
    uninstall: null,
    restore: null,
    start: null,
    stop: null,
  },
  dependencies: {},
})

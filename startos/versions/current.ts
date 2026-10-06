import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  // Tracks upstream ppq-private-mode-proxy (package.json version).
  version: '0.4.1:1',
  releaseNotes: {
    en_US: '- The Verbose Logging setting explains what it logs.',
    es_ES: '- El ajuste Registro detallado explica qué registra.',
    de_DE:
      '- Die Einstellung Ausführliche Protokollierung erklärt, was sie protokolliert.',
    pl_PL: '- Ustawienie Szczegółowe logowanie wyjaśnia, co jest rejestrowane.',
    fr_FR:
      "- Le réglage Journalisation détaillée explique ce qu'il journalise.",
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})

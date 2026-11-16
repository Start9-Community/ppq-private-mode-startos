import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  // Tracks upstream ppq-private-mode-proxy (package.json version).
  version: '0.8.0:0',
  releaseNotes: {
    en_US:
      'Updates the proxy to 0.8.0. The list of private models is now read from PPQ.AI at startup, so models PPQ.AI adds or retires show up without a package update. Current models include private/kimi-k3-1-pro and private/glm-5-3, which replace the retired private/kimi-k3 and private/glm-5-2. Also adds DeepSeek V4.1 Flash, PDF and document input for private models, and fixes requests from clients that send an empty tool list.',
    es_ES:
      'Actualiza el proxy a 0.8.0. La lista de modelos privados ahora se obtiene de PPQ.AI al iniciar, por lo que los modelos que PPQ.AI añade o retira se reflejan sin actualizar el paquete. Los modelos actuales incluyen private/kimi-k3-1-pro y private/glm-5-3, que sustituyen a los retirados private/kimi-k3 y private/glm-5-2. También añade DeepSeek V4.1 Flash, entrada de PDF y documentos para modelos privados, y corrige las solicitudes de clientes que envían una lista de herramientas vacía.',
    de_DE:
      'Aktualisiert den Proxy auf 0.8.0. Die Liste der privaten Modelle wird jetzt beim Start von PPQ.AI geladen, sodass Modelle, die PPQ.AI hinzufügt oder einstellt, ohne Paket-Update übernommen werden. Zu den aktuellen Modellen gehören private/kimi-k3-1-pro und private/glm-5-3, die die eingestellten private/kimi-k3 und private/glm-5-2 ersetzen. Außerdem kommen DeepSeek V4.1 Flash sowie PDF- und Dokumenteingabe für private Modelle hinzu, und Anfragen von Clients mit leerer Werkzeugliste funktionieren wieder.',
    pl_PL:
      'Aktualizuje proxy do wersji 0.8.0. Lista modeli prywatnych jest teraz pobierana z PPQ.AI przy starcie, więc modele dodawane lub wycofywane przez PPQ.AI są uwzględniane bez aktualizacji pakietu. Aktualne modele obejmują private/kimi-k3-1-pro i private/glm-5-3, które zastępują wycofane private/kimi-k3 i private/glm-5-2. Dodaje też DeepSeek V4.1 Flash, obsługę plików PDF i dokumentów dla modeli prywatnych oraz naprawia żądania klientów wysyłających pustą listę narzędzi.',
    fr_FR:
      "Met à jour le proxy vers 0.8.0. La liste des modèles privés est désormais lue depuis PPQ.AI au démarrage : les modèles ajoutés ou retirés par PPQ.AI sont pris en compte sans mise à jour du paquet. Les modèles actuels incluent private/kimi-k3-1-pro et private/glm-5-3, qui remplacent les modèles retirés private/kimi-k3 et private/glm-5-2. Ajoute aussi DeepSeek V4.1 Flash, la prise en charge des PDF et documents pour les modèles privés, et corrige les requêtes des clients qui envoient une liste d'outils vide.",
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})

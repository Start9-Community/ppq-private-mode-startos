# PPQ Private Mode

## Documentation

- [Upstream proxy documentation](https://github.com/PayPerQ/ppq-private-mode-proxy) — endpoints, client examples, and how the encryption works
- [PPQ.AI API docs](https://ppq.ai/api-docs) — creating an API key and funding your account

## What you get on StartOS

A local endpoint your AI clients talk to instead of talking to a model provider
directly. Everything sent through it is encrypted on your server and only
decrypted inside an attested hardware enclave, so neither PPQ.AI nor the model
host can read your queries.

Two interfaces share one address:

- **Status Page** — a web page showing whether enclave attestation succeeded,
  which private models are available, and how to point a client at the proxy.
- **OpenAI-Compatible API** — the same address, ready to copy into a client.

The only thing the service stores is your PPQ.AI API key and the logging
setting.

## Getting set up

1. You will be prompted to run **Configure PPQ API Key**. Paste an API key from
   [ppq.ai](https://ppq.ai) — create one under **Settings → API Keys** and fund
   the account, since usage is billed per query to this key.
2. The service starts and performs a cryptographic attestation of the remote
   enclave. The health check reports ready once attestation is verified —
   usually within a few seconds.
3. Open the **Status Page** to confirm attestation succeeded, or copy the
   **OpenAI-Compatible API** address to point a client at it.

## Using PPQ Private Mode

### Connecting a client

Point any OpenAI-compatible client at the API address:

```
POST <api-address>/v1/chat/completions
{"model": "private/glm-5-2", "messages": [{"role": "user", "content": "Hello"}]}
```

Anthropic-SDK clients (including Claude Code) can use the native endpoint at
`<api-address>/v1/messages`. For Claude Code, set:

```
export ANTHROPIC_BASE_URL="<api-address>"
export ANTHROPIC_MODEL="private/glm-5-2"
```

`GET <api-address>/v1/models` lists the available private models, and the
Status Page shows the same list.

Requests are billed to your saved API key by default. To bill a different
PPQ.AI key per request, pass it as an `Authorization: Bearer` header.

### Actions

Run **Configure PPQ API Key** again whenever you want to replace the key or
turn verbose logging on or off. Leaving the key field blank keeps the key you
already saved.

## Limitations

The Status Page has its own "save API key" form upstream; it is inactive here,
because the key is managed by the **Configure PPQ API Key** action instead.

Backups of this service include your saved API key, and restoring a backup
restores it — keep that in mind when handling backup drives.

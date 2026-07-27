# PPQ Private Mode

## Documentation

- [Upstream proxy documentation](https://github.com/PayPerQ/ppq-private-mode-proxy) — endpoints, client examples, and how the encryption works
- [PPQ.AI API docs](https://ppq.ai/api-docs) — creating an API key and funding your account

## Getting set up

1. When the service is installed, you will be prompted to run **Configure PPQ
   API Key**. Paste an API key from [ppq.ai](https://ppq.ai) (create one under
   **Settings → API Keys** and fund the account — usage is billed per query to
   this key).
2. The service starts and performs a cryptographic attestation of the remote
   enclave. The health check reports ready once attestation is verified —
   usually within a few seconds.
3. Copy the **OpenAI-Compatible API** address from the service's interface
   panel. That is the URL you point your AI clients at.

## Using the proxy

Point any OpenAI-compatible client at the interface address:

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

`GET <api-address>/v1/models` lists the available private models. Every
request is encrypted on your server before it leaves and is only decrypted
inside the attested enclave — neither PPQ.AI nor the model host can read your
queries.

Requests are billed to your saved API key by default. To bill a different
PPQ.AI key per request, pass it as an `Authorization: Bearer` header.

If you need to change the key or turn on verbose logging later, run
**Configure PPQ API Key** again from the service's Actions.

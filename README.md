<p align="center">
  <img src="icon.svg" alt="PPQ Private Mode Logo" width="21%" />
</p>

# PPQ Private Mode on StartOS

> **Upstream docs:** <https://github.com/PayPerQ/ppq-private-mode-proxy>
>
> Everything not listed in this document should behave the same as the upstream
> PPQ Private Mode proxy. If a feature, setting, or behavior is not mentioned
> here, the upstream documentation is accurate and fully applicable.

End-to-end encrypted proxy for [PPQ.AI](https://ppq.ai) private (TEE) AI models.
Requests are encrypted on your server and only decrypted inside a
hardware-secured enclave whose code fingerprint is cryptographically attested
before any data is sent. Upstream: [PayPerQ/ppq-private-mode-proxy](https://github.com/PayPerQ/ppq-private-mode-proxy).

---

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Configuration Management](#configuration-management)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Actions (StartOS UI)](#actions-startos-ui)
- [Backups and Restore](#backups-and-restore)
- [Health Checks](#health-checks)
- [Dependencies](#dependencies)
- [Limitations and Differences](#limitations-and-differences)
- [What Is Unchanged from Upstream](#what-is-unchanged-from-upstream)
- [Contributing](#contributing)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

The image is built from the upstream repository's own `Dockerfile` via the
`ppq-private-mode-proxy` git submodule (multi-stage `node:22-alpine` build,
runs as the unprivileged `node` user). No entrypoint modifications; the daemon
runs `node /app/dist/bin/server.js` directly.

Architectures: `x86_64`, `aarch64`.

## Volume and Data Layout

One volume, `main`, mounted at `/data`. The proxy itself is stateless; the
volume holds only `config.json` (the StartOS-managed settings file containing
the API key and logging preference), written by the SDK on the host side.

## Installation and First-Run Flow

On install, a critical task prompts for a PPQ.AI API key. The service cannot
start until the key is provided (upstream exits immediately without
`PPQ_API_KEY`). There is no other setup.

## Configuration Management

All upstream configuration is via environment variables; StartOS manages them
from `config.json`:

- `PPQ_API_KEY` — set from the **Configure PPQ API Key** action
- `DEBUG` — set from the same action's Verbose Logging toggle
- `HOST` — fixed to `0.0.0.0` (container binding)
- `PORT` — fixed to `8787`
- `PPQ_API_BASE` — not set (upstream default `https://api.ppq.ai`)

Changing settings restarts the daemon (values are read reactively).

## Network Access and Interfaces

One interface, `api` (port 8787, HTTP): the upstream OpenAI-compatible API,
shown as a copyable connection string. Endpoints: `GET /health`,
`GET /v1/models`, `POST /v1/chat/completions` (OpenAI format),
`POST /v1/messages` (Anthropic format). Availability on LAN/Tor is decided by
the user from the interface panel.

## Actions (StartOS UI)

- **Configure PPQ API Key** (`configure-api-key`) — sets the PPQ.AI API key
  (masked, never echoed back) and the Verbose Logging toggle. Available at any
  service status. Also the target of the critical first-run task.

## Backups and Restore

The `main` volume (i.e. `config.json`) is backed up. Restore brings back the
saved API key and settings; no other state exists.

## Health Checks

One daemon readiness check on port 8787. The upstream proxy only binds its
port after remote attestation of the enclave succeeds, so "listening" implies
the encrypted channel is verified. Until attestation completes the check
reports the proxy as not ready.

## Dependencies

None.

## Limitations and Differences

1. This service is a client-side encryption proxy, not a self-hosted model
   server: inference runs remotely in PPQ.AI's attested TEE enclaves, and a
   funded [PPQ.AI](https://ppq.ai) API key is required (pay-per-query).
2. The upstream OpenClaw-plugin mode is not packaged; only the standalone
   proxy runs on StartOS.
3. The bind address and port are fixed (`0.0.0.0:8787` inside the container);
   upstream's `HOST`/`PORT`/`PPQ_API_BASE` variables are not user-configurable.

## What Is Unchanged from Upstream

- All API endpoints, request/response formats, and streaming behavior
- The encryption and attestation flow (EHBP transport via the `tinfoil` client)
- Model catalog and per-request `Authorization: Bearer` key override

## Contributing

See [AGENTS.md](AGENTS.md).

---

## Quick Reference for AI Consumers

```yaml
package_id: ppq-private-mode
architectures: [x86_64, aarch64]
volumes:
  main: /data
ports:
  api: 8787
dependencies: none
startos_managed_env_vars:
  - PPQ_API_KEY
  - HOST
  - PORT
  - DEBUG
actions:
  - configure-api-key
```

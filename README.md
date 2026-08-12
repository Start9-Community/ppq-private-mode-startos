<p align="center">
  <img src="icon.png" alt="PPQ Private Mode Logo" width="21%" />
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

One volume, `main`, split so the container sees only what it owns:

| Host path           | Container path      | Written by                                       |
| ------------------- | ------------------- | ------------------------------------------------ |
| `proxy/config.json` | `/data/config.json` | the proxy (Status Page) **and** the SDK (action) |
| `store.json`        | not mounted         | the SDK only                                     |

`proxy/` is mounted at `/data` as the proxy's `PPQ_DATA_DIR`, and `config.json`
inside it is upstream's own file — the proxy rewrites it wholesale when a key is
saved from the Status Page, so nothing of ours may live there. The Verbose
Logging setting therefore lives in `store.json`, outside the mount.

A `chown` oneshot hands `/data` to the image's unprivileged `node` user before
the daemon starts, so the Status Page can write to it.

## Installation and First-Run Flow

On install, an **important** (non-blocking) task prompts for a PPQ.AI API key.
There are two ways to satisfy it, and neither is required before starting:

1. Run the **Configure PPQ API Key** action.
2. Start the service and save the key on the **Status Page**.

The proxy runs without a key — it completes attestation, serves the Status Page,
and answers `401` to inference requests until one is set. The task is
deliberately not critical: a critical task suspends every other control, which
would leave the user unable to start the service and reach the Status Page's own
key form.

## Configuration Management

The API key is the proxy's to own. StartOS does **not** pass `PPQ_API_KEY`;
instead it points `PPQ_DATA_DIR` at the mounted volume so upstream's key store
is the single source of truth, written by either the action or the Status Page
and read from the same file by both.

- `PPQ_DATA_DIR` — `/data`, enabling persistence and the Status Page's key form
- `DEBUG` — set from the action's Verbose Logging toggle, via `store.json`
- `HOST` — fixed to `0.0.0.0` (container binding)
- `PORT` — fixed to 8787
- `PPQ_API_BASE` — not set (upstream default `https://api.ppq.ai`)

The proxy loads `config.json` once at startup, so `main.ts` watches the file:
writing a key restarts the daemon, which reloads it. A key saved on the Status
Page takes effect immediately in the running proxy and then triggers that same
restart — brief, and it converges on the value just saved either way.

## Network Access and Interfaces

Two interfaces on one HTTP host, port 8787, both served by the proxy:

- **Status Page** (`ui`) — upstream's server-rendered page at `/`: attestation
  state (enclave host and code fingerprint), API-key status, the private model
  list, and client setup snippets.
- **OpenAI-Compatible API** (`api`) — the same origin, shown as a copyable
  connection string for AI clients. Endpoints: `GET /health`,
  `GET /v1/models`, `POST /v1/chat/completions` (OpenAI format),
  `POST /v1/messages` (Anthropic format).

Availability on LAN/Tor is decided by the user from the interface panel.

**No endpoint is authenticated.** Upstream ships no auth on any route, so
whoever can reach the port can spend the user's PPQ.AI balance via
`/v1/chat/completions`, and — because this package sets `PPQ_DATA_DIR` — can
also replace the stored key via `POST /setup/api-key`
([upstream #23](https://github.com/PayPerQ/ppq-private-mode-proxy/issues/23)).
The billing exposure predates that endpoint and is inherent to the proxy; the
key-replacement one is enabled by our `PPQ_DATA_DIR` choice, and closes when
upstream's patch lands and this package bumps to it. `instructions.md` warns
the user to expose the interface accordingly.

## Actions (StartOS UI)

- **Configure PPQ API Key** (`configure-api-key`) — visible and enabled at any
  service status. Inputs: the PPQ.AI API key (masked, validated against
  upstream's `^sk-[A-Za-z0-9]{16,64}$` shape; left blank it keeps the key
  already saved and is never echoed back into the form) and the Verbose Logging
  toggle. No result output. Also the target of the first-run task.

## Backups and Restore

The `main` volume (i.e. `config.json`) is backed up. Restore brings back the
saved API key and settings; no other state exists. Note that backups therefore
contain the saved PPQ.AI API key (StartOS backups are encrypted with the
user's backup password).

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
2. Saving a key on the Status Page restarts the daemon a few seconds later.
   The proxy applies the key immediately; the restart is StartOS reacting to
   the same file write, and is what makes the **Configure PPQ API Key** action
   work at all (upstream reads `config.json` only at startup).
3. The upstream OpenClaw-plugin mode is not packaged; only the standalone
   proxy runs on StartOS.
4. The bind address and port are fixed inside the container; upstream's
   `HOST`/`PORT`/`PPQ_API_BASE` variables are not user-configurable.

## What Is Unchanged from Upstream

- All API endpoints, request/response formats, and streaming behavior
- The encryption and attestation flow (EHBP transport via the `tinfoil` client)
- Model catalog and per-request `Authorization: Bearer` key override
- The status page rendered at `/`, its API-key form included

## Contributing

See [AGENTS.md](AGENTS.md).

---

## Quick Reference for AI Consumers

```yaml
package_id: ppq-private-mode
architectures: [x86_64, aarch64]
volumes:
  main: /data # subpath `proxy/` only; `store.json` stays host-side
ports:
  main: 8787 # one host serving both interfaces
interfaces:
  - ui
  - api
dependencies: none
startos_managed_env_vars:
  - PPQ_DATA_DIR
  - HOST
  - PORT
  - DEBUG
actions:
  - configure-api-key
```

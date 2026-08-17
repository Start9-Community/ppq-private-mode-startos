<p align="center">
  <img src="icon.png" alt="PPQ Private Mode Logo" width="21%">
</p>

# PPQ Private Mode on StartOS

> Everything not listed in this document should behave the same as upstream
> PPQ Private Mode. If a feature, setting, or behavior is not mentioned here,
> the upstream documentation is accurate and fully applicable — see the
> Documentation section of `instructions.md` for links.

[PPQ Private Mode](https://github.com/PayPerQ/ppq-private-mode-proxy) is a local proxy that encrypts AI requests on your server and only lets them be decrypted inside an attested hardware enclave, so neither PPQ.AI nor the model host can read them. This package runs that proxy and points any OpenAI- or Anthropic-compatible client at it.

- **Upstream repo:** <https://github.com/PayPerQ/ppq-private-mode-proxy>
- **Wrapper repo:** <https://github.com/Start9-Community/ppq-private-mode-startos>

---

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [File Models](#file-models)
- [Dependencies](#dependencies)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Actions](#actions)
- [Tasks](#tasks)
- [Health Checks](#health-checks)
- [Backups and Restore](#backups-and-restore)
- [Limitations and Differences](#limitations-and-differences)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

One image, built from upstream's own Dockerfile.

| Property      | Value                                      |
| ------------- | ------------------------------------------ |
| Image         | Built from the vendored upstream submodule |
| Architectures | x86_64, aarch64                            |
| Command       | The proxy's server entrypoint              |

| Subcontainer | Purpose                                  |
| ------------ | ---------------------------------------- |
| `proxy-sub`  | The only daemon — the one to `attach` to |

**Upstream is vendored as a git submodule and built here**, rather than pulled as a published image — so the shipped bits correspond to a specific upstream commit.

One oneshot runs first, giving the data directory to the unprivileged user the image runs as.

## Volume and Data Layout

One volume, with a deliberate split down the middle.

| Volume | Subpath | Mount Point | Purpose                       |
| ------ | ------- | ----------- | ----------------------------- |
| `main` | `proxy` | `/data`     | Upstream's own data directory |

| Path                | Written by                | Holds                      |
| ------------------- | ------------------------- | -------------------------- |
| `proxy/config.json` | The proxy, and the action | The PPQ.AI API key         |
| `store.json`        | The action                | The package's own settings |

**Only the `proxy` subpath is mounted into the container.** The package's own settings live at the volume root, outside what the proxy can see — so the proxy neither reads them nor overwrites them when it rewrites its own file.

## File Models

Two models, and keeping them apart is the point.

| File                | Format | Modelled                | Written by                |
| ------------------- | ------ | ----------------------- | ------------------------- |
| `proxy/config.json` | JSON   | Yes — `FileHelper.json` | The proxy, and the action |
| `store.json`        | JSON   | Yes — `FileHelper.json` | The action                |

**The proxy's config file is co-owned, and its shape must stay exactly upstream's.** The proxy rewrites the whole file when a key is saved on its status page, so anything else stored there would be destroyed — which is why the verbose-logging setting lives in a separate file the container cannot see.

**The API key is not passed as an environment variable**, though upstream supports that. Leaving it out means the proxy's own key store is the single owner of the key, so a key set through the status page and a key set through the action are the same key rather than two competing sources.

The config file is read reactively, which is what makes a key saved by the action take effect: the write restarts the daemon, and the proxy reloads the file at start.

## Dependencies

None.

**But the service is not self-contained.** Every request is forwarded to PPQ.AI's enclave, so the package needs working internet and a funded PPQ.AI account. Running this proxy locally is not running inference locally — what it buys is that the request contents are encrypted end-to-end into the enclave.

## Network Access and Interfaces

**Two interfaces on one address**, which is unusual and deliberate.

| Interface | Id    | Type | Port | Description                                         |
| --------- | ----- | ---- | ---- | --------------------------------------------------- |
| Status    | `ui`  | ui   | 8787 | Attestation state, available models, setup snippets |
| API       | `api` | api  | 8787 | The OpenAI-compatible endpoint                      |

Both are exported from the **same binding**, because they are the same server: one is the page a person opens, the other is the URL a client is pointed at. Bound on the `main` MultiHost over HTTP and not masked.

**Neither is authenticated by StartOS**, and the status page is where the API key can be saved — so anyone who can reach the address can read the attestation state, use your key for inference, and replace it. Treat the address as a credential.

## Installation and First-Run Flow

Install seeds nothing and raises an `important` task asking for the PPQ.AI API key.

**That task is deliberately not `critical`**, and the reasoning is worth knowing: a `critical` task suspends the ordinary controls, which would leave the user unable to start the service — and the service's own status page is the other place a key can be saved. Blocking startup would block one of the two ways to complete the task.

So the proxy starts without a key. It serves its status page, performs attestation, and answers inference requests with an authentication error until a key exists.

**A key saved on the status page clears the task too.** The action clears its own task when it runs, but the status page never goes through the action — so the restart that the save triggers is where the package notices a key now exists and clears the prompt itself. Without that, StartOS would keep asking for a key the user had already set.

## Actions

One action.

### Configure PPQ API Key

Sets the API key and the verbose-logging switch.

- **What it changes:** the key in the proxy's config file, and the logging setting in the package's own store.
- **Cost:** the service restarts, since the proxy reads its config at start.
- **Repeat safety:** idempotent. **Leaving the key blank keeps the existing one** rather than clearing it, so the action can be used to toggle logging without re-entering the key.
- **The key is never echoed back into the form.** The logging toggle is pre-filled; the key is not.
- **The key's shape is checked before it is written.** Upstream's status page rejects a malformed key outright, but a bad key written straight into the config file would only surface later as a failed request — so the same check is applied here.

**Requests are billed to whichever key is set.**

## Tasks

One, and it is advisory.

| Task                  | Severity    | Raised when               | Cleared when                      |
| --------------------- | ----------- | ------------------------- | --------------------------------- |
| Configure PPQ API Key | `important` | An init that finds no key | The action runs, or a key appears |

`important` does not block the service from starting — see [Installation and First-Run Flow](#installation-and-first-run-flow) for why that matters here.

## Health Checks

One check, on the only daemon.

| Check   | Displayed as      | Method                 |
| ------- | ----------------- | ---------------------- |
| `proxy` | "Encrypted Proxy" | Port 8787 is listening |

**Here a port check means more than usual.** The proxy binds its port only after remote attestation of the enclave has succeeded, so a listening port is evidence that the encrypted channel was verified — not merely that a process started.

It still says nothing about the key: an unset or rejected key shows a green check and an authentication error on the request.

## Backups and Restore

The `main` volume is copied wholesale — `sdk.Backups.ofVolumes('main')`. That is the proxy's config file, holding the API key, and the package's settings.

**The backup contains the API key in recoverable form**, and requests made with it are billed to your account. There is nothing else here: no conversation history, no cache, no model data.

A restored instance comes back with the same key and works immediately, since nothing in the configuration is tied to the server it ran on.

## Limitations and Differences

1. **Inference is not local.** Requests go to PPQ.AI's enclave; the privacy claim is about who can decrypt them, not about where they run.
2. **A funded PPQ.AI account is required**, and requests are billed to the configured key.
3. **Neither interface is authenticated**, and the status page can both use and replace the key.
4. **The status page and the API share one address**, so they cannot be exported separately.
5. **The API key cannot be cleared from the action** — leaving the field blank preserves it.
6. **The package cannot add settings to the proxy's config file**, which upstream rewrites wholesale.
7. **The only package-level setting is verbose logging.** Everything else is upstream's.

---

## Quick Reference for AI Consumers

```yaml
package_id: ppq-private-mode
image: built from ./ppq-private-mode-proxy # upstream vendored as a git submodule
architectures:
  - x86_64
  - aarch64
subcontainers:
  - proxy-sub
volumes:
  main:
    proxy: /data # PPQ_DATA_DIR; store.json sits at the volume root, unmounted
file_models:
  - proxy/config.json # upstream's shape exactly — the proxy rewrites it wholesale
  - store.json # package-owned; kept outside the mount so the proxy can't clobber it
startos_managed_env_vars:
  - PPQ_DATA_DIR
  - HOST
  - PORT
  - DEBUG
  # PPQ_API_KEY is deliberately NOT set — the proxy's key store owns the key
dependencies: [] # but requires internet and a funded PPQ.AI account
interfaces:
  ui: { type: ui, port: 8787 } # status page; also where a key can be saved
  api: { type: api, port: 8787 } # same binding, exported as a second interface
actions:
  - configure-api-key # blank key field preserves the existing key
tasks:
  - { action: configure-api-key, severity: important } # not critical, by design
health_checks:
  - proxy # the port opens only after enclave attestation succeeds
```

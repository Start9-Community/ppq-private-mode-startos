# TODO — remaining work before release

- [ ] Install on a StartOS box and verify: critical task prompts for the API
      key, service starts, health check turns ready after attestation, and a
      `POST /v1/chat/completions` request against the exported interface
      address succeeds.
- [ ] Backup / restore sanity check (config.json survives, service starts
      without re-prompting for the key).
- [ ] Review README and instructions once more against actual behavior on the
      box.
- [ ] Submit to the Community Registry (email submissions@start9.com with a
      link to this repo).

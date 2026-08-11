# TODO — remaining work before release

- [ ] Run one live inference request with a funded PPQ.AI key. Everything up to
      the enclave is verified (attestation, encrypted forward, error handling),
      but no request has yet been billed end-to-end against a real key.
- [ ] Re-run backup and restore on a StartOS box: back up, uninstall, restore,
      and confirm the service comes back with its key and raises no
      configuration task.

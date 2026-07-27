# Updating the upstream version

Upstream is [PayPerQ/ppq-private-mode-proxy](https://github.com/PayPerQ/ppq-private-mode-proxy),
vendored as the `ppq-private-mode-proxy` git submodule and built from its own
`Dockerfile`. The package version tracks upstream's `package.json` version.

## Determining the upstream version

```bash
git -C ppq-private-mode-proxy fetch origin
git -C ppq-private-mode-proxy log --oneline HEAD..origin/main   # anything new?
jq -r .version ppq-private-mode-proxy/package.json               # current pin
```

The packaged version lives in `startos/versions/current.ts` (`version:
'<upstream>:<revision>'`).

## Applying the bump

1. Advance the submodule: `git -C ppq-private-mode-proxy checkout origin/main`
2. Update `version` in `startos/versions/current.ts` to the new upstream
   `package.json` version with revision `:0` (bump only the revision for
   packaging-only changes), and write release notes.
3. Rebuild and test: `make x86` (or `make arm`), install, verify attestation
   completes and a `/v1/models` request succeeds.

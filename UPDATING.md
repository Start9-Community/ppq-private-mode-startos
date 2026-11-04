# Updating the upstream version

Upstream is [PayPerQ/ppq-private-mode-proxy](https://github.com/PayPerQ/ppq-private-mode-proxy),
vendored as the `ppq-private-mode-proxy` git submodule and built from its own
`Dockerfile`. The package version tracks upstream's `package.json` version,
which upstream tags as `v<version>`.

## Determining the upstream version

```bash
git -C ppq-private-mode-proxy fetch origin --tags
git -C ppq-private-mode-proxy describe --tags HEAD          # current pin
git -C ppq-private-mode-proxy tag --sort=-v:refname | head  # latest released
```

The packaged version lives in `startos/versions/current.ts` (`version:
'<upstream>:<revision>'`).

## Applying the bump

1. Advance the submodule: `git -C ppq-private-mode-proxy checkout v<version>`
2. Read the upstream diff (`git -C ppq-private-mode-proxy diff <old>..<new>`)
   for anything the package has to follow — new or renamed environment
   variables, changed endpoints, a changed bind/attestation order (the health
   check depends on the port being bound only after attestation), or a model
   catalog change that the docs name.

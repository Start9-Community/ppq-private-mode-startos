# AGENTS.md

This is a StartOS service-package repository — it builds a `.s9pk` for StartOS.

Develop it inside a StartOS packaging workspace created by `start-cli s9pk init-workspace`,
which provides the packaging guide and agent context one level up. If you're reading this in a
bare clone with no workspace, the full guide is at <https://docs.start9.com/packaging>.

**Start every task at the recipe index** — `../start-technologies/projects/start-sdk/docs/src/recipes.md`
(or <https://docs.start9.com/packaging/recipes.html>). It maps an intent ("prompt the user to create
admin credentials", "expose a web UI") to the constructs, the reference pages, and a named production
package to copy. Find the recipe before you read this package's neighbours: a package you reach by
grepping may be non-conformant, and the recipe outranks it.

Freshly scaffolded? Work the
[New Package Checklist](../start-technologies/projects/start-sdk/docs/src/new-package-checklist.md)
(or <https://docs.start9.com/packaging/new-package-checklist.html>) from top to bottom. It is a
guide page, not a file in this repo — read it, don't copy it in.

Keep `README.md` (technical reference for an AI support or administering agent) and
`instructions.md` (end-user docs) in sync with your changes.

**Bugs and feature requests are GitHub issues on this repo** — file them as you find them.
Don't record work in the repo instead: no `TODO.md`, no `NOTES.md`, no `PLAN.md`. What you
verified, tried, and decided belongs in the commit message and the PR body.

## This repo

- **`config.json`'s shape must stay exactly upstream's.** The proxy rewrites the whole file when a key is saved on the Status Page, so anything the package adds there is destroyed. Package-owned settings go in `store.json` at the volume root — **outside** the `proxy/` subpath that is mounted — where the container cannot see or clobber them.
- **Don't set `PPQ_API_KEY`.** Leaving it unset makes the proxy's own key store the single owner, so the action and the Status Page write the same key rather than competing.
- **The task is `important`, not `critical`, on purpose.** A `critical` task suspends the ordinary controls, which would stop the user starting the service — and the Status Page is the other place a key can be saved. Blocking startup would block half the ways to complete the task.
- **The key pattern is validated in the action** because upstream only validates on the Status Page — a malformed key written straight to `config.json` surfaces later as a 401 on the first request.
- **A blank key field preserves the existing key**, so the action doubles as the way to toggle logging. Don't "fix" it to clear on empty.
- **Default branch is `main`, not `master`.** Its CI workflows reference `main`; leave them.

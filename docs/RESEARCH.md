# Source review — mrr-tracker

## Revision and method

Inspected public commit: [`e9d76b79b5a5834a75b8848962e1cc4d09f9fa06`](https://github.com/NickCirv/mrr-tracker/commit/e9d76b79b5a5834a75b8848962e1cc4d09f9fa06). Source tree: `8aff4cb363ce433336a3302602b4c5d82d9aef4f`. Capture scope: all eligible text files; 6 of 6 eligible files.

This review read captured implementation and documentation. It did not install dependencies, execute project commands, call project APIs, check package publication or establish live CI status. Examples are source-derived, not captured execution transcripts.

## Claim ledger

| Claim | Evidence | Status |
| --- | --- | --- |
| Home-directory JSON persistence and commands | [index.js](https://github.com/NickCirv/mrr-tracker/blob/e9d76b79b5a5834a75b8848962e1cc4d09f9fa06/index.js) | Verified in inspected source; execution unverified |
| Declared runtime and test entry | [package.json](https://github.com/NickCirv/mrr-tracker/blob/e9d76b79b5a5834a75b8848962e1cc4d09f9fa06/package.json) | Verified in inspected source; execution unverified |

## Findings and verification gaps

This is a manually maintained ledger, not an accounting or billing reconciliation system. Currency display is hard-coded to dollars. Subscriber and churn calculations depend on the event history and product-level counts; there is no independent validation against payments. Back up the JSON file before editing it.

No project tests were executed.

| Dimension | Result |
| --- | --- |
| Purpose and documented commands | Partially verified: static source inspection |
| Clean installation and examples | Unverified |
| Test suite and live CI | Unverified |
| Performance and security guarantees | Unverified |
| Publication | Local documentation only |

## Documentation inventory

- [README.md](https://github.com/NickCirv/mrr-tracker/blob/e9d76b79b5a5834a75b8848962e1cc4d09f9fa06/README.md) — Rewritten; historic section anchors retained where practical.
- [LICENSE](https://github.com/NickCirv/mrr-tracker/blob/e9d76b79b5a5834a75b8848962e1cc4d09f9fa06/LICENSE) — protected document preserved unchanged.

## Captured source inventory

- [LICENSE](https://github.com/NickCirv/mrr-tracker/blob/e9d76b79b5a5834a75b8848962e1cc4d09f9fa06/LICENSE) — Git blob `05b804beeec7d1a6c933d087387ba4adf6463d93`.
- [README.md](https://github.com/NickCirv/mrr-tracker/blob/e9d76b79b5a5834a75b8848962e1cc4d09f9fa06/README.md) — Git blob `17f518be49b0084abbb9a55bd76738d5523a89c5`.
- [package.json](https://github.com/NickCirv/mrr-tracker/blob/e9d76b79b5a5834a75b8848962e1cc4d09f9fa06/package.json) — Git blob `abc963990d297ea31560e662b20cab1fb0e0a1f6`.
- [.github/workflows/ci.yml](https://github.com/NickCirv/mrr-tracker/blob/e9d76b79b5a5834a75b8848962e1cc4d09f9fa06/.github/workflows/ci.yml) — Git blob `44515034a394670de44454a7a1bd2c7ef0c9836e`.
- [index.js](https://github.com/NickCirv/mrr-tracker/blob/e9d76b79b5a5834a75b8848962e1cc4d09f9fa06/index.js) — Git blob `7352ada4f31cdf26268d79c1ec00feff697a8b81`.
- [test/smoke.test.js](https://github.com/NickCirv/mrr-tracker/blob/e9d76b79b5a5834a75b8848962e1cc4d09f9fa06/test/smoke.test.js) — Git blob `a2eba067c997f85dfb0e2dbaf147bbde33266e19`.

## Scope boundary

Capture excludes lockfiles, binary artwork, generated output, vendored dependencies and files above the acquisition size limit. The tree records their existence; no verification claim is made for omitted content. Protected documents and historical records are not replaced.

## Reference coverage

Added [command reference](REFERENCE.md) from the argument parser, command handlers and source-defined help at the pinned revision. README examples remain unexecuted.

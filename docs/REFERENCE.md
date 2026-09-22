# Command reference

Use `node index.js` from the pinned source checkout described in the [README](../README.md). The entries below describe the inspected implementation.

| Command or argument | Behavior |
| --- | --- |
| `dashboard` | Display the local revenue ledger and derived subscription metrics. |
| `add --name NAME --amount NUMBER` | Append a revenue event for the named product; amount must be positive. |
| `--type monthly / yearly / once` | Select revenue recurrence for add; monthly is the default. |
| `--customer ID` | Attach an optional customer identifier to add or churn. |
| `churn --name NAME` | Record subscriber churn for an existing product. |
| `log` | List recorded revenue events. |
| `milestone` | Display progress toward revenue milestones. |
| `status` | Print a compact current revenue summary. |

For prerequisites, file writes, external services and known limitations, see [Behavior and limits](../README.md#behavior-and-limits).

Implementation: [index.js](https://github.com/NickCirv/mrr-tracker/blob/e9d76b79b5a5834a75b8848962e1cc4d09f9fa06/index.js), [package.json](https://github.com/NickCirv/mrr-tracker/blob/e9d76b79b5a5834a75b8848962e1cc4d09f9fa06/package.json); [review evidence](RESEARCH.md).

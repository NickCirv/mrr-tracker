<div align="center">

# mrr-tracker

**Local MRR dashboard for indie hackers — zero cloud, zero subscriptions, plain JSON.**

[![License: MIT](https://img.shields.io/badge/License-MIT-0B0A09?style=flat&labelColor=0B0A09&color=white)](LICENSE)
[![Zero dependencies](https://img.shields.io/badge/dependencies-0-0B0A09?style=flat&labelColor=0B0A09&color=brightgreen)](package.json)
[![Node >=18](https://img.shields.io/badge/node-%3E%3D18-0B0A09?style=flat&labelColor=0B0A09&color=white)](package.json)

</div>

## Install

```bash
npx github:NickCirv/mrr-tracker
```

## Usage

```bash
# Full revenue dashboard (default)
npx github:NickCirv/mrr-tracker dashboard

# Add a new subscriber
npx github:NickCirv/mrr-tracker add --name "My SaaS" --amount 29 --type monthly

# Record churn
npx github:NickCirv/mrr-tracker churn --name "My SaaS"
```

| Command | Description |
|---|---|
| `dashboard` | Full MRR/ARR/churn view with progress bar (default) |
| `add --name <n> --amount <n> --type monthly\|yearly\|once` | Add subscriber or one-time revenue |
| `add ... --customer <email>` | Attach customer identifier to event |
| `churn --name <n> [--customer <email>]` | Record a lost subscriber |
| `log` | All revenue events in reverse-chronological order |
| `milestone` | Progress bars toward $100 / $500 / $1k / $5k / $10k MRR |
| `status` | One-line MRR summary |

## What it does

mrr-tracker stores every subscriber addition, churn event, and one-time sale in `~/.mrr-tracker.json` — plain JSON you can back up, diff, or pipe to `jq`. The `dashboard` command calculates MRR, ARR, 30-day churn rate, and milestone gap in real time from that file. No account. No internet connection. No SaaS to pay for the SaaS you're building.

---

<sub>Zero dependencies · Node >=18 · MIT · by <a href="https://github.com/NickCirv">NickCirv</a></sub>

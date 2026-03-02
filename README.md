# mrr-tracker

Track your MRR locally. No cloud. No SaaS to track your SaaS.

Built for indie hackers who are tired of paying $20/month to see that they make $0/month.

---

## Install

```bash
npm install -g mrr-tracker
```

Or clone and run directly:

```bash
git clone https://github.com/NickCirv/mrr-tracker
cd mrr-tracker
chmod +x index.js
node index.js
```

---

## Commands

### Dashboard (default)
```bash
mrr
mrr dashboard
```

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  MRR TRACKER
  March 2026
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  MRR        $58.00    ↑ $29.00 this month
  ARR        $696.00   (MRR × 12)
  Churn      0%        0 subscribers lost (30d)

  ▓░░░░░░░░░░░░░░░░░░░  58% to $100 MRR

  Products:
  ─────────────────────────────────────────
  Cirv Box (monthly $29)       2 active
  Lead Finder (monthly $49)    0 active

  Next milestone: $100/mo MRR
  Gap: $42.00
  "One customer at $42 would cover your Render bill."

  Revenue detected. It's real. Tell someone.
```

### Add revenue
```bash
# New monthly subscriber
mrr add --name "Cirv Box" --amount 29 --type monthly
mrr add --name "Cirv Box" --amount 29 --type monthly --customer "john@email.com"

# Yearly subscriber
mrr add --name "Lead Finder Pro" --amount 299 --type yearly

# One-time sale
mrr add --name "Consulting" --amount 500 --type once
```

### Record churn
```bash
mrr churn --name "Cirv Box"
mrr churn --name "Cirv Box" --customer "john@email.com"
```

### See all events
```bash
mrr log
```

### Milestone tracker
```bash
mrr milestone
```

```
  MRR Milestones
  ─────────────────────────────────────────
  Current MRR: $58.00

  $100/mo    58% there  Gap: $42.00
  ▓▓▓▓▓▓▓▓░░░░░░░  58% to $100 MRR

  $500/mo    12% there  Gap: $442.00
  ...
```

### Quick status
```bash
mrr status
# MRR: $58.00  |  ARR: $696.00  |  Subscribers: 2
```

---

## Data

Everything lives in `~/.mrr-tracker.json`. Plain JSON. No database server. No cloud sync.

```json
{
  "products": [
    {
      "id": "uuid",
      "name": "Cirv Box",
      "type": "monthly",
      "amount": 29,
      "active_subscribers": 2,
      "created_at": "2026-03-02"
    }
  ],
  "events": [
    {
      "id": "uuid",
      "type": "new_subscriber",
      "product_id": "uuid",
      "product_name": "Cirv Box",
      "amount": 29,
      "customer": "john@email.com",
      "date": "2026-03-02",
      "note": "New subscriber: john@email.com"
    }
  ]
}
```

Back it up. Move it between machines. Pipe it to `jq`. It's your data.

---

## Milestones

| MRR | Message |
|-----|---------|
| $0 | Pre-revenue. Every unicorn started here. Most stayed here too. |
| $1–$99 | Revenue detected. It's real. Tell someone. |
| $100+ | $100 MRR. You cover your hosting. This is not nothing. |
| $500+ | Ramen profitable. Technically. |
| $1,000+ | Most indie hackers never get here. You did. |
| $5,000+ | Quit your day job math starts making sense here. |
| $10,000+ | This is a real business. Congrats. |

---

## Requirements

- Node.js 18+
- No dependencies (zero npm packages)

---

## License

MIT

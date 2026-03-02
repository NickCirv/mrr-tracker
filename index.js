#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'
import os from 'os'

const DATA_FILE = path.join(os.homedir(), '.mrr-tracker.json')

// ─── Data Layer ──────────────────────────────────────────────────────────────

function loadData() {
  if (!fs.existsSync(DATA_FILE)) {
    return { products: [], events: [] }
  }
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'))
  } catch {
    console.error('Error reading data file. Resetting...')
    return { products: [], events: [] }
  }
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8')
}

function today() {
  return new Date().toISOString().split('T')[0]
}

// ─── Calculations ─────────────────────────────────────────────────────────────

function calcMRR(data) {
  let mrr = 0
  for (const product of data.products) {
    if (product.type === 'monthly') {
      mrr += product.amount * product.active_subscribers
    } else if (product.type === 'yearly') {
      mrr += (product.amount / 12) * product.active_subscribers
    }
  }
  return mrr
}

function calcARR(mrr) {
  return mrr * 12
}

function calcChurnRate(data) {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const cutoff = thirtyDaysAgo.toISOString().split('T')[0]

  const recentEvents = data.events.filter(e => e.date >= cutoff)
  const churns = recentEvents.filter(e => e.type === 'churn').length
  const newSubs = recentEvents.filter(e => e.type === 'new_subscriber').length

  const startSubs = data.products.reduce((sum, p) => sum + p.active_subscribers, 0)
  const startSubsEstimate = startSubs + churns - newSubs

  if (startSubsEstimate <= 0) return 0
  return ((churns / startSubsEstimate) * 100).toFixed(1)
}

function calcMonthGrowth(data) {
  const now = new Date()
  const thisMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastMonthStr = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`

  const thisMonthRevenue = data.events
    .filter(e => e.date.startsWith(thisMonthStr) && (e.type === 'new_subscriber' || e.type === 'one_time'))
    .reduce((sum, e) => sum + e.amount, 0)

  const lastMonthRevenue = data.events
    .filter(e => e.date.startsWith(lastMonthStr) && (e.type === 'new_subscriber' || e.type === 'one_time'))
    .reduce((sum, e) => sum + e.amount, 0)

  return { thisMonth: thisMonthRevenue, lastMonth: lastMonthRevenue }
}

// ─── Milestone Logic ──────────────────────────────────────────────────────────

function getMilestone(mrr) {
  const milestones = [100, 500, 1000, 5000, 10000]
  for (const m of milestones) {
    if (mrr < m) return m
  }
  return null
}

function getMilestoneMessage(mrr) {
  if (mrr === 0) return 'Pre-revenue. Every unicorn started here. Most stayed here too.'
  if (mrr < 100) return 'Revenue detected. It\'s real. Tell someone.'
  if (mrr < 500) return '$100+ MRR. You cover your hosting. This is not nothing.'
  if (mrr < 1000) return 'Ramen profitable. Technically.'
  if (mrr < 5000) return '$1k MRR. Most indie hackers never get here. You did.'
  if (mrr < 10000) return 'Quit your day job math starts making sense here.'
  return 'This is a real business. Congrats.'
}

function getMilestoneContextMessage(nextMilestone, mrr) {
  const gap = nextMilestone - mrr
  const messages = {
    100: `One customer at $${Math.ceil(gap)} would cover your Render bill.`,
    500: `${Math.ceil(gap / 29)} more Cirv Box subscribers and you're there.`,
    1000: 'Four figures. Not many reach it. You can.',
    5000: 'This is where part-time becomes full-time.',
    10000: 'The $10k milestone. Keep stacking.',
  }
  return messages[nextMilestone] || `$${gap.toFixed(2)} more to go.`
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────

function progressBar(current, target, width = 20) {
  const pct = Math.min(current / target, 1)
  const filled = Math.floor(pct * width)
  const empty = width - filled
  const bar = '▓'.repeat(filled) + '░'.repeat(empty)
  return `  ${bar}  ${(pct * 100).toFixed(0)}% to $${target.toLocaleString()} MRR`
}

// ─── Formatting ───────────────────────────────────────────────────────────────

function fmt(n) {
  return `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function monthName() {
  return new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })
}

function dim(str) { return `\x1b[2m${str}\x1b[0m` }
function bold(str) { return `\x1b[1m${str}\x1b[0m` }
function green(str) { return `\x1b[32m${str}\x1b[0m` }
function yellow(str) { return `\x1b[33m${str}\x1b[0m` }
function cyan(str) { return `\x1b[36m${str}\x1b[0m` }
function red(str) { return `\x1b[31m${str}\x1b[0m` }

// ─── Commands ─────────────────────────────────────────────────────────────────

function cmdAdd(args) {
  const data = loadData()
  const name = getArg(args, '--name')
  const amountStr = getArg(args, '--amount')
  const type = getArg(args, '--type') || 'monthly'
  const customer = getArg(args, '--customer') || ''

  if (!name || !amountStr) {
    console.error('Usage: mrr add --name "Product" --amount 29 --type monthly|yearly|once')
    process.exit(1)
  }

  const amount = parseFloat(amountStr)
  if (isNaN(amount) || amount <= 0) {
    console.error('Amount must be a positive number.')
    process.exit(1)
  }

  const validTypes = ['monthly', 'yearly', 'once']
  if (!validTypes.includes(type)) {
    console.error(`Type must be one of: ${validTypes.join(', ')}`)
    process.exit(1)
  }

  if (type === 'once') {
    data.events.push({
      id: randomUUID(),
      type: 'one_time',
      product_id: null,
      product_name: name,
      amount,
      customer,
      date: today(),
      note: `One-time: ${name}`
    })
    saveData(data)
    console.log(green(`\n  Recorded one-time revenue: ${fmt(amount)} from "${name}"\n`))
    return
  }

  // Check if product already exists
  let product = data.products.find(p => p.name.toLowerCase() === name.toLowerCase())

  if (!product) {
    product = {
      id: randomUUID(),
      name,
      type,
      amount,
      active_subscribers: 0,
      created_at: today()
    }
    data.products.push(product)
  }

  product.active_subscribers += 1

  data.events.push({
    id: randomUUID(),
    type: 'new_subscriber',
    product_id: product.id,
    product_name: name,
    amount,
    customer,
    date: today(),
    note: customer ? `New subscriber: ${customer}` : 'New subscriber'
  })

  saveData(data)
  console.log(green(`\n  Added subscriber to "${name}" — ${fmt(amount)}/${type}`))
  console.log(green(`  Active subscribers: ${product.active_subscribers}`))
  const newMrr = calcMRR(data)
  console.log(green(`  New MRR: ${fmt(newMrr)}\n`))
}

function cmdChurn(args) {
  const data = loadData()
  const name = getArg(args, '--name')
  const customer = getArg(args, '--customer') || ''

  if (!name) {
    console.error('Usage: mrr churn --name "Product" [--customer "email@example.com"]')
    process.exit(1)
  }

  const product = data.products.find(p => p.name.toLowerCase() === name.toLowerCase())
  if (!product) {
    console.error(`Product "${name}" not found. Check: mrr dashboard`)
    process.exit(1)
  }

  if (product.active_subscribers <= 0) {
    console.error(`No active subscribers for "${name}".`)
    process.exit(1)
  }

  product.active_subscribers -= 1

  data.events.push({
    id: randomUUID(),
    type: 'churn',
    product_id: product.id,
    product_name: name,
    amount: product.amount,
    customer,
    date: today(),
    note: customer ? `Churned: ${customer}` : 'Subscriber churned'
  })

  saveData(data)
  const newMrr = calcMRR(data)
  console.log(yellow(`\n  Churn recorded for "${name}"`))
  if (customer) console.log(yellow(`  Customer: ${customer}`))
  console.log(yellow(`  Active subscribers: ${product.active_subscribers}`))
  console.log(yellow(`  New MRR: ${fmt(newMrr)}\n`))
}

function cmdDashboard(data) {
  if (!data) data = loadData()

  const mrr = calcMRR(data)
  const arr = calcARR(mrr)
  const churnRate = calcChurnRate(data)
  const { thisMonth, lastMonth } = calcMonthGrowth(data)
  const mrrDiff = thisMonth - lastMonth
  const mrrDiffStr = mrrDiff >= 0 ? `↑ ${fmt(mrrDiff)}` : `↓ ${fmt(Math.abs(mrrDiff))}`
  const nextMilestone = getMilestone(mrr)
  const milestoneMessage = getMilestoneMessage(mrr)

  const divider = '  ' + '━'.repeat(41)

  console.log('')
  console.log(divider)
  console.log(bold('  MRR TRACKER'))
  console.log(`  ${monthName()}`)
  console.log(divider)
  console.log('')
  console.log(`  MRR        ${bold(cyan(fmt(mrr)))}    ${dim(mrrDiffStr + ' this month')}`)
  console.log(`  ARR        ${bold(fmt(arr))}    ${dim('(MRR × 12)')}`)
  console.log(`  Churn      ${churnRate > 0 ? yellow(churnRate + '%') : dim('0%')}       ${dim(data.events.filter(e => {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    return e.type === 'churn' && e.date >= thirtyDaysAgo.toISOString().split('T')[0]
  }).length + ' subscribers lost (30d)')}`)
  console.log('')

  if (nextMilestone) {
    console.log(progressBar(mrr, nextMilestone))
    console.log('')
  }

  if (data.products.length > 0) {
    console.log('  Products:')
    console.log('  ' + '─'.repeat(41))
    for (const p of data.products) {
      if (p.type === 'monthly' || p.type === 'yearly') {
        const label = `${p.name} (${p.type} ${fmt(p.amount)})`
        const padding = Math.max(1, 36 - label.length)
        console.log(`  ${label}${' '.repeat(padding)}${p.active_subscribers} active`)
      }
    }
    console.log('')
  } else {
    console.log(dim('  No products yet.'))
    console.log('')
  }

  if (nextMilestone) {
    const gap = nextMilestone - mrr
    console.log(`  ${dim('Next milestone:')} ${bold('$' + nextMilestone.toLocaleString() + '/mo MRR')}`)
    console.log(`  ${dim('Gap:')} ${bold(fmt(gap))}`)
    console.log(`  ${dim('"' + getMilestoneContextMessage(nextMilestone, mrr) + '"')}`)
  } else {
    console.log(`  ${bold(green('$10k+ MRR. You\'ve made it.'))}`)
  }

  console.log('')
  console.log(`  ${dim(milestoneMessage)}`)
  console.log('')

  const recentEvents = data.events.slice(-5).reverse()
  if (recentEvents.length > 0) {
    console.log('  Recent events:')
    console.log('  ' + '─'.repeat(41))
    for (const e of recentEvents) {
      const typeLabel = {
        new_subscriber: green('  + sub'),
        churn: red('  - churn'),
        one_time: cyan('  $ once')
      }[e.type] || '  ?'
      const detail = e.customer ? `${e.product_name} (${e.customer})` : e.product_name
      console.log(`  ${e.date}  ${typeLabel}  ${fmt(e.amount)}  ${dim(detail)}`)
    }
  } else {
    console.log(dim('  Recent events: (none yet)'))
  }

  console.log('')
  console.log(divider)
  console.log(dim(`  Data: ${DATA_FILE}`))
  console.log(dim('  Add revenue: mrr add --name "Product" --amount 29 --type monthly'))
  console.log('')
}

function cmdLog() {
  const data = loadData()

  if (data.events.length === 0) {
    console.log(dim('\n  No events yet. Run: mrr add --name "Product" --amount 29 --type monthly\n'))
    return
  }

  console.log('')
  console.log(bold('  Revenue Log'))
  console.log('  ' + '─'.repeat(55))
  console.log(dim('  Date        Type           Amount    Product / Customer'))
  console.log('  ' + '─'.repeat(55))

  for (const e of [...data.events].reverse()) {
    const typeFormatted = {
      new_subscriber: green('new_subscriber'),
      churn: red('churn        '),
      one_time: cyan('one_time     ')
    }[e.type] || e.type.padEnd(13)

    const detail = e.customer ? `${e.product_name} — ${e.customer}` : e.product_name
    console.log(`  ${e.date}  ${typeFormatted}  ${fmt(e.amount).padStart(9)}  ${detail}`)
  }

  console.log('')
  console.log(dim(`  ${data.events.length} total events`))
  console.log('')
}

function cmdMilestone() {
  const data = loadData()
  const mrr = calcMRR(data)
  const milestones = [100, 500, 1000, 5000, 10000]

  console.log('')
  console.log(bold('  MRR Milestones'))
  console.log('  ' + '─'.repeat(41))
  console.log(dim(`  Current MRR: ${fmt(mrr)}`))
  console.log('')

  for (const m of milestones) {
    const reached = mrr >= m
    const pct = Math.min((mrr / m) * 100, 100).toFixed(0)
    const bar = progressBar(mrr, m, 15).trim()
    const status = reached ? green('  ✓ REACHED') : yellow(`  ${pct}% there`)
    const gap = reached ? '' : `  Gap: ${fmt(m - mrr)}`
    console.log(`  ${reached ? bold(green('$' + m.toLocaleString() + '/mo')) : '$' + m.toLocaleString() + '/mo'}${status}${gap}`)
    if (!reached) {
      console.log(`  ${bar}`)
    }
    console.log('')
  }

  const msg = getMilestoneMessage(mrr)
  console.log(dim(`  "${msg}"`))
  console.log('')
}

function cmdStatus() {
  const data = loadData()
  const mrr = calcMRR(data)
  const arr = calcARR(mrr)
  const totalSubs = data.products.reduce((sum, p) => sum + p.active_subscribers, 0)
  const totalEvents = data.events.length
  const totalProducts = data.products.length

  console.log('')
  console.log(`  MRR: ${bold(cyan(fmt(mrr)))}  |  ARR: ${bold(fmt(arr))}  |  Subscribers: ${bold(totalSubs)}`)
  console.log(dim(`  ${totalProducts} products  ${totalEvents} events  Data: ${DATA_FILE}`))
  console.log('')
}

// ─── Arg Parser ───────────────────────────────────────────────────────────────

function getArg(args, flag) {
  const idx = args.indexOf(flag)
  if (idx === -1 || idx + 1 >= args.length) return null
  return args[idx + 1]
}

// ─── Help ─────────────────────────────────────────────────────────────────────

function showHelp() {
  console.log(`
  ${bold('mrr-tracker')} — Local MRR tracking for indie hackers

  ${bold('Commands:')}

  ${cyan('mrr dashboard')}
    Show full revenue dashboard (default)

  ${cyan('mrr add --name "Product" --amount 29 --type monthly')}
    Add a new subscriber / revenue event
    --name     Product name (string)
    --amount   Revenue amount (number)
    --type     monthly | yearly | once
    --customer Optional: customer email or identifier

  ${cyan('mrr churn --name "Product" [--customer email]')}
    Record a subscriber churning

  ${cyan('mrr log')}
    Show all revenue events chronologically

  ${cyan('mrr milestone')}
    Show progress toward $100 / $500 / $1k / $5k / $10k MRR

  ${cyan('mrr status')}
    One-line MRR summary

  ${dim('Data stored at: ' + DATA_FILE)}
`)
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2)
const cmd = args[0]

switch (cmd) {
  case 'add':
    cmdAdd(args.slice(1))
    break
  case 'churn':
    cmdChurn(args.slice(1))
    break
  case 'log':
    cmdLog()
    break
  case 'milestone':
    cmdMilestone()
    break
  case 'status':
    cmdStatus()
    break
  case 'dashboard':
  case undefined:
    cmdDashboard()
    break
  case '--help':
  case '-h':
  case 'help':
    showHelp()
    break
  default:
    console.error(`  Unknown command: ${cmd}`)
    console.error('  Run: mrr --help')
    process.exit(1)
}

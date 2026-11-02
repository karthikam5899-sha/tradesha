import { useEffect, useMemo, useState } from 'react'
import {
  Activity, ArrowDownRight, ArrowLeft, ArrowRight, ArrowUpRight, Bell, BriefcaseBusiness, Check, ChevronDown, Facebook,
  CircleDollarSign, Clock3, ExternalLink, Eye, Globe2, LineChart, Linkedin, LockKeyhole, LogOut, Mail, MapPin, Menu, Phone, Plus,
  RefreshCw,
  Search, ShieldCheck, Sparkles, TrendingUp, UserRound, Wallet, X, Zap
} from 'lucide-react'
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts'
import { indices, stocks, portfolio, performance } from './data'

const money = n => '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const positive = n => Number(n) >= 0
const NEWS_FEED_URL = 'https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fnews.google.com%2Frss%2Fsearch%3Fq%3DIndia%2Bstock%2Bmarket%2Bwhen%3A1d%26hl%3Den-IN%26gl%3DIN%26ceid%3DIN%253Aen'

function newsCategory(title) {
  if (/\b(rbi|inflation|economy|gdp|rupee|policy)\b/i.test(title)) return 'ECONOMY'
  if (/\b(bank|banking|hdfc|icici|sbi)\b/i.test(title)) return 'BANKING'
  if (/\b(earnings|results|company|shares|ipo|reliance|infosys|tcs)\b/i.test(title)) return 'COMPANIES'
  return 'MARKETS'
}

function newsTime(date) {
  const minutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60_000))
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' })
}
const isIndianMarketOpen = () => {
  const parts = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(new Date())
  const part = type => parts.find(item => item.type === type)?.value
  const weekday = part('weekday')
  const minuteOfDay = Number(part('hour')) * 60 + Number(part('minute'))
  return weekday !== 'Sat' && weekday !== 'Sun' && minuteOfDay >= 555 && minuteOfDay < 930
}

function Logo() {
  return <a href="#home" className="flex items-center gap-2.5">
    <img src="/TradeSha%20India.png" alt="" className="h-11 w-11 rounded-xl object-contain" />
    <span className="text-lg font-extrabold tracking-tight"><span className="brand-name">TradeSha</span><span className="brand-light">.</span><small className="ml-1 text-[10px] font-semibold uppercase tracking-[.18em] text-muted">India</small></span>
  </a>
}

function PageIntro({ leaving, onSkip }) {
  const candles = [
    [80, 264, 48, '#244436'], [175, 232, 60, '#a9472f'], [270, 247, 42, '#244436'],
    [365, 204, 70, '#244436'], [460, 220, 48, '#a9472f'], [555, 174, 76, '#244436'],
    [650, 191, 55, '#a9472f'], [745, 146, 78, '#244436'], [840, 163, 50, '#244436'],
    [935, 117, 84, '#a9472f'], [1030, 136, 60, '#244436'], [1125, 92, 82, '#244436'],
    [1220, 105, 54, '#a9472f'], [1315, 62, 86, '#244436']
  ]
  const chartPath = 'M0 316 C95 301 121 254 204 279 S326 242 408 222 S529 251 612 191 S745 204 818 161 S945 184 1020 118 S1138 141 1217 88 S1351 101 1440 42'

  return <div className={`page-intro${leaving ? ' page-intro-leaving' : ''}`} role="status" aria-live="polite" aria-label="Loading TradeSha India market dashboard">
    <div className="intro-chart-glow intro-chart-glow-one"/>
    <div className="intro-chart-glow intro-chart-glow-two"/>
    <div className="intro-photo" aria-hidden="true"/>
    <svg className="intro-market-graph" viewBox="0 0 1440 420" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="introGraphLine" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#244436" stopOpacity=".12"/>
          <stop offset="55%" stopColor="#244436" stopOpacity=".7"/>
          <stop offset="100%" stopColor="#a9472f" stopOpacity=".8"/>
        </linearGradient>
        <linearGradient id="introGraphFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#a9472f" stopOpacity=".13"/>
          <stop offset="100%" stopColor="#a9472f" stopOpacity="0"/>
        </linearGradient>
      </defs>
      {candles.map(([x, y, height, color], index) => <g key={x} className="intro-candle" style={{ animationDelay: `${index * 65}ms` }}>
        <path d={`M${x + 9} ${y - 18}V${y + height + 18}`} stroke={color} strokeOpacity=".48" strokeWidth="2"/>
        <rect x={x} y={y} width="18" height={height} rx="3" fill={color} fillOpacity=".42"/>
      </g>)}
      <path d={`${chartPath} V420 H0Z`} fill="url(#introGraphFill)"/>
      <path d={chartPath} className="intro-market-line" fill="none" stroke="url(#introGraphLine)" strokeWidth="4" vectorEffect="non-scaling-stroke"/>
      <circle r="8" className="intro-market-pulse" fill="#a9472f">
        <animateMotion dur="4s" repeatCount="indefinite" path={chartPath}/>
      </circle>
    </svg>
    <div className="intro-content">
      <div className="intro-logo-wrap"><img src="/TradeSha%20India.png" alt="" className="intro-logo"/><span className="intro-logo-ring"/></div>
      <p className="intro-kicker">INDIAN MARKETS · MADE CLEAR</p>
      <h1 className="intro-brand"><span className="brand-name">TradeSha</span><span className="brand-light">.</span><span className="intro-india">India</span></h1>
      <p className="intro-tagline">Your markets. Your momentum.</p>
      <div className="intro-loading" aria-hidden="true"><span/></div>
      <p className="intro-loading-label"><TrendingUp size={14}/> Preparing your market dashboard</p>
    </div>
    <button type="button" className="intro-skip" onClick={onSkip}>Skip intro <ArrowRight size={14}/></button>
  </div>
}

function SectionTitle({ eyebrow, title, action }) {
  return <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
    <div><p className="mb-2 text-[10px] font-bold uppercase tracking-[.22em] text-mint">{eyebrow}</p><h2 className="text-2xl font-bold tracking-tight text-forest md:text-3xl">{title}</h2></div>
    {action}
  </div>
}

function Change({ value }) {
  const up = positive(value)
  const change = String(value).replace(/^[+-]/, '')
  return <span className={`inline-flex items-center gap-1 text-xs font-semibold ${up ? 'text-forest' : 'text-rose-500'}`}>
    {up ? <ArrowUpRight size={14}/> : <ArrowDownRight size={14}/>} {up ? '+' : '-'}{change}%
  </span>
}

function MiniChart({ points, down = false }) {
  const max = Math.max(...points), min = Math.min(...points)
  const coords = points.map((p, i) => `${(i / (points.length - 1)) * 100},${35 - ((p - min) / (max - min || 1)) * 30}`)
  const path = coords.map((point, index) => `${index ? 'L' : 'M'} ${point}`).join(' ')
  const stroke = down ? '#c5483f' : '#244436'
  return <svg viewBox="0 0 100 38" className="h-10 w-24 overflow-visible" aria-hidden="true">
    <path d={path} fill="none" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle className="chart-light-halo" r="5" fill={stroke}><animateMotion dur="2.8s" repeatCount="indefinite" path={path}/></circle>
    <circle className="chart-light-core" r="2" fill="#fffdf8"><animateMotion dur="2.8s" repeatCount="indefinite" path={path}/></circle>
  </svg>
}

function TradeModal({ stock, side, onClose, onConfirm }) {
  const [qty, setQty] = useState(1)
  const [orderType, setOrderType] = useState('Market')
  const [limitPrice, setLimitPrice] = useState(stock?.price.toFixed(2) ?? '')
  const [selectedSide, setSelectedSide] = useState(side)
  const [reviewing, setReviewing] = useState(false)
  if (!stock) return null
  const quantity = Number(qty)
  const price = orderType === 'Limit' ? Number(limitPrice) : stock.price
  const validQuantity = Number.isInteger(quantity) && quantity > 0
  const validPrice = Number.isFinite(price) && price > 0
  const total = validQuantity && validPrice ? price * quantity : 0
  const buttonClass = selectedSide === 'Buy' ? 'bg-mint text-ink' : 'bg-rose-400 text-ink'
  return <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm" onMouseDown={e => e.target === e.currentTarget && onClose()}>
    <div role="dialog" aria-modal="true" aria-labelledby="trade-dialog-title" className="max-h-[calc(100vh-2rem)] w-full max-w-md overflow-y-auto rounded-2xl border border-line bg-panel p-6 shadow-2xl">
      <div className="mb-5 flex items-center justify-between"><div><p className="text-xs text-muted">{reviewing ? 'Review order · NSE' : 'Demo order · NSE'}</p><h3 id="trade-dialog-title" className="mt-1 text-xl font-bold text-forest">{stock.symbol}</h3></div><button onClick={onClose} aria-label="Close order dialog" className="rounded-lg p-2 text-muted hover:bg-panel2 hover:text-forest"><X size={19}/></button></div>
      <div className="mb-5 flex items-center justify-between rounded-xl bg-panel2 p-4"><div><p className="text-xs text-muted">{stock.name}</p><p className="mt-1 text-lg font-bold text-forest">{money(stock.price)}</p><p className="mt-1 text-[10px] text-muted">Indicative market price</p></div><Change value={stock.change}/></div>
      {!reviewing ? <>
        <label className="mb-2 block text-xs font-semibold text-muted">Order side</label>
        <div className="mb-4 grid grid-cols-2 gap-2">{['Buy','Sell'].map(orderSide => <button key={orderSide} type="button" aria-pressed={selectedSide === orderSide} onClick={() => setSelectedSide(orderSide)} className={`rounded-lg border px-3 py-2.5 text-sm font-bold transition ${selectedSide === orderSide ? orderSide === 'Buy' ? 'border-mint bg-mint/10 text-mint' : 'border-rose-400 bg-rose-400/10 text-rose-300' : 'border-line text-muted'}`}>{orderSide}</button>)}</div>
        <label className="mb-2 block text-xs font-semibold text-muted">Order type</label>
        <div className="mb-4 grid grid-cols-2 gap-2">{['Market','Limit'].map(t => <button key={t} type="button" aria-pressed={orderType === t} onClick={() => setOrderType(t)} className={`rounded-lg border px-3 py-2.5 text-sm ${orderType === t ? 'border-mint bg-mint/10 text-mint' : 'border-line text-muted'}`}>{t}</button>)}</div>
        <label htmlFor="order-quantity" className="mb-2 block text-xs font-semibold text-muted">Quantity (shares)</label>
        <input id="order-quantity" type="number" min="1" step="1" value={qty} onChange={e => setQty(e.target.value)} className="field mb-4" />
        <label htmlFor="order-price" className="mb-2 block text-xs font-semibold text-muted">{orderType === 'Limit' ? 'Limit price (₹)' : 'Market price (₹)'}</label>
        <input id="order-price" type="number" min="0.01" step="0.01" value={orderType === 'Limit' ? limitPrice : stock.price.toFixed(2)} onChange={e => setLimitPrice(e.target.value)} readOnly={orderType === 'Market'} className={`field mb-4 ${orderType === 'Market' ? 'cursor-not-allowed opacity-70' : ''}`} />
        {qty !== '' && !validQuantity && <p role="alert" className="mb-3 text-xs text-rose-300">Enter a whole share quantity greater than zero.</p>}
        {orderType === 'Limit' && limitPrice !== '' && !validPrice && <p role="alert" className="mb-3 text-xs text-rose-300">Enter a limit price greater than zero.</p>}
        <div className="mb-5 flex items-center justify-between border-t border-line pt-4"><div><span className="text-sm text-muted">Estimated order value</span><p className="mt-1 text-[10px] text-muted">{validQuantity && validPrice ? `${quantity} shares × ${money(price)}` : 'Enter a valid quantity and price'}</p></div><strong className="text-lg text-forest">{money(total)}</strong></div>
        <button type="button" disabled={!validQuantity || !validPrice} onClick={() => setReviewing(true)} className={`w-full rounded-xl py-3.5 text-sm font-bold transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 ${buttonClass}`}>Review {selectedSide} order</button>
      </> : <>
        <div className="mb-5 rounded-xl border border-line bg-panel2 p-4">
          <div className="mb-4 flex items-center justify-between"><span className="text-xs text-muted">Order summary</span><span className={`rounded-md px-2 py-1 text-[10px] font-bold ${selectedSide === 'Buy' ? 'bg-mint/10 text-mint' : 'bg-rose-400/10 text-rose-300'}`}>{selectedSide} · {orderType}</span></div>
          <dl className="space-y-3 text-xs"><div className="flex justify-between"><dt className="text-muted">Stock</dt><dd className="font-semibold text-forest">{stock.symbol} · NSE</dd></div><div className="flex justify-between"><dt className="text-muted">Quantity</dt><dd className="font-semibold text-forest">{quantity} shares</dd></div><div className="flex justify-between"><dt className="text-muted">Price per share</dt><dd className="font-semibold text-forest">{money(price)}</dd></div><div className="flex justify-between border-t border-line pt-3"><dt className="font-semibold text-forest">Estimated total</dt><dd className="text-base font-bold text-forest">{money(total)}</dd></div></dl>
        </div>
        <button type="button" onClick={() => onConfirm({ stock, side: selectedSide, qty: quantity, price, total, orderType })} className={`w-full rounded-xl py-3.5 text-sm font-bold transition hover:brightness-110 ${buttonClass}`}><Check className="mr-2 inline" size={16}/> Confirm {selectedSide} demo order</button>
        <button type="button" onClick={() => setReviewing(false)} className="mt-2 w-full rounded-xl border border-line py-3 text-sm font-semibold text-forest transition hover:border-mint/40">Edit order</button>
      </>}
      <p className="mt-3 text-center text-[10px] text-muted">Demo only · No real order will be placed</p>
    </div>
  </div>
}

function FooterInfoModal({ type, onClose }) {
  const content = {
    contact: {
      title: 'Contact information',
      intro: 'TradeSha India in this project is a frontend demonstration, not a brokerage or a staffed financial service.',
      points: [
        'No support email, phone number, or office address has been configured for this demo.',
        'No account is created and demo orders are not sent to an exchange or broker.',
        'Do not submit passwords, payment information, or other sensitive details through this interface.'
      ]
    },
    help: {
      title: 'Help centre',
      intro: 'Use the dashboard to explore the demo features:',
      points: [
        'Markets and Stocks show illustrative sample prices; search the stock list to find a company.',
        'Use the eye control to add or remove a stock from your watchlist.',
        'Buy and Sell open an order form. Review the quantity, order type, and estimated total before confirming a simulated order.',
        'Portfolio values and chart history are sample data. Market headlines are fetched from Google News and open the publisher story.'
      ]
    },
    privacy: {
      title: 'Privacy policy',
      intro: 'This educational frontend does not provide sign-in or intentionally save your profile or trading activity.',
      points: [
        'Watchlist, chart filters, and demo orders are held in page memory and clear when the page is reloaded.',
        'The live headlines feature requests news through RSS2JSON and links to Google News publisher pages. Those services may receive standard connection data such as your IP address.',
        'The page loads its typeface from Google Fonts, which may receive standard connection data from your browser.',
        'Do not enter personal, account, or financial information into this demo.'
      ]
    },
    terms: {
      title: 'Terms & conditions',
      intro: 'TradeSha India is provided as an educational UI demo only.',
      points: [
        'Stock prices, index values, portfolio balances, performance, and orders are illustrative and are not live financial data.',
        'News headlines are supplied by an external feed and link to their respective publishers.',
        'No order is transmitted, no brokerage service is provided, and nothing on this site is investment advice.',
        'Use the demo at your own discretion; it is not a substitute for professional financial or legal guidance.'
      ]
    }
  }[type]
  if (!content) return null

  return <div className="fixed inset-0 z-[70] grid place-items-center bg-black/70 p-4 backdrop-blur-sm" onMouseDown={event => event.target === event.currentTarget && onClose()}>
    <section role="dialog" aria-modal="true" aria-labelledby="footer-info-title" className="max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-2xl border border-line bg-panel p-6 shadow-2xl sm:p-8">
      <div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-mint">TRADENOVA INDIA · DEMO</p><h2 id="footer-info-title" className="mt-2 text-2xl font-bold text-forest">{content.title}</h2></div><button type="button" aria-label="Close information dialog" onClick={onClose} className="rounded-lg p-2 text-muted transition hover:bg-panel2 hover:text-forest"><X size={19}/></button></div>
      <p className="mt-5 text-sm leading-6 text-muted">{content.intro}</p>
      <ul className="mt-5 space-y-3">{content.points.map(point=><li key={point} className="flex gap-3 text-xs leading-6 text-muted"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-mint"/><span>{point}</span></li>)}</ul>
      <button type="button" onClick={onClose} className="mt-7 w-full rounded-xl bg-mint py-3 text-sm font-bold text-ink transition hover:brightness-110">Got it</button>
    </section>
  </div>
}

function PortfolioReportModal({ report, onClose, onDownload, downloading, error, downloaded }) {
  const profitClass = report.pnl >= 0 ? 'text-forest' : 'text-rose-500'
  return <div className="fixed inset-0 z-[65] grid place-items-center bg-black/70 p-4 backdrop-blur-sm" onMouseDown={event => event.target === event.currentTarget && onClose()}>
    <section role="dialog" aria-modal="true" aria-labelledby="portfolio-report-title" className="max-h-[calc(100vh-2rem)] w-full max-w-4xl overflow-y-auto rounded-2xl border border-line bg-panel p-5 shadow-2xl sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-5">
        <div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-mint">TRADESHA INDIA · PORTFOLIO REPORT</p><h2 id="portfolio-report-title" className="mt-2 text-2xl font-bold text-forest">Portfolio snapshot</h2><p className="mt-1 text-xs text-muted">Generated {report.generatedAt}</p></div>
        <button type="button" aria-label="Close portfolio report" onClick={onClose} className="rounded-lg p-2 text-muted transition hover:bg-panel2 hover:text-forest"><X size={19}/></button>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Total portfolio value', money(report.portfolioValue), 'text-forest'],
          ['Total invested', money(report.invested), 'text-forest'],
          ['Profit / loss', `${report.pnl >= 0 ? '+' : '-'}${money(Math.abs(report.pnl))}`, profitClass],
          ["Today's change", `${report.todayChange >= 0 ? '+' : '-'}${money(Math.abs(report.todayChange))}`, report.todayChange >= 0 ? 'text-forest' : 'text-rose-500']
        ].map(([label, value, color])=><div key={label} className="rounded-xl border border-line bg-panel2 p-4"><p className="text-[10px] text-muted">{label}</p><p className={`mt-2 text-base font-bold ${color}`}>{value}</p></div>)}
      </div>
      <div className="mt-7">
        <div className="mb-3 flex items-end justify-between gap-3"><div><h3 className="font-bold text-forest">Holdings</h3><p className="mt-1 text-[10px] text-muted">{report.holdings.length} positions · illustrative data</p></div><span className="text-[10px] text-muted">Overall return {report.returnPercent >= 0 ? '+' : ''}{report.returnPercent.toFixed(2)}%</span></div>
        <div className="overflow-x-auto rounded-xl border border-line"><table className="w-full min-w-[640px] text-left text-xs"><thead className="bg-panel2 text-[10px] uppercase tracking-wider text-muted"><tr>{['Stock','Qty','Avg. price','LTP','Market value','P&L'].map(label=><th key={label} className="px-4 py-3 font-semibold">{label}</th>)}</tr></thead><tbody>{report.holdings.map(holding=><tr key={holding.symbol} className="border-t border-line"><td className="px-4 py-3"><p className="font-bold text-forest">{holding.symbol}</p><p className="mt-1 text-[10px] text-muted">{holding.name}</p></td><td className="px-4 py-3 text-forest">{holding.qty}</td><td className="px-4 py-3 text-forest">{money(holding.avg)}</td><td className="px-4 py-3 text-forest">{money(holding.ltp)}</td><td className="px-4 py-3 text-forest">{money(holding.marketValue)}</td><td className={`px-4 py-3 font-semibold ${holding.pnl>=0?'text-forest':'text-rose-500'}`}>{holding.pnl>=0?'+':'-'}{money(Math.abs(holding.pnl))}</td></tr>)}</tbody></table></div>
      </div>
      <div className="mt-6"><h3 className="font-bold text-forest">Performance history</h3><div className="mt-3 flex flex-wrap gap-2">{report.performance.map(point=><div key={point.month} className="rounded-lg border border-line bg-panel2 px-3 py-2"><span className="text-[9px] text-muted">{point.month}</span><span className="ml-2 text-xs font-bold text-forest">{point.value.toFixed(1)}%</span></div>)}</div></div>
      <p className="mt-6 rounded-xl border border-amber-300/15 bg-amber-300/[.04] p-3 text-[10px] leading-5 text-muted">Demo report only. Prices, holdings, P&amp;L, and performance are illustrative sample data and are not investment advice.</p>
      {error&&<p role="alert" className="mt-3 text-xs text-rose-300">{error}</p>}
      {downloaded&&<p role="status" className="mt-3 text-xs text-mint">PDF download started.</p>}
      <div className="mt-5 flex flex-wrap justify-end gap-3"><button type="button" onClick={onClose} className="rounded-xl border border-line px-5 py-3 text-xs font-semibold text-forest transition hover:border-mint/40">Close</button><button type="button" onClick={onDownload} disabled={downloading} className="rounded-xl bg-mint px-5 py-3 text-xs font-bold text-ink transition hover:brightness-110 disabled:cursor-wait disabled:opacity-60"><ExternalLink className="mr-2 inline" size={14}/>{downloading?'Preparing PDF…':'Download PDF'}</button></div>
    </section>
  </div>
}

const DEMO_USERNAME = 'demo@tradesha.in'
const DEMO_PASSWORD = 'TradeSha123!'

function AccountScreen({ mode, onModeChange, profile, onLogin, onSignup, onSaveProfile, onLogout, onHome }) {
  const [username, setUsername] = useState(DEMO_USERNAME)
  const [password, setPassword] = useState(DEMO_PASSWORD)
  const [signupName, setSignupName] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [formError, setFormError] = useState('')
  const [saved, setSaved] = useState(false)
  const [details, setDetails] = useState(profile)

  const updateDetail = event => {
    const { name, value } = event.target
    setDetails(current => ({ ...current, [name]: value }))
    setSaved(false)
  }
  const submitLogin = event => {
    event.preventDefault()
    if (username.trim().toLowerCase() !== DEMO_USERNAME || password !== DEMO_PASSWORD) {
      setFormError('Those demo credentials do not match. Use the sample account shown below.')
      return
    }
    setFormError('')
    onLogin({ name: 'Demo Investor', email: DEMO_USERNAME })
  }
  const submitSignup = event => {
    event.preventDefault()
    if (signupPassword.length < 8) {
      setFormError('Use at least 8 characters for this temporary demo password.')
      return
    }
    setFormError('')
    onSignup({ name: signupName.trim(), email: signupEmail.trim() })
  }
  const saveProfile = event => {
    event.preventDefault()
    onSaveProfile(details)
    setSaved(true)
  }

  return <div className="min-h-screen bg-ink text-forest">
    <header className="border-b border-line bg-ink/90">
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 lg:px-8">
        <Logo/>
        {mode === 'profile'
          ? <div className="flex shrink-0 items-center gap-1 sm:gap-2"><button type="button" aria-label="Return to dashboard" onClick={onHome} className="inline-flex items-center gap-1 rounded-lg px-2 py-2 text-xs font-semibold text-muted transition hover:text-forest sm:gap-2 sm:px-3"><ArrowLeft size={14}/><span className="hidden sm:inline">Dashboard</span></button><button type="button" aria-label="Log out" onClick={onLogout} className="inline-flex items-center gap-1 rounded-lg border border-line px-2 py-2 text-xs font-semibold text-muted transition hover:border-rose-400/40 hover:text-rose-300 sm:gap-2 sm:px-4"><LogOut size={15}/><span className="hidden sm:inline">Log out</span></button></div>
          : <button type="button" onClick={onHome} className="inline-flex items-center gap-2 text-xs font-semibold text-muted transition hover:text-forest"><ArrowLeft size={15}/> Back to markets</button>}
      </div>
    </header>
    <main className="hero-grid flex min-h-[calc(100vh-76px)] items-center px-5 py-12">
      <div className={`mx-auto grid w-full max-w-5xl gap-8 ${mode === 'profile' ? 'lg:grid-cols-[.8fr_1.2fr]' : 'lg:grid-cols-[.9fr_1.1fr]'}`}>
        <aside className="flex flex-col justify-between rounded-3xl border border-mint/15 bg-panel p-7 sm:p-9">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-mint/20 bg-mint/[.07] px-3 py-1.5 text-[10px] font-bold tracking-wider text-mint"><ShieldCheck size={14}/> FRONTEND DEMO ACCOUNT</span>
            <h1 className="mt-7 text-3xl font-bold leading-tight text-forest sm:text-4xl">{mode === 'profile' ? 'Your investor profile.' : mode === 'signup' ? 'Start your demo journey.' : 'Welcome back to your markets.'}</h1>
            <p className="mt-4 text-sm leading-6 text-muted">{mode === 'profile' ? 'Review and update the profile details for this temporary demo session.' : 'Explore the dashboard with a simulated account. No brokerage account or real orders are involved.'}</p>
          </div>
          {mode !== 'profile'&&<div className="mt-8 rounded-2xl border border-line bg-ink/70 p-5">
            <p className="text-[10px] font-bold uppercase tracking-[.18em] text-mint">Sample login</p>
            <p className="mt-3 text-xs text-muted">Username</p><p className="mt-1 break-all font-mono text-sm text-forest">{DEMO_USERNAME}</p>
            <p className="mt-3 text-xs text-muted">Password</p><p className="mt-1 font-mono text-sm text-forest">{DEMO_PASSWORD}</p>
            <p className="mt-4 text-[10px] leading-5 text-muted">These public demo credentials are not secure and must not be reused on other sites.</p>
          </div>}
          {mode === 'profile'&&<div className="mt-8 rounded-2xl border border-line bg-ink/70 p-5"><p className="text-[10px] font-bold uppercase tracking-[.18em] text-mint">Session status</p><p className="mt-3 text-sm font-semibold text-forest">Demo session active</p><p className="mt-1 text-xs leading-5 text-muted">Profile details are held only in page memory and clear when you log out or reload.</p></div>}
        </aside>
        <section className="rounded-3xl border border-line bg-panel p-6 shadow-2xl sm:p-9">
          {mode === 'profile' ? <>
            <div className="mb-7 flex items-center gap-4"><span className="grid h-14 w-14 place-items-center rounded-2xl bg-mint/10 text-mint"><UserRound size={26}/></span><div><p className="text-xs text-muted">ACCOUNT PROFILE</p><h2 className="mt-1 text-xl font-bold text-forest">{details.name || details.email}</h2><p className="mt-1 text-xs text-muted">{details.email}</p></div></div>
            <form onSubmit={saveProfile} className="space-y-4">
              <label className="block text-xs font-semibold text-muted">Full name<input name="name" autoComplete="name" value={details.name} onChange={updateDetail} className="field mt-2" placeholder="Your name"/></label>
              <label className="block text-xs font-semibold text-muted">Email / username<input value={details.email} readOnly className="field mt-2 cursor-not-allowed opacity-70"/></label>
              <label className="block text-xs font-semibold text-muted">Phone number <span className="font-normal">(optional)</span><span className="relative mt-2 block"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={15}/><input name="phone" type="tel" autoComplete="tel" value={details.phone} onChange={updateDetail} className="field pl-10" placeholder="+91 00000 00000"/></span></label>
              <label className="block text-xs font-semibold text-muted">City <span className="font-normal">(optional)</span><span className="relative mt-2 block"><MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={15}/><input name="city" autoComplete="address-level2" value={details.city} onChange={updateDetail} className="field pl-10" placeholder="City"/></span></label>
              <label className="block text-xs font-semibold text-muted">Investing experience<select name="experience" value={details.experience} onChange={updateDetail} className="field mt-2"><option value="">Select an option</option><option>Just exploring</option><option>New investor</option><option>Some experience</option><option>Experienced</option></select></label>
              <button type="submit" className="w-full rounded-xl bg-mint py-3.5 text-sm font-bold text-ink transition hover:brightness-110"><Check className="mr-2 inline" size={16}/>{saved?'Profile saved':'Save profile details'}</button>
              {saved&&<p role="status" className="text-center text-xs text-mint">Profile updated for this demo session.</p>}
            </form>
          </> : <>
            <div className="mb-6 flex rounded-xl bg-ink p-1" aria-label="Account screen">
              <button type="button" aria-pressed={mode==='login'} onClick={()=>{setFormError('');onModeChange('login')}} className={`flex-1 rounded-lg py-2.5 text-xs font-bold transition ${mode==='login'?'bg-panel2 text-forest':'text-muted hover:text-forest'}`}>Log in</button>
              <button type="button" aria-pressed={mode==='signup'} onClick={()=>{setFormError('');onModeChange('signup')}} className={`flex-1 rounded-lg py-2.5 text-xs font-bold transition ${mode==='signup'?'bg-panel2 text-forest':'text-muted hover:text-forest'}`}>Sign up</button>
            </div>
            {mode==='login' ? <form onSubmit={submitLogin} className="space-y-4">
              <div><h2 className="text-2xl font-bold text-forest">Log in</h2><p className="mt-2 text-xs leading-5 text-muted">Use the sample credentials or switch to sign up for a temporary profile.</p></div>
              <label className="block text-xs font-semibold text-muted">Username / email<span className="relative mt-2 block"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={15}/><input required autoComplete="username" value={username} onChange={event=>setUsername(event.target.value)} className="field pl-10"/></span></label>
              <label className="block text-xs font-semibold text-muted">Password<span className="relative mt-2 block"><LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={15}/><input required type="password" autoComplete="current-password" value={password} onChange={event=>setPassword(event.target.value)} className="field pl-10"/></span></label>
              {formError&&<p role="alert" className="text-xs text-rose-300">{formError}</p>}
              <button type="submit" className="w-full rounded-xl bg-mint py-3.5 text-sm font-bold text-ink transition hover:brightness-110">Log in to demo <ArrowRight className="ml-1 inline" size={15}/></button>
            </form> : <form onSubmit={submitSignup} className="space-y-4">
              <div><h2 className="text-2xl font-bold text-forest">Create a demo profile</h2><p className="mt-2 text-xs leading-5 text-muted">No account is created on a server. Credentials are used only for this page session.</p></div>
              <label className="block text-xs font-semibold text-muted">Full name<input required autoComplete="name" value={signupName} onChange={event=>setSignupName(event.target.value)} className="field mt-2" placeholder="Your name"/></label>
              <label className="block text-xs font-semibold text-muted">Email / username<input required type="email" autoComplete="email" value={signupEmail} onChange={event=>setSignupEmail(event.target.value)} className="field mt-2" placeholder="you@example.com"/></label>
              <label className="block text-xs font-semibold text-muted">Demo password<input required minLength={8} type="password" autoComplete="new-password" value={signupPassword} onChange={event=>setSignupPassword(event.target.value)} className="field mt-2" placeholder="At least 8 characters"/></label>
              {formError&&<p role="alert" className="text-xs text-rose-300">{formError}</p>}
              <button type="submit" className="w-full rounded-xl bg-mint py-3.5 text-sm font-bold text-ink transition hover:brightness-110">Create demo account <ArrowRight className="ml-1 inline" size={15}/></button>
            </form>}
          </>}
        </section>
      </div>
    </main>
  </div>
}

function App() {
  const [introVisible, setIntroVisible] = useState(true)
  const [introLeaving, setIntroLeaving] = useState(false)
  const [marketOpen, setMarketOpen] = useState(isIndianMarketOpen)
  const [watchlist, setWatchlist] = useState(['RELIANCE','TCS','INFY','HDFCBANK'])
  const [search, setSearch] = useState('')
  const [trade, setTrade] = useState(null)
  const [toast, setToast] = useState('')
  const [portfolioReport, setPortfolioReport] = useState(null)
  const [reportDownloading, setReportDownloading] = useState(false)
  const [reportError, setReportError] = useState('')
  const [reportDownloaded, setReportDownloaded] = useState(false)
  const [accountPage, setAccountPage] = useState(null)
  const [demoProfile, setDemoProfile] = useState(null)
  const [footerDialog, setFooterDialog] = useState(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [expandedNews, setExpandedNews] = useState(null)
  const [newsItems, setNewsItems] = useState([])
  const [newsState, setNewsState] = useState('loading')
  const [newsUpdated, setNewsUpdated] = useState(null)
  const [newsError, setNewsError] = useState('')
  const [newsRefresh, setNewsRefresh] = useState(0)
  const [period, setPeriod] = useState('1Y')
  const [watchFilter, setWatchFilter] = useState('All')
  const [orders, setOrders] = useState([])
  const [showAllStocks, setShowAllStocks] = useState(false)

  useEffect(() => {
    let hideTimer
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const exitTimer = window.setTimeout(() => {
      setIntroLeaving(true)
      hideTimer = window.setTimeout(() => setIntroVisible(false), reducedMotion ? 100 : 600)
    }, reducedMotion ? 250 : 2200)
    return () => {
      window.clearTimeout(exitTimer)
      window.clearTimeout(hideTimer)
    }
  }, [])

  const skipIntro = () => {
    setIntroLeaving(true)
    window.setTimeout(() => setIntroVisible(false), 350)
  }

  useEffect(() => {
    const updateMarketStatus = () => setMarketOpen(isIndianMarketOpen())
    const interval = window.setInterval(updateMarketStatus, 60_000)
    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    let active = true
    const loadNews = async () => {
      setNewsState(current => current === 'ready' ? 'refreshing' : 'loading')
      setNewsError('')
      try {
        const response = await fetch(NEWS_FEED_URL, { signal: controller.signal })
        if (!response.ok) throw new Error(`News feed returned ${response.status}`)
        const feed = await response.json()
        if (feed.status !== 'ok' || !Array.isArray(feed.items)) {
          throw new Error(feed.message || 'The news feed returned an invalid response')
        }
        const items = feed.items.flatMap(item => {
          const dateValue = String(item.pubDate || '')
          const date = new Date(/[zZ]|[+-]\d\d:\d\d$/.test(dateValue) ? dateValue : `${dateValue.replace(' ', 'T')}Z`)
          if (!item.title || !item.link || Number.isNaN(date.getTime())) return []
          const storyUrl = new URL(item.link)
          if (storyUrl.protocol !== 'https:') return []
          const title = item.title.replace(/\s[-–—]\s[^–—-]+$/, '').trim()
          const descriptionNode = new DOMParser().parseFromString(item.description || '', 'text/html')
          let description = (descriptionNode.body.textContent || '').replace(/\s+/g, ' ').trim()
          const source = item.title.match(/\s[-–—]\s([^–—-]+)$/)?.[1]?.trim() || 'Google News'
          description = description.replace(title, '').replace(source, '').replace(/^[\s.:–—-]+|[\s.:–—-]+$/g, '').trim()
          return [{
            id: item.link,
            title,
            source,
            description: description || 'This live feed provides current headlines and publication times. Open the publisher’s article for the full report.',
            date,
            category: newsCategory(title),
            link: item.link
          }]
        }).slice(0, 9)
        if (!items.length) throw new Error('No current India market headlines were found')
        if (active) {
          setNewsItems(items)
          setNewsUpdated(new Date())
          setNewsState('ready')
        }
      } catch (error) {
        if (error.name === 'AbortError' || !active) return
        setNewsError('Live headlines are temporarily unavailable. Please try again.')
        setNewsState('error')
      }
    }

    loadNews()
    const interval = window.setInterval(loadNews, 10 * 60_000)
    return () => {
      active = false
      controller.abort()
      window.clearInterval(interval)
    }
  }, [newsRefresh])

  const filteredStocks = useMemo(() => stocks.filter(s => `${s.symbol} ${s.name}`.toLowerCase().includes(search.toLowerCase())), [search])
  const watchStocks = stocks.filter(s => watchlist.includes(s.symbol))
  const visibleWatchStocks = watchStocks.filter(stock => watchFilter === 'All' || (watchFilter === 'Gainers' ? positive(stock.change) : !positive(stock.change)))
  const portfolioValue = portfolio.reduce((sum, p) => sum + p.qty * p.ltp, 0)
  const invested = portfolio.reduce((sum, p) => sum + p.qty * p.avg, 0)
  const pnl = portfolioValue - invested
  const previousCloseValue = portfolio.reduce((sum, holding) => {
    const change = stocks.find(stock => stock.symbol === holding.symbol)?.change ?? 0
    return sum + (holding.qty * holding.ltp) / (1 + change / 100)
  }, 0)
  const todayChange = portfolioValue - previousCloseValue
  const todayChangePercent = previousCloseValue ? (todayChange / previousCloseValue) * 100 : 0
  const visiblePerformance = period === '1M' ? performance.slice(-1) : period === '6M' ? performance.slice(-6) : performance
  const openPortfolioReport = () => {
    setReportError('')
    setReportDownloaded(false)
    setPortfolioReport({
      generatedAt: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' }) + ' IST',
      portfolioValue,
      invested,
      pnl,
      todayChange,
      returnPercent: invested ? pnl / invested * 100 : 0,
      holdings: portfolio.map(holding => ({
        ...holding,
        marketValue: holding.qty * holding.ltp,
        pnl: (holding.ltp - holding.avg) * holding.qty
      })),
      performance: [...performance]
    })
  }
  const downloadPortfolioPdf = async () => {
    if (!portfolioReport || reportDownloading) return
    setReportDownloading(true)
    setReportError('')
    try {
      const { jsPDF } = await import('jspdf')
      const pdf = new jsPDF({ unit: 'mm', format: 'a4' })
      const pageWidth = pdf.internal.pageSize.getWidth()
      const margin = 15
      const right = pageWidth - margin
      const logoResponse = await fetch('/TradeSha%20India.png')
      if (!logoResponse.ok) {
        throw new Error('Unable to load the TradeSha India logo')
      }
      const logoBlob = await logoResponse.blob()
      const logoDataUrl = await new Promise((resolve, reject) => {
        const logoUrl = URL.createObjectURL(logoBlob)
        const image = new Image()
        image.onload = () => {
          try {
            const canvas = document.createElement('canvas')
            canvas.width = 512
            canvas.height = 512
            const context = canvas.getContext('2d')
            if (!context) {
              throw new Error('Unable to prepare the TradeSha India logo')
            }
            context.drawImage(image, 0, 0, canvas.width, canvas.height)
            URL.revokeObjectURL(logoUrl)
            resolve(canvas.toDataURL('image/png'))
          } catch (error) {
            URL.revokeObjectURL(logoUrl)
            reject(error)
          }
        }
        image.onerror = () => {
          URL.revokeObjectURL(logoUrl)
          reject(new Error('Unable to read the TradeSha India logo'))
        }
        image.src = logoUrl
      })
      const dateLabel = portfolioReport.generatedAt.replace(/[,:]/g, '').replace(/\s+/g, '-')
      const pdfMoney = amount => money(amount).replace('₹', 'INR ')
      const addHeading = (title, y) => {
        pdf.setFont('helvetica', 'bold')
        pdf.setFontSize(11)
        pdf.setTextColor(10, 30, 45)
        pdf.text(title, margin, y)
        return y + 7
      }
      const addLine = (label, value, x, y, width = 42) => {
        pdf.setFont('helvetica', 'normal')
        pdf.setFontSize(7)
        pdf.setTextColor(100, 116, 139)
        pdf.text(label, x, y)
        pdf.setFont('helvetica', 'bold')
        pdf.setFontSize(10)
        pdf.setTextColor(10, 30, 45)
        pdf.text(value, x, y + 6)
        return width
      }
      const drawPageHeader = () => {
        pdf.setFillColor(7, 17, 31)
        pdf.rect(0, 0, pageWidth, 39, 'F')
        pdf.addImage(logoDataUrl, 'PNG', margin, 5, 28, 28)
        pdf.setTextColor(39, 214, 161)
        pdf.setFont('helvetica', 'bold')
        pdf.setFontSize(9)
        pdf.text('TRADESHA INDIA', margin + 34, 13)
        pdf.setTextColor(255, 255, 255)
        pdf.setFontSize(20)
        pdf.text('Portfolio snapshot', margin + 34, 24)
        pdf.setTextColor(175, 190, 205)
        pdf.setFontSize(8)
        pdf.text(`Generated ${portfolioReport.generatedAt}`, margin + 34, 33)
      }
      drawPageHeader()

      let y = 50
      y = addHeading('PORTFOLIO SUMMARY', y)
      const metricWidth = (pageWidth - margin * 2) / 4
      const metrics = [
        ['Portfolio value', pdfMoney(portfolioReport.portfolioValue)],
        ['Total invested', pdfMoney(portfolioReport.invested)],
        ['Profit / loss', `${portfolioReport.pnl>=0?'+':'-'}${pdfMoney(Math.abs(portfolioReport.pnl))}`],
        ["Today's change", `${portfolioReport.todayChange>=0?'+':'-'}${pdfMoney(Math.abs(portfolioReport.todayChange))}`]
      ]
      metrics.forEach(([label, value], index) => addLine(label, value, margin + metricWidth * index, y, metricWidth))
      y += 23
      y = addHeading('HOLDINGS', y)
      const columns = [
        { label: 'STOCK', x: margin, align: 'left' },
        { label: 'QTY', x: 83, align: 'right' },
        { label: 'AVG (INR)', x: 111, align: 'right' },
        { label: 'LTP (INR)', x: 137, align: 'right' },
        { label: 'VALUE (INR)', x: 165, align: 'right' },
        { label: 'P&L (INR)', x: right, align: 'right' }
      ]
      const drawTableHeader = () => {
        pdf.setFillColor(239, 246, 249)
        pdf.rect(margin, y - 5, pageWidth - margin * 2, 9, 'F')
        pdf.setFont('helvetica', 'bold')
        pdf.setFontSize(7)
        pdf.setTextColor(71, 85, 105)
        columns.forEach(column => pdf.text(column.label, column.x, y, { align: column.align }))
        y += 10
      }
      drawTableHeader()
      portfolioReport.holdings.forEach(holding => {
        if (y > 255) {
          pdf.addPage()
          drawPageHeader()
          y = 50
          drawTableHeader()
        }
        pdf.setFont('helvetica', 'bold')
        pdf.setFontSize(8)
        pdf.setTextColor(10, 30, 45)
        pdf.text(holding.symbol, margin, y)
        pdf.setFont('helvetica', 'normal')
        pdf.setFontSize(6)
        pdf.setTextColor(100, 116, 139)
        pdf.text(holding.name.slice(0, 28), margin, y + 4)
        pdf.setFontSize(8)
        pdf.setTextColor(10, 30, 45)
        pdf.text(String(holding.qty), 83, y, { align: 'right' })
        pdf.text(holding.avg.toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2}), 111, y, { align: 'right' })
        pdf.text(holding.ltp.toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2}), 137, y, { align: 'right' })
        pdf.text(holding.marketValue.toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2}), 165, y, { align: 'right' })
        pdf.setTextColor(holding.pnl >= 0 ? 5 : 200, holding.pnl >= 0 ? 150 : 50, holding.pnl >= 0 ? 105 : 70)
        pdf.text(`${holding.pnl>=0?'+':'-'}${Math.abs(holding.pnl).toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2})}`, right, y, { align: 'right' })
        y += 12
      })
      y += 5
      y = addHeading('PERFORMANCE HISTORY · SAMPLE RETURNS', y)
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(8)
      pdf.setTextColor(10, 30, 45)
      pdf.text(portfolioReport.performance.map(point => `${point.month}: ${point.value.toFixed(1)}%`).join('     '), margin, y, { maxWidth: pageWidth - margin * 2 })
      y += 12
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(8)
      pdf.setTextColor(10, 30, 45)
      pdf.text(`Overall return: ${portfolioReport.returnPercent >= 0 ? '+' : ''}${portfolioReport.returnPercent.toFixed(2)}%`, margin, y)
      y += 8
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(7)
      pdf.setTextColor(100, 116, 139)
      const disclaimer = 'Demo report only. Prices, holdings, P&L, and performance are illustrative sample data and are not investment advice.'
      pdf.text(pdf.splitTextToSize(disclaimer, pageWidth - margin * 2), margin, y)
      const blob = pdf.output('blob')
      if (blob.type !== 'application/pdf' || blob.size < 100) {
        throw new Error('The generated PDF is empty or invalid')
      }
      const downloadUrl = URL.createObjectURL(blob)
      const downloadLink = document.createElement('a')
      downloadLink.href = downloadUrl
      downloadLink.download = `tradesha-portfolio-${dateLabel}.pdf`
      document.body.appendChild(downloadLink)
      downloadLink.click()
      downloadLink.remove()
      window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000)
      setReportDownloaded(true)
    } catch (error) {
      console.error('Unable to generate portfolio PDF', error)
      setReportError('The PDF could not be generated. Please try again.')
    } finally {
      setReportDownloading(false)
    }
  }

  const notify = message => { setToast(message); window.setTimeout(() => setToast(''), 3000) }
  const confirmTrade = order => {
    setOrders(prev => [order, ...prev])
    setTrade(null)
    notify(`${order.side} order placed successfully (demo).`)
  }
  const loginDemo = profile => {
    setDemoProfile({ ...profile, phone: '', city: '', experience: '' })
    setAccountPage('profile')
  }
  const signupDemo = profile => {
    setDemoProfile({ ...profile, phone: '', city: '', experience: '' })
    setAccountPage('profile')
  }
  const logoutDemo = () => {
    setDemoProfile(null)
    setAccountPage(null)
    notify('You have logged out of the demo account.')
  }
  const navItems = ['Home','Markets','Stocks','Portfolio','Watchlist','About']
  const nav = <>{navItems.map(item => <a key={item} href={`#${item.toLowerCase()}`} onClick={() => setMobileOpen(false)} className="text-sm font-medium text-muted transition hover:text-forest">{item}</a>)}</>

  if (accountPage) return <AccountScreen
    key={`${accountPage}:${demoProfile?.email ?? ''}`}
    mode={accountPage}
    onModeChange={setAccountPage}
    profile={demoProfile}
    onLogin={loginDemo}
    onSignup={signupDemo}
    onSaveProfile={setDemoProfile}
    onLogout={logoutDemo}
    onHome={() => setAccountPage(null)}
  />

  return <div className="min-h-screen overflow-hidden bg-ink text-forest">
    {introVisible&&<PageIntro leaving={introLeaving} onSkip={skipIntro}/>}
    <header className="sticky top-0 z-40 border-b border-line bg-ink/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 lg:px-8"><Logo/>
        <nav className="hidden items-center gap-7 lg:flex">{nav}</nav>
        <div className="hidden items-center gap-3 sm:flex">{demoProfile?<><button onClick={()=>setAccountPage('profile')} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-muted transition hover:text-forest"><UserRound size={15}/>{demoProfile.name||demoProfile.email}</button><button onClick={logoutDemo} className="rounded-lg border border-line px-4 py-2 text-sm font-semibold text-muted transition hover:border-rose-400/40 hover:text-rose-300">Log out</button></>:<><button onClick={() => setAccountPage('login')} className="rounded-lg px-4 py-2 text-sm font-semibold text-muted hover:text-forest">Log in</button><button onClick={() => setAccountPage('signup')} className="rounded-lg bg-mint px-5 py-2.5 text-sm font-bold text-ink transition hover:shadow-glow">Sign up <ArrowRight className="ml-1 inline" size={15}/></button></>}</div>
        <button className="rounded-lg p-2 text-forest lg:hidden" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle navigation" aria-expanded={mobileOpen} aria-controls="mobile-navigation">{mobileOpen ? <X/> : <Menu/>}</button>
      </div>
      {mobileOpen && <div id="mobile-navigation" className="border-t border-line bg-panel px-5 py-5 lg:hidden"><nav className="flex flex-col gap-5">{nav}</nav><div className="mt-5 flex gap-3">{demoProfile?<><button onClick={()=>{setMobileOpen(false);setAccountPage('profile')}} className="rounded-lg border border-line px-4 py-2 text-sm">My profile</button><button onClick={logoutDemo} className="rounded-lg border border-line px-4 py-2 text-sm">Log out</button></>:<><button onClick={() => {setMobileOpen(false);setAccountPage('login')}} className="rounded-lg border border-line px-4 py-2 text-sm">Log in</button><button onClick={() => {setMobileOpen(false);setAccountPage('signup')}} className="rounded-lg bg-mint px-4 py-2 text-sm font-bold text-ink">Sign up</button></>}</div></div>}
    </header>

    <main>
      <section id="home" className="hero-grid relative">
        <div className="hero-glow pointer-events-none absolute -right-24 top-0 h-[450px] w-[450px] rounded-full bg-mint/10 blur-[120px]"/>
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 md:py-28 lg:grid-cols-[1.05fr_.95fr] lg:px-8">
          <div><div className="mb-6 inline-flex items-center gap-2 rounded-full border border-mint/20 bg-mint/[.07] px-3 py-2 text-[11px] font-semibold tracking-wide text-mint"><span className="h-2 w-2 animate-pulse rounded-full bg-mint"/> YOUR GATEWAY TO INDIAN MARKETS</div>
            <h1 className="max-w-2xl text-5xl font-extrabold leading-[1.08] tracking-tight text-forest sm:text-6xl xl:text-7xl">Make your money <span className="text-mint">move</span> with confidence.</h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-muted sm:text-lg">Explore the markets, track your investments, and make informed decisions with one powerful trading dashboard.</p>
            <div className="mt-9 flex flex-wrap gap-3"><a href="#markets" className="rounded-xl bg-mint px-6 py-3.5 text-sm font-bold text-ink transition hover:-translate-y-1 hover:shadow-glow">Explore markets <ArrowRight className="ml-2 inline" size={16}/></a><a href="#portfolio" className="rounded-xl border border-line bg-panel px-6 py-3.5 text-sm font-semibold text-forest transition hover:border-mint/50">View portfolio</a></div>
            <div className="mt-12 flex flex-wrap gap-8 border-t border-line pt-7"><div><p className="text-2xl font-bold text-forest">₹0<span className="text-mint">*</span></p><p className="mt-1 text-xs text-muted">Demo account fees</p></div><div><p className="text-2xl font-bold text-forest">NSE <span className="text-mint">+</span> BSE</p><p className="mt-1 text-xs text-muted">Indian exchanges</p></div><div><p className="text-2xl font-bold text-forest">24/7</p><p className="mt-1 text-xs text-muted">Portfolio access</p></div></div>
          </div>
          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute -inset-5 rounded-[32px] bg-mint/10 blur-2xl"/>
            <div className="relative rounded-2xl border border-line bg-panel/95 p-5 shadow-2xl sm:p-7">
              <div className="flex items-center justify-between"><div><p className="text-xs text-muted">Your portfolio value</p><p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">₹12,48,560<span className="text-mint">.80</span></p></div><span className="rounded-lg bg-mint/10 p-3 text-mint"><Wallet size={23}/></span></div>
              <div className="mt-3 flex items-center gap-2"><Change value="2.84"/><span className="text-xs text-muted">today's return</span></div>
              <div className="market-chart mt-7 h-44"><ResponsiveContainer width="100%" height="100%"><AreaChart data={performance}><defs><linearGradient id="heroFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#a9472f" stopOpacity={.28}/><stop offset="100%" stopColor="#a9472f" stopOpacity={0}/></linearGradient></defs><Area type="monotone" dataKey="value" stroke="#a9472f" strokeWidth={3} fill="url(#heroFill)"/><Tooltip contentStyle={{background:'#fffdf8',border:'1px solid #ded3c1',borderRadius:12,color:'#244436'}} formatter={v => [`${v}%`, 'Return']}/><XAxis dataKey="month" tick={{fill:'#756e61',fontSize:11}} axisLine={false} tickLine={false}/></AreaChart></ResponsiveContainer></div>
              <div className="mt-4 grid grid-cols-3 gap-3">{[['Invested','₹10.8L'],['Returns','+₹1.68L'],['Day P&L','+₹8,420']].map(([k,v])=><div key={k} className="rounded-xl bg-panel2 p-3"><p className="text-[10px] text-muted">{k}</p><p className="mt-1 text-sm font-bold text-forest">{v}</p></div>)}</div>
            </div>
            <div className="hero-float absolute -left-7 top-20 hidden items-center gap-3 rounded-xl border border-line bg-panel p-3 shadow-xl sm:flex"><span className="rounded-lg bg-mint/10 p-2 text-mint"><TrendingUp size={18}/></span><div><p className="text-[10px] text-muted">Market sentiment</p><p className="text-xs font-bold text-forest">Bullish today</p></div></div>
            <div className="hero-float-delayed absolute -bottom-7 -right-3 z-10 hidden items-center gap-4 rounded-xl border border-line bg-panel p-4 shadow-xl lg:flex"><div><p className="text-[10px] font-semibold tracking-wide text-muted">NIFTY 50 · INDICATIVE</p><p className="mt-1 text-lg font-bold text-forest">{indices[0].value}</p><Change value={indices[0].change.replace('%','')}/></div><MiniChart points={indices[0].points}/></div>
          </div>
        </div>
      </section>

      <section id="markets" className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
        <SectionTitle eyebrow="THE BIG PICTURE" title="Market overview" action={<span className="flex items-center gap-2 text-xs text-muted"><span className="h-2 w-2 rounded-full bg-mint"/> Sample market data</span>}/>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{indices.map(idx=><div key={idx.name} className="card group rounded-2xl border border-line bg-panel p-5 transition hover:-translate-y-1 hover:border-mint/40"><div className="flex items-start justify-between"><div><p className="text-xs font-semibold tracking-wide text-muted">{idx.name}</p><p className="mt-3 text-2xl font-bold text-forest" aria-label={`${idx.name} indicative value ${money(Number(idx.value.replaceAll(',', '')))}`}>{idx.value}</p><div className="mt-2"><Change value={idx.change.replace('%','')}/></div></div><div className={`rounded-xl p-2.5 ${positive(idx.change) ? 'bg-forest/10 text-forest' : 'bg-rose-400/10 text-rose-400'}`}><LineChart size={19}/></div></div><div className="mt-4 flex items-center justify-between"><MiniChart points={idx.points} down={!positive(idx.change)}/><span className="text-[10px] text-muted">NSE · Indicative</span></div></div>)}</div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-panel/60 px-5 py-3"><div className="flex items-center gap-2 text-xs text-muted"><Clock3 size={15}/> Market hours: Mon–Fri, 9:15 AM – 3:30 PM IST</div><div className="flex flex-wrap items-center gap-3"><span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-bold ${marketOpen ? 'bg-forest/10 text-forest' : 'bg-panel2 text-muted'}`} role="status"><span className={`h-2 w-2 rounded-full ${marketOpen ? 'animate-pulse bg-forest' : 'bg-muted'}`}/> MARKET {marketOpen ? 'OPEN' : 'CLOSED'} · DEMO</span><span className="text-[10px] text-muted">Weekday hours only · holidays not reflected</span></div></div>
      </section>

      <section id="stocks" className="bg-ink py-16"><div className="mx-auto max-w-7xl px-5 lg:px-8">
        <SectionTitle eyebrow="FIND YOUR NEXT OPPORTUNITY" title="Trending stocks" action={<div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16}/><input aria-label="Search trending stocks" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search stocks..." className="w-48 rounded-lg border border-line bg-panel py-2.5 pl-9 pr-3 text-xs text-forest outline-none transition focus:border-mint sm:w-60"/></div>}/>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted"><span>{filteredStocks.length} NSE-listed companies · Prices in INR</span><span>Indicative demo data · Not live quotes</span></div>
        <div className="overflow-hidden rounded-2xl border border-line bg-panel"><div className="hidden grid-cols-[1.5fr_1fr_1fr_.8fr_1fr] gap-4 border-b border-line px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted md:grid"><span>Company</span><span>Price (INR)</span><span>Today's change</span><span>Trend</span><span className="text-right">Action</span></div>
          {(showAllStocks ? filteredStocks : filteredStocks.slice(0,5)).map(stock=><div key={stock.symbol} className="grid gap-3 border-b border-line px-5 py-4 last:border-0 hover:bg-panel2/50 md:grid-cols-[1.5fr_1fr_1fr_.8fr_1fr] md:items-center md:gap-4 md:px-6"><div className="flex items-center gap-3"><span role="img" aria-label={`${stock.name} logo`} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-xs font-black text-ink" style={{background:stock.color}}>{stock.symbol.slice(0,2)}</span><div><p className="text-sm font-bold text-forest">{stock.symbol}</p><p className="text-[11px] text-muted">{stock.name}</p></div></div><div className="flex justify-between md:block"><span className="text-[10px] text-muted md:hidden">Price</span><span className="text-sm font-semibold text-forest">{money(stock.price)}</span></div><div className="flex justify-between md:block"><span className="text-[10px] text-muted md:hidden">Change</span><Change value={stock.change}/></div><div className="hidden md:block"><MiniChart points={[20,24,22,30,28,35,33,42,39,48]} down={!positive(stock.change)}/></div><div className="flex gap-2 md:justify-end"><button aria-label={`Buy ${stock.symbol}`} onClick={()=>setTrade({stock,side:'Buy'})} className="flex-1 rounded-lg bg-mint px-3 py-2 text-xs font-bold text-ink transition hover:brightness-110 md:flex-none">Buy</button><button aria-label={`Sell ${stock.symbol}`} onClick={()=>setTrade({stock,side:'Sell'})} className="flex-1 rounded-lg border border-line px-3 py-2 text-xs font-bold text-forest transition hover:border-rose-400 hover:text-rose-400 md:flex-none">Sell</button><button aria-label={`${watchlist.includes(stock.symbol)?'Remove':'Add'} ${stock.symbol} ${watchlist.includes(stock.symbol)?'from':'to'} watchlist`} aria-pressed={watchlist.includes(stock.symbol)} onClick={()=>setWatchlist(w=>w.includes(stock.symbol)?w.filter(x=>x!==stock.symbol):[...w,stock.symbol])} className={`rounded-lg border px-3 py-2 ${watchlist.includes(stock.symbol)?'border-mint/30 text-mint':'border-line text-muted hover:text-mint'}`}><Eye size={15}/></button></div></div>)}
          {filteredStocks.length===0&&<p className="p-8 text-center text-sm text-muted">No stocks found. Try another search.</p>}
        </div>
        <div className="mt-4 text-center"><button onClick={()=>setShowAllStocks(!showAllStocks)} className="text-xs font-semibold text-mint hover:text-forest">{showAllStocks?'Show fewer stocks':'View all stocks'} <ArrowRight className="ml-1 inline" size={14}/></button></div>
      </div></section>

      <section id="portfolio" className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <SectionTitle eyebrow="YOUR MONEY, AT A GLANCE" title="Portfolio dashboard" action={<button onClick={openPortfolioReport} className="rounded-lg border border-line px-4 py-2 text-xs font-semibold text-forest transition hover:border-mint hover:text-mint">Export report ↓</button>}/>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[['Total portfolio value',money(portfolioValue),Wallet],['Total invested',money(invested),CircleDollarSign],['Profit / loss',`${pnl>=0?'+':'-'}${money(Math.abs(pnl))}`,TrendingUp],["Today's change",`${todayChange>=0?'+':'-'}${money(Math.abs(todayChange))}`,Activity]].map(([label,value,Icon],i)=><div key={label} className="rounded-2xl border border-line bg-panel p-5"><div className="flex justify-between"><p className="text-xs text-muted">{label}</p><Icon size={18} className={i===2?(pnl>=0?'text-forest':'text-rose-500'):i===3?(todayChange>=0?'text-forest':'text-rose-500'):'text-mint'}/></div><p className={`mt-4 text-xl font-bold ${i===2?(pnl>=0?'text-forest':'text-rose-500'):i===3?(todayChange>=0?'text-forest':'text-rose-500'):'text-forest'}`}>{value}</p><p className="mt-2 text-[11px] text-muted">{i===2?`${((pnl/invested)*100).toFixed(2)}% overall return`:i===3?`${todayChangePercent>=0?'+':''}${todayChangePercent.toFixed(2)}% estimated · demo`:'Sample portfolio data · demo'}</p></div>)}
        </div>
        <div className="mt-5 grid gap-5 lg:grid-cols-[1.4fr_.9fr]">
          <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-bold text-forest">Portfolio performance</h3><p className="mt-1 text-xs text-muted">Growth of your investment · sample data</p></div><div className="flex gap-1 rounded-lg bg-panel2 p-1" aria-label="Performance chart period">{['1M','6M','1Y','ALL'].map(p=><button key={p} aria-pressed={period===p} onClick={()=>setPeriod(p)} className={`rounded-md px-3 py-1.5 text-[10px] font-bold ${period===p?'bg-mint text-ink':'text-muted hover:text-forest'}`}>{p}</button>)}</div></div><div className="market-chart mt-6 h-64"><ResponsiveContainer width="100%" height="100%"><AreaChart data={visiblePerformance}><defs><linearGradient id="portfolioFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#a9472f" stopOpacity={.24}/><stop offset="100%" stopColor="#a9472f" stopOpacity={0}/></linearGradient></defs><CartesianGrid stroke="#ded3c1" strokeDasharray="3 3" vertical={false}/><XAxis dataKey="month" tick={{fill:'#756e61',fontSize:11}} axisLine={false} tickLine={false}/><YAxis tick={{fill:'#756e61',fontSize:10}} axisLine={false} tickLine={false} tickFormatter={v=>`${v}%`}/><Tooltip contentStyle={{background:'#fffdf8',border:'1px solid #ded3c1',borderRadius:12}} formatter={v=>[`${v}%`,'Return']}/><Area type="monotone" dataKey="value" stroke="#a9472f" strokeWidth={2.5} fill="url(#portfolioFill)"/></AreaChart></ResponsiveContainer></div></div>
          <div className="rounded-2xl border border-line bg-panel p-5 sm:p-6"><h3 className="font-bold text-forest">Asset allocation</h3><p className="mt-1 text-xs text-muted">Your current holdings</p><div className="mt-7 space-y-5">{[['Reliance Industries',34,'bg-mint'],['TCS',26,'bg-blue-400'],['Infosys',22,'bg-violet-400'],['HDFC Bank',18,'bg-amber-400']].map(([name,percent,color])=><div key={name}><div className="mb-2 flex justify-between text-xs"><span className="text-forest">{name}</span><span className="font-bold text-muted">{percent}%</span></div><div className="h-2 overflow-hidden rounded-full bg-panel2"><div className={`h-full rounded-full ${color}`} style={{width:`${percent}%`}}/></div></div>)}</div><div className="mt-7 rounded-xl bg-mint/[.07] p-3 text-xs leading-5 text-muted"><Sparkles className="mr-1 inline text-mint" size={14}/> Diversification can help manage concentration risk. This allocation is illustrative.</div></div>
        </div>
        <div className="mt-5 overflow-hidden rounded-2xl border border-line bg-panel"><div className="border-b border-line px-5 py-4"><h3 className="font-bold text-forest">Your holdings</h3></div><div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left text-xs"><thead className="bg-panel2 text-[10px] uppercase tracking-wider text-muted"><tr>{['Stock','Qty','Avg. price','LTP','Market value','P&L'].map(h=><th key={h} className="px-5 py-3 font-semibold">{h}</th>)}</tr></thead><tbody>{portfolio.map(p=>{const gain=(p.ltp-p.avg)*p.qty;return <tr key={p.symbol} className="border-t border-line"><td className="px-5 py-4"><p className="font-bold text-forest">{p.symbol}</p><p className="mt-1 text-[10px] text-muted">{p.name}</p></td><td className="px-5 py-4 text-forest">{p.qty}</td><td className="px-5 py-4 text-forest">{money(p.avg)}</td><td className="px-5 py-4 text-forest">{money(p.ltp)}</td><td className="px-5 py-4 text-forest">{money(p.qty*p.ltp)}</td><td className={`px-5 py-4 font-semibold ${gain>=0?'text-forest':'text-rose-500'}`}>{gain>=0?'+':''}{money(gain)}</td></tr>})}</tbody></table></div></div>
      </section>

      <section id="watchlist" className="relative overflow-hidden bg-ink py-16">
        <div className="pointer-events-none absolute -left-40 top-10 h-80 w-80 rounded-full bg-mint/[.06] blur-[100px]"/>
        <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
          <SectionTitle eyebrow="YOUR PERSONAL MARKET RADAR" title="Watchlist" action={<button onClick={()=>document.getElementById('stocks').scrollIntoView({behavior:'smooth'})} className="rounded-lg border border-mint/25 bg-mint/[.08] px-4 py-2 text-xs font-bold text-mint transition hover:bg-mint/15"><Plus className="mr-1 inline" size={14}/> Add stocks</button>}/>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-muted">{watchStocks.length} {watchStocks.length === 1 ? 'stock' : 'stocks'} tracked <span className="mx-1 text-line">/</span> indicative demo prices</p>
            <div className="flex gap-1 rounded-xl border border-line bg-panel p-1" aria-label="Filter watchlist">
              {['All','Gainers','Decliners'].map(filter => <button key={filter} aria-pressed={watchFilter === filter} onClick={() => setWatchFilter(filter)} className={`rounded-lg px-3 py-2 text-[10px] font-bold transition ${watchFilter === filter ? 'bg-mint text-ink' : 'text-muted hover:text-forest'}`}>{filter}{filter === 'All' ? ` · ${watchStocks.length}` : ''}</button>)}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleWatchStocks.map(stock => {
              const isUp = positive(stock.change)
              const chartPoints = isUp ? [16,20,19,25,22,32,29,40,37,47] : [45,39,42,33,36,28,31,22,25,18]
              return <article key={stock.symbol} className="group relative overflow-hidden rounded-2xl border border-line bg-panel transition duration-300 hover:-translate-y-1 hover:border-mint/40 hover:shadow-glow">
                <div className={`h-1 w-full ${isUp ? 'bg-gradient-to-r from-mint/20 via-mint to-mint/20' : 'bg-gradient-to-r from-rose-400/20 via-rose-400 to-rose-400/20'}`}/>
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="grid h-11 w-11 place-items-center rounded-xl text-xs font-black text-ink shadow-lg" style={{background:stock.color}} aria-label={`${stock.name} symbol`}>{stock.symbol.slice(0,2)}</span>
                      <div><p className="text-sm font-bold tracking-wide text-forest">{stock.symbol}</p><p className="mt-0.5 text-[10px] text-muted">{stock.name}</p></div>
                    </div>
                    <button aria-label={`Remove ${stock.symbol} from watchlist`} onClick={()=>setWatchlist(w=>w.filter(x=>x!==stock.symbol))} className="rounded-lg border border-transparent p-2 text-muted transition hover:border-rose-400/20 hover:bg-rose-400/10 hover:text-rose-400"><X size={15}/></button>
                  </div>
                  <div className="mt-6 flex items-end justify-between gap-2">
                    <div><p className="text-[10px] font-semibold uppercase tracking-[.15em] text-muted">Last price</p><p className="mt-1 text-2xl font-bold tracking-tight text-forest">{money(stock.price)}</p><span className={`mt-2 inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-bold ${isUp ? 'bg-forest/10 text-forest' : 'bg-rose-400/10 text-rose-400'}`}>{isUp ? <ArrowUpRight size={13}/> : <ArrowDownRight size={13}/>} {isUp ? '+' : ''}{stock.change.toFixed(2)}%</span></div>
                    <div className="text-right"><MiniChart points={chartPoints} down={!isUp}/><p className="mt-1 text-[9px] uppercase tracking-wider text-muted">Today · NSE</p></div>
                  </div>
                  <div className="mt-5 flex gap-2 border-t border-line pt-4">
                    <button aria-label={`Buy ${stock.symbol}`} onClick={()=>setTrade({stock,side:'Buy'})} className="flex-1 rounded-lg bg-mint px-3 py-2.5 text-xs font-bold text-ink transition hover:brightness-110">Buy</button>
                    <button aria-label={`Sell ${stock.symbol}`} onClick={()=>setTrade({stock,side:'Sell'})} className="flex-1 rounded-lg border border-line px-3 py-2.5 text-xs font-bold text-forest transition hover:border-rose-400/50 hover:bg-rose-400/[.06] hover:text-rose-300">Sell</button>
                  </div>
                </div>
              </article>
            })}
            {visibleWatchStocks.length===0&&<div className="col-span-full rounded-2xl border border-dashed border-line bg-panel/60 p-10 text-center"><Eye className="mx-auto mb-3 text-muted" size={25}/><p className="text-sm font-semibold text-forest">{watchStocks.length ? `No ${watchFilter.toLowerCase()} in your watchlist` : 'Your watchlist is waiting'}</p><p className="mt-1 text-xs text-muted">{watchStocks.length ? 'Try another filter to see your tracked stocks.' : 'Add stocks from the market to start tracking price moves.'}</p>{!watchStocks.length&&<button onClick={()=>document.getElementById('stocks').scrollIntoView({behavior:'smooth'})} className="mt-4 rounded-lg bg-mint px-4 py-2 text-xs font-bold text-ink">Browse stocks <ArrowRight className="ml-1 inline" size={13}/></button>}</div>}
          </div>
        </div>
      </section>

      <section id="trade" className="mx-auto max-w-7xl px-5 py-16 lg:px-8"><SectionTitle eyebrow="TRADE WITH CLARITY" title="Quick trade" action={<span className="text-xs text-muted">NSE · Equity · Demo orders</span>}/>
        <div className="grid gap-5 lg:grid-cols-[.9fr_1.1fr]"><div className="rounded-2xl border border-line bg-panel p-6"><div className="mb-5 flex items-center gap-3"><span className="rounded-xl bg-mint/10 p-3 text-mint"><Zap size={21}/></span><div><h3 className="font-bold text-forest">Place an order</h3><p className="text-xs text-muted">Choose a stock to start a demo trade</p></div></div><div className="space-y-2">{stocks.slice(0,4).map(s=><div key={s.symbol} className="flex items-center justify-between rounded-xl bg-panel2 px-4 py-3"><div><p className="text-xs font-bold text-forest">{s.symbol}</p><p className="text-[10px] text-muted">{money(s.price)}</p></div><div className="flex gap-2"><button onClick={()=>setTrade({stock:s,side:'Buy'})} className="rounded-lg bg-mint px-3 py-2 text-[10px] font-bold text-ink">Buy</button><button onClick={()=>setTrade({stock:s,side:'Sell'})} className="rounded-lg border border-line px-3 py-2 text-[10px] font-bold text-forest hover:border-rose-400">Sell</button></div></div>)}</div></div>
          <div className="rounded-2xl border border-line bg-panel p-6"><div className="flex items-center justify-between"><div><h3 className="font-bold text-forest">Recent orders</h3><p className="mt-1 text-xs text-muted">Your demo trading activity</p></div><span className="rounded-lg bg-panel2 p-2 text-muted"><Clock3 size={17}/></span></div>{orders.length===0?<div className="grid min-h-52 place-items-center text-center"><div><div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-panel2 text-muted"><Activity size={21}/></div><p className="text-sm font-semibold text-forest">No orders yet</p><p className="mt-1 text-xs text-muted">Your confirmed demo orders will appear here.</p></div></div>:<div className="mt-5 space-y-3">{orders.slice(0,4).map((o,i)=><div key={i} className="flex items-center justify-between rounded-xl bg-panel2 p-3"><div><p className="text-xs font-bold text-forest">{o.stock.symbol} <span className={o.side==='Buy'?'text-forest':'text-rose-500'}>{o.side}</span></p><p className="mt-1 text-[10px] text-muted">{o.qty} shares · {o.orderType} order</p></div><div className="text-right"><p className="text-xs font-bold text-forest">{money(o.total)}</p><p className="mt-1 text-[10px] text-forest"><Check className="mr-1 inline" size={11}/> Demo confirmed</p></div></div>)}</div>}</div>
        </div>
      </section>

      <section id="about" className="relative overflow-hidden bg-ink py-20">
        <div className="pointer-events-none absolute -left-36 top-20 h-96 w-96 rounded-full bg-mint/[.05] blur-[120px]"/>
        <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
            <div><p className="mb-2 text-[10px] font-bold uppercase tracking-[.22em] text-mint">A CLEARER WAY TO EXPLORE MARKETS</p><h2 className="max-w-xl text-3xl font-bold tracking-tight text-forest sm:text-4xl">Your investing toolkit, <span className="text-mint">all in one view.</span></h2></div>
            <p className="max-w-sm text-sm leading-6 text-muted">From market context to portfolio check-ins, explore the tools that make every next step easier to understand.</p>
          </div>
          <div className="grid items-stretch gap-5 lg:grid-cols-[.9fr_1.1fr]">
            <div className="relative flex min-h-[420px] flex-col overflow-hidden rounded-3xl border border-mint/15 bg-panel p-6 sm:p-8">
              <div className="pointer-events-none absolute -right-8 -top-10 h-64 w-64 rounded-full border border-mint/[.08]"><div className="absolute inset-8 rounded-full border border-mint/[.08]"/><div className="absolute inset-16 rounded-full border border-mint/[.08]"/></div>
              <div className="relative flex items-center justify-between"><span className="inline-flex items-center gap-2 rounded-full border border-mint/20 bg-mint/[.07] px-3 py-1.5 text-[10px] font-bold tracking-wide text-mint"><Activity size={13}/> MARKET WORKSPACE</span><span className="text-[10px] text-muted">INDIA · DEMO</span></div>
              <div className="relative mt-9">
                <p className="text-xs text-muted">NIFTY 50 <span className="mx-1 text-line">/</span> Indicative index</p>
                <div className="mt-2 flex flex-wrap items-end justify-between gap-2"><p className="text-3xl font-bold tracking-tight text-forest sm:text-4xl">{indices[0].value}</p><Change value={indices[0].change.replace('%','')}/></div>
                <div className="mt-5 h-32 overflow-hidden rounded-2xl border border-line bg-panel/70 p-3"><svg viewBox="0 0 500 110" preserveAspectRatio="none" className="market-chart h-full w-full" aria-label="Illustrative rising market trend"><defs><linearGradient id="featureChartFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#a9472f" stopOpacity=".25"/><stop offset="100%" stopColor="#a9472f" stopOpacity="0"/></linearGradient></defs><path d="M0 85 C35 80 38 62 70 70 S110 48 140 58 S180 31 215 47 S265 20 295 33 S330 48 365 27 S420 39 445 16 S480 20 500 7 V110 H0Z" fill="url(#featureChartFill)"/><path className="market-chart-line" d="M0 85 C35 80 38 62 70 70 S110 48 140 58 S180 31 215 47 S265 20 295 33 S330 48 365 27 S420 39 445 16 S480 20 500 7" fill="none" stroke="#a9472f" strokeWidth="3" vectorEffect="non-scaling-stroke"/></svg></div>
              </div>
              <div className="relative mt-auto grid grid-cols-2 gap-3 pt-5 sm:grid-cols-3">
                {[['WATCHLIST',`${watchStocks.length} tracked`],['PORTFOLIO',money(portfolioValue)],['NEWS','Live headlines']].map(([label,value])=><div key={label} className="rounded-xl border border-line bg-panel/80 p-3"><p className="text-[9px] font-bold tracking-[.14em] text-muted">{label}</p><p className="mt-1 truncate text-xs font-bold text-forest">{value}</p></div>)}
              </div>
              <p className="relative mt-4 text-[10px] leading-5 text-muted">Illustrative interface preview. Index and portfolio figures are sample data; market headlines are fetched live.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                [ShieldCheck,'Security-aware by design','Understand what is and isn’t protected: this frontend demo has no accounts, authentication, or broker connection.',''],
                [Globe2,'Market context, at a glance','Compare major Indian indices and see indicative movements together.','markets'],
                [Zap,'Practice the order flow','Preview quantity, price, and order totals before confirming a simulated trade.','trade'],
                [LineChart,'Portfolio analytics','Review holdings, estimated P&L, and selectable performance views.','portfolio'],
                [Eye,'A watchlist that moves with you','Track selected companies, compare daily moves, and filter gainers or decliners.','watchlist'],
                [ExternalLink,'Current market headlines','Catch up on India-market coverage with timestamps and links to publishers.','news']
              ].map(([Icon,title,desc,target])=>{
                const content=<><span className="mb-5 inline-flex rounded-xl border border-mint/15 bg-mint/[.08] p-3 text-mint transition group-hover:border-mint/30 group-hover:bg-mint/15"><Icon size={20}/></span><h3 className="font-bold text-forest transition group-hover:text-mint">{title}</h3><p className="mt-2 text-xs leading-6 text-muted">{desc}</p>{target&&<span className="mt-auto inline-flex items-center gap-1 pt-5 text-[10px] font-bold uppercase tracking-wider text-mint">Explore feature <ArrowRight size={12}/></span>}</>
                return target?<a key={title} href={`#${target}`} className="group flex min-h-44 flex-col rounded-2xl border border-line bg-panel p-5 transition duration-300 hover:-translate-y-1 hover:border-mint/40 hover:shadow-glow">{content}</a>:<div key={title} className="flex min-h-44 flex-col rounded-2xl border border-line bg-panel p-5">{content}</div>
              })}
            </div>
          </div>
          <p className="mt-5 text-[10px] leading-5 text-muted">Security note: TradeSha India here is an educational frontend demo, not a brokerage service. Don’t enter credentials or financial information.</p>
        </div>
      </section>

      <section id="news" className="relative overflow-hidden bg-ink py-16">
        <div className="pointer-events-none absolute -right-36 top-0 h-96 w-96 rounded-full bg-blue-400/[.06] blur-[110px]"/>
        <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
          <SectionTitle eyebrow="THE MARKET, AS IT MOVES" title="India market brief" action={<div className="flex items-center gap-3">
            {newsUpdated&&<span className="hidden text-[10px] text-muted sm:inline">Updated {newsUpdated.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',timeZone:'Asia/Kolkata'})} IST</span>}
            <button type="button" aria-label="Refresh market news" onClick={()=>setNewsRefresh(value=>value+1)} disabled={newsState==='loading'||newsState==='refreshing'} className="inline-flex items-center gap-2 rounded-lg border border-line bg-panel px-3 py-2 text-xs font-semibold text-muted transition hover:border-mint/40 hover:text-mint disabled:opacity-50"><RefreshCw size={14} className={newsState==='loading'||newsState==='refreshing'?'animate-spin':''}/><span>Refresh</span></button>
          </div>}/>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-2 text-[10px] text-muted"><span className="inline-flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${newsState==='ready'?'animate-pulse bg-mint':newsState==='error'?'bg-rose-400':'bg-amber-300'}`}/>{newsState==='ready'?'LIVE NEWS FEED':newsState==='error'?'FEED UNAVAILABLE':newsState==='refreshing'?'UPDATING HEADLINES':'CONNECTING TO NEWS FEED'} <span className="text-line">/</span> Google News · India markets</span><span>Headlines, categories and times in IST · Opens publisher source</span></div>
          {newsError&&<p role="alert" className="mb-4 rounded-lg border border-rose-400/20 bg-rose-400/[.06] px-4 py-3 text-xs text-rose-200">{newsError}</p>}
          {newsItems.length>0&&<div className="grid gap-4 md:grid-cols-3">
            {newsItems.map((item,index)=>{
              const expanded=expandedNews===item.id
              return <article key={item.id} className={`group relative overflow-hidden rounded-2xl border border-line bg-panel transition duration-300 hover:-translate-y-1 hover:border-mint/40 hover:shadow-glow ${index===0?'md:col-span-2':''}`}>
                {index===0&&<div className="pointer-events-none absolute -right-10 -top-14 h-48 w-48 rounded-full border border-mint/[.09]"><div className="absolute inset-5 rounded-full border border-mint/[.08]"/><div className="absolute inset-10 rounded-full border border-mint/[.07]"/></div>}
                <div className={`relative flex h-full flex-col p-5 sm:p-6 ${index===0?'md:p-8':''}`}>
                  <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-2 rounded-md border border-mint/15 bg-mint/[.08] px-2.5 py-1.5 text-[9px] font-bold tracking-[.16em] text-mint">{index===0&&<Activity size={12}/>} {item.category}</span>
                    <span className="text-[10px] font-medium text-muted" title={item.date.toLocaleString('en-IN',{timeZone:'Asia/Kolkata'})}>{newsTime(item.date)} · {item.date.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',timeZone:'Asia/Kolkata'})} IST</span>
                  </div>
                  {index===0&&<p className="mb-3 text-[10px] font-bold uppercase tracking-[.22em] text-blue-300">Today in Indian markets</p>}
                  <h3 className={`font-bold leading-6 text-forest transition group-hover:text-mint ${index===0?'text-xl sm:text-2xl sm:leading-8':'text-base'}`}>{item.title}</h3>
                  <p className="mt-3 text-xs leading-6 text-muted">{expanded?item.description:`${item.description.slice(0,index===0?220:120)}${item.description.length>(index===0?220:120)?'…':''}`}</p>
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
                    <span className="text-[10px] font-semibold text-muted">{item.source}</span>
                    <div className="flex items-center gap-4">
                      <button type="button" aria-expanded={expanded} onClick={()=>setExpandedNews(expanded?null:item.id)} className="text-xs font-bold text-mint transition hover:text-forest">{expanded?'Show less':'Read more'} <ArrowRight className="ml-1 inline" size={13}/></button>
                      <a href={item.link} target="_blank" rel="noopener noreferrer" aria-label={`Read full story from ${item.source}: ${item.title}`} className="inline-flex items-center gap-1 text-xs font-semibold text-forest/80 transition hover:text-mint">Full story <ExternalLink size={12}/></a>
                    </div>
                  </div>
                </div>
              </article>
            })}
          </div>}
          {newsState==='loading'&&<div role="status" className="grid gap-4 md:grid-cols-3">{[0,1,2].map(item=><div key={item} className={`h-56 animate-pulse rounded-2xl border border-line bg-panel ${item===0?'md:col-span-2':''}`}/>)}</div>}
          {newsState==='error'&&newsItems.length===0&&<div className="rounded-2xl border border-dashed border-line bg-panel/60 px-6 py-12 text-center"><Globe2 className="mx-auto mb-3 text-muted" size={25}/><p className="text-sm font-semibold text-forest">Live headlines couldn’t be loaded</p><p className="mt-2 text-xs text-muted">Check your connection and refresh to try the India market feed again.</p><button onClick={()=>setNewsRefresh(value=>value+1)} className="mt-5 rounded-lg bg-mint px-4 py-2 text-xs font-bold text-ink">Try again</button></div>}
        </div>
      </section>
    </main>

    <footer className="border-t border-line bg-panel2">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:grid-cols-2 lg:grid-cols-[1.3fr_.9fr_.9fr_1.2fr] lg:px-8">
        <div><Logo/><p className="mt-4 max-w-xs text-xs leading-6 text-muted">Explore Indian markets, portfolio analytics, and simulated trading workflows in one educational demo.</p>
          <div className="mt-5 flex gap-2" aria-label="Share TradeSha India">
            <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" aria-label="Share TradeSha India on LinkedIn" className="grid h-9 w-9 place-items-center rounded-lg border border-line text-muted transition hover:border-mint hover:text-mint"><Linkedin size={15}/></a>
            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" aria-label="Share TradeSha India on Facebook" className="grid h-9 w-9 place-items-center rounded-lg border border-line text-muted transition hover:border-mint hover:text-mint"><Facebook size={15}/></a>
            <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent('Explore TradeSha India, an educational trading dashboard demo.')}`} target="_blank" rel="noopener noreferrer" aria-label="Share TradeSha India on X" className="grid h-9 w-9 place-items-center rounded-lg border border-line text-xs font-bold text-muted transition hover:border-mint hover:text-mint">𝕏</a>
          </div>
          <p className="mt-2 text-[10px] text-muted">Share this demo · These are not official brand accounts</p>
        </div>
        <div><h4 className="mb-4 text-xs font-bold text-forest">Quick links</h4><div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs text-muted">{[['Home','#home'],['Markets','#markets'],['Stocks','#stocks'],['Portfolio','#portfolio'],['Watchlist','#watchlist'],['Quick trade','#trade'],['Market news','#news'],['About','#about']].map(([name,href])=><a key={name} href={href} className="transition hover:text-mint">{name}</a>)}</div></div>
        <div className="space-y-3 text-xs">
          <h4 className="mb-4 text-xs font-bold text-forest">Company & support</h4>
          <a href="#about" className="block text-muted transition hover:text-mint">About this demo</a>
          <button type="button" onClick={()=>setFooterDialog('help')} className="block text-left text-muted transition hover:text-mint">Help centre</button>
          <button type="button" onClick={()=>setFooterDialog('contact')} className="block text-left text-muted transition hover:text-mint">Contact information</button>
          <p className="pt-1 text-[10px] leading-5 text-muted">No support email, phone, or office address is configured.</p>
        </div>
        <div><h4 className="mb-4 text-xs font-bold text-forest">Important information</h4><p className="text-xs leading-6 text-muted">Prices, indices, portfolio values, and orders are illustrative sample data. Headlines come from Google News and link to publishers. This demo is not investment advice.</p><div className="mt-4 flex flex-wrap gap-4 text-[10px]"><button type="button" onClick={()=>setFooterDialog('privacy')} className="text-muted transition hover:text-mint">Privacy policy</button><button type="button" onClick={()=>setFooterDialog('terms')} className="text-muted transition hover:text-mint">Terms & conditions</button></div></div>
      </div>
      <div className="border-t border-line px-5 py-5 text-center text-[10px] text-muted">© 2026 TradeSha India. Demo project for educational purposes only.</div>
    </footer>

    {trade&&<TradeModal stock={trade.stock} side={trade.side} onClose={()=>setTrade(null)} onConfirm={confirmTrade}/>}
    {portfolioReport&&<PortfolioReportModal report={portfolioReport} onClose={()=>setPortfolioReport(null)} onDownload={downloadPortfolioPdf} downloading={reportDownloading} error={reportError} downloaded={reportDownloaded}/>}
    {footerDialog&&<FooterInfoModal type={footerDialog} onClose={()=>setFooterDialog(null)}/>}
    {toast&&<div role="status" className="fixed bottom-5 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-2 rounded-xl border border-mint/30 bg-panel px-5 py-3 text-xs font-semibold text-forest shadow-2xl"><Check size={16} className="text-mint"/>{toast}</div>}
  </div>
}

export default App
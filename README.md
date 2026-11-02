# TradeSha India — Trading & Investment UI

A responsive Indian stock-market dashboard built with React, Vite, Tailwind CSS, Recharts and Lucide icons.

## Requirements
- Node.js 18 or newer
- npm

## Setup
```bash
# 1. Extract the ZIP and open the project folder
cd tradesha-india

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```
Open the local URL printed by Vite (usually http://localhost:5173).

## Production build
```bash
npm run build
npm run preview
```

## Folder structure
```text
tradesha-india/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── README.md
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── data.js
    └── index.css
```

## Features
- Indian market index overview: NIFTY 50, SENSEX, BANK NIFTY, NIFTY IT
- Sample NSE stocks and searchable stock list
- Portfolio valuation, holdings and performance charts
- Portfolio report preview with client-side PDF download
- Add/remove stocks from watchlist
- Buy/sell modal with quantity, order type and estimated value
- Demo order confirmation and recent order history
- Simulated login/sign-up, editable session profile, and logout flow
- Responsive mobile navigation and layouts
- Animated branded intro screen with a local trading-chart photo, moving market graphics and a skip control
- Live India market headlines with publisher links, timestamps and expandable summaries
- Market news refreshes automatically every 10 minutes and can be refreshed manually

## Notes
This is a frontend-only educational demo. Stock prices, index values and portfolio data are illustrative sample content. Market headlines are fetched from Google News through RSS2JSON and link to publisher stories; they require an internet connection and can be unavailable if the public feed service is down. Buy/sell actions only update local React state; they do not place real orders. Login and sign-up are simulated in the browser and do not provide real authentication or account security. The sample login is `demo@tradesha.in` / `TradeSha123!`; profile details and signup sessions stay in page memory and clear on logout or reload. Do not enter real credentials or sensitive personal information.

The intro screen uses a locally bundled trading-chart photo sourced from Unsplash, so it remains available offline after the site assets load.

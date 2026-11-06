# KEEN CONVERT

KEEN CONVERT is a responsive, browser-based currency converter. It fetches exchange rates, calculates conversions between supported currencies, and provides a compact market overview with a cross-rate matrix and trend chart.

## Features

- Convert between 15 selectable currencies, including USD, EUR, GBP, NGN, GHS, KES, ZAR, OMR, JPY, CAD, AUD, INR, CNY, CHF, and BTC.
- Fetch the latest available rates from the [ExchangeRate-API Open Access endpoint](https://open.er-api.com/v6/latest/USD).
- Swap the source and destination currencies and view popular cross rates.
- Save the selected currencies and amount in browser local storage.
- View responsive market trend, usage guide, and testimonial sections.
- Use the interface on mobile or desktop with a currency green, mint, gold, off-white, and olive theme.

## Run locally

The app is a static website and does not require a build step or package installation. Serve the project directory over HTTP (rather than opening `index.html` directly) so browser requests to the rates API can run:

```bash
python -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000) in your browser.

## Project files

| File | Purpose |
| --- | --- |
| `index.html` | Page structure, content, and external library references |
| `style.css` | Theme, component styling, and ticker animation |
| `script.js` | Currency conversion, browser storage, matrix, and chart behavior |
| `currencies.json` | Bundled reference currency metadata and rates |
| `favicon.svg` | Browser tab icon |

## Data and limitations

- Exchange rates are fetched from the ExchangeRate-API Open Access endpoint at startup and are based on USD. Availability and freshness depend on that service and an active internet connection.
- `currencies.json` contains bundled reference rates, but the current offline fallback in `script.js` requests `rates.json`. Since that file is not included, the bundled JSON is not currently used automatically when the API is unavailable.
- The trend chart uses sample values embedded in `script.js`; it is illustrative and does not display historical data from the rates API.
- This project is intended for demonstration and informational use. Do not rely on it for financial decisions or transactions.

## Built with

- HTML, CSS, and vanilla JavaScript
- Tailwind CSS browser CDN
- Chart.js
- Font Awesome
- Plus Jakarta Sans and JetBrains Mono fonts

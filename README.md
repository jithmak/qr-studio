# QR Studio

Turn any link into a QR code — no sign-up, no scan limits, no expiry.

Everything runs in the browser: the link never leaves your device, and the page works offline. Codes download as a 4,096px+ PNG or a resolution-independent SVG.

## Project layout

```
src/
  index.html        page markup
  style.css         styles
  app.js            link validation, QR rendering, PNG/SVG export
  vendor/qrcode.js  QR encoder (qrcode-generator 2.0.2 by Kazuhiko Arase, MIT)
```

It is a plain static site with no build step. Open `src/index.html` directly, or serve the folder:

```
npx serve src
```

## Deployment

Deployed on Vercel with **Root Directory** set to `src`. Every push to `main` deploys to production.

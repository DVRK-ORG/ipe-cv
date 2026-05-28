# Indeed Profile Exporter (IPE)

IPE is a local Chrome Manifest V3 extension for exporting your own visible Indeed profile data. It expands profile sections, collects the visible profile content, and prepares HTML, JSON, or browser print-to-PDF output without sending data to a backend.

## Build

```powershell
npm install
npm run build
```

## Verify

```powershell
npm run test:extension
```

The extension smoke test loads the built `dist` folder as an unpacked extension in Chromium, serves a mocked Indeed profile page, expands hidden sections, extracts profile data, saves options, and opens the HTML preview page.

## Load In Chrome

1. Open `chrome://extensions`.
2. Enable `Developer mode`.
3. Choose `Load unpacked`.
4. Select `C:\Users\DARK\Desktop\Projects\IPE\dist`.
5. Open your own Indeed profile page and click the IPE toolbar icon.

## Privacy Boundary

IPE is designed for users exporting their own account data. It does not store credentials, bypass login, or scrape profiles that are not visible to the active logged-in user. Export processing happens locally in Chrome.

## Launch Track

- Landing page entry: `index.html`
- Recommended public domain: `https://ipe-cv.com`
- Recommended repository: `DVRK-ORG/ipe-cv`
- Privacy policy draft: `PRIVACY_POLICY.md`
- Chrome Store listing draft: `STORE_LISTING.md`
- Deployment checklist: `DEPLOYMENT.md`
- Current launch status: `LAUNCH_STATUS.md`

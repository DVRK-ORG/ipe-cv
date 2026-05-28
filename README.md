<p align="center">
  <img src="public/icons/ipe128.png" alt="Indeed Profile Exporter (IPE) Logo" width="128" height="128" />
</p>

# Indeed Profile Exporter (IPE)

**IPE** is a local-first Chrome Manifest V3 extension that helps users export their own visible Indeed profile data as clean **HTML**, **JSON**, or browser **print-to-PDF** output.

It is built for job seekers who want a personal backup of their Indeed profile without relying on screenshots, manual copying, or remote processing.

## Features

* Export your own visible Indeed profile content.
* Expand supported profile sections before export.
* Create readable standalone HTML exports.
* Save structured JSON snapshots for personal backup workflows.
* Open a browser print flow for Save as PDF.
* Store extension options locally in Chrome.
* Process data locally without sending profile content to a backend.

## Privacy Boundary

IPE is designed for users exporting their own account data.

It does **not**:

* Store credentials.
* Collect passwords, cookies, or session tokens.
* Bypass Indeed login.
* Scrape private or inaccessible profiles.
* Send exported profile data to a server.

Export processing happens locally inside Chrome.

## Build

```powershell
npm install
npm run build
```

The production build is generated in the `dist` folder.

## Verify

```powershell
npm run test:extension
```

The extension smoke test loads the built `dist` folder as an unpacked extension in Chromium, serves a mocked Indeed profile page, expands hidden sections, extracts profile data, saves options, and opens the HTML preview page.

## Load Locally in Chrome

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Choose **Load unpacked**.
4. Select the local `dist` folder.
5. Open your own Indeed profile page.
6. Click the IPE toolbar icon and choose an export option.

## Package for Chrome Web Store

```powershell
npm run package:chrome
```

The packaged extension ZIP is created in the `releases` folder.

## Project Links

* Landing page: `https://ipe-cv.com`
* Privacy policy: `https://ipe-cv.com/privacy/`
* Repository: `DVRK-ORG/ipe-cv`
* Chrome Web Store listing draft: `STORE_LISTING.md`
* Deployment checklist: `DEPLOYMENT.md`
* Launch status: `LAUNCH_STATUS.md`

## Disclaimer

IPE is an independent tool and is not affiliated with, endorsed by, or sponsored by Indeed.

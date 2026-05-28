# IPE Deployment Checklist

## Recommended Repository

Create the public repository:

```text
DVRK-ORG/ipe-cv
```

Use one repo for:

- Chrome extension source.
- Landing page source.
- Privacy policy and Chrome Web Store listing copy.
- Release checklist and packaged extension ZIPs.

## Local Build

```powershell
npm install
npm run build
npm run test:extension
```

The `dist` folder contains the Chrome extension build and the landing page entry at `index.html`.

## Cloudflare Pages

Create a Cloudflare Pages project connected to the GitHub repository.

Recommended settings:

- Framework preset: Vite
- Build command: `npm run build`
- Build output directory: `dist`
- Production branch: `main`

After the first deployment, attach the custom domain:

```text
ipe-cv.com
www.ipe-cv.com
```

## Chrome Store Package

Before submitting to the Chrome Web Store:

1. Run the production build.
2. Confirm `dist/manifest.json` uses Manifest V3.
3. Confirm icon paths resolve in `dist/icons`.
4. Confirm there is no remote code loading.
5. Zip the production extension files from `dist`.
6. Upload the ZIP to the Chrome Web Store Developer Dashboard.

Package command:

```powershell
npm run package:chrome
```

The ZIP is written to `releases/`.

## Chrome Store Assets

Prepare:

- 128x128 icon.
- At least one 1280x800 screenshot.
- Optional 440x280 promotional tile.
- Store description from `STORE_LISTING.md`.
- Privacy policy URL from `PRIVACY_POLICY.md`.

## Post-Launch

- Replace landing page Chrome CTA with the live Chrome Web Store URL.
- Replace GitHub links if the repository name changes.
- Add the Chrome Web Store badge to `README.md`.
- Tag the first public release as `v1.0.0`.

# IPE Launch Status

Last updated: May 28, 2026

## GitHub

- Repository: `DVRK-ORG/ipe-cv`
- URL: https://github.com/DVRK-ORG/ipe-cv
- Default branch: `main`

## Cloudflare Pages

- Project: `ipe-cv`
- Production URL: https://ipe-cv.pages.dev
- Build command: `npm run build`
- Output directory: `dist`
- Source: `DVRK-ORG/ipe-cv`, branch `main`

## Custom Domains

Attached to Cloudflare Pages and serving over HTTPS:

- https://ipe-cv.com
- https://www.ipe-cv.com
- https://ipe-cv.com/privacy/

Zone status:

- Zone: `ipe-cv.com`
- Status: active
- Nameservers: `ivan.ns.cloudflare.com`, `jo.ns.cloudflare.com`
- DNS:
  - `CNAME @ -> ipe-cv.pages.dev`
  - `CNAME www -> ipe-cv.pages.dev`

Verification:

- `https://ipe-cv.com/` returned `200` with title `IPE - Indeed Profile Exporter`.
- `https://www.ipe-cv.com/` returned `200` with title `IPE - Indeed Profile Exporter`.
- `https://ipe-cv.com/privacy/` returned `200` with title `Privacy Policy - IPE`.

## Chrome Web Store

- Store ZIP command: `npm run package:chrome`
- Latest local package: `releases/ipe-chrome-v1.0.0.zip`
- Listing draft: `STORE_LISTING.md`
- Privacy policy source: `PRIVACY_POLICY.md`
- Chrome Web Store privacy policy URL: `https://ipe-cv.com/privacy/`

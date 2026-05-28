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

Attached to Cloudflare Pages and pending validation:

- `ipe-cv.com`
- `www.ipe-cv.com`

Current blocker: the API token available to Codex can manage Pages but cannot create Cloudflare zones. Create the `ipe-cv.com` zone in the Cloudflare dashboard or grant a token with `Zone:Create` for the account.

Recommended DNS path:

1. Add `ipe-cv.com` as a full zone in Cloudflare.
2. Copy the Cloudflare nameservers.
3. Update the domain nameservers at Spaceship.
4. Wait for Cloudflare zone activation.
5. Confirm the Pages custom domains move from pending to active.

## Chrome Web Store

- Store ZIP command: `npm run package:chrome`
- Latest local package: `releases/ipe-chrome-v1.0.0.zip`
- Listing draft: `STORE_LISTING.md`
- Privacy policy source: `PRIVACY_POLICY.md`
- Live privacy URL after Cloudflare Pages deploy: `https://ipe-cv.pages.dev/privacy/`

After `ipe-cv.com` activates, use:

```text
https://ipe-cv.com/privacy/
```

as the Chrome Web Store privacy policy URL.

# Changelog

All notable changes for IPE, the Indeed Profile Exporter project, are documented here for future maintenance, store review history, and launch handoff.

IPE is a local-first Chrome Manifest V3 extension that helps users export their own visible Indeed profile data as HTML, JSON, or browser print-to-PDF output. It is independent and is not affiliated with, endorsed by, or sponsored by Indeed.

## Current State - 2026-05-28

- Product: Indeed Profile Exporter, short name IPE.
- Version: `1.0.0`.
- Repository: `DVRK-ORG/ipe-cv`.
- Website: `https://ipe-cv.com/`.
- Privacy policy: `https://ipe-cv.com/privacy/`.
- Chrome package: `releases/ipe-chrome-v1.0.0.zip`.
- Chrome Web Store status: approved and published.
- Chrome Web Store URL: `https://chromewebstore.google.com/detail/indeed-profile-exporter/lkhmkglminhfjhellfidjjfaknekfkbm`.
- Launch strategy: keep the published `1.0.0` extension package stable unless a patch release is needed.

## [Unreleased] - 2026-05-29

### Launch Links

- Updated the landing page CTA links to the published Chrome Web Store listing.
- Replaced pending-review language with live install copy.
- Added the published Chrome Web Store URL to public launch docs.
- Updated external landing and privacy page links to open in a new browser tab.
- Kept this as a website and documentation update only; no extension package was regenerated.

### Search Appearance

- Promoted the site favicon from a small browser-tab asset to a Google-search-friendly brand asset.
- Added explicit favicon declarations for:
  - `96x96` PNG
  - `48x48` PNG
  - root `favicon.ico`
  - `180x180` Apple touch icon
- Added canonical URLs to the landing page and privacy page.
- Added social preview image metadata to improve link previews.
- Kept this as a website-only change so the Chrome Web Store submission package remains frozen.

## [1.0.0] - 2026-05-28

### Project Created

- Built a fresh Vite, React, and TypeScript project for IPE.
- Implemented Chrome Manifest V3 structure with:
  - popup UI
  - options UI
  - content script
  - background service worker
  - print preview page
  - shared export and extension APIs
- Added Chrome permissions:
  - `activeTab`
  - `scripting`
  - `storage`
  - `downloads`
- Limited host permissions to Indeed domains only.
- Added support for 16 Indeed regional domains:
  - `indeed.com`
  - `indeed.co.uk`
  - `indeed.ca`
  - `indeed.com.au`
  - `indeed.de`
  - `indeed.fr`
  - `indeed.nl`
  - `indeed.es`
  - `indeed.it`
  - `indeed.co.in`
  - `indeed.ae`
  - `indeed.com.br`
  - `indeed.com.mx`
  - `indeed.sg`
  - `indeed.com.sg`
  - `indeed.co.jp`

### Core Extension Experience

- Added popup detection for whether the active tab is an Indeed profile/account page.
- Added clear ready and unavailable states in the popup.
- Added local-only privacy notice in the popup.
- Added export actions:
  - Export Profile
  - Preview HTML
  - Save JSON
  - Print PDF
- Added export progress checklist:
  - Expand sections
  - Collect profile
  - Create export
- Added options page controls for:
  - auto-expand
  - progress display
  - resume card inclusion
  - contact details inclusion
  - job preferences inclusion
  - default export format
- Kept settings in `chrome.storage.local`.
- Removed unused or confusing public-facing options during hardening.
- Preserved compatibility fields where needed for existing option data.

### Indeed Profile Extraction

- Implemented safe DOM expansion for visible profile sections.
- Opened native collapsible patterns, including:
  - `details` and `summary`
  - controls with `aria-expanded`
  - common disclosure buttons
  - visible profile row controls
- Removed `show less` from expansion matching to avoid collapsing sections that were already open.
- Added scrolling and re-scan behavior for lazy-loaded profile content.
- Added structured extraction for:
  - profile name
  - initials/avatar text
  - email
  - phone
  - location
  - profile visibility/status
  - resume card metadata
  - job-match/profile improvement sections
  - source URL
  - export timestamp
  - visible text fallback snapshot
- Added detail-panel capture for rows such as:
  - Qualifications
  - Job preferences
  - Hide jobs with these details
  - Ready to work
- Hardened clickable row detection for real Indeed layouts where the visible chevron/button may not contain text.
- Waited for dialogs, drawers, route changes, and changed text to settle before collecting detail lines.
- Filtered common Indeed navigation and page chrome from exports.
- Filtered chevron-only UI glyphs from section data.
- Tightened profile-page detection so the extension is less likely to run on unrelated Indeed pages.
- Added protections against unsafe clicks such as delete, upload, download, sign out, messages, notifications, sharing, reports, and blocked controls.

### Export Outputs

- Added standalone HTML export.
- Added structured JSON export.
- Added browser print-to-PDF flow using Chrome's own print dialog.
- Added professional print-friendly HTML layout with:
  - product header
  - profile fields
  - resume section
  - captured sections
  - visible text snapshot
  - local-only footer
- Added JSON payload with:
  - `meta`
  - `profile`
  - `resume`
  - `sections`
  - `rawText`
- Added filename generation based on profile name and export date.
- Added local print-page handoff through extension storage.
- Hardened print-preview storage cleanup after loading.
- Kept all export processing local to the user's browser.

### Privacy and Review Boundary

- Documented that IPE is for users exporting their own visible account data.
- Documented that IPE does not:
  - bypass login
  - scrape private accounts
  - store credentials
  - send exported profile data to a backend
  - collect analytics from the extension itself
- Added non-affiliation disclaimer:
  - IPE is independent and is not affiliated with, endorsed by, or sponsored by Indeed.
- Added public privacy policy source in `PRIVACY_POLICY.md`.
- Added live privacy page at `/privacy/`.
- Clarified that Cloudflare Web Analytics applies to the website only, not the extension or exported profile data.

### UI and Visual Design

- Built the extension around the locked visual direction:
  - dark graphite surfaces
  - cobalt primary actions
  - emerald privacy/success states
  - white export surfaces
  - 8px-or-less radii
  - polished hover and focus states
  - reduced-motion support
- Added a popup UI with:
  - brand lockup
  - readiness state
  - primary export button
  - quick actions
  - progress rows
  - local-only footer
- Added options UI with:
  - sidebar navigation
  - grouped controls
  - default format selection
  - privacy guidance
- Built the print/export HTML design to match the IPE product identity.
- Added polished extension icons:
  - `16x16`
  - `32x32`
  - `48x48`
  - `128x128`
- Tuned the `16x16` icon separately so the toolbar version remains readable.

### Landing Page and Website

- Built the public landing page at `https://ipe-cv.com/`.
- Added first-viewport product positioning:
  - product name and IPE mark
  - local-first export value proposition
  - install call to action
  - View on GitHub call to action
  - extension/product mockup
- Added website sections for:
  - local-first privacy
  - export workflow
  - export formats
  - Chrome Web Store and Cloudflare readiness
  - final launch call to action
  - footer disclaimer
- Added live privacy page at `https://ipe-cv.com/privacy/`.
- Added Open Graph and social metadata.
- Added root favicon assets and site icons.
- Added social preview image for the GitHub repository and link sharing.
- Polished landing page readability after visual review:
  - improved sticky header contrast
  - balanced footer disclaimer
  - adjusted desktop hero scale
  - reviewed format panel spacing
  - made visible GitHub wording consistent

### Documentation

- Added and polished `README.md` for public release.
- Added:
  - product overview
  - badges
  - feature table
  - privacy boundary
  - local install instructions
  - Chrome Web Store package instructions
  - tech stack
  - project links
  - non-affiliation disclaimer
- Added `STORE_LISTING.md` with Chrome Web Store listing copy and permission justifications.
- Added `PRIVACY_POLICY.md` as the source privacy policy document.
- Added `DEPLOYMENT.md` for Cloudflare Pages, domain, package, and post-launch steps.
- Added `LAUNCH_STATUS.md` for operational handoff.
- Added this `CHANGELOG.md` for future maintenance history.

### Testing and Verification

- Added Playwright extension smoke test in `tests/ipe-extension.spec.ts`.
- Test coverage verifies:
  - extension loads from built `dist`
  - mocked Indeed profile page is exported
  - hidden/detail sections are opened and captured
  - personal contact parsing prefers complete email data
  - resume metadata is captured
  - job preference detail lines are collected
  - page chrome/noise is filtered
  - options persistence works
  - HTML preview opens
- Added stricter test coverage for clickable row wrappers, matching real Indeed-style rows.
- Repeatedly verified:
  - `npm run typecheck`
  - `npm run build`
  - `npm run test:extension`
  - `npm run package:chrome`
- Ran personal-data cleanup checks to ensure no real profile data remained in source, tests, docs, or public assets.
- Replaced demo/test data with synthetic sample data.
- Verified no public-facing leftover wording used "Chrome Store" where "Chrome Web Store" was intended.
- Verified `show less` no longer appeared in expansion logic.
- Verified `privacyLocalOnly` only remained in safe compatibility/schema places.

### Packaging and Release

- Added `scripts/package-chrome.ps1`.
- Added package command:
  - `npm run package:chrome`
- Generated Chrome Web Store package:
  - `releases/ipe-chrome-v1.0.0.zip`
- Verified package size was acceptable for Chrome Web Store upload.
- Tagged release:
  - `v1.0.0`
- Created GitHub release:
  - "Indeed Profile Exporter v1.0.0"
- Attached release asset:
  - `ipe-chrome-v1.0.0.zip`
- Included release highlights, verification notes, and disclaimer.
- Published Chrome Web Store URL:
  - `https://chromewebstore.google.com/detail/indeed-profile-exporter/lkhmkglminhfjhellfidjjfaknekfkbm`

### GitHub and Cloudflare

- Created GitHub repository:
  - `DVRK-ORG/ipe-cv`
- Pushed project source to `main`.
- Created Cloudflare Pages project:
  - `ipe-cv`
- Connected Cloudflare Pages to:
  - `DVRK-ORG/ipe-cv`
  - branch `main`
- Set Cloudflare Pages build config:
  - build command: `npm run build`
  - output directory: `dist`
- Activated custom domain:
  - `ipe-cv.com`
- Activated `www` domain:
  - `www.ipe-cv.com`
- Verified live URLs:
  - `https://ipe-cv.com/`
  - `https://www.ipe-cv.com/`
  - `https://ipe-cv.com/privacy/`
- Added Cloudflare `_headers` for:
  - `X-Content-Type-Options`
  - `Referrer-Policy`
  - `Permissions-Policy`
  - long-lived cache headers for static assets and icons
- Added `.node-version` with Node 20 for Cloudflare Pages build stability.
- Adjusted dependency placement so Cloudflare Pages has the types needed during build.
- Simplified build script to run `vite build` directly after type/build hardening was complete.

### Search and Discovery

- Added `public/robots.txt`.
- Added `public/sitemap.xml`.
- Submitted sitemap:
  - `https://ipe-cv.com/sitemap.xml`
- Verified sitemap serves raw XML.
- Verified sitemap discovered:
  - homepage
  - privacy page
- Verified `ipe-cv.com` in Google Search Console.
- Requested indexing for:
  - homepage
  - privacy page
- Completed Bing Webmaster Tools setup.

### Analytics

- Added Cloudflare Web Analytics beacon to:
  - landing page
  - privacy page
- Confirmed analytics is website-only.
- Confirmed analytics does not apply to the Chrome extension or exported profile data.
- Verified beacon presence on live pages.
- Verified sitemap remained valid after analytics deployment.

### Chrome Web Store Submission

- Uploaded `ipe-chrome-v1.0.0.zip` to Chrome Web Store Developer Dashboard.
- Completed listing fields:
  - title
  - summary
  - category: Tools
  - language: English
  - full description
  - store icon
  - screenshots
  - small promo tile
  - marquee promo tile
- Completed permission justifications for:
  - `activeTab`
  - `downloads`
  - host permissions
  - `scripting`
  - `storage`
- Confirmed:
  - no remote code is used
  - single purpose is local export of the user's own visible Indeed profile
  - data-use disclosures are accurate
- Declared data categories required for review:
  - personally identifiable information
  - location
  - website content
- Certified required Chrome Web Store data-use statements.
- Submitted the extension for Chrome Web Store review.
- Approved and published version `1.0.0` to the Chrome Web Store:
  - `https://chromewebstore.google.com/detail/indeed-profile-exporter/lkhmkglminhfjhellfidjjfaknekfkbm`

### Promo and Launch Assets

- Created and reviewed Chrome Web Store promo images.
- Selected cleaner promo graphics suitable for store review.
- Avoided fake Indeed-branded UI in promo graphics to reduce reviewer friction.
- Checked typo-prone graphics before upload.
- Uploaded:
  - small promo tile
  - marquee promo tile
- Added GitHub social preview image.
- Polished GitHub repository description, website URL, and topics.
- Fixed broken Cloudflare icon in README tech stack table.

## Post-Submission Guidance

### Published Package

- Do not regenerate or reupload the Chrome Web Store ZIP unless a patch release is intentionally prepared.
- Treat `releases/ipe-chrome-v1.0.0.zip` as the published `1.0.0` source of truth.
- Safe post-approval work:
  - monitor Chrome Web Store listing health
  - monitor support email
  - monitor Google and Bing indexing
  - monitor Cloudflare Web Analytics
  - prepare Product Hunt launch materials privately
  - prepare LinkedIn and X launch drafts
  - pin the GitHub repository if desired

### Product Hunt Decision

- Product Hunt launch can now use the live Chrome Web Store install URL.
- Use the published listing as the primary CTA for public launch materials.

## Maintenance Notes

- If Chrome Web Store review requests changes, create a new patch release rather than mutating the submitted package silently.
- Keep extension analytics out of scope unless the privacy policy, store disclosures, and user-facing copy are intentionally updated.
- Keep demo data synthetic.
- Re-run personal-data checks before every public package. Keep the exact denylist local and untracked so real user identifiers are not added back to the public repository:

```powershell
rg -n "<real-name>|<real-email>|<real-phone>|<real-location>|<real-resume-title>" .
```

- Re-run release verification before any new package:

```powershell
npm run typecheck
npm run build
npm run test:extension
npm run package:chrome
```

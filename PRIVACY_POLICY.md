# IPE Privacy Policy

Effective date: May 28, 2026

IPE, short for Indeed Profile Exporter, is a Chrome extension that helps users export their own visible Indeed profile data locally.

## Data Processing

IPE processes profile information only inside the user's browser. It does not operate a backend service, send profile data to a server, sell data, or share data with third parties.

## What IPE Can Access

When the user runs an export on an Indeed profile page, IPE can read visible page text needed to create the export. This may include profile name, contact details, resume card metadata, visibility status, job preference sections, and other visible profile text.

IPE does not collect passwords, cookies, session tokens, payment information, or hidden account data.

## User-Controlled Exports

IPE can create local files at the user's request:

- HTML profile export
- JSON profile export
- Browser print-to-PDF output

These files are saved locally through Chrome's download or print flow.

## Permissions

IPE requests Chrome permissions for:

- `activeTab`: to run on the current Indeed page after user action.
- `scripting`: to communicate with the page context.
- `storage`: to save extension options locally.
- `downloads`: to save HTML and JSON exports.

Host permissions are limited to Indeed domains.

## Data Retention

IPE does not retain exported profile data in a remote system. Extension options are stored locally in Chrome storage. Print previews may temporarily store generated HTML in local Chrome extension storage so the print page can open.

## Contact

For support or privacy questions, use the project repository at:

https://github.com/DVRK-ORG/ipe-cv

## Disclaimer

IPE is an independent tool and is not affiliated with, endorsed by, or sponsored by Indeed.

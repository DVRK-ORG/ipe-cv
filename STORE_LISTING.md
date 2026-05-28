# Chrome Web Store Listing Draft

## Name

Indeed Profile Exporter

## Short Name

IPE

## Summary

Export your own Indeed profile locally as clean HTML, JSON, or browser print-to-PDF output.

## Description

IPE helps job seekers keep a clean local copy of their own Indeed profile.

Indeed profile pages can include dynamic sections, drawers, and drop-down rows that do not export well with normal browser printing. IPE expands visible profile sections, collects the information already available in the user's logged-in browser, and creates readable local exports.

IPE supports:

- Standalone HTML exports for offline reading.
- Structured JSON exports for backup or personal workflows.
- Browser print-to-PDF output using Chrome's built-in print dialog.
- Local-only processing with no backend service.
- Options for contact details, resume card metadata, profile sections, and job preferences.

IPE is designed for users exporting their own account data. It does not bypass login, scrape private accounts, store credentials, or send profile data to a server.

Disclaimer: IPE is an independent tool and is not affiliated with, endorsed by, or sponsored by Indeed.

## Category

Productivity

## Language

English

## Website

https://ipe-cv.com

## Privacy Policy

https://ipe-cv.com/privacy

## Permission Justification

### activeTab

Required so the user can run IPE on the active Indeed profile page after choosing to export.

### scripting

Required for the extension to communicate with the Indeed page and collect visible profile text.

### storage

Required to save local extension options such as default export format and included sections.

### downloads

Required to save local HTML and JSON export files.

### Host Permissions

Host permissions are limited to Indeed domains so the content script runs only where the export workflow is intended to work.

## Screenshot Checklist

- Popup ready state on an Indeed profile page.
- Popup unavailable state on a non-Indeed page.
- Options page.
- HTML export preview.
- Print-to-PDF preview.
- Landing page first viewport at ipe-cv.com.

## Store Review Notes

IPE processes user-requested exports locally. No data is transmitted to a third-party service by the extension.

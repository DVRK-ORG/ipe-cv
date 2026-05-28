import { EXTENSION_NAME, EXTENSION_SHORT_NAME } from "./constants";
import type { ProfileExportPayload } from "./types";

const escapeHtml = (value: unknown): string =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const list = (items: string[]): string => {
  const clean = items.filter(Boolean);
  if (!clean.length) return "";
  return `<ul>${clean.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
};

const field = (label: string, value?: string): string =>
  value
    ? `<div class="field"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`
    : "";

export const makeExportFilename = (
  payload: ProfileExportPayload,
  extension: "html" | "json"
): string => {
  const name = payload.profile.name || "indeed-profile";
  const safeName = name.toLowerCase().replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "");
  const date = payload.meta.exportedAt.slice(0, 10);
  return `${safeName || "indeed-profile"}-${date}.${extension}`;
};

export const buildHtmlDocument = (payload: ProfileExportPayload): string => {
  const contact = payload.profile.contact;
  const sections = payload.sections
    .map(
      (section) => `
        <section class="section">
          <h2>${escapeHtml(section.heading)}</h2>
          ${section.summary ? `<p>${escapeHtml(section.summary)}</p>` : ""}
          ${list(section.items)}
        </section>`
    )
    .join("");

  const resume = payload.resume
    ? `
      <section class="section resume">
        <h2>Resume</h2>
        ${field("Document", payload.resume.title)}
        ${field("Added", payload.resume.added)}
        ${field("Type", payload.resume.fileType)}
        ${payload.resume.text ? `<p class="note">${escapeHtml(payload.resume.text)}</p>` : ""}
      </section>`
    : "";

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(payload.profile.name || "Indeed Profile")} - ${EXTENSION_SHORT_NAME}</title>
  <style>
    :root {
      color-scheme: light;
      --ink: #0b1220;
      --muted: #5e6b80;
      --line: #dbe2eb;
      --soft: #f4f7fb;
      --blue: #075bff;
      --green: #16a85d;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: #eef3f8;
      color: var(--ink);
      line-height: 1.55;
    }
    .page {
      width: min(920px, calc(100% - 32px));
      margin: 32px auto;
      background: #fff;
      border: 1px solid var(--line);
      border-radius: 8px;
      box-shadow: 0 20px 60px rgba(10, 19, 32, 0.11);
      overflow: hidden;
    }
    header {
      padding: 34px 42px;
      color: white;
      background: linear-gradient(135deg, #0a1320, #111f31 60%, #063a9e);
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 24px;
      font-size: 13px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      opacity: 0.84;
    }
    .mark {
      display: grid;
      width: 34px;
      height: 34px;
      place-items: center;
      border-radius: 50%;
      background: #075bff;
      box-shadow: inset 0 0 0 3px rgba(255,255,255,0.22);
      font-weight: 800;
    }
    h1 {
      margin: 0;
      font-size: clamp(30px, 5vw, 48px);
      letter-spacing: 0;
      line-height: 1.04;
    }
    .subtitle {
      margin: 12px 0 0;
      color: rgba(255,255,255,0.78);
      max-width: 680px;
    }
    main { padding: 34px 42px 42px; }
    .grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 14px;
      margin-bottom: 28px;
    }
    .field {
      padding: 14px 15px;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: var(--soft);
      min-width: 0;
    }
    .field span {
      display: block;
      color: var(--muted);
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .field strong {
      display: block;
      margin-top: 4px;
      overflow-wrap: anywhere;
    }
    .section {
      padding: 24px 0;
      border-top: 1px solid var(--line);
    }
    h2 {
      margin: 0 0 10px;
      font-size: 20px;
      letter-spacing: 0;
    }
    p { margin: 0 0 10px; color: var(--muted); }
    .note { color: var(--muted); font-size: 14px; }
    .snapshot {
      white-space: pre-wrap;
      overflow-wrap: anywhere;
    }
    ul {
      margin: 12px 0 0;
      padding-left: 20px;
    }
    li + li { margin-top: 6px; }
    footer {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      padding: 20px 42px;
      border-top: 1px solid var(--line);
      color: var(--muted);
      background: #fbfcfe;
      font-size: 13px;
    }
    @media (max-width: 720px) {
      .page { width: 100%; margin: 0; border-radius: 0; border-left: 0; border-right: 0; }
      header, main, footer { padding-left: 22px; padding-right: 22px; }
      .grid { grid-template-columns: 1fr; }
      footer { flex-direction: column; }
    }
    @media print {
      body { background: white; }
      .page { width: 100%; margin: 0; border: 0; box-shadow: none; border-radius: 0; }
      header { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .section { break-inside: avoid; }
    }
  </style>
</head>
<body>
  <article class="page">
    <header>
      <div class="brand"><span class="mark">${EXTENSION_SHORT_NAME}</span><span>${EXTENSION_NAME}</span></div>
      <h1>${escapeHtml(payload.profile.name || "Indeed Profile")}</h1>
      <p class="subtitle">Exported locally from your visible Indeed profile on ${escapeHtml(
        new Date(payload.meta.exportedAt).toLocaleString()
      )}.</p>
    </header>
    <main>
      <div class="grid">
        ${field("Email", contact.email)}
        ${field("Phone", contact.phone)}
        ${field("Location", contact.location)}
        ${field("Visibility", payload.profile.visibility)}
        ${field("Initials", payload.profile.initials)}
        ${field("Source", payload.meta.sourceUrl)}
      </div>
      ${resume}
      ${sections}
      <section class="section">
        <h2>Visible Text Snapshot</h2>
        <p class="snapshot">${escapeHtml(payload.rawText)}</p>
      </section>
    </main>
    <footer>
      <span>Generated by ${EXTENSION_NAME}</span>
      <span>No data was sent to a server by IPE.</span>
    </footer>
  </article>
</body>
</html>`;
};

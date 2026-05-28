import React from "react";
import { createRoot } from "react-dom/client";
import { ArrowLeft, Download, FileText, Lock, ShieldCheck } from "lucide-react";
import "../site/site.css";

const sections = [
  {
    title: "Data processing",
    body:
      "IPE processes profile information only inside your browser. It does not operate a backend service, send profile data to a server, sell data, or share data with third parties."
  },
  {
    title: "What IPE can access",
    body:
      "When you run an export on an Indeed profile page, IPE can read visible page text needed to create the export. This may include profile name, contact details, resume card metadata, visibility status, job preference sections, and other visible profile text."
  },
  {
    title: "User-controlled exports",
    body:
      "IPE can create local HTML, JSON, and browser print-to-PDF exports at your request. These files are saved locally through Chrome's download or print flow."
  },
  {
    title: "Data retention",
    body:
      "IPE does not retain exported profile data in a remote system. Extension options are stored locally in Chrome storage. Print previews may temporarily store generated HTML in local Chrome extension storage so the print page can open."
  },
  {
    title: "Website analytics",
    body:
      "The IPE website may use Cloudflare Web Analytics to understand aggregated page traffic. This website analytics is separate from the Chrome extension and is not used to collect exported profile data."
  }
];

function PrivacyPage() {
  return (
    <main className="privacy-page">
      <a className="back-link" href="/">
        <ArrowLeft size={18} />
        <span>Back to IPE</span>
      </a>
      <section className="policy-hero">
        <img src="/icons/ipe128.png" alt="" />
        <h1>IPE Privacy Policy</h1>
        <p>Effective date: May 28, 2026</p>
      </section>
      <section className="policy-grid">
        <article>
          <ShieldCheck size={28} />
          <h2>Local first</h2>
          <p>No backend service is used to process your exported profile.</p>
        </article>
        <article>
          <Lock size={28} />
          <h2>No credentials</h2>
          <p>IPE does not collect passwords, cookies, session tokens, or payment details.</p>
        </article>
        <article>
          <Download size={28} />
          <h2>User initiated</h2>
          <p>Exports are created only when you choose an export action.</p>
        </article>
      </section>
      <section className="policy-content">
        {sections.map((section) => (
          <article key={section.title}>
            <FileText size={22} />
            <div>
              <h2>{section.title}</h2>
              <p>{section.body}</p>
            </div>
          </article>
        ))}
      </section>
      <footer className="site-footer policy-footer" style={{ flexWrap: "wrap", rowGap: "12px" }}>
        <span>Generated for Indeed Profile Exporter</span>
        <a href="https://github.com/DVRK-ORG/ipe-cv">GitHub</a>
        <div style={{ flexBasis: "100%", textAlign: "center", fontSize: "11px", opacity: 0.65, marginTop: "8px" }}>
          IPE is an independent tool and is not affiliated with, endorsed by, or sponsored by Indeed.
        </div>
      </footer>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <PrivacyPage />
  </React.StrictMode>
);

import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowRight,
  Braces,
  Check,
  Chrome,
  Code2,
  FileText,
  Github,
  Lock,
  Printer,
  ShieldCheck,
  Sparkles,
  Wand2
} from "lucide-react";
import "../site/site.css";

type ExportFormat = "HTML" | "JSON" | "PDF";

const chromeStoreUrl = "#chrome-store";
const githubUrl = "https://github.com/DVRK-ORG/ipe-cv";

const workflow = [
  {
    title: "Expand sections",
    copy: "IPE opens visible Indeed profile rows and waits for their details to settle.",
    icon: Wand2
  },
  {
    title: "Collect profile",
    copy: "It captures the profile data already visible to your logged-in browser.",
    icon: Sparkles
  },
  {
    title: "Export locally",
    copy: "Save a readable profile snapshot without sending the data to a backend.",
    icon: ShieldCheck
  }
];

const formats: Record<ExportFormat, { icon: typeof FileText; title: string; copy: string; sample: string[] }> = {
  HTML: {
    icon: Code2,
    title: "Standalone HTML",
    copy: "A polished offline page that is easy to read, archive, and share.",
    sample: ["Profile header", "Resume card", "Job-match details", "Visible text snapshot"]
  },
  JSON: {
    icon: Braces,
    title: "Structured JSON",
    copy: "A clean data file for backup, migration, or your own local workflows.",
    sample: ["meta.exportedAt", "profile.contact", "resume.title", "sections.items"]
  },
  PDF: {
    icon: Printer,
    title: "Print-to-PDF",
    copy: "A browser print flow that lets the user choose Save as PDF.",
    sample: ["Readable pages", "Local print dialog", "No remote converter", "Professional layout"]
  }
};

function Header() {
  return (
    <header className="site-header">
      <a className="brand" href="#top" aria-label="IPE home">
        <img src="/icons/ipe48.png" alt="" />
        <span>IPE</span>
      </a>
      <nav aria-label="Primary navigation">
        <a href="#features">Features</a>
        <a href="/privacy/">Privacy</a>
        <a href="#demo">Demo</a>
        <a href={githubUrl}>GitHub</a>
      </nav>
      <a className="header-action" href={chromeStoreUrl}>
        <Chrome size={18} />
        <span>Add to Chrome</span>
      </a>
    </header>
  );
}

function HeroMockup() {
  return (
    <div className="hero-visual" aria-label="IPE extension export preview">
      <div className="popup-preview">
        <div className="preview-topline">
          <img src="/icons/ipe32.png" alt="" />
          <span>Indeed Profile Exporter</span>
        </div>
        <div className="ready-state">
          <Check size={18} />
          <div>
            <strong>Ready on Indeed profile</strong>
            <span>No data leaves your device</span>
          </div>
        </div>
        <button type="button">
          <Chrome size={22} />
          <span>Export Profile</span>
        </button>
        <div className="checklist">
          {["Expand sections", "Collect profile", "Create export"].map((item) => (
            <div key={item}>
              <Check size={15} />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="document-preview">
        <div className="doc-hero">
          <div className="doc-brand">
            <span>IPE</span>
            <small>Indeed Profile Exporter</small>
          </div>
          <h3>Sample Candidate</h3>
          <p>Exported locally from your visible Indeed profile.</p>
        </div>
        <div className="doc-grid">
          {["Email", "Phone", "Location", "Visibility"].map((label) => (
            <div key={label}>
              <span>{label}</span>
              <strong>{label === "Visibility" ? "Employers can find you" : "Captured locally"}</strong>
            </div>
          ))}
        </div>
        <div className="doc-section">
          <h4>Improve your job matches</h4>
          <p>Qualifications, preferences, hidden job details, and ready-to-work status captured with section details.</p>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero-copy">
        <h1>Export your Indeed profile cleanly</h1>
        <p>
          IPE expands profile sections, captures your visible account data, and creates HTML, JSON, or print-to-PDF exports
          inside your browser.
        </p>
        <div className="hero-actions">
          <a className="primary-link" href={chromeStoreUrl}>
            <Chrome size={22} />
            <span>Add to Chrome</span>
          </a>
          <a className="secondary-link" href={githubUrl}>
            <Github size={22} />
            <span>View on GitHub</span>
          </a>
        </div>
        <div className="trust-row" aria-label="Privacy and export highlights">
          <span>
            <Lock size={16} />
            Local processing
          </span>
          <span>
            <FileText size={16} />
            HTML, JSON, PDF
          </span>
          <span>
            <ShieldCheck size={16} />
            Own profile only
          </span>
        </div>
      </div>
      <HeroMockup />
    </section>
  );
}

function PrivacyBand() {
  return (
    <section className="privacy-band" id="privacy">
      <div>
        <ShieldCheck size={30} />
        <h2>Built for local-first profile ownership</h2>
      </div>
      <p>
        IPE does not run a backend, store credentials, or bypass Indeed login. The extension works from the page you can
        already see, then saves the export on your machine.
      </p>
    </section>
  );
}

function Workflow() {
  return (
    <section className="section-shell" id="features">
      <div className="section-heading">
        <h2>A careful export flow for dynamic profile pages</h2>
        <p>Drop-downs, drawers, and lazy-loaded profile rows get handled before the export is created.</p>
      </div>
      <div className="workflow-grid">
        {workflow.map(({ title, copy, icon: Icon }, index) => (
          <article key={title} className="workflow-step">
            <div className="step-index">0{index + 1}</div>
            <Icon size={25} />
            <h3>{title}</h3>
            <p>{copy}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function FormatDemo() {
  const [active, setActive] = useState<ExportFormat>("HTML");
  const activeFormat = formats[active];
  const ActiveIcon = activeFormat.icon;

  const sampleLines = useMemo(() => activeFormat.sample, [activeFormat]);

  return (
    <section className="demo-section" id="demo">
      <div className="demo-copy">
        <h2>Choose the export that fits the next step</h2>
        <p>
          Save a professional readable page, keep a structured backup, or open a print-ready document for Save as PDF.
        </p>
        <div className="format-tabs" role="tablist" aria-label="Export formats">
          {(Object.keys(formats) as ExportFormat[]).map((format) => (
            <button
              aria-selected={active === format}
              key={format}
              onClick={() => setActive(format)}
              role="tab"
              type="button"
            >
              {format}
            </button>
          ))}
        </div>
      </div>
      <div className="format-panel">
        <div className="format-title">
          <ActiveIcon size={28} />
          <div>
            <h3>{activeFormat.title}</h3>
            <p>{activeFormat.copy}</p>
          </div>
        </div>
        <ul>
          {sampleLines.map((line) => (
            <li key={line}>
              <Check size={16} />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function OpenSource() {
  return (
    <section className="open-source">
      <div>
        <h2>Prepared for Chrome Web Store and Cloudflare</h2>
        <p>
          The project can live in DVRK-ORG with the extension, landing page, privacy policy, and release checklist in one
          repo. Cloudflare Pages can deploy the website from the same production build.
        </p>
      </div>
      <a className="secondary-link light" href={githubUrl}>
        <Github size={22} />
        <span>Open GitHub repository</span>
      </a>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="final-cta" id="chrome-store">
      <img src="/icons/ipe128.png" alt="" />
      <h2>Ready for the public launch path</h2>
      <p>Package the extension, submit the Chrome Web Store listing, and point ipe-cv.com to the Cloudflare Pages deploy.</p>
      <a className="primary-link" href={chromeStoreUrl}>
        <Chrome size={22} />
        <span>Chrome Web Store coming next</span>
        <ArrowRight size={20} />
      </a>
    </section>
  );
}

function App() {
  return (
    <main>
      <Header />
      <Hero />
      <PrivacyBand />
      <Workflow />
      <FormatDemo />
      <OpenSource />
      <FinalCta />
      <footer className="site-footer" style={{ flexWrap: "wrap", rowGap: "12px" }}>
        <div>
          <img src="/icons/ipe32.png" alt="" />
          <span>IPE</span>
        </div>
        <a href="/privacy/">Privacy Policy</a>
        <a href={githubUrl}>GitHub</a>
        <span>2026 DVRK ORG</span>
        <div style={{ flexBasis: "100%", textAlign: "center", fontSize: "11px", opacity: 0.65, marginTop: "8px" }}>
          IPE is an independent tool and is not affiliated with, endorsed by, or sponsored by Indeed.
        </div>
      </footer>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

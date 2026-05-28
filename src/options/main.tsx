import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  CheckCircle2,
  FileCode2,
  Home,
  Info,
  LockKeyhole,
  Settings2,
  ShieldCheck
} from "lucide-react";
import { DEFAULT_OPTIONS, EXTENSION_VERSION } from "../shared/constants";
import { getLocalOptions, saveLocalOptions } from "../shared/extensionApi";
import type { ExportFormat, IpeOptions } from "../shared/types";
import "./options.css";

type ToggleKey = keyof Pick<
  IpeOptions,
  | "autoExpand"
  | "showProgress"
  | "minimizeAfterExport"
  | "includeResumeCard"
  | "includeContactDetails"
  | "includeJobPreferences"
>;

const behaviorRows: Array<{ key: ToggleKey; title: string; body: string }> = [
  {
    key: "autoExpand",
    title: "Auto expand all sections",
    body: "Automatically expand dropdowns before export"
  },
  {
    key: "showProgress",
    title: "Show progress during export",
    body: "Display checklist and progress animations"
  },
  {
    key: "minimizeAfterExport",
    title: "Minimize to toolbar after export",
    body: "Keep popup clean after export completes"
  }
];

const includeRows: Array<{ key: ToggleKey; title: string; body: string }> = [
  {
    key: "includeResumeCard",
    title: "Include resume card",
    body: "Export your uploaded resume card"
  },
  {
    key: "includeContactDetails",
    title: "Include contact details",
    body: "Include email, phone and location"
  },
  {
    key: "includeJobPreferences",
    title: "Include job preferences",
    body: "Export job preferences and settings"
  }
];

function ToggleRow({
  item,
  checked,
  onChange
}: {
  item: { key: ToggleKey; title: string; body: string };
  checked: boolean;
  onChange: (key: ToggleKey, checked: boolean) => void;
}) {
  return (
    <label className="toggle-row">
      <span>
        <strong>{item.title}</strong>
        <small>{item.body}</small>
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(item.key, event.currentTarget.checked)}
      />
      <i aria-hidden="true" />
    </label>
  );
}

function OptionsApp() {
  const [options, setOptions] = useState<IpeOptions>(DEFAULT_OPTIONS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    void getLocalOptions().then(setOptions);
  }, []);

  const save = async (next: IpeOptions) => {
    setOptions(next);
    await saveLocalOptions(next);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1400);
  };

  const onToggle = (key: ToggleKey, checked: boolean) => {
    void save({ ...options, [key]: checked });
  };

  const onFormat = (format: ExportFormat) => {
    void save({ ...options, defaultFormat: format });
  };

  const activeFormatLabel = useMemo(() => {
    if (options.defaultFormat === "json") return "JSON";
    if (options.defaultFormat === "pdf") return "PDF Print";
    return "HTML (Web Page)";
  }, [options.defaultFormat]);

  return (
    <main className="options-shell">
      <aside className="sidebar">
        <div className="options-logo">IPE</div>
        <nav aria-label="IPE settings sections">
          <a className="active" href="#general">
            <Home size={20} />
            General
          </a>
          <a href="#export">
            <FileCode2 size={20} />
            Export Options
          </a>
          <a href="#privacy">
            <ShieldCheck size={20} />
            Privacy
          </a>
          <a href="#about">
            <Info size={20} />
            About
          </a>
        </nav>
        <div className="local-badge">
          <LockKeyhole size={24} />
          <span>
            <strong>100% Local</strong>
            Your data stays on your device.
          </span>
        </div>
      </aside>

      <section className="settings-content" id="general">
        <header className="settings-header">
          <div>
            <h1>Indeed Profile Exporter</h1>
            <p>Configure how IPE works on Indeed.</p>
          </div>
          <span className="version">v{EXTENSION_VERSION}</span>
        </header>

        <section className="settings-block">
          <div className="block-heading">
            <Settings2 size={20} />
            <h2>Behavior</h2>
          </div>
          <div className="settings-card">
            {behaviorRows.map((item) => (
              <ToggleRow key={item.key} item={item} checked={Boolean(options[item.key])} onChange={onToggle} />
            ))}
          </div>
        </section>

        <section className="settings-block" id="export">
          <div className="block-heading">
            <FileCode2 size={20} />
            <h2>Include in export</h2>
          </div>
          <div className="settings-card">
            {includeRows.map((item) => (
              <ToggleRow key={item.key} item={item} checked={Boolean(options[item.key])} onChange={onToggle} />
            ))}
          </div>
        </section>

        <section className="format-row">
          <div>
            <h2>Default export format</h2>
            <p>Choose the format used for the main Export Profile button.</p>
          </div>
          <label>
            <span>{activeFormatLabel}</span>
            <select
              value={options.defaultFormat}
              onChange={(event) => onFormat(event.currentTarget.value as ExportFormat)}
            >
              <option value="html">HTML (Web Page)</option>
              <option value="json">JSON</option>
              <option value="pdf">PDF Print</option>
            </select>
          </label>
        </section>

        <section className="privacy-strip" id="privacy">
          <ShieldCheck size={24} />
          <div>
            <h2>Local-only by design</h2>
            <p>IPE reads visible profile data in the active Indeed tab and prepares exports in Chrome. No server or credential storage is involved.</p>
          </div>
        </section>

        <footer className="save-state" id="about">
          <span className={saved ? "visible" : ""}>
            <CheckCircle2 size={18} />
            Saved
          </span>
        </footer>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <OptionsApp />
  </React.StrictMode>
);

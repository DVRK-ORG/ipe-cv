import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  AlertCircle,
  Braces,
  Check,
  Circle,
  CloudDownload,
  Code2,
  Loader2,
  Printer,
  Settings,
  ShieldCheck
} from "lucide-react";
import { DEFAULT_OPTIONS, EXTENSION_VERSION } from "../shared/constants";
import { buildHtmlDocument, makeExportFilename } from "../shared/exportHtml";
import { getLocalOptions, hasChromeRuntime, sendRuntimeMessage } from "../shared/extensionApi";
import type {
  ExportRequest,
  ExportResponse,
  ExportFormat,
  IpeOptions,
  IpeStatus,
  ProfileExportPayload
} from "../shared/types";
import "./popup.css";

type StepKey = "expand" | "collect" | "create";
type StepState = "idle" | "active" | "done" | "error";

const steps: Array<{ key: StepKey; title: string; detail: string }> = [
  { key: "expand", title: "Expand sections", detail: "All collapsible sections expanded" },
  { key: "collect", title: "Collect profile", detail: "Collecting visible profile data..." },
  { key: "create", title: "Create export", detail: "Preparing your export files" }
];

const delay = (ms: number): Promise<void> => new Promise((resolve) => window.setTimeout(resolve, ms));

const initialStepState: Record<StepKey, StepState> = {
  expand: "idle",
  collect: "idle",
  create: "idle"
};

const demoPayload = (): ProfileExportPayload => ({
  meta: {
    extensionName: "Indeed Profile Exporter",
    extensionShortName: "IPE",
    extensionVersion: EXTENSION_VERSION,
    exportedAt: new Date().toISOString(),
    sourceUrl: "https://profile.indeed.com/",
    pageTitle: "Indeed Profile"
  },
  profile: {
    name: "Alex Morgan",
    initials: "AM",
    contact: {
      email: "alex@example.com",
      phone: "+1 555 0100",
      location: "Sample City, Country",
      lines: ["alex@example.com", "+1 555 0100", "Sample City, Country"]
    },
    visibility: "Employers can find you"
  },
  resume: {
    title: "Alex Morgan - Sample Resume.pdf",
    added: "Added today",
    fileType: "PDF",
    text: "Resume card captured from the visible Indeed profile."
  },
  sections: [
    {
      heading: "Qualifications",
      summary: "Highlight your skills and experience.",
      items: ["Security leadership", "HSSE operations", "Incident reporting"]
    },
    {
      heading: "Ready to work",
      summary: "Available to start working as soon as possible.",
      items: []
    }
  ],
  rawText:
    "Alex Morgan\nalex@example.com\n+1 555 0100\nSample City, Country\nEmployers can find you\nResume\nQualifications"
});

const statusFallback = (): IpeStatus => ({
  isIndeed: false,
  ready: false,
  reason: "Open your own Indeed profile page to export.",
  title: "No Indeed profile detected"
});

const queryActiveTab = async (): Promise<chrome.tabs.Tab | undefined> => {
  if (!hasChromeRuntime()) return undefined;
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
};

const sendTabMessage = async <T,>(tabId: number, request: ExportRequest): Promise<T> => {
  const response = await chrome.tabs.sendMessage<ExportRequest, ExportResponse<T>>(tabId, request);
  if (!response?.ok) throw new Error(response?.error || "IPE could not reach this page.");
  return response.data as T;
};

const downloadHtml = async (payload: ProfileExportPayload): Promise<void> => {
  const html = buildHtmlDocument(payload);
  if (!hasChromeRuntime()) {
    const tab = window.open("", "_blank", "noopener,noreferrer");
    tab?.document.write(html);
    tab?.document.close();
    return;
  }

  await chrome.downloads.download({
    url: `data:text/html;charset=utf-8,${encodeURIComponent(html)}`,
    filename: makeExportFilename(payload, "html"),
    saveAs: true,
    conflictAction: "uniquify"
  });
};

const stepIcon = (state: StepState) => {
  if (state === "done") return <Check size={17} strokeWidth={3} />;
  if (state === "active") return <Loader2 className="spin" size={18} strokeWidth={2.4} />;
  if (state === "error") return <AlertCircle size={17} strokeWidth={2.4} />;
  return <Circle size={17} strokeWidth={2.2} />;
};

function PopupApp() {
  const [options, setOptions] = useState<IpeOptions>(DEFAULT_OPTIONS);
  const [status, setStatus] = useState<IpeStatus>(statusFallback);
  const [activeTabId, setActiveTabId] = useState<number>();
  const [stepsState, setStepsState] = useState<Record<StepKey, StepState>>(initialStepState);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("No data leaves your device");
  const [lastPayload, setLastPayload] = useState<ProfileExportPayload>();

  const ready = status.ready || !hasChromeRuntime();

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const loadedOptions = await getLocalOptions();
      if (!mounted) return;
      setOptions(loadedOptions);

      if (!hasChromeRuntime()) {
        setStatus({
          isIndeed: true,
          ready: true,
          reason: "You're on your own profile page.",
          title: "Design preview"
        });
        return;
      }

      const tab = await queryActiveTab();
      setActiveTabId(tab?.id);

      if (!tab?.id || !tab.url?.includes("indeed.")) {
        setStatus(statusFallback());
        return;
      }

      try {
        const pageStatus = await sendTabMessage<IpeStatus>(tab.id, { action: "IPE_GET_STATUS" });
        setStatus(pageStatus);
      } catch {
        setStatus({
          isIndeed: true,
          ready: false,
          reason: "Refresh the Indeed profile page, then open IPE again.",
          url: tab.url,
          title: tab.title
        });
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const collectPayload = async (): Promise<ProfileExportPayload> => {
    if (!hasChromeRuntime()) return demoPayload();
    if (!activeTabId) throw new Error("No active Indeed tab was found.");
    return sendTabMessage<ProfileExportPayload>(activeTabId, {
      action: "IPE_EXPORT_PROFILE",
      options
    });
  };

  const markStep = (step: StepKey, state: StepState) =>
    setStepsState((current) => ({
      ...current,
      [step]: state
    }));

  const runExport = async (format: ExportFormat | "preview") => {
    setBusy(true);
    setNotice("Export running locally...");
    setStepsState(initialStepState);

    try {
      markStep("expand", "active");
      await delay(options.showProgress ? 260 : 0);
      markStep("expand", "done");

      markStep("collect", "active");
      const payload = await collectPayload();
      setLastPayload(payload);
      markStep("collect", "done");

      markStep("create", "active");
      await delay(options.showProgress ? 220 : 0);

      if (format === "json") {
        if (hasChromeRuntime()) {
          await sendRuntimeMessage<null>({ action: "IPE_SAVE_JSON", payload });
        } else {
          console.info("IPE JSON preview", payload);
        }
        setNotice("JSON export prepared");
      } else if (format === "pdf") {
        await sendRuntimeMessage<null>({ action: "IPE_PRINT_PDF", payload });
        setNotice("Print page opened");
      } else if (format === "preview") {
        await sendRuntimeMessage<null>({ action: "IPE_PREVIEW_HTML", payload });
        setNotice("HTML preview opened");
      } else {
        await downloadHtml(payload);
        setNotice("HTML export prepared");
      }

      markStep("create", "done");
      if (options.minimizeAfterExport) {
        await delay(800);
        window.close();
      }
    } catch (error) {
      markStep("create", "error");
      setNotice(error instanceof Error ? error.message : "IPE export failed.");
    } finally {
      setBusy(false);
    }
  };

  const primaryLabel = useMemo(() => {
    if (options.defaultFormat === "json") return "Export JSON";
    if (options.defaultFormat === "pdf") return "Print PDF";
    return "Export Profile";
  }, [options.defaultFormat]);

  const openOptions = async () => {
    if (hasChromeRuntime()) {
      await chrome.runtime.openOptionsPage();
    }
  };

  return (
    <main className="ipe-popup">
      <header className="popup-header">
        <div className="brand-lockup">
          <div className="ipe-logo" aria-hidden="true">
            IPE
          </div>
          <div>
            <h1>Indeed Profile Exporter</h1>
            <span>v{EXTENSION_VERSION}</span>
          </div>
        </div>
        <button className="icon-button" type="button" aria-label="Open IPE settings" onClick={openOptions}>
          <Settings size={22} />
        </button>
      </header>

      <section className={`status-card ${ready ? "ready" : "blocked"}`}>
        <div className="status-icon" aria-hidden="true">
          {ready ? <Check size={20} strokeWidth={3} /> : <AlertCircle size={20} />}
        </div>
        <div>
          <strong>{ready ? "Ready on Indeed profile" : "Profile page needed"}</strong>
          <p>{status.reason || "You're on your own profile page."}</p>
        </div>
        <span className="pulse-dot" aria-hidden="true" />
      </section>

      <button
        className="primary-action"
        type="button"
        disabled={!ready || busy}
        onClick={() => void runExport(options.defaultFormat)}
      >
        <CloudDownload size={25} />
        <span>{busy ? "Exporting..." : primaryLabel}</span>
        <small>Expand, collect and export your profile</small>
      </button>

      <section className="quick-actions" aria-label="Export actions">
        <button type="button" disabled={!ready || busy} onClick={() => void runExport("preview")}>
          <Code2 size={21} />
          <span>Preview HTML</span>
        </button>
        <button type="button" disabled={!ready || busy} onClick={() => void runExport("json")}>
          <Braces size={21} />
          <span>Save JSON</span>
        </button>
        <button type="button" disabled={!ready || busy} onClick={() => void runExport("pdf")}>
          <Printer size={21} />
          <span>Print PDF</span>
        </button>
      </section>

      <section className="progress-panel" aria-label="Export progress">
        {steps.map((step) => (
          <article className={`progress-row ${stepsState[step.key]}`} key={step.key}>
            <div className="progress-marker">{stepIcon(stepsState[step.key])}</div>
            <div>
              <h2>{step.title}</h2>
              <p>{step.detail}</p>
            </div>
            <time>{stepsState[step.key] === "done" ? "done" : stepsState[step.key] === "active" ? "now" : "-"}</time>
          </article>
        ))}
      </section>

      <footer className="popup-footer">
        <span>
          <ShieldCheck size={18} />
          Local only
        </span>
        <small>{lastPayload ? `Last export: ${lastPayload.profile.name || "Indeed profile"}` : notice}</small>
      </footer>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <PopupApp />
  </React.StrictMode>
);

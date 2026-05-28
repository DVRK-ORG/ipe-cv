import { PRINT_STORAGE_PREFIX } from "../shared/constants";

import "./print.css";

const root = document.querySelector<HTMLDivElement>("#print-root");
const params = new URLSearchParams(location.search);
const id = params.get("id");
const shouldPrint = params.get("print") === "1";

const showMessage = (title: string, body: string): void => {
  if (!root) return;
  root.innerHTML = `
    <main class="empty-state">
      <div class="ipe-mark">IPE</div>
      <h1>${title}</h1>
      <p>${body}</p>
    </main>`;
};

const load = async (): Promise<void> => {
  if (!root || !id || typeof chrome === "undefined" || !chrome.storage?.local) {
    showMessage("Preview unavailable", "Open this page from the IPE extension after creating an export.");
    return;
  }

  const key = `${PRINT_STORAGE_PREFIX}${id}`;
  const stored = await chrome.storage.local.get(key);
  const html = stored[key] as string | undefined;

  if (!html) {
    showMessage("Export expired", "Create a fresh export from the IPE popup.");
    return;
  }

  const iframe = document.createElement("iframe");
  iframe.title = "Indeed profile export preview";
  iframe.className = "print-frame";
  iframe.srcdoc = html;
  root.replaceChildren(iframe);

  // Clean up the temporary storage key now that the HTML has been loaded into the iframe
  chrome.storage.local.remove(key).catch((error) => {
    console.error("Failed to clean up print preview storage:", error);
  });

  iframe.addEventListener("load", () => {
    if (shouldPrint) {
      window.setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      }, 350);
    }
  });
};

void load();

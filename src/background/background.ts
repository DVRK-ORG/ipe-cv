import {
  DEFAULT_OPTIONS,
  EXTENSION_VERSION,
  OPTIONS_STORAGE_KEY,
  PRINT_STORAGE_PREFIX
} from "../shared/constants";
import { buildHtmlDocument, makeExportFilename } from "../shared/exportHtml";
import type { ExportRequest, ExportResponse, IpeOptions, ProfileExportPayload } from "../shared/types";

const mergeOptions = (value?: Partial<IpeOptions>): IpeOptions => ({
  ...DEFAULT_OPTIONS,
  ...(value || {})
});

const getOptions = async (): Promise<IpeOptions> => {
  const stored = await chrome.storage.local.get(OPTIONS_STORAGE_KEY);
  return mergeOptions(stored[OPTIONS_STORAGE_KEY] as Partial<IpeOptions> | undefined);
};

const saveOptions = async (options?: IpeOptions): Promise<IpeOptions> => {
  const merged = mergeOptions(options);
  await chrome.storage.local.set({ [OPTIONS_STORAGE_KEY]: merged });
  return merged;
};

const dataUrl = (mime: string, content: string): string =>
  `data:${mime};charset=utf-8,${encodeURIComponent(content)}`;

const downloadText = async (filename: string, mime: string, content: string): Promise<void> => {
  await chrome.downloads.download({
    url: dataUrl(mime, content),
    filename,
    saveAs: true,
    conflictAction: "uniquify"
  });
};

const requirePayload = (payload?: ProfileExportPayload): ProfileExportPayload => {
  if (!payload) throw new Error("No profile export payload was provided.");
  return {
    ...payload,
    meta: {
      ...payload.meta,
      extensionVersion: payload.meta.extensionVersion || EXTENSION_VERSION
    }
  };
};

const openPrintPage = async (payload: ProfileExportPayload, autoPrint: boolean): Promise<void> => {
  const id = crypto.randomUUID();
  const html = buildHtmlDocument(payload);
  await chrome.storage.local.set({ [`${PRINT_STORAGE_PREFIX}${id}`]: html });
  const url = chrome.runtime.getURL(`print.html?id=${encodeURIComponent(id)}&print=${autoPrint ? "1" : "0"}`);
  await chrome.tabs.create({ url, active: true });
};

chrome.runtime.onInstalled.addListener(async () => {
  const stored = await chrome.storage.local.get(OPTIONS_STORAGE_KEY);
  if (!stored[OPTIONS_STORAGE_KEY]) {
    await saveOptions(DEFAULT_OPTIONS);
  }
});

chrome.runtime.onMessage.addListener((request: ExportRequest, _sender, sendResponse) => {
  const respond = <T>(response: ExportResponse<T>) => sendResponse(response);

  (async () => {
    switch (request.action) {
      case "IPE_GET_OPTIONS": {
        respond<IpeOptions>({ ok: true, data: await getOptions() });
        return;
      }

      case "IPE_SAVE_OPTIONS": {
        respond<IpeOptions>({ ok: true, data: await saveOptions(request.options) });
        return;
      }

      case "IPE_SAVE_JSON": {
        const payload = requirePayload(request.payload);
        await downloadText(
          makeExportFilename(payload, "json"),
          "application/json",
          JSON.stringify(payload, null, 2)
        );
        respond({ ok: true, data: null });
        return;
      }

      case "IPE_PREVIEW_HTML": {
        const payload = requirePayload(request.payload);
        await openPrintPage(payload, false);
        respond({ ok: true, data: null });
        return;
      }

      case "IPE_PRINT_PDF": {
        const payload = requirePayload(request.payload);
        await openPrintPage(payload, true);
        respond({ ok: true, data: null });
        return;
      }

      default:
        respond({ ok: false, error: `Unsupported IPE action: ${request.action}` });
    }
  })().catch((error: unknown) => {
    respond({ ok: false, error: error instanceof Error ? error.message : String(error) });
  });

  return true;
});

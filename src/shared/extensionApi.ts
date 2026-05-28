import { DEFAULT_OPTIONS } from "./constants";
import type { ExportRequest, ExportResponse, IpeOptions } from "./types";

export const hasChromeRuntime = (): boolean =>
  typeof chrome !== "undefined" && Boolean(chrome.runtime?.id);

export const getLocalOptions = async (): Promise<IpeOptions> => {
  if (!hasChromeRuntime()) return DEFAULT_OPTIONS;
  const response = await chrome.runtime.sendMessage<ExportRequest, ExportResponse<IpeOptions>>({
    action: "IPE_GET_OPTIONS"
  });
  return response?.ok && response.data ? response.data : DEFAULT_OPTIONS;
};

export const saveLocalOptions = async (options: IpeOptions): Promise<IpeOptions> => {
  if (!hasChromeRuntime()) return options;
  const response = await chrome.runtime.sendMessage<ExportRequest, ExportResponse<IpeOptions>>({
    action: "IPE_SAVE_OPTIONS",
    options
  });
  if (!response?.ok || !response.data) {
    throw new Error(response?.error || "Could not save IPE options.");
  }
  return response.data;
};

export const sendRuntimeMessage = async <T>(request: ExportRequest): Promise<T> => {
  if (!hasChromeRuntime()) {
    throw new Error("Chrome extension APIs are available only after loading IPE as an extension.");
  }
  const response = await chrome.runtime.sendMessage<ExportRequest, ExportResponse<T>>(request);
  if (!response?.ok) throw new Error(response?.error || "IPE request failed.");
  return response.data as T;
};

import type { IpeOptions } from "./types";

export const EXTENSION_NAME = "Indeed Profile Exporter";
export const EXTENSION_SHORT_NAME = "IPE";
export const EXTENSION_VERSION = "1.0.0";
export const OPTIONS_STORAGE_KEY = "ipe-options";
export const PRINT_STORAGE_PREFIX = "ipe-print-";

export const DEFAULT_OPTIONS: IpeOptions = {
  autoExpand: true,
  showProgress: true,
  minimizeAfterExport: false,
  includeResumeCard: true,
  includeContactDetails: true,
  includeJobPreferences: true,
  privacyLocalOnly: true,
  defaultFormat: "html"
};

export const INDEED_HOST_PATTERNS = [
  "indeed.com",
  "indeed.co.uk",
  "indeed.ca",
  "indeed.com.au",
  "indeed.de",
  "indeed.fr",
  "indeed.nl",
  "indeed.es",
  "indeed.it",
  "indeed.co.in",
  "indeed.ae",
  "indeed.com.br",
  "indeed.com.mx",
  "indeed.sg",
  "indeed.com.sg",
  "indeed.co.jp"
];

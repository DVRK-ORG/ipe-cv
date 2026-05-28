export type ExportFormat = "html" | "json" | "pdf";

export type IpeAction =
  | "IPE_GET_STATUS"
  | "IPE_EXPORT_PROFILE"
  | "IPE_PREVIEW_HTML"
  | "IPE_SAVE_JSON"
  | "IPE_PRINT_PDF"
  | "IPE_GET_OPTIONS"
  | "IPE_SAVE_OPTIONS";

export interface IpeOptions {
  autoExpand: boolean;
  showProgress: boolean;
  minimizeAfterExport: boolean;
  includeResumeCard: boolean;
  includeContactDetails: boolean;
  includeJobPreferences: boolean;
  privacyLocalOnly: boolean;
  defaultFormat: ExportFormat;
}

export interface IpeStatus {
  isIndeed: boolean;
  ready: boolean;
  reason?: string;
  url?: string;
  title?: string;
}

export interface ProfileContact {
  email?: string;
  phone?: string;
  location?: string;
  lines: string[];
}

export interface ResumeCard {
  title?: string;
  added?: string;
  fileType?: string;
  text?: string;
}

export interface ProfileSection {
  heading: string;
  summary: string;
  items: string[];
}

export interface ProfileExportPayload {
  meta: {
    extensionName: "Indeed Profile Exporter";
    extensionShortName: "IPE";
    extensionVersion: string;
    exportedAt: string;
    sourceUrl: string;
    pageTitle: string;
  };
  profile: {
    name?: string;
    initials?: string;
    contact: ProfileContact;
    visibility?: string;
  };
  resume?: ResumeCard;
  sections: ProfileSection[];
  rawText: string;
}

export interface ExportRequest {
  action: IpeAction;
  options?: IpeOptions;
  payload?: ProfileExportPayload;
  format?: ExportFormat;
}

export interface ExportResponse<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
}

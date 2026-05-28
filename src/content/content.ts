import type {
  ExportRequest,
  ExportResponse,
  IpeOptions,
  IpeStatus,
  ProfileContact,
  ProfileExportPayload,
  ProfileSection,
  ResumeCard
} from "../shared/types";

const EXTENSION_VERSION = "1.0.0";
const HEADING_SELECTOR = "h1, h2, h3, [role='heading']";
const SECTION_SELECTOR = "section, article, [data-testid], [class*='section' i], [class*='card' i], div";
const DETAIL_CONTROL_SELECTOR =
  "a[href], button, [role='button'], [role='link'], [tabindex]:not([tabindex='-1']), [onclick]";
const DETAIL_ROW_SELECTOR =
  "a[href], button, [role='button'], [role='link'], [tabindex]:not([tabindex='-1']), [onclick], li, article, section, [data-testid], [class*='row' i], [class*='item' i], [class*='card' i], [class*='tile' i], [class*='link' i], div";
const JOB_PREF_KEYWORDS = /job preferences|hide jobs|ready to work|desired pay|schedule|job match/i;
const EMAIL_PATTERN = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const PROFILE_ROW_PAIRS = [
  ["Qualifications", "Highlight your skills and experience."],
  ["Job preferences", "Save specific details like minimum desired pay and schedule."],
  ["Hide jobs with these details", "Manage the qualifications or preferences used to hide jobs from your search."],
  ["Ready to work", "Let employers know that you're available to start working as soon as possible."]
] as const;

const sleep = (ms: number): Promise<void> => new Promise((resolve) => window.setTimeout(resolve, ms));

const isIndeedHost = (): boolean => location.hostname.split(".").includes("indeed");

const normalize = (value: string | null | undefined): string =>
  (value || "").replace(/\s+/g, " ").trim();

const unique = (values: Array<string | undefined>): string[] => {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    const clean = normalize(value);
    const key = clean.toLowerCase();
    if (clean && !seen.has(key)) {
      seen.add(key);
      result.push(clean);
    }
  }
  return result;
};

const cleanupPdfTitle = (value?: string): string | undefined => {
  const clean = normalize(value)
    .replace(/\b([A-Z])\s+([a-z]+\.pdf\b)/g, "$1$2")
    .replace(/^resume\s+pdf\s+/i, "")
    .replace(/\s+PDF$/i, ".pdf");
  return clean || undefined;
};

const isIndeedChromeLine = (line: string): boolean => {
  const clean = normalize(line);
  return (
    /^(skip to main content|start of main content|new update)$/i.test(clean) ||
    /^(profile|my reviews|settings|help|privacy center|sign out)$/i.test(clean) ||
    /^(employers\s*\/\s*post job|home|company reviews|find salaries)$/i.test(clean) ||
    /^messages(?:\s+unread count\s+\d+)?$/i.test(clean) ||
    /^unread count\s+\d+$/i.test(clean) ||
    /^(?:\u00a9)?20\d{2}\s+indeed\b/i.test(clean) ||
    /^cookies,\s*privacy\s+and\s+terms$/i.test(clean) ||
    /^cookies$|^privacy$|^terms$/i.test(clean)
  );
};

const isUiGlyphLine = (line: string): boolean => {
  const clean = normalize(line);
  return clean.length <= 6 && (/^[›»>‹<⌄⌃⌵⌃⋯….-]+$/.test(clean) || /^â€[º¹œ]+$/i.test(clean));
};

const isElementVisible = (element: Element | null): boolean => {
  if (!(element instanceof HTMLElement) && !(element instanceof SVGElement)) return false;
  const style = window.getComputedStyle(element);
  const rect = element.getBoundingClientRect();
  return style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0" && rect.width > 0 && rect.height > 0;
};

const visibleText = (root: ParentNode = document.body): string[] => {
  const lines: string[] = [];
  const seen = new Set<string>();
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const text = normalize(node.textContent);
      const parent = node.parentElement;
      if (!text || !parent || !isElementVisible(parent)) return NodeFilter.FILTER_REJECT;
      if (["SCRIPT", "STYLE", "NOSCRIPT", "SVG"].includes(parent.tagName)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });

  while (walker.nextNode()) {
    const text = normalize(walker.currentNode.textContent);
    if (text.length > 1 && !seen.has(text)) {
      seen.add(text);
      lines.push(text);
    }
  }

  return lines;
};

const clickIfClosed = async (element: Element): Promise<boolean> => {
  if (!(element instanceof HTMLElement)) return false;
  if (!isElementVisible(element)) return false;
  const expanded = element.getAttribute("aria-expanded");
  const text = normalize(element.textContent).toLowerCase();
  const label = normalize(element.getAttribute("aria-label")).toLowerCase();
  const isDisclosure =
    expanded === "false" ||
    /expand|show more|show all|\bmore\b/i.test(`${text} ${label}`);

  const isUnsafe =
    /delete|remove|upload|download|sign out|post job|employers|message|notification|menu|share|report|block/i.test(
      `${text} ${label}`
    ) && expanded !== "false";

  if (!isDisclosure || isUnsafe) return false;
  element.click();
  await sleep(160);
  return true;
};

const cleanupDetailLines = (heading: string, fallbackSummary: string, lines: string[]): string[] =>
  unique(lines).filter((line) => {
    if (line === heading || line === fallbackSummary) return false;
    if (isUiGlyphLine(line)) return false;
    if (/^(save|cancel|close|done|back|edit|remove|delete|add|skip|continue)$/i.test(line)) return false;
    if (/^(indeed|home|company reviews|find salaries|employers|post job)$/i.test(line)) return false;
    if (isIndeedChromeLine(line)) return false;
    return true;
  });

const isUnsafeDetailControl = (element: HTMLElement): boolean => {
  const text = normalize(element.textContent);
  const label = normalize(element.getAttribute("aria-label"));
  const href = element instanceof HTMLAnchorElement ? element.href : "";
  return /delete|remove|upload|download|sign out|employers\s*\/\s*post job|post job|message|notification|share|report|block|cookies|privacy|terms/i.test(
    `${text} ${label} ${href}`
  );
};

const textMatchesProfileRow = (text: string, heading: string, fallbackSummary: string): boolean => {
  const clean = normalize(text).toLowerCase();
  const headingKey = heading.toLowerCase();
  const summaryKey = fallbackSummary.toLowerCase();
  return clean === headingKey || clean.startsWith(`${headingKey} `) || (clean.includes(headingKey) && clean.includes(summaryKey));
};

const detailControlScore = (element: HTMLElement, heading: string, fallbackSummary: string): number => {
  const text = normalize(element.textContent);
  const label = normalize(element.getAttribute("aria-label"));
  const style = window.getComputedStyle(element);
  const rect = element.getBoundingClientRect();
  const combined = `${text} ${label}`;
  let score = 0;

  if (element.matches("a[href], button, [role='button'], [role='link']")) score += 40;
  if (element.matches("[onclick], [tabindex]:not([tabindex='-1'])")) score += 20;
  if (style.cursor === "pointer") score += 16;
  if (textMatchesProfileRow(combined, heading, fallbackSummary)) score += 38;
  if (normalize(text).toLowerCase() === heading.toLowerCase()) score += 14;
  if (combined.toLowerCase().includes(fallbackSummary.toLowerCase())) score += 12;
  if (rect.width > 160 && rect.height > 32) score += 8;
  if (text.length > 220) score -= 12;
  if (text.length > 520) score -= 36;

  return score;
};

const addDetailCandidate = (
  candidates: Map<HTMLElement, number>,
  element: Element | null | undefined,
  heading: string,
  fallbackSummary: string
): void => {
  if (!(element instanceof HTMLElement)) return;
  if (!isElementVisible(element) || isUnsafeDetailControl(element)) return;
  const score = detailControlScore(element, heading, fallbackSummary);
  if (score <= 0) return;
  candidates.set(element, Math.max(candidates.get(element) || 0, score));
};

const findDetailControl = (heading: string): HTMLElement | undefined => {
  const candidates = new Map<HTMLElement, number>();

  for (const element of Array.from(document.querySelectorAll<HTMLElement>(DETAIL_CONTROL_SELECTOR))) {
    if (element.closest("[role='dialog'], [aria-modal='true']")) continue;
    const text = `${normalize(element.textContent)} ${normalize(element.getAttribute("aria-label"))}`;
    if (textMatchesProfileRow(text, heading, PROFILE_ROW_PAIRS.find(([row]) => row === heading)?.[1] || "")) {
      addDetailCandidate(candidates, element, heading, PROFILE_ROW_PAIRS.find(([row]) => row === heading)?.[1] || "");
    }
  }

  const fallbackSummary = PROFILE_ROW_PAIRS.find(([row]) => row === heading)?.[1] || "";
  const textElements = Array.from(document.querySelectorAll<HTMLElement>("h1, h2, h3, h4, p, span, div")).filter((element) => {
    if (!isElementVisible(element)) return false;
    if (element.closest("[role='dialog'], [aria-modal='true']")) return false;
    const text = normalize(element.textContent);
    return text === heading || textMatchesProfileRow(text, heading, fallbackSummary);
  });

  for (const textElement of textElements) {
    let node: HTMLElement | null = textElement;
    for (let depth = 0; node && depth < 8; depth += 1, node = node.parentElement) {
      if (node.closest("[role='dialog'], [aria-modal='true']")) break;
      if (node.matches(DETAIL_CONTROL_SELECTOR)) {
        addDetailCandidate(candidates, node, heading, fallbackSummary);
      }

      const row = node.closest<HTMLElement>(DETAIL_ROW_SELECTOR);
      if (row && normalize(row.textContent).toLowerCase().includes(heading.toLowerCase())) {
        addDetailCandidate(candidates, row, heading, fallbackSummary);
        const childControl = Array.from(row.querySelectorAll<HTMLElement>(DETAIL_CONTROL_SELECTOR))
          .filter((element) => isElementVisible(element) && !isUnsafeDetailControl(element))
          .sort((a, b) => detailControlScore(b, heading, fallbackSummary) - detailControlScore(a, heading, fallbackSummary))[0];
        addDetailCandidate(candidates, childControl, heading, fallbackSummary);
      }
    }
  }

  return Array.from(candidates.entries())
    .sort((a, b) => b[1] - a[1] || normalize(a[0].textContent).length - normalize(b[0].textContent).length)[0]?.[0];
};

const visibleDialogRoots = (): HTMLElement[] =>
  Array.from(
    document.querySelectorAll<HTMLElement>(
      "[role='dialog'], [aria-modal='true'], [data-testid*='modal' i], [data-testid*='drawer' i], [data-testid*='overlay' i], [class*='modal' i], [class*='drawer' i], [class*='sidepanel' i], [class*='side-panel' i], [class*='overlay' i]"
    )
  )
    .filter((element) => isElementVisible(element) && visibleText(element).length > 1)
    .sort((a, b) => b.getBoundingClientRect().width * b.getBoundingClientRect().height - a.getBoundingClientRect().width * a.getBoundingClientRect().height);

const closeDetailPanel = async (originalUrl: string): Promise<void> => {
  const closeCandidates = Array.from(
    document.querySelectorAll<HTMLElement>(
      "button[aria-label*='close' i], button[aria-label*='back' i], button[aria-label*='cancel' i], [role='button'][aria-label*='close' i], [role='button'][aria-label*='back' i], [role='button'][aria-label*='cancel' i], button, [role='button']"
    )
  ).filter((element) => {
    if (!isElementVisible(element)) return false;
    const text = normalize(element.textContent);
    const label = normalize(element.getAttribute("aria-label"));
    return /^(close|back|cancel|done)$/i.test(text) || /close|back|cancel/i.test(label);
  });

  const closeButton = closeCandidates[0];
  if (closeButton) {
    closeButton.click();
    await sleep(220);
  }

  if (location.href !== originalUrl) {
    history.back();
    await sleep(600);
  }
};

const captureDetailPanel = async (heading: string, fallbackSummary: string): Promise<string[]> => {
  const control = findDetailControl(heading);
  if (!control) return [];

  const originalUrl = location.href;
  const before = new Set(visibleText(document.querySelector("main") || document.body).map((line) => line.toLowerCase()));
  control.scrollIntoView({ block: "center", inline: "nearest" });
  await sleep(100);
  control.click();

  let captured: string[] = [];
  let lastCaptureKey = "";
  let stableCaptures = 0;

  for (let attempt = 0; attempt < 34; attempt += 1) {
    await sleep(150);
    const dialogs = visibleDialogRoots();
    if (dialogs.length) {
      const candidate = cleanupDetailLines(heading, fallbackSummary, visibleText(dialogs[0]));
      const key = candidate.join("\n");
      stableCaptures = key && key === lastCaptureKey ? stableCaptures + 1 : 0;
      lastCaptureKey = key;
      captured = candidate;
      if (candidate.length && stableCaptures >= 1) break;
      continue;
    }

    const currentLines = visibleText(document.querySelector("main") || document.body);
    const changedLines = currentLines.filter((line) => !before.has(line.toLowerCase()));
    if (changedLines.length || location.href !== originalUrl) {
      const candidate = cleanupDetailLines(heading, fallbackSummary, changedLines.length ? changedLines : currentLines);
      const key = candidate.join("\n");
      stableCaptures = key && key === lastCaptureKey ? stableCaptures + 1 : 0;
      lastCaptureKey = key;
      if (candidate.length) captured = candidate;
      if (candidate.length && stableCaptures >= 2) break;
    }
  }

  await closeDetailPanel(originalUrl);
  return captured;
};

const captureProfileRowDetails = async (options: IpeOptions): Promise<Record<string, string[]>> => {
  const details: Record<string, string[]> = {};

  for (const [heading, fallbackSummary] of PROFILE_ROW_PAIRS) {
    if (!options.includeJobPreferences && JOB_PREF_KEYWORDS.test(heading)) continue;
    const lines = await captureDetailPanel(heading, fallbackSummary);
    if (lines.length) details[heading] = lines;
  }

  return details;
};

const expandSections = async (options: IpeOptions): Promise<number> => {
  if (!options.autoExpand) return 0;
  let expanded = 0;

  document.querySelectorAll("details:not([open])").forEach((details) => {
    (details as HTMLDetailsElement).open = true;
    expanded += 1;
  });

  const selectors = [
    "button[aria-expanded='false']",
    "[role='button'][aria-expanded='false']",
    "button[aria-controls]",
    "[role='button'][aria-controls]",
    "button[aria-label*='expand' i]",
    "button[aria-label*='show' i]",
    "button"
  ];

  for (let pass = 0; pass < 2; pass += 1) {
    for (const selector of selectors) {
      for (const element of Array.from(document.querySelectorAll(selector)).slice(0, 80)) {
        if (await clickIfClosed(element)) expanded += 1;
      }
    }
    window.scrollTo({ top: document.body.scrollHeight, left: 0 });
    await sleep(250);
  }

  window.scrollTo({ top: 0, left: 0 });
  await sleep(180);
  return expanded;
};

const isIndeedProfilePage = (): boolean => {
  if (!isIndeedHost()) return false;
  const isProfileHost = location.hostname.startsWith("profile.indeed.");
  const isProfilePath = location.pathname.startsWith("/profile");
  const hasProfileHeading = !!document.querySelector("main h1, h1, [class*='profile' i]");
  return (isProfileHost || isProfilePath) && hasProfileHeading;
};

const getStatus = (): IpeStatus => {
  const isIndeed = isIndeedHost();
  const ready = isIndeedProfilePage();
  return {
    isIndeed,
    ready,
    reason: ready ? "You're on your own profile page." : "Open your own Indeed profile page to export.",
    url: location.href,
    title: document.title
  };
};

const extractName = (): string | undefined => {
  const h1 = document.querySelector("main h1, h1");
  const name = normalize(h1?.textContent);
  if (name && name.length < 90) return name;
  const titleName = document.title.split("|")[0]?.replace(/Indeed.*/i, "");
  return normalize(titleName) || undefined;
};

const makeInitials = (name?: string): string | undefined => {
  if (!name) return undefined;
  const parts = name.split(/\s+/).filter(Boolean).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase()).join("") || undefined;
};

const extractContact = (lines: string[], includeDetails: boolean): ProfileContact => {
  const emailCandidates: string[] = [];

  lines.forEach((line, index) => {
    emailCandidates.push(...(line.match(EMAIL_PATTERN) || []));

    const firstEmail = line.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0];
    const localPart = firstEmail?.split("@")[0];
    const previousToken = lines[index - 1]?.split(/\s+/).pop();
    if (firstEmail && localPart && localPart.length <= 2 && previousToken && /^[a-z0-9._%+-]{3,}$/i.test(previousToken)) {
      const repaired = `${previousToken}${firstEmail}`;
      if (EMAIL_PATTERN.test(repaired)) emailCandidates.push(repaired);
      EMAIL_PATTERN.lastIndex = 0;
    }
  });

  const email = unique(emailCandidates)
    .filter((candidate) => candidate.split("@")[0].length > 1)
    .sort((a, b) => b.split("@")[0].length - a.split("@")[0].length || b.length - a.length)[0];
  const phone = lines.find((line) => /\+?\d[\d\s().-]{6,}\d/.test(line) && !/@/.test(line));
  const location = lines.find(
    (line) =>
      !line.includes("@") &&
      !/\+?\d[\d\s().-]{6,}\d/.test(line) &&
      /(country|city|state|province|bahrain|uae|united|saudi|riyadh|dubai|manama|remote|,)/i.test(line)
  );
  const contactLines = [email, phone, location].filter(Boolean) as string[];

  if (!includeDetails) {
    return { lines: [] };
  }

  return {
    email,
    phone,
    location,
    lines: contactLines
  };
};

const extractVisibility = (lines: string[]): string | undefined =>
  lines.find((line) => /employers can find you|ready to work|not searchable|hidden from employers/i.test(line));

const extractResume = (lines: string[], includeResume: boolean): ResumeCard | undefined => {
  if (!includeResume) return undefined;
  const resumeHeadingIndex = lines.findIndex((line) => /^resume$/i.test(line));
  const sectionEnd = lines.findIndex(
    (line, index) => index > resumeHeadingIndex && /^(improve your job matches|qualifications|job preferences|hide jobs with these details|ready to work)$/i.test(line)
  );
  const resumeLines =
    resumeHeadingIndex >= 0
      ? lines.slice(resumeHeadingIndex, sectionEnd > resumeHeadingIndex ? sectionEnd : Math.min(lines.length, resumeHeadingIndex + 8))
      : lines;
  const pdfLine = unique(resumeLines.filter((line) => /\.pdf\b/i.test(line)).map(cleanupPdfTitle)).sort(
    (a, b) => b.length - a.length
  )[0];
  const fileTypeLine = resumeLines.find((line) => /^pdf$/i.test(line));
  const addedLine = lines.find((line) => /^added\b/i.test(line));

  if (!pdfLine && !fileTypeLine && resumeHeadingIndex === -1) return undefined;

  return {
    title: pdfLine,
    added: addedLine || resumeLines.find((line) => /^added\b/i.test(line)),
    fileType: pdfLine || fileTypeLine ? "PDF" : undefined,
    text: unique(
      resumeLines.filter(
        (line) =>
          !/^resume$/i.test(line) &&
          !/^pdf$/i.test(line) &&
          !/^added\b/i.test(line) &&
          cleanupPdfTitle(line) !== pdfLine
      )
    ).join(" ")
  };
};

const textFromElement = (element: Element): string[] => visibleText(element);

const getKnownJobMatchSection = (
  lines: string[],
  options: IpeOptions,
  detailLines: Record<string, string[]>
): ProfileSection | undefined => {
  const hasJobMatchGroup = lines.some((line) => /^improve your job matches$/i.test(line));
  const items = PROFILE_ROW_PAIRS.flatMap(([heading, fallbackDescription]) => {
    if (!options.includeJobPreferences && JOB_PREF_KEYWORDS.test(heading)) return [];
    const index = lines.findIndex((line) => line.toLowerCase() === heading.toLowerCase());
    if (index === -1) return [];
    const description = lines[index + 1] && !PROFILE_ROW_PAIRS.some(([row]) => row.toLowerCase() === lines[index + 1].toLowerCase())
      ? lines[index + 1]
      : fallbackDescription;
    const extra = detailLines[heading]?.length ? ` (${detailLines[heading].length} details captured)` : "";
    return [`${heading}: ${description}${extra}`];
  });

  if (!hasJobMatchGroup && !items.length) return undefined;

  return {
    heading: "Improve your job matches",
    summary: "Visible profile-improvement sections captured from Indeed.",
    items
  };
};

const isProfileShellHeading = (title: string, name?: string): boolean =>
  title === name ||
  /^indeed$|^home$|company reviews|find salaries|employers|^resume$|^improve your job matches$/i.test(title);

const extractSections = (options: IpeOptions, detailLines: Record<string, string[]>): ProfileSection[] => {
  const main = document.querySelector("main") || document.body;
  const allLines = visibleText(main);
  const name = extractName();
  const headings = Array.from(main.querySelectorAll(HEADING_SELECTOR));
  const sections: ProfileSection[] = [];
  const seen = new Set<string>();
  const jobMatchSection = getKnownJobMatchSection(allLines, options, detailLines);

  if (jobMatchSection) {
    sections.push(jobMatchSection);
    seen.add(jobMatchSection.heading.toLowerCase());
  }

  for (const heading of headings) {
    if (!isElementVisible(heading)) continue;
    const title = normalize(heading.textContent);
    if (!title || title.length > 80) continue;
    if (heading.tagName === "H1") continue;
    if (isProfileShellHeading(title, name)) continue;
    if (!options.includeJobPreferences && JOB_PREF_KEYWORDS.test(title)) continue;
    if (!options.includeResumeCard && /resume/i.test(title)) continue;
    const container = heading.closest(SECTION_SELECTOR) || heading.parentElement || heading;
    const lines = textFromElement(container).filter((line) => line !== title && line !== name && !isUiGlyphLine(line) && !isIndeedChromeLine(line));
    const summary = lines[0] || "";
    const items = unique([...lines.slice(1, 10), ...(detailLines[title] || [])]);
    const key = `${title}:${summary}`;

    if (!seen.has(key) && (summary || items.length)) {
      seen.add(key);
      sections.push({ heading: title, summary, items });
    }
  }

  for (const [heading, fallbackSummary] of PROFILE_ROW_PAIRS) {
    if (!options.includeJobPreferences && JOB_PREF_KEYWORDS.test(heading)) continue;
    if (sections.some((section) => section.heading.toLowerCase() === heading.toLowerCase())) continue;
    const details = detailLines[heading] || [];
    const isVisible = allLines.some((line) => line.toLowerCase() === heading.toLowerCase());
    if (isVisible || details.length) {
      sections.push({
        heading,
        summary: fallbackSummary,
        items: details
      });
    }
  }

  if (sections.length) return sections.slice(0, 18);

  return visibleText(main)
    .filter((line) => line.length > 18)
    .slice(0, 10)
    .map((line, index) => ({
      heading: index === 0 ? "Profile summary" : `Profile detail ${index + 1}`,
      summary: line,
      items: []
    }));
};

const stripExcludedText = (
  lines: string[],
  contact: ProfileContact,
  options: IpeOptions
): string[] => {
  const blocked = new Set<string>();
  if (!options.includeContactDetails) {
    contact.lines.forEach((line) => blocked.add(line));
    lines
      .filter(
        (line) =>
          /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(line) ||
          /\+?\d[\d\s().-]{6,}\d/.test(line) ||
          /(country|city|state|province|bahrain|uae|united|saudi|riyadh|dubai|manama|remote|,)/i.test(line)
      )
      .forEach((line) => blocked.add(line));
  }
  if (!options.includeResumeCard) {
    lines.filter((line) => /\.pdf\b|^resume$|^added\b/i.test(line)).forEach((line) => blocked.add(line));
  }
  if (!options.includeJobPreferences) {
    lines.filter((line) => JOB_PREF_KEYWORDS.test(line)).forEach((line) => blocked.add(line));
  }
  return lines.filter((line) => !blocked.has(line) && !isIndeedChromeLine(line));
};

const exportProfile = async (options: IpeOptions): Promise<ProfileExportPayload> => {
  if (!isIndeedHost()) throw new Error("IPE can only export from an Indeed page.");
  await expandSections(options);
  const detailLines = await captureProfileRowDetails(options);

  const lines = visibleText(document.querySelector("main") || document.body);
  const name = extractName();
  const contact = extractContact(lines, options.includeContactDetails);
  const filteredLines = stripExcludedText(lines, contact, options);
  const detailSnapshotLines = Object.entries(detailLines).flatMap(([heading, items]) => [heading, ...items]);

  return {
    meta: {
      extensionName: "Indeed Profile Exporter",
      extensionShortName: "IPE",
      extensionVersion: EXTENSION_VERSION,
      exportedAt: new Date().toISOString(),
      sourceUrl: location.href,
      pageTitle: document.title
    },
    profile: {
      name,
      initials: makeInitials(name),
      contact,
      visibility: extractVisibility(lines)
    },
    resume: extractResume(lines, options.includeResumeCard),
    sections: extractSections(options, detailLines),
    rawText: unique([...filteredLines, ...detailSnapshotLines]).filter((line) => !isIndeedChromeLine(line)).join("\n")
  };
};

chrome.runtime.onMessage.addListener((request: ExportRequest, _sender, sendResponse) => {
  const respond = <T>(response: ExportResponse<T>) => sendResponse(response);

  (async () => {
    if (request.action === "IPE_GET_STATUS") {
      respond<IpeStatus>({ ok: true, data: getStatus() });
      return;
    }

    if (request.action === "IPE_EXPORT_PROFILE") {
      respond<ProfileExportPayload>({ ok: true, data: await exportProfile(request.options as IpeOptions) });
      return;
    }

    respond({ ok: false, error: `Unsupported content action: ${request.action}` });
  })().catch((error: unknown) => {
    respond({ ok: false, error: error instanceof Error ? error.message : String(error) });
  });

  return true;
});

import { expect, chromium, test } from "@playwright/test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const options = {
  autoExpand: true,
  showProgress: true,
  minimizeAfterExport: false,
  includeResumeCard: true,
  includeContactDetails: true,
  includeJobPreferences: true,
  privacyLocalOnly: true,
  defaultFormat: "html"
};

const mockIndeedProfile = `<!doctype html>
<html>
  <head>
    <title>Alex Morgan - Indeed Profile</title>
    <script>
      function openDetail(title, summary, details) {
        document.getElementById("detail-title").textContent = title;
        document.getElementById("detail-summary").textContent = summary;
        document.getElementById("detail-list").innerHTML = details.map((item) => "<li>" + item + "</li>").join("");
        document.getElementById("detail-dialog").hidden = false;
      }

      function closeDetail() {
        document.getElementById("detail-dialog").hidden = true;
      }
    </script>
  </head>
  <body>
    <main>
      <h1>Alex Morgan</h1>
      <p>AM alex</p>
      <p>@example.com</p>
      <p>alex@example.com</p>
      <p>+1 555 0100</p>
      <p>Sample City, Country, 244, US</p>
      <p>Employers can find you</p>
      <section>
        <h2>Resume</h2>
        <article>
          <p>PDF</p>
          <p>Alex Morgan - Sample Resume.pdf</p>
          <p>Added today</p>
        </article>
      </section>
      <h2>Improve your job matches</h2>
      <button onclick="openDetail('Qualifications', 'Highlight your skills and experience.', ['Security leadership', 'HSSE operations'])">
        <h3>Qualifications</h3>
        <p>Highlight your skills and experience.</p>
      </button>
      <button onclick="openDetail('Job preferences', 'Save specific details like minimum desired pay and schedule.', ['Skip to main content', 'Messages Unread count 0', 'new update', 'Profile', 'My reviews', 'Settings', 'Help', 'Privacy Center', 'Sign out', 'Employers / Post Job', 'Start of main content', '2026 Indeed -', 'Cookies, Privacy and Terms', 'Desired pay: USD 80,000+', 'Schedule: Full-time', 'Work setting: Hybrid'])">
        <h3>Job preferences</h3>
        <p>Save specific details like minimum desired pay and schedule.</p>
      </button>
      <button onclick="openDetail('Hide jobs with these details', 'Manage the qualifications or preferences used to hide jobs from your search.', ['Hidden keyword: internship', 'Hidden schedule: night shift'])">
        <h3>Hide jobs with these details</h3>
        <p>Manage the qualifications or preferences used to hide jobs from your search.</p>
      </button>
      <div class="profile-row" style="cursor: pointer;" onclick="openDetail('Ready to work', 'Let employers know that you are available to start working as soon as possible.', ['Available immediately', 'Open to opportunities'])">
        <h3>Ready to work</h3>
        <p>Let employers know that you're available to start working as soon as possible.</p>
        <span aria-hidden="true">›</span>
      </div>
      <div id="detail-dialog" role="dialog" hidden>
        <h2 id="detail-title"></h2>
        <p id="detail-summary"></p>
        <ul id="detail-list"></ul>
        <button aria-label="Close" onclick="closeDetail()">Close</button>
      </div>
    </main>
  </body>
</html>`;

test("exports visible user profile data from an Indeed profile page", async () => {
  const extensionPath = resolve("dist");
  const userDataDir = await mkdtemp(join(tmpdir(), "ipe-extension-"));

  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`]
  });

  try {
    let serviceWorker = context.serviceWorkers()[0];
    if (!serviceWorker) {
      serviceWorker = await context.waitForEvent("serviceworker");
    }
    const extensionId = serviceWorker.url().split("/")[2];

    await context.route("https://profile.indeed.com/profile", (route) =>
      route.fulfill({
        contentType: "text/html",
        body: mockIndeedProfile
      })
    );

    const page = await context.newPage();
    await page.goto("https://profile.indeed.com/profile");
    await expect(page.getByRole("heading", { name: "Alex Morgan" })).toBeVisible();

    const response = await serviceWorker.evaluate(async (exportOptions) => {
      const tabs = await chrome.tabs.query({ url: "https://profile.indeed.com/*" });
      if (!tabs[0]?.id) throw new Error("Mock Indeed tab was not found.");
      return chrome.tabs.sendMessage(tabs[0].id, {
        action: "IPE_EXPORT_PROFILE",
        options: exportOptions
      });
    }, options);

    expect(response.ok).toBe(true);
    expect(response.data.profile.name).toBe("Alex Morgan");
    expect(response.data.profile.contact.email).toBe("alex@example.com");
    expect(response.data.resume.title).toBe("Alex Morgan - Sample Resume.pdf");
    expect(response.data.sections.map((section: { heading: string }) => section.heading)).not.toContain("Alex Morgan");
    expect(response.data.sections[0].heading).toBe("Improve your job matches");
    expect(response.data.sections[0].items).toContain("Qualifications: Highlight your skills and experience. (2 details captured)");
    expect(response.data.sections.map((section: { heading: string }) => section.heading)).toContain("Qualifications");
    const qualifications = response.data.sections.find((section: { heading: string }) => section.heading === "Qualifications");
    expect(qualifications.summary).toBe("Highlight your skills and experience.");
    expect(qualifications.items).toEqual(expect.arrayContaining(["Security leadership", "HSSE operations"]));
    const jobPreferences = response.data.sections.find((section: { heading: string }) => section.heading === "Job preferences");
    expect(jobPreferences.items).toEqual(expect.arrayContaining(["Desired pay: USD 80,000+", "Schedule: Full-time"]));
    expect(jobPreferences.items).not.toEqual(expect.arrayContaining(["Skip to main content", "Sign out", "Cookies, Privacy and Terms"]));
    const readyToWork = response.data.sections.find((section: { heading: string }) => section.heading === "Ready to work");
    expect(readyToWork.items).toEqual(expect.arrayContaining(["Available immediately", "Open to opportunities"]));
    expect(response.data.rawText).toContain("HSSE operations");
    expect(response.data.rawText).not.toContain("Skip to main content");
    expect(response.data.rawText).not.toContain("Sign out");
    expect(response.data.rawText).not.toContain("Cookies, Privacy and Terms");

    const extensionPage = await context.newPage();
    await extensionPage.goto(`chrome-extension://${extensionId}/popup.html`);
    await expect(extensionPage.locator(".ipe-popup")).toBeVisible();

    const savedOptions = await extensionPage.evaluate(async (nextOptions) => {
      return chrome.runtime.sendMessage({ action: "IPE_SAVE_OPTIONS", options: nextOptions });
    }, { ...options, defaultFormat: "json" });
    expect(savedOptions.ok).toBe(true);
    expect(savedOptions.data.defaultFormat).toBe("json");

    const previewPagePromise = context.waitForEvent("page");
    const previewResponse = await extensionPage.evaluate(async (payload) => {
      return chrome.runtime.sendMessage({ action: "IPE_PREVIEW_HTML", payload });
    }, response.data);
    expect(previewResponse.ok).toBe(true);

    const previewPage = await previewPagePromise;
    await expect(previewPage.locator("iframe.print-frame")).toBeVisible();
    await expect(previewPage.locator("iframe.print-frame")).toHaveAttribute("srcdoc", /Alex Morgan/);
  } finally {
    await context.close();
    await rm(userDataDir, { recursive: true, force: true });
  }
});

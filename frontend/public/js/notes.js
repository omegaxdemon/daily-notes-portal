/**
 * notes.js
 *
 * Reads the selected date from the URL, fetches notes from the backend,
 * and renders them as interactive cards.
 */

(() => {

  const session = window.requireSession();

  if (!session) {
    return;
  }

  const params = new URLSearchParams(window.location.search);

  const date = params.get("date") || "";
  const iso = params.get("iso") || "";

  const dateLabel = document.getElementById("notes-date-label");
  const datePretty = document.getElementById("notes-date-pretty");

  const grid = document.getElementById("notes-grid");

  const loading = document.getElementById("notes-loading");
  const empty = document.getElementById("notes-empty");

  const errorBox = document.getElementById("notes-error");
  const errorDetail = document.getElementById("notes-error-detail");

  const countBadge = document.getElementById("notes-count");

  const mockBanner = document.getElementById("mock-banner");
  const mockText = document.getElementById("mock-banner-text");

  const backButton = document.getElementById("back-to-dashboard");

  // ---------------------------------------------------------------------------
  // Navigation
  // ---------------------------------------------------------------------------

  backButton.addEventListener("click", () => {
    window.location.replace("/dashboard.html");
  });

  if (!date) {
    window.location.replace("/dashboard.html");
    return;
  }

  // ---------------------------------------------------------------------------
  // Date Labels
  // ---------------------------------------------------------------------------

  dateLabel.textContent = date;

  if (iso) {
    try {

      const pretty = new Date(
        `${iso}T00:00:00`
      ).toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      datePretty.textContent = pretty;

    } catch (_err) {
      // Ignore invalid dates.
    }
  }

  // ---------------------------------------------------------------------------
  // File Helpers
  // ---------------------------------------------------------------------------

  function extensionOf(filename) {

    const dot = filename.lastIndexOf(".");

    return dot >= 0
      ? filename.slice(dot + 1).toLowerCase()
      : "";

  }

  const IMAGE_EXTENSIONS = [
    "png",
    "jpg",
    "jpeg",
    "gif",
    "bmp",
    "webp",
    "svg",
  ];

  function isViewable(file) {

    const extension = extensionOf(file.name);

    if (
      file.mimeType &&
      file.mimeType.startsWith("image/")
    ) {
      return true;
    }

    if (file.mimeType === "application/pdf") {
      return true;
    }

    if (
      extension === "pdf" ||
      IMAGE_EXTENSIONS.includes(extension)
    ) {
      return true;
    }

    return false;

  }

  function iconFor(file) {

    const extension = extensionOf(file.name);

    if (
      file.mimeType &&
      file.mimeType.startsWith("image/")
    ) {
      return "ph-image";
    }

    if (
      extension === "pdf" ||
      file.mimeType === "application/pdf"
    ) {
      return "ph-file-pdf";
    }

    if (["doc", "docx"].includes(extension)) {
      return "ph-file-doc";
    }

    if (["ppt", "pptx"].includes(extension)) {
      return "ph-file-ppt";
    }

    if (
      ["xls", "xlsx", "csv"].includes(extension)
    ) {
      return "ph-file-xls";
    }

    if (
      ["zip", "rar", "7z", "tar", "gz"].includes(extension)
    ) {
      return "ph-file-archive";
    }

    if (IMAGE_EXTENSIONS.includes(extension)) {
      return "ph-image";
    }

    return "ph-file";

  }

  function labelFor(file) {

    const extension = extensionOf(file.name).toUpperCase();

    if (extension) {
      return `${extension} file`;
    }

    return file.mimeType || "File";

  }

  function humanSize(bytes) {

    if (bytes === null || bytes === undefined) {
      return "";
    }

    const units = ["B", "KB", "MB", "GB"];

    let size = bytes;
    let unit = 0;

    while (
      size >= 1024 &&
      unit < units.length - 1
    ) {
      size /= 1024;
      unit++;
    }

    return `${size.toFixed(
      size >= 10 || unit === 0 ? 0 : 1
    )} ${units[unit]}`;

  }
    // ---------------------------------------------------------------------------
  // Rendering
  // ---------------------------------------------------------------------------

  function renderCards(files) {

    grid.innerHTML = "";

    files.forEach((file, index) => {

      const column = document.createElement("div");

      column.className = "col-12 col-md-6 col-lg-4";

      column.innerHTML = `
        <article class="glass-card file-card fade-in-up stagger-${Math.min(index + 1, 4)}" data-testid="file-card">

          <div class="d-flex align-items-center gap-3">

            <div class="file-icon">
              <i class="ph ${iconFor(file)}" aria-hidden="true"></i>
            </div>

            <div class="flex-grow-1 min-w-0">

              <p
                class="file-name"
                data-testid="file-name"
                title="${escapeHtml(file.name)}">

                ${escapeHtml(file.name)}

              </p>

              <div class="file-meta">

                ${escapeHtml(labelFor(file))}
                ${file.size ? ` &middot; ${humanSize(file.size)}` : ""}

              </div>

            </div>

          </div>

          <div class="file-actions">

            ${
              isViewable(file)
                ? `
                <a
                  href="${escapeAttr(file.viewUrl)}"
                  target="_blank"
                  rel="noopener"
                  class="btn btn-outline-purple"
                  data-testid="file-view-button">

                  <i class="ph ph-eye me-1" aria-hidden="true"></i>

                  View

                </a>
              `
                : ""
            }

            <a
              href="${escapeAttr(file.downloadUrl)}"
              target="_blank"
              rel="noopener"
              class="btn btn-solid-purple"
              data-testid="file-download-button">

              <i class="ph ph-download-simple me-1" aria-hidden="true"></i>

              Download

            </a>

          </div>

        </article>
      `;

      grid.appendChild(column);

    });

    grid.hidden = false;

    countBadge.hidden = false;

    countBadge.textContent =
      `${files.length} ${files.length === 1 ? "file" : "files"}`;

  }

  // ---------------------------------------------------------------------------
  // Escaping Helpers
  // ---------------------------------------------------------------------------

  function escapeHtml(value) {

    return String(value).replace(
      /[&<>"']/g,
      character =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[character]
    );

  }

  function escapeAttr(value) {
    return escapeHtml(value);
  }

  // ---------------------------------------------------------------------------
  // Load Notes
  // ---------------------------------------------------------------------------

  async function load() {

    loading.hidden = false;
    empty.hidden = true;
    errorBox.hidden = true;

    grid.hidden = true;
    countBadge.hidden = true;
    mockBanner.hidden = true;

    try {

      const response = await fetch(
        `${window.APP_CONFIG.API_BASE}/notes?date=${encodeURIComponent(date)}`
      );

      const data = await response.json().catch(() => ({}));

    //   loading.hidden = false;
            loading.hidden = true;

      if (!response.ok || !data.success) {

        errorDetail.textContent =
          data.message || "Failed to fetch notes.";

        errorBox.hidden = false;

        return;

      }

      // ---------------------------------------------------------------------
      // Mock Mode Banner
      // ---------------------------------------------------------------------

      if (data.mode === "mock") {

        mockBanner.hidden = false;

        mockText.textContent =
          data.note ||
          "Showing mocked demo data (Google Drive not configured).";

      }

      // ---------------------------------------------------------------------
      // Empty State
      // ---------------------------------------------------------------------

      if (
        !data.found ||
        !Array.isArray(data.files) ||
        data.files.length === 0
      ) {

        empty.hidden = false;

        return;

      }

      // ---------------------------------------------------------------------
      // Render Files
      // ---------------------------------------------------------------------

      renderCards(data.files);

    } catch (err) {

      console.error(
        "[notes] Failed to fetch notes:",
        err
      );

      loading.hidden = true;

      errorDetail.textContent =
        "Network error while contacting the server.";

      errorBox.hidden = false;

    }

  }

  // ---------------------------------------------------------------------------
  // Initialize Page
  // ---------------------------------------------------------------------------

  load();

})();

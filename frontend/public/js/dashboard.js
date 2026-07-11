/**
 * dashboard.js
 *
 * Displays a personalized greeting, allows the student to select
 * a date, checks Google Drive for uploaded notes, and navigates
 * to the Notes page.
 */

(() => {

  const session = window.requireSession();

  if (!session) {
    return;
  }

  const greetingPrefix = document.getElementById("greeting-prefix");
  const greetingName = document.getElementById("greeting-name");
  const todayLine = document.getElementById("today-date-line");

  const datePicker = document.getElementById("date-picker");
  const viewButton = document.getElementById("view-notes-btn");

  const statusLine = document.getElementById("status-line");
  const backButton = document.getElementById("back-to-login");

  // ---------------------------------------------------------------------------
  // Greeting
  // ---------------------------------------------------------------------------

  function getGreeting() {
    const hour = new Date().getHours();

    if (hour < 12) return "Good Morning,";
    if (hour < 17) return "Good Afternoon,";

    return "Good Evening,";
  }

  greetingPrefix.textContent = getGreeting();
  greetingName.textContent = session.name;

  // ---------------------------------------------------------------------------
  // Today's Date
  // ---------------------------------------------------------------------------

  const today = new Date();

  todayLine.textContent =
    `Today is ${today.toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })}. Pick a date below to see the notes uploaded for that day.`;

  // ---------------------------------------------------------------------------
  // Date Picker
  // ---------------------------------------------------------------------------

  function pad(value) {
    return String(value).padStart(2, "0");
  }

  const todayISO =
    `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

  datePicker.value = todayISO;
  datePicker.max = todayISO;

  /**
   * Converts:
   *
   * YYYY-MM-DD
   *
   * into
   *
   * DD-MM-YY
   */

  function toDriveFolderName(isoDate) {

    if (!isoDate) {
      return "";
    }

    const [year, month, day] = isoDate.split("-");

    return `${day}-${month}-${year.slice(-2)}`;

  }

  // ---------------------------------------------------------------------------
  // Status Message
  // ---------------------------------------------------------------------------

  function setStatus(message = "", isError = false) {

    statusLine.textContent = message;

    statusLine.classList.toggle("error", isError);

  }

  // ---------------------------------------------------------------------------
  // View Notes
  // ---------------------------------------------------------------------------

  viewButton.addEventListener("click", async () => {

    setStatus();

    const isoDate = datePicker.value;

    if (!isoDate) {
      setStatus("Please pick a date first.", true);
      return;
    }

    const folderName = toDriveFolderName(isoDate);

    viewButton.disabled = true;

    setStatus("Checking Google Drive...");

    try {

      const response = await fetch(
        `${window.APP_CONFIG.API_BASE}/notes?date=${encodeURIComponent(folderName)}`
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {

        setStatus(
          data.message || "Failed to reach Google Drive.",
          true
        );

        return;
      }

      if (!data.found) {

        setStatus(
          "No notes uploaded for this day.",
          true
        );

        return;
      }

      const params = new URLSearchParams({
        date: folderName,
        iso: isoDate,
      });

      window.location.href = `/notes.html?${params.toString()}`;

    } catch (err) {

      console.error(
        "[dashboard] Notes lookup failed:",
        err
      );

      setStatus(
        "Network error while checking Google Drive.",
        true
      );

    } finally {

      viewButton.disabled = false;

    }

  });

  // ---------------------------------------------------------------------------
  // Logout
  // ---------------------------------------------------------------------------

  backButton.addEventListener("click", () => {

    window.clearSession();

    window.location.replace("/index.html");

  });

})();

//------------------------------------------------------
// Floating Notification Button
//------------------------------------------------------

(async () => {

    const fab =
        document.getElementById("notification-fab");

    const badge =
        document.getElementById("notification-badge");

    if (!fab || !badge) return;

    fab.addEventListener("click", () => {

        window.location.href = "notifications.html";

    });

    try {

        const response =
            await fetch("notifications.json");

        const notices =
            await response.json();

        const today = new Date();

        const hasNew = notices.some(notice => {

            const [d, m, y] = notice.date.split("/").map(Number);

            return (
                d === today.getDate() &&
                m === today.getMonth() + 1 &&
                y === today.getFullYear() % 100
            );

        });

        badge.hidden = !hasNew;

    }

    catch(err){

        console.error(err);

    }

})();

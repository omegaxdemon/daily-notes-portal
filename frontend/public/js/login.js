/**
 * login.js
 *
 * Handles student authentication.
 *
 * Sends the Roll Number and Course to the backend,
 * stores the authenticated session, and redirects
 * to the dashboard.
 */

(() => {

  const form = document.getElementById("login-form");
  const rollInput = document.getElementById("roll");
  const courseSelect = document.getElementById("course");

  const errorBox = document.getElementById("login-error");

  const submitBtn = document.getElementById("login-submit");
  const submitLabel = document.getElementById("login-submit-label");

  /**
   * Display an error message.
   */
  function setError(message = "") {
    errorBox.textContent = message;
  }

  /**
   * Toggle loading state.
   */
  function setBusy(isBusy) {
    submitBtn.disabled = isBusy;
    submitLabel.textContent = isBusy
      ? "Signing in..."
      : "Sign in";
  }

  /**
   * Login form submission.
   */
  form.addEventListener("submit", async (event) => {

    event.preventDefault();

    setError("");

    const roll = Number(rollInput.value);
    const course = courseSelect.value;

    // -----------------------------------------------------------------------
    // Validation
    // -----------------------------------------------------------------------

    if (!roll) {
      setError("Please enter your Roll Number.");
      rollInput.focus();
      return;
    }

    if (!course) {
      setError("Please select a course.");
      courseSelect.focus();
      return;
    }

    setBusy(true);

    try {

      const response = await fetch(
        `${window.APP_CONFIG.API_BASE}/login`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            roll: Number(roll),
            course,
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {

        setError(
          data.message || "Invalid Roll Number or Course."
        );

        return;
      }

      window.saveSession({
        name: data.name,
        roll: data.roll,
        course: data.course,
      });

      window.location.replace("/dashboard.html");

    } catch (err) {

      console.error("[login] Request failed:", err);

      setError(
        "Unable to connect to the server. Please try again."
      );

    } finally {

      setBusy(false);

    }

  });

  /**
   * Already logged in?
   * Skip the login page.
   */
  if (window.getSession()) {
    window.location.replace("/dashboard.html");
  }

})();
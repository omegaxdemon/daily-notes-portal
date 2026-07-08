/**
 * Shared configuration for all frontend pages.
 *
 * API requests are routed through the same origin as the frontend.
 * Kubernetes/Ingress rewrites `/api/*` requests to the backend.
 */

window.APP_CONFIG = Object.freeze({
  // API_BASE: `${window.location.origin}/api`,
  API_BASE: "http://localhost:8001/api",
  SESSION_KEY: "dnp_session_v1",
});

/**
 * Save the logged-in student's session.
 */
window.saveSession = function saveSession(session) {
  if (!session || typeof session !== "object") {
    console.warn("[config] Invalid session object.");
    return;
  }

  sessionStorage.setItem(
    window.APP_CONFIG.SESSION_KEY,
    JSON.stringify(session)
  );
};

/**
 * Retrieve the current session.
 * Returns null if no valid session exists.
 */
window.getSession = function getSession() {
  const raw = sessionStorage.getItem(window.APP_CONFIG.SESSION_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch (err) {
    console.warn("[config] Corrupted session data. Clearing session.");
    window.clearSession();
    return null;
  }
};

/**
 * Remove the current session.
 */
window.clearSession = function clearSession() {
  sessionStorage.removeItem(window.APP_CONFIG.SESSION_KEY);
};

/**
 * Ensure the user is authenticated.
 * Redirects to the login page if no valid session exists.
 */
window.requireSession = function requireSession() {
  const session = window.getSession();

  if (!session || !session.name) {
    window.location.replace("/index.html");
    return null;
  }

  return session;
};
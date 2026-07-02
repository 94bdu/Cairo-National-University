// ===================== CREDENTIALS =====================
// NOTE: This is a static front-end demo (no backend/server).
// Credentials are stored here in plain text purely for demo/voting purposes.
// Anyone can view this file's source, so never use real personal passwords here.
const USERS = {
  "73250075": { password: "5700384", displayName: "Abdelrahman Hazem Othman", role: "student" },
  "ADMIN":    { password: "IAMADMIN", displayName: "Admin", role: "admin" }
};

const SESSION_KEY = "cnu_session_user";

// Some sandboxed/embedded preview environments block sessionStorage access
// (it can throw an exception instead of just failing silently). We wrap it
// so the app still works even if storage isn't available — it'll just
// forget the session on refresh in that case.
let memorySession = null;
const safeStorage = {
  get() {
    try { return sessionStorage.getItem(SESSION_KEY); }
    catch (e) { return memorySession; }
  },
  set(value) {
    try { sessionStorage.setItem(SESSION_KEY, value); }
    catch (e) { memorySession = value; }
  },
  clear() {
    try { sessionStorage.removeItem(SESSION_KEY); }
    catch (e) { /* ignore */ }
    memorySession = null;
  }
};

const loginScreen = document.getElementById("login-screen");
const dashboardScreen = document.getElementById("dashboard-screen");
const loginForm = document.getElementById("login-form");
const loginError = document.getElementById("login-error");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");

function showScreen(screen) {
  // Blur any focused input first so mobile browsers don't try to keep
  // the (about to be hidden) field in view, which can look like a scroll.
  if (document.activeElement && document.activeElement.blur) {
    document.activeElement.blur();
  }
  document.querySelectorAll(".screen").forEach(s => {
    s.classList.remove("active");
    s.style.display = "none";
  });
  screen.classList.add("active");
  screen.style.display = "block";
  window.scrollTo(0, 0);
}

function login(username, password) {
  const user = USERS[username];
  if (user && user.password === password) {
    safeStorage.set(username);
    enterDashboard(username, { showWelcome: true });
    return true;
  }
  return false;
}

function enterDashboard(username, opts) {
  opts = opts || {};
  const user = USERS[username];
  const label = user ? `${user.displayName} (${username})` : username;
  document.querySelectorAll("#academic-user-label, #fees-user-label, #notices-user-label")
    .forEach(el => el.textContent = label);
  document.getElementById("taskbar-user").textContent = label;
  showScreen(dashboardScreen);

  if (opts.showWelcome) {
    const name = user ? user.displayName : username;
    document.getElementById("welcome-back-name").textContent = name;
    // slight delay so the dashboard is visible first, then the popup appears on top of it
    setTimeout(() => openPopup("popup-welcome-back"), 150);
  }
}

function logout() {
  safeStorage.clear();
  usernameInput.value = "";
  passwordInput.value = "";
  loginError.hidden = true;
  closeAllPopups();
  closeStartMenu();
  showScreen(loginScreen);
}

// on load, restore session if present
window.addEventListener("DOMContentLoaded", () => {
  const saved = safeStorage.get();

  document.querySelectorAll(".subject-input, .grade-input, .gpa-input").forEach(el => {
    el.readOnly = true;
    el.tabIndex = -1;
  });

  if (saved && USERS[saved]) {
    enterDashboard(saved);
  }
});

// ===================== LOGIN FORM =====================
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const ok = login(usernameInput.value.trim(), passwordInput.value);
  if (!ok) {
    loginError.hidden = false;
  } else {
    loginError.hidden = true;
  }
});

document.getElementById("forgot-link").addEventListener("click", (e) => {
  e.preventDefault();
  alert("يرجى التواصل مع إدارة الطلاب لاستعادة كلمة المرور.");
});

// ===================== POPUPS =====================
const overlay = document.getElementById("popup-overlay");

function openPopup(id) {
  closeAllPopups();
  overlay.classList.add("open");
  document.getElementById(id).classList.add("open");
}

function closeAllPopups() {
  overlay.classList.remove("open");
  document.querySelectorAll(".win-popup").forEach(w => w.classList.remove("open"));
}

document.querySelectorAll(".desk-icon").forEach(btn => {
  btn.addEventListener("click", () => {
    const key = btn.getAttribute("data-popup");
    openPopup("popup-" + key);
  });
});

document.querySelectorAll("[data-close]").forEach(el => {
  el.addEventListener("click", closeAllPopups);
});

overlay.addEventListener("click", (e) => {
  if (e.target === overlay) closeAllPopups();
});

// ===================== START MENU =====================
const startMenu = document.getElementById("start-menu");
const startBtn = document.getElementById("start-btn");

startBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  startMenu.classList.toggle("open");
});

function closeStartMenu() {
  startMenu.classList.remove("open");
}

document.addEventListener("click", (e) => {
  if (!startMenu.contains(e.target) && e.target !== startBtn) {
    closeStartMenu();
  }
});

document.querySelectorAll(".start-menu-item[data-action]").forEach(item => {
  item.addEventListener("click", () => {
    const action = item.getAttribute("data-action");
    closeStartMenu();
    if (action === "settings") openPopup("popup-settings");
    if (action === "change-password") openPopup("popup-error");
    if (action === "logout") logout();
  });
});

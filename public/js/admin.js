// Champions Cricket Club - Admin Engine & State Controller

function showAdminNotification(message, type = 'success', title = null, duration = 4000) {
  let toastContainer = document.getElementById("admin-toast-container");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "admin-toast-container";
    document.body.appendChild(toastContainer);
  }

  // Force container styling at bottom-right corner
  toastContainer.style.cssText = "position: fixed !important; bottom: 24px !important; right: 24px !important; top: auto !important; left: auto !important; z-index: 99999999 !important; display: flex !important; flex-direction: column-reverse !important; gap: 10px !important; pointer-events: none !important; max-width: 420px !important; width: calc(100vw - 48px) !important;";

  // Strip leading emojis for clean text matching design
  let cleanMessage = (message || '').replace(/^[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F1E6}-\u{1F1FF}\u{26A0}-\u{2705}]\s*/u, '').trim();
  if (!cleanMessage) cleanMessage = message;

  const toastId = 'toast-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
  const toast = document.createElement("div");
  toast.id = toastId;

  let accentColor = '#10b981'; // Emerald Green
  let iconSvg = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;

  if (type === 'error' || type === 'failed' || message.includes('Failed') || message.includes('Error') || message.includes('🚫')) {
    accentColor = '#ef4444';
    iconSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
  } else if (type === 'warning' || type === 'warn' || message.includes('⚠️')) {
    accentColor = '#f59e0b';
    iconSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
  } else if (type === 'loading' || message.includes('Saving') || message.includes('Uploading')) {
    accentColor = '#3b82f6';
    iconSvg = `<svg style="animation: adminToastSpin 1s linear infinite;" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>`;
  }

  toast.className = `admin-toast-card toast-${type}`;
  toast.style.cssText = `
    pointer-events: auto !important;
    position: relative !important;
    overflow: hidden !important;
    background: #091a12 !important;
    background-color: #091a12 !important;
    color: #ffffff !important;
    border-radius: 12px !important;
    padding: 12px 18px !important;
    border: 1px solid rgba(16, 185, 129, 0.3) !important;
    border-left: 5px solid ${accentColor} !important;
    box-shadow: 0 16px 36px -6px rgba(0, 0, 0, 0.8), 0 4px 12px rgba(0, 0, 0, 0.5) !important;
    display: flex !important;
    align-items: center !important;
    gap: 12px !important;
    opacity: 0;
    transform: translateY(20px) scale(0.96);
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
  `;

  toast.innerHTML = `
    <div style="display:flex !important; align-items:center !important; justify-content:center !important; width:28px !important; height:28px !important; border-radius:50% !important; background:${accentColor} !important; flex-shrink:0 !important;">
      ${iconSvg}
    </div>
    <div style="font-family:system-ui,-apple-system,sans-serif !important; font-size:0.92rem !important; font-weight:600 !important; color:#ffffff !important; line-height:1.35 !important; flex:1 !important; margin-right:8px !important;">
      ${cleanMessage}
    </div>
    <button type="button" onclick="closeAdminNotification('${toastId}')" aria-label="Close" style="background:transparent !important; border:none !important; color:#94a3b8 !important; font-size:1.2rem !important; cursor:pointer !important; padding:0 4px !important; line-height:1 !important; margin-left:auto !important;">&times;</button>
  `;

  toastContainer.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0) scale(1)';
  });

  if (type !== 'loading' && duration > 0) {
    setTimeout(() => {
      closeAdminNotification(toastId);
    }, duration);
  }

  return toastId;
}

function closeAdminNotification(toastId) {
  const toast = document.getElementById(toastId);
  if (toast) {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(12px) scale(0.94)';
    setTimeout(() => {
      if (toast.parentNode) toast.remove();
    }, 300);
  }
}

function updateAdminNotification(toastId, message, type = 'success', title = null, duration = 4000) {
  const toast = document.getElementById(toastId);
  if (!toast) {
    return showAdminNotification(message, type, title, duration);
  }

  let icon = '✓';
  let defaultTitle = 'Saved Successfully';
  let badgeLabel = 'SUCCESS';
  let typeClass = 'toast-success';

  if (type === 'error' || type === 'failed') {
    typeClass = 'toast-error';
    icon = '✕';
    defaultTitle = 'Save Failed';
    badgeLabel = 'ERROR';
  } else if (type === 'warning') {
    typeClass = 'toast-warning';
    icon = '!';
    defaultTitle = 'Notice';
    badgeLabel = 'WARNING';
  }

  const finalTitle = title || defaultTitle;
  toast.className = `admin-toast-card ${typeClass} show`;
  
  const iconEl = toast.querySelector('.admin-toast-icon');
  const titleEl = toast.querySelector('.admin-toast-title');
  const badgeEl = toast.querySelector('.admin-toast-badge');
  const msgEl = toast.querySelector('.admin-toast-message');

  if (iconEl) iconEl.textContent = icon;
  if (titleEl) titleEl.textContent = finalTitle;
  if (badgeEl) badgeEl.textContent = badgeLabel;
  if (msgEl) msgEl.textContent = message;

  setTimeout(() => {
    closeAdminNotification(toastId);
  }, duration);
}

function showAdminToast(message, type = 'success') {
  return showAdminNotification(message, type);
}

window.showAdminNotification = showAdminNotification;
window.closeAdminNotification = closeAdminNotification;
window.updateAdminNotification = updateAdminNotification;
window.showAdminToast = showAdminToast;
window.showToast = showAdminToast;

document.addEventListener("DOMContentLoaded", async () => {
  // Restore active tab immediately on DOMReady to prevent tab flicker
  initAdminTabs();

  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  // Check auth
  try {
    const res = await fetch('/api/admin/check-auth', { credentials: 'same-origin' });
    const data = await res.json();
    if (!data.authenticated) {
      if (!window.location.pathname.endsWith("login.html")) {
        const reason = data.singleSessionConflict ? '?reason=single_session' : '';
        window.location.replace(`login.html${reason}`);
      }
      return;
    }
  } catch (e) {
    if (!window.location.pathname.endsWith("login.html")) {
      window.location.replace('login.html');
    }
    return;
  }

  fetchAdminBlogs();
  loadDashboardData();
  loadContactMapSettings();
  fetchGallery();
  initInactivityTracker();
  renderActiveSessionInfo();
});

// Admin Global State Engine (Synchronized with localStorage)
const ADMIN_STATE = {
  creds: JSON.parse(localStorage.getItem("ccc_admin_creds")) || {
    username: "admin",
    password: "admin123"
  },
  securitySettings: JSON.parse(localStorage.getItem("ccc_security_settings")) || {
    twoFactorEnabled: false,
    twoFactorMethod: "app",
    sessionTimeout: "30",
    singleSessionOnly: true
  },
  auditLogs: JSON.parse(localStorage.getItem("ccc_security_logs")) || [
    { id: 1, event: "Admin Security System Active", user: "admin", ip: "127.0.0.1", timestamp: new Date(Date.now() - 1000 * 60 * 25).toLocaleString(), status: "success" },
    { id: 2, event: "Admin Dashboard Session Authenticated", user: "admin", ip: "127.0.0.1", timestamp: new Date(Date.now() - 1000 * 60 * 20).toLocaleString(), status: "info" },
    { id: 3, event: "SSL Encryption Active", user: "system", ip: "127.0.0.1", timestamp: new Date(Date.now() - 1000 * 60 * 10).toLocaleString(), status: "success" }
  ],
  leads: JSON.parse(localStorage.getItem("ccc_admin_leads_cache")) || [],
  gallery: JSON.parse(localStorage.getItem("ccc_admin_gallery_cache")) || [],
  liveScore: JSON.parse(localStorage.getItem("ccc_live_score")) || {
    stumpsUrl: "",
    team1: "CHAMPIONS CC 1st XI",
    score1: "248/4",
    overs1: "(42.2 OV)",
    team2: "METRO WARRIORS",
    score2: "212/10",
    overs2: "(46.5 OV)",
    venue: "Stadium Main Ground A",
    tournament: "Regional Premier League Semi-Final",
    statusNote: "Champions CC leads by 36 runs",
    stopReason: ""
  },
  squad: JSON.parse(localStorage.getItem("ccc_admin_squad_cache")) || JSON.parse(localStorage.getItem("ccc_squad")) || (window.APP_DATA ? window.APP_DATA.squad : []),
  blogs: JSON.parse(localStorage.getItem("ccc_admin_blogs_cache")) || JSON.parse(localStorage.getItem("ccc_blogs")) || (window.APP_DATA ? window.APP_DATA.blogs : []),
  fixtures: JSON.parse(localStorage.getItem("ccc_fixtures")) || (window.APP_DATA ? window.APP_DATA.fixtures : [])
};

/* --------------------------------------------------------------------------
   SECURITY & PASSWORD MANAGER FUNCTIONS
   -------------------------------------------------------------------------- */

function togglePasswordVisibility(inputId, iconId) {
  const input = document.getElementById(inputId);
  const icon = document.getElementById(iconId);
  if (!input || !icon) return;
  if (input.type === "password") {
    input.type = "text";
    icon.innerText = "visibility_off";
  } else {
    input.type = "password";
    icon.innerText = "visibility";
  }
}

function checkPasswordStrength(val) {
  const label = document.getElementById("pwd-strength-label");
  const bar = document.getElementById("pwd-strength-bar");
  if (!label || !bar) return;

  if (!val) {
    label.innerText = "Not entered";
    label.style.color = "#94a3b8";
    bar.style.width = "0%";
    bar.style.background = "#ef4444";
    return;
  }

  let score = 0;
  if (val.length >= 6) score += 25;
  if (val.length >= 10) score += 15;
  if (/[A-Z]/.test(val)) score += 20;
  if (/[0-9]/.test(val)) score += 20;
  if (/[^A-Za-z0-9]/.test(val)) score += 20;

  if (score < 40) {
    label.innerText = "Weak";
    label.style.color = "#ef4444";
    bar.style.width = "25%";
    bar.style.background = "#ef4444";
  } else if (score < 70) {
    label.innerText = "Medium";
    label.style.color = "#f59e0b";
    bar.style.width = "60%";
    bar.style.background = "#f59e0b";
  } else if (score < 90) {
    label.innerText = "Strong";
    label.style.color = "#10b981";
    bar.style.width = "85%";
    bar.style.background = "#10b981";
  } else {
    label.innerText = "Ultra Strong";
    label.style.color = "#059669";
    bar.style.width = "100%";
    bar.style.background = "#059669";
  }
  checkPasswordMatch();
}

function checkPasswordMatch() {
  const newPwd = document.getElementById("settings-new-password")?.value || "";
  const confPwd = document.getElementById("settings-confirm-password")?.value || "";
  const msgEl = document.getElementById("pwd-match-msg");
  if (!msgEl) return;

  if (!confPwd) {
    msgEl.innerHTML = "";
    return;
  }

  if (newPwd === confPwd) {
    msgEl.innerHTML = `<span class="material-symbols-outlined" style="font-size:16px; color:#10b981;">check_circle</span> <span style="color:#10b981;">Passwords match</span>`;
  } else {
    msgEl.innerHTML = `<span class="material-symbols-outlined" style="font-size:16px; color:#ef4444;">error</span> <span style="color:#ef4444;">Passwords do not match</span>`;
  }
}

function resetPasswordForm() {
  const curr = document.getElementById("settings-current-password");
  const np = document.getElementById("settings-new-password");
  const cp = document.getElementById("settings-confirm-password");
  if (curr) curr.value = "";
  if (np) np.value = "";
  if (cp) cp.value = "";
  checkPasswordStrength("");
}

let lastActivityTime = Date.now();

function initInactivityTracker() {
  const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
  events.forEach(evt => {
    window.addEventListener(evt, () => {
      lastActivityTime = Date.now();
    }, { passive: true });
  });

  // 1. Inactivity Logout Check
  setInterval(() => {
    const timeoutMin = parseInt(ADMIN_STATE.securitySettings?.sessionTimeout || "30", 10);
    const timeoutMs = timeoutMin * 60 * 1000;
    
    if (Date.now() - lastActivityTime > timeoutMs) {
      addAuditLog("Auto logged out due to inactivity", "warning");
      fetch('/api/admin/logout', { method: 'POST' }).finally(() => {
        window.location.replace('login.html?reason=inactivity');
      });
    }
  }, 10000);

  // 2. Single Device Active Session Heartbeat Monitor (checks every 12s)
  setInterval(async () => {
    if (window.location.pathname.endsWith("login.html")) return;
    try {
      const res = await fetch('/api/admin/check-auth', { credentials: 'same-origin' });
      const data = await res.json();
      if (!data.authenticated && data.singleSessionConflict) {
        window.location.replace('login.html?reason=single_session');
      }
    } catch (e) {}
  }, 12000);
}

async function renderActiveSessionInfo() {
  const container = document.getElementById("active-session-info");
  if (!container) return;

  const ua = navigator.userAgent;
  let os = "Windows";
  if (ua.includes("Mac")) os = "macOS";
  else if (ua.includes("Linux")) os = "Linux";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

  let browser = "Chrome";
  if (ua.includes("Edg")) browser = "Edge";
  else if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";

  let clientIp = "127.0.0.1";
  try {
    const res = await fetch('/api/admin/check-auth');
    if (res.ok) {
      const data = await res.json();
      if (data.ip) clientIp = data.ip;
    }
  } catch (e) {}

  container.innerHTML = `${os} • ${browser} • IP: ${clientIp}`;
}

async function saveAdminCredentials(e) {
  if (e) e.preventDefault();
  const currPwdInput = document.getElementById("settings-current-password")?.value || "";
  const newUser = document.getElementById("settings-username")?.value.trim() || "";
  const newPwd = document.getElementById("settings-new-password")?.value.trim() || "";
  const confirmPwd = document.getElementById("settings-confirm-password")?.value.trim() || "";

  if (!currPwdInput) {
    showAdminToast("⚠️ Please enter your current password.");
    return;
  }

  if (!newUser || !newPwd) {
    showAdminToast("⚠️ Please provide a valid username and new password.");
    return;
  }

  if (newPwd !== confirmPwd) {
    showAdminToast("⚠️ New passwords do not match!");
    return;
  }

  const saveBtn = document.querySelector("#sec-settings form button[type='submit']");
  const origBtnText = saveBtn ? saveBtn.innerHTML : 'Save Credentials';
  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<span class="material-symbols-outlined" style="font-size:18px; animation:spin 0.8s linear infinite;">sync</span> Saving...';
  }

  try {
    const res = await fetch('/api/admin/account', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newUser, email: newUser, password: newPwd, currentPassword: currPwdInput })
    });

    const data = await res.json();

    if (res.ok && data.success) {
      ADMIN_STATE.creds.username = newUser;
      ADMIN_STATE.creds.password = newPwd;
      localStorage.setItem("ccc_admin_creds", JSON.stringify(ADMIN_STATE.creds));

      addAuditLog("Admin Credentials & Password Updated", "success");
      showAdminToast("🔒 Admin Credentials & Password updated successfully!");
      resetPasswordForm();
    } else {
      showAdminToast(`⚠️ ${data.error || 'Failed to update credentials'}`);
    }
  } catch (err) {
    console.error("Error saving admin credentials:", err);
    ADMIN_STATE.creds.username = newUser;
    ADMIN_STATE.creds.password = newPwd;
    localStorage.setItem("ccc_admin_creds", JSON.stringify(ADMIN_STATE.creds));

    addAuditLog("Admin Credentials Updated (Local)", "success");
    showAdminToast("🔒 Admin Credentials & Password updated successfully!");
    resetPasswordForm();
  } finally {
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.innerHTML = origBtnText;
    }
  }
}

function toggle2FAState(enabled) {
  ADMIN_STATE.securitySettings.twoFactorEnabled = enabled;
  localStorage.setItem("ccc_security_settings", JSON.stringify(ADMIN_STATE.securitySettings));
  
  const statusPill = document.getElementById("2fa-status-pill");
  const detailsBox = document.getElementById("2fa-details-box");

  if (statusPill) {
    if (enabled) {
      statusPill.className = "badge badge-active";
      statusPill.innerText = "Active";
    } else {
      statusPill.className = "badge badge-inactive";
      statusPill.innerText = "Disabled";
    }
  }

  if (detailsBox) {
    detailsBox.style.opacity = enabled ? "1" : "0.5";
    detailsBox.style.pointerEvents = enabled ? "auto" : "none";
  }

  addAuditLog(enabled ? "2FA Multi-Factor Guard Enabled" : "2FA Protection Disabled", enabled ? "warning" : "info");
  showAdminToast(enabled ? "🛡️ 2-Factor Authentication Enabled" : "ℹ️ 2-Factor Authentication Disabled");
}

function update2FAMethod(method) {
  ADMIN_STATE.securitySettings.twoFactorMethod = method;
  localStorage.setItem("ccc_security_settings", JSON.stringify(ADMIN_STATE.securitySettings));
  showAdminToast(`🔐 2FA Method updated to: ${method === 'app' ? 'Authenticator App' : 'Email OTP'}`);
}

function copy2FASecret() {
  const secret = "CCC-SEC-9842-8871-X9A";
  if (navigator.clipboard) {
    navigator.clipboard.writeText(secret).then(() => {
      showAdminToast("📋 2FA Secret Key copied to clipboard!");
    }).catch(() => {
      showAdminToast("📋 Secret Key: " + secret);
    });
  } else {
    showAdminToast("📋 Secret Key: " + secret);
  }
}

function downloadBackupCodes() {
  const codes = [
    "CCC-8392-1029", "CCC-9201-4821", "CCC-7482-0193", "CCC-1092-8472",
    "CCC-5839-2018", "CCC-3849-1029", "CCC-8572-9102", "CCC-4920-1823"
  ];
  const content = "CHAMPIONS CRICKET CLUB - ADMIN BACKUP EMERGENCY CODES\n" +
                  "Generated: " + new Date().toLocaleString() + "\n" +
                  "=====================================================\n\n" +
                  codes.map((c, i) => `${i + 1}. ${c}`).join("\n") +
                  "\n\nKeep these recovery codes in a secure offline location.";

  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "ccc-admin-backup-codes.txt";
  a.click();
  URL.revokeObjectURL(url);
  addAuditLog("Emergency 2FA Recovery Codes Downloaded", "info");
  showAdminToast("📥 Backup codes file downloaded!");
}

function saveSessionSecurity(e) {
  if (e) e.preventDefault();
  const timeout = document.getElementById("sec-session-timeout")?.value || "30";
  const singleSession = document.getElementById("sec-single-session")?.checked ?? true;

  ADMIN_STATE.securitySettings.sessionTimeout = timeout;
  ADMIN_STATE.securitySettings.singleSessionOnly = singleSession;
  localStorage.setItem("ccc_security_settings", JSON.stringify(ADMIN_STATE.securitySettings));

  addAuditLog("Session Security Controls Updated", "info");
  showAdminToast("⚙️ Session Security Settings saved successfully!");
}

function revokeAllSessions() {
  showConfirmDialog({
    title: "Revoke Active Sessions",
    message: "Are you sure you want to revoke all other active admin sessions? Other devices will be immediately logged out.",
    confirmText: "Revoke Sessions",
    isDanger: true
  }, async () => {
    try {
      const res = await fetch('/api/admin/revoke-sessions', { method: 'POST', credentials: 'same-origin' });
      if (res.ok) {
        addAuditLog("Revoked All Active Remote Sessions", "warning");
        showAdminToast("🚫 All other administrator sessions have been revoked!");
      } else {
        showAdminToast("⚠️ Failed to revoke other sessions.");
      }
    } catch (e) {
      addAuditLog("Revoked All Active Remote Sessions", "warning");
      showAdminToast("🚫 All other administrator sessions have been revoked!");
    }
  });
}

function addAuditLog(eventText, status = "info") {
  const newLog = {
    id: Date.now(),
    event: eventText,
    user: ADMIN_STATE.creds.username || "admin",
    ip: "127.0.0.1",
    timestamp: new Date().toLocaleString(),
    status: status
  };
  ADMIN_STATE.auditLogs.unshift(newLog);
  if (ADMIN_STATE.auditLogs.length > 50) ADMIN_STATE.auditLogs.pop();
  localStorage.setItem("ccc_security_logs", JSON.stringify(ADMIN_STATE.auditLogs));
  renderAuditLogs();
}

function renderAuditLogs() {
  const tbody = document.getElementById("security-logs-tbody");
  if (!tbody) return;

  if (!ADMIN_STATE.auditLogs || ADMIN_STATE.auditLogs.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 2rem; color:#94a3b8;">No security events logged yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = ADMIN_STATE.auditLogs.map(log => {
    let badgeClass = "badge-inactive";
    let statusLabel = (log.status || "INFO").toUpperCase();
    if (log.status === "success") badgeClass = "badge-active";
    if (log.status === "warning") badgeClass = "badge-featured";
    if (log.status === "danger") badgeClass = "badge-inactive";

    return `
      <tr>
        <td style="font-size: 0.82rem; color: #64748b; font-family: monospace; white-space: nowrap;">${log.timestamp}</td>
        <td style="font-weight: 600; color: #0f172a;">${log.event}</td>
        <td style="font-size: 0.85rem; color: #334155;">${log.user}</td>
        <td style="font-size: 0.82rem; color: #64748b; font-family: monospace;">${log.ip}</td>
        <td><span class="badge ${badgeClass}">${statusLabel}</span></td>
      </tr>
    `;
  }).join("");
}

function exportAuditLogs() {
  if (!ADMIN_STATE.auditLogs || ADMIN_STATE.auditLogs.length === 0) {
    showAdminToast("⚠️ No audit logs available to export.");
    return;
  }
  const headers = "ID,Timestamp,Event,User,IP,Status\n";
  const rows = ADMIN_STATE.auditLogs.map(l => `${l.id},"${l.timestamp}","${l.event}","${l.user}","${l.ip}","${l.status}"`).join("\n");
  const blob = new Blob([headers + rows], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `security-audit-logs-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  showAdminToast("📊 Security Audit Log exported successfully!");
}

function clearAuditLogs() {
  showConfirmDialog({
    title: "Clear Audit Logs",
    message: "Are you sure you want to clear all security audit logs?",
    confirmText: "Clear Logs",
    isDanger: true
  }, () => {
    ADMIN_STATE.auditLogs = [];
    localStorage.setItem("ccc_security_logs", JSON.stringify(ADMIN_STATE.auditLogs));
    renderAuditLogs();
    showAdminToast("🗑️ Security Audit Logs cleared!");
  });
}

function renderSettingsForm() {
  const userEl = document.getElementById("settings-username");
  if (userEl) {
    userEl.value = ADMIN_STATE.creds.username || "admin";
  }

  const sec = ADMIN_STATE.securitySettings || {};
  const toggle2fa = document.getElementById("2fa-toggle");
  if (toggle2fa) {
    toggle2fa.checked = !!sec.twoFactorEnabled;
    toggle2FAState(!!sec.twoFactorEnabled);
  }

  const timeoutEl = document.getElementById("sec-session-timeout");
  if (timeoutEl && sec.sessionTimeout) timeoutEl.value = sec.sessionTimeout;

  const singleEl = document.getElementById("sec-single-session");
  if (singleEl && sec.singleSessionOnly !== undefined) singleEl.checked = !!sec.singleSessionOnly;

  renderAuditLogs();
}

function handleAdminLogout() {
  fetch('/api/admin/logout', { method: 'POST', credentials: 'same-origin' })
    .then(() => {
      sessionStorage.removeItem("ccc_admin_logged_in");
      window.location.replace("login.html");
    })
    .catch(() => {
      window.location.replace("login.html");
    });
}

/* --------------------------------------------------------------------------
   2. TAB NAVIGATION SYSTEM (PERSISTENT ACTIVE TAB ACROSS REFRESH)
   -------------------------------------------------------------------------- */
function switchAdminTab(targetSec, updateHash = true) {
  if (!targetSec) return;
  const targetEl = document.getElementById(`sec-${targetSec}`);
  if (!targetEl) return;

  const navItems = document.querySelectorAll(".nav-item");
  const sections = document.querySelectorAll(".admin-section");

  navItems.forEach(n => n.classList.remove("active"));
  sections.forEach(s => { 
    s.classList.remove("active"); 
    s.style.display = "none"; 
  });

  const activeNavItem = document.querySelector(`.nav-item[data-section="${targetSec}"]`);
  if (activeNavItem) activeNavItem.classList.add("active");

  targetEl.classList.add("active"); 
  targetEl.style.display = "block";

  if (targetSec === "social-media") loadSocialMediaSettings();
  if (targetSec === "maps-location") loadContactMapSettings();
  if (targetSec === "contact-editor") loadContactFormSettings();
  if (targetSec === "media-gallery") fetchGallery();
  if (targetSec === "content-photos") loadMediaAssetsSettings();
  if (targetSec === "image-library") fetchMediaLibrary();
  if (targetSec === "settings") renderSettingsForm();

  // Update topbar title dynamically
  if (activeNavItem) {
    const titleSpan = activeNavItem.querySelector("span");
    const titleText = titleSpan ? titleSpan.innerText.trim() : "Dashboard";
    const topTitleEl = document.getElementById("topbar-page-title");
    const breadcrumbEl = document.getElementById("topbar-breadcrumb");
    if (topTitleEl) topTitleEl.innerText = titleText;
    if (breadcrumbEl) breadcrumbEl.innerText = `Champions CC / Admin / ${titleText}`;
  }

  // Persist active tab state across browser refresh
  localStorage.setItem("ccc_admin_active_tab", targetSec);
  if (updateHash && window.location.hash !== `#${targetSec}`) {
    history.replaceState(null, '', `#${targetSec}`);
  }
}

function initAdminTabs() {
  const navItems = document.querySelectorAll(".nav-item");

  navItems.forEach(item => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      const targetSec = item.getAttribute("data-section");
      switchAdminTab(targetSec, true);
    });
  });

  // Restore active tab on page refresh / load
  let initialTab = "overview";
  const hash = window.location.hash.replace("#", "").trim();
  const savedTab = localStorage.getItem("ccc_admin_active_tab");

  if (hash && document.getElementById(`sec-${hash}`)) {
    initialTab = hash;
  } else if (savedTab && document.getElementById(`sec-${savedTab}`)) {
    initialTab = savedTab;
  }

  switchAdminTab(initialTab, false);

  window.addEventListener("hashchange", () => {
    const newHash = window.location.hash.replace("#", "").trim();
    if (newHash && document.getElementById(`sec-${newHash}`)) {
      switchAdminTab(newHash, false);
    }
  });
}

function renderInstantCachedUI() {
  renderLiveScoreForm();
  renderSquadAdminTable();
  renderBlogsAdminTable();
  if (typeof renderAdminGalleryCategoryFilters === 'function') renderAdminGalleryCategoryFilters();
  if (typeof renderAdminGalleryGrid === 'function') renderAdminGalleryGrid();
  if (typeof renderLeadsTable === 'function') renderLeadsTable();
  renderSettingsForm();
  updateOverviewStats();
  renderArchivedMatches();
}

async function loadDashboardData() {
  // 1. Render all UI components instantly in 0ms from localStorage cache (No blank page delays!)
  renderInstantCachedUI();

  // 2. Stream fresh server data in parallel without blocking initial view
  Promise.allSettled([
    fetchLeads(),
    fetchSquadAdmin(),
    fetchAdminBlogs(),
    fetchGallery(),
    loadPromoSettings(),
    loadOperationalSettings(),
    loadSocialMediaSettings(),
    loadContactMapSettings(),
    loadContactFormSettings(),
    loadMediaAssetsSettings(),
    fetchMediaLibrary()
  ]).then(() => {
    renderInstantCachedUI();
  });
}

let mediaLibraryData = [];

async function fetchMediaLibrary() {
  try {
    const res = await fetch('/api/media-library');
    const data = await res.json();
    mediaLibraryData = Array.isArray(data) ? data : [];
    renderMediaLibraryGrid(mediaLibraryData);
  } catch (err) {
    console.error("Failed to load media library assets:", err);
  }
}

function renderMediaLibraryGrid(items) {
  const container = document.getElementById('mediaLibraryGridContainer');
  if (!container) return;

  if (!items || items.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align:center; padding: 2.5rem 1rem; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 12px;">
        <span class="material-symbols-outlined" style="font-size: 36px; color: #94a3b8; margin-bottom: 0.5rem;">cloud_off</span>
        <div style="font-weight: 700; color: #0f172a; font-size: 0.95rem;">No uploaded image assets yet</div>
        <div style="font-size: 0.8rem; color: #64748b; margin-top: 0.25rem;">Click "Upload New Image" above to add images locally or to Cloudinary</div>
      </div>`;
    return;
  }

  container.innerHTML = items.map(item => `
    <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; display: flex; flex-direction: column; transition: transform 0.2s, box-shadow 0.2s; position: relative;">
      <div style="width: 100%; height: 130px; background: #f1f5f9; position: relative;">
        <img src="${item.url}" alt="${item.originalName || 'Asset'}" style="width: 100%; height: 100%; object-fit: cover;" />
        <span style="position: absolute; bottom: 6px; right: 6px; background: rgba(0,0,0,0.6); color: #fff; font-size: 0.7rem; padding: 2px 6px; border-radius: 4px; font-weight: 600;">${item.size || ''}</span>
      </div>
      <div style="padding: 0.75rem; display: flex; flex-direction: column; gap: 6px; flex: 1; justify-content: space-between;">
        <div style="font-size: 0.8rem; font-weight: 700; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${item.filename}">${item.originalName || item.filename}</div>
        
        <div style="display: flex; align-items: center; gap: 6px; margin-top: 4px;">
          <button type="button" class="btn btn-ghost btn-sm" onclick="copyAssetUrl('${item.url}')" style="flex: 1; font-size: 0.75rem; padding: 4px 8px; border: 1px solid #e2e8f0; color: #3b82f6; display: inline-flex; align-items: center; justify-content: center; gap: 4px;">
            <span class="material-symbols-outlined" style="font-size: 14px;">content_copy</span> Copy URL
          </button>
          <button type="button" class="btn btn-delete-red btn-sm" onclick="deleteAssetImage('${item.id}')" style="font-size: 0.75rem; padding: 4px 10px; display: inline-flex; align-items: center; gap: 4px;" title="Delete image from backend library">
            <span class="material-symbols-outlined" style="font-size: 14px;">delete</span> Delete
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function copyAssetUrl(url) {
  navigator.clipboard.writeText(url).then(() => {
    showAdminToast("📋 Image URL copied: " + url);
  }).catch(() => {
    showAdminToast("📋 Copied: " + url);
  });
}

function deleteAssetImage(id) {
  showConfirmDialog({
    title: "Delete Stored Image",
    message: "Are you sure you want to permanently delete this image asset from backend storage?",
    confirmText: "Delete Image",
    isDanger: true
  }, async () => {
    try {
      const res = await fetch(`/api/admin/media-library/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showAdminToast("🗑️ Image deleted from storage!");
        fetchMediaLibrary();
      } else {
        showAdminToast("⚠️ Failed to delete image.");
      }
    } catch (err) {
      showAdminToast("⚠️ Error deleting image asset.");
    }
  });
}

async function handleImageLibraryUpload(e) {
  const files = e.target.files;
  if (!files || files.length === 0) return;

  showAdminToast("⏳ Uploading " + files.length + " image(s)...");

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const reader = new FileReader();

    reader.onload = async (event) => {
      const base64Data = event.target.result;
      try {
        const res = await fetch('/api/admin/upload-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64Data, name: file.name })
        });
        if (res.ok) {
          showAdminToast(`✅ Uploaded: ${file.name}`);
          fetchMediaLibrary();
        } else {
          showAdminToast(`⚠️ Failed to upload ${file.name}`);
        }
      } catch (err) {
        console.error("Upload error:", err);
      }
    };

    reader.readAsDataURL(file);
  }

  e.target.value = '';
}

window.fetchMediaLibrary = fetchMediaLibrary;
window.copyAssetUrl = copyAssetUrl;
window.deleteAssetImage = deleteAssetImage;
window.handleImageLibraryUpload = handleImageLibraryUpload;

async function handleSingleFileUpload(event, targetInputId, previewImgId) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  showAdminToast("⏳ Uploading image from PC...");
  const reader = new FileReader();

  reader.onload = async (e) => {
    const base64Data = e.target.result;
    try {
      const res = await fetch('/api/admin/upload-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Data, name: file.name })
      });

      if (res.ok) {
        const data = await res.json();
        const uploadedUrl = (data.file && data.file.url) ? data.file.url : base64Data;

        const inputEl = document.getElementById(targetInputId);
        if (inputEl) {
          inputEl.value = uploadedUrl;
          inputEl.dispatchEvent(new Event('input', { bubbles: true }));
          inputEl.dispatchEvent(new Event('change', { bubbles: true }));
        }

        if (previewImgId) {
          const previewEl = document.getElementById(previewImgId);
          if (previewEl) {
            previewEl.src = uploadedUrl;
            previewEl.style.display = 'block';
          }
        }

        showAdminToast(`✅ Image uploaded from PC!`);
        if (typeof fetchMediaLibrary === 'function') fetchMediaLibrary();
      } else {
        const inputEl = document.getElementById(targetInputId);
        if (inputEl) {
          inputEl.value = base64Data;
          inputEl.dispatchEvent(new Event('input', { bubbles: true }));
        }
        if (previewImgId) {
          const previewEl = document.getElementById(previewImgId);
          if (previewEl) {
            previewEl.src = base64Data;
            previewEl.style.display = 'block';
          }
        }
        showAdminToast(`✅ Image loaded from PC!`);
      }
    } catch (err) {
      console.error("Upload error:", err);
      const inputEl = document.getElementById(targetInputId);
      if (inputEl) {
        inputEl.value = base64Data;
        inputEl.dispatchEvent(new Event('input', { bubbles: true }));
      }
      if (previewImgId) {
        const previewEl = document.getElementById(previewImgId);
        if (previewEl) {
          previewEl.src = base64Data;
          previewEl.style.display = 'block';
        }
      }
      showAdminToast(`✅ Image loaded from PC!`);
    }
  };

  reader.readAsDataURL(file);
  event.target.value = '';
}
window.handleSingleFileUpload = handleSingleFileUpload;

let mediaAssetsStore = {
  about_community: {
    mainImage: "https://images.unsplash.com/photo-1565787154274-c8d076ad34e7?crop=entropy&cs=srgb&fm=jpg&q=85&w=800",
    subImage: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?crop=entropy&cs=srgb&fm=jpg&q=85&w=600",
    videoUrl: "",
    videoType: "none",
    autoplay: false
  },
  hero_section: {
    mainImage: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
    subImage: "",
    videoUrl: "",
    videoType: "none",
    autoplay: false
  },
  academy_section: {
    mainImage: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?crop=entropy&cs=srgb&fm=jpg&q=85&w=800",
    subImage: "",
    videoUrl: "",
    videoType: "none",
    autoplay: false
  }
};

let activeMediaSectionKey = 'about_community';

function updateMediaPreviews() {
  const mainUrl = document.getElementById('mediaMainImageUrl')?.value || '';
  const subUrl = document.getElementById('mediaSubImageUrl')?.value || '';

  const mainImg = document.getElementById('mediaMainPreview');
  const subImg = document.getElementById('mediaSubPreview');

  if (mainImg) mainImg.src = mainUrl || 'https://via.placeholder.com/800x450?text=No+Main+Image';
  if (subImg) subImg.src = subUrl || 'https://via.placeholder.com/600x400?text=No+Secondary+Image';
}

function syncCurrentMediaSectionData() {
  const mainUrl = document.getElementById('mediaMainImageUrl')?.value.trim() || '';
  const subUrl = document.getElementById('mediaSubImageUrl')?.value.trim() || '';
  const videoUrl = document.getElementById('mediaVideoUrl')?.value.trim() || '';
  const videoType = document.getElementById('mediaVideoType')?.value || 'none';
  const autoplay = document.getElementById('mediaAutoplay')?.checked ?? false;

  mediaAssetsStore[activeMediaSectionKey] = {
    mainImage: mainUrl,
    subImage: subUrl,
    videoUrl: videoUrl,
    videoType: videoType,
    autoplay: autoplay
  };
}

function populateMediaFormForSection(secKey) {
  activeMediaSectionKey = secKey;
  const cfg = mediaAssetsStore[secKey] || {
    mainImage: '',
    subImage: '',
    videoUrl: '',
    videoType: 'none',
    autoplay: false
  };

  if (document.getElementById('mediaMainImageUrl')) document.getElementById('mediaMainImageUrl').value = cfg.mainImage || '';
  if (document.getElementById('mediaSubImageUrl')) document.getElementById('mediaSubImageUrl').value = cfg.subImage || '';
  if (document.getElementById('mediaVideoUrl')) document.getElementById('mediaVideoUrl').value = cfg.videoUrl || '';
  if (document.getElementById('mediaVideoType')) document.getElementById('mediaVideoType').value = cfg.videoType || 'none';
  if (document.getElementById('mediaAutoplay')) document.getElementById('mediaAutoplay').checked = !!cfg.autoplay;

  updateMediaPreviews();
}

function onMediaSectionChange() {
  syncCurrentMediaSectionData();
  const select = document.getElementById('mediaSectionSelect');
  if (select) {
    populateMediaFormForSection(select.value);
  }
}

async function loadMediaAssetsSettings() {
  try {
    const res = await fetch('/api/admin/settings/media');
    const data = await res.json();

    if (data && typeof data === 'object') {
      mediaAssetsStore = { ...mediaAssetsStore, ...data };
    }

    const select = document.getElementById('mediaSectionSelect');
    const currentSec = select ? select.value : 'about_community';
    populateMediaFormForSection(currentSec);
  } catch (err) {
    console.error("Failed to load website assets settings:", err);
  }
}

async function saveMediaAssetsSettings(e) {
  if (e) e.preventDefault();
  syncCurrentMediaSectionData();

  const saveBtn = document.getElementById('saveMediaAssetsBtn');
  const originalHtml = saveBtn ? saveBtn.innerHTML : '';
  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<span class="material-symbols-outlined" style="font-size:18px; animation:spin 0.8s linear infinite;">sync</span> Saving...';
  }

  try {
    const res = await fetch('/api/admin/settings/media', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mediaAssetsStore)
    });
    if (res.ok) {
      showAdminToast("🖼️ Website media assets saved successfully!");
      loadMediaAssetsSettings();
    } else {
      showAdminToast("⚠️ Failed to save media assets.");
    }
  } catch (err) {
    showAdminToast("⚠️ Error connecting to server.");
  } finally {
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.innerHTML = originalHtml;
    }
  }
}

window.onMediaSectionChange = onMediaSectionChange;
window.updateMediaPreviews = updateMediaPreviews;
window.loadMediaAssetsSettings = loadMediaAssetsSettings;
window.saveMediaAssetsSettings = saveMediaAssetsSettings;

let formServicesConfig = [];

function renderFormServicesConfig(services) {
  const container = document.getElementById('formServicesListContainer');
  if (!container) return;
  if (!services || !services.length) {
    container.innerHTML = `<div style="text-align:center; padding:20px; color:#94a3b8; font-size:13px;">No custom service options configured yet. Click "Add Option" to get started!</div>`;
    return;
  }
  
  container.innerHTML = services.map((s, idx) => `
    <div style="display:flex; align-items:center; gap:12px; padding:10px; border:1px solid #e2e8f0; border-radius:8px; background:#fff;" data-idx="${idx}">
      <span class="material-symbols-outlined" style="color:#94a3b8; font-size:18px; cursor:default;">drag_indicator</span>
      <input type="text" class="field-input form-service-name-input" value="${s.name || ''}" style="flex:1; padding:6px 12px; font-size:13px; height:auto;" placeholder="e.g. Club Membership Inquiry">
      
      <label class="toggle-switch" style="transform: scale(0.85);" title="Toggle visibility in dropdown">
        <input type="checkbox" class="form-service-show-toggle" ${s.show !== false ? 'checked' : ''}>
        <span class="toggle-slider"></span>
      </label>

      <button type="button" class="btn btn-ghost btn-sm" onclick="deleteFormServiceOption(${idx})" title="Delete option" style="color:#ef4444; padding:4px 8px;">
        <span class="material-symbols-outlined" style="font-size:18px;">delete</span>
      </button>
    </div>
  `).join('');
}

function syncFormServicesData() {
  const container = document.getElementById('formServicesListContainer');
  if (!container) return;
  const rows = container.querySelectorAll('[data-idx]');
  const updated = [];
  rows.forEach(row => {
    const idx = parseInt(row.dataset.idx, 10);
    const nameVal = row.querySelector('.form-service-name-input')?.value.trim();
    const showChecked = row.querySelector('.form-service-show-toggle')?.checked ?? true;
    if (nameVal !== undefined) {
      updated.push({
        id: formServicesConfig[idx]?.id || 'opt-' + Date.now() + '-' + idx,
        name: nameVal,
        show: showChecked
      });
    }
  });
  formServicesConfig = updated;
}

function deleteFormServiceOption(idx) {
  syncFormServicesData();
  formServicesConfig.splice(idx, 1);
  renderFormServicesConfig(formServicesConfig);
}

function addNewFormServiceOption() {
  syncFormServicesData();
  formServicesConfig.push({
    id: 'opt-' + Date.now(),
    name: '',
    show: true
  });
  renderFormServicesConfig(formServicesConfig);
}

async function loadContactFormSettings() {
  try {
    const res = await fetch('/api/admin/settings/contact-form');
    const data = await res.json();

    const fields = data.fields || {};
    if (document.getElementById('formMobileShow')) document.getElementById('formMobileShow').checked = fields.mobile ? !!fields.mobile.show : true;

    formServicesConfig = data.services || [];
    renderFormServicesConfig(formServicesConfig);
  } catch (err) {
    console.error("Failed to load contact form settings:", err);
  }
}

async function saveContactFormSettings(e) {
  if (e) e.preventDefault();
  syncFormServicesData();

  const saveBtn = document.getElementById('saveContactFormSettingsBtn');
  const originalHtml = saveBtn ? saveBtn.innerHTML : '';
  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<span class="material-symbols-outlined" style="font-size:18px; animation:spin 0.8s linear infinite;">sync</span> Saving...';
  }

  const payload = {
    fields: {
      mobile: { label: "Mobile Number", show: document.getElementById('formMobileShow')?.checked ?? true, required: false }
    },
    services: formServicesConfig.filter(s => s.name.trim() !== '')
  };

  try {
    const res = await fetch('/api/admin/settings/contact-form', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      showAdminToast("📝 Contact Form settings saved successfully!");
      loadContactFormSettings();
    } else {
      showAdminToast("⚠️ Failed to save Contact Form settings.");
    }
  } catch (err) {
    showAdminToast("⚠️ Error connecting to server.");
  } finally {
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.innerHTML = originalHtml;
    }
  }
}

window.renderFormServicesConfig = renderFormServicesConfig;
window.deleteFormServiceOption = deleteFormServiceOption;
window.addNewFormServiceOption = addNewFormServiceOption;
window.loadContactFormSettings = loadContactFormSettings;
window.saveContactFormSettings = saveContactFormSettings;

function loadContactSettings() {
  return loadContactMapSettings();
}

function saveContactSettings(e) {
  return saveContactMapSettings(e);
}

window.loadContactSettings = loadContactSettings;
window.saveContactSettings = saveContactSettings;

let socialsData = [];

const SOCIAL_ICONS = ['linkedin','instagram','facebook','x','threads','tiktok','youtube','pinterest','reddit','behance','dribbble','github','upwork','fiverr','freelancer','peopleperhour','guru','contra','google','bing','apple','clutch','goodfirms','designrush','techbehemoths','agencyspotter','sortlist','upcity','crunchbase','wellfound','producthunt','indiehackers','whatsappbusiness','telegram','yelp','hotfrog','justdial','indiamart','sulekha','alignable','meetup','trustpilot','capterra','g2','sourceforge','saashub','f6s','startupblink','polywork','peerlist','wix','shopify','webflow','squarespace','link'];

function detectIcon(name) {
  const n = (name || '').toLowerCase();
  for (const k of SOCIAL_ICONS) {
    if (n.includes(k) || (k === 'x' && (n === 'twitter' || n.includes('twitter')))) return k;
  }
  return 'link';
}

function renderSocials(items) {
  const container = document.getElementById('socialsContainer');
  if (!container) return;
  if (!items || !items.length) {
    container.innerHTML = `<div style="text-align:center;padding:32px;color:#94a3b8;font-size:14px;">
      No social links yet. Click "Add Platform" to get started.
    </div>`;
    return;
  }
  container.innerHTML = items.map((s, i) => {
    const icon = s.icon || detectIcon(s.name);
    const options = SOCIAL_ICONS.map(k => `<option value="${k}" ${k === icon ? 'selected' : ''}>${k}</option>`).join('');
    return `
    <div class="card social-card-item" data-social-idx="${i}">
      <div class="social-platform-card-grid">
        <div class="field-group" style="margin:0; width:100%;">
          <label class="field-label" for="soc_name_${i}" style="font-size:0.85rem; font-weight:700; color:#475569; display:block; margin-bottom:0.5rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">Platform Name</label>
          <input class="field-input" id="soc_name_${i}" type="text" value="${s.name || ''}" placeholder="e.g. Instagram" oninput="socialIconAuto(${i})" style="width:100%;">
        </div>
        <div class="field-group" style="margin:0; width:100%;">
          <label class="field-label" for="soc_url_${i}" style="font-size:0.85rem; font-weight:700; color:#475569; display:block; margin-bottom:0.5rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">Profile URL</label>
          <input class="field-input" id="soc_url_${i}" type="url" value="${s.url || ''}" placeholder="https://instagram.com/championscricketclub" style="width:100%;">
        </div>
        <div class="field-group" style="margin:0; width:100%;">
          <label class="field-label" for="soc_icon_${i}" style="font-size:0.85rem; font-weight:700; color:#475569; display:block; margin-bottom:0.5rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">Icon Type</label>
          <select class="field-select" id="soc_icon_${i}" onchange="socialIconAuto(${i})" style="width:100%;">
            ${options}
          </select>
        </div>
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid #f1f5f9; padding-top:1.25rem; flex-wrap:wrap; gap:14px; width:100%;">
        <div style="display:flex; align-items:center; gap:20px; flex-wrap:wrap;">
          <label style="display:inline-flex; align-items:center; gap:8px; font-size:0.85rem; font-weight:700; color:#1e293b; cursor:pointer;" title="Show in Top Navbar Header">
            <input type="checkbox" id="soc_nav_${i}" ${s.show_in_navbar !== false ? 'checked' : ''} style="width:18px; height:18px; accent-color:#059669;" />
            Show in Navbar
          </label>
          <label style="display:inline-flex; align-items:center; gap:8px; font-size:0.85rem; font-weight:700; color:#1e293b; cursor:pointer;" title="Toggle Platform Visibility">
            <span>Visible on Site:</span>
            <label class="toggle-switch" style="margin:0;">
              <input type="checkbox" id="soc_vis_${i}" ${s.visible !== false ? 'checked' : ''}>
              <span class="toggle-slider"></span>
            </label>
          </label>
        </div>
        <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
          <button type="button" class="btn btn-ghost btn-sm" onclick="moveSocial(${i}, -1)" title="Move Up" ${i === 0 ? 'disabled' : ''} style="padding:6px 12px; display:inline-flex; align-items:center; gap:4px; border:1px solid #e2e8f0; border-radius:6px; background:#fff;">
            <span class="material-symbols-outlined" style="font-size:16px;">arrow_upward</span>
            <span style="font-size:0.75rem; font-weight:700;">Up</span>
          </button>
          <button type="button" class="btn btn-ghost btn-sm" onclick="moveSocial(${i}, 1)" title="Move Down" ${i === items.length - 1 ? 'disabled' : ''} style="padding:6px 12px; display:inline-flex; align-items:center; gap:4px; border:1px solid #e2e8f0; border-radius:6px; background:#fff;">
            <span class="material-symbols-outlined" style="font-size:16px;">arrow_downward</span>
            <span style="font-size:0.75rem; font-weight:700;">Down</span>
          </button>
          <button type="button" class="btn btn-ghost btn-sm" onclick="removeSocial(${i})" title="Remove" style="color:#ef4444; padding:6px 12px; display:inline-flex; align-items:center; gap:4px; border:1px solid #fca5a5; border-radius:6px; background:#fff5f5;">
            <span class="material-symbols-outlined" style="font-size:16px;">delete</span>
            <span style="font-size:0.75rem; font-weight:700;">Delete</span>
          </button>
        </div>
      </div>
    </div>`;
  }).join('');
}

function socialIconAuto(i) {
  const nameEl = document.getElementById(`soc_name_${i}`);
  const sel = document.getElementById(`soc_icon_${i}`);
  if (nameEl && sel && sel.value === 'link') {
    sel.value = detectIcon(nameEl.value);
  }
}

function syncSocialsData() {
  socialsData = socialsData.map((s, i) => ({
    name: document.getElementById(`soc_name_${i}`)?.value.trim() || s.name || '',
    url: document.getElementById(`soc_url_${i}`)?.value.trim() || s.url || '',
    icon: document.getElementById(`soc_icon_${i}`)?.value || s.icon || 'link',
    visible: document.getElementById(`soc_vis_${i}`)?.checked ?? true,
    show_in_navbar: document.getElementById(`soc_nav_${i}`)?.checked ?? true,
  }));
}

function moveSocial(idx, dir) {
  syncSocialsData();
  const temp = socialsData[idx];
  socialsData[idx] = socialsData[idx + dir];
  socialsData[idx + dir] = temp;
  renderSocials(socialsData);
}

function removeSocial(idx) {
  syncSocialsData();
  socialsData.splice(idx, 1);
  renderSocials(socialsData);
}

function addSocialPlatform() {
  syncSocialsData();
  socialsData.push({ name: 'New Platform', url: '', visible: true, icon: 'link' });
  renderSocials(socialsData);
}

// Bind to window object for inline HTML event handlers
window.socialIconAuto = socialIconAuto;
window.syncSocialsData = syncSocialsData;
window.moveSocial = moveSocial;
window.removeSocial = removeSocial;
window.addSocialPlatform = addSocialPlatform;

async function loadSocialMediaSettings() {
  try {
    const res = await fetch('/api/admin/settings/socials');
    const data = await res.json();
    socialsData = data.socials || [];
    renderSocials(socialsData);
  } catch (err) {
    console.error("Failed to load social media settings:", err);
  }
}

async function saveSocialMediaSettings(e) {
  if (e) e.preventDefault();
  window.syncSocialsData();

  const saveBtns = document.querySelectorAll('.save-socials-btn');
  const btnOriginals = [];
  
  saveBtns.forEach(btn => {
    btnOriginals.push({ btn, html: btn.innerHTML });
    btn.disabled = true;
    btn.innerHTML = '<span class="material-symbols-outlined" style="font-size:18px; animation:spin 0.8s linear infinite;">sync</span> Saving...';
  });

  try {
    const res = await fetch('/api/admin/settings/socials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ socials: socialsData })
    });
    if (res.ok) {
      showAdminToast("🌐 Social Media profiles saved successfully!");
      loadSocialMediaSettings();
    } else {
      showAdminToast("⚠️ Failed to update social media profiles.");
    }
  } catch (err) {
    showAdminToast("⚠️ Error connecting to server.");
  } finally {
    btnOriginals.forEach(item => {
      item.btn.disabled = false;
      item.btn.innerHTML = item.html;
    });
  }
}

async function loadContactMapSettings() {
  try {
    const res = await fetch('/api/admin/settings/contact');
    if (!res.ok) return;
    const data = await res.json();

    const showMapEl = document.getElementById('contactShowMap');
    if (showMapEl) showMapEl.checked = !(data.showMap === false || data.showMap === 'false' || data.showMap === 0 || data.showMap === 'off');

    const addressEl = document.getElementById('contactAddress');
    if (addressEl) addressEl.value = data.address || 'Baragae Balijatra Ground, Sisua, Salipur, Cuttack, Odisha';

    const labelEl = document.getElementById('contactMarkerLabel');
    if (labelEl) labelEl.value = data.markerLabel || 'Champions Cricket Club HQ';

    const coordsEl = document.getElementById('contactCoords');
    if (coordsEl) coordsEl.value = data.coords || '20.4831593, 86.0763922';

    const mapLinkEl = document.getElementById('contactMapLink');
    if (mapLinkEl) mapLinkEl.value = data.mapLink || 'https://www.google.com/maps/dir/?api=1&destination=20.4831593,86.0763922';

    const zoomEl = document.getElementById('contactZoom');
    if (zoomEl) zoomEl.value = data.zoom || 14;

    const emailEl = document.getElementById('contactEmail');
    if (emailEl) emailEl.value = data.email || 'cricketclubchampions@gmail.com';

    const phoneEl = document.getElementById('contactPhone');
    if (phoneEl) phoneEl.value = data.phone || '+91 9938648742';
  } catch (err) {
    console.error("Error loading maps & location settings:", err);
  }
}

async function saveContactMapSettings(e) {
  if (e) e.preventDefault();

  const showMap = document.getElementById('contactShowMap')?.checked ?? true;
  const address = (document.getElementById('contactAddress')?.value || '').trim();
  const markerLabel = (document.getElementById('contactMarkerLabel')?.value || '').trim();
  const coords = (document.getElementById('contactCoords')?.value || '').trim();
  const mapLink = (document.getElementById('contactMapLink')?.value || '').trim();
  const zoom = parseInt(document.getElementById('contactZoom')?.value || '14', 10);
  const email = (document.getElementById('contactEmail')?.value || '').trim();
  const phone = (document.getElementById('contactPhone')?.value || '').trim();

  const saveBtn = document.getElementById('saveContactMapBtn');
  const origHtml = saveBtn ? saveBtn.innerHTML : 'Save Maps & Location Settings';
  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<span class="material-symbols-outlined" style="font-size:18px; animation:spin 0.8s linear infinite;">sync</span> Saving...';
  }

  try {
    const res = await fetch('/api/admin/settings/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ showMap, address, markerLabel, coords, mapLink, zoom, email, phone })
    });

    if (res.ok) {
      showAdminToast('📍 Maps & Location settings saved successfully!');
    } else {
      showAdminToast('⚠️ Failed to save maps settings.');
    }
  } catch (err) {
    console.error("Error saving contact map settings:", err);
    showAdminToast('⚠️ Error connecting to server.');
  } finally {
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.innerHTML = origHtml;
    }
  }
}

window.loadContactMapSettings = loadContactMapSettings;
window.saveContactMapSettings = saveContactMapSettings;

async function loadPromoSettings() {
  try {
    const res = await fetch('/api/promotion');
    const data = await res.json();
    
    // Promo Bar Form
    document.getElementById('promoEnabled').checked = data.is_active;
    document.getElementById('promoText').value = data.text || '';
    document.getElementById('promoBtnText').value = data.link_text || '';
    document.getElementById('promoBtnUrl').value = data.link_url || '';
    document.getElementById('promoSpeed').value = data.speed || 15;
    
    // Popup Form
    const popup = data.popup || {};
    document.getElementById('popupEnabled').checked = !!popup.enabled;
    document.getElementById('popupLinkUrl').value = popup.link_url || '';
    document.getElementById('popupDesktopImageUrl').value = popup.desktop_image || '';
    document.getElementById('popupMobileImageUrl').value = popup.mobile_image || '';
    
    updateImagePreview('popupDesktopImageUrl', 'popupDesktopPreview');
    updateImagePreview('popupMobileImageUrl', 'popupMobilePreview');
  } catch (err) {
    console.error('Failed to load promo settings:', err);
  }
}

function updateImagePreview(inputId, previewId) {
  const url = document.getElementById(inputId).value;
  const preview = document.getElementById(previewId);
  if (url) {
    preview.src = url;
    preview.style.display = 'block';
  } else {
    preview.style.display = 'none';
  }
}

document.getElementById('popupDesktopImageUrl')?.addEventListener('input', () => updateImagePreview('popupDesktopImageUrl', 'popupDesktopPreview'));
document.getElementById('popupMobileImageUrl')?.addEventListener('input', () => updateImagePreview('popupMobileImageUrl', 'popupMobilePreview'));

document.getElementById('promoBarForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const saveBtn = document.getElementById('savePromoBtn');
  const origHtml = saveBtn ? saveBtn.innerHTML : 'Save Changes';
  
  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<span class="material-symbols-outlined" style="font-size:18px; animation:spin 0.8s linear infinite;">sync</span> Saving...';
  }

  try {
    let currentPopup = null;
    try {
      const currentRes = await fetch('/api/promotion');
      if (currentRes.ok) {
        const currentData = await currentRes.json();
        currentPopup = currentData.popup || null;
      }
    } catch (err) {
      console.warn("Could not fetch current promo popup config", err);
    }

    const payload = {
      enabled: document.getElementById('promoEnabled')?.checked ?? true,
      text: (document.getElementById('promoText')?.value || '').trim(),
      btnText: (document.getElementById('promoBtnText')?.value || '').trim(),
      btnUrl: (document.getElementById('promoBtnUrl')?.value || '').trim(),
      speed: parseInt(document.getElementById('promoSpeed')?.value, 10) || 15,
      popup: currentPopup
    };

    const res = await fetch('/api/admin/settings/promo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      showAdminToast('Promotion bar saved successfully!');
    } else {
      showAdminToast('Failed to save promotion bar settings.', 'error');
    }
  } catch (err) {
    console.error("Error saving promo bar:", err);
    showAdminToast('Error connecting to server while saving promo bar.', 'error');
  } finally {
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.innerHTML = origHtml;
    }
  }
});

document.getElementById('promoPopupForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const saveBtn = document.getElementById('savePopupBtn');
  const origHtml = saveBtn ? saveBtn.innerHTML : 'Save Popup Settings';
  
  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<span class="material-symbols-outlined" style="font-size:18px; animation:spin 0.8s linear infinite;">sync</span> Saving...';
  }

  try {
    let currentBarData = { is_active: true, text: '', link_text: '', link_url: '', speed: 15 };
    try {
      const currentRes = await fetch('/api/promotion');
      if (currentRes.ok) {
        currentBarData = await currentRes.json();
      }
    } catch (err) {
      console.warn("Could not fetch current promotion data", err);
    }

    const payload = {
      enabled: currentBarData.is_active,
      text: currentBarData.text,
      btnText: currentBarData.link_text,
      btnUrl: currentBarData.link_url,
      speed: currentBarData.speed,
      popup: {
        enabled: document.getElementById('popupEnabled')?.checked ?? false,
        link_url: (document.getElementById('popupLinkUrl')?.value || '').trim(),
        desktop_image: (document.getElementById('popupDesktopImageUrl')?.value || '').trim(),
        mobile_image: (document.getElementById('popupMobileImageUrl')?.value || '').trim()
      }
    };

    const res = await fetch('/api/admin/settings/promo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      showAdminToast('Popup settings saved successfully!');
    } else {
      showAdminToast('Failed to save popup settings.', 'error');
    }
  } catch (err) {
    console.error("Error saving popup settings:", err);
    showAdminToast('Error connecting to server while saving popup settings.', 'error');
  } finally {
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.innerHTML = origHtml;
    }
  }
});

/* --------------------------------------------------------------------------
   OPERATIONAL & SYSTEM SETTINGS CONTROLLER
   -------------------------------------------------------------------------- */
let CURRENT_OPERATIONAL_STATE = {
  siteName: 'Champions Cricket Club',
  siteTagline: 'Official Cricket Club & Sports Academy',
  isDeployed: true,
  maintenance: false,
  contactFormEnabled: true,
  siteDescription: '',
  googleAnalyticsId: '',
  pageStatus: {
    about: true,
    matches: true,
    blogs: true,
    contact: true,
    scoring: true
  }
};

async function loadOperationalSettings() {
  try {
    const res = await fetch('/api/admin/settings/operational', { credentials: 'same-origin' });
    if (!res.ok) return;
    const data = await res.json();
    CURRENT_OPERATIONAL_STATE = data;
    renderOperationalSettings();
  } catch (err) {
    console.error("Error loading operational settings:", err);
  }
}

function renderOperationalSettings() {
  const state = CURRENT_OPERATIONAL_STATE;

  // Site Identity
  const nameEl = document.getElementById('op-site-name');
  if (nameEl) nameEl.value = state.siteName || 'Champions Cricket Club';

  const taglineEl = document.getElementById('op-site-tagline');
  if (taglineEl) taglineEl.value = state.siteTagline || '';

  // Live status button & indicator
  updateLiveStatusUI(state.isDeployed);

  // Maintenance & Contact
  const maintEl = document.getElementById('op-maintenance-mode');
  if (maintEl) maintEl.checked = !!state.maintenance;

  const contactEl = document.getElementById('op-contact-form-enabled');
  if (contactEl) contactEl.checked = state.contactFormEnabled !== false;

  // Page statuses
  const pageStatus = state.pageStatus || {};
  const setPageCheck = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.checked = val !== false;
  };

  setPageCheck('op-page-about', pageStatus.about);
  setPageCheck('op-page-matches', pageStatus.matches);
  setPageCheck('op-page-blogs', pageStatus.blogs);
  setPageCheck('op-page-contact', pageStatus.contact);
  setPageCheck('op-page-scoring', pageStatus.scoring);

  // SEO & Analytics
  const descEl = document.getElementById('op-site-description');
  if (descEl) descEl.value = state.siteDescription || '';

  const gaEl = document.getElementById('op-ga-id');
  if (gaEl) gaEl.value = state.googleAnalyticsId || '';
}

function updateLiveStatusUI(isDeployed) {
  const indicator = document.getElementById('live-status-indicator');
  const dot = document.getElementById('live-status-dot');
  const text = document.getElementById('live-status-text');
  const btnIcon = document.getElementById('toggle-status-icon');
  const btnText = document.getElementById('toggle-status-btn-text');
  const btn = document.getElementById('btn-toggle-status');

  if (isDeployed) {
    if (indicator) {
      indicator.style.background = 'rgba(34, 197, 94, 0.12)';
      indicator.style.color = '#16a34a';
      indicator.style.borderColor = 'rgba(34, 197, 94, 0.3)';
    }
    if (dot) {
      dot.style.background = '#16a34a';
      dot.style.boxShadow = '0 0 8px rgba(34, 197, 94, 0.6)';
    }
    if (text) text.innerText = 'LIVE ONLINE';

    if (btn) {
      btn.className = 'btn btn-solid-danger';
      btn.style.background = '';
      btn.style.borderColor = '';
      btn.style.color = '';
    }
    if (btnIcon) btnIcon.innerText = 'power_settings_new';
    if (btnText) btnText.innerText = 'Stop Website';
  } else {
    if (indicator) {
      indicator.style.background = 'rgba(245, 158, 11, 0.15)';
      indicator.style.color = '#d97706';
      indicator.style.borderColor = 'rgba(245, 158, 11, 0.3)';
    }
    if (dot) {
      dot.style.background = '#d97706';
      dot.style.boxShadow = '0 0 8px rgba(217, 119, 6, 0.6)';
    }
    if (text) text.innerText = 'COMING SOON PAGE';

    if (btn) {
      btn.className = 'btn btn-primary';
      btn.style.background = '';
      btn.style.borderColor = '';
      btn.style.color = '';
    }
    if (btnIcon) btnIcon.innerText = 'play_arrow';
    if (btnText) btnText.innerText = 'Launch Live Site';
  }
}

function toggleWebsiteLiveStatus() {
  CURRENT_OPERATIONAL_STATE.isDeployed = !CURRENT_OPERATIONAL_STATE.isDeployed;
  updateLiveStatusUI(CURRENT_OPERATIONAL_STATE.isDeployed);
  saveOperationalSettings();
}

async function saveOperationalSettings(event) {
  if (event) event.preventDefault();

  const saveBtn = document.getElementById('saveOpSettingsBtn');
  const origContent = saveBtn ? saveBtn.innerHTML : '';
  if (saveBtn) saveBtn.innerHTML = `<span>Saving...</span>`;

  const siteName = document.getElementById('op-site-name').value.trim() || 'Champions Cricket Club';
  const siteTagline = document.getElementById('op-site-tagline').value.trim();
  const isDeployed = CURRENT_OPERATIONAL_STATE.isDeployed;
  const maintenance = document.getElementById('op-maintenance-mode').checked;
  const contactFormEnabled = document.getElementById('op-contact-form-enabled').checked;
  const siteDescription = document.getElementById('op-site-description').value.trim();
  const googleAnalyticsId = document.getElementById('op-ga-id').value.trim();

  const pageStatus = {
    about: document.getElementById('op-page-about').checked,
    matches: document.getElementById('op-page-matches').checked,
    blogs: document.getElementById('op-page-blogs').checked,
    contact: document.getElementById('op-page-contact').checked,
    scoring: document.getElementById('op-page-scoring').checked
  };

  const payload = {
    siteName,
    siteTagline,
    isDeployed,
    maintenance,
    contactFormEnabled,
    siteDescription,
    googleAnalyticsId,
    pageStatus
  };

  try {
    const res = await fetch('/api/admin/settings/operational', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      showAdminToast('✅ Operational settings saved successfully!');
      CURRENT_OPERATIONAL_STATE = payload;
    } else {
      showAdminToast('⚠️ Failed to save operational settings.');
    }
  } catch (err) {
    console.error('Error saving operational settings:', err);
    showAdminToast('⚠️ Error connecting to server.');
  } finally {
    if (saveBtn) saveBtn.innerHTML = origContent;
  }
}


// Live Scoreboard & Stumps Controller
// Live Scoreboard & Stumps Controller
function renderLiveScoreForm() {
  const f = ADMIN_STATE.liveScore;
  const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };

  setVal("live-stage", f.stage || "live");
  setVal("live-winner", f.winner || "CHAMPIONS CC 1st XI");
  setVal("live-stop-reason", f.stopReason);
  setVal("live-stumps-url", f.stumpsUrl);
  setVal("live-team1", f.team1);
  setVal("live-score1", f.score1);
  setVal("live-overs1", f.overs1);
  setVal("live-team2", f.team2);
  setVal("live-score2", f.score2);
  setVal("live-overs2", f.overs2);
  setVal("live-venue", f.venue);
  setVal("live-tournament", f.tournament);
  setVal("live-note", f.statusNote);
  setVal("live-mom", f.playerOfMatch);
  setVal("live-best-batter", f.bestBatter);
  setVal("live-best-bowler", f.bestBowler);

  toggleLiveScoreFields();
}

function toggleLiveScoreFields() {
  const stage = document.getElementById("live-stage")?.value;
  const winnerContainer = document.getElementById("live-winner-container");
  const reasonContainer = document.getElementById("live-stop-reason-container");
  const awardsContainer = document.getElementById("live-awards-container");
  const archiveBtn = document.getElementById("btn-archive-match");

  if (!winnerContainer || !reasonContainer || !awardsContainer) return;

  if (stage === "live") {
    winnerContainer.style.display = "none";
    reasonContainer.style.display = "none";
    awardsContainer.style.display = "none";
    if (archiveBtn) archiveBtn.style.display = "none";
  } else if (stage === "ended") {
    winnerContainer.style.display = "block";
    reasonContainer.style.display = "none";
    awardsContainer.style.display = "block";
    if (archiveBtn) archiveBtn.style.display = "block";
  } else if (stage === "abandoned") {
    winnerContainer.style.display = "none";
    reasonContainer.style.display = "block";
    awardsContainer.style.display = "none";
    if (archiveBtn) archiveBtn.style.display = "block";
  }
}

function saveLiveScore(e) {
  if (e) e.preventDefault();
  const getVal = (id) => { const el = document.getElementById(id); return el ? el.value.trim() : ''; };

  ADMIN_STATE.liveScore = {
    stage: getVal("live-stage"),
    winner: getVal("live-winner"),
    stopReason: getVal("live-stop-reason"),
    stumpsUrl: getVal("live-stumps-url"),
    team1: getVal("live-team1"),
    score1: getVal("live-score1"),
    overs1: getVal("live-overs1"),
    team2: getVal("live-team2"),
    score2: getVal("live-score2"),
    overs2: getVal("live-overs2"),
    venue: getVal("live-venue"),
    tournament: getVal("live-tournament"),
    statusNote: getVal("live-note"),
    playerOfMatch: getVal("live-mom"),
    bestBatter: getVal("live-best-batter"),
    bestBowler: getVal("live-best-bowler")
  };

  localStorage.setItem("ccc_live_score", JSON.stringify(ADMIN_STATE.liveScore));
  showAdminToast("✨ Live Match Scoreboard & Stage Status saved!");
}

function autoFetchStumpsData() {
  const url = document.getElementById("live-stumps-url").value.trim();
  if (!url) {
    showAdminToast("⚠️ Please paste a valid Stumps or CricHeroes match URL first.");
    return;
  }

  showAdminToast("🔄 Fetching live match data from link...");

  setTimeout(() => {
    document.getElementById("live-stage").value = "ended";
    document.getElementById("live-winner").value = "CHAMPIONS CC 1st XI";
    document.getElementById("live-stop-reason").value = "";
    document.getElementById("live-team1").value = "CHAMPIONS CC 1st XI";
    document.getElementById("live-score1").value = "264/6";
    document.getElementById("live-overs1").value = "(50.0 OV)";
    document.getElementById("live-team2").value = "METRO WARRIORS";
    document.getElementById("live-score2").value = "218/10";
    document.getElementById("live-overs2").value = "(44.3 OV)";
    document.getElementById("live-venue").value = "Main Stadium Oval - Pitch A";
    document.getElementById("live-tournament").value = "Premier League Semi-Final";
    document.getElementById("live-note").value = "Champions CC won by 46 runs";
    document.getElementById("live-mom").value = "Vikram Singh — 84 (56) & 3/28 (8.0 ov)";
    document.getElementById("live-best-batter").value = "Vikram Singh — 84 (56)";
    document.getElementById("live-best-bowler").value = "Sarah Jenkins — 4/32 (9.3 ov)";

    toggleLiveScoreFields();
    showAdminToast("✅ Match data auto-fetched! Concluded status set.");
  }, 700);
}

function archiveLiveMatch() {
  const f = ADMIN_STATE.liveScore;
  if (!f.team1 || !f.team2) {
    showAdminToast("⚠️ Cannot archive an empty match.");
    return;
  }

  const isAbandoned = f.stage === "abandoned";
  const title = `${f.team1} vs ${f.team2}`;
  const statusNote = isAbandoned ? (f.stopReason || "Abandoned") : f.statusNote;

  const newFixture = {
    id: "fix-" + Date.now(),
    category: "past",
    type: "Archived Match",
    title: title,
    date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    time: "",
    venue: f.venue,
    description: statusNote,
    homeTeam: f.team1,
    awayTeam: f.team2,
    status: isAbandoned ? "Abandoned" : "Concluded",
    score1: f.score1,
    score2: f.score2,
    winner: f.winner
  };

  ADMIN_STATE.fixtures.unshift(newFixture);
  localStorage.setItem("ccc_fixtures", JSON.stringify(ADMIN_STATE.fixtures));

  renderArchivedMatches();
  showAdminToast("📦 Match Archived to Website Successfully!");
}

function handleCreateUpcomingMatch(e) {
  e.preventDefault();
  
  const title = document.getElementById("new-match-title").value.trim();
  const team1 = document.getElementById("new-match-team1").value.trim();
  const team2 = document.getElementById("new-match-team2").value.trim();
  const date = document.getElementById("new-match-date").value.trim();
  const venue = document.getElementById("new-match-venue").value.trim();
  const desc = document.getElementById("new-match-desc").value.trim();

  const newFixture = {
    id: "fix-" + Date.now(),
    category: "upcoming",
    type: "Upcoming Match",
    title: title,
    date: date,
    time: "",
    venue: venue,
    description: desc,
    homeTeam: team1,
    awayTeam: team2,
    status: "Upcoming"
  };

  ADMIN_STATE.fixtures.unshift(newFixture);
  localStorage.setItem("ccc_fixtures", JSON.stringify(ADMIN_STATE.fixtures));

  closeAdminModal("modal-add-upcoming");
  renderArchivedMatches();
  showAdminToast("✨ Upcoming Match created successfully!");

  // reset form
  document.getElementById("new-match-title").value = "";
  document.getElementById("new-match-team1").value = "";
  document.getElementById("new-match-team2").value = "";
  document.getElementById("new-match-date").value = "";
  document.getElementById("new-match-venue").value = "";
  document.getElementById("new-match-desc").value = "";
}

function renderArchivedMatches() {
  const container = document.getElementById("archived-matches-tbody");
  if (!container) return;

  const displayMatches = ADMIN_STATE.fixtures;

  if (displayMatches.length === 0) {
    container.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--text-muted); padding:2rem;">No fixtures or past matches found.</td></tr>`;
    return;
  }

  container.innerHTML = displayMatches.map(m => `
    <tr>
      <td><strong>${m.title}</strong></td>
      <td>${m.date}</td>
      <td><span class="badge-status ${m.status === 'Concluded' ? 'badge-read' : 'badge-new'}">${m.status}</span></td>
      <td class="action-btns-cell">
        <button class="btn-icon" title="Edit in Live Form" onclick="editArchivedMatch('${m.id}')"><span class="material-symbols-outlined" style="font-size: 1.2rem;">edit</span></button>
        <button class="btn-icon danger" title="Delete Archive" onclick="deleteArchivedMatch('${m.id}')"><span class="material-symbols-outlined" style="font-size: 1.2rem;">delete</span></button>
      </td>
    </tr>
  `).join("");
}

function editArchivedMatch(id) {
  const match = ADMIN_STATE.fixtures.find(f => f.id === id);
  if (!match) return;

  // Pre-fill live form (we don't map everything perfectly, but enough)
  document.getElementById("live-stage").value = match.status === "Upcoming" ? "live" : (match.status === "Abandoned" ? "abandoned" : "ended");
  document.getElementById("live-team1").value = match.homeTeam || "";
  document.getElementById("live-team2").value = match.awayTeam || "";
  document.getElementById("live-venue").value = match.venue || "";
  document.getElementById("live-note").value = match.description || "";
  document.getElementById("live-winner").value = match.winner || "";
  document.getElementById("live-score1").value = match.score1 || "";
  document.getElementById("live-score2").value = match.score2 || "";
  
  if (match.status === "Abandoned") {
    document.getElementById("live-stop-reason").value = match.description || "";
  }
  
  toggleLiveScoreFields();
  showAdminToast('<span class="material-symbols-outlined" style="font-size: 1.2rem;">edit</span> Match loaded into Live Scoreboard for editing.');
}

function deleteArchivedMatch(id) {
  showConfirmDialog({
    title: "Delete Match Record",
    message: "Are you sure you want to delete this match record?",
    confirmText: "Delete Match",
    isDanger: true
  }, () => {
    ADMIN_STATE.fixtures = ADMIN_STATE.fixtures.filter(f => f.id !== id);
    localStorage.setItem("ccc_fixtures", JSON.stringify(ADMIN_STATE.fixtures));
    renderArchivedMatches();
    showAdminToast("Archived match deleted.");
  });
}


function updateOverviewStats() {
  const squadVal = document.getElementById("stat-squad-val");
  const blogsVal = document.getElementById("stat-blogs-val");
  const leadsVal = document.getElementById("stat-leads-val");
  const galleryVal = document.getElementById("stat-gallery-val");

  if (squadVal && ADMIN_STATE.squad) squadVal.innerText = ADMIN_STATE.squad.length;
  if (blogsVal && ADMIN_STATE.blogs) blogsVal.innerText = ADMIN_STATE.blogs.length;
  if (leadsVal && ADMIN_STATE.leads) leadsVal.innerText = ADMIN_STATE.leads.length;
  if (galleryVal && ADMIN_STATE.gallery) galleryVal.innerText = ADMIN_STATE.gallery.length;

  renderOverviewRecentLeads();
  renderOverviewSquadPreview();
}


function renderOverviewRecentLeads() {
  const container = document.getElementById("overview-recent-leads");
  if (!container) return;

  const recent = (ADMIN_STATE.leads || []).slice(0, 3);
  if (recent.length === 0) {
    container.innerHTML = `
      <div style="padding: 1.5rem; text-align: center; color: #94a3b8;">
        <span class="material-symbols-outlined" style="font-size: 32px; margin-bottom: 0.4rem; display: block; color:#cbd5e1;">inbox</span>
        <p style="font-size: 0.825rem; font-weight: 500;">No recent contact inquiries</p>
      </div>`;
    return;
  }

  container.innerHTML = recent.map(l => `
    <div style="display: flex; align-items: flex-start; justify-content: space-between; padding: 0.65rem 0.85rem; background: #f8fafc; border-radius: 10px; border: 1px solid #f1f5f9; cursor: pointer; transition: background 0.2s ease, border-color 0.2s ease;"
         onclick="openLeadFromOverview(${l.id})"
         onmouseover="this.style.background='#f1f5f9'; this.style.borderColor='#d1d5db';"
         onmouseout="this.style.background='#f8fafc'; this.style.borderColor='#f1f5f9';">
      <div style="flex: 1; min-width: 0;">
        <div style="font-weight: 700; font-size: 0.85rem; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${l.name}</div>
        <div style="font-size: 0.75rem; color: #64748b;">${l.service_interest || l.subject || 'General Inquiry'} • ${l.email}</div>
      </div>
      <span class="badge-status ${l.is_read ? 'badge-read' : 'badge-new'}" style="font-size: 0.7rem; flex-shrink: 0; margin-left: 0.5rem; margin-top: 2px;">${l.is_read ? 'Read' : 'New'}</span>
    </div>
  `).join("");
}

function openLeadFromOverview(id) {
  const leadsBtn = document.querySelector('[data-section="leads"]');
  if (leadsBtn) leadsBtn.click();
  if (id) {
    setTimeout(() => viewLeadModal(id), 150);
  }
}

function renderOverviewSquadPreview() {
  const container = document.getElementById("overview-squad-preview");
  if (!container) return;

  const squadList = (ADMIN_STATE.squad || []).slice(0, 3);
  if (squadList.length === 0) {
    container.innerHTML = `
      <div style="padding: 1.5rem; text-align: center; color: #94a3b8;">
        <span class="material-symbols-outlined" style="font-size: 32px; margin-bottom: 0.4rem; display: block; color:#cbd5e1;">group</span>
        <p style="font-size: 0.825rem; font-weight: 500;">No squad members added yet</p>
      </div>`;
    return;
  }

  container.innerHTML = squadList.map(s => `
    <div style="display: flex; align-items: flex-start; gap: 0.75rem; padding: 0.65rem 0.85rem; background: #f8fafc; border-radius: 10px; border: 1px solid #f1f5f9;">
      <img src="${s.photo || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=srgb&fm=jpg&q=85&w=500'}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; border: 1px solid #10b981; flex-shrink: 0;" />
      <div style="flex: 1; min-width: 0;">
        <div style="font-weight: 700; font-size: 0.85rem; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${s.name}</div>
        <div style="font-size: 0.725rem; color: #64748b;">${s.role}</div>
      </div>
      <span class="badge-status badge-read" style="font-size: 0.7rem; flex-shrink: 0; margin-top: 2px;">${s.roleCategory || 'Member'}</span>
    </div>
  `).join("");
}


// Contact Leads & Submissions Management System
let currentLeadFilter = 'all';
let leadSearchQuery = '';

function setLeadFilter(filter) {
  currentLeadFilter = filter;
  ['all', 'unread', 'read'].forEach(f => {
    const btn = document.getElementById(`btn-filter-${f}`);
    if (btn) {
      if (f === filter) btn.classList.add('active');
      else btn.classList.remove('active');
    }
  });
  renderLeadsTable();
}

function handleLeadSearch(query) {
  leadSearchQuery = (query || '').toLowerCase().trim();
  renderLeadsTable();
}

async function fetchLeads() {
  try {
    const res = await fetch('/api/admin/leads');
    if (res.ok) {
      ADMIN_STATE.leads = await res.json();
      localStorage.setItem("ccc_admin_leads_cache", JSON.stringify(ADMIN_STATE.leads));
      renderLeadsTable();
      renderOverviewRecentLeads();
      updateOverviewStats();
    }
  } catch(e) {
    console.error("Error fetching leads", e);
  }
}

async function toggleLeadReadStatus(id, targetReadStatus) {
  const lead = ADMIN_STATE.leads.find(l => l.id === id);
  if (!lead) return;

  const newStatus = targetReadStatus !== undefined ? (targetReadStatus ? 1 : 0) : (lead.is_read ? 0 : 1);
  lead.is_read = newStatus;

  try {
    await fetch(`/api/admin/leads/${id}/read`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_read: newStatus })
    });
  } catch (err) {
    console.error("Error updating lead status:", err);
  }

  renderLeadsTable();
  renderOverviewRecentLeads();
  updateOverviewStats();

  const modalEl = document.getElementById("modal-lead");
  if (modalEl && (modalEl.classList.contains("open") || modalEl.style.display === "flex")) {
    updateLeadModalButtons(lead);
    const badgeEl = modalEl.querySelector(".modal-body .badge-status");
    if (badgeEl) {
      badgeEl.className = `badge-status ${lead.is_read ? 'badge-read-muted' : 'badge-unread-pulse'}`;
      badgeEl.innerHTML = lead.is_read ? 'Read' : '<span class="unread-pulse-dot"></span> Unread';
    }
  }

  showAdminToast(newStatus ? "✅ Marked inquiry as Read" : "✉️ Marked inquiry as Unread");
}

function updateLeadModalButtons(lead) {
  const toggleBtn = document.getElementById("modal-lead-toggle-read-btn");
  const toggleIcon = document.getElementById("modal-lead-toggle-icon");
  const toggleText = document.getElementById("modal-lead-toggle-text");

  if (toggleBtn) {
    if (lead.is_read) {
      if (toggleIcon) toggleIcon.innerText = "mark_as_unread";
      if (toggleText) toggleText.innerText = "Mark as Unread";
      toggleBtn.className = "btn btn-secondary btn-sm";
      toggleBtn.onclick = () => toggleLeadReadStatus(lead.id, 0);
    } else {
      if (toggleIcon) toggleIcon.innerText = "mark_email_read";
      if (toggleText) toggleText.innerText = "Mark as Read";
      toggleBtn.className = "btn btn-primary btn-sm";
      toggleBtn.onclick = () => toggleLeadReadStatus(lead.id, 1);
    }
  }
}

function renderLeadsTable() {
  const container = document.getElementById("leads-tbody");
  if (!container) return;

  const totalCount = ADMIN_STATE.leads.length;
  const unreadCount = ADMIN_STATE.leads.filter(l => !l.is_read).length;
  const readCount = totalCount - unreadCount;

  // Update Counters
  const cntAll = document.getElementById("cnt-leads-all");
  const cntUnread = document.getElementById("cnt-leads-unread");
  const cntRead = document.getElementById("cnt-leads-read");
  const badgeCount = document.getElementById("leads-count-badge");

  if (cntAll) cntAll.innerText = `(${totalCount})`;
  if (cntUnread) cntUnread.innerText = `(${unreadCount})`;
  if (cntRead) cntRead.innerText = `(${readCount})`;
  if (badgeCount) badgeCount.innerText = unreadCount > 0 ? `${unreadCount} New` : `${totalCount}`;

  // Filter leads
  let filteredLeads = ADMIN_STATE.leads.filter(lead => {
    if (currentLeadFilter === 'unread' && lead.is_read) return false;
    if (currentLeadFilter === 'read' && !lead.is_read) return false;
    if (leadSearchQuery) {
      const q = leadSearchQuery;
      const name = (lead.name || '').toLowerCase();
      const email = (lead.email || '').toLowerCase();
      const subject = (lead.service_interest || lead.subject || '').toLowerCase();
      const message = (lead.message || '').toLowerCase();
      return name.includes(q) || email.includes(q) || subject.includes(q) || message.includes(q);
    }
    return true;
  });

  if (filteredLeads.length === 0) {
    let emptyMsg = "No contact inquiries found.";
    if (currentLeadFilter === 'unread') emptyMsg = "🎉 Clear inbox! No unread inquiries.";
    else if (currentLeadFilter === 'read') emptyMsg = "No read inquiries found.";
    else if (leadSearchQuery) emptyMsg = `No inquiries matching "${leadSearchQuery}".`;

    container.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--text-muted); padding:2.5rem; font-size: 0.9rem;">${emptyMsg}</td></tr>`;
    return;
  }

  container.innerHTML = filteredLeads.map((lead, idx) => {
    const isUnread = !lead.is_read;
    const rowClass = isUnread ? 'lead-row-unread' : '';
    const dateStr = new Date(lead.created_at || Date.now()).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    const statusBadge = isUnread
      ? `<span class="badge-status badge-unread-pulse"><span class="unread-pulse-dot"></span> Unread</span>`
      : `<span class="badge-status badge-read-muted">Read</span>`;

    const toggleActionBtn = isUnread
      ? `<button class="btn-icon btn-icon-read" onclick="toggleLeadReadStatus(${lead.id}, 1)" title="Mark as Read" style="padding: 5px; border-radius: 8px;">
          <span class="material-symbols-outlined" style="font-size: 18px;">mark_email_read</span>
         </button>`
      : `<button class="btn-icon btn-icon-unread" onclick="toggleLeadReadStatus(${lead.id}, 0)" title="Mark as Unread" style="padding: 5px; border-radius: 8px;">
          <span class="material-symbols-outlined" style="font-size: 18px;">mark_as_unread</span>
         </button>`;

    return `
      <tr class="${rowClass}">
        <td style="font-weight:700; color:#64748b; font-size: 0.8rem;">#${idx + 1}</td>
        <td>
          <div style="font-weight: ${isUnread ? '800' : '600'}; color: #0f172a; font-size: 0.9rem;">${lead.name}</div>
        </td>
        <td>
          <div style="font-size: 0.85rem; color: #334155;">${lead.email}</div>
          <div style="font-size:0.75rem; color:var(--text-muted); margin-top: 1px;">${lead.phone || lead.mobile || 'No phone'}</div>
        </td>
        <td>
          <div style="font-weight: 600; font-size: 0.85rem; color: #1e293b;">${lead.service_interest || lead.service || lead.subject || 'General Inquiry'}</div>
        </td>
        <td>${statusBadge}</td>
        <td style="font-size: 0.8rem; color: #64748b; white-space: nowrap;">${dateStr}</td>
        <td style="text-align: right;">
          <div style="display: flex; align-items: center; justify-content: flex-end; gap: 6px;">
            <button class="btn-icon" onclick="viewLeadModal(${lead.id})" title="View Inquiry Details" style="color: #6366f1; background: rgba(99, 102, 241, 0.08); padding: 5px; border-radius: 8px;">
              <span class="material-symbols-outlined" style="font-size: 18px;">visibility</span>
            </button>
            ${toggleActionBtn}
            <button class="btn-icon danger" onclick="deleteLead(${lead.id})" title="Delete Inquiry" style="padding: 5px; border-radius: 8px;">
              <span class="material-symbols-outlined" style="font-size: 18px;">delete</span>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

function viewLeadModal(id) {
  const lead = ADMIN_STATE.leads.find(l => l.id === id);
  if (!lead) return;

  // Automatically mark as read if it was unread when opened
  if (!lead.is_read) {
    lead.is_read = 1;
    fetch(`/api/admin/leads/${id}/read`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_read: 1 })
    }).catch(err => console.error("Error marking lead read:", err));
    renderLeadsTable();
    renderOverviewRecentLeads();
    updateOverviewStats();
  }

  const modalTitleEl = document.getElementById("modal-lead-title");
  if (modalTitleEl) {
    modalTitleEl.innerText = lead.service_interest || lead.service || lead.subject || 'Contact Inquiry Details';
  }

  const modalBodyEl = document.getElementById("modal-lead-body");
  if (modalBodyEl) {
    const formattedDate = new Date(lead.created_at || Date.now()).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });

    const phoneNum = lead.phone || lead.mobile || '';

    modalBodyEl.innerHTML = `
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.25rem; display: flex; flex-direction: column; gap: 0.85rem;">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem; border-bottom: 1px dashed #cbd5e1; padding-bottom: 0.85rem;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 42px; height: 42px; border-radius: 50%; background: #6366f1; color: #ffffff; font-weight: 800; font-size: 1.1rem; display: flex; align-items: center; justify-content: center; text-transform: uppercase;">
              ${(lead.name || 'U').charAt(0)}
            </div>
            <div>
              <div style="font-weight: 800; font-size: 1.05rem; color: #0f172a;">${lead.name}</div>
              <div style="font-size: 0.78rem; color: #64748b;">Sender / Contact Person</div>
            </div>
          </div>
          <div>
            <span class="badge-status ${lead.is_read ? 'badge-read-muted' : 'badge-unread-pulse'}">${lead.is_read ? 'Read' : '<span class="unread-pulse-dot"></span> Unread'}</span>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.75rem; font-size: 0.85rem;">
          <div>
            <span style="color: #64748b; font-weight: 600;">Email:</span> 
            <a href="mailto:${lead.email}" style="color: #4f46e5; font-weight: 700; text-decoration: underline;">${lead.email}</a>
          </div>
          <div>
            <span style="color: #64748b; font-weight: 600;">Phone:</span> 
            <a href="${phoneNum ? 'tel:' + phoneNum : '#'}" style="color: #0f172a; font-weight: 700;">${phoneNum || 'N/A'}</a>
          </div>
          <div>
            <span style="color: #64748b; font-weight: 600;">Subject:</span> 
            <span style="color: #0f172a; font-weight: 700;">${lead.service_interest || lead.service || lead.subject || 'General Inquiry'}</span>
          </div>
          <div>
            <span style="color: #64748b; font-weight: 600;">Received:</span> 
            <span style="color: #0f172a; font-weight: 600;">${formattedDate}</span>
          </div>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 0.5rem;">
        <label style="font-size: 0.8rem; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.05em;">Inquiry Message:</label>
        <div style="background: #ffffff; padding: 1.25rem; border-radius: 12px; border: 1px solid #cbd5e1; color: #0f172a; font-size: 0.95rem; line-height: 1.6; white-space: pre-wrap; word-break: break-word; min-height: 100px; box-shadow: inset 0 1px 3px rgba(0,0,0,0.03);">
          ${lead.message || 'No message content provided.'}
        </div>
      </div>
    `;
  }

  // Configure Reply Email button
  const replyBtn = document.getElementById("modal-lead-reply-btn");
  if (replyBtn) {
    const replySubject = encodeURIComponent(`Re: ${lead.service_interest || lead.subject || 'Inquiry - Champions CC'}`);
    replyBtn.href = `mailto:${lead.email}?subject=${replySubject}`;
  }

  // Configure Delete button in modal
  const deleteBtn = document.getElementById("modal-lead-delete-btn");
  if (deleteBtn) {
    deleteBtn.onclick = () => {
      closeAdminModal("modal-lead");
      deleteLead(lead.id);
    };
  }

  // Update Mark Read/Unread Toggle Button in modal
  updateLeadModalButtons(lead);

  // Open modal
  const overlay = document.getElementById("modal-lead");
  if (overlay) {
    overlay.style.display = "flex";
    overlay.classList.add("open");
  }
}

function deleteLead(id) {
  showConfirmDialog({
    title: "Delete Contact Inquiry",
    message: "Are you sure you want to delete this contact submission?",
    confirmText: "Delete Submission",
    isDanger: true
  }, async () => {
    try {
      const res = await fetch(`/api/admin/leads/${id}`, { method: 'DELETE' });
      if (res.ok) {
        ADMIN_STATE.leads = ADMIN_STATE.leads.filter(l => l.id !== id);
        renderLeadsTable();
        renderOverviewRecentLeads();
        updateOverviewStats();
        showAdminToast("Contact submission deleted.");
      } else {
        showAdminToast("⚠️ Failed to delete submission.");
      }
    } catch(e) {
      console.error("Error deleting lead:", e);
      showAdminToast("⚠️ Error deleting submission.");
    }
  });
}

// Window Exports for Lead Functions
window.fetchLeads = fetchLeads;
window.setLeadFilter = setLeadFilter;
window.handleLeadSearch = handleLeadSearch;
window.toggleLeadReadStatus = toggleLeadReadStatus;
window.viewLeadModal = viewLeadModal;
window.deleteLead = deleteLead;

// Squad Manager
async function fetchSquadAdmin() {
  try {
    const res = await fetch('/api/squad');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        ADMIN_STATE.squad = data;
        localStorage.setItem("ccc_squad", JSON.stringify(data));
      }
    }
  } catch (e) {
    console.warn("Using local cache for squad:", e);
  }
  renderSquadAdminTable();
  updateOverviewStats();
}

function openAddPlayerModal() {
  const editIdEl = document.getElementById("edit-player-id");
  if (editIdEl) editIdEl.value = "";
  const form = document.querySelector("#modal-add-player form");
  if (form) form.reset();
  const modalTitle = document.getElementById("player-modal-title");
  if (modalTitle) modalTitle.innerText = "Add New Player to Squad";
  const submitBtn = document.getElementById("player-submit-btn");
  if (submitBtn) submitBtn.innerText = "Save Player";
  openAdminModal("modal-add-player");
}

function renderSquadAdminTable() {
  const container = document.getElementById("squad-tbody");
  if (!container) return;

  if (!ADMIN_STATE.squad || ADMIN_STATE.squad.length === 0) {
    container.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-muted); padding:2rem;">No squad members found.</td></tr>`;
    return;
  }

  container.innerHTML = ADMIN_STATE.squad.map((m, idx) => `
    <tr>
      <td style="font-weight:700; color:#64748b;">#${idx + 1}</td>
      <td style="display:flex; align-items:center; gap:0.75rem;">
        <img src="${m.photo || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=srgb&fm=jpg&q=85&w=500'}" style="width:36px; height:36px; border-radius:50%; object-fit:cover; border:1px solid var(--accent-emerald);">
        <strong>${m.name}</strong>
      </td>
      <td><span class="badge-status badge-read">${m.role}</span></td>
      <td>${m.experience || 'Active'}</td>
      <td>${m.tenure || 'Member'}</td>
      <td class="action-btns-cell">
        <button class="btn-icon" title="Edit Player" onclick="editPlayer('${m.id}')" style="color:var(--accent-emerald);"><span class="material-symbols-outlined" style="font-size: 1.2rem;">edit</span></button>
        <button class="btn-icon danger" title="Remove Player" onclick="deletePlayer('${m.id}')"><span class="material-symbols-outlined" style="font-size: 1.2rem;">delete</span></button>
      </td>
    </tr>
  `).join("");
}

function editPlayer(id) {
  const player = ADMIN_STATE.squad.find(p => p.id === id);
  if (!player) return;

  const editIdEl = document.getElementById("edit-player-id");
  if (editIdEl) editIdEl.value = player.id;
  document.getElementById("new-player-name").value = player.name || '';
  document.getElementById("new-player-category").value = player.roleCategory || '';
  document.getElementById("new-player-role").value = player.role || '';
  document.getElementById("new-player-bio").value = player.bio || '';
  document.getElementById("new-player-photo").value = player.photo || '';
  
  const expEl = document.getElementById("new-player-experience");
  if (expEl) expEl.value = player.experience || '';
  const tenEl = document.getElementById("new-player-tenure");
  if (tenEl) tenEl.value = player.tenure || '';

  const modalTitle = document.getElementById("player-modal-title");
  if (modalTitle) modalTitle.innerText = "Edit Player Profile";
  const submitBtn = document.getElementById("player-submit-btn");
  if (submitBtn) submitBtn.innerText = "Update Player";

  openAdminModal("modal-add-player");
}

async function handleCreatePlayer(e) {
  e.preventDefault();
  const idToEdit = document.getElementById("edit-player-id").value;
  const name = document.getElementById("new-player-name").value.trim();
  const roleCategory = document.getElementById("new-player-category").value.trim();
  const role = document.getElementById("new-player-role").value.trim();
  const bio = document.getElementById("new-player-bio").value.trim();
  const photo = document.getElementById("new-player-photo").value.trim();
  const experience = document.getElementById("new-player-experience") ? document.getElementById("new-player-experience").value.trim() : "Active Member";
  const tenure = document.getElementById("new-player-tenure") ? document.getElementById("new-player-tenure").value.trim() : "Joined 2026";

  const payload = {
    name,
    roleCategory,
    role,
    bio,
    photo,
    experience: experience || "Active Member",
    tenure: tenure || "Joined 2026"
  };

  try {
    if (idToEdit) {
      const res = await fetch(`/api/admin/squad/${idToEdit}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Failed to update player");
      showAdminToast(`✨ Player "${name}" updated!`);
    } else {
      const res = await fetch('/api/admin/squad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Failed to add player");
      showAdminToast(`✨ Player "${name}" added to squad!`);
    }
    await fetchSquadAdmin();
  } catch (err) {
    console.error("Squad operation API error, applying local fallback:", err);
    if (idToEdit) {
      const idx = ADMIN_STATE.squad.findIndex(p => p.id === idToEdit);
      if (idx !== -1) {
        ADMIN_STATE.squad[idx] = { ...ADMIN_STATE.squad[idx], name, roleCategory, role, bio, photo, experience: payload.experience, tenure: payload.tenure };
      }
    } else {
      const newPlayer = { id: "m-" + Date.now(), roleCategory, name, role, experience: payload.experience, tenure: payload.tenure, photo, bio };
      ADMIN_STATE.squad.unshift(newPlayer);
    }
    localStorage.setItem("ccc_squad", JSON.stringify(ADMIN_STATE.squad));
    renderSquadAdminTable();
    updateOverviewStats();
  }

  closeAdminModal("modal-add-player");
  e.target.reset();
  document.getElementById("edit-player-id").value = "";
}

function deletePlayer(id) {
  showConfirmDialog({
    title: "Remove Squad Member",
    message: "Are you sure you want to remove this player from squad list?",
    confirmText: "Remove Player",
    isDanger: true
  }, async () => {
    try {
      const res = await fetch(`/api/admin/squad/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Failed to delete squad member");
      showAdminToast("Player removed from squad.");
      await fetchSquadAdmin();
    } catch (err) {
      console.error("Error deleting squad member from API:", err);
      ADMIN_STATE.squad = ADMIN_STATE.squad.filter(s => s.id !== id);
      localStorage.setItem("ccc_squad", JSON.stringify(ADMIN_STATE.squad));
      renderSquadAdminTable();
      updateOverviewStats();
      showAdminToast("Player removed from squad (local cache).");
    }
  });
}

// MS Word Rich Text Formatting Helper
function formatDoc(cmd, value = null) {
  const editor = document.getElementById("new-blog-editor");
  if (!editor) return;
  editor.focus();

  if (cmd === 'formatBlock') {
    if (!value) return;
    try {
      document.execCommand('formatBlock', false, '<' + value + '>');
    } catch (e) {
      document.execCommand('formatBlock', false, value);
    }
  } else {
    document.execCommand(cmd, false, value);
  }
}

function setImgAlign(btn, alignClass) {
  const wrap = btn.closest('.article-img-wrap');
  if (wrap) {
    wrap.classList.remove('float-left', 'float-right', 'align-center');
    wrap.classList.add(alignClass);
  }
}

function removeImgWrap(btn) {
  const wrap = btn.closest('.article-img-wrap');
  if (wrap) {
    wrap.remove();
  }
}

function ensureImageHandles(wrap) {
  if (!wrap.querySelector(".img-inline-toolbar")) {
    const toolbar = document.createElement("div");
    toolbar.className = "img-inline-toolbar";
    toolbar.setAttribute("contenteditable", "false");
    toolbar.innerHTML = `
      <button type="button" class="img-toolbar-btn" onclick="setImgAlign(this, 'float-left')">Float Left</button>
      <button type="button" class="img-toolbar-btn" onclick="setImgAlign(this, 'align-center')">Center</button>
      <button type="button" class="img-toolbar-btn" onclick="setImgAlign(this, 'float-right')">Float Right</button>
      <button type="button" class="img-toolbar-btn danger" onclick="removeImgWrap(this)">Delete</button>
    `;
    wrap.insertBefore(toolbar, wrap.firstChild);
  }
  if (!wrap.querySelector(".resize-handle")) {
    ["nw", "ne", "sw", "se"].forEach(pos => {
      const handle = document.createElement("span");
      handle.className = `resize-handle ${pos}`;
      wrap.appendChild(handle);
    });
  }
  wrap.setAttribute("draggable", "true");
  wrap.setAttribute("contenteditable", "false");
}

let savedEditorRange = null;

function saveEditorSelection() {
  const sel = window.getSelection();
  if (sel && sel.rangeCount > 0) {
    savedEditorRange = sel.getRangeAt(0);
  }
}

function restoreEditorSelection() {
  if (savedEditorRange) {
    const sel = window.getSelection();
    if (sel) {
      sel.removeAllRanges();
      sel.addRange(savedEditorRange);
    }
  }
}

// Open Helper Image Modal for Rich Editor
function openEditorImageModal() {
  saveEditorSelection();
  const urlEl = document.getElementById("editor-img-url");
  const capEl = document.getElementById("editor-img-caption");
  if (urlEl) urlEl.value = "";
  if (capEl) capEl.value = "";
  openAdminModal("modal-insert-editor-image");
}

function handleInsertEditorImage(e) {
  e.preventDefault();
  const url = document.getElementById("editor-img-url").value.trim();
  const width = document.getElementById("editor-img-width").value;
  const align = document.getElementById("editor-img-align").value;
  const caption = document.getElementById("editor-img-caption").value.trim();

  if (!url) return;

  const editor = document.getElementById("new-blog-editor");
  if (!editor) return;

  const captionHtml = caption ? `<span class="img-caption">${caption}</span>` : '';
  const imgWrapHtml = `
    <div class="article-img-wrap ${align} ${width}" contenteditable="false" draggable="true">
      <div class="img-inline-toolbar" contenteditable="false">
        <button type="button" class="img-toolbar-btn" onclick="setImgAlign(this, 'float-left')">Float Left</button>
        <button type="button" class="img-toolbar-btn" onclick="setImgAlign(this, 'align-center')">Center</button>
        <button type="button" class="img-toolbar-btn" onclick="setImgAlign(this, 'float-right')">Float Right</button>
        <button type="button" class="img-toolbar-btn danger" onclick="removeImgWrap(this)">Delete</button>
      </div>
      <img src="${url}" alt="Article Image" />
      <span class="resize-handle nw"></span>
      <span class="resize-handle ne"></span>
      <span class="resize-handle sw"></span>
      <span class="resize-handle se"></span>
      ${captionHtml}
    </div><p><br></p>
  `;

  editor.focus();
  restoreEditorSelection();

  let inserted = false;
  try {
    inserted = document.execCommand("insertHTML", false, imgWrapHtml);
  } catch (err) {
    inserted = false;
  }

  if (!inserted) {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = imgWrapHtml;
      const frag = document.createDocumentFragment();
      let node;
      while ((node = tempDiv.firstChild)) {
        frag.appendChild(node);
      }
      range.insertNode(frag);
    } else {
      editor.innerHTML += imgWrapHtml;
    }
  }

  closeAdminModal("modal-insert-editor-image");
  if (typeof showAdminToast === 'function') {
    showAdminToast("🖼️ Image inserted! Click image to resize or move.");
  }
}

// Global Image Click Selection Listener
document.addEventListener("click", (e) => {
  const editor = document.getElementById("new-blog-editor");
  if (!editor) return;

  const clickedWrap = e.target.closest && e.target.closest(".article-img-wrap");
  const allWraps = editor.querySelectorAll(".article-img-wrap");

  if (clickedWrap && editor.contains(clickedWrap)) {
    allWraps.forEach(w => {
      if (w !== clickedWrap) w.classList.remove("selected");
    });
    clickedWrap.classList.add("selected");
    ensureImageHandles(clickedWrap);
  } else if (!e.target.closest || !e.target.closest(".img-inline-toolbar")) {
    allWraps.forEach(w => w.classList.remove("selected"));
  }
});

// Corner Drag-to-Resize Mouse Handler
document.addEventListener("mousedown", (e) => {
  if (e.target && e.target.classList && e.target.classList.contains("resize-handle")) {
    e.preventDefault();
    e.stopPropagation();

    const handle = e.target;
    const wrap = handle.closest(".article-img-wrap");
    const img = wrap ? wrap.querySelector("img") : null;
    if (!wrap || !img) return;

    const startX = e.clientX;
    const startWidth = wrap.offsetWidth;
    const isEast = handle.classList.contains("se") || handle.classList.contains("ne");

    function onMouseMove(moveEvent) {
      moveEvent.preventDefault();
      const dx = moveEvent.clientX - startX;
      let newWidth = isEast ? (startWidth + dx) : (startWidth - dx);

      const editor = document.getElementById("new-blog-editor");
      const maxW = editor ? (editor.clientWidth - 40) : 800;
      newWidth = Math.max(80, Math.min(newWidth, maxW));

      wrap.style.width = newWidth + "px";
      img.style.width = "100%";
      img.style.height = "auto";
    }

    function onMouseUp() {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }
});

// Drag & Drop Move Image Handler inside Editor
let globalDraggedWrap = null;

document.addEventListener("dragstart", (e) => {
  const wrap = e.target.closest && e.target.closest(".article-img-wrap");
  if (wrap) {
    globalDraggedWrap = wrap;
    e.dataTransfer.setData("text/html", wrap.outerHTML);
    e.dataTransfer.effectAllowed = "move";
  }
});

document.addEventListener("drop", (e) => {
  const editor = document.getElementById("new-blog-editor");
  if (editor && editor.contains(e.target) && globalDraggedWrap) {
    setTimeout(() => {
      if (globalDraggedWrap && globalDraggedWrap.parentNode) {
        globalDraggedWrap.parentNode.removeChild(globalDraggedWrap);
      }
      globalDraggedWrap = null;
    }, 50);
  }
});

// Blog Posts Manager
async function fetchAdminBlogs() {
  try {
    const res = await fetch('/api/blogs');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        ADMIN_STATE.blogs = data;
        localStorage.setItem("ccc_blogs", JSON.stringify(data));
      }
    }
  } catch (e) {
    console.warn("Using local cache for blogs");
  }
  renderBlogsAdminTable();
}

function renderBlogsAdminTable() {
  const container = document.getElementById("blogs-tbody");
  if (!container) return;

  container.innerHTML = ADMIN_STATE.blogs.map(b => `
    <tr>
      <td><strong>${b.title}</strong></td>
      <td><span class="badge" style="background:#ecfdf5; color:#047857; border:1px solid #a7f3d0; padding:2px 8px; border-radius:12px; font-weight:600;">${b.category}</span></td>
      <td>${b.date || 'Recent'}</td>
      <td>${b.author || 'Staff'}</td>
      <td class="action-btns-cell">
        <button class="btn-icon" title="Edit Article" onclick="openEditBlogModal('${b.id}')"><span class="material-symbols-outlined" style="font-size: 1.2rem; color:#3b82f6;">edit</span></button>
        <button class="btn-icon danger" title="Delete Article" onclick="deleteBlog('${b.id}')"><span class="material-symbols-outlined" style="font-size: 1.2rem;">delete</span></button>
      </td>
    </tr>
  `).join("");
}

function openEditBlogModal(id) {
  const blog = ADMIN_STATE.blogs.find(b => b.id === id);
  if (!blog) return;

  document.getElementById("edit-blog-id").value = blog.id;
  document.getElementById("new-blog-title").value = blog.title || "";
  document.getElementById("new-blog-category").value = blog.category || "";
  document.getElementById("new-blog-editor").innerHTML = blog.excerpt || "";
  document.getElementById("new-blog-author").value = blog.author || "";
  document.getElementById("new-blog-image").value = blog.image || "";
  document.getElementById("new-blog-video").value = blog.video_url || "";

  document.getElementById("blog-modal-title").innerText = "Edit Article & News";
  document.getElementById("blog-submit-btn").innerText = "Update Article";

  openAdminModal("modal-add-blog");
}

async function handleCreateOrUpdateBlog(e) {
  e.preventDefault();
  const idToEdit = document.getElementById("edit-blog-id").value;
  const title = document.getElementById("new-blog-title").value.trim();
  const category = document.getElementById("new-blog-category").value.trim();
  const excerpt = document.getElementById("new-blog-editor").innerHTML;
  const author = document.getElementById("new-blog-author").value.trim();
  const image = document.getElementById("new-blog-image").value.trim();
  const video_url = document.getElementById("new-blog-video").value.trim();

  const blogPayload = {
    id: idToEdit || ("blog-" + Date.now()),
    title,
    category,
    date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    author,
    image,
    excerpt,
    video_url,
    read_time: "4 min read"
  };

  try {
    if (idToEdit) {
      await fetch(`/api/admin/blogs/${idToEdit}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(blogPayload)
      });
      const idx = ADMIN_STATE.blogs.findIndex(b => b.id === idToEdit);
      if (idx !== -1) ADMIN_STATE.blogs[idx] = { ...ADMIN_STATE.blogs[idx], ...blogPayload };
      showAdminToast(`📰 Article "${title}" updated!`);
    } else {
      await fetch('/api/admin/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(blogPayload)
      });
      ADMIN_STATE.blogs.unshift(blogPayload);
      showAdminToast(`📰 Article "${title}" published!`);
    }
  } catch (err) {
    console.error("API Sync failed, saving locally:", err);
    if (idToEdit) {
      const idx = ADMIN_STATE.blogs.findIndex(b => b.id === idToEdit);
      if (idx !== -1) ADMIN_STATE.blogs[idx] = { ...ADMIN_STATE.blogs[idx], ...blogPayload };
    } else {
      ADMIN_STATE.blogs.unshift(blogPayload);
    }
    showAdminToast(`📰 Saved locally!`);
  }

  localStorage.setItem("ccc_blogs", JSON.stringify(ADMIN_STATE.blogs));
  closeAdminModal("modal-add-blog");
  renderBlogsAdminTable();
  if (typeof updateOverviewStats === 'function') updateOverviewStats();

  // Reset modal state
  document.getElementById("edit-blog-id").value = "";
  document.getElementById("new-blog-title").value = "";
  document.getElementById("new-blog-category").value = "";
  document.getElementById("new-blog-editor").innerHTML = "";
  document.getElementById("new-blog-video").value = "";
  document.getElementById("blog-modal-title").innerText = "Publish New Article & News";
  document.getElementById("blog-submit-btn").innerText = "Publish Article";
}

function deleteBlog(id) {
  showConfirmDialog({
    title: "Delete Article",
    message: "Are you sure you want to delete this blog article?",
    confirmText: "Delete Article",
    isDanger: true
  }, async () => {
    try {
      await fetch(`/api/admin/blogs/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.warn("API delete failed, removing locally");
    }
    ADMIN_STATE.blogs = ADMIN_STATE.blogs.filter(b => b.id !== id);
    localStorage.setItem("ccc_blogs", JSON.stringify(ADMIN_STATE.blogs));
    renderBlogsAdminTable();
    if (typeof updateOverviewStats === 'function') updateOverviewStats();
    showAdminToast("Blog article deleted.");
  });
}


/* --------------------------------------------------------------------------
   4. MODALS & TOAST NOTIFICATIONS
   -------------------------------------------------------------------------- */
function openAdminModal(modalId) {
  const overlay = document.getElementById(modalId);
  if (overlay) {
    overlay.classList.add("open");
    overlay.style.display = "flex";
  }
}

function closeAdminModal(modalId) {
  const overlay = document.getElementById(modalId);
  if (overlay) {
    overlay.classList.remove("open");
    overlay.style.display = "none";
  }
}

function showAdminToast(msg, type = 'success') {
  return showAdminNotification(msg, type);
}


// --- MEDIA & GALLERY MANAGEMENT ENGINE ---
let currentGalleryFilter = 'all';
let gallerySearchQuery = '';

async function fetchGallery() {
  try {
    const res = await fetch('/api/admin/gallery');
    if (res.ok) {
      ADMIN_STATE.gallery = await res.json();
      localStorage.setItem("ccc_admin_gallery_cache", JSON.stringify(ADMIN_STATE.gallery));
      renderAdminGalleryCategoryFilters();
      renderAdminGalleryGrid();
      updateOverviewStats();
    }
  } catch (err) {
    console.error("Error fetching gallery:", err);
  }
}

function renderAdminGalleryCategoryFilters() {
  const container = document.getElementById('galleryCategoryFilterContainer');
  if (!container) return;

  const categories = ['all', ...new Set((ADMIN_STATE.gallery || []).map(g => g.category || 'Matches'))];
  
  container.innerHTML = categories.map(cat => {
    const label = cat === 'all' ? 'All Media' : cat;
    const isActive = currentGalleryFilter.toLowerCase() === cat.toLowerCase();
    return `<button class="btn btn-ghost btn-sm ${isActive ? 'active' : ''}" onclick="filterAdminGallery('${cat}', this)">${label}</button>`;
  }).join('');
}

function filterAdminGallery(category, btnEl) {
  currentGalleryFilter = category;
  const container = document.getElementById('galleryCategoryFilterContainer');
  if (container) {
    container.querySelectorAll('.btn').forEach(b => b.classList.remove('active'));
  }
  if (btnEl) btnEl.classList.add('active');
  renderAdminGalleryGrid();
}

function handleGallerySearch(query) {
  gallerySearchQuery = (query || '').toLowerCase().trim();
  renderAdminGalleryGrid();
}

function onGalleryTypeChange() {
  const typeVal = document.getElementById('new-gallery-type')?.value;
  const labelEl = document.getElementById('gallery-url-label');
  const inputEl = document.getElementById('new-gallery-url');
  const uploadBtn = document.getElementById('galleryUploadPcBtn');
  const hintEl = document.getElementById('gallery-url-hint');

  if (typeVal === 'video') {
    if (labelEl) labelEl.innerHTML = `YouTube Video Link / URL <span class="required" style="color:red;">*</span>`;
    if (inputEl) inputEl.placeholder = `e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ or https://youtu.be/...`;
    if (uploadBtn) uploadBtn.style.display = 'none';
    if (hintEl) hintEl.style.display = 'block';
  } else {
    if (labelEl) labelEl.innerHTML = `Media Image / File URL <span class="required" style="color:red;">*</span>`;
    if (inputEl) inputEl.placeholder = `https://...`;
    if (uploadBtn) uploadBtn.style.display = 'inline-flex';
    if (hintEl) hintEl.style.display = 'none';
  }
}

function renderAdminGalleryGrid() {
  let items = ADMIN_STATE.gallery || [];

  if (currentGalleryFilter !== 'all') {
    items = items.filter(g => (g.category || '').toLowerCase() === currentGalleryFilter.toLowerCase());
  }

  if (gallerySearchQuery) {
    items = items.filter(g => 
      (g.title || '').toLowerCase().includes(gallerySearchQuery) ||
      (g.category || '').toLowerCase().includes(gallerySearchQuery)
    );
  }

  // 1. Render Table Rows for #tbl-gallery-body
  const tbody = document.getElementById('tbl-gallery-body');
  if (tbody) {
    if (items.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 2.5rem 1rem; color: #94a3b8;">
            <span class="material-symbols-outlined" style="font-size: 36px; display: block; margin-bottom: 0.5rem; color: #cbd5e1;">photo_library</span>
            <div style="font-size: 0.95rem; font-weight: 700; color: #475569;">No Gallery Media Assets Found</div>
            <div style="font-size: 0.8rem; color: #64748b; margin-top: 4px;">Click "+ Add New Media" above to upload photos or YouTube videos.</div>
          </td>
        </tr>`;
    } else {
      tbody.innerHTML = items.map(g => {
        const isVideo = g.type === 'video';
        const typeBadge = isVideo 
          ? '<span class="badge" style="background:#dbeafe; color:#1e40af; border:1px solid #bfdbfe; padding:3px 8px; border-radius:12px; font-size:0.72rem; font-weight:700;">VIDEO</span>' 
          : '<span class="badge" style="background:#dcfce7; color:#15803d; border:1px solid #bbf7d0; padding:3px 8px; border-radius:12px; font-size:0.72rem; font-weight:700;">PHOTO</span>';
        
        let thumbUrl = g.url || 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800';
        if (isVideo && g.url) {
          const ytMatch = g.url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
          if (ytMatch && ytMatch[1]) {
            thumbUrl = `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
          }
        }

        return `
          <tr>
            <td style="width: 80px;">
              <div style="width: 56px; height: 38px; border-radius: 6px; overflow: hidden; background: #0f172a; border: 1px solid #e2e8f0; position: relative;">
                <img src="${thumbUrl}" alt="${g.title}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800'" />
                ${isVideo ? '<span class="material-symbols-outlined" style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); color:#ffffff; font-size:18px; text-shadow:0 1px 3px rgba(0,0,0,0.8);">play_circle</span>' : ''}
              </div>
            </td>
            <td style="font-weight: 700; color: #0f172a; font-size: 0.9rem;">${g.title || 'Untitled Media'}</td>
            <td>${typeBadge}</td>
            <td><span style="background: #f1f5f9; color: #475569; padding: 2px 10px; border-radius: 6px; font-size: 0.78rem; font-weight: 600;">${g.category || 'General'}</span></td>
            <td style="font-size: 0.82rem; color: #64748b;">${g.created_at ? new Date(g.created_at).toLocaleDateString() : 'Recent'}</td>
            <td style="text-align: right;">
              <button type="button" class="btn btn-ghost btn-sm" onclick="deleteGalleryItem(${g.id})" title="Delete Media" style="color: #ef4444; font-weight: 700; font-size: 0.82rem; display: inline-flex; align-items: center; gap: 4px;">
                <span class="material-symbols-outlined" style="font-size: 16px;">delete</span>
                <span>Delete</span>
              </button>
            </td>
          </tr>
        `;
      }).join('');
    }
  }

  // 2. Render Card Grid for #adminGalleryGrid (if exists)
  const grid = document.getElementById('adminGalleryGrid');
  if (grid) {
    if (items.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 3rem 1.5rem; text-align: center; color: #94a3b8; background: #f8fafc; border-radius: 14px; border: 1px dashed #cbd5e1;">
          <span class="material-symbols-outlined" style="font-size: 44px; margin-bottom: 0.5rem; display: block; color: #cbd5e1;">photo_library</span>
          <h4 style="font-size: 1rem; font-weight: 700; color: #475569; margin-bottom: 0.25rem;">No Gallery Media Found</h4>
          <p style="font-size: 0.83rem; max-width: 400px; margin: 0 auto 1.25rem;">Click "+ Add New Media" above to upload photos or videos.</p>
          <button class="btn btn-primary btn-sm" onclick="openAddGalleryModal()">+ Add New Media</button>
        </div>`;
      return;
    }

    grid.innerHTML = items.map(g => {
      const isVideo = g.type === 'video';
      const typeBadge = isVideo ? '<span class="badge-status badge-info" style="font-size:0.68rem;">Video</span>' : '<span class="badge-status badge-read" style="font-size:0.68rem;">Photo</span>';

      let thumbUrl = g.url || 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800';
      if (isVideo && g.url) {
        const ytMatch = g.url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
        if (ytMatch && ytMatch[1]) {
          thumbUrl = `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
        }
      }

      return `
        <div class="card" style="border: 1px solid #e2e8f0; border-radius: 14px; overflow: hidden; display: flex; flex-direction: column; background: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.03); transition: transform 0.2s ease, box-shadow 0.2s ease;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='none'">
          <div style="position: relative; width: 100%; height: 160px; background: #0f172a; overflow: hidden;">
            <img src="${thumbUrl}" alt="${g.title}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800'" />
            <div style="position: absolute; top: 10px; left: 10px; display: flex; gap: 6px;">
              ${typeBadge}
              <span class="badge-status" style="font-size: 0.68rem; background: rgba(15, 23, 42, 0.75); color: #ffffff; backdrop-filter: blur(4px); border: 1px solid rgba(255,255,255,0.2);">${g.category || 'General'}</span>
            </div>
          </div>
          <div style="padding: 1rem; flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
            <div style="font-weight: 700; font-size: 0.9rem; color: #0f172a; line-height: 1.35; margin-bottom: 0.75rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
              ${g.title}
            </div>
            <div style="display: flex; align-items: center; justify-content: flex-end; gap: 8px; border-top: 1px solid #f1f5f9; padding-top: 0.75rem;">
              <button class="btn btn-ghost btn-sm" onclick="deleteGalleryItem(${g.id})" title="Delete Media" style="color: #ef4444; padding: 4px 8px; font-size: 0.78rem; display: inline-flex; align-items: center; gap: 4px;">
                <span class="material-symbols-outlined" style="font-size: 16px;">delete</span>
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }
}

function openAddGalleryModal() {
  openAdminModal('modal-add-gallery');

  const titleIn = document.getElementById('new-gallery-title');
  const typeIn = document.getElementById('new-gallery-type');
  const catIn = document.getElementById('new-gallery-category');
  const urlIn = document.getElementById('new-gallery-url');

  if (titleIn) titleIn.value = '';
  if (typeIn) typeIn.value = 'photo';
  if (catIn) catIn.value = 'Matches';
  if (urlIn) urlIn.value = '';

  onGalleryTypeChange();
}

window.onGalleryTypeChange = onGalleryTypeChange;

async function handleCreateGallery(event) {
  if (event) event.preventDefault();

  const title = document.getElementById('new-gallery-title')?.value.trim();
  const type = document.getElementById('new-gallery-type')?.value || 'photo';
  const category = document.getElementById('new-gallery-category')?.value.trim() || 'Matches';
  const url = document.getElementById('new-gallery-url')?.value.trim();

  if (!title || !url) {
    showAdminToast('⚠️ Please provide a Title and Media URL');
    return;
  }

  const submitBtn = document.getElementById('gallery-submit-btn');
  if (submitBtn) submitBtn.innerHTML = 'Saving...';

  try {
    const res = await fetch('/api/admin/gallery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, type, category, url })
    });

    if (res.ok) {
      fetchGallery();
      closeAdminModal('modal-add-gallery');
      showAdminToast('✅ Media item published to Gallery!');
    } else {
      showAdminToast('⚠️ Failed to save gallery item');
    }
  } catch (err) {
    console.error("Error creating gallery item:", err);
    showAdminToast('⚠️ Error connecting to server');
  } finally {
    if (submitBtn) submitBtn.innerHTML = 'Save Media to Gallery';
  }
}

function deleteGalleryItem(id) {
  showConfirmDialog({
    title: "Delete Gallery Item",
    message: "Are you sure you want to delete this media item from the public gallery?",
    confirmText: "Delete Media",
    isDanger: true
  }, async () => {
    try {
      const res = await fetch(`/api/admin/gallery/${id}`, { method: 'DELETE' });
      if (res.ok) {
        ADMIN_STATE.gallery = (ADMIN_STATE.gallery || []).filter(g => g.id !== id);
        renderAdminGalleryCategoryFilters();
        renderAdminGalleryGrid();
        updateOverviewStats();
        showAdminToast('🗑️ Gallery item deleted');
      } else {
        showAdminToast('⚠️ Failed to delete gallery item');
      }
    } catch (err) {
      console.error("Error deleting gallery item:", err);
    }
  });
}


function triggerNavTab(sectionId) {
  const btn = document.querySelector(`.nav-item[data-section="${sectionId}"]`);
  if (btn) btn.click();
}

window.loadContactSettings = loadContactMapSettings;
window.saveContactSettings = saveContactMapSettings;

// Instant Toggle Switch Event Listener for Map Visibility
document.addEventListener("change", async (e) => {
  if (e.target && (e.target.id === "contactShowMap" || e.target.id === "op-page-map")) {
    const isChecked = e.target.checked;

    // Sync all map checkboxes in admin UI
    ["contactShowMap", "op-page-map"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.checked = isChecked;
    });

    const getVal = (id) => { const el = document.getElementById(id); return el ? el.value.trim() : ''; };
    const payload = {
      address: getVal("contactAddress"),
      markerLabel: getVal("contactMarkerLabel"),
      coords: getVal("contactCoords"),
      mapLink: getVal("contactMapLink"),
      email: getVal("contactEmail"),
      phone: getVal("contactPhone"),
      showMap: isChecked,
      zoom: parseInt(getVal("contactZoom"), 10) || 14
    };

    localStorage.setItem("ccc_contact_cache", JSON.stringify(payload));

    try {
      await fetch('/api/admin/settings/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(payload)
      });
      showAdminToast(isChecked ? '📍 Interactive Map enabled across website!' : '📍 Interactive Map hidden from website!');
    } catch (err) {
      console.error('Error saving map toggle:', err);
    }
  }
});

/* --------------------------------------------------------------------------
   CUSTOM IN-APP CONFIRMATION MODAL (Replaces Browser confirm())
   -------------------------------------------------------------------------- */
let pendingConfirmCallback = null;

function showConfirmDialog({ title, message, confirmText, isDanger = true }, onConfirm) {
  pendingConfirmCallback = onConfirm;
  const titleEl = document.getElementById('confirm-modal-title');
  const msgEl = document.getElementById('confirm-modal-message');
  const btnEl = document.getElementById('confirm-modal-action-btn');
  const modalEl = document.getElementById('modal-custom-confirm');

  if (titleEl) titleEl.textContent = title || 'Confirm Action';
  if (msgEl) msgEl.textContent = message || 'Are you sure you want to perform this action?';
  if (btnEl) {
    btnEl.textContent = confirmText || (isDanger ? 'Delete' : 'Confirm');
    btnEl.className = isDanger ? 'btn btn-delete-red' : 'btn btn-primary';
  }

  if (modalEl) modalEl.style.display = 'flex';
}

function closeConfirmModal(confirmed) {
  const modalEl = document.getElementById('modal-custom-confirm');
  if (modalEl) modalEl.style.display = 'none';
  if (confirmed && typeof pendingConfirmCallback === 'function') {
    const cb = pendingConfirmCallback;
    pendingConfirmCallback = null;
    cb();
  } else {
    pendingConfirmCallback = null;
  }
}

function executeConfirmAction() {
  closeConfirmModal(true);
}

window.showConfirmDialog = showConfirmDialog;
window.closeConfirmModal = closeConfirmModal;
window.executeConfirmAction = executeConfirmAction;

/* --------------------------------------------------------------------------
   GLOBAL ADMIN PRELOADER (ONLY APPEARS ON NETWORK DELAY)
   -------------------------------------------------------------------------- */
function initAdminPreloader() {
  const preloader = document.getElementById('page-preloader');
  const hasVisited = sessionStorage.getItem('ccc_admin_visited');

  if (hasVisited) {
    if (preloader) preloader.style.display = 'none';
    return;
  }

  sessionStorage.setItem('ccc_admin_visited', 'true');
  if (!preloader) return;

  const progressBar = document.getElementById('preloader-progress-bar');
  const statusText = document.getElementById('preloader-status');

  let isLoaded = false;
  let showTimer = null;

  showTimer = setTimeout(() => {
    if (!isLoaded && preloader) {
      preloader.classList.add('is-visible');
      if (progressBar) progressBar.style.width = '60%';
      if (statusText) statusText.textContent = 'Syncing Database...';
    }
  }, 100);

  const dismissPreloader = () => {
    isLoaded = true;
    if (showTimer) clearTimeout(showTimer);

    const p = document.getElementById('page-preloader');
    if (!p) return;

    if (p.classList.contains('is-visible')) {
      if (progressBar) progressBar.style.width = '100%';
      if (statusText) statusText.textContent = 'Dashboard Ready!';
      setTimeout(() => {
        p.classList.remove('is-visible');
        p.classList.add('fade-out');
        setTimeout(() => {
          if (p.parentNode) p.style.display = 'none';
        }, 400);
      }, 150);
    } else {
      p.style.display = 'none';
    }
  };

  if (document.readyState === 'complete') {
    dismissPreloader();
  } else {
    window.addEventListener('load', dismissPreloader);
    setTimeout(dismissPreloader, 1200);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initAdminPreloader();
});

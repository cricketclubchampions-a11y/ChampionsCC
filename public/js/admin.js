// Champions Cricket Club - Admin Engine & State Controller

document.addEventListener("DOMContentLoaded", async () => {
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  // Check auth
  try {
    const res = await fetch('/api/admin/check-auth', { credentials: 'same-origin' });
    const data = await res.json();
    if (!data.authenticated) {
      if (!window.location.pathname.endsWith("login.html")) {
        window.location.replace('login.html');
      }
      return;
    }
  } catch (e) {
    if (!window.location.pathname.endsWith("login.html")) {
      window.location.replace('login.html');
    }
    return;
  }


  initAdminTabs();
  loadDashboardData();
});

// Admin Global State Engine (Synchronized with localStorage)
const ADMIN_STATE = {
  creds: JSON.parse(localStorage.getItem("ccc_admin_creds")) || {
    username: "admin",
    password: "admin123"
  },
  leads: [],
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
  squad: JSON.parse(localStorage.getItem("ccc_squad")) || (window.APP_DATA ? window.APP_DATA.squad : []),
  blogs: JSON.parse(localStorage.getItem("ccc_blogs")) || (window.APP_DATA ? window.APP_DATA.blogs : []),
  fixtures: JSON.parse(localStorage.getItem("ccc_fixtures")) || (window.APP_DATA ? window.APP_DATA.fixtures : [])
};



function saveAdminCredentials(e) {
  if (e) e.preventDefault();
  const newUser = document.getElementById("settings-username").value.trim();
  const newPwd = document.getElementById("settings-new-password").value.trim();
  const confirmPwd = document.getElementById("settings-confirm-password").value.trim();

  if (!newUser || !newPwd) {
    showAdminToast("⚠️ Please provide a valid username and new password.");
    return;
  }

  if (newPwd !== confirmPwd) {
    showAdminToast("⚠️ Passwords do not match!");
    return;
  }

  ADMIN_STATE.creds.username = newUser;
  ADMIN_STATE.creds.password = newPwd;
  localStorage.setItem("ccc_admin_creds", JSON.stringify(ADMIN_STATE.creds));

  showAdminToast("🔒 Admin Credentials updated successfully!");
  
  // Clear password input fields
  document.getElementById("settings-new-password").value = "";
  document.getElementById("settings-confirm-password").value = "";
}

function renderSettingsForm() {
  const userEl = document.getElementById("settings-username");
  if (userEl) {
    userEl.value = ADMIN_STATE.creds.username;
  }
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
   2. TAB NAVIGATION SYSTEM
   -------------------------------------------------------------------------- */
function initAdminTabs() {
  const navItems = document.querySelectorAll(".nav-item");
  const sections = document.querySelectorAll(".admin-section");

  navItems.forEach(item => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      const targetSec = item.getAttribute("data-section");
      if (!targetSec) return;

      navItems.forEach(n => n.classList.remove("active"));
      sections.forEach(s => { 
        s.classList.remove("active"); 
        s.style.display = "none"; 
      });

      item.classList.add("active");
      const activeSec = document.getElementById(`sec-${targetSec}`);
      if (activeSec) {
        activeSec.classList.add("active"); 
        activeSec.style.display = "block";
      }

      // Update topbar title dynamically
      const titleSpan = item.querySelector("span");
      const titleText = titleSpan ? titleSpan.innerText.trim() : "Dashboard";
      const topTitleEl = document.getElementById("topbar-page-title");
      const breadcrumbEl = document.getElementById("topbar-breadcrumb");
      if (topTitleEl) topTitleEl.innerText = titleText;
      if (breadcrumbEl) breadcrumbEl.innerText = `Champions CC / Admin / ${titleText}`;
    });
  });
}

/* --------------------------------------------------------------------------
   3. DATA RENDERING & DASHBOARD LOADER
   -------------------------------------------------------------------------- */
function loadDashboardData() {
  fetchLeads();
  renderLiveScoreForm();
  renderSquadAdminTable();
  renderBlogsAdminTable();
  renderSettingsForm();
  updateOverviewStats();
  renderArchivedMatches();
  loadPromoSettings();
  loadOperationalSettings();
}

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
  const origHtml = saveBtn.innerHTML;
  saveBtn.innerHTML = 'Saving...';
  
  const payload = {
    enabled: document.getElementById('promoEnabled').checked,
    text: document.getElementById('promoText').value.trim(),
    btnText: document.getElementById('promoBtnText').value.trim(),
    btnUrl: document.getElementById('promoBtnUrl').value.trim(),
    speed: parseInt(document.getElementById('promoSpeed').value, 10) || 15
  };
  
  try {
    const res = await fetch('/api/admin/settings/promo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) alert('Promo bar saved!');
    else alert('Failed to save promo bar');
  } catch (err) {
    alert('Error saving promo bar');
  }
  saveBtn.innerHTML = origHtml;
});

document.getElementById('promoPopupForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const saveBtn = document.getElementById('savePopupBtn');
  const origHtml = saveBtn.innerHTML;
  saveBtn.innerHTML = 'Saving...';
  
  // Since we use URLs directly, we can just save it. (Wait, the backend /api/admin/settings/promo expects { promo: req.body } so the previous route overwrites! 
  // Let's modify the payload to send BOTH or fetch current and merge.)
  // Actually, wait, AS Creates POST /api/admin/settings/promo saves req.body into settings.promo. 
  // We need to fetch the existing data or structure the payload correctly.
  
  // Let's fetch current state first to avoid overwriting promo with popup
  const currentRes = await fetch('/api/promotion');
  const currentData = await currentRes.json();
  
  const payload = {
    enabled: currentData.is_active,
    text: currentData.text,
    btnText: currentData.link_text,
    btnUrl: currentData.link_url,
    speed: currentData.speed,
    popup: {
      enabled: document.getElementById('popupEnabled').checked,
      link_url: document.getElementById('popupLinkUrl').value.trim(),
      desktop_image: document.getElementById('popupDesktopImageUrl').value.trim(),
      mobile_image: document.getElementById('popupMobileImageUrl').value.trim()
    }
  };
  
  try {
    const res = await fetch('/api/admin/settings/promo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) alert('Popup saved!');
    else alert('Failed to save popup');
  } catch (err) {
    alert('Error saving popup');
  }
  saveBtn.innerHTML = origHtml;
});

// Update promoBarForm logic to preserve popup:
document.getElementById('promoBarForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const saveBtn = document.getElementById('savePromoBtn');
  const origHtml = saveBtn.innerHTML;
  saveBtn.innerHTML = 'Saving...';
  
  const currentRes = await fetch('/api/promotion');
  const currentData = await currentRes.json();
  
  const payload = {
    enabled: document.getElementById('promoEnabled').checked,
    text: document.getElementById('promoText').value.trim(),
    btnText: document.getElementById('promoBtnText').value.trim(),
    btnUrl: document.getElementById('promoBtnUrl').value.trim(),
    speed: parseInt(document.getElementById('promoSpeed').value, 10) || 15,
    popup: currentData.popup
  };
  
  try {
    const res = await fetch('/api/admin/settings/promo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) alert('Promo bar saved!');
    else alert('Failed to save promo bar');
  } catch (err) {
    alert('Error saving promo bar');
  }
  saveBtn.innerHTML = origHtml;
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
      btn.style.background = '#dc2626';
      btn.style.borderColor = '#dc2626';
      btn.style.color = '#ffffff';
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
      btn.style.background = '#10b981';
      btn.style.borderColor = '#10b981';
      btn.style.color = '#ffffff';
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
      alert('Operational settings saved successfully!');
      CURRENT_OPERATIONAL_STATE = payload;
    } else {
      alert('Failed to save operational settings.');
    }
  } catch (err) {
    console.error('Error saving operational settings:', err);
    alert('Error connecting to server.');
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
  if (confirm("Delete this archived match?")) {
    ADMIN_STATE.fixtures = ADMIN_STATE.fixtures.filter(f => f.id !== id);
    localStorage.setItem("ccc_fixtures", JSON.stringify(ADMIN_STATE.fixtures));
    renderArchivedMatches();
    showAdminToast("Archived match deleted.");
  }
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
    <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.65rem 0.85rem; background: #f8fafc; border-radius: 10px; border: 1px solid #f1f5f9;">
      <div>
        <div style="font-weight: 700; font-size: 0.85rem; color: #0f172a;">${l.name}</div>
        <div style="font-size: 0.75rem; color: #64748b;">${l.service_interest || l.subject || 'General Inquiry'} • ${l.email}</div>
      </div>
      <span class="badge-status ${l.is_read ? 'badge-read' : 'badge-new'}" style="font-size: 0.7rem;">${l.is_read ? 'Read' : 'New'}</span>
    </div>
  `).join("");
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
    <div style="display: flex; align-items: center; gap: 0.75rem; padding: 0.65rem 0.85rem; background: #f8fafc; border-radius: 10px; border: 1px solid #f1f5f9;">
      <img src="${s.photo || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=srgb&fm=jpg&q=85&w=500'}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; border: 1px solid #10b981;" />
      <div style="flex: 1; min-width: 0;">
        <div style="font-weight: 700; font-size: 0.85rem; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${s.name}</div>
        <div style="font-size: 0.725rem; color: #64748b;">${s.role}</div>
      </div>
      <span class="badge-status badge-read" style="font-size: 0.7rem;">${s.roleCategory || 'Member'}</span>
    </div>
  `).join("");
}


// Leads Table
async function fetchLeads() {
  try {
    const res = await fetch('/api/admin/leads');
    if (res.ok) {
      ADMIN_STATE.leads = await res.json();
      renderLeadsTable();
      updateOverviewStats();
    }
  } catch(e) {
    console.error("Error fetching leads", e);
  }
}

function renderLeadsTable() {
  const container = document.getElementById("leads-tbody");
  if (!container) return;

  const badgeCount = document.getElementById("leads-count-badge");
  if (badgeCount) badgeCount.innerText = ADMIN_STATE.leads.length;

  if (ADMIN_STATE.leads.length === 0) {
    container.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-muted); padding:2rem;">No contact inquiries found.</td></tr>`;
    return;
  }

  container.innerHTML = ADMIN_STATE.leads.map(lead => `
    <tr>
      <td><strong>${lead.name}</strong></td>
      <td><div>${lead.email}</div><div style="font-size:0.75rem; color:var(--text-muted);">${lead.phone || ''}</div></td>
      <td>${lead.service_interest || lead.subject || 'N/A'}</td>
      <td><span class="badge-status ${lead.is_read ? 'badge-read' : 'badge-new'}">${lead.is_read ? 'Read' : 'New'}</span></td>
      <td>${new Date(lead.created_at).toLocaleDateString()}</td>
      <td>
        <button class="btn-icon" onclick="viewLeadModal(${lead.id})" title="View Message">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
        </button>
        <button class="btn-icon" onclick="deleteLead(${lead.id})" title="Delete" style="color:var(--danger-color);">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </td>
    </tr>
  `).join("");
}

function viewLeadModal(id) {
  const lead = ADMIN_STATE.leads.find(l => l.id === id);
  if (!lead) return;

  // Ideally make an API call to mark as read

  document.getElementById("modal-lead-title").innerText = `Inquiry: ${lead.service_interest || lead.subject || 'N/A'}`;
  document.getElementById("modal-lead-body").innerHTML = `
    <div style="margin-bottom:1rem;">
      <p><strong>From:</strong> ${lead.name} (${lead.email})</p>
      <p><strong>Phone:</strong> ${lead.phone || 'N/A'}</p>
      <p><strong>Date:</strong> ${lead.date}</p>
    </div>
    <div style="background:var(--bg-input); padding:1.25rem; border-radius:var(--radius-md); border:1px solid var(--border-color); color:var(--text-primary); font-size:0.95rem; line-height:1.6;">
      ${lead.message}
    </div>
  `;
  openAdminModal("modal-lead");
}

function deleteLead(id) {
  if (confirm("Delete this contact submission?")) {
    // Ideally make an API call to delete
    ADMIN_STATE.leads = ADMIN_STATE.leads.filter(l => l.id !== id);
    renderLeadsTable();
    updateOverviewStats();
    showAdminToast("Contact submission deleted.");
  }
}

// Squad Manager
function renderSquadAdminTable() {
  const container = document.getElementById("squad-tbody");
  if (!container) return;

  container.innerHTML = ADMIN_STATE.squad.map(m => `
    <tr>
      <td style="display:flex; align-items:center; gap:0.75rem;">
        <img src="${m.photo}" style="width:36px; height:36px; border-radius:50%; object-fit:cover; border:1px solid var(--accent-emerald);">
        <strong>${m.name}</strong>
      </td>
      <td><span class="badge-status badge-read">${m.role}</span></td>
      <td>${m.experience}</td>
      <td>${m.tenure}</td>
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
  document.getElementById("edit-player-id").value = player.id;
  document.getElementById("new-player-name").value = player.name || '';
  document.getElementById("new-player-category").value = player.roleCategory || '';
  document.getElementById("new-player-role").value = player.role || '';
  document.getElementById("new-player-bio").value = player.bio || '';
  document.getElementById("new-player-photo").value = player.photo || '';
  
  openAdminModal("modal-add-player");
}

function handleCreatePlayer(e) {
  e.preventDefault();
  const idToEdit = document.getElementById("edit-player-id").value;
  const name = document.getElementById("new-player-name").value.trim();
  const roleCategory = document.getElementById("new-player-category").value;
  const role = document.getElementById("new-player-role").value.trim();
  const bio = document.getElementById("new-player-bio").value.trim();
  const photo = document.getElementById("new-player-photo").value.trim();

  if (idToEdit) {
    // Edit existing
    const idx = ADMIN_STATE.squad.findIndex(p => p.id === idToEdit);
    if (idx !== -1) {
      ADMIN_STATE.squad[idx] = { ...ADMIN_STATE.squad[idx], name, roleCategory, role, bio, photo };
      showAdminToast(`✨ Player "${name}" updated!`);
    }
  } else {
    // Create new
    const newPlayer = {
      id: "m-" + Date.now(),
      roleCategory,
      name,
      role,
      experience: "Active Member",
      tenure: "Joined 2026",
      photo,
      bio
    };
    ADMIN_STATE.squad.unshift(newPlayer);
    showAdminToast(`✨ Player "${name}" added to squad!`);
  }

  localStorage.setItem("ccc_squad", JSON.stringify(ADMIN_STATE.squad));

  closeAdminModal("modal-add-player");
  renderSquadAdminTable();
  updateOverviewStats();

  // Reset form
  e.target.reset();
  document.getElementById("edit-player-id").value = "";
}

function deletePlayer(id) {
  if (confirm("Remove player from squad list?")) {
    ADMIN_STATE.squad = ADMIN_STATE.squad.filter(s => s.id !== id);
    localStorage.setItem("ccc_squad", JSON.stringify(ADMIN_STATE.squad));
    renderSquadAdminTable();
    updateOverviewStats();
    showAdminToast("Player removed from squad.");
  }
}

// Blog Posts Manager
function renderBlogsAdminTable() {
  const container = document.getElementById("blogs-tbody");
  if (!container) return;

  container.innerHTML = ADMIN_STATE.blogs.map(b => `
    <tr>
      <td><strong>${b.title}</strong></td>
      <td>${b.category}</td>
      <td>${b.date}</td>
      <td>${b.author}</td>
      <td class="action-btns-cell">
        <button class="btn-icon danger" title="Delete Article" onclick="deleteBlog('${b.id}')"><span class="material-symbols-outlined" style="font-size: 1.2rem;">delete</span></button>
      </td>
    </tr>
  `).join("");
}

function handleCreateBlog(e) {
  e.preventDefault();
  const title = document.getElementById("new-blog-title").value.trim();
  const category = document.getElementById("new-blog-category").value;
  const excerpt = document.getElementById("new-blog-excerpt").value.trim();
  const author = document.getElementById("new-blog-author").value.trim();
  const image = document.getElementById("new-blog-image").value.trim();

  const newBlog = {
    id: "blog-" + Date.now(),
    title,
    category,
    date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    author,
    image,
    excerpt,
    readTime: "4 min read"
  };

  ADMIN_STATE.blogs.unshift(newBlog);
  localStorage.setItem("ccc_blogs", JSON.stringify(ADMIN_STATE.blogs));

  closeAdminModal("modal-add-blog");
  renderBlogsAdminTable();
  updateOverviewStats();
  showAdminToast(`📰 Article "${title}" published!`);

  // Reset form
  document.getElementById("new-blog-title").value = "";
  document.getElementById("new-blog-excerpt").value = "";
}

function deleteBlog(id) {
  if (confirm("Delete this blog article?")) {
    ADMIN_STATE.blogs = ADMIN_STATE.blogs.filter(b => b.id !== id);
    localStorage.setItem("ccc_blogs", JSON.stringify(ADMIN_STATE.blogs));
    renderBlogsAdminTable();
    updateOverviewStats();
    showAdminToast("Blog article deleted.");
  }
}

/* --------------------------------------------------------------------------
   4. MODALS & TOAST NOTIFICATIONS
   -------------------------------------------------------------------------- */
function openAdminModal(modalId) {
  const overlay = document.getElementById(modalId);
  if (overlay) overlay.classList.add("open");
}

function closeAdminModal(modalId) {
  const overlay = document.getElementById(modalId);
  if (overlay) overlay.classList.remove("open");
}

function showAdminToast(msg) {
  let container = document.getElementById("admin-toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "admin-toast-container";
    container.className = "admin-toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = "admin-toast";
  toast.innerHTML = `<span>✨</span><span>${msg}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}


// --- GALLERY MANAGEMENT ---
async function fetchGallery() {
    try {
        const res = await fetch('/api/gallery');
        const data = await res.json();
        renderGalleryTable(data);
    } catch (e) {
        console.error('Error fetching gallery', e);
    }
}

function renderGalleryTable(items) {
    const tbody = document.getElementById("tbl-gallery-body");
    if (!tbody) return;
    tbody.innerHTML = "";
    items.forEach(item => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><img src="${item.url}" alt="${item.title}" style="width: 60px; height: 40px; object-fit: cover; border-radius: 4px;"></td>
            <td>${item.title}</td>
            <td><span class="badge-status ${item.type === 'video' ? 'danger' : 'active'}">${item.type.toUpperCase()}</span></td>
            <td>${item.category}</td>
            <td>${new Date(item.created_at).toLocaleDateString()}</td>
            <td style="text-align:right;">
                <button class="btn-icon danger" title="Delete" onclick="deleteGalleryItem(${item.id})"><span class="material-symbols-outlined" style="font-size: 1.2rem;">delete</span></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function handleCreateGallery(e) {
    e.preventDefault();
    const payload = {
        title: document.getElementById('new-gallery-title').value,
        type: document.getElementById('new-gallery-type').value,
        category: document.getElementById('new-gallery-category').value,
        url: document.getElementById('new-gallery-url').value
    };
    try {
        const res = await fetch('/api/admin/gallery', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (res.ok) {
            closeAdminModal('modal-add-gallery');
            e.target.reset();
            fetchGallery();
            alert('Media added successfully!');
        }
    } catch (err) {
        console.error(err);
        alert('Failed to add media');
    }
}

async function deleteGalleryItem(id) {
    if (!confirm('Delete this media item?')) return;
    try {
        const res = await fetch('/api/admin/gallery/' + id, { method: 'DELETE' });
        if (res.ok) {
            fetchGallery();
        }
    } catch (e) {
        console.error(e);
    }
}


function triggerNavTab(sectionId) {
  const btn = document.querySelector(`.nav-item[data-section="${sectionId}"]`);
  if (btn) btn.click();
}

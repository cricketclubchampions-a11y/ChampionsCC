// Champions Cricket Club - Main Application Script

document.addEventListener("DOMContentLoaded", () => {
  localStorage.removeItem("ccc-theme");
  document.documentElement.removeAttribute("data-theme");
  initSiteInfo();
  initNavigation();
  initLiveScoreboard();
  renderFixtures("all");
  initPromoSettings();
  renderSquad("all");
  renderBlogs("all");
  renderGallery("all");
  initModals();
  initForms();
});

function initLiveScoreboard() {
  const container = document.getElementById("live-scoreboard-widget");
  if (!container) return;

  const score = JSON.parse(localStorage.getItem("ccc_live_score")) || {
    stage: "live",
    winner: "CHAMPIONS CC 1st XI",
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
    stopReason: "",
    playerOfMatch: "Vikram Singh — 78 (45) & 3/18",
    bestBatter: "Rohan Verma — 84* (52)",
    bestBowler: "Sarah Jenkins — 4/16 (4.0)"
  };

  const isEnded = (score.stage === "ended");
  const isAbandoned = (score.stage === "abandoned");

  container.innerHTML = `
    <div class="scoreboard-card">
      <div class="scoreboard-badge">${isAbandoned ? '🌧️ MATCH ABANDONED' : (isEnded ? '🏆 MATCH CONCLUDED' : '🔴 LIVE MATCH IN PROGRESS')}</div>
      
      <div class="scoreboard-match">
        <div>
          <div class="team-name">${score.team1}</div>
          <div class="team-score">${score.score1} <span style="font-size:1rem; color:var(--text-muted);">${score.overs1}</span></div>
        </div>
        <div class="vs-badge">VS</div>
        <div>
          <div class="team-name">${score.team2}</div>
          <div class="team-score">${score.score2} <span style="font-size:1rem; color:var(--text-muted);">${score.overs2}</span></div>
        </div>
      </div>

      <div class="match-info-strip">
        <span>📍 ${score.venue}</span>
        <span>🏆 ${score.tournament}</span>
        <span>⚡ ${score.statusNote}</span>
      </div>

      ${isAbandoned ? `
        <!-- Abandoned Match Section -->
        <div style="margin-top:1.25rem;">
          <div style="padding:1rem; border-radius:var(--radius-md); background:linear-gradient(135deg, rgba(239, 68, 68, 0.12), rgba(220, 38, 38, 0.05)); border:1px solid rgba(239, 68, 68, 0.3); text-align:center;">
            <div style="font-size:0.85rem; font-weight:800; color:#ef4444; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:0.5rem;">⛔ MATCH ABANDONED</div>
            <div style="font-family:var(--font-heading); font-size:1.15rem; font-weight:700; color:var(--text-primary);">${score.stopReason || 'Match called off without a result'}</div>
          </div>
        </div>
      ` : isEnded ? `
        <!-- Concluded Match Winner & Awards Section -->
        <div style="margin-top:1.25rem; text-align:center;">
          <button type="button" class="btn-primary" onclick="toggleMatchAwards(this)" style="padding:0.65rem 1.35rem; font-size:0.875rem;">
            <span>🏆 Show Winner & Match Awards (Man of the Match)</span>
            <span>▼</span>
          </button>
        </div>

        <div id="match-awards-reveal" style="display:none; margin-top:1.25rem; animation:fadeIn 0.3s ease;">
          <div style="padding:1rem; border-radius:var(--radius-md); background:linear-gradient(135deg, rgba(5, 150, 105, 0.1), rgba(217, 119, 6, 0.08)); border:1px solid var(--border-glow); text-align:center; margin-bottom:1rem;">
            <div style="font-size:0.75rem; font-weight:800; color:var(--accent-gold); text-transform:uppercase; letter-spacing:0.05em; margin-bottom:0.25rem;">🏆 DECLARED WINNER</div>
            <div style="font-family:var(--font-heading); font-size:1.35rem; font-weight:800; color:var(--accent-emerald);">${score.winner || score.team1}</div>
            <div style="font-size:0.85rem; color:var(--text-secondary); margin-top:0.25rem;">${score.statusNote}</div>
          </div>

          ${score.playerOfMatch ? `
            <div style="padding:0.85rem 1rem; border-radius:var(--radius-md); background:linear-gradient(135deg, rgba(217, 119, 6, 0.12), rgba(245, 158, 11, 0.05)); border:1px solid rgba(217, 119, 6, 0.3); text-align:center; margin-bottom:0.75rem;">
              <div style="font-size:0.75rem; font-weight:800; color:var(--accent-gold); text-transform:uppercase; letter-spacing:0.05em; margin-bottom:0.25rem;">🌟 PLAYER OF THE MATCH</div>
              <div style="font-family:var(--font-heading); font-size:1.05rem; font-weight:800; color:var(--text-primary);">${score.playerOfMatch}</div>
            </div>
          ` : ''}

          ${(score.bestBatter || score.bestBowler) ? `
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:0.75rem; text-align:center; margin-bottom:1rem;">
              ${score.bestBatter ? `<div style="background:var(--bg-primary); padding:0.65rem; border-radius:var(--radius-sm); border:1px solid var(--border-color); font-size:0.8rem;"><strong>🏏 Best Batting:</strong> ${score.bestBatter}</div>` : ''}
              ${score.bestBowler ? `<div style="background:var(--bg-primary); padding:0.65rem; border-radius:var(--radius-sm); border:1px solid var(--border-color); font-size:0.8rem;"><strong>⚡ Best Bowling:</strong> ${score.bestBowler}</div>` : ''}
            </div>
          ` : ''}

          ${score.stumpsUrl ? `
            <div style="text-align:center;">
              <a href="${score.stumpsUrl}" target="_blank" rel="noopener" class="btn-secondary" style="display:inline-flex; align-items:center; gap:0.5rem; text-decoration:none; padding:0.6rem 1.25rem; font-size:0.85rem;">
                <span>🔗 Official Stumps / CricHeroes Scorecard</span>
                <span>↗</span>
              </a>
            </div>
          ` : ''}
        </div>
      ` : `
        <!-- Live Match Active: Awards Hidden -->
        ${score.stumpsUrl ? `
          <div style="text-align:center; margin-top:1.25rem;">
            <a href="${score.stumpsUrl}" target="_blank" rel="noopener" class="btn-primary" style="display:inline-flex; align-items:center; gap:0.5rem; text-decoration:none; padding:0.65rem 1.35rem; font-size:0.85rem;">
              <span>🔗 Live Stumps / CricHeroes Match Feed</span>
              <span>↗</span>
            </a>
          </div>
        ` : ''}
      `}
    </div>
  `;
}

function toggleMatchAwards(btn) {
  const panel = document.getElementById("match-awards-reveal");
  if (!panel) return;
  if (panel.style.display === "none") {
    panel.style.display = "block";
    btn.innerHTML = `<span>🏆 Hide Match Awards</span> <span>▲</span>`;
  } else {
    panel.style.display = "none";
    btn.innerHTML = `<span>🏆 Show Winner & Match Awards (Man of the Match)</span> <span>▼</span>`;
  }
}

/* --------------------------------------------------------------------------
   2. NAVIGATION & MOBILE MENU
   -------------------------------------------------------------------------- */
function initNavigation() {
  const mobileBtn = document.getElementById("mobile-menu-btn");
  const navLinksContainer = document.getElementById("nav-links");

  if (mobileBtn && navLinksContainer) {
    mobileBtn.addEventListener("click", () => {
      navLinksContainer.classList.toggle("mobile-active");
      if (navLinksContainer.classList.contains("mobile-active")) {
        navLinksContainer.style.display = "flex";
        navLinksContainer.style.flexDirection = "column";
        navLinksContainer.style.position = "absolute";
        navLinksContainer.style.top = "100%";
        navLinksContainer.style.left = "0";
        navLinksContainer.style.right = "0";
        navLinksContainer.style.background = "var(--bg-card)";
        navLinksContainer.style.padding = "1.5rem";
        navLinksContainer.style.borderBottom = "1px solid var(--border-color)";
      } else {
        navLinksContainer.style.display = "";
      }
    });
  }

  // Smooth scroll active links
  const links = document.querySelectorAll(".nav-link");
  links.forEach(link => {
    link.addEventListener("click", (e) => {
      links.forEach(l => l.classList.remove("active"));
      link.classList.add("active");
    });
  });

  // Scroll behavior
  const navbar = document.querySelector(".navbar");
  if (navbar) {
    let lastScrollY = window.scrollY;
    let scrollTimeout = null;

    // Check initial state
    if (lastScrollY > 50) {
      navbar.classList.add("scrolled");
    }

    window.addEventListener("scroll", () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY <= 50) {
        // At the top: transparent, not hidden
        navbar.classList.remove("scrolled");
        navbar.classList.remove("hidden");
        if (scrollTimeout) {
          clearTimeout(scrollTimeout);
          scrollTimeout = null;
        }
      } else {
        // Scrolled down: translucent/opaque effect enabled
        navbar.classList.add("scrolled");

        if (currentScrollY < lastScrollY) {
          // Scrolling up: make visible, set timer to hide after 2.5 seconds
          navbar.classList.remove("hidden");
          
          if (scrollTimeout) {
            clearTimeout(scrollTimeout);
          }
          
          scrollTimeout = setTimeout(() => {
            // Hide again after 2-3 seconds if still scrolled down
            if (window.scrollY > 50) {
              navbar.classList.add("hidden");
            }
          }, 2500); // 2.5 seconds visibility
        } else {
          // Scrolling down: hide immediately
          navbar.classList.add("hidden");
          if (scrollTimeout) {
            clearTimeout(scrollTimeout);
            scrollTimeout = null;
          }
        }
      }
      
      lastScrollY = currentScrollY;
    }, { passive: true });
  }
}

/* --------------------------------------------------------------------------
   4. RENDER FIXTURES & SCOREBOARD
   -------------------------------------------------------------------------- */
function renderFixtures(filterCategory = "all") {
  const container = document.getElementById("fixtures-grid");
  if (!container) return;

  const localFixtures = JSON.parse(localStorage.getItem("ccc_fixtures")) || [];
  const allFixtures = [...localFixtures, ...(APP_DATA.fixtures || [])];

  const filtered = allFixtures.filter(f => {
    const isPast = (f.category === "past" || f.status === "Concluded" || f.status === "Abandoned");
    if (filterCategory === "all") return true;
    if (filterCategory === "past") return isPast;
    if (filterCategory === "upcoming") return !isPast;
    return f.category === filterCategory;
  });

  container.innerHTML = filtered.map(fix => `
    <div class="fixture-card">
      <div class="fixture-card-body">
        <div class="fixture-header">
          <span class="fixture-badge ${fix.status === 'Concluded' || fix.status === 'Abandoned' ? 'badge-read' : 'badge-new'}">${fix.type}</span>
          <span class="fixture-date-chip">📅 ${fix.date}</span>
        </div>
        <h3 class="fixture-title">${fix.title}</h3>
        <div class="fixture-venue">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2a8 8 0 00-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 00-8-8z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          <span>${fix.venue}</span>
        </div>
        <p class="fixture-description">${fix.description}</p>

        ${(fix.status === "Concluded" || fix.status === "Abandoned") ? `
          <div style="margin-top:1rem; padding:0.75rem; background:var(--bg-secondary); border-radius:var(--radius-sm); border:1px solid var(--border-color); font-size:0.85rem; text-align:center;">
            <strong style="color:var(--accent-emerald);">Result:</strong> ${fix.status === "Abandoned" ? "Match Abandoned" : (fix.winner ? fix.winner + " won" : "Match Concluded")}
            ${(fix.score1 && fix.score2) ? `<br><span style="color:var(--text-muted); font-size:0.8rem;">${fix.homeTeam || 'Team 1'} (${fix.score1}) - ${fix.awayTeam || 'Team 2'} (${fix.score2})</span>` : ""}
          </div>
        ` : ""}
      </div>
      <button class="fixture-rsvp-btn" onclick="handleRsvp('${fix.title.replace(/'/g, "\\'")}')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        <span>${(fix.status === "Concluded" || fix.status === "Abandoned") ? "View Full Scorecard" : "Set Match Reminder"}</span>
      </button>
    </div>
  `).join("");

  const fixtureTabs = document.querySelectorAll("#fixture-tabs .tab-btn");
  fixtureTabs.forEach(btn => {
    btn.onclick = () => {
      fixtureTabs.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderFixtures(btn.getAttribute("data-category"));
    };
  });
}

function handleRsvp(title) {
  showToast(`🔔 Match reminder added for: ${title}`);
}

/* --------------------------------------------------------------------------
   5. RENDER SQUAD & LEADERSHIP (LIVE BACKEND LINK)
   -------------------------------------------------------------------------- */
function renderSquad(filterRole = "all") {
  const container = document.getElementById("squad-grid");
  const homeContainer = document.getElementById("home-squad-grid");
  if (!container && !homeContainer) return;

  const squadData = JSON.parse(localStorage.getItem("ccc_squad")) || (window.APP_DATA ? window.APP_DATA.squad : []);

  const filtered = filterRole === "all"
    ? squadData
    : squadData.filter(s => s.roleCategory === filterRole);

  if (container) {
    container.innerHTML = filtered.map(member => `
      <div class="player-card" onclick="openPlayerModal('${member.id}')">
        <div class="player-avatar">
          <img src="${member.photo}" alt="${member.name}" loading="lazy">
        </div>
        <h3 class="player-name">${member.name}</h3>
        <div class="player-role">${member.role}</div>
        <p style="font-size:0.8125rem; color:var(--text-secondary); margin:0.75rem 0;">${member.bio}</p>
        <div class="player-tenure">${member.tenure}</div>
      </div>
    `).join("");
  }

  if (homeContainer) {
    homeContainer.innerHTML = squadData.slice(0, 3).map(member => `
      <div class="player-card" onclick="openPlayerModal('${member.id}')">
        <div class="player-avatar">
          <img src="${member.photo}" alt="${member.name}" loading="lazy">
        </div>
        <h3 class="player-name">${member.name}</h3>
        <div class="player-role">${member.role}</div>
      </div>
    `).join("");
  }

  const squadTabsContainer = document.getElementById("squad-tabs");
  if (squadTabsContainer) {
    const categories = ["all", ...new Set(squadData.map(s => s.roleCategory))].filter(Boolean);
    
    // Only re-render tabs if they haven't been dynamically rendered yet
    if (squadTabsContainer.children.length !== categories.length) {
        squadTabsContainer.innerHTML = categories.map(cat => `
          <button class="tab-btn ${cat === filterRole ? 'active' : ''}" data-category="${cat}">
            ${cat === 'all' ? 'All Members' : cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        `).join("");
    }

    const squadTabs = document.querySelectorAll("#squad-tabs .tab-btn");
    squadTabs.forEach(btn => {
      btn.onclick = () => {
        squadTabs.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        renderSquad(btn.getAttribute("data-category"));
      };
    });
  }
}

function openPlayerModal(memberId) {
  const squadData = JSON.parse(localStorage.getItem("ccc_squad")) || (window.APP_DATA ? window.APP_DATA.squad : []);
  const member = squadData.find(m => m.id === memberId);
  if (!member) return;

  const modalBody = document.getElementById("player-modal-content");
  if (modalBody) {
    modalBody.innerHTML = `
      <div style="text-align:center;">
        <img src="${member.photo}" style="width:100px; height:100px; border-radius:50%; object-fit:cover; margin:0 auto 1rem; border:3px solid var(--accent-emerald);">
        <h2 style="font-family:var(--font-heading); font-size:1.5rem; font-weight:800;">${member.name}</h2>
        <div style="color:var(--accent-emerald); font-weight:700; font-size:0.85rem; margin-bottom:1rem;">${member.role}</div>
        <p style="color:var(--text-secondary); font-size:0.9rem; margin-bottom:1.5rem;">${member.bio}</p>
        <div style="background:var(--bg-primary); padding:1rem; border-radius:var(--radius-md); display:grid; grid-template-columns:1fr 1fr; gap:0.5rem; font-size:0.85rem; text-align:left;">
          <div><strong>Experience:</strong> ${member.experience || 'Pro Squad'}</div>
          <div><strong>Tenure:</strong> ${member.tenure || 'Active'}</div>
        </div>
      </div>
    `;
    openModal("player-modal");
  }
}

/* --------------------------------------------------------------------------
   6. RENDER BLOGS & ARTICLES (LIVE BACKEND LINK)
   -------------------------------------------------------------------------- */
function renderBlogs(filterCategory = "all") {
  const container = document.getElementById("blogs-grid");
  if (!container) return;

  const blogsData = JSON.parse(localStorage.getItem("ccc_blogs")) || (window.APP_DATA ? window.APP_DATA.blogs : []);

  const filtered = filterCategory === "all"
    ? blogsData
    : blogsData.filter(b => b.category === filterCategory);

  container.innerHTML = filtered.map(b => `
    <div class="blog-card" style="background:var(--bg-card); border-radius:var(--radius-lg); border:1px solid var(--border-color); overflow:hidden; box-shadow:var(--shadow-sm); display:flex; flex-direction:column;">
      <div style="height:200px; overflow:hidden; position:relative;">
        <img src="${b.image}" alt="${b.title}" style="width:100%; height:100%; object-fit:cover; transition:transform 0.4s ease;" onmouseover="this.style.transform='scale(1.05)';" onmouseout="this.style.transform='scale(1)';" />
        <span class="badge-status badge-new" style="position:absolute; top:12px; left:12px; background:var(--accent-emerald); color:#fff;">${b.category}</span>
      </div>
      <div style="padding:1.5rem; display:flex; flex-direction:column; flex-grow:1;">
        <div style="font-size:0.75rem; color:var(--text-muted); margin-bottom:0.5rem;">📅 ${b.date} • ${b.author}</div>
        <h3 style="font-family:var(--font-heading); font-size:1.15rem; font-weight:700; color:var(--text-primary); margin-bottom:0.75rem; line-height:1.4;">${b.title}</h3>
        <p style="font-size:0.875rem; color:var(--text-secondary); line-height:1.6; margin-bottom:1.25rem; flex-grow:1;">${b.excerpt}</p>
        <a href="contact.html" class="btn-secondary" style="align-self:flex-start; text-decoration:none;">Read Article →</a>
      </div>
    </div>
  `).join("");

  const blogTabs = document.querySelectorAll("#blog-tabs .tab-btn");
  blogTabs.forEach(btn => {
    btn.onclick = () => {
      blogTabs.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderBlogs(btn.getAttribute("data-category"));
    };
  });
}

async function initSiteInfo() {
  try {
    const res = await fetch('/api/site-info');
    if (!res.ok) return;
    const data = await res.json();

    // 1. Dynamic Site Name & Tagline updates in headers/footers/title
    if (data.siteName) {
      document.title = data.siteName + (data.siteTagline ? ' | ' + data.siteTagline : '');
      document.querySelectorAll('.logo-text, .nav-logo-text, .footer-brand-title').forEach(el => {
        el.textContent = data.siteName;
      });
    }

    // 2. Inject Google Analytics GA4 script if configured
    if (data.googleAnalyticsId && !document.getElementById('ga-script-element')) {
      const script1 = document.createElement('script');
      script1.id = 'ga-script-element';
      script1.async = true;
      script1.src = `https://www.googletagmanager.com/gtag/js?id=${data.googleAnalyticsId}`;
      document.head.appendChild(script1);

      const script2 = document.createElement('script');
      script2.textContent = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${data.googleAnalyticsId}');
      `;
      document.head.appendChild(script2);
    }
  } catch (err) {
    console.error('Failed to load site info:', err);
  }
}

function initForms() {
  const contactForm = document.getElementById("contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = (document.getElementById("contact-name") || {}).value || "";
      const email = (document.getElementById("contact-email") || {}).value || "";
      const phone = (document.getElementById("contact-phone") || {}).value || "";
      const subject = (document.getElementById("contact-subject") || {}).value || "General Inquiry";
      const message = (document.getElementById("contact-message") || {}).value || "";

      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, phone, subject, message })
        });

        const data = await res.json();
        if (!res.ok) {
          showToast(`⚠️ ${data.error || 'Failed to send message'}`);
          return;
        }

        showToast("📬 Thank you! Your message has been sent to Champions CC Administration.");
        contactForm.reset();
      } catch (err) {
        showToast("⚠️ Network error while sending message");
      }
    });
  }
}

/* --------------------------------------------------------------------------
   9. TOAST NOTIFICATION SYSTEM
   -------------------------------------------------------------------------- */
function showToast(message) {
  let toastContainer = document.getElementById("toast-container");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "toast-container";
    toastContainer.className = "toast-container";
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `<span>🏆</span> <div>${message}</div>`;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transition = "opacity 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// --- Promotional Bar & Popup Settings ---
async function initPromoSettings() {
  try {
    const res = await fetch('/api/promotion');
    const data = await res.json();
    
    // Promo Bar
    if (data.is_active) {
      const bar = document.getElementById('promotionBar');
      if (bar) {
        bar.style.display = 'block';
        if (data.speed) bar.style.setProperty('--marquee-speed', data.speed + 's');
        
        document.querySelectorAll('.promo-text-node').forEach(n => n.textContent = data.text || '');
        
        document.querySelectorAll('.promo-link-node').forEach(n => {
          if (data.link_url && data.link_text) {
            n.href = data.link_url;
            n.textContent = data.link_text;
            n.style.display = 'inline-block';
          } else {
            n.style.display = 'none';
          }
        });
      }
    }
    
    // Popup Modal
    const popup = data.popup;
    if (popup && popup.enabled) {
      const hasSeenPopup = sessionStorage.getItem('ccc_popup_seen');
      if (!hasSeenPopup) {
        const popupEl = document.getElementById('promoPopup');
        const img = document.getElementById('promoPopupImage');
        const src = document.getElementById('promoPopupMobileSource');
        const link = document.getElementById('promoPopupLink');
        const close = document.getElementById('promoPopupClose');
        
        if (popupEl && img && popup.desktop_image) {
          img.src = popup.desktop_image;
          if (src && popup.mobile_image) src.srcset = popup.mobile_image;
          if (link) link.href = popup.link_url || '#';
          
          popupEl.style.display = 'flex';
          
          close.addEventListener('click', () => {
            popupEl.style.display = 'none';
            sessionStorage.setItem('ccc_popup_seen', 'true');
          });
        }
      }
    }
  } catch (err) {
    console.error('Failed to load promo settings:', err);
  }
}


/* --- Gallery Fetch and Render --- */
let allGalleryItems = [];

async function initGallery() {
  const grid = document.getElementById('gallery-grid');
  if (!grid) return; // not on page

  try {
    const res = await fetch('/api/gallery');
    allGalleryItems = await res.json();
    
    renderGalleryFilters();
    renderGalleryItems('all');
  } catch (err) {
    console.error('Failed to load gallery', err);
  }
}

function renderGalleryFilters() {
  const filtersContainer = document.getElementById('gallery-filters');
  if (!filtersContainer) return;

  const categories = ['all'];
  allGalleryItems.forEach(item => {
    const cat = item.category.trim();
    if (cat && !categories.includes(cat)) {
      categories.push(cat);
    }
  });

  filtersContainer.innerHTML = '';
  categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'gallery-filter-btn' + (cat === 'all' ? ' active' : '');
    btn.dataset.filter = cat;
    btn.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.gallery-filter-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      renderGalleryItems(cat);
    });

    filtersContainer.appendChild(btn);
  });
}

function renderGalleryItems(filterCat) {
  const grid = document.getElementById('gallery-grid');
  grid.innerHTML = '';

  const filtered = filterCat === 'all' 
    ? allGalleryItems 
    : allGalleryItems.filter(i => i.category.trim() === filterCat);

  filtered.forEach(item => {
    const el = document.createElement('div');
    el.className = 'gallery-item';
    
    let playIcon = '';
    if (item.type === 'video') {
      playIcon = '<div class="play-icon-overlay"><span class="material-symbols-outlined">play_arrow</span></div>';
    }

    el.innerHTML = `
      <img src="${item.url}" alt="${item.title}">
      ${playIcon}
      <div class="gallery-item-overlay">
        <div class="gallery-item-title">${item.title || 'Untitled'}</div>
        <div class="gallery-item-category">${item.category}</div>
      </div>
    `;

    // Simple click handler (could open a modal/lightbox in a real app)
    el.addEventListener('click', () => {
      window.open(item.url, '_blank');
    });

    grid.appendChild(el);
  });
}

// Initialize gallery on load
document.addEventListener('DOMContentLoaded', () => {
  initGallery();
});

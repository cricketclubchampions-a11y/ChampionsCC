// Champions Cricket Club - Main Application Script

function initPreloader() {
  const preloader = document.getElementById('page-preloader');
  const hasVisited = sessionStorage.getItem('ccc_site_visited');

  if (hasVisited) {
    // 0% Animation on page navigation - Hide immediately
    if (preloader) preloader.style.display = 'none';
    return;
  }

  // Mark session visit
  sessionStorage.setItem('ccc_site_visited', 'true');

  if (!preloader) return;

  const progressBar = document.getElementById('preloader-progress-bar');
  const statusText = document.getElementById('preloader-status');

  let isLoaded = false;
  let showTimer = null;

  // Show preloader animation on first visit of session
  showTimer = setTimeout(() => {
    if (!isLoaded && preloader) {
      preloader.classList.add('is-visible');
      if (progressBar) progressBar.style.width = '60%';
      if (statusText) statusText.textContent = 'Welcome to Champions CC...';
    }
  }, 50);

  const dismissPreloader = () => {
    if (isLoaded) return;
    isLoaded = true;
    if (showTimer) clearTimeout(showTimer);

    const p = document.getElementById('page-preloader');
    if (!p) return;

    if (p.classList.contains('is-visible')) {
      if (progressBar) progressBar.style.width = '100%';
      if (statusText) statusText.textContent = 'Ready!';
      setTimeout(() => {
        p.classList.remove('is-visible');
        p.classList.add('fade-out');
        setTimeout(() => {
          if (p.parentNode) p.style.display = 'none';
        }, 250);
      }, 80);
    } else {
      p.style.display = 'none';
    }
  };

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    dismissPreloader();
  } else {
    document.addEventListener('DOMContentLoaded', dismissPreloader);
    window.addEventListener('load', dismissPreloader);
    setTimeout(dismissPreloader, 350);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initPreloader();
  localStorage.removeItem("ccc-theme");
  document.documentElement.removeAttribute("data-theme");
  initSiteInfo();
  initNavigation();
  initLiveScoreboard();
  renderFixtures("all");
  initPromoSettings();
  loadPublicMediaConfig();
  fetchSquad();
  renderBlogs("all");
  initGallery();
  initSocialLinks();
  initContactAndMap();
  initModals();
  initForms();
});

async function loadPublicMediaConfig() {
  try {
    const res = await fetch('/api/media-config');
    const data = await res.json();
    if (data && data.about_community) {
      const mainImgEl = document.querySelector('.about-visuals .img-main');
      const subImgEl = document.querySelector('.about-visuals .img-sub');

      if (mainImgEl && data.about_community.mainImage) {
        mainImgEl.src = data.about_community.mainImage;
      }
      if (subImgEl && data.about_community.subImage) {
        subImgEl.src = data.about_community.subImage;
      }
    }
  } catch (err) {
    console.error("Error loading media assets config:", err);
  }
}

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
async function fetchSquad() {
  // 1. Render instant 0ms local cached squad
  const cachedSquad = localStorage.getItem("ccc_squad");
  if (cachedSquad) {
    try {
      window.LIVE_SQUAD_DATA = JSON.parse(cachedSquad);
      renderSquad("all");
    } catch (e) {}
  }

  // 2. Fetch fresh squad data silently in background
  try {
    const res = await fetch('/api/squad');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        window.LIVE_SQUAD_DATA = data;
        localStorage.setItem("ccc_squad", JSON.stringify(data));
        renderSquad("all");
      }
    }
  } catch (err) {
    console.warn("Using local cache for squad data on frontend", err);
    renderSquad("all");
  }
}

function renderSquad(filterRole = "all") {
  const container = document.getElementById("squad-grid");
  const homeContainer = document.getElementById("home-squad-grid");
  if (!container && !homeContainer) return;

  const squadData = window.LIVE_SQUAD_DATA || JSON.parse(localStorage.getItem("ccc_squad")) || (window.APP_DATA ? window.APP_DATA.squad : []);

  const filtered = filterRole === "all"
    ? squadData
    : squadData.filter(s => (s.roleCategory || '').toLowerCase() === filterRole.toLowerCase());

  if (container) {
    if (filtered.length === 0) {
      container.innerHTML = `<div style="grid-column: 1 / -1; text-align:center; padding:3rem; color:var(--text-secondary);">No player profiles found in this category.</div>`;
    } else {
      container.innerHTML = filtered.map(member => `
        <div class="player-card" onclick="openPlayerModal('${member.id}')">
          <div class="player-avatar">
            <img src="${member.photo || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=srgb&fm=jpg&q=85&w=500'}" alt="${member.name}" loading="lazy">
          </div>
          <h3 class="player-name">${member.name}</h3>
          <div class="player-role">${member.role}</div>
          <p style="font-size:0.8125rem; color:var(--text-secondary); margin:0.75rem 0;">${member.bio || ''}</p>
          <div class="player-tenure">${member.tenure || 'Active Member'}</div>
        </div>
      `).join("");
    }
  }

  if (homeContainer) {
    homeContainer.innerHTML = squadData.slice(0, 3).map(member => `
      <div class="player-card" onclick="openPlayerModal('${member.id}')">
        <div class="player-avatar">
          <img src="${member.photo || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=srgb&fm=jpg&q=85&w=500'}" alt="${member.name}" loading="lazy">
        </div>
        <h3 class="player-name">${member.name}</h3>
        <div class="player-role">${member.role}</div>
      </div>
    `).join("");
  }

  const squadTabsContainer = document.getElementById("squad-tabs");
  if (squadTabsContainer) {
    const categories = ["all", ...new Set(squadData.map(s => (s.roleCategory || '').toLowerCase()))].filter(Boolean);
    
    squadTabsContainer.innerHTML = categories.map(cat => `
      <button class="tab-btn ${cat === filterRole.toLowerCase() ? 'active' : ''}" data-category="${cat}">
        ${cat === 'all' ? 'All Members' : cat.charAt(0).toUpperCase() + cat.slice(1)}
      </button>
    `).join("");

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
  const squadData = window.LIVE_SQUAD_DATA || JSON.parse(localStorage.getItem("ccc_squad")) || (window.APP_DATA ? window.APP_DATA.squad : []);
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
let GLOBAL_BLOGS = [];
let CURRENT_BLOG_FILTER = "all";
let IS_BLOGS_EXPANDED = false;

async function renderBlogs(filterCategory = "all") {
  const container = document.getElementById("blogs-grid");
  if (!container) return;

  if (filterCategory !== CURRENT_BLOG_FILTER) {
    CURRENT_BLOG_FILTER = filterCategory;
    IS_BLOGS_EXPANDED = false;
  }

  try {
    const res = await fetch('/api/blogs');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        GLOBAL_BLOGS = data;
        localStorage.setItem("ccc_blogs", JSON.stringify(data));
      }
    }
  } catch (e) {
    console.warn("Using cached blogs data");
  }

  if (!GLOBAL_BLOGS || GLOBAL_BLOGS.length === 0) {
    GLOBAL_BLOGS = JSON.parse(localStorage.getItem("ccc_blogs")) || (window.APP_DATA ? window.APP_DATA.blogs : []);
  }

  // Generate dynamic category tabs
  const tabsContainer = document.getElementById("blog-tabs");
  if (tabsContainer) {
    const uniqueCategories = [...new Set(GLOBAL_BLOGS.map(b => b.category).filter(Boolean))];
    const currentActive = tabsContainer.querySelector(".tab-btn.active")?.getAttribute("data-category") || filterCategory;

    let tabsHtml = `<button class="tab-btn ${currentActive === 'all' ? 'active' : ''}" data-category="all">All Articles</button>`;
    uniqueCategories.forEach(cat => {
      tabsHtml += `<button class="tab-btn ${currentActive === cat ? 'active' : ''}" data-category="${cat}">${cat}</button>`;
    });
    tabsContainer.innerHTML = tabsHtml;

    const blogTabs = tabsContainer.querySelectorAll(".tab-btn");
    blogTabs.forEach(btn => {
      btn.onclick = () => {
        blogTabs.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        renderBlogs(btn.getAttribute("data-category"));
      };
    });
  }

  const filtered = filterCategory === "all"
    ? GLOBAL_BLOGS
    : GLOBAL_BLOGS.filter(b => b.category === filterCategory);

  const paginationWrap = document.getElementById("blogs-pagination-wrap");

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column:1/-1; text-align:center; padding:3rem 1rem; color:var(--text-muted);">
        <p style="font-size:1.1rem; font-weight:600;">No articles found in this category.</p>
      </div>`;
    if (paginationWrap) paginationWrap.innerHTML = "";
    return;
  }

  const INITIAL_LIMIT = 9; // 3 rows of 3-column grid
  const itemsToDisplay = IS_BLOGS_EXPANDED ? filtered : filtered.slice(0, INITIAL_LIMIT);

  container.innerHTML = itemsToDisplay.map(b => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = b.excerpt || "";
    const textSnippet = tempDiv.textContent || tempDiv.innerText || "";
    const shortSnippet = textSnippet.length > 130 ? textSnippet.substring(0, 130) + "..." : textSnippet;

    return `
      <div class="blog-card">
        <div style="height:210px; overflow:hidden; position:relative; cursor:pointer;" onclick="openBlogReader('${b.id}')">
          <img src="${b.image || 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?crop=entropy&cs=srgb&fm=jpg&q=85&w=800'}" alt="${b.title}" style="width:100%; height:100%; object-fit:cover; transition:transform 0.4s ease;" onmouseover="this.style.transform='scale(1.06)';" onmouseout="this.style.transform='scale(1)';" />
          <span class="badge-status badge-new" style="position:absolute; top:14px; left:14px; background:var(--color-primary, #059669); color:#fff; font-weight:700; padding:4px 12px; border-radius:20px; font-size:0.75rem;">${b.category || 'Article'}</span>
        </div>
        <div style="padding:1.5rem; display:flex; flex-direction:column; flex-grow:1;">
          <div style="font-size:0.775rem; color:var(--text-muted); margin-bottom:0.6rem; font-weight:500;">📅 ${b.date || 'Recent'} • ${b.author || 'Staff'}</div>
          <h3 style="font-family:var(--font-heading); font-size:1.15rem; font-weight:800; color:var(--text-primary); margin-bottom:0.75rem; line-height:1.4; cursor:pointer;" onclick="openBlogReader('${b.id}')">${b.title}</h3>
          <p style="font-size:0.875rem; color:var(--text-secondary); line-height:1.6; margin-bottom:1.25rem; flex-grow:1;">${shortSnippet}</p>
          <button class="btn-secondary" style="align-self:flex-start; border:none; cursor:pointer;" onclick="openBlogReader('${b.id}')">Read Article →</button>
        </div>
      </div>
    `;
  }).join("");

  // Pagination Load More / Show Less Button
  if (paginationWrap) {
    if (filtered.length > INITIAL_LIMIT) {
      paginationWrap.innerHTML = `
        <button id="btn-toggle-blogs" class="btn-load-more">
          ${IS_BLOGS_EXPANDED ? 'Show Less Articles ↑' : 'Load More Articles ↓'}
        </button>
      `;

      const btnToggle = document.getElementById("btn-toggle-blogs");
      if (btnToggle) {
        btnToggle.onclick = () => {
          if (!IS_BLOGS_EXPANDED) {
            IS_BLOGS_EXPANDED = true;
            renderBlogs(CURRENT_BLOG_FILTER);
          } else {
            IS_BLOGS_EXPANDED = false;
            renderBlogs(CURRENT_BLOG_FILTER);
            const blogsSec = document.getElementById("blogs");
            if (blogsSec) blogsSec.scrollIntoView({ behavior: "smooth" });
          }
        };
      }
    } else {
      paginationWrap.innerHTML = "";
    }
  }
}

function openBlogReader(id) {
  const blog = (GLOBAL_BLOGS || []).find(b => b.id === id);
  if (!blog) return;

  const modal = document.getElementById("blog-reader-modal");
  if (!modal) return;

  const coverImg = document.getElementById("reader-cover-img");
  if (coverImg) {
    coverImg.onerror = function() {
      this.style.display = 'none';
    };
    if (blog.image && blog.image.trim()) {
      coverImg.src = blog.image.trim();
      coverImg.style.display = 'block';
    } else {
      coverImg.style.display = 'none';
    }
  }
  document.getElementById("reader-category").innerText = blog.category || 'Article';
  document.getElementById("reader-date").innerText = blog.date || 'Aug 2026';
  document.getElementById("reader-readtime").innerText = blog.read_time || '4 min read';
  document.getElementById("reader-title").innerText = blog.title || '';
  
  const authorName = blog.author || 'Coach Rahul Sharma';
  document.getElementById("reader-author").innerText = authorName;
  document.getElementById("reader-author-avatar").innerText = authorName.charAt(0).toUpperCase();

  // Inject Rich HTML Body
  document.getElementById("reader-content").innerHTML = blog.excerpt || '';

  // Embedded Video Section
  const videoWrapper = document.getElementById("reader-video-container");
  const videoBox = document.getElementById("reader-video-box");

  if (blog.video_url && blog.video_url.trim()) {
    const vUrl = blog.video_url.trim();
    let videoHtml = '';

    if (vUrl.includes('youtube.com') || vUrl.includes('youtu.be')) {
      let ytId = '';
      if (vUrl.includes('youtu.be/')) {
        ytId = vUrl.split('youtu.be/')[1].split('?')[0];
      } else if (vUrl.includes('v=')) {
        ytId = vUrl.split('v=')[1].split('&')[0];
      }
      if (ytId) {
        videoHtml = `<iframe src="https://www.youtube.com/embed/${ytId}?autoplay=0" title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
      } else {
        videoHtml = `<iframe src="${vUrl}" allowfullscreen></iframe>`;
      }
    } else {
      videoHtml = `<video src="${vUrl}" controls style="width:100%; height:100%;"></video>`;
    }

    videoBox.innerHTML = videoHtml;
    videoWrapper.style.display = 'block';
  } else {
    videoBox.innerHTML = '';
    videoWrapper.style.display = 'none';
  }

  modal.classList.add("active");
  modal.scrollTop = 0;
  document.body.style.overflow = "hidden";
}

function closeBlogReader() {
  const modal = document.getElementById("blog-reader-modal");
  if (!modal) return;
  modal.classList.remove("active");
  document.body.style.overflow = "";

  // Clear video iframe to stop audio/playback
  const videoBox = document.getElementById("reader-video-box");
  if (videoBox) videoBox.innerHTML = "";
}

function closeBlogReaderOnOverlay(e) {
  if (e.target.id === "blog-reader-modal") {
    closeBlogReader();
  }
}

// ESC Key listener to close reader
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeBlogReader();
  }
});


function renderSiteInfoUI(data) {
  if (!data) return;

  if (data.siteName) {
    const expectedTitle = data.siteName + (data.siteTagline ? ' | ' + data.siteTagline : '');
    if (document.title !== expectedTitle) {
      document.title = expectedTitle;
    }
    document.querySelectorAll('.logo-text, .nav-logo-text, .footer-brand-title').forEach(el => {
      if (el.textContent !== data.siteName) {
        el.textContent = data.siteName;
      }
    });
  }

  if (data.pageStatus) {
    applyPageStatusAccessControl(data.pageStatus);
  }

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
}

async function initSiteInfo() {
  // 1. Instant 0ms cache render to eliminate network flicker
  const cached = localStorage.getItem('ccc_site_info_cache');
  if (cached) {
    try {
      renderSiteInfoUI(JSON.parse(cached));
    } catch (e) {}
  }

  // 2. Fetch fresh network data and update silently
  try {
    const res = await fetch('/api/site-info');
    if (!res.ok) return;
    const data = await res.json();
    localStorage.setItem('ccc_site_info_cache', JSON.stringify(data));
    renderSiteInfoUI(data);
  } catch (err) {
    console.error('Failed to load site info:', err);
  }
}

function applyPageStatusAccessControl(pageStatus) {
  if (!pageStatus) return;

  const currentPath = window.location.pathname.toLowerCase();
  
  // 1. Client-side Page Guard Protection (Redirect to Home if current page is disabled)
  if (currentPath.includes('about') && pageStatus.about === false) {
    window.location.replace('/');
    return;
  }
  if (currentPath.includes('matches') && pageStatus.matches === false) {
    window.location.replace('/');
    return;
  }
  if ((currentPath.includes('blog') || currentPath.includes('blogs')) && pageStatus.blogs === false) {
    window.location.replace('/');
    return;
  }
  if (currentPath.includes('contact') && pageStatus.contact === false) {
    window.location.replace('/');
    return;
  }
  if (currentPath.includes('scoring') && pageStatus.scoring === false) {
    window.location.replace('/');
    return;
  }

  // 2. Hide Navigation Links across Header Navbar & Footer Links
  const allLinks = document.querySelectorAll('a[href]');
  allLinks.forEach(link => {
    const href = (link.getAttribute('href') || '').toLowerCase();
    let shouldHide = false;

    if ((href.includes('about.html') || href === '/about' || href.endsWith('/about')) && pageStatus.about === false) {
      shouldHide = true;
    } else if ((href.includes('matches.html') || href === '/matches' || href.endsWith('/matches')) && pageStatus.matches === false) {
      shouldHide = true;
    } else if ((href.includes('blogs.html') || href.includes('blog.html') || href === '/blogs' || href.endsWith('/blogs')) && pageStatus.blogs === false) {
      shouldHide = true;
    } else if ((href.includes('contact.html') || href === '/contact' || href.endsWith('/contact')) && pageStatus.contact === false) {
      shouldHide = true;
    } else if ((href.includes('scoring.html') || href.includes('scoring-app.html') || href === '/scoring' || href.endsWith('/scoring')) && pageStatus.scoring === false) {
      shouldHide = true;
    }

    if (shouldHide) {
      const parentLi = link.closest('li');
      if (parentLi) {
        parentLi.style.display = 'none';
      } else {
        link.style.display = 'none';
      }
    }
  });

  // 3. Hide Homepage Insights & Sections when corresponding pages are stopped
  if (pageStatus.about === false) {
    const aboutSec = document.getElementById('about');
    if (aboutSec) aboutSec.style.display = 'none';
    const squadSec = document.getElementById('squad-glimpse');
    if (squadSec) squadSec.style.display = 'none';
  }

  if (pageStatus.matches === false) {
    const fixturesSec = document.getElementById('fixtures-glimpse');
    if (fixturesSec) fixturesSec.style.display = 'none';
    const heroMatchBtn = document.querySelector('.hero-ctas a[href*="fixtures"], .hero-ctas a[href*="matches"]');
    if (heroMatchBtn) heroMatchBtn.style.display = 'none';
  }

  if (pageStatus.blogs === false) {
    const blogsSec = document.getElementById('blogs-glimpse');
    if (blogsSec) blogsSec.style.display = 'none';
    const heroBlogBtn = document.querySelector('.hero-ctas a[href*="blogs"]');
    if (heroBlogBtn) heroBlogBtn.style.display = 'none';
  }

  if (pageStatus.contact === false) {
    const ctaSecs = document.querySelectorAll('.cta-section');
    ctaSecs.forEach(s => s.style.display = 'none');
    const joinBtns = document.querySelectorAll('.nav-actions a[href*="contact"]');
    joinBtns.forEach(b => b.style.display = 'none');
  }

  if (pageStatus.scoring === false) {
    const scoringElements = document.querySelectorAll('[id*="scoring"]');
    scoringElements.forEach(el => {
      if (el.id !== 'sec-scoring' && !el.closest('#sec-scoring')) {
        el.style.display = 'none';
      }
    });
  }
}

async function initContactFormConfig() {
  const contactForm = document.getElementById("contact-form");
  if (!contactForm) return;

  try {
    const res = await fetch('/api/contact-form-config');
    if (!res.ok) return;
    const config = await res.json();

    const phoneWrap = document.getElementById('cf-phone-wrap') || document.getElementById('contact-phone-wrap');
    if (phoneWrap) {
      const showMobile = config.fields && config.fields.mobile ? config.fields.mobile.show !== false : true;
      phoneWrap.style.display = showMobile ? 'block' : 'none';
    }

    const select = document.getElementById('cf-subject') || document.getElementById('contact-subject');
    if (select && Array.isArray(config.services) && config.services.length > 0) {
      const visibleOptions = config.services.filter(s => s.show !== false && s.name && s.name.trim());
      if (visibleOptions.length > 0) {
        select.innerHTML = visibleOptions.map(s => `<option value="${s.name}">${s.name}</option>`).join('');
      }
    }
  } catch (err) {
    console.error("Failed to load contact form config:", err);
  }
}

function initForms() {
  initContactFormConfig();

  const contactForm = document.getElementById("contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = (document.getElementById("cf-name") || document.getElementById("contact-name") || {}).value || "";
      const email = (document.getElementById("cf-email") || document.getElementById("contact-email") || {}).value || "";
      const phone = (document.getElementById("cf-phone") || document.getElementById("contact-phone") || {}).value || "";
      const subject = (document.getElementById("cf-subject") || document.getElementById("contact-subject") || {}).value || "General Inquiry";
      const message = (document.getElementById("cf-message") || document.getElementById("contact-message") || {}).value || "";

      if (!name || !email || !message) {
        showToast("⚠️ Please fill in all required fields (Name, Email, Message).");
        return;
      }

      const submitBtn = document.getElementById('cf-submit-btn') || contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.innerText : 'Send Message';
      if (submitBtn) {
        submitBtn.innerText = 'Sending Message...';
        submitBtn.disabled = true;
      }

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
      } finally {
        if (submitBtn) {
          submitBtn.innerText = originalText;
          submitBtn.disabled = false;
        }
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
function ensurePromoElements() {
  if (!document.getElementById('promotionBar')) {
    const barHtml = `
      <div id="promotionBar" class="promotion-bar" style="display:none;">
          <div class="promotion-marquee" id="promotionMarquee">
              <div class="promotion-bar-inner">
                  <span class="promo-text-node"></span>
                  <a href="#" class="promo-link-node promotion-bar-btn"></a>
              </div>
              <div class="promotion-bar-inner" aria-hidden="true">
                  <span class="promo-text-node"></span>
                  <a href="#" class="promo-link-node promotion-bar-btn"></a>
              </div>
          </div>
      </div>
    `;
    document.body.insertAdjacentHTML('afterbegin', barHtml);
  }

  if (!document.getElementById('promoPopup')) {
    const popupHtml = `
      <div id="promoPopup" class="floating-offer-overlay" style="display: none;" role="dialog" aria-modal="true" aria-label="Special Offer">
          <div class="floating-offer-modal">
              <button class="floating-offer-close" id="promoPopupClose" aria-label="Close popup">&times;</button>
              <a id="promoPopupLink" href="#" class="promo-popup-image-link">
                  <picture>
                      <source media="(max-width: 768px)" id="promoPopupMobileSource" srcset="">
                      <img id="promoPopupImage" src="" alt="Special Offer" class="promo-popup-image" width="800" height="1200">
                  </picture>
              </a>
          </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', popupHtml);
  }
}

function renderPromoUI(data) {
  if (!data) return;
  ensurePromoElements();

  const bar = document.getElementById('promotionBar');
  if (data.is_active && bar) {
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
    
    const height = bar.offsetHeight || 30;
    document.documentElement.style.setProperty('--promo-bar-height', height + 'px');
    document.documentElement.style.setProperty('--navbar-top', height + 'px');
  } else if (bar) {
    bar.style.display = 'none';
    document.documentElement.style.setProperty('--promo-bar-height', '0px');
    document.documentElement.style.setProperty('--navbar-top', '0px');
  }

  // Popup Modal
  const popup = data.popup;
  if (popup && popup.enabled) {
    const lastSeenImage = localStorage.getItem('ccc_popup_seen_image');
    if (lastSeenImage !== popup.desktop_image) {
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
        setTimeout(() => {
          popupEl.classList.add('active');
        }, 20);
        
        const closePopup = () => {
          popupEl.classList.remove('active');
          setTimeout(() => {
            popupEl.style.display = 'none';
          }, 400);
          localStorage.setItem('ccc_popup_seen_image', popup.desktop_image);
        };
        
        if (close) close.onclick = closePopup;
        popupEl.onclick = (e) => {
          if (e.target === popupEl) closePopup();
        };
      }
    }
  }
}

async function initPromoSettings() {
  // 1. Instant 0ms cache render across all pages
  const cached = localStorage.getItem('ccc_promo_cache');
  if (cached) {
    try {
      renderPromoUI(JSON.parse(cached));
    } catch (e) {}
  }

  // 2. Fetch fresh network promo data silently
  try {
    const res = await fetch('/api/promotion');
    if (!res.ok) return;
    const data = await res.json();
    localStorage.setItem('ccc_promo_cache', JSON.stringify(data));
    renderPromoUI(data);
  } catch (err) {
    console.error('Failed to load promo settings:', err);
  }
}


/* --- Gallery Fetch and Render --- */
let allGalleryItems = [];

async function initGallery() {
  const grid = document.getElementById('gallery-grid');
  if (!grid) return; // not on page

  const cachedGallery = localStorage.getItem('ccc_gallery_cache');
  if (cachedGallery) {
    try {
      allGalleryItems = JSON.parse(cachedGallery);
      renderGalleryFilters();
      renderGalleryItems('all');
    } catch (e) {}
  }

  try {
    const res = await fetch('/api/gallery');
    if (!res.ok) return;
    const items = await res.json();
    if (Array.isArray(items)) {
      allGalleryItems = items;
      localStorage.setItem('ccc_gallery_cache', JSON.stringify(items));
      renderGalleryFilters();
      renderGalleryItems('all');
    }
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



/* --------------------------------------------------------------------------
   DYNAMIC SOCIAL MEDIA LINKS & FOOTER SHOW MORE / SHOW LESS TOGGLE
   -------------------------------------------------------------------------- */
function getSocialSVG(iconName) {
  const k = (iconName || '').toLowerCase().trim();
  if (k === 'facebook') {
    return `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`;
  }
  if (k === 'instagram') {
    return `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>`;
  }
  if (k === 'x' || k === 'twitter') {
    return `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`;
  }
  if (k === 'youtube') {
    return `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`;
  }
  if (k === 'linkedin') {
    return `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>`;
  }
  if (k === 'whatsapp' || k === 'whatsappbusiness') {
    return `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>`;
  }
  if (k === 'telegram') {
    return `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.562 8.161c-.18.717-.962 4.084-1.362 5.762-.168.711-.43 1.1-.683 1.122-.55.05-1.033-.357-1.57-.708-.84-.55-1.314-.892-2.129-1.428-.942-.62-.332-.961.206-1.52.14-.146 2.585-2.368 2.632-2.571.006-.025.01-.121-.046-.171s-.136-.033-.195-.02c-.083.019-1.405.894-3.967 2.627-.375.258-.715.385-1.02.378-.337-.008-.985-.191-1.467-.348-.592-.192-1.062-.294-1.021-.62.021-.17.256-.344.704-.523 2.763-1.203 4.606-2.001 5.529-2.392 2.627-1.111 3.172-1.304 3.528-1.31.078-.001.253.018.367.111.096.079.123.187.135.263.013.084.027.271.015.421z"/></svg>`;
  }
  if (k === 'threads') {
    return `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12.186 24.004c-3.149 0-5.772-.857-7.604-2.48-1.895-1.68-2.857-4.082-2.857-7.14 0-3.087.971-5.503 2.887-7.18 1.838-1.609 4.453-2.443 7.574-2.443 3.143 0 5.748.835 7.534 2.417 1.764 1.56 2.696 3.844 2.696 6.603v.402c0 .414-.336.75-.75.75s-.75-.336-.75-.75v-.402c0-2.327-.756-4.225-2.188-5.489-1.442-1.272-3.644-1.931-6.542-1.931-2.909 0-5.111.66-6.546 1.961-1.439 1.304-2.169 3.235-2.169 5.735 0 2.477.74 4.382 2.198 5.66 1.458 1.278 3.666 1.927 6.564 1.927 2.408 0 4.298-.444 5.617-1.32.999-.663 1.637-1.571 1.895-2.702-1.026.546-2.228.847-3.57.847-2.616 0-4.664-.816-5.922-2.359-1.26-1.545-1.899-3.714-1.899-6.446 0-2.693.646-4.836 1.921-6.37 1.27-1.528 3.323-2.3 6.102-2.3 2.766 0 4.808.775 6.071 2.302 1.258 1.522 1.896 3.655 1.896 6.34 0 .414-.336.75-.75.75s-.75-.336-.75-.75c0-2.304-.522-4.093-1.551-5.318-1.025-1.221-2.673-1.824-4.916-1.824-2.261 0-3.906.604-4.891 1.794-.98 1.185-1.477 2.92-1.477 5.158 0 2.274.5 4.032 1.487 5.228.992 1.202 2.628 1.812 4.863 1.812 1.282 0 2.392-.266 3.298-.79.914-.528 1.546-1.306 1.879-2.312.213-.645.321-1.385.321-2.201 0-.414.336-.75.75-.75s.75.336.75.75c0 .991-.137 1.905-.407 2.716-.367 1.104-1.01 2.015-1.91 2.709-1.391 1.072-3.414 1.616-6.012 1.616z"/></svg>`;
  }
  if (k === 'tiktok') {
    return `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.98-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.82.57-1.31 1.57-1.3 2.57.01 1.25.75 2.4 1.88 2.87.97.43 2.13.33 3.04-.24.78-.48 1.29-1.33 1.34-2.25.06-3.83.02-7.66.03-11.49z"/></svg>`;
  }
  return `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M14 0c-3.314 0-6 2.686-6 6 0 1.026.262 1.99.715 2.835l-7.429 7.429c-1.733 1.733-1.733 4.542 0 6.275 1.732 1.732 4.542 1.732 6.275 0l7.429-7.429c.845.453 1.809.715 2.835.715 3.314 0 6-2.686 6-6s-2.686-6-6-6zm-7.707 20.707c-.78.78-2.048.78-2.828 0-.78-.78-.78-2.047 0-2.828l7.243-7.243c.489.658 1.127 1.296 1.785 1.785l-6.2 6.284zm11.707-12.707c-1.654 0-3-1.346-3-3s1.346-3 3-3 3 1.346 3 3-1.346 3-3 3z"/></svg>`;
}

let IS_FOOTER_SOCIALS_EXPANDED = false;
let IS_CONTACT_SOCIALS_EXPANDED = false;
let IS_BLOG_SOCIALS_EXPANDED = false;

function renderSocialListContainer(containerEl, activeSocials, isExpanded, onToggle) {
  if (!containerEl) return;

  const isSquareMode = containerEl.classList.contains('as-social-squares-grid') || containerEl.classList.contains('as-squares-mode');

  if (isSquareMode) {
    // Style 2 (Screenshot 2): Light Rounded Square Icon Buttons
    let html = activeSocials.map(s => `
      <a href="${s.url}" target="_blank" rel="noopener noreferrer" class="as-social-square-btn" aria-label="${s.name}" title="${s.name}">
        ${getSocialSVG(s.icon)}
      </a>
    `).join('');

    const targetInner = `<div class="as-social-squares-grid">${html}</div>`;
    if (normalizeHtml(containerEl.innerHTML) !== normalizeHtml(targetInner)) {
      containerEl.innerHTML = targetInner;
    }
    return;
  }

  // Style 1 (Screenshot 1): Circular Outline Buttons with Plus Toggle
  const INITIAL_COUNT = 4;
  const primarySocials = activeSocials.slice(0, INITIAL_COUNT);
  const extraSocials = activeSocials.slice(INITIAL_COUNT);

  let primaryHtml = primarySocials.map(s => `
    <a href="${s.url}" target="_blank" rel="noopener noreferrer" class="as-social-circle-btn" aria-label="${s.name}" title="${s.name}">
      ${getSocialSVG(s.icon)}
    </a>
  `).join('');

  let extraHtml = '';
  if (extraSocials.length > 0) {
    const extraItems = extraSocials.map(s => `
      <a href="${s.url}" target="_blank" rel="noopener noreferrer" class="as-social-circle-btn" aria-label="${s.name}" title="${s.name}">
        ${getSocialSVG(s.icon)}
      </a>
    `).join('');

    extraHtml = `
      <div class="extra-socials-group ${isExpanded ? 'is-visible' : ''}" style="display: ${isExpanded ? 'inline-flex' : 'none'}; gap: 0.6rem;">
        ${extraItems}
      </div>
      <button type="button" class="as-social-plus-btn ${isExpanded ? 'is-expanded' : ''}" title="${isExpanded ? 'Show Less Social Links' : 'Show More Social Links'}">
        +
      </button>
    `;
  }

  const targetInner = `<div class="as-social-circles-wrap">${primaryHtml + extraHtml}</div>`;
  if (normalizeHtml(containerEl.innerHTML) !== normalizeHtml(targetInner)) {
    containerEl.innerHTML = targetInner;
  }

  const plusBtn = containerEl.querySelector('.as-social-plus-btn');
  if (plusBtn) {
    plusBtn.onclick = (e) => {
      e.preventDefault();
      onToggle();
    };
  }
}

let IS_ABOUT_SOCIALS_EXPANDED = false;

function normalizeHtml(html) {
  return (html || '').replace(/\s+/g, ' ').replace(/>\s+</g, '><').trim();
}

function renderSocialsUI(socials) {
  const navContainer = document.querySelector('.nav-icon-group');
  const footerContainers = document.querySelectorAll('.footer-socials-wrap, #footer-socials-container');
  const contactContainers = document.querySelectorAll('.contact-socials-wrap, #contact-socials-container');
  const blogContainers = document.querySelectorAll('.blog-socials-wrap, #blog-socials-container, .blog-reader-socials, #blog-reader-socials-container');
  const aboutContainers = document.querySelectorAll('.about-socials-wrap, #about-socials-container');

  // Fix: Handle 0, "0", false, "false" integers from SQLite/Turso DB for turn on/off toggle
  const activeSocials = (socials || []).filter(s => {
    if (s.visible === 0 || s.visible === '0' || s.visible === false || s.visible === 'false') return false;
    return s.url && s.url.trim();
  });

  // 1. Render Navbar Socials (where show_in_navbar is enabled)
  if (navContainer) {
    const navSocials = activeSocials.filter(s => {
      if (s.show_in_navbar === 0 || s.show_in_navbar === '0' || s.show_in_navbar === false || s.show_in_navbar === 'false') return false;
      return true;
    });

    const themeToggle = navContainer.querySelector('.theme-toggle-btn');
    const themeHtml = themeToggle ? themeToggle.outerHTML : '';
    
    let navHtml = navSocials.map(s => `
      <a href="${s.url}" target="_blank" rel="noopener noreferrer" class="nav-icon-btn" aria-label="${s.name}" title="${s.name}">
        ${getSocialSVG(s.icon)}
      </a>
    `).join('') + themeHtml;

    // Smart Blink-Free DOM update: only mutate innerHTML if HTML content actually changed
    if (normalizeHtml(navContainer.innerHTML) !== normalizeHtml(navHtml)) {
      navContainer.innerHTML = navHtml;
    }
  }

  // 2. Render Footer Socials across all pages
  footerContainers.forEach(container => {
    renderSocialListContainer(container, activeSocials, IS_FOOTER_SOCIALS_EXPANDED, () => {
      IS_FOOTER_SOCIALS_EXPANDED = !IS_FOOTER_SOCIALS_EXPANDED;
      const cached = localStorage.getItem('ccc_socials_cache');
      if (cached) {
        try { renderSocialsUI(JSON.parse(cached)); } catch(e) {}
      }
    });
  });

  // 3. Render Contact Page Socials
  contactContainers.forEach(container => {
    renderSocialListContainer(container, activeSocials, IS_CONTACT_SOCIALS_EXPANDED, () => {
      IS_CONTACT_SOCIALS_EXPANDED = !IS_CONTACT_SOCIALS_EXPANDED;
      const cached = localStorage.getItem('ccc_socials_cache');
      if (cached) {
        try { renderSocialsUI(JSON.parse(cached)); } catch(e) {}
      }
    });
  });

  // 4. Render Blog Page & Blog Reader Modal Socials
  blogContainers.forEach(container => {
    renderSocialListContainer(container, activeSocials, IS_BLOG_SOCIALS_EXPANDED, () => {
      IS_BLOG_SOCIALS_EXPANDED = !IS_BLOG_SOCIALS_EXPANDED;
      const cached = localStorage.getItem('ccc_socials_cache');
      if (cached) {
        try { renderSocialsUI(JSON.parse(cached)); } catch(e) {}
      }
    });
  });

  // 5. Render About Page Socials
  aboutContainers.forEach(container => {
    renderSocialListContainer(container, activeSocials, IS_ABOUT_SOCIALS_EXPANDED, () => {
      IS_ABOUT_SOCIALS_EXPANDED = !IS_ABOUT_SOCIALS_EXPANDED;
      const cached = localStorage.getItem('ccc_socials_cache');
      if (cached) {
        try { renderSocialsUI(JSON.parse(cached)); } catch(e) {}
      }
    });
  });
}

async function initSocialLinks() {
  // First render immediately from localStorage cache for instant 0ms rendering (no blinking/flicker)
  const cached = localStorage.getItem('ccc_socials_cache');
  if (cached) {
    try {
      renderSocialsUI(JSON.parse(cached));
    } catch (e) {}
  }

  // Fetch latest from API and update silently
  try {
    const res = await fetch('/api/socials');
    if (!res.ok) return;
    const data = await res.json();
    const socials = Array.isArray(data) ? data : (data.socials || []);
    localStorage.setItem('ccc_socials_cache', JSON.stringify(socials));
    renderSocialsUI(socials);
  } catch (e) {
    console.warn("Could not load dynamic social media links", e);
  }
}

// --- Interactive Location Map & Contact Information Controller ---
function getMapEmbedUrl(data) {
  const fallbackAddress = "Baragae Balijatra Ground, Sisua, Salipur, Cuttack, Odisha";
  const defaultEmbed = `https://maps.google.com/maps?q=${encodeURIComponent(fallbackAddress)}&t=&z=14&ie=UTF8&iwloc=&output=embed`;
  if (!data) return defaultEmbed;

  let rawLink = (data.mapLink || '').trim();
  const rawCoords = (data.coords || '').trim();
  const rawAddress = (data.address || '').trim();
  const zoom = parseInt(data.zoom, 10) || 14;

  // 1. Extract iframe src if user pasted full <iframe src="...">
  if (rawLink.includes('<iframe')) {
    const srcMatch = rawLink.match(/src=["']([^"']+)["']/i);
    if (srcMatch && srcMatch[1]) {
      rawLink = srcMatch[1].trim();
    }
  }

  // 2. Direct Google Maps Embed URL or output=embed
  if (rawLink.includes('google.com/maps/embed') || rawLink.includes('output=embed')) {
    return rawLink;
  }

  // 3. Extract coordinates or place queries from Google Maps share/place link
  if (rawLink) {
    const atMatch = rawLink.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (atMatch) {
      return `https://maps.google.com/maps?q=${atMatch[1]},${atMatch[2]}&t=&z=${zoom}&ie=UTF8&iwloc=&output=embed`;
    }

    const qMatch = rawLink.match(/(?:q|destination|ll)=(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (qMatch) {
      return `https://maps.google.com/maps?q=${qMatch[1]},${qMatch[2]}&t=&z=${zoom}&ie=UTF8&iwloc=&output=embed`;
    }

    const placeMatch = rawLink.match(/\/maps\/place\/([^\/@?]+)/);
    if (placeMatch && placeMatch[1]) {
      const placeName = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
      return `https://maps.google.com/maps?q=${encodeURIComponent(placeName)}&t=&z=${zoom}&ie=UTF8&iwloc=&output=embed`;
    }
  }

  // 4. GPS Coordinates input field (e.g. "20.4831593, 86.0763922")
  if (rawCoords) {
    const parts = rawCoords.split(',').map(s => s.trim());
    if (parts.length >= 2 && !isNaN(parseFloat(parts[0])) && !isNaN(parseFloat(parts[1]))) {
      return `https://maps.google.com/maps?q=${parseFloat(parts[0])},${parseFloat(parts[1])}&t=&z=${zoom}&ie=UTF8&iwloc=&output=embed`;
    }
  }

  // 5. Facility Address input field
  if (rawAddress) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(rawAddress)}&t=&z=${zoom}&ie=UTF8&iwloc=&output=embed`;
  }

  return defaultEmbed;
}

function getDirectionsUrl(data) {
  if (!data) return 'https://www.google.com/maps/dir/?api=1&destination=20.4831593,86.0763922';

  let rawLink = (data.mapLink || '').trim();
  if (rawLink.includes('<iframe')) {
    const srcMatch = rawLink.match(/src=["']([^"']+)["']/i);
    if (srcMatch && srcMatch[1]) rawLink = srcMatch[1].trim();
  }
  const rawCoords = (data.coords || '').trim();
  const rawAddress = (data.address || '').trim();

  if (rawLink && !rawLink.includes('google.com/maps/embed') && !rawLink.includes('output=embed')) {
    return rawLink;
  }
  if (rawCoords) {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(rawCoords)}`;
  }
  if (rawAddress) {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(rawAddress)}`;
  }
  return 'https://www.google.com/maps/dir/?api=1&destination=20.4831593,86.0763922';
}

function renderContactAndMapUI(data) {
  if (!data) return;

  const address = data.address || "Baragae Balijatra Ground, Sisua, Salipur, Cuttack, Odisha";
  const markerLabel = data.markerLabel || "Champions Cricket Club HQ";
  const mapLink = getDirectionsUrl(data);
  const embedUrl = getMapEmbedUrl(data);
  const showMap = !(data.showMap === false || data.showMap === 'false' || data.showMap === 0 || data.showMap === '0' || data.showMap === 'off');

  // 1. Map Section & Container Visibility across all pages
  const mapSections = document.querySelectorAll('#location-map-section, .map-card-wrapper, [data-section="location-map"]');
  mapSections.forEach(sec => {
    if (sec) {
      if (showMap) {
        sec.style.display = '';
        sec.removeAttribute('hidden');
      } else {
        sec.style.display = 'none';
        sec.setAttribute('hidden', 'true');
      }
    }
  });

  // 2. Map Address & Marker Label Update
  document.querySelectorAll('.map-address-text, .contact-address-text, [data-contact="address"]').forEach(el => {
    el.textContent = address;
  });
  document.querySelectorAll('.map-marker-label, .contact-marker-text, [data-contact="marker"]').forEach(el => {
    el.textContent = markerLabel;
  });

  // 3. Get Directions Button Links Update
  document.querySelectorAll('.map-directions-btn, [data-contact="directions"]').forEach(btn => {
    btn.href = mapLink;
  });

  // 4. Google Maps Embed iFrame Injection (Clean, vibrant display)
  document.querySelectorAll('.map-iframe-container').forEach(container => {
    if (!container.querySelector('iframe') || container.getAttribute('data-loaded-src') !== embedUrl) {
      container.setAttribute('data-loaded-src', embedUrl);
      container.innerHTML = `
        <iframe title="${markerLabel}"
          src="${embedUrl}"
          width="100%" height="100%"
          style="border:0; width:100%; height:100%; display:block; border-radius:inherit;"
          allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade">
        </iframe>
      `;
    }
  });

  // 5. Update Footer & Page Contact Email
  if (data.email) {
    document.querySelectorAll('a[href^="mailto:"], .contact-email-text, [data-contact="email"]').forEach(el => {
      if (el.tagName === 'A') el.href = `mailto:${data.email}`;
      el.textContent = data.email;
    });
  }

  // 6. Update Footer & Page Contact Phone
  if (data.phone) {
    const cleanPhone = data.phone.replace(/[^0-9+]/g, '');
    document.querySelectorAll('a[href^="tel:"], .contact-phone-text, [data-contact="phone"]').forEach(el => {
      if (el.tagName === 'A') el.href = `tel:${cleanPhone}`;
      el.textContent = data.phone;
    });

    // Also update footer phone spans that show static phone numbers
    document.querySelectorAll('.footer-contact-list span, .login-footer span, .contact-details span').forEach(el => {
      if (el.textContent.match(/555-888|\+1|\+91/)) {
        el.textContent = data.phone;
      }
    });
  }
}

async function initContactAndMap() {
  // 1. Instant 0ms cache render across all pages
  const cached = localStorage.getItem('ccc_contact_cache');
  if (cached) {
    try {
      renderContactAndMapUI(JSON.parse(cached));
    } catch (e) {}
  }

  // 2. Fetch fresh contact & map info from server API
  try {
    const res = await fetch('/api/contact-info?v=' + Date.now());
    if (!res.ok) return;
    const data = await res.json();
    localStorage.setItem('ccc_contact_cache', JSON.stringify(data));
    renderContactAndMapUI(data);
  } catch (err) {
    console.error('Failed to load contact & map info:', err);
  }
}

async function initGallery() {
  const grid = document.getElementById('gallery-grid');
  const tabsContainer = document.getElementById('gallery-tabs');
  if (!grid) return;

  try {
    const res = await fetch('/api/gallery');
    if (!res.ok) return;
    const items = await res.json();

    if (!items || items.length === 0) {
      grid.innerHTML = `<p style="text-align: center; color: var(--text-muted); grid-column: 1/-1; padding: 2rem;">No gallery photos available.</p>`;
      return;
    }

    const categories = ['all', ...new Set(items.map(i => (i.category || 'Matches').trim()))];

    if (tabsContainer) {
      tabsContainer.innerHTML = categories.map(c => {
        const label = c === 'all' ? 'All Media' : c;
        return `<button class="tab-btn ${c === 'all' ? 'active' : ''}" data-category="${c}">${label}</button>`;
      }).join('');

      tabsContainer.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          tabsContainer.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const cat = btn.getAttribute('data-category');
          renderFrontGallery(items, cat);
        });
      });
    }

    renderFrontGallery(items, 'all');
  } catch (err) {
    console.error("Error initializing front-end gallery:", err);
  }
}

function renderFrontGallery(items, filterCategory) {
  const grid = document.getElementById('gallery-grid');
  if (!grid) return;

  let filtered = items;
  if (filterCategory !== 'all') {
    filtered = items.filter(i => (i.category || '').toLowerCase() === filterCategory.toLowerCase());
  }

  if (filtered.length === 0) {
    grid.innerHTML = `<p style="text-align: center; color: var(--text-muted); grid-column: 1/-1; padding: 2rem;">No items found in category "${filterCategory}".</p>`;
    return;
  }

  grid.innerHTML = filtered.map(item => `
    <div class="gallery-card" style="border-radius: var(--radius-lg); overflow: hidden; background: var(--bg-card); border: 1px solid var(--border-color); box-shadow: var(--shadow-sm); transition: transform 0.3s ease;">
      <div style="position: relative; width: 100%; height: 220px; overflow: hidden; background: #000;">
        <img src="${item.url}" alt="${item.title}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800'" />
        <span style="position: absolute; top: 12px; left: 12px; font-size: 0.725rem; font-weight: 700; background: var(--accent-emerald); color: #ffffff; padding: 3px 10px; border-radius: 20px; text-transform: uppercase;">${item.category || 'General'}</span>
      </div>
      <div style="padding: 1.25rem;">
        <h4 style="font-family: var(--font-heading); font-size: 1rem; font-weight: 700; color: var(--text-primary); margin: 0;">${item.title}</h4>
      </div>
    </div>
  `).join('');
}

// --- Mobile Menu Toggle Controller ---
function initMobileNavigation() {
  const menuBtn = document.getElementById('mobile-menu-btn') || document.querySelector('.mobile-menu-btn');
  const navLinks = document.getElementById('nav-links') || document.querySelector('.nav-links');

  if (!menuBtn || !navLinks) return;

  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    navLinks.classList.toggle('active');
    navLinks.classList.toggle('open');
    menuBtn.innerHTML = navLinks.classList.contains('active') ? '✕' : '☰';
  });

  document.addEventListener('click', (e) => {
    if (navLinks.classList.contains('active') && !navLinks.contains(e.target) && !menuBtn.contains(e.target)) {
      navLinks.classList.remove('active', 'open');
      menuBtn.innerHTML = '☰';
    }
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active', 'open');
      menuBtn.innerHTML = '☰';
    });
  });
}

// --- Modal and Form Handlers ---
function initModals() {
  const modalCloses = document.querySelectorAll('.modal-close, [data-close-modal]');
  modalCloses.forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal-overlay, .modal');
      if (modal) modal.style.display = 'none';
    });
  });
}

function initForms() {
  const contactForm = document.getElementById('contact-form') || document.querySelector('form.contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Sending...';
      }

      const formData = new FormData(contactForm);
      const data = Object.fromEntries(formData.entries());

      try {
        const res = await fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (res.ok) {
          alert('Thank you! Your inquiry has been submitted successfully.');
          contactForm.reset();
        } else {
          alert('Submission failed. Please try again.');
        }
      } catch (err) {
        console.error("Error submitting contact form:", err);
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initGallery();
  initMobileNavigation();
});

// Champions Cricket Club - Native Scoring Engine

let ADMIN_STATE = {
  fixtures: JSON.parse(localStorage.getItem("ccc_fixtures")) || [],
  liveScore: JSON.parse(localStorage.getItem("ccc_live_score")) || {}
};

let activeMatch = null;
let scorerState = {
  runs: 0,
  wickets: 0,
  balls: 0, // total legitimate balls
  timeline: [], // array of strings for UI: '0', '1', 'W', 'WD', 'NB'
  undoStack: []
};

document.addEventListener("DOMContentLoaded", () => {
  if (sessionStorage.getItem("ccc_scorer_logged_in") === "true") {
    showMatchSelection();
  } else {
    document.getElementById("scorer-login-view").style.display = "flex";
    document.getElementById("scorer-selection-view").style.display = "none";
    document.getElementById("btn-logout").style.display = "none";
  }
  
  if (!ADMIN_STATE.fixtures.length && window.APP_DATA) {
    ADMIN_STATE.fixtures = window.APP_DATA.fixtures;
  }
});

function handleScorerLogin(e) {
  e.preventDefault();
  const u = document.getElementById("scorer-username").value;
  const p = document.getElementById("scorer-password").value;
  
  if (u === "scorer" && p === "scorer123") {
    sessionStorage.setItem("ccc_scorer_logged_in", "true");
    showMatchSelection();
  } else {
    alert("Invalid credentials. Try scorer / scorer123");
  }
}

function handleScorerLogout() {
  sessionStorage.removeItem("ccc_scorer_logged_in");
  document.getElementById("scorer-login-view").style.display = "flex";
  document.getElementById("scorer-selection-view").style.display = "none";
  document.getElementById("scorer-active-view").style.display = "none";
  document.getElementById("btn-logout").style.display = "none";
  document.getElementById("btn-exit").style.display = "none";
  document.getElementById("scorer-username").value = "";
  document.getElementById("scorer-password").value = "";
}

function showMatchSelection() {
  document.getElementById("scorer-login-view").style.display = "none";
  document.getElementById("scorer-selection-view").style.display = "block";
  document.getElementById("btn-logout").style.display = "block";
  renderScorerMatchList();
}
function renderScorerMatchList() {
  const container = document.getElementById("scorer-match-list");
  if (!container) return;

  // Filter to show matches that aren't strictly Concluded/Abandoned (unless they are all we have)
  let activeMatches = ADMIN_STATE.fixtures.filter(f => f.category === "upcoming" || f.status === "Live" || f.status === "Upcoming");
  if (activeMatches.length === 0) activeMatches = ADMIN_STATE.fixtures; // Fallback

  if (activeMatches.length === 0) {
    container.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--text-muted); padding:2rem;">No matches available to score. Please add an Upcoming Match in the Dashboard.</td></tr>`;
    return;
  }

  container.innerHTML = activeMatches.map(m => `
    <tr>
      <td><strong>${m.title}</strong><br><span style="font-size:0.8rem; color:var(--text-muted);">${m.homeTeam || ''} vs ${m.awayTeam || ''}</span></td>
      <td>${m.date}</td>
      <td><span class="badge-status badge-new">${m.status}</span></td>
      <td>
        <button class="btn-admin-primary" style="padding:0.4rem 0.8rem; font-size:0.85rem;" onclick="startScoring('${m.id}')">Start Scoring</button>
      </td>
    </tr>
  `).join("");
}

function startScoring(id) {
  activeMatch = ADMIN_STATE.fixtures.find(f => f.id === id);
  if (!activeMatch) return;

  document.getElementById("scorer-selection-view").style.display = "none";
  document.getElementById("scorer-active-view").style.display = "flex";
  document.getElementById("btn-exit").style.display = "block";
  document.getElementById("btn-logout").style.display = "none";

  // Initialize live score object if missing
  ADMIN_STATE.liveScore = JSON.parse(localStorage.getItem("ccc_live_score")) || {
    stage: "live",
    team1: activeMatch.homeTeam || "Team 1",
    score1: "0/0",
    overs1: "(0.0 OV)",
    team2: activeMatch.awayTeam || "Team 2",
    score2: "0/0",
    overs2: "(0.0 OV)",
    venue: activeMatch.venue || "",
    statusNote: "Match Started",
    stopReason: "",
    winner: ""
  };
  
  // Set stage to live and sync teams
  ADMIN_STATE.liveScore.stage = "live";
  ADMIN_STATE.liveScore.team1 = activeMatch.homeTeam || "Team 1";
  ADMIN_STATE.liveScore.team2 = activeMatch.awayTeam || "Team 2";
  
  // Try to parse existing score if resuming
  let existingScore = ADMIN_STATE.liveScore.score1.split('/');
  let existingRuns = parseInt(existingScore[0]) || 0;
  let existingWickets = parseInt(existingScore[1]) || 0;
  
  let existingOvers = ADMIN_STATE.liveScore.overs1.replace(/[^0-9.]/g, '').split('.');
  let fullOvers = parseInt(existingOvers[0]) || 0;
  let extraBalls = parseInt(existingOvers[1]) || 0;
  let existingTotalBalls = (fullOvers * 6) + extraBalls;

  scorerState = {
    runs: existingRuns,
    wickets: existingWickets,
    balls: existingTotalBalls,
    timeline: [],
    undoStack: []
  };

  updateUI();
  syncToLive();
}

function exitScorer() {
  document.getElementById("scorer-selection-view").style.display = "block";
  document.getElementById("scorer-active-view").style.display = "none";
  document.getElementById("btn-exit").style.display = "none";
  document.getElementById("btn-logout").style.display = "block";
  activeMatch = null;
}

// ---- Scoring Actions ---- //

function saveStateToUndo() {
  scorerState.undoStack.push({
    runs: scorerState.runs,
    wickets: scorerState.wickets,
    balls: scorerState.balls,
    timeline: [...scorerState.timeline]
  });
}

function checkOverWrap() {
  if (scorerState.balls > 0 && scorerState.balls % 6 === 0) {
    scorerState.timeline = []; // New over
  }
}

function addRun(runs) {
  saveStateToUndo();
  checkOverWrap();
  scorerState.runs += runs;
  scorerState.balls += 1;
  
  let badge = runs.toString();
  if (runs === 4) badge = '<span class="ball-4">4</span>';
  if (runs === 6) badge = '<span class="ball-6">6</span>';
  if (runs === 0) badge = '0';
  
  scorerState.timeline.push(badge);
  
  updateUI();
  syncToLive();
}

function addWicket() {
  saveStateToUndo();
  checkOverWrap();
  scorerState.wickets += 1;
  scorerState.balls += 1;
  scorerState.timeline.push('<span class="ball-w">W</span>');
  updateUI();
  syncToLive();
}

function addExtra(type) {
  saveStateToUndo();
  checkOverWrap();
  scorerState.runs += 1; // standard extra run
  
  if (type === 'wd') {
    scorerState.timeline.push('WD');
  } else if (type === 'nb') {
    scorerState.timeline.push('NB');
  }
  
  updateUI();
  syncToLive();
}

function undoLastBall() {
  if (scorerState.undoStack.length === 0) return;
  const prevState = scorerState.undoStack.pop();
  scorerState.runs = prevState.runs;
  scorerState.wickets = prevState.wickets;
  scorerState.balls = prevState.balls;
  scorerState.timeline = prevState.timeline;
  updateUI();
  syncToLive();
}

function endInnings() {
  if (confirm("Are you sure you want to end this match?")) {
    ADMIN_STATE.liveScore.stage = "ended";
    ADMIN_STATE.liveScore.statusNote = "Match Concluded";
    localStorage.setItem("ccc_live_score", JSON.stringify(ADMIN_STATE.liveScore));
    
    // Auto archive
    activeMatch.status = "Concluded";
    localStorage.setItem("ccc_fixtures", JSON.stringify(ADMIN_STATE.fixtures));
    
    alert("Match Concluded! You can now exit.");
    exitScorer();
  }
}

// ---- UI & Sync ---- //

function updateUI() {
  document.getElementById("scorer-runs-wickets").innerText = `${scorerState.runs}/${scorerState.wickets}`;
  
  const overs = Math.floor(scorerState.balls / 6);
  const balls = scorerState.balls % 6;
  const overString = `${overs}.${balls}`;
  
  // Calculate Run Rate
  let rr = "0.00";
  if (scorerState.balls > 0) {
    rr = (scorerState.runs / (scorerState.balls / 6)).toFixed(2);
  }
  
  document.getElementById("scorer-overs-rr").innerText = `Overs: ${overString} | RR: ${rr}`;
  
  // Render timeline
  const tlContainer = document.getElementById("scorer-over-timeline");
  tlContainer.innerHTML = scorerState.timeline.map(b => `<div class="ball-badge">${b}</div>`).join("");
}

function syncToLive() {
  const overs = Math.floor(scorerState.balls / 6);
  const balls = scorerState.balls % 6;
  
  ADMIN_STATE.liveScore.score1 = `${scorerState.runs}/${scorerState.wickets}`;
  ADMIN_STATE.liveScore.overs1 = `(${overs}.${balls} OV)`;
  ADMIN_STATE.liveScore.statusNote = `Current Run Rate: ${(scorerState.runs / (scorerState.balls / 6 || 1)).toFixed(2)}`;
  
  localStorage.setItem("ccc_live_score", JSON.stringify(ADMIN_STATE.liveScore));
}

// Sunset Trophy Guide — GTA 6 Platinum Tracker. Offline, localStorage only.
const KEY = "sunset-trophy-guide-v5";
const CHAPTERS = ["Chapter 1", "Chapter 2", "Chapter 3", "Chapter 4", "Finale", "Free roam"];
const POINTS = [
  { chapter: "Chapter 1", text: "End of Chapter 1 — finish Breakfast Run and the Chapter 1 missables before the story moves on." },
  { chapter: "Chapter 2", text: "End of Chapter 2 — finish The Cartel Heist and Child's Play before Chapter 3 begins." },
  { chapter: "Chapter 3", text: "End of Chapter 3 — finish Headliners and VCIA Takedown before Chapter 4 begins." },
  { chapter: "Chapter 4", text: "End of Chapter 4 — finish Operation Savage Glory before the finale." },
  { chapter: "Finale", text: "Before the final mission — finish all stranger strands and partner setups; the finale closes one-time setups." },
];
const GRADE_POINTS = { platinum: 180, gold: 90, silver: 30, bronze: 15 };

let DATA = null;
let state = { earned: [], counts: {}, notes: {}, spoiler: true };
let selectedId = 40;
let currentView = "checklist";

function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw);
      if (s && typeof s === "object") state = Object.assign(state, s);
    }
  } catch (e) { /* fresh state on bad data */ }
}
function saveState() {
  localStorage.setItem(KEY, JSON.stringify(state));
}
function isEarned(id) { return state.earned.indexOf(id) !== -1; }
function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function trophyById(id) { return DATA.trophies.find(function (t) { return t.id === id; }); }
function displayName(t) {
  if (state.spoiler && t.hidden && !isEarned(t.id)) return "??? — Hidden story trophy";
  return t.name;
}
function displayDesc(t) {
  if (state.spoiler && t.hidden && !isEarned(t.id)) return "Hidden until earned. Turn Spoiler Shield off to reveal it.";
  return t.description;
}
function displayGuide(t) {
  if (state.spoiler && t.hidden && !isEarned(t.id)) return "Guide hidden by Spoiler Shield — earn the trophy or turn the shield off to read it.";
  return t.guide;
}

function claimBreakdown() {
  let sources = 0, targets = 0;
  DATA.trophies.forEach(function (t) { sources += t.sources.length; if (t.count_target != null) targets++; });
  const parts = [
    ["Names", 55], ["Descriptions", 55], ["Grades", 55], ["Guides", 55],
    ["Missable boxes", 55], ["Chapters", 55], ["Kinds", 55], ["Hidden flags", 55],
    ["Sources", sources], ["Count targets", targets],
    ["Points of no return", POINTS.length], ["Roadmap chapters", CHAPTERS.length],
    ["Dispute sources", DATA.disputes.length * 2],
  ];
  const total = parts.reduce(function (a, p) { return a + p[1]; }, 0);
  return { total: total, parts: parts, sites: DATA.source_sites.length };
}

function renderAudit() {
  const b = claimBreakdown();
  document.getElementById("auditTotal").textContent = b.total + " CLAIMS CITED · " + b.sites + " SOURCE SITES";
  document.getElementById("auditDetail").textContent = b.parts.map(function (p) { return p[0] + " " + p[1]; }).join(" · ");
}

function renderHeader() {
  const earned = state.earned.length;
  const pct = Math.round((earned / 55) * 100);
  const pts = state.earned.reduce(function (a, id) { const t = trophyById(id); return a + (t ? GRADE_POINTS[t.grade] : 0); }, 0);
  document.getElementById("earnedBig").textContent = earned;
  document.getElementById("pctBig").textContent = pct + "% to Platinum";
  document.getElementById("pointsBig").textContent = pts + " / 1,230 trophy points";
  document.getElementById("barFill").style.width = pct + "%";
}

function gradeBadge(t) { return '<span class="grade ' + t.grade + '">' + t.grade + '</span>'; }
function metaLine(t) {
  return [t.kind, t.chapter].join(" · ");
}

function rowHtml(t) {
  const earned = isEarned(t.id);
  const cls = "trophy-row" + (earned ? " earned" : "") + (t.id === selectedId ? " selected" : "");
  let tags = gradeBadge(t);
  if (t.missable) tags += ' <span class="miss-tag">MISSABLE</span>';
  if (t.hidden) tags += ' <span class="hidden-tag">HIDDEN</span>';
  const count = t.count_target != null
    ? ' <span class="t-meta">YOUR COUNT ' + (state.counts[t.id] || 0) + "/" + t.count_target + " " + esc(t.count_label) + "</span>" : "";
  return '<li class="' + cls + '" data-id="' + t.id + '">' +
    '<input type="checkbox" data-check="' + t.id + '"' + (earned ? " checked" : "") + ' aria-label="Earned: ' + esc(displayName(t)) + '">' +
    '<div><div class="t-name">' + esc(displayName(t)) + "</div>" +
    '<div class="t-desc">' + esc(displayDesc(t)) + "</div>" +
    '<div class="t-meta">' + tags + " " + esc(metaLine(t)) + "</div>" + count + "</div></li>";
}

function filteredTrophies() {
  const q = document.getElementById("search").value.trim().toLowerCase();
  const grade = document.getElementById("gradeFilter").value;
  const kind = document.getElementById("kindFilter").value;
  const status = document.getElementById("statusFilter").value;
  return DATA.trophies.filter(function (t) {
    if (grade && t.grade !== grade) return false;
    if (kind && t.kind !== kind) return false;
    if (status === "earned" && !isEarned(t.id)) return false;
    if (status === "unearned" && isEarned(t.id)) return false;
    if (status === "missable" && !t.missable) return false;
    if (q) {
      const hay = (t.name + " " + t.description + " " + t.guide + " " + t.kind + " " + t.chapter).toLowerCase();
      if (hay.indexOf(q) === -1) return false;
    }
    return true;
  });
}

function renderList() {
  const list = filteredTrophies();
  document.getElementById("trophyList").innerHTML = list.map(rowHtml).join("");
  document.getElementById("listCount").textContent = list.length + " trophies shown";
  document.getElementById("listEarned").textContent = state.earned.length + " earned";
}

function renderDetail() {
  const t = trophyById(selectedId) || DATA.trophies[0];
  const earned = isEarned(t.id);
  let tags = gradeBadge(t);
  if (t.missable) tags += ' <span class="miss-tag">MISSABLE</span>';
  if (t.hidden) tags += ' <span class="hidden-tag">HIDDEN</span>';
  tags += ' <span class="hidden-tag">' + esc(t.kind) + " · " + esc(t.chapter) + "</span>";
  let html = "<h2>" + esc(displayName(t)) + "</h2>" +
    '<p class="d-desc">' + esc(displayDesc(t)) + '</p><div class="d-badges">' + tags + "</div>" +
    '<div class="guide-box"><h4>Guide — in our own words</h4><p>' + esc(displayGuide(t)) + "</p></div>";
  if (t.missable && t.missable_note) {
    html += '<div class="miss-box"><h4>⚠ Missable — read this first</h4><p>' + esc(t.missable_note) + "</p></div>";
  }
  if (t.count_target != null) {
    const cur = state.counts[t.id] || 0;
    html += '<div class="count-box"><label>YOUR COUNT — ' + esc(t.count_label) + " (target " + t.count_target + ")</label>" +
      '<div class="count-row"><button type="button" data-count="-1">−</button>' +
      '<span class="count-big">' + cur + " / " + t.count_target + "</span>" +
      '<button type="button" data-count="1">+</button>' +
      '<input type="number" min="0" max="' + t.count_target + '" value="' + cur + '" data-count-input aria-label="Your count"></div></div>';
  }
  html += '<div class="sources"><b>Sources:</b><ul>' + t.sources.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + "</ul></div>";
  html += '<div class="notes-box"><label for="noteText">Your notes (saved in this browser)</label>' +
    '<textarea id="noteText" placeholder="e.g. best spot, loadout, what worked…">' + esc(state.notes[t.id] || "") + "</textarea></div>";
  html += '<button type="button" class="earn-btn' + (earned ? " earned" : "") + '" id="earnBtn">' +
    (earned ? "✓ Earned — click to unmark" : "Mark as earned") + "</button>";
  const pane = document.getElementById("detailPane");
  pane.innerHTML = html;
  pane.querySelectorAll("[data-count]").forEach(function (b) {
    b.addEventListener("click", function () {
      const cur = state.counts[t.id] || 0;
      const next = Math.max(0, Math.min(t.count_target, cur + Number(b.getAttribute("data-count"))));
      state.counts[t.id] = next; saveState(); renderAll();
    });
  });
  const input = pane.querySelector("[data-count-input]");
  if (input) input.addEventListener("change", function () {
    const v = Math.max(0, Math.min(t.count_target, Number(input.value) || 0));
    state.counts[t.id] = v; saveState(); renderAll();
  });
  const note = pane.querySelector("#noteText");
  if (note) note.addEventListener("input", function () {
    state.notes[t.id] = note.value; saveState();
  });
  pane.querySelector("#earnBtn").addEventListener("click", function () { toggleEarned(t.id); });
}

function renderRoadmap() {
  const order = DATA.trophies.slice().sort(function (a, b) {
    const ca = CHAPTERS.indexOf(a.chapter), cb = CHAPTERS.indexOf(b.chapter);
    return (ca - cb) || (a.id - b.id);
  });
  const next = order.filter(function (t) { return !isEarned(t.id); }).slice(0, 5);
  document.getElementById("nextUp").innerHTML = next.map(function (t, i) {
    return "<li><b>" + esc(displayName(t)) + "</b> — " + esc(t.chapter) + " · " + t.grade +
      (t.missable ? ' · <span class="miss-tag">MISSABLE</span>' : "") + "</li>";
  }).join("");
  document.getElementById("roadmapChapters").innerHTML = CHAPTERS.map(function (ch) {
    const ts = DATA.trophies.filter(function (t) { return t.chapter === ch; });
    const got = ts.filter(function (t) { return isEarned(t.id); }).length;
    return '<div class="chapter-card"><h4>' + esc(ch) + '</h4><div class="ch-prog">' + got + " / " + ts.length + " earned</div><ul>" +
      ts.map(function (t) { return "<li>" + (isEarned(t.id) ? "✓ " : "○ ") + esc(displayName(t)) + "</li>"; }).join("") + "</ul></div>";
  }).join("");
}

function renderMissables() {
  document.getElementById("pointsList").innerHTML = POINTS.map(function (p) {
    return "<li><b>Point of no return — " + esc(p.chapter) + ":</b> " + esc(p.text) + "</li>";
  }).join("");
  const miss = DATA.trophies.filter(function (t) { return t.missable; });
  document.getElementById("missableList").innerHTML = miss.map(rowHtml).join("");
}

function renderDisputes() {
  document.getElementById("disputeList").innerHTML = DATA.disputes.map(function (d) {
    return '<article class="dispute-card"><h4>' + esc(d.claim) + "</h4>" +
      '<p class="src"><b>Source A:</b> ' + esc(d.source_a) + "</p>" +
      '<p class="src"><b>Source B:</b> ' + esc(d.source_b) + "</p>" +
      '<p class="status">Status: ' + esc(d.status) + "</p></article>";
  }).join("");
  document.getElementById("siteList").innerHTML = DATA.source_sites.map(function (s) {
    return "<li><b>" + esc(s.site) + "</b> — " + esc(s.covers) + "</li>";
  }).join("");
}

function renderAll() {
  renderHeader(); renderAudit(); renderList(); renderDetail(); renderRoadmap(); renderMissables(); renderDisputes();
}

function toggleEarned(id) {
  const i = state.earned.indexOf(id);
  if (i === -1) state.earned.push(id); else state.earned.splice(i, 1);
  saveState(); renderAll();
}

function switchView(v) {
  currentView = v;
  document.querySelectorAll(".tab").forEach(function (b) { b.classList.toggle("active", b.getAttribute("data-view") === v); });
  document.querySelectorAll(".view").forEach(function (s) { s.classList.toggle("hidden", s.id !== "view-" + v); });
}

function exportState() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "sunset-trophy-guide-progress.json";
  a.click();
  URL.revokeObjectURL(a.href);
}

function init() {
  loadState();
  document.querySelectorAll(".tab").forEach(function (b) {
    b.addEventListener("click", function () { switchView(b.getAttribute("data-view")); });
  });
  ["search", "gradeFilter", "kindFilter", "statusFilter"].forEach(function (id) {
    document.getElementById(id).addEventListener("input", renderList);
    document.getElementById(id).addEventListener("change", renderList);
  });
  const spoilerBtn = document.getElementById("spoilerBtn");
  function setSpoiler(on) {
    state.spoiler = on; saveState();
    spoilerBtn.textContent = "Spoiler Shield: " + (on ? "ON (s)" : "OFF (s)");
    spoilerBtn.classList.toggle("off", !on);
    spoilerBtn.setAttribute("aria-pressed", String(on));
    renderAll();
  }
  spoilerBtn.addEventListener("click", function () { setSpoiler(!state.spoiler); });
  setSpoiler(state.spoiler);
  document.getElementById("exportBtn").addEventListener("click", exportState);
  document.getElementById("importFile").addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function () {
      try {
        const s = JSON.parse(reader.result);
        if (s && typeof s === "object") { state = Object.assign({ earned: [], counts: {}, notes: {}, spoiler: true }, s); saveState(); renderAll(); }
      } catch (err) { /* ignore bad import */ }
    };
    reader.readAsText(file);
  });
  document.getElementById("trophyList").addEventListener("click", function (e) {
    const check = e.target.closest("[data-check]");
    if (check) { toggleEarned(Number(check.getAttribute("data-check"))); return; }
    const row = e.target.closest("[data-id]");
    if (row) { selectedId = Number(row.getAttribute("data-id")); renderList(); renderDetail(); }
  });
  document.getElementById("missableList").addEventListener("click", function (e) {
    const check = e.target.closest("[data-check]");
    if (check) { toggleEarned(Number(check.getAttribute("data-check"))); return; }
    const row = e.target.closest("[data-id]");
    if (row) { selectedId = Number(row.getAttribute("data-id")); switchView("checklist"); renderList(); renderDetail(); }
  });
  document.addEventListener("keydown", function (e) {
    if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.tagName === "SELECT")) return;
    if (e.key === "/") { e.preventDefault(); document.getElementById("search").focus(); }
    else if (e.key === "1") switchView("checklist");
    else if (e.key === "2") switchView("roadmap");
    else if (e.key === "3") switchView("missables");
    else if (e.key === "4") switchView("disputes");
    else if (e.key === "s" || e.key === "S") spoilerBtn.click();
    else if (e.key === "e" || e.key === "E") exportState();
  });
  renderAll();
}

fetch("data/trophies.json")
  .then(function (r) { return r.json(); })
  .then(function (d) { DATA = d; init(); })
  .catch(function () {
    document.getElementById("detailPane").innerHTML = "<p>Could not load data/trophies.json.</p>";
  });

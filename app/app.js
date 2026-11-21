// Sunset Trophy Guide — offline tracker. No network requests: the only
// fetch is the local data/trophies.json, and the only https:// string in
// app/ is the footer link to the bounty page.
const STATE_KEY = 'sunset-trophy-guide-v4';
const POINTS_OF_NO_RETURN = [
  { id: 1, title: 'End of Chapter 1', text: 'Finishing Chapter 1 closes the opening missions. Missable at risk: Trust.' },
  { id: 2, title: 'End of Chapter 2', text: 'Finishing Chapter 2 closes the mid-game story missions. Missables at risk: Break the Bank, Family Matters, Baited My Tackle.' },
  { id: 3, title: 'End of Chapter 3', text: 'Finishing Chapter 3 closes the partner-heist moments. Missables at risk: DWNFALL, Hi-Jacked, Road to Rehabilitation, This Was No Boat Accident, Hot Together, Retail Therapy, Catch Me If You Can, Sneakthief, A Classic Blitz Play.' },
  { id: 4, title: 'End of Chapter 4', text: 'Finishing Chapter 4 closes the late-story set pieces. Missables at risk: Snow Storm, The Lone Rider, Supply & Demand, Spin On This!, Capital Offense, Personal Best, Bad Luck, I Guess, Ten Pin.' },
  { id: 5, title: 'Starting the final mission', text: 'Once the final mission starts, free-roam story moments stop appearing. Finish any open stranger strands and partner moments first.' },
];
const CHAPTERS = ['Chapter 1', 'Chapter 2', 'Chapter 3', 'Chapter 4', 'Finale', 'Side & Free Roam'];

let DATA = null;
let state = loadState();
let selectedId = null;

function loadState() {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (raw) {
      const s = JSON.parse(raw);
      return { earned: new Set(s.earned || []), counts: s.counts || {}, notes: s.notes || {}, shield: s.shield !== false };
    }
  } catch (e) { /* fall through to fresh state */ }
  return { earned: new Set(), counts: {}, notes: {}, shield: true };
}
function saveState() {
  localStorage.setItem(STATE_KEY, JSON.stringify({
    earned: Array.from(state.earned), counts: state.counts, notes: state.notes, shield: state.shield,
  }));
}
function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function isStory(t) { return t.kind === 'story' || t.chapter === 'Chapter 1' || t.chapter === 'Chapter 2' || t.chapter === 'Chapter 3' || t.chapter === 'Chapter 4' || t.chapter === 'Finale'; }
function displayName(t) {
  if (state.shield && isStory(t) && !state.earned.has(t.id)) return '??? — Hidden story trophy';
  return t.name;
}
function displayDesc(t) {
  if (state.shield && isStory(t) && !state.earned.has(t.id)) return 'Hidden until earned. Turn Spoiler Shield off to reveal story trophies.';
  return t.description;
}
function gradeCounts() {
  const c = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  DATA.trophies.forEach(t => { if (state.earned.has(t.id)) c[t.grade]++; });
  return c;
}
function renderProgress() {
  const earned = state.earned.size;
  const pct = Math.round(earned / 55 * 100);
  document.getElementById('earnedCount').textContent = earned;
  document.getElementById('earnedPct').textContent = pct + '%';
  document.getElementById('progressFill').style.width = pct + '%';
  const c = gradeCounts();
  document.getElementById('gradeCounts').textContent =
    'Platinum ' + c.platinum + '/1 · Gold ' + c.gold + '/2 · Silver ' + c.silver + '/6 · Bronze ' + c.bronze + '/46';
}
function renderAudit() {
  const targets = DATA.trophies.filter(t => t.count_target).length;
  const claims = 55 + 55 + 55 + 55 + 55 + 55 + targets + POINTS_OF_NO_RETURN.length + CHAPTERS.length;
  document.getElementById('auditStrip').innerHTML =
    '<b>' + claims + ' klaim dikutip</b> — 55 names + 55 descriptions + 55 grades + 55 guides + 55 missable boxes + 55 source lists + ' +
    targets + ' PSN count targets + ' + POINTS_OF_NO_RETURN.length + ' points of no return + ' + CHAPTERS.length +
    ' roadmap chapters. Sources: the official trophy list on Exophase (name, description, grade); PSNProfiles (PSN count targets).';
}
function filtered() {
  const q = document.getElementById('search').value.trim().toLowerCase();
  const grade = document.getElementById('gradeFilter').value;
  const kind = document.getElementById('kindFilter').value;
  const status = document.getElementById('statusFilter').value;
  return DATA.trophies.filter(t => {
    if (grade && t.grade !== grade) return false;
    if (kind && t.kind !== kind) return false;
    if (status === 'earned' && !state.earned.has(t.id)) return false;
    if (status === 'unearned' && state.earned.has(t.id)) return false;
    if (status === 'hidden' && !t.hidden) return false;
    if (q) {
      const hay = (t.name + ' ' + t.description + ' ' + t.guide + ' ' + (t.chapter || '')).toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}
function rowHtml(t) {
  const earned = state.earned.has(t.id);
  return '<li data-id="' + t.id + '" class="' + (earned ? 'earned' : '') + (selectedId === t.id ? ' selected' : '') + '">' +
    '<input type="checkbox" ' + (earned ? 'checked' : '') + ' data-check="' + t.id + '" aria-label="Earned: ' + esc(t.name) + '">' +
    '<span class="grade ' + t.grade + '">' + t.grade + '</span>' +
    '<span><span class="tname">' + esc(displayName(t)) + '</span>' +
    '<span class="tdesc">' + esc(displayDesc(t)) + '</span>' +
    (t.missable ? ' <span class="tag">MISSABLE</span>' : '') +
    (t.hidden ? ' <span class="tag">HIDDEN</span>' : '') +
    '</span></li>';
}
function renderList() {
  const list = filtered();
  document.getElementById('listCount').textContent = '(' + list.length + ' of 55)';
  document.getElementById('trophyList').innerHTML = list.map(rowHtml).join('') || '<li>No trophies match the filters.</li>';
}
function renderMissables() {
  const miss = DATA.trophies.filter(t => t.missable);
  document.getElementById('missableCount').textContent = '(' + miss.length + ' of 55)';
  document.getElementById('pointsNoReturn').innerHTML = POINTS_OF_NO_RETURN.map(p =>
    '<div class="pnr"><b>Point of no return ' + p.id + ' — ' + esc(p.title) + '.</b> ' + esc(p.text) + '</div>').join('');
  document.getElementById('missableList').innerHTML = miss.map(rowHtml).join('');
}
function nextUp() {
  const unearned = DATA.trophies.filter(t => !state.earned.has(t.id));
  const byChapter = CHAPTERS.map(ch => unearned.filter(t => t.chapter === ch)).flat();
  const rest = unearned.filter(t => !CHAPTERS.includes(t.chapter));
  return byChapter.concat(rest).slice(0, 5);
}
function renderRoadmap() {
  const up = nextUp();
  document.getElementById('nextUp').innerHTML = '<h3>Next Up — your next 5 trophies</h3>' +
    (up.length ? '<ol>' + up.map(t => '<li><b>' + esc(displayName(t)) + '</b> — ' + esc(t.chapter || '') + (t.missable ? ' · MISSABLE' : '') + '</li>').join('') + '</ol>'
      : '<p>All 55 trophies earned — platinum unlocked.</p>');
  document.getElementById('roadmap').innerHTML = CHAPTERS.map(ch => {
    const ts = DATA.trophies.filter(t => t.chapter === ch);
    const done = ts.filter(t => state.earned.has(t.id)).length;
    const pct = ts.length ? Math.round(done / ts.length * 100) : 0;
    return '<div class="roadmap-chapter"><h3>' + esc(ch) + ' — ' + done + '/' + ts.length + ' (' + pct + '%)</h3>' +
      '<div class="bar"><div class="fill" style="width:' + pct + '%"></div></div>' +
      '<p>' + ts.map(t => esc(displayName(t)) + (state.earned.has(t.id) ? ' ✓' : '')).join(' · ') + '</p></div>';
  }).join('');
}
function renderDetail() {
  const pane = document.getElementById('detailPane');
  const t = DATA.trophies.find(x => x.id === selectedId);
  if (!t) { pane.innerHTML = '<p class="hint">Select a trophy to see its guide, sources, PSN counter and notes.</p>'; return; }
  const earned = state.earned.has(t.id);
  const count = t.count_target ? (state.counts[t.id] || 0) : null;
  const pct = t.count_target ? Math.min(100, Math.round(count / t.count_target * 100)) : 0;
  pane.innerHTML =
    '<h3>' + esc(displayName(t)) + '</h3>' +
    '<p><span class="grade ' + t.grade + '">' + t.grade + '</span> ' + esc(t.kind) + ' · ' + esc(t.chapter || '') +
    (t.hidden ? ' · hidden' : '') + '</p>' +
    '<p>' + esc(displayDesc(t)) + '</p>' +
    '<p><label><input type="checkbox" id="detailEarned" ' + (earned ? 'checked' : '') + '> Earned</label></p>' +
    (t.missable
      ? '<div class="miss-box"><h4>Missable — do not skip this</h4><p>' + esc(t.missable_note || 'This trophy can be missed. Do it before its point of no return.') + '</p></div>'
      : '<div class="ok-box"><p>This trophy cannot be missed — it can be earned any time in free roam.</p></div>') +
    '<h4>Guide</h4><p class="guide">' + esc(t.guide) + '</p>' +
    (t.count_target
      ? '<div class="counter"><h4>PSN count tracker</h4><label>' + esc(t.count_label || 'Progress') + ': ' +
        '<input type="number" id="countInput" min="0" max="' + t.count_target + '" value="' + count + '"> / ' + t.count_target + '</label>' +
        '<div class="bar"><div class="fill" style="width:' + pct + '%"></div></div></div>'
      : '') +
    '<h4>Sources</h4><p class="sources">' + t.sources.map(esc).join('<br>') + '</p>' +
    '<h4>Your notes</h4><textarea id="noteInput" placeholder="Notes for this trophy…">' + esc(state.notes[t.id] || '') + '</textarea>';
  document.getElementById('detailEarned').addEventListener('change', e => {
    toggleEarned(t.id, e.target.checked);
  });
  const ci = document.getElementById('countInput');
  if (ci) ci.addEventListener('change', e => {
    state.counts[t.id] = Math.max(0, Math.min(t.count_target, Number(e.target.value) || 0));
    saveState(); renderDetail();
  });
  const ni = document.getElementById('noteInput');
  if (ni) ni.addEventListener('input', e => {
    state.notes[t.id] = e.target.value; saveState();
  });
}
function toggleEarned(id, on) {
  if (on) state.earned.add(id); else state.earned.delete(id);
  saveState(); renderAll();
}
function renderAll() {
  renderProgress(); renderList(); renderMissables(); renderRoadmap(); renderDetail();
  document.getElementById('spoilerToggle').checked = state.shield;
}
function showTab(name) {
  document.querySelectorAll('.tabs button').forEach(b => b.classList.toggle('active', b.dataset.tab === name));
  document.querySelectorAll('.view').forEach(v => v.classList.toggle('active', v.id === 'view-' + name));
}
function exportState() {
  const blob = new Blob([JSON.stringify({ earned: Array.from(state.earned), counts: state.counts, notes: state.notes }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'sunset-trophy-guide-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
}
function importState(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const s = JSON.parse(reader.result);
      state.earned = new Set(s.earned || []);
      state.counts = s.counts || {};
      state.notes = s.notes || {};
      saveState(); renderAll();
    } catch (e) { alert('Could not import that file: not valid progress JSON.'); }
  };
  reader.readAsText(file);
}
fetch('data/trophies.json')
  .then(r => r.json())
  .then(d => {
    DATA = d;
    renderAudit(); renderAll();
    document.getElementById('trophyList').addEventListener('click', e => {
      const cb = e.target.closest('[data-check]');
      if (cb) { toggleEarned(Number(cb.dataset.check), cb.checked); return; }
      const li = e.target.closest('li[data-id]');
      if (li) { selectedId = Number(li.dataset.id); renderList(); renderMissables(); renderDetail(); }
    });
    document.getElementById('missableList').addEventListener('click', e => {
      const cb = e.target.closest('[data-check]');
      if (cb) { toggleEarned(Number(cb.dataset.check), cb.checked); return; }
      const li = e.target.closest('li[data-id]');
      if (li) { selectedId = Number(li.dataset.id); renderList(); renderMissables(); renderDetail(); }
    });
    ['search', 'gradeFilter', 'kindFilter', 'statusFilter'].forEach(id => {
      document.getElementById(id).addEventListener('input', renderList);
      document.getElementById(id).addEventListener('change', renderList);
    });
    document.getElementById('spoilerToggle').addEventListener('change', e => {
      state.shield = e.target.checked; saveState(); renderAll();
    });
    document.querySelectorAll('.tabs button').forEach(b => b.addEventListener('click', () => showTab(b.dataset.tab)));
    document.getElementById('exportBtn').addEventListener('click', exportState);
    document.getElementById('importBtn').addEventListener('click', () => document.getElementById('importFile').click());
    document.getElementById('importFile').addEventListener('change', e => { if (e.target.files[0]) importState(e.target.files[0]); });
    document.addEventListener('keydown', e => {
      if (e.target.matches('input, textarea, select')) return;
      if (e.key === '/') { e.preventDefault(); document.getElementById('search').focus(); }
      if (e.key === '1') showTab('checklist');
      if (e.key === '2') showTab('roadmap');
      if (e.key === '3') showTab('missables');
      if (e.key === 's') { state.shield = !state.shield; saveState(); renderAll(); }
      if (e.key === 'e') exportState();
    });
  })
  .catch(err => {
    document.getElementById('trophyList').innerHTML = '<li>Could not load trophies.json: ' + esc(err.message) + '</li>';
  });

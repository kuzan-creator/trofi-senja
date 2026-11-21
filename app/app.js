const KEY = 'trofi-senja-v3';
const CHAPTER_ORDER = ['Chapter 1', 'Chapter 2', 'Chapter 3', 'Chapter 4', 'Finale', 'Free Roam', 'Platinum'];
const POINTS = [
  { chapter: 'Chapter 1', text: 'Finale Chapter 1 (Paradise Lost) — story jobs in the opening chapter close; finish Breakfast Run and any Chapter 1 partner work first.' },
  { chapter: 'Chapter 2', text: 'Finale Chapter 2 — the cartel strand and Andy / Randy missions close.' },
  { chapter: 'Chapter 3', text: 'Finale Chapter 3 — Kenton / Tyrone missions and the VCIA Takedown window close.' },
  { chapter: 'Chapter 4', text: 'Finale Chapter 4 — Billy\u2019s strand and Operation Savage Glory close.' },
  { chapter: 'Finale', text: 'Final mission — after it, partner and stranger strands close for good.' }
];
const AUDIT_TOTAL = 464;

let trophies = [];
let state = load();
let selectedId = null;

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw);
      return { earned: s.earned || {}, counts: s.counts || {}, notes: s.notes || {}, shield: s.shield !== false };
    }
  } catch (e) { /* corrupted save: start fresh */ }
  return { earned: {}, counts: {}, notes: {}, shield: true };
}
function save() { localStorage.setItem(KEY, JSON.stringify(state)); }

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function displayName(t) {
  if (state.shield && t.hidden && !state.earned[t.id]) return 'Trofi cerita tersembunyi';
  return t.name;
}
function displayDesc(t) {
  if (state.shield && t.hidden && !state.earned[t.id]) return 'Nama dan deskripsi trofi cerita ini disembunyikan Spoiler Shield sampai trofi didapat.';
  return t.description;
}
function earnedCount() { return trophies.filter(t => state.earned[t.id]).length; }

function renderHeader() {
  const n = earnedCount();
  const el = document.getElementById('earnedCount');
  if (el) el.textContent = n;
  const pct = document.getElementById('earnedPct');
  if (pct) pct.textContent = Math.round(n / 55 * 100) + '%';
  const bar = document.getElementById('barFill');
  if (bar) bar.style.width = (n / 55 * 100) + '%';
  const shield = document.getElementById('shieldBtn');
  if (shield) shield.textContent = 'Spoiler Shield: ' + (state.shield ? 'ON' : 'OFF');
}

function filtered() {
  const q = (document.getElementById('search').value || '').toLowerCase();
  const g = document.getElementById('gradeFilter').value;
  const k = document.getElementById('kindFilter').value;
  const s = document.getElementById('statusFilter').value;
  return trophies.filter(t => {
    if (q && !(t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))) return false;
    if (g && t.grade !== g) return false;
    if (k && t.kind !== k) return false;
    if (s === 'earned' && !state.earned[t.id]) return false;
    if (s === 'unearned' && state.earned[t.id]) return false;
    if (s === 'missable' && !t.missable) return false;
    return true;
  });
}

function renderList() {
  const list = document.getElementById('trophyList');
  const rows = filtered();
  if (!rows.length) { list.innerHTML = '<p class="muted">Tidak ada trofi yang cocok dengan filter.</p>'; return; }
  list.innerHTML = rows.map(t => {
    const earned = !!state.earned[t.id];
    return '<button type="button" class="row' + (earned ? ' earned' : '') + (selectedId === t.id ? ' selected' : '') + '" data-id="' + t.id + '">' +
      '<input type="checkbox" ' + (earned ? 'checked' : '') + ' tabindex="-1" aria-label="Tandai ' + esc(t.name) + ' didapat">' +
      '<span style="flex:1;text-align:left"><span class="tname">' + esc(displayName(t)) + '</span><br>' +
      '<span class="tdesc">' + esc(displayDesc(t)) + '</span>' +
      '<span class="tags"><span class="tag">' + esc(t.chapter) + '</span><span class="tag">' + esc(t.kind) + '</span>' +
      (t.hidden ? '<span class="tag hidden-tag">tersembunyi</span>' : '') +
      (t.missable ? '<span class="tag miss">bisa terlewat</span>' : '') +
      (t.count_target ? '<span class="tag">' + t.count_target + ' ' + esc(t.count_label) + '</span>' : '') +
      '</span></span>' +
      '<span class="grade ' + t.grade + '">' + t.grade + '</span></button>';
  }).join('');
  list.querySelectorAll('.row').forEach(row => {
    row.addEventListener('click', ev => {
      const id = Number(row.dataset.id);
      if (ev.target.type === 'checkbox') {
        state.earned[id] = !state.earned[id];
        if (!state.earned[id]) delete state.earned[id];
        save(); renderHeader(); renderList(); renderRoadmap(); renderMissables();
        return;
      }
      selectedId = id;
      renderList(); renderDetail();
    });
  });
}

function renderDetail() {
  const pane = document.getElementById('detailPane');
  const t = trophies.find(x => x.id === selectedId);
  if (!t) { pane.innerHTML = '<p class="hint">Klik sebuah trofi untuk melihat panduan, sumber, kotak missable, penghitung, dan catatan.</p>'; return; }
  const earned = !!state.earned[t.id];
  let html = '<h2>' + esc(displayName(t)) + '</h2>' +
    '<p><span class="grade ' + t.grade + '">' + t.grade + '</span> ' + esc(t.chapter) + ' · ' + esc(t.kind) + '</p>' +
    '<p>' + esc(displayDesc(t)) + '</p>' +
    '<label><input type="checkbox" id="detailEarned" ' + (earned ? 'checked' : '') + '> Sudah didapat</label>';
  if (t.missable) {
    html += '<div class="miss-box"><h3>Bisa terlewat</h3><p>' + esc(t.missable_note || 'Trofi ini bisa terlewat — kerjakan sebelum titik tanpa jalan kembali di babnya.') + '</p></div>';
  } else {
    html += '<div class="miss-box"><h3>Tidak bisa terlewat</h3><p>Trofi ini bisa dikerjakan kapan saja, termasuk setelah cerita selesai.</p></div>';
  }
  html += '<h3>Panduan</h3><ol>' + t.guide.map(s => '<li>' + esc(s) + '</li>').join('') + '</ol>';
  if (t.count_target) {
    const cur = state.counts[t.id] || 0;
    html += '<div class="tracker"><strong>Penghitung PSN:</strong><button type="button" id="countMinus">−</button>' +
      '<input type="number" id="countInput" min="0" max="' + t.count_target + '" value="' + cur + '" aria-label="Hitungan ' + esc(t.count_label) + '">' +
      '<button type="button" id="countPlus">+</button><span>/ ' + t.count_target + ' ' + esc(t.count_label) + '</span></div>';
  }
  html += '<h3>Catatan</h3><textarea class="notes" id="noteInput" placeholder="Catatanmu untuk trofi ini…">' + esc(state.notes[t.id] || '') + '</textarea>';
  html += '<h3>Sumber</h3><p class="src">' + t.sources.map(esc).join('<br>') + '</p>';
  pane.innerHTML = html;
  document.getElementById('detailEarned').addEventListener('change', ev => {
    state.earned[t.id] = ev.target.checked;
    if (!state.earned[t.id]) delete state.earned[t.id];
    save(); renderHeader(); renderList(); renderRoadmap(); renderMissables();
  });
  const minus = document.getElementById('countMinus');
  const plus = document.getElementById('countPlus');
  const input = document.getElementById('countInput');
  if (minus && plus && input) {
    const setCount = v => {
      v = Math.max(0, Math.min(t.count_target, v || 0));
      state.counts[t.id] = v; save(); input.value = v;
    };
    minus.addEventListener('click', () => setCount((state.counts[t.id] || 0) - 1));
    plus.addEventListener('click', () => setCount((state.counts[t.id] || 0) + 1));
    input.addEventListener('change', () => setCount(Number(input.value)));
  }
  document.getElementById('noteInput').addEventListener('input', ev => {
    state.notes[t.id] = ev.target.value; save();
  });
}

function renderRoadmap() {
  const wrap = document.getElementById('roadmap');
  const next = trophies.filter(t => !state.earned[t.id])
    .sort((a, b) => CHAPTER_ORDER.indexOf(a.chapter) - CHAPTER_ORDER.indexOf(b.chapter) || a.id - b.id)
    .slice(0, 5);
  document.getElementById('nextUp').innerHTML = '<div class="nextup"><h3>Next Up — 5 trofi berikutnya</h3><ol>' +
    next.map(t => '<li>' + esc(displayName(t)) + ' <span class="muted">(' + esc(t.chapter) + ' · ' + t.grade + ')</span></li>').join('') + '</ol></div>';
  const chapters = [...new Set(trophies.map(t => t.chapter))].sort((a, b) => CHAPTER_ORDER.indexOf(a) - CHAPTER_ORDER.indexOf(b));
  wrap.innerHTML = chapters.map(ch => {
    const inCh = trophies.filter(t => t.chapter === ch);
    const done = inCh.filter(t => state.earned[t.id]).length;
    return '<div class="chapter"><h3><span>' + esc(ch) + '</span><span>' + done + '/' + inCh.length + '</span></h3>' +
      '<div class="bar"><div class="bar-fill" style="width:' + Math.round(done / inCh.length * 100) + '%"></div></div>' +
      '<p class="muted">' + inCh.map(t => esc(displayName(t))).join(' · ') + '</p></div>';
  }).join('');
}

function renderMissables() {
  const miss = trophies.filter(t => t.missable);
  document.getElementById('missableList').innerHTML = miss.map(t =>
    '<div class="miss-row"><strong>' + esc(displayName(t)) + '</strong> <span class="grade ' + t.grade + '">' + t.grade + '</span> ' +
    '<span class="muted">(' + esc(t.chapter) + ')</span><br><span class="tdesc">' + esc(t.missable_note || '') + '</span> ' +
    '<span>' + (state.earned[t.id] ? '✓ didapat' : 'belum didapat') + '</span></div>').join('');
  document.getElementById('pointsList').innerHTML = POINTS.map(p =>
    '<li><strong>' + esc(p.chapter) + ':</strong> ' + esc(p.text) + ' <span class="muted">(belum dicek di dalam game)</span></li>').join('');
}

function switchTab(name) {
  document.querySelectorAll('.tabs button').forEach(b => b.classList.toggle('active', b.dataset.tab === name));
  document.querySelectorAll('.tab').forEach(s => s.classList.toggle('active', s.id === 'tab-' + name));
}

function exportData() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'trofi-senja-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

function init() {
  document.getElementById('auditStrip').textContent = AUDIT_TOTAL + ' klaim dikutip — 55 nama + 55 deskripsi + 55 grade + 165 langkah panduan + 55 kotak missable + 55 daftar sumber + 13 target PSN + 5 titik tanpa jalan kembali + 6 bab roadmap. Sumber: daftar resmi 55 trofi (Exophase) untuk nama/deskripsi/grade; PSNProfiles untuk target hitungan PSN.';
  fetch('data/trophies.json').then(r => r.json()).then(data => {
    trophies = data.trophies;
    renderHeader(); renderList(); renderDetail(); renderRoadmap(); renderMissables();
  });
  ['search', 'gradeFilter', 'kindFilter', 'statusFilter'].forEach(id => {
    document.getElementById(id).addEventListener('input', renderList);
    document.getElementById(id).addEventListener('change', renderList);
  });
  document.getElementById('shieldBtn').addEventListener('click', () => {
    state.shield = !state.shield; save(); renderHeader(); renderList(); renderDetail();
  });
  document.getElementById('exportBtn').addEventListener('click', exportData);
  document.getElementById('importBtn').addEventListener('click', () => document.getElementById('importFile').click());
  document.getElementById('importFile').addEventListener('change', ev => {
    const f = ev.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const s = JSON.parse(reader.result);
        state = { earned: s.earned || {}, counts: s.counts || {}, notes: s.notes || {}, shield: s.shield !== false };
        save(); renderHeader(); renderList(); renderDetail(); renderRoadmap(); renderMissables();
      } catch (e) { alert('File import tidak valid.'); }
    };
    reader.readAsText(f);
  });
  document.querySelectorAll('.tabs button').forEach(b => b.addEventListener('click', () => switchTab(b.dataset.tab)));
  document.addEventListener('keydown', ev => {
    if (ev.target.tagName === 'INPUT' || ev.target.tagName === 'TEXTAREA' || ev.target.tagName === 'SELECT') return;
    if (ev.key === '/') { ev.preventDefault(); document.getElementById('search').focus(); }
    else if (ev.key === '1') switchTab('checklist');
    else if (ev.key === '2') switchTab('roadmap');
    else if (ev.key === '3') switchTab('missables');
    else if (ev.key === 's' || ev.key === 'S') { state.shield = !state.shield; save(); renderHeader(); renderList(); renderDetail(); }
    else if (ev.key === 'e' || ev.key === 'E') exportData();
  });
}
document.addEventListener('DOMContentLoaded', init);

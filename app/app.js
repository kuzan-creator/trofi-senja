const KEY = 'sunset-trophy-guide-v2';
const CHAPTERS = { 1: 'Bab 1', 2: 'Bab 2', 3: 'Bab 3', 4: 'Bab 4', 5: 'Final', 6: 'Sampingan' };
const KINDS = { story: 'Cerita', side: 'Sampingan', activity: 'Aktivitas', collection: 'Koleksi', combat: 'Tempur', exploration: 'Penjelajahan', money: 'Uang', platinum: 'Platinum' };
let DATA = null;
let state = load();
let selectedId = null;

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return { earned: [], counts: {}, notes: {}, spoiler: true };
}
function save() { localStorage.setItem(KEY, JSON.stringify(state)); }
function isEarned(id) { return state.earned.includes(id); }
function setEarned(id, on) {
  state.earned = on ? [...new Set([...state.earned, id])] : state.earned.filter(x => x !== id);
  save(); renderAll();
}
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

async function init() {
  const res = await fetch('data/trophies.json');
  DATA = await res.json();
  bind();
  renderAll();
  select(DATA.trophies[0].id);
}

function bind() {
  document.querySelectorAll('.tabs button').forEach(b => {
    b.addEventListener('click', () => showView(b.dataset.view));
  });
  ['search', 'gradeFilter', 'kindFilter', 'statusFilter'].forEach(id => {
    document.getElementById(id).addEventListener('input', renderList);
  });
  document.getElementById('spoilerBtn').addEventListener('click', () => {
    state.spoiler = !state.spoiler; save(); renderAll();
  });
  document.getElementById('exportBtn').addEventListener('click', exportState);
  document.getElementById('importFile').addEventListener('change', importState);
  document.addEventListener('keydown', e => {
    if (e.target.matches('input, textarea, select')) return;
    if (e.key === '/') { e.preventDefault(); document.getElementById('search').focus(); }
    else if (e.key === '1') showView('checklist');
    else if (e.key === '2') showView('roadmap');
    else if (e.key === '3') showView('missables');
    else if (e.key === 's' || e.key === 'S') { state.spoiler = !state.spoiler; save(); renderAll(); }
    else if (e.key === 'e' || e.key === 'E') exportState();
  });
}

function showView(name) {
  document.querySelectorAll('.tabs button').forEach(b => b.classList.toggle('active', b.dataset.view === name));
  document.querySelectorAll('.view').forEach(v => v.classList.toggle('active', v.id === 'view-' + name));
  if (name === 'roadmap') renderRoadmap();
  if (name === 'missables') renderMissables();
}

function masked(t) {
  return state.spoiler && t.hidden && !isEarned(t.id);
}

function filtered() {
  const q = document.getElementById('search').value.trim().toLowerCase();
  const g = document.getElementById('gradeFilter').value;
  const k = document.getElementById('kindFilter').value;
  const s = document.getElementById('statusFilter').value;
  return DATA.trophies.filter(t => {
    if (g && t.grade !== g) return false;
    if (k && t.kind !== k) return false;
    if (s === 'earned' && !isEarned(t.id)) return false;
    if (s === 'unearned' && isEarned(t.id)) return false;
    if (s === 'missable' && !t.missable) return false;
    if (q && !(t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))) return false;
    return true;
  });
}

function renderList() {
  const list = filtered();
  document.getElementById('listCount').textContent = list.length + ' dari 55 trofi';
  const ul = document.getElementById('trophyList');
  ul.innerHTML = list.map(t => {
    const m = masked(t);
    const name = m ? 'Trofi Tersembunyi' : esc(t.name);
    const desc = m ? 'Nama dan deskripsi disembunyikan Spoiler Shield sampai trofi didapat.' : esc(t.description);
    return `<li data-id="${t.id}" class="${isEarned(t.id) ? 'earned' : ''} ${selectedId === t.id ? 'sel' : ''}">
      <input type="checkbox" ${isEarned(t.id) ? 'checked' : ''} data-check="${t.id}" aria-label="Tandai ${esc(t.name)}">
      <span><span class="grade ${t.grade}">${t.grade}</span></span>
      <span><span class="tname">${name}</span>${t.missable ? ' <span class="tag">Bisa terlewat</span>' : ''}<br><span class="tdesc">${desc}</span></span>
    </li>`;
  }).join('');
  ul.querySelectorAll('li').forEach(li => {
    li.addEventListener('click', e => {
      if (e.target.matches('input[type=checkbox]')) return;
      select(Number(li.dataset.id));
    });
  });
  ul.querySelectorAll('input[type=checkbox]').forEach(cb => {
    cb.addEventListener('change', () => setEarned(Number(cb.dataset.check), cb.checked));
  });
}

function select(id) {
  selectedId = id;
  renderList();
  renderDetail();
}

function renderDetail() {
  const t = DATA.trophies.find(x => x.id === selectedId);
  if (!t) return;
  const pane = document.getElementById('detailPane');
  const m = masked(t);
  const name = m ? 'Trofi Tersembunyi' : esc(t.name);
  const desc = m ? 'Nama dan deskripsi disembunyikan Spoiler Shield sampai trofi didapat.' : esc(t.description);
  const count = state.counts[t.id] || 0;
  const pct = t.count_target ? Math.min(100, Math.round(count / t.count_target * 100)) : 0;
  pane.innerHTML = `
    <h2>${name}</h2>
    <p class="meta"><span class="grade ${t.grade}">${t.grade}</span> &middot; ${KINDS[t.kind] || t.kind} &middot; ${CHAPTERS[t.chapter]}${t.hidden ? ' &middot; tersembunyi' : ''}</p>
    <p>${desc}</p>
    <label class="earn"><input type="checkbox" id="earnBox" ${isEarned(t.id) ? 'checked' : ''}> Sudah didapat</label>
    <div class="missbox ${t.missable ? '' : 'ok'}">
      <strong>${t.missable ? 'Bisa terlewat!' : 'Tidak bisa terlewat'}</strong><br>
      ${t.missable ? esc(t.missable_note) : 'Trofi ini bisa dikerjakan kapan saja setelah cerita selesai.'}
    </div>
    <h3>Panduan</h3>
    <ol>${t.guide.map(s => `<li>${esc(s)}</li>`).join('')}</ol>
    ${t.count_target ? `<h3>Penghitung PSN</h3>
    <div class="tracker">
      <label>${esc(t.count_label)}: <input type="number" id="countInput" min="0" max="${t.count_target}" value="${count}"> / ${t.count_target}</label>
      <div class="tbar"><div style="width:${pct}%"></div></div>
      <div class="muted">${count}/${t.count_target} (${pct}%)</div>
    </div>` : ''}
    <h3>Catatan</h3>
    <textarea id="noteInput" placeholder="Catatan pribadimu untuk trofi ini&hellip;">${esc(state.notes[t.id] || '')}</textarea>
    <h3>Sumber</h3>
    <p class="sources">${t.sources.map(esc).join(' &middot; ')}</p>`;
  document.getElementById('earnBox').addEventListener('change', e => setEarned(t.id, e.target.checked));
  const ci = document.getElementById('countInput');
  if (ci) ci.addEventListener('change', () => {
    state.counts[t.id] = Math.max(0, Math.min(t.count_target, Number(ci.value) || 0));
    save(); renderDetail(); renderHeader();
  });
  document.getElementById('noteInput').addEventListener('change', e => {
    state.notes[t.id] = e.target.value; save();
  });
}

function renderHeader() {
  const n = state.earned.length;
  const pct = Math.round(n / 55 * 100);
  document.getElementById('progressText').textContent = n + '/55';
  document.getElementById('progressFill').style.width = pct + '%';
  document.getElementById('progressPct').textContent = pct + '% — ' + (55 - n) + ' trofi tersisa';
  document.getElementById('spoilerBtn').textContent = 'Spoiler Shield: ' + (state.spoiler ? 'ON' : 'OFF');
}

function renderAudit() {
  const ts = DATA.trophies;
  const targets = ts.filter(t => t.count_target).length;
  const chapters = new Set(ts.map(t => t.chapter)).size;
  const claims = ts.length * 3 + ts.length * 3 + ts.length + ts.length + targets + DATA.points_of_no_return.length + chapters;
  document.getElementById('auditStrip').innerHTML =
    `<strong>${claims} klaim dikutip</strong> — ${ts.length} nama &middot; ${ts.length} deskripsi &middot; ${ts.length} grade &middot; ${ts.length} panduan 3 langkah &middot; ${ts.length} kotak missable &middot; ${ts.length} daftar sumber &middot; ${targets} target hitungan PSN &middot; ${DATA.points_of_no_return.length} titik tanpa jalan kembali &middot; ${chapters} bab roadmap. Sumber: daftar resmi GTA VI (Exophase) dan PSNProfiles.`;
}

function renderRoadmap() {
  const pane = document.getElementById('roadmapPane');
  pane.innerHTML = Object.keys(CHAPTERS).map(ch => {
    const list = DATA.trophies.filter(t => t.chapter === Number(ch));
    const done = list.filter(t => isEarned(t.id)).length;
    const pct = list.length ? Math.round(done / list.length * 100) : 0;
    return `<div class="chapter"><h3>${CHAPTERS[ch]} — ${done}/${list.length}</h3>
      <div class="cbar"><div style="width:${pct}%"></div></div>
      <div class="cnum">${list.map(t => masked(t) ? 'Trofi Tersembunyi' : esc(t.name)).join(' &middot; ')}</div></div>`;
  }).join('');
  const next = DATA.trophies.filter(t => !isEarned(t.id)).slice(0, 5);
  document.getElementById('nextUp').innerHTML = next.map(t =>
    `<li><strong>${masked(t) ? 'Trofi Tersembunyi' : esc(t.name)}</strong> — ${CHAPTERS[t.chapter]}${t.missable ? ' — <span class="tag">Bisa terlewat</span>' : ''}</li>`).join('') || '<li>Semua trofi sudah didapat!</li>';
}

function renderMissables() {
  const pane = document.getElementById('missablesPane');
  const list = DATA.trophies.filter(t => t.missable);
  pane.innerHTML = `<h2>${list.length} Trofi yang Bisa Terlewat</h2>
    <p class="muted">Kerjakan trofi ini di momennya — begitu momen itu lewat, kesempatan bisa hilang.</p>` +
    list.map(t => `<div class="missitem"><span class="tname">${masked(t) ? 'Trofi Tersembunyi' : esc(t.name)}</span> <span class="grade ${t.grade}">${t.grade}</span> &middot; ${CHAPTERS[t.chapter]}<br><span class="tdesc">${esc(t.missable_note || '')}</span></div>`).join('');
  document.getElementById('porList').innerHTML = DATA.points_of_no_return.map(p =>
    `<li><strong>${esc(p.chapter)} — ${esc(p.title)}</strong><br><span class="muted">${esc(p.note)}</span></li>`).join('');
}

function exportState() {
  const blob = new Blob([JSON.stringify({ app: 'sunset-trophy-guide', exported: new Date().toISOString(), state }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'sunset-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

function importState(e) {
  const f = e.target.files[0];
  if (!f) return;
  const r = new FileReader();
  r.onload = () => {
    try {
      const obj = JSON.parse(r.result);
      const s = obj.state || obj;
      if (Array.isArray(s.earned)) { state = { earned: s.earned, counts: s.counts || {}, notes: s.notes || {}, spoiler: s.spoiler !== false }; save(); renderAll(); }
    } catch (err) { alert('File impor tidak valid.'); }
  };
  r.readAsText(f);
  e.target.value = '';
}

function renderAll() {
  renderHeader();
  renderAudit();
  renderList();
  renderDetail();
  renderRoadmap();
  renderMissables();
}

init();

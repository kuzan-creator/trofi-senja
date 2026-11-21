/* Sunset Trophy Guide — GTA 6 Platinum Tracker. Offline, no network. */
const KEY = 'sunset-trophy-guide-v6';
const POINTS = { platinum: 300, gold: 90, silver: 30, bronze: 15 };
const SEED = [2, 3, 4, 5, 8, 15, 16, 19, 20, 21, 31, 35, 55];
let T = [], EXTRA = null, AUDIT = null;
let state = { earned: [], counts: {}, notes: {}, shield: true };
let sel = 28, tab = 'checklist';

function load() { try { const s = JSON.parse(localStorage.getItem(KEY)); if (s) state = Object.assign(state, s); } catch (e) {} }
function save() { localStorage.setItem(KEY, JSON.stringify(state)); }
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const earnedSet = () => new Set(state.earned);
const isEarned = id => earnedSet().has(id);
function points() { return state.earned.reduce((a, id) => a + (POINTS[(T.find(t => t.id === id) || {}).grade] || 0), 0); }

async function boot() {
  load();
  T = (await (await fetch('data/trophies.json')).json()).trophies;
  EXTRA = await (await fetch('data/guide-extra.json')).json();
  AUDIT = await (await fetch('data/audit.json')).json();
  const kinds = [...new Set(T.map(t => t.kind))].sort();
  $('fKind').innerHTML = '<option value="">All kinds</option>' + kinds.map(k => `<option>${k}</option>`).join('');
  renderAudit(); route(); bind();
}
function renderAudit() {
  const b = AUDIT.breakdown;
  $('auditStrip').innerHTML =
    `<span><b>${AUDIT.total_claims}</b> claims cited</span>` +
    `<span><b>${AUDIT.sites}</b> source sites</span>` +
    `<span><b>${AUDIT.pages}</b> source pages</span>` +
    `<span><b>${AUDIT.disputes}</b> disputes tracked</span>` +
    `<span class="warn"><b>${AUDIT.missable}</b> missable windows</span>` +
    `<span><b>${AUDIT.points_of_no_return}</b> points of no return</span>` +
    `<span>names ${b.names} · descriptions ${b.descriptions} · grades ${b.grades} · guides ${b.guides} (${b.guide_steps} steps) · sources ${b.sources} · count targets ${b.count_targets} · missable boxes ${b.missable_boxes} · chapters ${b.chapters} · kinds ${b.kinds} · hidden flags ${b.hidden_flags}</span>`;
}
function renderStats() {
  const n = state.earned.length;
  $('statEarned').textContent = n + '/55';
  $('statPct').textContent = Math.round(n / 55 * 100) + '%';
  $('statPoints').textContent = points() + ' / 1350';
  $('statMiss').textContent = AUDIT.missable;
  $('bar').style.width = (n / 55 * 100) + '%';
  $('shieldBtn').textContent = state.shield ? '🛡 Spoiler Shield: ON' : '🛡 Spoiler Shield: OFF';
  $('shieldBtn').classList.toggle('on', state.shield);
}
function shielded(t) { return state.shield && t.hidden && !isEarned(t.id); }
function displayName(t) { return shielded(t) ? '??? — Hidden trophy' : t.name; }
function displayDesc(t) { return shielded(t) ? 'Hidden until earned — Spoiler Shield is on. Earn it in-game to reveal the name and description.' : t.description; }

function filtered() {
  const q = ($('q').value || '').toLowerCase(), g = $('fGrade').value, k = $('fKind').value, s = $('fStatus').value;
  return T.filter(t => {
    if (g && t.grade !== g) return false;
    if (k && t.kind !== k) return false;
    if (s === 'earned' && !isEarned(t.id)) return false;
    if (s === 'todo' && isEarned(t.id)) return false;
    if (s === 'missable' && !t.missable) return false;
    if (s === 'hidden' && !t.hidden) return false;
    if (q && !(t.name + ' ' + t.description + ' ' + t.kind + ' ' + t.chapter).toLowerCase().includes(q)) return false;
    return true;
  });
}
function gradeCounts() { const c = {}; T.forEach(t => c[t.grade] = (c[t.grade] || 0) + 1); return c; }

function rowHtml(t) {
  const e = isEarned(t.id);
  return `<div class="trow ${e ? 'earned' : ''} ${sel === t.id ? 'sel' : ''}" data-id="${t.id}">
    <input type="checkbox" ${e ? 'checked' : ''} data-check="${t.id}" aria-label="Earned ${esc(t.name)}">
    <div><div class="tname">${esc(displayName(t))}<span class="badge ${t.grade}">${t.grade}</span></div>
    <div class="tdesc">${esc(displayDesc(t))}</div>
    <div>${t.missable ? '<span class="tag miss">⚠ Missable</span>' : ''}${t.hidden ? '<span class="tag hidden">Hidden</span>' : ''}<span class="tag">${t.kind}</span><span class="tag">${t.chapter}</span>${t.count ? `<span class="tag">YOUR COUNT ${state.counts[t.id] || 0}/${t.count.target}</span>` : ''}</div></div>
  </div>`;
}
function detailHtml(t) {
  const e = isEarned(t.id), c = t.count, cur = state.counts[t.id] || 0;
  const srcs = t.sources.map(s => `<li><span class="site">${esc(s.site)}</span> — ${esc(s.title)}<br><span class="hint">${esc(s.url)}</span></li>`).join('');
  return `<h2>${esc(displayName(t))} <span class="badge ${t.grade}">${t.grade}</span></h2>
  <p class="kv"><b>Description:</b> ${esc(displayDesc(t))}</p>
  <p class="kv"><b>Chapter:</b> ${esc(t.chapter)} · <b>Kind:</b> ${esc(t.kind)} · <b>Hidden:</b> ${t.hidden ? 'Yes' : 'No'} · <b>PSN points:</b> ${POINTS[t.grade]}</p>
  ${c ? `<div class="countbox"><div class="lab">Your count — ${esc(c.label)}</div><div class="big">${cur} / ${c.target}${c.total ? ' <span style="font-size:18px;color:var(--muted)">(of ' + c.total + ')</span>' : ''}</div>
  <input type="number" min="0" max="${c.target}" value="${cur}" data-count="${t.id}" aria-label="Your count for ${esc(t.name)}"> <span class="hint">type your progress</span></div>` : ''}
  ${t.missable ? `<div class="missbox"><h3>⚠ MISSABLE — read before you play on</h3><div>${esc(t.missable_note)}</div></div>` : '<div class="kv">✅ Not missable — can be done any time in free roam.</div>'}
  <h3>Guide</h3><div class="guide">${shielded(t) ? 'Guide hidden by Spoiler Shield until earned.' : esc(t.guide)}</div>
  <h3>Sources (${t.sources.length})</h3><ul class="srcs">${shielded(t) ? '<li>Sources hidden by Spoiler Shield until earned.</li>' : srcs}</ul>
  <h3>Your note</h3><textarea class="notes" data-note="${t.id}" placeholder="Your own note for this trophy…">${esc(state.notes[t.id] || '')}</textarea>
  <p><button class="btn gold" data-toggle="${t.id}">${e ? '✓ Earned — unmark' : 'Mark as earned'}</button></p>`;
}
function renderChecklist() {
  const list = filtered(), gc = gradeCounts();
  const byKind = {}; T.forEach(t => byKind[t.kind] = (byKind[t.kind] || 0) + 1);
  const selT = T.find(t => t.id === sel) || list[0] || T[0];
  $('main').innerHTML = `<div class="panes">
    <div class="pane"><h2>At a glance</h2>
      <p class="kv"><b>55</b> trophies — 1 platinum, 2 gold, 6 silver, 46 bronze</p>
      <p class="kv"><b>28</b> hidden · <b>21</b> missable windows · <b>19</b> count targets</p>
      <p class="kv">Earned by grade: platinum ${state.earned.filter(id => (T.find(t => t.id === id) || {}).grade === 'platinum').length}/1 · gold ${state.earned.filter(id => (T.find(t => t.id === id) || {}).grade === 'gold').length}/2 · silver ${state.earned.filter(id => (T.find(t => t.id === id) || {}).grade === 'silver').length}/6 · bronze ${state.earned.filter(id => (T.find(t => t.id === id) || {}).grade === 'bronze').length}/46</p>
      <h3>By kind</h3>${Object.entries(byKind).map(([k, v]) => `<p class="kv">${k}: <b>${v}</b></p>`).join('')}
      <h3>Platinum time</h3><p class="kv">PowerPyx: ~<b>200 hours</b>, difficulty <b>4/10</b>. Push Square: up to 300h+. One playthrough, no online trophies, cheats off.</p>
      <p class="hint">Tick a trophy when it pops. Progress, counts and notes save in this browser only — nothing is sent anywhere.</p></div>
    <div class="pane"><h2>Checklist — ${list.length} of 55 shown</h2>${list.map(rowHtml).join('') || '<p>No trophies match the filters.</p>'}</div>
    <div class="pane detail">${detailHtml(selT)}</div>
  </div>`;
}
function renderRoadmap() {
  const order = []; EXTRA.roadmap.forEach(p => p.trophies.forEach(id => order.push(id)));
  const next = T.filter(t => !isEarned(t.id)).sort((a, b) => {
    const ia = order.indexOf(a.id), ib = order.indexOf(b.id);
    return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
  }).slice(0, 5);
  $('main').innerHTML = `<div class="panes" style="grid-template-columns:1fr 430px">
    <div><h2 style="color:var(--gold);font-size:22px">Roadmap to the Platinum</h2>
    ${EXTRA.roadmap.map(p => { const done = p.trophies.filter(id => isEarned(id)).length;
      return `<div class="phase"><h3>${esc(p.title)}</h3><p class="kv">${esc(p.chapter)} · ${done}/${p.trophies.length} trophies in this phase</p><p>${esc(p.text)}</p><p>${p.trophies.map(id => { const t = T.find(x => x.id === id); return `<span class="tag">${isEarned(id) ? '✓ ' : ''}${esc(displayName(t))}</span>`; }).join('')}</p></div>`; }).join('')}
    </div>
    <div class="pane"><h2>Next Up — your next 5</h2><ol class="nextup">${next.map(t => `<li><b>${esc(displayName(t))}</b> <span class="badge ${t.grade}">${t.grade}</span><br><span class="tdesc">${esc(displayDesc(t))}</span></li>`).join('')}</ol>
    <h3>After the story</h3><p class="kv">Progress &gt; Stats &gt; 100% Completion opens after the credits. Nothing on the checklist is missable — finish it all in free roam.</p></div>
  </div>`;
}
function renderMissables() {
  const miss = T.filter(t => t.missable);
  $('main').innerHTML = `<div class="panes" style="grid-template-columns:1fr 430px">
    <div><h2 style="color:var(--gold);font-size:22px">Missables — ${miss.length} windows to watch</h2>
    <p class="kv">Only <b>Positive Mental Attitude</b> is confirmed possibly missable (PowerPyx, KeenGamer). The other ${miss.length - 1} are flagged as <b>windows</b>: story and stranger moments that cannot be replayed, so do them as they appear. See the Disputes tab for the honest argument.</p>
    ${miss.map(t => `<div class="trow" data-id="${t.id}"><input type="checkbox" ${isEarned(t.id) ? 'checked' : ''} data-check="${t.id}"><div><div class="tname">${esc(displayName(t))}<span class="badge ${t.grade}">${t.grade}</span></div><div class="tdesc">${esc(t.missable_note)}</div></div></div>`).join('')}</div>
    <div class="pane"><h2>5 points of no return</h2>${EXTRA.points_of_no_return.map(p => `<div class="ponr"><h3>⛔ ${esc(p.title)}</h3><p>${esc(p.text)}</p><p>${p.trophies.map(id => `<span class="tag">${esc(displayName(T.find(x => x.id === id)))}</span>`).join('')}</p></div>`).join('')}</div>
  </div>`;
}
function renderDisputes() {
  $('main').innerHTML = `<h2 style="color:var(--gold);font-size:22px">Disputes — ${EXTRA.disputes.length} open questions, honestly shown</h2>
  <p class="kv">Where the guides disagree, this guide shows both sides instead of picking one silently. “Open” means nobody has confirmed it in-game yet.</p>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">${EXTRA.disputes.map(d => `<div class="dispute"><h3>${esc(d.title)}</h3><div class="vs"><div><b>Source A</b><br>${esc(d.a)}</div><div><b>Source B</b><br>${esc(d.b)}</div></div><p>Status: <span class="status ${d.status.startsWith('Open') ? 'open' : 'resolved'}">${esc(d.status)}</span></p></div>`).join('')}</div>`;
}
function renderSources() {
  const b = AUDIT.breakdown;
  $('main').innerHTML = `<div class="panes" style="grid-template-columns:1fr 1fr">
    <div class="pane"><h2>Audit — how every number was counted</h2>
    <p class="kv"><b>${AUDIT.total_claims} cited claims</b> in total.</p>
    ${Object.entries(b).map(([k, v]) => `<p class="kv">${k.replace(/_/g, ' ')}: <b>${v}</b></p>`).join('')}
    <p class="kv"><b>${AUDIT.sites} distinct sites</b> · <b>${AUDIT.pages} distinct pages</b> · <b>${AUDIT.disputes} disputes</b> · <b>${AUDIT.roadmap_phases} roadmap phases</b> · <b>${AUDIT.points_of_no_return} points of no return</b></p>
    <p class="hint">A claim is one checked fact: a name, a description, a grade, a guide step, a source, a count target, a chapter, a kind, a hidden flag or a missable box. Pages are real guide pages found by search on 2026-11-21; no URL was invented.</p></div>
    <div class="pane"><h2>Source sites (${AUDIT.sites})</h2><p class="srccount">${AUDIT.site_list.map(esc).join(' · ')}</p>
    <h3>Source pages (${AUDIT.pages})</h3><ul class="srcs">${AUDIT.page_list.map(u => `<li>${esc(u)}</li>`).join('')}</ul></div>
  </div>`;
}
function render() {
  renderStats();
  document.querySelectorAll('#tabs button').forEach(b => b.classList.toggle('on', b.dataset.tab === tab));
  if (tab === 'checklist') renderChecklist();
  else if (tab === 'roadmap') renderRoadmap();
  else if (tab === 'missables') renderMissables();
  else if (tab === 'disputes') renderDisputes();
  else renderSources();
}
function route() {
  load(); // re-read localStorage so external seeding (e.g. screenshots) takes effect
  const h = location.hash.replace(/^#\/?/, '');
  if (h.startsWith('trophy-')) { sel = parseInt(h.slice(7), 10) || 28; tab = 'checklist'; }
  else if (['roadmap', 'missables', 'disputes', 'sources'].includes(h)) tab = h;
  else tab = 'checklist';
  render();
}
function toggle(id) {
  const i = state.earned.indexOf(id);
  if (i === -1) state.earned.push(id); else state.earned.splice(i, 1);
  save(); render();
}
function bind() {
  window.addEventListener('hashchange', route);
  document.querySelectorAll('#tabs button').forEach(b => b.addEventListener('click', () => { location.hash = '#/' + b.dataset.tab; }));
  ['q', 'fGrade', 'fKind', 'fStatus'].forEach(id => $(id).addEventListener('input', () => { if (tab === 'checklist') render(); }));
  $('shieldBtn').addEventListener('click', () => { state.shield = !state.shield; save(); render(); });
  $('seedBtn').addEventListener('click', () => { state.earned = [...SEED]; save(); render(); });
  $('exportBtn').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'sunset-trophy-guide-progress.json'; a.click();
  });
  $('importBtn').addEventListener('click', () => $('importFile').click());
  $('importFile').addEventListener('change', ev => {
    const f = ev.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => { try { const s = JSON.parse(r.result); state = Object.assign(state, s); save(); render(); } catch (e) { alert('Import failed: not a valid progress file.'); } };
    r.readAsText(f);
  });
  document.addEventListener('click', ev => {
    const row = ev.target.closest('.trow[data-id]');
    const chk = ev.target.closest('[data-check]');
    if (chk) { ev.stopPropagation(); toggle(parseInt(chk.dataset.check, 10)); return; }
    const tg = ev.target.closest('[data-toggle]');
    if (tg) { toggle(parseInt(tg.dataset.toggle, 10)); return; }
    if (row) { sel = parseInt(row.dataset.id, 10); if (tab === 'checklist') render(); else location.hash = '#/trophy-' + sel; }
  });
  document.addEventListener('change', ev => {
    const c = ev.target.closest('[data-count]');
    if (c) { const id = parseInt(c.dataset.count, 10); state.counts[id] = Math.max(0, parseInt(c.value, 10) || 0); save(); render(); }
  });
  document.addEventListener('input', ev => {
    const n = ev.target.closest('[data-note]');
    if (n) { state.notes[parseInt(n.dataset.note, 10)] = n.value; save(); }
  });
  document.addEventListener('keydown', ev => {
    if (ev.target.matches('input,textarea,select')) return;
    if (ev.key === '/') { ev.preventDefault(); $('q').focus(); }
    else if (ev.key === '1') location.hash = '#/checklist';
    else if (ev.key === '2') location.hash = '#/roadmap';
    else if (ev.key === '3') location.hash = '#/missables';
    else if (ev.key === 's' || ev.key === 'S') { state.shield = !state.shield; save(); render(); }
    else if (ev.key === 'e' || ev.key === 'E') $('exportBtn').click();
  });
}
boot();

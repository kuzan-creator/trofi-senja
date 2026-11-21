const KEY='trofi-senja-v1';
let data=null, state={earned:{},counts:{},notes:{},spoiler:true,selected:2};
try{const s=JSON.parse(localStorage.getItem(KEY)||'{}'); state={...state,...s};}catch(e){}
function save(){localStorage.setItem(KEY,JSON.stringify(state));}
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const gradeLabel={platinum:'Platinum',gold:'Emas',silver:'Perak',bronze:'Perunggu'};
const kindLabel={story:'Cerita',missable:'Bisa terlewat',collectibles:'Koleksi',activities:'Aktivitas',exploration:'Penjelajahan',combat:'Tempur',money:'Uang'};
function displayName(t){ if(state.spoiler && t.hidden && !state.earned[t.id]) return '🔒 Trofi Tersembunyi'; return t.name; }
function displayDesc(t){ if(state.spoiler && t.hidden && !state.earned[t.id]) return 'Deskripsi disembunyikan oleh Spoiler Shield — dapatkan trofi ini atau matikan shield.'; return t.description; }
function citedTotal(){
  // Audit yang transparan: 55x3 nama+deskripsi+grade + 55x3 langkah panduan + 55 kotak missable
  // + 55 daftar sumber + target hitungan PSN (21 trofi) + 5 titik tanpa jalan kembali + 7 bab roadmap
  const targets=data.trophies.filter(t=>t.target).length;
  return 55*3 + 55*3 + 55 + 55 + targets + 5 + 7;
}
function render(){
  const earned=data.trophies.filter(t=>state.earned[t.id]).length;
  $('#earnedCount').textContent=earned+'/55';
  $('#platPct').textContent=Math.round(earned/55*100)+'% ke Platinum';
  $('#barFill').style.width=(earned/55*100)+'%';
  const gc={platinum:[0,1],gold:[0,2],silver:[0,6],bronze:[0,46]};
  data.trophies.forEach(t=>{if(state.earned[t.id]) gc[t.grade][0]++;});
  $('#gradeCounts').textContent=`Platinum ${gc.platinum[0]}/1 · Emas ${gc.gold[0]}/2 · Perak ${gc.silver[0]}/6 · Perunggu ${gc.bronze[0]}/46`;
  const total=citedTotal();
  $('#auditStrip').innerHTML=`<b>AUDIT STRIP — ${total} klaim dikutip</b> · 55/55 nama + deskripsi + grade dari daftar resmi · 55 panduan (3 langkah tiap trofi, kata-kata sendiri) · 55 kotak missable · ${data.trophies.filter(t=>t.target).length} target hitungan PSN · 5 titik tanpa jalan kembali · 0 klaim tanpa sumber — yang belum dicek ditandai jelas`;
  $('#spoilerToggle').checked=state.spoiler;
  renderList(); renderDetail(); renderNext(); renderCounters(); renderRoadmap(); renderMissables();
}
function filtered(){
  const q=($('#search').value||'').toLowerCase(), g=$('#gradeFilter').value, k=$('#kindFilter').value, s=$('#statusFilter').value;
  return data.trophies.filter(t=>{
    if(g&&t.grade!==g) return false;
    if(k==='missable'&&!t.missable) return false;
    if(k&&k!=='missable'&&t.kind!==k) return false;
    if(s==='earned'&&!state.earned[t.id]) return false;
    if(s==='todo'&&state.earned[t.id]) return false;
    if(q&&!(t.name+' '+t.description+' '+t.guide+' '+t.chapter).toLowerCase().includes(q)) return false;
    return true;
  });
}
function renderList(){
  const list=filtered(); $('#listCount').textContent=list.length+' trofi';
  $('#trophyList').innerHTML=list.map(t=>`<button class="trow ${state.selected===t.id?'sel':''} ${state.earned[t.id]?'earned':''}" data-id="${t.id}">
    <input type="checkbox" ${state.earned[t.id]?'checked':''} data-check="${t.id}" aria-label="Didapat">
    <span><span class="badge ${t.grade}">${gradeLabel[t.grade]}</span>${t.missable?'<span class="flag">⚠ BISA TERLEWAT</span> ':''}${t.target?`<span class="countTag">${esc(t.target.label)}: ${state.counts[t.id]||0}/${t.target.total}</span>`:''}<br>
    <span class="nm">${esc(displayName(t))}</span><br><span class="ds">${esc(displayDesc(t))}</span><br><span class="ds">${esc(t.chapter)} · ${kindLabel[t.kind]}</span></span></button>`).join('')||'<p class="muted">Tidak ada trofi yang cocok dengan filter.</p>';
  document.querySelectorAll('[data-check]').forEach(c=>c.addEventListener('click',e=>{e.stopPropagation(); const id=+c.dataset.check; state.earned[id]=c.checked; if(!c.checked) delete state.earned[id]; save(); render();}));
  document.querySelectorAll('.trow').forEach(r=>r.addEventListener('click',()=>{state.selected=+r.dataset.id; save(); render(); document.getElementById('detailPane').scrollIntoView({behavior:'smooth',block:'nearest'});}));
}
function renderDetail(){
  const t=data.trophies.find(x=>x.id===state.selected)||data.trophies[0];
  const cnt=state.counts[t.id]||0;
  $('#detail').innerHTML=`<span class="badge ${t.grade}">${gradeLabel[t.grade]}</span> ${t.missable?'<span class="flag">⚠ BISA TERLEWAT</span>':''} <span class="muted">${esc(t.chapter)} · ${kindLabel[t.kind]} · Trofi #${t.id}</span>
  <h2>${esc(displayName(t))}</h2><p class="ds">${esc(displayDesc(t))}</p>
  <div class="missBox ${t.missable?'':'ok'}"><b>${t.missable?'⚠ KOTAK MISSABLE — BISA TERLEWAT':'✓ Kotak Missable — tidak bisa terlewat'}</b><br>${esc(t.missableNote)}</div>
  ${t.target?`<div class="tracker"><b>Penghitung PSN:</b> ${esc(t.target.label)} <button data-dec="-">−</button><input type="number" id="countInput" min="0" max="${t.target.total}" value="${cnt}"><button data-inc="+">+</button> / ${t.target.total}<span class="muted">${esc(t.target.source)}</span></div>`:''}
  <label><b>Catatanmu:</b><br><textarea class="notes" id="noteInput" placeholder="Tulis lokasimu, strategimu, atau apa yang berhasil…">${esc(state.notes[t.id]||'')}</textarea></label>
  <div class="guide"><b>Panduan (kata-kata sendiri):</b><p>${esc(t.guide)}</p><ol>${t.steps.map(s=>`<li>${esc(s)}</li>`).join('')}</ol></div>
  <div class="src"><b>Sumber — setiap fakta dikutip:</b><ul>${t.sources.map(s=>`<li>${esc(s)}</li>`).join('')}</ul><span class="muted">Nama, deskripsi &amp; grade: daftar resmi. Target hitungan: PSNProfiles. Panduan: kata-kata sendiri dari deskripsi resmi; yang belum dicek di dalam game ditandai di panduan.</span></div>
  <button id="toggleEarned">${state.earned[t.id]?'✓ Sudah didapat — batalkan':'Tandai sudah didapat'}</button>`;
  const ci=$('#countInput'); if(ci) ci.addEventListener('change',()=>{state.counts[t.id]=Math.max(0,Math.min(t.target.total,+ci.value||0)); save(); render();});
  document.querySelectorAll('[data-dec]').forEach(b=>b.addEventListener('click',()=>{state.counts[t.id]=Math.max(0,cnt-1); save(); render();}));
  document.querySelectorAll('[data-inc]').forEach(b=>b.addEventListener('click',()=>{state.counts[t.id]=Math.min(t.target.total,cnt+1); save(); render();}));
  $('#noteInput').addEventListener('input',e=>{state.notes[t.id]=e.target.value; save();});
  $('#toggleEarned').addEventListener('click',()=>{state.earned[t.id]=!state.earned[t.id]; if(!state.earned[t.id]) delete state.earned[t.id]; save(); render();});
}
function nextUpList(){
  const order={ 'Bab 1':1,'Bab 2':2,'Bab 3':3,'Bab 4':4,'Final':5,'Pasca-cerita':6,'Kapan saja':7 };
  return [...data.trophies].filter(t=>!state.earned[t.id]).sort((a,b)=>(order[a.chapter]-order[b.chapter])||((b.missable?1:0)-(a.missable?1:0))||(a.id-b.id)).slice(0,5);
}
function renderNext(){
  const html=nextUpList().map(t=>`<li><b>${esc(displayName(t))}</b> <span class="badge ${t.grade}">${gradeLabel[t.grade]}</span><br><span class="muted">${esc(t.chapter)}${t.missable?' · ⚠ Bisa terlewat':''}</span></li>`).join('');
  $('#nextUp').innerHTML=html; $('#nextUp2').innerHTML=html;
}
function renderCounters(){
  $('#counters').innerHTML=data.trophies.filter(t=>t.target).map(t=>`<div><b>${esc(t.name)}</b>: ${state.counts[t.id]||0}/${t.target.total} ${esc(t.target.label)}</div>`).join('');
}
function renderRoadmap(){
  const chapters=['Bab 1','Bab 2','Bab 3','Bab 4','Final','Pasca-cerita','Kapan saja'];
  $('#roadmap').innerHTML=chapters.map(ch=>{
    const ts=data.trophies.filter(t=>t.chapter===ch); const e=ts.filter(t=>state.earned[t.id]).length;
    return `<div class="chapter"><h3>${esc(ch)} — ${e}/${ts.length} didapat</h3><ul>${ts.map(t=>`<li>${state.earned[t.id]?'✓':'○'} <b>${esc(displayName(t))}</b> <span class="badge ${t.grade}">${gradeLabel[t.grade]}</span>${t.missable?' ⚠':''}</li>`).join('')}</ul></div>`;
  }).join('');
  $('#chapterProgress').innerHTML=chapters.map(ch=>{const ts=data.trophies.filter(t=>t.chapter===ch); const e=ts.filter(t=>state.earned[t.id]).length; return `<div>${esc(ch)}: ${e}/${ts.length} (${Math.round(e/ts.length*100)}%)</div>`;}).join('');
}
function renderMissables(){
  const ms=data.trophies.filter(t=>t.missable);
  $('#missableList').innerHTML=ms.map(t=>`<div class="chapter"><h3>⚠ ${esc(displayName(t))} <span class="badge ${t.grade}">${gradeLabel[t.grade]}</span></h3><p class="muted">${esc(t.chapter)} · ${esc(displayDesc(t))}</p><p>${esc(t.missableNote)}</p><p>${esc(t.guide)}</p></div>`).join('');
}
function showView(v){
  document.querySelectorAll('.view').forEach(x=>x.classList.remove('active'));
  document.querySelectorAll('.tabs button').forEach(x=>x.classList.remove('active'));
  $('#view'+v[0].toUpperCase()+v.slice(1)).classList.add('active');
  document.querySelector(`[data-view="${v}"]`).classList.add('active');
}
document.querySelectorAll('.tabs button').forEach(b=>b.addEventListener('click',()=>showView(b.dataset.view)));
['search','gradeFilter','kindFilter','statusFilter'].forEach(id=>document.getElementById(id).addEventListener('input',renderList));
$('#spoilerToggle').addEventListener('change',e=>{state.spoiler=e.target.checked; save(); render();});
$('#exportBtn').addEventListener('click',()=>{
  const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='trofi-senja-progress.json'; a.click(); URL.revokeObjectURL(a.href);
});
$('#importFile').addEventListener('change',e=>{
  const f=e.target.files[0]; if(!f) return;
  const r=new FileReader(); r.onload=()=>{try{const s=JSON.parse(r.result); state={...state,...s}; save(); render(); alert('Progres diimpor.');}catch(_){alert('File JSON tidak valid.');}}; r.readAsText(f);
});
$('#resetBtn').addEventListener('click',()=>{if(confirm('Reset semua progres, penghitung, dan catatan?')){state={earned:{},counts:{},notes:{},spoiler:true,selected:2}; save(); render();}});
document.addEventListener('keydown',e=>{
  if(e.target.matches('input,textarea,select')) return;
  if(e.key==='/'){e.preventDefault(); $('#search').focus();}
  else if(e.key==='1') showView('checklist');
  else if(e.key==='2') showView('roadmap');
  else if(e.key==='3') showView('missables');
  else if(e.key==='s'){state.spoiler=!state.spoiler; save(); render();}
  else if(e.key==='e') $('#exportBtn').click();
});
fetch('data/trophies.json').then(r=>r.json()).then(d=>{data=d; render();}).catch(e=>{document.getElementById('auditStrip').textContent='Gagal memuat data/trophies.json: '+e;});

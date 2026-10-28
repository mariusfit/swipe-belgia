'use strict';
/* ===== utilitare ===== */
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const ic=(n,c='')=>`<svg class="ic ${c}" aria-hidden="true"><use href="#i-${n}"/></svg>`;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g,'.');
const norm=s=>String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const MONTHS=['ianuarie','februarie','martie','aprilie','mai','iunie','iulie','august','septembrie','octombrie','noiembrie','decembrie'];
const dfmt=iso=>iso.split('-').reverse().join('.');
function daysUntil(iso){const [y,m,d]=iso.split('-').map(Number),n=new Date();return Math.round((Date.UTC(y,m-1,d)-Date.UTC(n.getFullYear(),n.getMonth(),n.getDate()))/864e5)}
/* ===== stare + localStorage ===== */
const KEY='swipe-belgia-v1';
const defaults=()=>({m:{},mo:[],fav:{},later:{},vote:{},seen:{},done:{},af:{},hint:{},sound:false,rm:false,fz:2});
let mem=null;
function load(){try{const r=localStorage.getItem(KEY);return Object.assign(defaults(),r?JSON.parse(r):{})}catch(e){return mem||defaults()}}
let S=load();
function save(){mem=S;try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
const RM=()=>S.rm||matchMedia('(prefers-reduced-motion: reduce)').matches;
document.documentElement.classList.toggle('rm',S.rm);
/* ===== DATE din pagina pilot (garanția locativă). Nimic inventat: totul derivă din RAW (data.js = fișierele pilotului) ===== */
function sentences(t){const o=[];let s=0;for(let i=0;i<t.length;i++){if(t[i]==='.'&&(i===t.length-1||(t[i+1]===' '&&/[A-ZĂÂÎȘȚ]/.test(t[i+2]||'')))){o.push(t.slice(s,i+1).trim());s=i+1}}if(t.slice(s).trim())o.push(t.slice(s).trim());return o}
const G=RAW.guide,FP=RAW.facts,RU=RAW.rules,RP=RU.payload,FX=RAW.fixture.facts;
const VERIF=dfmt(G.lastVerified),MAXAGE=FP.reviewPolicy.maxAgeDays;
const REVERIF=(()=>{const [y,m,d]=G.lastVerified.split('-').map(Number);return new Date(Date.UTC(y,m-1,d+MAXAGE)).toISOString().slice(0,10)})();
const PAGE='Pagina pilot „'+G.seoTitle+'”';
const PILOT_URL='/val1/'+G.routeSlug+'/';
const stepOf=id=>G.steps.find(s=>s.id===id);
const SK={'vl-rent':'vl','vl-loan':'vll','bxl-rent':'bxl','bxl-aid':'fdl','wal-rent-2023':'wal','wal-loan':'swcs','dg-rent-guarantee':'dg','nbb-supervision':'nbb'};
const SRC={};FP.sources.forEach(s=>{const g=G.sources.find(x=>x.url===s.url)||{};SRC[SK[s.id]]={rid:s.id,n:s.label,u:s.url,tier:s.authorityTier,chk:s.lastChecked,desc:s.description||g.description||'',kind:s.kind||g.kind||'',scope:s.scope||g.scope||''}});
const REG=[['vl','flanders-2019-cap','f-flanders-cap','#ffc531','flanders-2019'],['bxl','brussels-2024-cap','f-brussels-cap','#ff6b87','brussels-2024'],['wal','wallonia-2023-cap','f-wallonia-cap','#62adff','wallonia-2023'],['dg','german-speaking-community-cap','f-german-community-cap','#37e3a4','german-speaking-community-current-guarantee']].map(([id,sid,fid,c,aid])=>{
 const st=stepOf(sid),f=RP.facts.find(x=>x.id===fid),ap=FP.applicability.find(x=>x.id===aid),nume=st.title.split(' — ')[0],ss=sentences(st.body);
 return{id,nume,scurt:id==='dg'?'Germanofonă':nume,luni:f.value,de:f.validFrom||ap.effectiveFrom||null,c,src:SK[ap.sourceRefs[0]],lit:f.quote,quote:ss[0],ss,st,sid,fid,aid}});
const RB=Object.fromEntries(REG.map(r=>[r.id,r]));
const SA=sentences(G.shortAnswer),RS=sentences(stepOf('record-form-and-amount').body),DOC=G.documents;
const T={warn:G.warnings[0].text,trapOld:G.warnings[1].text,trapAid:G.warnings[2].text,aidCap:SA[SA.length-1],s1:RS[0],s2:RS[1],blocat:RS[2],docKeep:DOC[1].note};
/* texte vizibile pe pagina pilot care nu sunt în cele trei fișiere JSON (copiate din pagina servită) */
const PX={
 who:['chiriași','reședință principală privată'],
 next:[{href:'/ghiduri/garantie-locativa-edepo/',t:'Cum funcționează e-DEPO pentru garanția locativă?',d:'Pentru garanția unei locuințe private folosite ca reședință principală, e-DEPO este serviciul federal disponibil în toată Belgia.'},
  {href:'/ghiduri/eliberare-garantie-locativa/',t:'Cum recuperez garanția locativă și ce fac dacă nu există acord?',d:'Pentru o locuință privată folosită ca reședință principală, compară ieșirea cu inventarul și separă sumele acceptate de cele contestate.'}],
 step1:'Alege forma permisă în regiunea ta',
 labels:['Pe scurt','Răspunsul complet','Află în 30 de secunde','Unde e locuința?','Alege regiunea locuinței','Nu salvăm datele tale.','Vezi citatul literal','Alege Da sau Nu pentru a vedea informația potrivită.','Consultă capcana despre contractele mai vechi.','Da','Nu','Exemplu','Chiria lunară','Ce faci, în ordine','Citește pasul complet','Capcane','Acte','Înainte','După','Continuă cu','Surse','Vezi cele 8 surse','Se aplică de la','Verificat la','de chirie, maximum'],
 stale:'Datele au depășit termenul de reverificare'
};
/* ===== ghidurile pilot (titluri reale din dist-lab/val1) ===== */
const GH={
 garantie:'Care este suma maximă a garanției în regiunea mea?',
 locuire:'Ce traseu regional de sprijin pentru locuire verific?',
 adresa:'M-am mutat. Cum declar noua adresă?',
 alocatii:'Ce sistem de alocații pentru copii mi se aplică în Belgia?',
 salariu:'Salariul, programul sau documentele sunt greșite. Unde cer ajutor?',
 ocupare:'La ce serviciu public mă înscriu dacă îmi caut un loc de muncă?',
 permis:'Pot conduce sau schimba permisul străin în Belgia?',
 comuna:'Cum depun dosarul UE și ce dovedește Annex 19?',
 apostila:'Când nu este necesară apostila și când poate fi cerută traducerea?',
 bpost:'Cum trimit, primesc sau reclam o scrisoare ori un colet prin bpost?',
 plangere:'Am o problemă cu un serviciu public federal. Unde depun plângerea?'
};
const SIT=[
 {id:'s1',t:'Închiriez o locuință',k:'Chirie',sub:'Contract de chirie, garanție, mutare.',ic:'key',h:200,g:['garantie','locuire','adresa']},
 {id:'s2',t:'Am copii',k:'Copii',sub:'Alocații și sprijin pentru familie.',ic:'users',h:330,g:['alocatii']},
 {id:'s3',t:'Lucrez în Belgia',k:'Muncă',sub:'Salariu, program, documente de muncă.',ic:'brief',h:25,g:['salariu','ocupare']},
 {id:'s4',t:'Mașină cu număr românesc',k:'Mașină',sub:'Acte și reguli pentru mașină.',ic:'car',h:280,g:[]},
 {id:'s5',t:'Vreau să cumpăr casă',k:'Casă',sub:'Acte și pași la cumpărare.',ic:'home2',h:150,g:[]},
 {id:'s6',t:'Sunt șofer profesionist',k:'Șofer',sub:'Permis, acte și drum.',ic:'wheel',h:45,g:['permis']},
 {id:'s7',t:'Am un contract de muncă',k:'Contract',sub:'Ce scrie în contract, ce urmează.',ic:'doc',h:190,g:['salariu']},
 {id:'s8',t:'Stau în Flandra',k:'Flandra',sub:'Regulile diferă de la o regiune la alta.',ic:'pin',h:55,g:['garantie','adresa']},
 {id:'s9',t:'M-am mutat de curând',k:'Mutat',sub:'Adresă, comună, acte.',ic:'box',h:262,g:['adresa','comuna']},
 {id:'s10',t:'Am acte din România',k:'Acte RO',sub:'Traduceri, apostilă, acte oficiale.',ic:'globe',h:10,g:['apostila']}
];
const MYTHS=[
 {id:'m1',q:'Garanția locativă are aceeași formulă în toată Belgia.',a:false,why:T.warn,quotes:[{t:T.warn,page:'Avertisment din fișierul de reguli al paginii pilot',ss:['vl','bxl','wal','dg']}]},
 {id:'m2',q:'În Flandra, pentru contractele de la 1 ianuarie 2019, plafonul este trei luni de chirie.',a:true,why:REG[0].quote,quotes:[{t:REG[0].quote,s:'vl'}]},
 {id:'m3',q:'În Bruxelles plafonul este tot trei luni de chirie.',a:false,why:REG[1].quote,quotes:[{t:REG[1].quote,s:'bxl'}]},
 {id:'m4',q:'Garanția poate fi de 6 luni de chirie.',a:false,why:'În pagina pilot, pentru reședința principală privată, plafonul este de 2–3 luni de chirie, după regiune: Flandra 3; Bruxelles, Valonia și Comunitatea germanofonă 2.',quotes:REG.map(r=>({t:r.quote,s:r.src,r:r.nume}))},
 {id:'m5',q:'Un ajutor sau împrumut regional schimbă plafonul legal.',a:false,why:T.aidCap,quotes:[{t:T.aidCap,page:PAGE+', „Răspunsul complet”'}]},
 {id:'m6',q:'Dacă legea cere cont blocat pe numele chiriașului, poți vira banii în contul personal al proprietarului.',a:false,why:T.blocat,quotes:[{t:T.blocat,page:PAGE+', pasul „Cere forma și suma în scris”'}]}
];
const MYTH_TXT='Mituri: ';
/* ===== TIPARE DE MIȘCARE: fiecare e o funcție (mount, date) -> {play,reset} ===== */
function tween(node,from,to,ms,render){
 cancelAnimationFrame(node._raf);
 if(RM()||ms<=0){render(to);return}
 const t0=performance.now();
 const st=t=>{const k=clamp((t-t0)/ms,0,1),e=1-Math.pow(1-k,3);render(from+(to-from)*e);if(k<1)node._raf=requestAnimationFrame(st)};
 node._raf=requestAnimationFrame(st);
}
function replay(m){m.classList.remove('go');void m.offsetWidth;if(!RM())m.classList.add('go')}
const PAT={};
/* ===== TIPARE v3: compacte, text ≥18px, fără zoom. Tiparele „scurte” (telefoane mici) ascund doar decorul și indiciile de interfață (.hint). ===== */
/* 1. SUMĂ: număr care urcă; monede (o monedă = o lună) doar pe ecrane înalte */
PAT.amount=(m,o)=>{
 let rent=o.rent,cur=0;
 const [a,b]=o.rows;
 const col=(r,cls)=>`<div class="am-col"><div class="bx2"><div class="stack ${cls}">${Array.from({length:r.luni},(_,k)=>`<span class="coin" style="--k:${k}"><i class="cv"></i></span>`).join('')}</div></div></div>`;
 m.innerHTML=`<div class="pt"><div class="pt-sub hint">${esc(o.sub)}</div>
  <div class="am-big" aria-live="off"><span class="av">0</span><small>€</small></div><div class="am-lab">${esc(a.lab)} · ${a.luni} luni de chirie</div>
  <div class="am-oth">${esc(b.lab)} · ${b.luni} luni: <b class="oc"></b></div>
  <div class="am-stage">${col(a,'')}${col(b,'b')}</div>
  <div class="am-rng"><label><span>Chiria lunară <span class="ex">Exemplu</span></span><b class="rv"></b></label>
  <input type="range" min="${o.min}" max="${o.max}" step="${o.step}" value="${rent}" aria-label="Chiria lunară, exemplu"></div></div>`;
 const av=$('.av',m),rv=$('.rv',m),inp=$('input',m),oc=$('.oc',m),cvs=$$('.coin',m);
 const paint=v=>{av.textContent=fmt(v)};
 const sync=()=>{rv.textContent=fmt(rent)+' €';oc.textContent=fmt(rent*b.luni)+' €';cvs.forEach(c=>$('.cv',c).textContent=String(rent));inp.setAttribute('aria-valuetext',rent+' euro pe lună; garanție maximă '+fmt(rent*a.luni)+' euro')};
 sync();paint(rent*a.luni);cur=rent*a.luni;
 inp.addEventListener('input',()=>{rent=+inp.value;sync();const to=rent*a.luni;tween(av,cur,to,350,v=>{cur=v;paint(v)});cur=to});
 return{play(){replay(m);paint(0);cur=rent*a.luni;tween(av,0,cur,1500,paint)},reset(){cancelAnimationFrame(av._raf);m.classList.remove('go');paint(rent*a.luni)}};
};
/* 2. REGIUNI: hartă hexagonală (doar ecrane înalte) + bare; atingerea unei bare arată plafonul și data */
PAT.regions=(m,o)=>{
 const R=24,w=Math.sqrt(3)*R,rows=o.rows,x0=(300-5*w-w/2)/2+w/2;let sel=o.sel,n=0,cells='';
 rows.forEach((row,ri)=>[...row].forEach((ch,ci)=>{if(ch==='.')return;const id={F:'vl',B:'bxl',W:'wal',D:'dg'}[ch],r=RB[id];
  const cx=x0+w/2+ci*w+(ri%2?w/2:0),cy=6+R+ri*1.5*R;
  const pts=[0,1,2,3,4,5].map(k=>{const an=Math.PI/180*(60*k-30);return(cx+R*Math.cos(an)).toFixed(1)+','+(cy+R*Math.sin(an)).toFixed(1)}).join(' ');
  cells+=`<polygon class="hx" data-r="${id}" style="--c:${r.c};--i:${n++}" points="${pts}"/>`}));
 m.innerHTML=`<div class="pt"><div class="pt-sub hint">${esc(o.sub)}</div>
  <svg class="rg-svg" viewBox="0 0 300 168" role="img" aria-label="Hartă stilizată, nu geografică: Flandra, Bruxelles, Valonia, Comunitatea germanofonă">${cells}</svg>
  <div class="rg-bars" role="group" aria-label="Alege regiunea locuinței">${REG.map((r,i)=>`<button class="rgb" data-r="${r.id}" style="--c:${r.c};--w:${r.luni/3*100}%;--i:${i}" aria-pressed="false"><span>${esc(r.scurt)}</span><span class="tr"><span class="fl"></span></span><em>${r.luni} luni</em></button>`).join('')}</div>
  <div class="rg-det" aria-live="polite"></div></div>`;
 const det=$('.rg-det',m);
 const pick=id=>{sel=id;$$('.hx',m).forEach(h=>h.classList.toggle('on',h.dataset.r===id));$$('.rgb',m).forEach(b=>{const on=b.dataset.r===id;b.classList.toggle('on',on);b.setAttribute('aria-pressed',on)});
  const r=RB[id];det.innerHTML=`<b style="color:${r.c}">${esc(r.scurt)}</b> · ${r.luni} luni de chirie, maximum · ${r.de?'de la '+dfmt(r.de):'fără dată indicată'}`};
 m.addEventListener('click',e=>{const t=e.target.closest('[data-r]');if(t)pick(t.dataset.r)});
 pick(sel);
 return{play(){replay(m)},reset(){m.classList.remove('go')}};
};
/* 3. TERMEN / DATĂ: calendar care se întoarce + „mai ai N zile” */
PAT.calendar=(m,o)=>{
 let idx=o.items.length-1,timers=[];
 m.innerHTML=`<div class="pt">${o.sub?`<div class="pt-sub">${esc(o.sub)}</div>`:''}
  <div class="cal-row"><div class="cal-w"><div class="cal" role="img"><div class="bar"></div><div class="dy"></div><div class="yr"></div><div class="rn"></div></div></div>
  <div class="cal-chips" role="group" aria-label="Alege data">${o.items.map((it,i)=>`<button class="cc" data-i="${i}" aria-pressed="false">${esc(it.chip)}</button>`).join('')}</div></div>
  ${o.deadline?'<div class="cal-cd" aria-live="polite"><b></b><span></span></div>':''}</div>`;
 const cal=$('.cal',m),cdb=$('.cal-cd b',m),cds=$('.cal-cd span',m);const NOCD=!o.deadline;
 const fill=i=>{const it=o.items[i],[y,mo,d]=it.iso.split('-').map(Number);$('.bar',cal).textContent=MONTHS[mo-1];$('.dy',cal).textContent=d;$('.yr',cal).textContent=y;$('.rn',cal).textContent=it.cap;cal.setAttribute('aria-label',it.cap+': '+d+' '+MONTHS[mo-1]+' '+y);
  $$('.cc',m).forEach((b,k)=>b.setAttribute('aria-pressed',k===i))};
 const flip=i=>{idx=i;if(RM()){fill(i);return}cal.classList.add('fo');setTimeout(()=>{fill(i);cal.classList.remove('fo');cal.classList.add('fi');void cal.offsetWidth;cal.classList.remove('fi')},230)};
 const cd=(animate)=>{if(NOCD)return;const n=daysUntil(o.deadline.iso);cds.textContent=o.deadline.note;$('.cal-cd',m).classList.remove('wait');
  if(n>0){const set=v=>{cdb.textContent='Mai ai '+Math.round(v)+(Math.round(v)===1?' zi':' zile')};animate?tween(cdb,0,n,900,set):set(n);cdb.dataset.n=n}
  else if(n===0)cdb.textContent='Termenul e azi';else{cdb.textContent='Termenul a trecut acum '+(-n)+(n===-1?' zi':' zile');if(o.deadline.stale)cds.textContent=o.deadline.stale+'. '+o.deadline.note}};
 $('.cal-chips',m).addEventListener('click',e=>{const b=e.target.closest('.cc');if(!b)return;timers.forEach(clearTimeout);flip(+b.dataset.i)});
 fill(idx);cd(false);
 return{play(){timers.forEach(clearTimeout);timers=[];replay(m);if(RM()){fill(o.items.length-1);cd(false);return}
   if(!NOCD)$('.cal-cd',m).classList.add('wait');fill(0);idx=0;o.items.forEach((_,i)=>{if(i>0)timers.push(setTimeout(()=>flip(i),i*1500))});timers.push(setTimeout(()=>cd(true),(o.items.length-1)*1500+400))},
  reset(){timers.forEach(clearTimeout);timers=[];fill(o.items.length-1);cd(false)}};
};
/* 4. DA/NU: două uși; răspunsul e scurt, restul e pe sub-cartonașe */
const QC=r=>r.id==='bxl'?`Contractul e încheiat (Bruxelles: încheiat sau reînnoit) la sau după ${dfmt(r.de)}?`:`Contractul e încheiat la sau după ${dfmt(r.de)}?`;
PAT.branch=(m,o)=>{
 let sel=0,pick=null;
 const outs=(r,which)=>which==='y'?{cls:'ok',h:`Da — ${r.nume}: plafonul este ${r.luni} luni de chirie.`,p:`Se aplică de la ${dfmt(r.de)}.`}:{cls:'warn',h:'Nu — verifică regimul vechi.',p:`${esc(o.hintNo||'')} Prototipul nu are cifre pentru regimul vechi.`};
 const q=r=>r.q||QC(r);
 const html=()=>{const r=o.regs[sel];
  const both=false;
  return `<div class="pt"><div class="pt-sub hint">${esc(o.sub)}</div><div class="br-seg" role="group" aria-label="Alege regiunea">${o.regs.map((x,i)=>`<button class="cc" data-s="${i}" aria-pressed="${i===sel}">${esc(x.nume)}</button>`).join('')}</div>
  <div class="br-q" id="brq">${q(r)}</div>
  ${both?'':`<div class="doors" role="group" aria-labelledby="brq"><button class="dr dy" data-d="y" aria-label="Da"><span class="in">${ic('check')}</span><span class="pn">Da</span></button><button class="dr dn" data-d="n" aria-label="Nu"><span class="in">${ic('warn')}</span><span class="pn">Nu</span></button></div>`}
  <div class="br-out" aria-live="polite">${both?['y','n'].map(w=>{const x=outs(r,w);return `<div class="rmb"><b>${x.h}</b> ${x.p}</div>`}).join(''):esc(o.hint||'Atinge o ușă ca să vezi ce se aplică.')}</div></div>`};
 const render=()=>{m.innerHTML=html();pick=null;
  $$('.cc',m).forEach(b=>b.onclick=()=>{sel=+b.dataset.s;render();replay(m)});
  $$('.dr',m).forEach(d=>d.onclick=()=>choose(d.dataset.d))};
 const choose=w=>{const r=o.regs[sel],x=outs(r,w),out=$('.br-out',m);
  $$('.dr',m).forEach(d=>{const on=d.dataset.d===w;d.classList.toggle('open',on);d.classList.toggle('dim',!on)});
  out.className='br-out '+x.cls;out.innerHTML=`<b>${x.h}</b> ${x.p}`;pick=w;$('.pt',m).classList.add('ans')};
 render();
 return{play(){render();replay(m);if(!RM()){const d=$('.dr.dy',m);d&&d.animate&&d.animate([{transform:'rotateY(0)'},{transform:'rotateY(-5deg)'},{transform:'rotateY(0)'}],{duration:600,delay:500})}},reset(){render()}};
};
/* 5. PAȘI: listă verticală cu linie care se desenează; atingerea unui pas deschide sub-cartonașul lui */
PAT.steps=(m,o)=>{
 m.innerHTML=`<div class="pt"><div class="pt-sub hint">${esc(o.sub)}</div><ol class="stp">${o.nodes.map((s,i)=>`<li><button class="nd2 ${s.x?'x':''}" data-i="${i}" style="--i:${i}"><span class="no">${i+1}</span><span class="tt">${esc(s.t)}</span><span class="go-i" aria-hidden="true">›</span></button></li>`).join('')}</ol></div>`;
 m.addEventListener('click',e=>{const b=e.target.closest('.nd2');if(b){const s=o.nodes[+b.dataset.i];if(s.to)openCard(s.to)}});
 return{play(){replay(m)},reset(){m.classList.remove('go')}};
};
/* 6. CAPCANĂ: bandă de avertizare care alunecă + un singur tremur */
PAT.trap=(m,o)=>{
 const t=o.items[0];
 m.innerHTML=`<div class="pt"><div class="tp-w"><div class="hz t"></div><div class="tp-c shk${t.t?'':' nt'}" role="alert">${t.t?`<div class="tp-h">${ic('warn')}<h3>${esc(t.t)}</h3></div>`:ic('warn')}<p>${esc(t.p)}</p></div><div class="hz bt"></div></div></div>`;
 return{play(){replay(m)},reset(){m.classList.remove('go')}};
};
/* 7. ACTE: foi de hârtie care se desfac din pachet; atingerea unei foi deschide sub-cartonașul ei */
PAT.docs=(m,o)=>{
 m.innerHTML=`<div class="pt"><div class="pt-sub hint">${esc(o.sub)}</div><div class="dc-fan">${o.docs.map((d,i)=>`<button class="dcard" data-i="${i}" style="--i:${i};--k:${[200,40,330,150,270][i%5]}"><span class="w">${esc(d.w)}</span><span class="t">${esc(d.t)}</span><span class="go-i" aria-hidden="true">›</span></button>`).join('')}</div></div>`;
 m.addEventListener('click',e=>{const c=e.target.closest('.dcard');if(c){const d=o.docs[+c.dataset.i];if(d.to)openCard(d.to)}});
 return{play(){replay(m)},reset(){m.classList.remove('go')}};
};

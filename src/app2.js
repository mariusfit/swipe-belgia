/* 8. „CE FACI ACUM” / listă de bife: inel de progres + bife (+ linkuri oficiale, dacă sunt cerute) */
function ringHTML(frac,label,size){const r=30,c=2*Math.PI*r;return `<div class="ring" style="width:${size||72}px;height:${size||72}px"><svg viewBox="0 0 72 72" style="width:100%;height:100%"><circle class="bg" cx="36" cy="36" r="${r}"/><circle class="fg" cx="36" cy="36" r="${r}" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${(c*(1-frac)).toFixed(1)}"/></svg><b>${label}</b></div>`}
PAT.now=(m,o)=>{
 m.innerHTML=`<div class="pt">${o.ring===false?(o.sub?`<div class="pt-sub hint">${esc(o.sub)}</div>`:''):`<div class="ring-w"><div class="rw"></div><div class="pt-sub">${esc(o.sub)}</div></div>`}
  <div class="ck">${o.items.map(it=>`<button data-k="${it.id}" aria-pressed="false"><span class="bx">${ic('check')}</span><span>${esc(it.t)}</span></button>`).join('')}</div></div>`;
 const paint=()=>{const k=o.items.filter(i=>S.done[i.id]).length;const rw=$('.rw',m);if(rw)rw.innerHTML=ringHTML(k/o.items.length,k+'/'+o.items.length,56);
  $$('.ck button',m).forEach(b=>b.setAttribute('aria-pressed',!!S.done[b.dataset.k]))};
 m.addEventListener('click',e=>{const b=e.target.closest('.ck button');if(!b)return;const k=b.dataset.k;S.done[k]=!S.done[k];if(!S.done[k])delete S.done[k];save();paint();blip(S.done[k]?660:380);
  if(o.items.every(i=>S.done[i.id]))toast('Bravo, ai bifat tot.')});
 paint();
 return{play(){replay(m);paint()},reset(){m.classList.remove('go')},paint};
};
/* 9. TEXT (propoziții care apar pe rând, cu cifră mare opțională) — proză din ghid; max ~35 de cuvinte pe cartonaș */
PAT.read=(m,o)=>{
 const h=o.hero;
 m.innerHTML=`<div class="pt">${o.sub?`<div class="pt-sub hint">${esc(o.sub)}</div>`:''}
  ${h?`<div class="rd-hero"><b class="rd-n">${h.n}</b><span class="rd-u">${esc(h.u)}</span></div>`:''}${(h&&h.chip)||o.chip?`<i class="rd-c">${esc((h&&h.chip)||o.chip)}</i>`:''}
  <div class="rd-list">${o.sents.map((s,i)=>`<p class="rd-s" style="--i:${i}">${esc(s)}</p>`).join('')}</div>
  ${o.lit?`<blockquote class="rd-lit">Citat literal: „${esc(o.lit)}”</blockquote>`:''}</div>`;
 const n=$('.rd-n',m);
 return{play(){replay(m);if(n)tween(n,0,h.n,700,v=>{n.textContent=Math.round(v)})},reset(){m.classList.remove('go');if(n){cancelAnimationFrame(n._raf);n.textContent=h.n}}};
};
/* 10. TABEL (rânduri care urcă pe rând, cifre care cresc): grilă (puține coloane) sau „stivă” (primul câmp = titlu, restul pe rând) */
PAT.table=(m,o)=>{
 const cell=c=>typeof c==='object'&&c?c:{t:String(c)},cols=o.cols||[];
 const val=c=>c.n!=null?`<b class="cn" data-n="${c.n}" data-u="${esc(c.u||'')}">${esc(c.t)}</b>`:esc(c.t);
 const rows=o.rows.map((r,i)=>{
  const inner=o.stack?`<span class="k">${val(cell(r[0]))}</span>${r.slice(1).map((c0,j)=>`<span class="kv">${cols[j+1]?`<em>${esc(cols[j+1])}</em> `:''}${val(cell(c0))}</span>`).join('')}`
   :r.map((c0,k)=>`<span role="cell"${k===0?' class="k"':''}>${val(cell(c0))}</span>`).join('');
  const h=o.hrefs&&o.hrefs[i];
  return h?`<a class="tb-r" role="row" style="--i:${i}" href="${esc(h)}" target="_blank" rel="noopener noreferrer">${inner}${ic('ext')}</a>`:`<div class="tb-r" role="row" style="--i:${i}">${inner}</div>`}).join('');
 m.innerHTML=`<div class="pt">${o.sub?`<div class="pt-sub${o.hint?' hint':''}">${esc(o.sub)}${o.badge?` <span class="ex">${esc(o.badge)}</span>`:''}</div>`:''}
  <div class="tbl ${o.stack?'stk':'grd'}${o.block?' blk':''}${o.src?' src':''}" role="table" style="--tc:${o.tc||'1fr'}">${!o.stack&&cols.length?`<div class="tb-r hd" role="row">${cols.map(c=>`<span role="columnheader">${esc(c)}</span>`).join('')}</div>`:''}${rows}</div>${o.foot?`<p class="tb-ft">${esc(o.foot)}</p>`:''}</div>`;
 const cn=$$('.cn',m);
 return{play(){replay(m);cn.forEach(e=>{const to=+e.dataset.n,u=e.dataset.u;tween(e,0,to,900,v=>{e.textContent=fmt(v)+u})})},reset(){m.classList.remove('go');cn.forEach(e=>{cancelAnimationFrame(e._raf);e.textContent=fmt(+e.dataset.n)+e.dataset.u})}};
};

/* ===== segmente (subsecțiuni) — derivate din structura paginii pilot: Pe scurt/Răspuns, Regiuni, Date, Pași, Capcane, Acte, Surse ===== */
const SEG=[
 {id:'sum',lb:'Sumă',nm:'Sumă și răspuns',tag:'Sumă',ic:'coin',h:48},
 {id:'reg',lb:'Regiuni',nm:'Regiuni',tag:'Regiuni',ic:'map',h:205},
 {id:'dat',lb:'Date',nm:'Date și termene',tag:'Termen',ic:'cal',h:345},
 {id:'pas',lb:'Pași',nm:'Pași',tag:'Pași',ic:'route',h:265},
 {id:'cap',lb:'Capcane',nm:'Capcane',tag:'Capcană',ic:'warn',h:32},
 {id:'act',lb:'Acte',nm:'Acte',tag:'Acte',ic:'doc',h:185},
 {id:'src',lb:'Surse',nm:'Surse și încredere',tag:'Surse',ic:'book',h:130}
];
const SB=Object.fromEntries(SEG.map(s=>[s.id,s]));
const ST=k=>SRC[k];
const Q=r=>({t:r.quote,s:r.src,r:r.nume});
const QL=r=>({t:r.lit,s:r.src,r:r.nume+' · citat literal din regulile paginii'});
const claimQ=key=>(FP.claimSupport[key]||[]).map(rid=>({t:SRC[SK[rid]].n,s:SK[rid],srcOnly:1}));
const CALC=RP.graphics[0].calc.input,RENT=CALC.default;
const hiR=RB.vl,loR=RB.bxl;
/* ===== cartonașele mari (strat 1) ===== */
const CARDS=[
 {id:'c1',seg:'sum',tag:'Sumă',ic:'coin',h:48,title:'Cât poate fi garanția maximă?',pat:'amount',
  data:{sub:'Mută cursorul și vezi suma.',rent:RENT,min:CALC.min,max:CALC.max,step:CALC.step,rows:[{lab:'Flandra',luni:hiR.luni},{lab:'Bruxelles, Valonia, germanofonă',luni:loR.luni}]},
  foot:'<span class="ex">Exemplu</span> calcul ilustrativ: plafon × chirie. Dublu-tap = ♥',
  big:fmt(RENT*hiR.luni)+' €',line:`Flandra, la o chirie de ${RENT} € (exemplu). În celelalte regiuni: ${fmt(RENT*loR.luni)} €.`,
  speak:`Garanția locativă. La o chirie de opt sute de euro, plafonul maxim este două mii patru sute de euro în Flandra, adică trei luni de chirie, și o mie șase sute de euro în celelalte regiuni, adică două luni de chirie. Este doar un exemplu.`,
  kw:'garantie chirie suma plafon euro 800 2400 1600 luni exemplu bani',
  quotes:REG.flatMap(r=>[QL(r),Q(r)]),note:`Exemplul de calcul (chirie ${RENT} € → ${fmt(RENT*hiR.luni)} € în Flandra, ${fmt(RENT*loR.luni)} € în celelalte regiuni) este plafon × chirie, din fișierul de reguli, marcat „Exemplu”, nu o ofertă.`},
 {id:'c2',seg:'reg',tag:'Regiuni',ic:'map',h:205,title:'Nu există o singură formulă în Belgia',pat:'regions',
  data:{sub:'Harta e abstractă, nu geografică. Alege regiunea locuinței.',rows:['FFFF.','FFBF.','WWWWD','.WWDD'],sel:'vl',rent:RENT},
  foot:'Pagina pilot: „Alege regiunea locuinței”. Nu salvăm datele tale.',
  big:'2–3 luni',line:'Flandra 3, Bruxelles 2, Valonia 2, Comunitatea germanofonă 2 luni de chirie.',
  speak:'Belgia nu are o singură formulă pentru garanția locativă. În Flandra plafonul este trei luni de chirie. În Bruxelles, în Valonia și în Comunitatea germanofonă este de două luni de chirie.',
  kw:'regiune flandra bruxelles valonia germanofona harta plafon vlaanderen',
  quotes:[{t:T.warn,page:'Avertisment din ghidul pilot',ss:['vl','bxl','wal','dg']},...REG.flatMap(r=>[QL(r),Q(r)])]},
 {id:'c3',seg:'dat',tag:'Termen',ic:'cal',h:345,title:'Data contractului contează',pat:'calendar',
  data:{sub:'',
   items:[...[RB.vl,RB.wal,RB.bxl].sort((a,b)=>a.de<b.de?-1:1).map(r=>({iso:r.de,chip:r.scurt,cap:r.nume+', se aplică de la'})),{iso:REVERIF,chip:'Reverificare',cap:'Reverificarea cifrelor din pilot'}],
   },
  foot:'Comunitatea germanofonă: fără dată indicată.',
  big:'2019 · 2023 · 2024',line:'Flandra de la '+dfmt(RB.vl.de)+', Valonia de la '+dfmt(RB.wal.de)+', Bruxelles de la '+dfmt(RB.bxl.de)+'.',
  speak:'Data contractului contează. În Flandra plafonul se aplică de la întâi ianuarie două mii nouăsprezece. În Valonia, de la întâi iunie două mii douăzeci și trei. În Bruxelles, de la întâi noiembrie două mii douăzeci și patru. Verifică regiunea și data contractului înainte să calculezi suma.',
  kw:'termen data calendar zile contract 2019 2023 2024 reverificare',
  quotes:[Q(RB.vl),Q(RB.wal),Q(RB.bxl),{t:'Reverificare până la '+dfmt(REVERIF),page:PAGE+', banda de încredere: „'+FP.sources.length+' surse ('+FP.sources.filter(s=>s.authorityTier==='official').length+' oficiale) · reverificare până la '+dfmt(REVERIF)+'”'}],
  note:'Comunitatea germanofonă: pagina pilot nu indică o dată. „Mai ai N zile” se calculează din data de azi și privește doar reverificarea cifrelor, nu un termen legal al tău.'},
 {id:'c4',seg:'dat',tag:'Da / Nu',ic:'door',h:150,title:'Contractul tău e destul de nou?',pat:'branch',
  data:{sub:'Alege regiunea, apoi o ușă.',regs:[RB.vl,RB.bxl].map(r=>({id:r.id,nume:r.nume,luni:r.luni,de:r.de,q:QC(r)})),hint:PX.labels[7],hintNo:PX.labels[8]},
  foot:'Întrebările sunt din pagina pilot („Află în 30 de secunde”).',
  big:'Da / Nu',line:'Contractul e încheiat la sau după data de început a regulii actuale?',
  speak:'Contractul este încheiat la sau după data de început a regulii actuale? Dacă da, se aplică plafonul regiunii. Dacă nu, verifică regimul vechi.',
  kw:'da nu contract ramificare usa 2019 regim vechi mai vechi',
  quotes:[Q(RB.vl),Q(RB.bxl),{t:T.trapOld,page:PAGE+', „Capcane”'}]},
 {id:'c5',seg:'pas',tag:'Pași',ic:'route',h:265,title:'Ce faci, în ordine',pat:'steps',
  data:{sub:'Atinge un pas ca să-l deschizi.',nodes:[
   {t:PX.step1,to:'pas.1'},
   {t:stepOf('record-form-and-amount').title,to:'pas.2'},
   {t:'e-DEPO pentru garanția locativă',x:1,to:'pas.5'},
   {t:'Recuperarea garanției',x:1,to:'pas.6'}]},
  foot:'Nodurile punctate sunt ghiduri separate din „Continuă cu”.',
  big:'2 pași',line:'Alege forma permisă în regiunea ta. Cere forma și suma în scris.',
  speak:'Ce faci, în ordine. Unu: alege forma permisă în regiunea ta. Doi: cere forma și suma în scris, înainte de transfer.',
  kw:'pasi ordine forma scris cont blocat edepo e-depo recuperez',
  quotes:[{t:T.s1,page:PAGE+', „Ce faci, în ordine”, pasul 1'},{t:T.s2,page:PAGE+', pasul „Cere forma și suma în scris”'}]},
 {id:'c6',seg:'cap',tag:'Capcană',ic:'warn',h:32,title:'Atenție la capcane',pat:'trap',
  data:{items:[{t:'Ajutorul nu e contractul',p:T.trapAid}]},
  foot:'Textele sunt cele din „Capcane” de pe pagina pilot.',
  big:'Atenție',line:'Ajutorul regional și contractul cu instituția sunt decizii diferite.',
  speak:'Atenție, capcană. Ajutorul sau împrumutul regional și contractul cu instituția care constituie garanția sunt decizii diferite. Verifică separat costurile, datele, blocarea și eliberarea.',
  kw:'capcana capcane atentie ajutor imprumut contract mai vechi regim vechi',
  quotes:[{t:T.trapAid,page:PAGE+', „Capcane”'},{t:T.trapOld,page:PAGE+', „Capcane”'}]},
 {id:'c7',seg:'act',tag:'Acte',ic:'doc',h:185,title:'Ce acte păstrezi',pat:'docs',
  data:{sub:'Atinge o foaie ca s-o deschizi.',docs:[{w:'Înainte',t:DOC[0].name,to:'act.1'},{w:'După',t:DOC[1].name,to:'act.2'}]},
  foot:'Cele două documente din „Acte” de pe pagina pilot.',
  big:'Acte',line:'Contractul cu data semnării sau reînnoirii; dovada formei și sumei garanției.',
  speak:'Acte. Înainte: contractul de închiriere, cu data semnării sau reînnoirii. După: dovada formei și sumei garanției.',
  kw:'acte documente dovada contract pastrezi',
  quotes:[{t:DOC[0].name+'. '+DOC[0].note,page:PAGE+', „Acte”, Înainte'},{t:DOC[1].name+'. '+DOC[1].note,page:PAGE+', „Acte”, După'}]},
 {id:'c8',seg:'src',tag:'Ce faci acum',ic:'check',h:130,title:'Ce faci acum',pat:'now',
  data:{sub:'Text propus, neaprobat.',links:false,items:[
   {id:'d1',t:'Am verificat regiunea și data'},{id:'d2',t:'Am ales o formă permisă'},{id:'d3',t:'Am cerut totul în scris'}]},
  foot:'Linkurile duc la sursele oficiale. Se deschid doar când le atingi.',
  big:'3 de bifat',line:'Verifică regiunea și data, alege forma permisă, cere totul în scris.',
  speak:'Ce faci acum. Verifică regiunea locuinței și data contractului, alege o formă permisă și cere totul în scris, înainte de transfer. Linkurile oficiale sunt pe ecran.',
  kw:'ce faci acum link oficial surse bifa am facut inel progres',
  quotes:[{t:T.warn,page:'Avertisment din ghidul pilot',ss:['vl','bxl','wal','dg']},...Object.keys(SRC).map(k=>({t:SRC[k].n,s:k,srcOnly:1}))],note:'Cele trei bife sunt text propus, derivat din avertisment și din cei doi pași; nu sunt aprobate.'}
];
const N=CARDS.length;
/* ===== sub-cartonașele (strat 2): construite din date ===== */
const SUBS=[];
function sub(seg,id,title,pat,data,o){const s=SB[seg];SUBS.push(Object.assign({id,seg,lvl:2,tag:s.tag,ic:s.ic,h:s.h,title,pat,data,foot:'Text din ghidul pilot. „Citește tot” are textul complet.',kw:'',quotes:[],note:'',big:s.tag,line:title},o))}
const LUNI=[...new Set(REG.map(r=>r.luni))].sort((a,b)=>b-a);
/* text lung → cartonașe de maximum ~38 de cuvinte (propoziție întreagă, fără tăieri) */
const wc=s=>s.trim().split(/\s+/).length;
function chunkS(sents,max){const out=[];let cur=[],w=0;sents.forEach(s=>{const n=s.length;if(cur.length&&w+n>max){out.push(cur);cur=[];w=0}cur.push(s);w+=n});if(cur.length)out.push(cur);return out}
function readSubs(seg,id,title,data,o,sents,max=215){const ch=chunkS(sents,max);ch.forEach((c,k)=>sub(seg,k?id+'+'+(k+1):id,ch.length>1?`${title} (${k+1}/${ch.length})`:title,'read',Object.assign({},data,{sents:c},k?{hero:null,lit:null,chip:null}:{}),Object.assign({},o,{line:c[0]},k?{big:o.big}:{})))}
function rowSubs(seg,id,title,data,o,rows,per,hrefs){const n=Math.ceil(rows.length/per);for(let k=0;k<n;k++){const rs=rows.slice(k*per,(k+1)*per);sub(seg,k?id+'+'+(k+1):id,n>1?`${title} (${k+1}/${n})`:title,'table',Object.assign({},data,{rows:rs},hrefs?{hrefs:hrefs.slice(k*per,(k+1)*per)}:{},k?{badge:null,foot:null}:{}),Object.assign({},o,k&&o.alt?o.alt(rs):{}))}}
readSubs('sum','sum.sum','Rezumat: ce faci întâi',{sub:'Rezumatul ghidului pilot.'},{big:'Rezumat',quotes:claimQ('summary')},sentences(G.summary));
readSubs('sum','sum.short','Răspunsul, pe scurt',{sub:PX.labels[1]+' din pagina pilot.'},{big:'Nu o formulă',quotes:claimQ('short-answer')},SA);
sub('sum','sum.fast',`Pe scurt: ${LUNI[0]} luni sau ${LUNI[1]} luni`,'table',{sub:'',cols:['Regiune','Plafon'],tc:'1.5fr 1fr',
 rows:LUNI.map(l=>[REG.filter(r=>r.luni===l).map(r=>r.nume).join(', '),{t:l+' luni de chirie',n:l,u:' luni de chirie'}])},{big:LUNI.join(' / ')+' luni',line:'3 luni de chirie în Flandra; 2 luni în Bruxelles, Valonia și Comunitatea germanofonă.',quotes:REG.flatMap(r=>[QL(r)])});
sub('sum','sum.fast+2','Cine, câți pași, ce plafon','read',{sub:'',sents:[`Cine: ${PX.who.join(' · ')}`,`Pași: ${G.steps.length}`,`Plafon: ${LUNI[LUNI.length-1]}–${LUNI[0]} luni de chirie, după regiune`]},{big:LUNI.join(' / ')+' luni',line:'Cine, câți pași, ce plafon.'});
(()=>{const g=RP.graphics[0],ex=g.expect,key={vl:'flanders-cap',bxl:'brussels-cap',wal:'wallonia-cap',dg:'german-community-cap'},def=ex.find(e=>e.input===RENT);
 const fm=o=>fmt(o)+'\u00a0€';
 const pairs=ex.map(e=>[e]);
 pairs.forEach((pr,k)=>sub('sum',k?'sum.calc+'+(k+1):'sum.calc',`${RU.copy[0].text} (${k+1}/${pairs.length})`,'table',
  {sub:'',cols:['Chiria lunară (exemplu)',...pr.map(e=>fm(e.input))],tc:'minmax(0,1fr) auto',
   rows:REG.map(r=>[r.nume,...pr.map(e=>({t:fm(e.outputs[key[r.id]]),n:e.outputs[key[r.id]],u:'\u00a0€'}))]),
   foot:pr[0].input!==def.input?null:`Valori calculate din fișierul de reguli. La o chirie de ${def.input} € pe lună, plafonul ar fi Flandra ${fmt(def.outputs[key.vl])} €; celelalte ${fmt(def.outputs[key.bxl])} €.`},
  {big:fm(pr[0].outputs[key.vl]),line:`La o chirie de ${pr.map(e=>fm(e.input)).join(' și ')} pe lună (exemplu): Flandra ${pr.map(e=>fm(e.outputs[key.vl])).join(' și ')}; celelalte ${pr.map(e=>fm(e.outputs[key.bxl])).join(' și ')}.`,note:'Valorile sunt calculate din plafon × chirie, din fișierul de reguli al paginii pilot. Sunt exemple, nu o ofertă.',quotes:REG.map(QL)}))})();
REG.forEach(r=>{
 const nm=r.id==='dg'?'Germanofonă':r.nume,first=r.ss[0],short=wc(first)<=18;
 const hd={sub:'Plafon și dată, cu citatul literal din regulile paginii.',hero:{n:r.luni,u:'luni de chirie, maximum',chip:r.de?'Se aplică de la '+dfmt(r.de):'Fără dată indicată în pagina pilot'},lit:r.lit};
 if(short)readSubs('reg','reg.'+r.id+'.a',nm+': plafonul',hd,{big:r.luni+' luni',quotes:[QL(r),Q(r)]},[first]);
 else{sub('reg','reg.'+r.id+'.a',nm+': plafonul','read',Object.assign({sents:[]},hd),{big:r.luni+' luni',line:`${r.nume}: ${r.luni} luni de chirie, maximum.`,quotes:[QL(r),Q(r)]});
  readSubs('reg','reg.'+r.id+'.t',nm+': ce spune ghidul',{sub:''},{big:r.luni+' luni',quotes:[Q(r)]},[first])}
 if(r.ss.length>1)readSubs('reg','reg.'+r.id+'.b',nm+': formele permise',{sub:'Formele permise și ajutorul regional, din textul ghidului.'},{big:'Forme',quotes:claimQ('step:'+r.sid)},r.ss.slice(1));
});
(()=>{const dd=daysUntil(REVERIF);
 sub('dat','dat.ver','Verificat și reverificat','read',{sub:'',hero:dd>0?{n:dd,u:(dd===1?'zi':'zile')+' până la reverificare',chip:'Ilustrativ, nu e termenul tău'}:null,chip:dd>0?null:PX.stale,
  sents:[`Verificat la ${VERIF}.`,`Reverificare la cel mult ${MAXAGE} de zile după verificare, până la ${dfmt(REVERIF)}.`]},
 {big:VERIF,line:`Verificat la ${VERIF}; reverificare până la ${dfmt(REVERIF)}.`,note:'„Mai ai N zile” se calculează din data de azi și privește doar reverificarea cifrelor, nu un termen legal al tău. Data de reverificare este data verificării plus politica de maximum '+MAXAGE+' de zile din profilul de fapte.'})})();
const STAT={confirmed:'confirmat',conditional:'condiționat'};
rowSubs('dat','dat.reg','De când se aplică',{sub:'',stack:true,cols:['','Plafon','De la','Stare']},{big:'3 date',line:'Flandra '+dfmt(RB.vl.de)+', Valonia '+dfmt(RB.wal.de)+', Bruxelles '+dfmt(RB.bxl.de)+'. Comunitatea germanofonă: fără dată.',quotes:REG.map(QL)},
 REG.map(r=>{const ap=FP.applicability.find(a=>a.id===r.aid);return[r.nume,{t:r.luni+' luni',n:r.luni,u:' luni'},r.de?dfmt(r.de):'fără dată',STAT[ap.status]]}),2);
readSubs('pas','pas.1','Alege numai o formă permisă',{sub:''},{big:'Pasul 1',quotes:claimQ('step:record-form-and-amount')},[RS[0]]);
readSubs('pas','pas.2','Cere în scris, înainte de transfer',{sub:''},{big:'Pasul 2',quotes:claimQ('step:record-form-and-amount')},[RS[1]]);
sub('pas','pas.3','Nu vira în contul personal','trap',{items:[{t:'Contul proprietarului',p:RS[2]}]},{big:'Atenție',line:RS[2],quotes:claimQ('step:record-form-and-amount')});
readSubs('pas','pas.4','Ajutorul vine separat',{sub:''},{big:'Separat',quotes:claimQ('step:record-form-and-amount')},[RS[3]]);
sub('pas','pas.5','e-DEPO','table',{sub:RS[4],stack:true,block:true,src:true,cols:['','']
 ,rows:[[PX.next[0].t,PX.next[0].d]],hrefs:[PX.next[0].href]},{big:'e-DEPO',line:RS[4],quotes:claimQ('step:record-form-and-amount')});
sub('pas','pas.6','Recuperarea garanției','table',{sub:'',stack:true,block:true,src:true,cols:['',''],rows:[[PX.next[1].t,PX.next[1].d]],hrefs:[PX.next[1].href]},{big:'Recuperare',line:PX.next[1].d,quotes:claimQ('step:record-form-and-amount')});
readSubs('pas','pas.7','Înainte să semnezi',{sub:''},{big:'Verifică',quotes:claimQ('step:record-form-and-amount')},[RS[5]]);
[['cap.1','Fără formulă unică în Belgia',G.warnings[0].text,'warning:'+G.warnings[0].id],['cap.2','Contracte mai vechi',G.warnings[1].text,'warning:'+G.warnings[1].id],['cap.3','Ajutor ≠ contract',G.warnings[2].text,'warning:'+G.warnings[2].id],['cap.4','Ce se confirmă separat',FP.uncertainties[0].note,'warning:'+G.warnings[2].id]].forEach(([id,t,p,ck])=>{
 const ch=chunkS(sentences(p),205);
 ch.forEach((c,k)=>{const tx=c.join(' ');sub('cap',k?id+'+'+(k+1):id,ch.length>1?`${t} (${k+1}/${ch.length})`:t,'trap',{sub:id==='cap.4'&&!k?'Nota de incertitudine din profilul de fapte.':'',items:[{t:'',p:tx}]},{big:'Atenție',line:tx,quotes:claimQ(ck)})})});
readSubs('act','act.1','Înainte: '+DOC[0].name,{sub:'',chip:'Înainte'},{big:'Înainte',quotes:claimQ('document:'+DOC[0].id)},[DOC[0].note]);
readSubs('act','act.2','După: '+DOC[1].name,{sub:'',chip:'După'},{big:'După',quotes:claimQ('document:'+DOC[1].id)},[DOC[1].note]);
const KEEP=['plafonul regional','suma și forma','titularul contului','costurile','blocarea','dovada proprietarului','condițiile de eliberare','decizia separată pentru orice ajutor public'];
[KEEP.slice(0,4),KEEP.slice(4)].forEach((ks,k)=>sub('act','act.'+(3+k),`Ce păstrezi (${k+1}/2)`,'now',{sub:'Bife propuse, nu sunt din pagina pilot.',ring:false,items:ks.map(t=>({id:'k'+KEEP.indexOf(t),t})),links:false},{big:'Bifează',line:ks.join(', '),note:'Lista de bife este propusă, nu e din pagina pilot.'}));
const ntier=t=>FP.sources.filter(s=>s.authorityTier===t).length;
rowSubs('src','src.sum','Cât de sigure sunt datele',{sub:'',cols:['Ghid','Valoare'],tc:'auto 1fr'},{big:FP.sources.length+' surse',line:`${FP.sources.length} surse (${ntier('official')} oficiale), verificate la ${VERIF}.`},
 [['Verificat la',VERIF],['Surse',`${FP.sources.length} surse (${ntier('official')} oficiale)`],['Tip surse',`official: ${ntier('official')} · primary: ${ntier('primary')}`],['Reverificare','până la '+dfmt(REVERIF)],['Politică',`maximum ${MAXAGE} de zile`]],3);
[['vl','Flandra',['vl','vll']],['bxl','Bruxelles',['bxl','fdl']],['wal','Valonia',['wal','swcs']],['dg','Germanofonă',['dg']],['nbb','Banca Națională',['nbb']]].forEach(([id,nm,ks])=>{
 // un rând = o sursă; dacă descrierea e lungă, sursa se împarte pe două cartonașe (A: nume + descriere, B: nume + tip/domeniu/data verificării)
 const rows=[],hrefs=[],ids=[];
 ks.forEach(k=>{const s=ST(k),tag=[s.tier,s.kind,s.scope,dfmt(s.chk)].join(' · ');
  if(s.desc.length>120){rows.push([s.n,s.desc]);hrefs.push(s.u);ids.push(k);rows.push([s.n,tag]);hrefs.push(s.u);ids.push(k)}
  else{rows.push([s.n,s.desc,tag]);hrefs.push(s.u);ids.push(k)}});
 rowSubs('src','src.'+id,'Surse: '+nm,{sub:'Atinge sursa ca s-o deschizi într-o filă nouă.',hint:true,stack:true,block:true,src:true,cols:['','Ce conține','Tip']},{big:ks.length+(ks.length>1?' surse':' sursă'),line:ks.map(k=>ST(k).n).join('; '),quotes:ks.map(k=>({t:ST(k).n,s:k,srcOnly:1})),alt:null},rows,1,hrefs)});
const ALL=[...CARDS,...SUBS],BYID=Object.fromEntries(ALL.map(c=>[c.id,c]));
const subsOf=seg=>SUBS.filter(c=>c.seg===seg);
const firstOf=seg=>CARDS.findIndex(c=>c.seg===seg);
const segAll=seg=>ALL.filter(c=>c.seg===seg);
/* text complet al unui cartonaș (tot ce poate apărea pe el, inclusiv în detalii) — pentru căutare și testul „zero pierderi” */
function leaves(x,o=[]){if(x==null)return o;if(typeof x==='string')o.push(x);else if(typeof x==='number')o.push(String(x));else if(Array.isArray(x))x.forEach(y=>leaves(y,o));else if(typeof x==='object'){for(const k in x){if(k==='c'||k==='x')continue;leaves(x[k],o)}}return o}
function cardText(c,noQ){
 const qs=noQ?[]:(c.quotes||[]).flatMap(q=>[q.t,q.r,q.page,q.s&&SRC[q.s].u,...(q.ss||[]).map(k=>SRC[k].u)]);
 return [c.title,c.big,c.line,c.note,...leaves(c.data),...qs].filter(Boolean).join(' ')}
/* ===== „Citește tot”: textul complet al secțiunii / ghidului, construit din aceleași date ===== */
const P=t=>`<p>${esc(t)}</p>`,K=t=>`<p class="rl-k">${esc(t)}</p>`;
const srcLink=k=>`<a href="${esc(SRC[k].u)}" target="_blank" rel="noopener noreferrer">${esc(SRC[k].n)}</a>`;
const refs=a=>a.map(rid=>srcLink(SK[rid])).join(' · ');
const FULL={
 sum:()=>{const g=RP.graphics[0],key={vl:'flanders-cap',bxl:'brussels-cap',wal:'wallonia-cap',dg:'german-community-cap'},i=g.calc.input;
  return `<h3>Sumă și răspuns</h3>${K('Rezumat')}${P(G.summary)}${K(PX.labels[1])}${P(G.shortAnswer)}${K(PX.labels[0])}
  ${P(`Cine: ${PX.who.join(' · ')} · Pași: ${G.steps.length} · Plafon: ${LUNI[LUNI.length-1]}–${LUNI[0]} luni de chirie, după regiune`)}${LUNI.map(l=>P(l+' luni de chirie: '+REG.filter(r=>r.luni===l).map(r=>r.nume).join(', '))).join('')}
  ${K(RU.copy[0].text+' (fișierul de reguli, text propus)')}${P(RU.copy[1].text+': de la '+i.min+' la '+i.max+', pas '+i.step+', implicit '+i.default+' € pe lună (exemplu).')}
  <table class="rl-t"><tr><th>Chiria</th>${REG.map(r=>`<th>${esc(r.nume)}</th>`).join('')}</tr>${g.expect.map(e=>`<tr><td>${fmt(e.input)} €</td>${REG.map(r=>`<td>${fmt(e.outputs[key[r.id]])} €</td>`).join('')}</tr>`).join('')}</table>
  ${P(`Grafic ${g.id} (${g.type}), calcul ${g.calc.kind}, fapte: ${g.factIds.join(', ')}.`)}`},
 reg:()=>`<h3>Regiuni</h3>`+REG.map(r=>{const f=RP.facts.find(x=>x.id===r.fid);return `<h4>${esc(r.st.title)}</h4>${P(r.st.body)}${P(`Fapt ${f.id} (${f.kind}): „${f.quote}” · ${f.value} ${f.unit}`+(f.validFrom?' · de la '+dfmt(f.validFrom):'')+' · cheie '+f.claimKey+' · câmp '+f.field)}<p class="rl-s">Surse: ${f.sourceRefs.map(rid=>srcLink(SK[rid])).join(' · ')}</p>`}).join(''),
 dat:()=>`<h3>Date și termene</h3>${K('Verificare')}${P(`Verificat la ${VERIF} · ${FP.sources.length} surse (${ntier('official')} oficiale) · reverificare până la ${dfmt(REVERIF)}`)}${P(PX.stale+' (apare după data de reverificare).')}
  ${P(`Politica de reverificare: maximum ${MAXAGE} de zile. Declanșatoare: ${FP.reviewPolicy.triggers.join(', ')}.`)}${K('Aplicabilitate (profilul de fapte)')}
  <ul class="rl-u">${FP.applicability.map(a=>`<li><b>${esc(a.id)}</b> · ${esc(a.jurisdiction)} · ${esc(a.status)}${a.effectiveFrom?' · de la '+dfmt(a.effectiveFrom):''} · condiții: ${esc(a.conditions.join(', '))} · surse: ${esc(a.sourceRefs.join(', '))}</li>`).join('')}</ul>
  ${K('Incertitudini')}${FP.uncertainties.map(u=>P(u.note)+P(`${u.id} · ${u.warningClaimId} · impact: ${u.publicationImpact} · aplicabilitate: ${u.applicabilityIds.join(', ')} · surse: ${u.sourceRefs.join(', ')}`)).join('')}`,
 pas:()=>{const s=stepOf('record-form-and-amount');return `<h3>Pași</h3>${K(PX.labels[13])}${P('1. '+PX.step1)}${REG.map(r=>`<h4>${esc(r.st.title)}</h4>${P(r.st.body)}`).join('')}${P('2. '+s.title)}${P(s.body)}${K(PX.labels[19])}${PX.next.map(n=>`<h4>${esc(n.t)}</h4>${P(n.d)}<p><a href="${esc(n.href)}">${esc(n.href)}</a></p>`).join('')}`},
 cap:()=>`<h3>Capcane</h3>${G.warnings.map(w=>P(w.text)+`<p class="rl-s">${esc(w.id)}</p>`).join('')}${FP.uncertainties.map(u=>P(u.note)).join('')}`,
 act:()=>`<h3>Acte</h3>${DOC.map(d=>`<h4>${esc(d.stage==='before'?'Înainte':'După')}: ${esc(d.name)}</h4>${P(d.note)}<p class="rl-s">${esc(d.id)} · ${esc(d.stage)}</p>`).join('')}`,
 src:()=>`<h3>Surse și încredere</h3>${P(`Verificat la ${VERIF} · ${FP.sources.length} surse (${ntier('official')} oficiale) · reverificare până la ${dfmt(REVERIF)}`)}
  <ul class="rl-u">${Object.keys(SRC).map(k=>{const s=SRC[k];return `<li><a href="${esc(s.u)}" target="_blank" rel="noopener noreferrer"><b>${esc(s.n)}</b></a><br>${esc(s.desc)}<br>${esc(s.tier)} · ${esc(s.kind)} · ${esc(s.scope)} · ${esc(s.rid)} · verificat la ${dfmt(s.chk)}</li>`}).join('')}</ul>
  ${K('Ce sursă susține ce afirmație')}<ul class="rl-u">${Object.keys(FP.claimSupport).map(k=>`<li><b>${esc(k)}</b>: ${esc(FP.claimSupport[k].join(', '))}</li>`).join('')}</ul>`
};
function techHTML(){const sc=FP.scope;return `<h3>Detalii despre pagină</h3>${P(G.seoTitle)}${P(G.seoDescription)}${P(G.eyebrow+' · '+G.title)}
 ${P(`Pentru: ${G.audiences.join(', ')} · regiuni: ${G.regions.join(', ')} · categorie ${G.categoryId} · rută ${G.routeSlug}`)}${P(`Revizie conținut ${G.contentRevision} · revizie fapte ${G.factRevision} · ${G.provenance.method} (${G.provenance.sourceLanguage}) ${G.provenance.sourceRevision}`)}
 ${P(`Stare editorială ${G.editorialStatus} · traducere ${G.translationStatus} · ${G.reviewerRole} · limba ${G.lang} · ghiduri legate: ${G.relatedTranslationGroupIds.join(', ')} · grup ${G.translationGroupId}`)}
 ${P('Domeniu acoperit: '+sc.includes.join(', ')+'. În afara domeniului: '+sc.excludes.join(', ')+'.')}
 ${P(`Fișierul de reguli: versiunea ${RU.schemaVersion}, stare ${RU.status}, ${RU.translationGroupId}, ${RU.lang}, ${RU.contentRevision}, ${RU.factRevision}, ghid ${RU.guideSha256}, fapte ${RU.factProfileSha256}.`)}
 ${RU.copy.map(c=>P(`Text de grafic ${c.id}: „${c.text}” (${c.origin}, ${c.status}).`)+c.evidence.map(e=>P(`Dovadă ${e.claimKey} / ${e.field}: „${e.quote}” · ${e.sourceRefs.join(', ')}`)).join('')).join('')}
 ${RP.graphics.map(g=>P(`Grafic ${g.id} · ${g.type} · calcul ${g.calc.kind} · intrare ${g.calc.input.id} (${g.calc.input.min}–${g.calc.input.max}, pas ${g.calc.input.step}, implicit ${g.calc.input.default}, ${g.calc.input.isExample?'exemplu':'valoare reală'}) · fapte ${g.factIds.join(', ')}`)).join('')}
 ${FX.map(f=>P(`Fapt de test ${f.id} (${f.kind}): ${f.claimKey} · ${f.field}`)).join('')}
 ${P(`Profil de fapte: ${FP.translationGroupId} · ${FP.factRevision} · verificat ${dfmt(FP.lastVerified)}.`)}`}
function readHTML(scope){
 const segs=scope==='all'?SEG.map(s=>s.id):[scope];
 let h=segs.map(k=>`<section class="rl-sec" data-seg="${k}">${FULL[k]()}</section>`).join('');
 if(scope==='all')h+=`<section class="rl-sec">${techHTML()}</section>`;
 return h}

/* ===== sunet (dezactivat implicit) ===== */
let AC=null;
function blip(f=520,d=.07){if(!S.sound)return;try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();const o=AC.createOscillator(),g=AC.createGain();o.type='sine';o.frequency.value=f;g.gain.value=.05;o.connect(g);g.connect(AC.destination);o.start();g.gain.exponentialRampToValueAtTime(.0001,AC.currentTime+d);o.stop(AC.currentTime+d+.02)}catch(e){}}
/* ===== toast / live ===== */
let toastT=0;
function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('on');clearTimeout(toastT);toastT=setTimeout(()=>e.classList.remove('on'),3200)}
const say=t=>{const l=$('#live');l.textContent='';setTimeout(()=>l.textContent=t,30)};
/* ===== DECK: swipe cu pointer events, rAF, arc ===== */
function Deck(root,o){
 const d={idx:o.start||0,busy:false,last:0};let top=null,pos={x:0,y:0},drag=null,raf=0,lastDir=1;
 const W=()=>root.clientWidth||330,n=o.items.length;
 function mount(){
  root.innerHTML='';
  for(let k=Math.min(d.idx+2,n-1);k>=d.idx;k--){const c=document.createElement('div');c.className='sc d'+(k-d.idx>0?1:0);c.style.setProperty('--h',o.items[k].h);c.dataset.i=k;c.innerHTML=o.render(o.items[k],k);
   if(k===d.idx){c.setAttribute('role','group');c.setAttribute('aria-roledescription','cartonaș');c.setAttribute('aria-label',o.label(o.items[k],k))}else c.setAttribute('aria-hidden','true');root.appendChild(c)}
  top=root.querySelector('.sc:last-child');pos={x:0,y:0};if(d.idx>=n)top=null;paint();o.onIdx&&o.onIdx(d.idx)}
 function paint(){
  const w=W(),x=pos.x,y=pos.y,cs=[...root.children];
  const prog=clamp(Math.abs(x)/(w*.5),0,1);
  cs.forEach(c=>{const dep=+c.dataset.i-d.idx;
   if(dep===0){c.style.transform=`translate3d(${x}px,${y}px,0) rotate(${(x/w*16).toFixed(2)}deg)`;const yes=$('.stamp.yes',c),no=$('.stamp.no',c),p=clamp(x/(w*.3),0,1),q=clamp(-x/(w*.3),0,1);if(yes)yes.style.opacity=p;if(no)no.style.opacity=q}
   else if(dep===1){c.style.transform=`translateY(${(14*(1-prog)).toFixed(1)}px) scale(${(.95+.05*prog).toFixed(3)})`}
   else{c.style.transform=`translateY(${(28-14*prog).toFixed(1)}px) scale(${(.9+.05*prog).toFixed(3)})`}})}
 function spring(vx0){
  cancelAnimationFrame(raf);if(RM()){pos={x:0,y:0};paint();return}
  let last=performance.now(),vx=vx0||0,vy=0;const k=230,c=16;
  const st=t=>{const dt=Math.min(.032,(t-last)/1000);last=t;vx+=(-k*pos.x-c*vx)*dt;vy+=(-k*pos.y-c*vy)*dt;pos.x+=vx*dt;pos.y+=vy*dt;paint();
   if(Math.abs(pos.x)<.4&&Math.abs(pos.y)<.4&&Math.abs(vx)<8&&Math.abs(vy)<8){pos={x:0,y:0};paint();return}raf=requestAnimationFrame(st)};
  raf=requestAnimationFrame(st)}
 function fly(dir){
  if(d.busy||!top)return;d.busy=true;lastDir=dir;cancelAnimationFrame(raf);
  const tx=dir*W()*1.5,x0=pos.x,y0=pos.y,ty=y0+dir*20,dur=RM()?0:320,t0=performance.now();
  const yes=$('.stamp.yes',top),no=$('.stamp.no',top);
  const fin=()=>{const item=o.items[d.idx],i=d.idx;d.idx++;d.busy=false;mount();o.onSwipe(item,dir,i);if(d.idx>=n)o.onEnd&&o.onEnd()};
  if(!dur){if(dir>0&&yes)yes.style.opacity=1;if(dir<0&&no)no.style.opacity=1;fin();return}
  const st=t=>{const k=clamp((t-t0)/dur,0,1),e=1-Math.pow(1-k,3);pos.x=x0+(tx-x0)*e;pos.y=y0+(ty-y0)*e;paint();
   const sp=Math.max(Math.abs(pos.x)/(W()*.3),0);if(dir>0&&yes)yes.style.opacity=Math.min(1,sp);if(dir<0&&no)no.style.opacity=Math.min(1,sp);
   if(k<1)raf=requestAnimationFrame(st);else fin()};
  raf=requestAnimationFrame(st)}
 root.addEventListener('pointerdown',e=>{if(d.busy||!top||!e.target.closest('.sc:last-child'))return;if(e.button>0)return;cancelAnimationFrame(raf);
  try{top.setPointerCapture(e.pointerId)}catch(_){}drag={id:e.pointerId,x0:e.clientX-pos.x,y0:e.clientY-pos.y,vx:0,s:[{x:e.clientX,t:performance.now()}]};
  const si=$('.sc-in',top);if(si){si.style.setProperty('--rx','0deg');si.style.setProperty('--ry','0deg')}});
 root.addEventListener('pointermove',e=>{
  if(drag&&e.pointerId===drag.id){const x=e.clientX-drag.x0,y=(e.clientY-drag.y0)*.45,now=performance.now();drag.s.push({x:e.clientX,t:now});while(drag.s.length>2&&now-drag.s[0].t>110)drag.s.shift();pos.x=x;pos.y=y;paint();return}
  if(e.pointerType==='mouse'&&top&&!d.busy&&!RM()){const si=$('.sc-in',top),r=top.getBoundingClientRect();if(si&&e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom){const px=(e.clientX-r.left)/r.width-.5,py=(e.clientY-r.top)/r.height-.5;si.style.setProperty('--ry',(px*9).toFixed(1)+'deg');si.style.setProperty('--rx',(-py*7).toFixed(1)+'deg')}}});
 const end=e=>{if(!drag||e.pointerId!==drag.id)return;const sm=drag.s,sp=sm[sm.length-1].t-sm[0].t,vx=sp>=40?(sm[sm.length-1].x-sm[0].x)/sp*1000:0;drag=null;const w=W();
  if(e.type!=='pointercancel'&&(Math.abs(pos.x)>w*.3||(Math.abs(vx)>650&&Math.abs(pos.x)>30)))fly(pos.x>=0?1:-1);else spring(vx*.4)};
 root.addEventListener('pointerup',end);root.addEventListener('pointercancel',end);
 root.addEventListener('pointerleave',()=>{const si=top&&$('.sc-in',top);if(si){si.style.setProperty('--rx','0deg');si.style.setProperty('--ry','0deg')}});
 d.swipe=dir=>fly(dir);
 d.undo=()=>{if(d.busy||d.idx<=0)return false;d.idx--;mount();const it=o.items[d.idx];pos.x=lastDir*W()*1.2;pos.y=0;paint();
  if(RM()){pos={x:0,y:0};paint()}else{d.busy=true;const x0=pos.x,t0=performance.now();const st=t=>{const k=clamp((t-t0)/380,0,1),e=1-Math.pow(1-k,3);pos.x=x0*(1-e);paint();if(k<1)raf=requestAnimationFrame(st);else{d.busy=false;pos={x:0,y:0};paint()}};raf=requestAnimationFrame(st)}
  o.onUndo&&o.onUndo(it,d.idx);return true};
 d.reset=()=>{d.idx=0;d.busy=false;mount()};
 d.mount=mount;
 d.fly=fly;
 d.nudge=()=>{if(d.busy||drag||!top||RM())return;pos.x=44;pos.y=0;paint();spring(0)};
 mount();
 return d;
}

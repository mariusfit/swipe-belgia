/* ===== navigare, foi ===== */
let view='match',fluxFrom='tu';
const fluxEl=$('#flux'),subEl=$('#subf');

const scrim=$('#scrim');let openSh=null,lastFocus=null;
function openSheet(id){closeSheet(true);lastFocus=document.activeElement;openSh=$('#'+id);openSh.classList.add('on');scrim.classList.add('on');updHome();setTimeout(()=>{const f=openSh&&(openSh.querySelector('input')||openSh.querySelector('button'));f&&f.focus({preventScroll:true})},60)}
function closeSheet(quiet){if(!openSh)return;openSh.classList.remove('on');scrim.classList.remove('on');openSh=null;updHome();if(!quiet&&lastFocus&&lastFocus.focus)lastFocus.focus({preventScroll:true})}
scrim.addEventListener('click',()=>closeSheet());
$$('[data-close]').forEach(b=>b.addEventListener('click',()=>closeSheet()));
function fitFlux(){[fluxEl,subEl].forEach(el=>el.style.setProperty('--pk',1))}
const TABOF=()=>view==='flux'?(fluxFrom==='explore'?'explore':'tu'):view==='match'?'tu':view==='af'?'explore':view;
function go(v,opt){
 opt=opt||{};
 if(v==='tu'){v=(resShown||S.mo.length>=SIT.length)?'flux':'match';if(v==='flux')fluxFrom='tu'}
 if(v==='flux'&&opt.from)fluxFrom=opt.from;
 view=v;$$('.view').forEach(x=>x.hidden=x.id!=='v-'+v);
 const tb=TABOF();$$('.tab').forEach(t=>t.setAttribute('aria-selected',t.dataset.go===tb));
 if(v==='flux'){fitFlux();
  if(subOpen){activateSub(curSub,true)}else{fluxEl.scrollTop=cur*fluxEl.clientHeight;if(!opt.noAct)activate(cur,true)}updSegs()}
 if(v==='lista')buildLista();
 if(v==='explore')buildExplore();
 if(v==='match'&&!resShown){const it=SIT[deckM.idx];it&&setHue(it.h)}
 if(v==='af'){const it=MYTHS[deckA.idx];it&&setHue(it.h)}
 closeSheet(true);updHome();updBar();
}
$$('.tab').forEach(t=>t.addEventListener('click',()=>go(t.dataset.go)));
const setHue=h=>$('#phone').style.setProperty('--hue',h);

/* ===== MATCH ===== */
let deckM,resShown=false;
function hintDone(){if(S.hint.sw)return;S.hint.sw=1;save();$$('#v-match .hint,#v-af .hint').forEach(h=>h.remove())}
function mCard(s){const g=s.g.length,real=s.g.includes('garantie');
 return `<div class="sc-in"><div class="stamp yes">Mă privește</div><div class="stamp no">Nu</div><div class="glyph">${ic(s.ic)}</div><h2>${esc(s.t)}</h2><p class="sub">${esc(s.sub)}</p>
 <span class="gd ${real?'real':''}">${real?ic('check')+'Are cartonașe în prototip':g?'Ghiduri pilot: '+g+' · fără cartonașe încă':'Niciun ghid pilot încă'}</span></div>`}
function buildMatch(){
 const v=$('#v-match');resShown=false;
 v.innerHTML=`<div class="dk-head"><span>Situația <b id="mn">1</b> / ${SIT.length}</span></div>
 <div class="deck" id="deck-m"></div>
 <div class="acts"><button class="rb n" id="m-no" aria-label="Nu mă privește">${ic('x')}</button><button class="rb sm" id="m-undo" aria-label="Înapoi la cartonașul anterior">${ic('undo')}</button><button class="rb y" id="m-yes" aria-label="Mă privește">${ic('check')}</button></div>
 ${S.hint.sw?'':'<p class="hint">Trage la dreapta: mă privește. La stânga: nu.</p>'}`;
 deckM=Deck($('#deck-m'),{items:SIT,start:S.mo.length>=SIT.length?0:S.mo.length,render:mCard,
  label:(s,i)=>`Situația ${i+1} din ${SIT.length}: ${s.t}. Trage la dreapta dacă te privește, la stânga dacă nu.`,
  onIdx:i=>{const mn=$('#mn');if(mn)mn.textContent=Math.min(i+1,SIT.length);if(SIT[i]){setHue(SIT[i].h);}updBar()},
  onSwipe:(s,dir,i)=>{hintDone();S.m[s.id]=dir>0?1:0;S.mo=S.mo.slice(0,i);S.mo.push(s.id);save();blip(dir>0?660:330,.06);
   const nx=SIT[i+1];say((dir>0?'Mă privește: ':'Nu mă privește: ')+s.t+'. '+(nx?'Următoarea: '+nx.t:'Gata, vezi Match-ul.'));},
  onUndo:(s,i)=>{delete S.m[s.id];S.mo=S.mo.slice(0,i);save();say('Înapoi: '+s.t)},
  onEnd:()=>{setTimeout(showResult,380)}});
 $('#m-yes').onclick=()=>deckM.swipe(1);$('#m-no').onclick=()=>deckM.swipe(-1);$('#m-undo').onclick=()=>deckM.undo();
 updBar();
 if(S.mo.length>=SIT.length)showResult(true);else if(!S.mo.length)setTimeout(()=>{if(view==='match'&&!resShown)deckM.nudge()},1100);
}
function constellation(yes){
 const cx=170,cy=160,rx=136,ry=112,n=yes.length;
 const guides=[];yes.forEach(s=>s.g.forEach(g=>{let o=guides.find(x=>x.id===g);if(!o)guides.push(o={id:g,n:0});o.n++}));
 guides.sort((a,b)=>(b.id==='garantie')-(a.id==='garantie')||b.n-a.n);
 let seed=7;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
 let svg=`<svg id="const" viewBox="0 0 340 330" role="img" aria-label="Constelație: ${n} situații alese și ${guides.length} ghiduri potrivite">`;
 for(let i=0;i<30;i++)svg+=`<circle class="st" cx="${(rnd()*340).toFixed(0)}" cy="${(rnd()*330).toFixed(0)}" r="${(.6+rnd()*1.1).toFixed(1)}" fill="#fff" style="animation-delay:-${(rnd()*4).toFixed(1)}s"/>`;
 const sp=yes.map((s,i)=>{const a=-Math.PI/2+i*2*Math.PI/Math.max(n,1);return{s,x:cx+rx*Math.cos(a),y:cy+ry*Math.sin(a)}});
 const gp=guides.map((g,i)=>{const m=guides.length,a=-Math.PI/2+Math.PI/m+i*2*Math.PI/m;return{g,x:cx+(m===1?0:58)*Math.cos(a),y:cy+(m===1?0:46)*Math.sin(a)+(m===1?0:0)}});
 sp.forEach((p,i)=>{svg+=`<line class="ln" pathLength="1" x1="${cx}" y1="${cy}" x2="${p.x.toFixed(1)}" y2="${p.y.toFixed(1)}" stroke="hsl(${p.s.h} 80% 65%)" stroke-opacity=".25" stroke-width="1" style="--d:${(.2+i*.12).toFixed(2)}s"/>`});
 sp.forEach((p,i)=>p.s.g.forEach(g=>{const q=gp.find(z=>z.g.id===g);svg+=`<line class="ln" pathLength="1" x1="${p.x.toFixed(1)}" y1="${p.y.toFixed(1)}" x2="${q.x.toFixed(1)}" y2="${q.y.toFixed(1)}" stroke="hsl(${p.s.h} 85% 70%)" stroke-opacity=".7" stroke-width="1.6" style="--d:${(.7+i*.12).toFixed(2)}s"/>`}));
 svg+=`<circle class="nd" cx="${cx}" cy="${cy}" r="20" fill="#ffd23f" style="--d:0s"/><text x="${cx}" y="${cy+4}" text-anchor="middle" font-size="17.5" font-weight="900" fill="#1b1500">Tu</text>`;
 sp.forEach((p,i)=>{const dl=(.1+i*.12).toFixed(2);svg+=`<g class="nd" style="--d:${dl}s"><circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="21" fill="hsl(${p.s.h} 55% 20%)" stroke="hsl(${p.s.h} 90% 68%)" stroke-width="2"/><svg x="${(p.x-11).toFixed(1)}" y="${(p.y-11).toFixed(1)}" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="hsl(${p.s.h} 95% 82%)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><use href="#i-${p.s.ic}"/></svg><text x="${p.x.toFixed(1)}" y="${(p.y+38).toFixed(1)}" text-anchor="middle" font-size="17.5" font-weight="800" fill="#e7ecf8">${esc(p.s.k)}</text></g>`});
 gp.forEach((q,i)=>{svg+=`<circle class="nd" cx="${q.x.toFixed(1)}" cy="${q.y.toFixed(1)}" r="${q.g.id==='garantie'?9:6}" fill="${q.g.id==='garantie'?'#ffd23f':'#9099ae'}" style="--d:${(.9+i*.1).toFixed(2)}s"/>`});
 return {svg:svg+'</svg>',guides}
}
function showResult(instant){
 resShown=true;updBar();const v=$('#v-match'),yes=SIT.filter(s=>S.m[s.id]===1);const {svg,guides}=constellation(yes);
 const res=document.createElement('div');res.id='res';
 res.innerHTML=`<h2>Match!</h2><p class="lead">${yes.length?`Ai ales ${yes.length} ${yes.length===1?'situație':'situații'} · ${guides.length} ${guides.length===1?'ghid potrivit':'ghiduri potrivite'} <span style="color:#ffe9a0">(potrivire propusă)</span>`:'Nu ai ales nicio situație. Poți începe din nou.'}</p>${svg}
 <div class="gl" aria-label="Ghiduri potrivite">${guides.map(g=>g.id==='garantie'?`<button class="gi real" data-open="1"><span class="t">${esc(GH[g.id])}<span class="n">Are cartonașe în prototip · ${g.n} ${g.n===1?'situație':'situații'}</span></span>${ic('cdown','')}</button>`:`<div class="gi"><span class="t">${esc(GH[g.id])}<span class="n">În prototip are cartonașe doar garanția locativă</span></span></div>`).join('')}</div>
 <div class="row">${guides.some(g=>g.id==='garantie')?'<button class="btn pri" data-open="1">Vezi cartonașele garanției</button>':''}<button class="btn" id="m-again">Începe din nou</button></div>`;
 v.appendChild(res);
 $$('[data-open]',res).forEach(b=>b.onclick=()=>openFlux(0));
 $('#m-again',res).onclick=()=>{S.m={};S.mo=[];save();buildMatch()};
 setHue(yes.length?yes[0].h:210);
 if(!instant){say('Match! '+yes.length+' situații alese.');try{navigator.vibrate&&navigator.vibrate([30,50,60])}catch(e){}blip(880,.15)}
}
/* ===== FLUX (strat 1), SUBSECȚIUNI (strat 2), CITEȘTE TOT (strat 3) ===== */
let cur=0,ctl=[],io=null,subOpen=false,subSeg=null,subList=[],curSub=0,ctlS=[],ioS=null;
const curCard=()=>subOpen?subList[curSub]:CARDS[cur];
const curSeg=()=>subOpen?subSeg:CARDS[cur].seg;
const seenN=l=>l.filter(c=>S.seen[c.id]).length;
function cardHTML(c,i,n,sm){
 const lab=sm?`Subcartonaș ${i+1} din ${n}, ${SB[c.seg].nm}: ${c.title}`:`Cartonaș ${i+1} din ${n}: ${c.title}`,w=sm?'Subcartonașul':'Cartonașul',nS=subsOf(c.seg).length;
 return `<section class="fc${sm?' sm':''}" id="${sm?'sc':'fc'}${i}" style="--h:${c.h}" data-i="${i}" aria-roledescription="${sm?'subcartonaș':'cartonaș'}" aria-label="${esc(lab)}">
    <h2>${esc(c.title)}</h2><div class="fc-body"></div>
  ${sm?'':`<div class="fc-act"><button class="pill deep" data-deep="${c.seg}" aria-label="Mai adânc: ${nS} sub-cartonașe în ${esc(SB[c.seg].nm)}. Alternativ, trage cartonașul spre stânga."><span aria-hidden="true">↔ mai adânc (${nS})</span></button></div>`}
  <div class="fc-foot">${c.foot}</div></section>`}
function observe(root,cb){return new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting&&e.intersectionRatio>=.6&&view==='flux')cb(+e.target.dataset.i)}),{root,threshold:[.6]})}
function buildFlux(keep){
 fluxEl.innerHTML=CARDS.map((c,i)=>cardHTML(c,i,N,false)).join('');
 buildSegs();
 ctl=CARDS.map((c,i)=>PAT[c.pat]($('.fc-body',$('#fc'+i)),c.data));
 io&&io.disconnect();io=observe(fluxEl,i=>{if(!subOpen)activate(i)});
 $$('.fc',fluxEl).forEach(s=>io.observe(s));
 if(keep)fluxEl.scrollTop=cur*fluxEl.clientHeight;
}
function activate(i,force){
 if(i===cur&&!force&&ctl[i]._on)return;
 if(ctl[cur]&&cur!==i){ctl[cur].reset&&ctl[cur].reset();ctl[cur]._on=false}
 cur=i;ctl[i]._on=true;S.seen[CARDS[i].id]=1;save();
 ctl[i].play&&ctl[i].play();setHue(CARDS[i].h);barState();updSegs();
 say(`Cartonaș ${i+1} din ${N}: ${CARDS[i].title}. ${subsOf(CARDS[i].seg).length} sub-cartonașe, trage spre stânga sau apasă „Mai adânc”.`);
 if(!S.hint.deep&&!RM())setTimeout(()=>{if(view==='flux'&&!subOpen&&cur===i&&!S.hint.deep){S.hint.deep=1;save();const c=$('#fc'+i);if(c){c.classList.add('nudge');setTimeout(()=>c.classList.remove('nudge'),1100)}}},1500);
}
/* bara de segmente + contor */
function buildSegs(){$('#segs').innerHTML=SEG.map(s=>`<button class="sg3" data-seg="${s.id}" style="--h:${s.h}"><span class="bar"><i></i></span><span class="lb">${s.lb}</span></button>`).join('')}
function updNav(){}
function updCnt(){}
const matchedG=()=>SIT.some(s=>S.m[s.id]===1&&s.g.includes('garantie'));
function updSegs(){const cs=curSeg();$$('#segs .sg3').forEach(b=>{const id=b.dataset.seg,l=segAll(id),k=seenN(l);b.querySelector('i').style.width=(k/l.length*100)+'%';b.classList.toggle('cur',id===cs);b.classList.toggle('full',k===l.length);b.setAttribute('aria-current',id===cs?'true':'false');b.setAttribute('aria-label',`${SB[id].nm}: intră în subsecțiune, ${k} din ${l.length} cartonașe văzute`)});updCnt();updBadge()}
$('#segs').addEventListener('click',e=>{const b=e.target.closest('.sg3');if(b)enterSub(b.dataset.seg,0)});
/* sub-cartonașe */
function buildSub(seg){
 subList=subsOf(seg);const n=subList.length;
 ctlS.forEach(c=>c.reset&&c.reset());
 subEl.innerHTML=subList.map((c,i)=>cardHTML(c,i,n,true)).join('');
 ctlS=subList.map((c,i)=>PAT[c.pat]($('.fc-body',$('#sc'+i)),c.data));
 ioS&&ioS.disconnect();ioS=observe(subEl,i=>{if(subOpen)activateSub(i)});
 $$('.fc',subEl).forEach(s=>ioS.observe(s));
}
function activateSub(i,force){
 if(!subList[i])return;
 if(i===curSub&&!force&&ctlS[i]._on)return;
 if(ctlS[curSub]&&curSub!==i){ctlS[curSub].reset&&ctlS[curSub].reset();ctlS[curSub]._on=false}
 curSub=i;ctlS[i]._on=true;S.seen[subList[i].id]=1;save();ctlS[i].play&&ctlS[i].play();setHue(subList[i].h);barState();updSegs();
 say(`Subcartonaș ${i+1} din ${subList.length}, ${SB[subSeg].nm}: ${subList[i].title}`);
}
function enterSub(seg,idx,opt){
 idx=idx||0;opt=opt||{};closeSheet(true);
 if(view!=='flux'){if(CARDS[cur].seg!==seg)cur=Math.max(0,firstOf(seg));go('flux',{noAct:true,from:opt.from||fluxFrom})}
 if(subOpen&&subSeg===seg){fitFlux();subEl.scrollTo({top:idx*subEl.clientHeight,behavior:RM()?'auto':'smooth'});if(RM())activateSub(idx,true);return}
 if(CARDS[cur].seg!==seg)cur=Math.max(0,firstOf(seg));
 if(ctl[cur]&&ctl[cur]._on){ctl[cur].reset&&ctl[cur].reset();ctl[cur]._on=false}
 fluxEl.scrollTop=cur*fluxEl.clientHeight;
 subSeg=seg;subOpen=true;curSub=-1;buildSub(seg);fluxEl.inert=true;$('#sub').classList.add('on');
 fitFlux();subEl.scrollTop=idx*subEl.clientHeight;activateSub(idx,true);updHome();
 setTimeout(()=>{if(subOpen)subEl.focus({preventScroll:true})},60);
}
function exitSub(quiet){
 if(!subOpen)return;subOpen=false;$('#sub').classList.remove('on');fluxEl.inert=false;
 ctlS.forEach(c=>{c.reset&&c.reset();c._on=false});
 if(view==='flux'){fluxEl.scrollTop=cur*fluxEl.clientHeight;activate(cur,true);if(!quiet){say('Înapoi la cartonașul mare');const b=$('#fc'+cur+' .deep');b&&b.focus({preventScroll:true})}}
 updSegs();updHome();updBar();
}
function openCard(id){const c=BYID[id];if(!c)return;closeSheet(true);if(c.lvl===2)enterSub(c.seg,subsOf(c.seg).indexOf(c),{from:fluxFrom});else openFlux(CARDS.indexOf(c))}
const isDeep=()=>!!(view==='flux'&&(openSh||subOpen));
function updHome(){const b=$('#a-home');if(!b)return;const deep=isDeep(),l=deep?'Înapoi la categorie':'Acasă';b.setAttribute('aria-label',l);b.title=l;b.classList.toggle('back',deep);const u=b.querySelector('use');if(u)u.setAttribute('href',deep?'#i-backcat':'#i-home')}
function homeAct(){if(openSh){closeSheet();if(view==='flux')return}
 if(view==='flux'&&subOpen){exitSub();return}
 if(view==='match'){const v=$('#v-match');v.scrollTop=0;say('Ești deja pe pagina principală');toast('Ești deja acasă.');return}
 view='match';go('match')}
/* contextul barei: ce element e „curent” pe fiecare pagină */
function barCtx(){
 if(view==='flux')return{later:1,share:1,read:1,src:1};
 if(view==='af'){const m=deckA&&MYTHS[deckA.idx];return{src:m?1:0}}
 if(view==='match'){if(resShown)return{read:SIT.some(s=>S.m[s.id]===1&&s.g.includes('garantie'))?1:0};const s=deckM&&SIT[deckM.idx];return{read:s&&s.g.includes('garantie')?1:0}}
 if(view==='explore')return{read:1};
 return{}}
/* ===== banda Înapoi / Înainte (deasupra taburilor) ===== */
function nextBig(){return cur<N-1}
function navCtx(){
 if(view==='flux'){
  if(subOpen){const j=curSub,n=subList.length;return{t:`${j+1} din ${n}`,b:{l:'Înapoi',on:1,go:()=>j>0?scrollToCard(j-1):exitSub()},f:{l:'Înainte',on:j<n-1||nextBig(),go:()=>{if(j<n-1)scrollToCard(j+1);else if(nextBig()){exitSub(true);scrollToCard(cur+1)}}}}}
  return{t:`${cur+1} din ${N}`,b:{l:'Înapoi',on:cur>0,go:()=>scrollToCard(cur-1)},f:{l:'Înainte',on:cur<N-1,go:()=>scrollToCard(cur+1)}}}
 if(view==='match'&&!resShown&&deckM&&deckM.idx<SIT.length)return{ind:1,b:{l:'Nu'},f:{l:'Da'}};
 if(view==='af'&&deckA&&deckA.idx<MYTHS.length&&!afBusy())return{ind:1,b:{l:'Fals'},f:{l:'Adevărat'}};
 return null}
let NAVC=null,navHinted={};
function updNavbar(){
 const nb=$('#navbar');if(!nb)return;const c=navCtx();NAVC=c;const ind=!!(c&&c.ind);
 nb.classList.toggle('off',!c);nb.dataset.m=ind?'ind':'seq';
 /* Match / Adevărat-Fals: doar indicație vizuală (fără comenzi, ascunsă pentru tehnologii asistive); Flux: butoane funcționale */
 if(!c||ind)nb.setAttribute('aria-hidden','true');else nb.removeAttribute('aria-hidden');
 [['b','#nv-b'],['f','#nv-f']].forEach(([k,s])=>{const e=$(s);e.tabIndex=(c&&!ind)?0:-1;
  if(!c){e.setAttribute('aria-disabled','true');return}
  const x=c[k];e.querySelector('.nl').textContent=x.l;
  if(ind){e.removeAttribute('aria-disabled');e.setAttribute('aria-label',x.l);e.classList.remove('off');return}
  e.setAttribute('aria-label',x.al||x.l);e.setAttribute('aria-disabled',x.on?'false':'true');e.classList.toggle('off',!x.on)});
 $('#nv-i').textContent=(c&&!ind)?c.t:'';
 const hk=ind?'navi':'nav';
 if(c&&!navHinted[hk]&&!S.hint[hk]){navHinted[hk]=1;S.hint[hk]=1;save();if(!RM()){nb.classList.add('pulse');setTimeout(()=>nb.classList.remove('pulse'),4200)}}}
['b','f'].forEach(k=>$('#nv-'+k).onclick=()=>{const c=NAVC;if(!c||$('#nv-'+k).getAttribute('aria-disabled')==='true')return;c[k].go();setTimeout(updBar,60)});
const BAR_T={later:'Mai târziu',share:'Trimite',read:'Citește tot',src:'Sursa'};
function updBar(){updNavbar();const c=barCtx();Object.keys(BAR_T).forEach(k=>{const b=$('#a-'+k);if(!b)return;const on=!!c[k];b.setAttribute('aria-disabled',on?'false':'true');b.title=on?BAR_T[k]:'Nu e disponibil aici';b.classList.toggle('off',!on)})}
function barState(){updHome();updBar();const id=curCard().id;$('#a-later').setAttribute('aria-pressed',!!S.later[id]);
 const u=$('#a-up'),d=$('#a-dn');if(u){u.setAttribute('aria-pressed',S.vote[id]==='u');d.setAttribute('aria-pressed',S.vote[id]==='n')}}
function updBadge(){const k=new Set([...Object.keys(S.fav),...Object.keys(S.later)]).size;$('#bd').textContent=k||''}
function scrollToCard(i,instant){const el=subOpen?subEl:fluxEl,n=subOpen?subList.length:N;i=clamp(i,0,n-1);el.scrollTo({top:i*el.clientHeight,behavior:(instant||RM())?'auto':'smooth'});if(RM()){subOpen?activateSub(i,true):activate(i,true)}}
function openFlux(i,opt){opt=opt||{};closeSheet(true);if(subOpen)exitSub(true);if(ctl[cur]&&cur!==i){ctl[cur].reset&&ctl[cur].reset();ctl[cur]._on=false}cur=i;go('flux',{from:opt.from||(view==='explore'?'explore':fluxFrom)})}
[fluxEl,subEl].forEach(el=>el.addEventListener('click',e=>{
 const d=e.target.closest('[data-deep]');if(d){enterSub(d.dataset.deep,0);return}
 if(e.target.closest('[data-back]')){exitSub();return}
 if(e.target.closest('[data-read]'))openRead()}));
/* gest lateral: stânga = mai adânc, dreapta = înapoi */
function lateral(el,onLeft,onRight,cardEl){
 let st=null;
 el.addEventListener('pointerdown',e=>{if(e.button>0||e.target.closest('input[type=range]'))return;st={id:e.pointerId,x:e.clientX,y:e.clientY,h:false,dx:0}});
 el.addEventListener('pointermove',e=>{if(!st||e.pointerId!==st.id)return;const dx=e.clientX-st.x,dy=e.clientY-st.y;
  if(!st.h){if(Math.abs(dx)>14&&Math.abs(dx)>Math.abs(dy)*1.6){st.h=true;try{el.setPointerCapture(e.pointerId)}catch(_){}}else return}
  st.dx=dx;const c=cardEl();if(c&&!RM()){c.style.transition='none';c.style.transform=`translateX(${clamp(dx*.5,-110,110)}px)`}});
 const end=e=>{if(!st||e.pointerId!==st.id)return;const s=st;st=null;const c=cardEl();
  if(c){c.style.transition='transform .25s';c.style.transform='';setTimeout(()=>{c.style.transition=''},280)}
  if(s.h&&e.type!=='pointercancel'){if(s.dx<-56)onLeft();else if(s.dx>56)onRight()}};
 el.addEventListener('pointerup',end);el.addEventListener('pointercancel',end);
}
lateral(fluxEl,()=>enterSub(CARDS[cur].seg,0),()=>{},()=>$('#fc'+cur));
lateral(subEl,()=>{},()=>exitSub(),()=>$('#sc'+curSub));
/* inimă, dublu-tap, mai târziu, vot */
function relPos(e,box){const r=box.getBoundingClientRect(),s=r.width/box.offsetWidth||1;return{x:(e.clientX-r.left)/s,y:(e.clientY-r.top)/s}}
function burst(x,y){
 const b=document.createElement('div');b.className='burst';b.style.left=x+'px';b.style.top=y+'px';
 let h=`<svg class="ic big" aria-hidden="true"><use href="#i-heart"/></svg>`;
 if(!RM())for(let k=0;k<9;k++){const a=k/9*Math.PI*2,r=60+(k%3)*18;h+=`<svg class="ic sm" aria-hidden="true" style="--dx:${(Math.cos(a)*r).toFixed(0)}px;--dy:${(Math.sin(a)*r-16).toFixed(0)}px;--rt:${(k*40-120)}deg"><use href="#i-heart"/></svg>`}
 b.innerHTML=h;$('#v-flux').appendChild(b);setTimeout(()=>b.remove(),900)}
function setFav(on,pt){const id=curCard().id;if(on)S.fav[id]=1;else delete S.fav[id];save();barState();updBadge();if(on){const r=pt||{x:150,y:300};burst(r.x,r.y);blip(740,.09)}}
let tap=null;
[fluxEl,subEl].forEach(el=>{
 el.addEventListener('pointerdown',e=>{tap=tap&&{...tap,sx:e.clientX,sy:e.clientY}||{sx:e.clientX,sy:e.clientY};tap.down=performance.now()});
 el.addEventListener('pointerup',e=>{
  if(e.target.closest('button,a,input,label,.hx,.dcard,.nd2,.tb-r'))return;if(!tap||Math.hypot(e.clientX-tap.sx,e.clientY-tap.sy)>12){tap=null;return}
  const now=performance.now();
  if(tap.t&&now-tap.t<340&&Math.hypot(e.clientX-tap.x,e.clientY-tap.y)<44){const p=relPos(e,$('#v-flux'));setFav(true,p);tap=null;return}
  tap={t:now,x:e.clientX,y:e.clientY}})});
$('#a-home').onclick=homeAct;
const gate=(k,fn)=>$('#a-'+k).onclick=()=>{if($('#a-'+k).getAttribute('aria-disabled')==='true'){toast('Nu e disponibil aici.');return}fn()};
gate('later',()=>{const id=curCard().id;if(S.later[id]){delete S.later[id];toast('Scos din „Mai târziu”.')}else{S.later[id]=1;toast('Salvat la „Mai târziu”, în Lista mea.')}save();barState();updBadge();blip(500)});
document.addEventListener('click',e=>{const b=e.target.closest('#a-up,#a-dn');if(b)vote(b.id==='a-up'?'u':'n')});
function vote(k){const id=curCard().id;if(S.vote[id]===k)delete S.vote[id];else{S.vote[id]=k;toast(k==='u'?'Notat: util. Rămâne doar pe telefonul tău.':'Notat: neclar. Rămâne doar pe telefonul tău.')}save();barState()}
/* ===== sursa ===== */
function srcHTML(title,quotes,note){
 return `<span class="vf">${ic('check')} Verificat la ${VERIF}</span><p style="font-weight:800;margin:0 0 10px">${esc(title)}</p>${quotes.map(q=>q.srcOnly?`<div class="q" style="border-color:#62adff;background:rgba(98,173,255,.08)">${esc(q.t)}<cite><a href="${SRC[q.s].u}" target="_blank" rel="noopener noreferrer">deschide sursa oficială</a> · verificat la ${VERIF}</cite></div>`:
  `<blockquote class="q" style="margin-left:0;margin-right:0">„${esc(q.t)}”<cite>${q.r?esc(q.r)+' · ':''}${q.ss?esc(q.page)+'. Surse: '+q.ss.map(k=>esc(SRC[k].n)+' (<a href="'+SRC[k].u+'" target="_blank" rel="noopener noreferrer">sursa</a>)').join(' · '):q.s?esc(SRC[q.s].n)+' · <a href="'+SRC[q.s].u+'" target="_blank" rel="noopener noreferrer">deschide sursa</a>':esc(q.page||PAGE)} · verificat la ${VERIF}</cite></blockquote>`).join('')}
 ${note?`<p style="font-size:0.875rem;color:var(--mu)">${esc(note)}</p>`:''}<p style="font-size:0.875rem;color:var(--mu)">Citatele vin din fișierul de reguli și din ghidul paginii pilot. Textele de legătură sunt propuse, neaprobate. Prototip vizual: nu este informație oficială nouă.</p>`}
gate('src',()=>{if(view==='af'){const m=MYTHS[deckA.idx];$('#shr-t').textContent='Sursa';$('#src-b').innerHTML=srcHTML(m.q,m.quotes);openSheet('sh-src');return}const c=curCard();$('#shr-t').textContent='Sursa';$('#src-b').innerHTML=srcHTML(c.title,c.quotes,c.note);openSheet('sh-src')});
/* ===== Citește tot (strat 3) ===== */
let readMode='sec',readSeg='sum';
function paintRead(){const all=readMode==='all';
 $('#rd-b').innerHTML=`<span class="vf">${ic('check')} Verificat la ${VERIF}</span> <span class="vf" style="border-color:rgba(255,210,63,.45);background:rgba(255,210,63,.1);color:#ffe9a0">Textele aprobate din pagina pilot</span>${readHTML(all?'all':readSeg)}
 <p class="rl-note">Prototip vizual. Textele de mai sus sunt cele din ghidul pilot și din fișierul lui de reguli; nu s-a adăugat conținut juridic nou.</p>
 ${view==='flux'?`<div class="vote" role="group" aria-label="Ți-a fost util?"><span>Ți-a fost util?</span><button class="btn" id="a-up" aria-pressed="${S.vote[curCard().id]==='u'}">${ic('up')}Util</button><button class="btn" id="a-dn" aria-pressed="${S.vote[curCard().id]==='n'}">${ic('down')}Neclar</button></div>`:''}
 <a class="btn pri rd-link" href="${esc(PILOT_URL)}" target="_blank" rel="noopener noreferrer">${ic('ext')}Deschide pagina pilot (ghidul complet)</a>`;
 $('#rd-sec').setAttribute('aria-pressed',!all);$('#rd-all').setAttribute('aria-pressed',all);$('#rd-sec span').textContent=SB[readSeg].nm;$('#rd-b').scrollTop=0}
function openRead(seg,mode){readSeg=seg||curSeg();readMode=mode||'sec';paintRead();openSheet('sh-read')}
$('#rd-sec').onclick=()=>{readMode='sec';paintRead()};$('#rd-all').onclick=()=>{readMode='all';paintRead()};
gate('read',()=>{if(view==='flux')openRead();else openRead('sum','all')});

/* ===== share ===== */
let shareBlob=null,shareText='',shareName='';
function wrap(g,text,x,y,mw,lh,max){const words=text.split(' ');let line='',n=0;for(const w of words){const t=line?line+' '+w:w;if(g.measureText(t).width>mw&&line){g.fillText(line,x,y);y+=lh;line=w;if(++n>=max-1&&false)break}else line=t}g.fillText(line,x,y);return y+lh}
function shareCanvas(c){
 const W=1080,H=1350,cv=document.createElement('canvas');cv.width=W;cv.height=H;const g=cv.getContext('2d');
 const F='system-ui,"Segoe UI",Roboto,Helvetica,Arial,sans-serif';
 let gr=g.createLinearGradient(0,0,W,H);gr.addColorStop(0,`hsl(${c.h} 45% 18%)`);gr.addColorStop(1,'#090b11');g.fillStyle=gr;g.fillRect(0,0,W,H);
 gr=g.createRadialGradient(W*.85,H*.12,10,W*.85,H*.12,620);gr.addColorStop(0,`hsla(${c.h},85%,58%,.45)`);gr.addColorStop(1,'transparent');g.fillStyle=gr;g.fillRect(0,0,W,H);
 g.fillStyle='#f4f6fb';g.fillRect(72,78,14,52);g.fillStyle='#ffd23f';g.fillRect(90,78,14,52);g.fillStyle='#ff5a6b';g.fillRect(108,78,14,52);
 g.fillStyle='#fff';g.font=`900 52px ${F}`;g.textBaseline='alphabetic';g.fillText('Info Belgia',142,120);
 g.font=`800 34px ${F}`;const tag=c.tag.toUpperCase(),tw=g.measureText(tag).width+56;g.fillStyle=`hsla(${c.h},70%,55%,.28)`;g.beginPath();g.roundRect?g.roundRect(72,190,tw,64,32):g.rect(72,190,tw,64);g.fill();g.fillStyle=`hsl(${c.h} 100% 86%)`;g.fillText(tag,100,235);
 let fs=230;g.font=`900 ${fs}px ${F}`;while(g.measureText(c.big).width>930&&fs>70){fs-=6;g.font=`900 ${fs}px ${F}`}
 g.fillStyle='#ffd23f';g.fillText(c.big,72,560);
 g.fillStyle='#fff';g.font=`900 72px ${F}`;let y=wrap(g,c.title,72,690,936,82);
 g.fillStyle='#cfd6e8';g.font=`600 44px ${F}`;y=wrap(g,c.line,72,y+16,936,58);
 g.fillStyle='rgba(255,255,255,.18)';g.fillRect(72,H-210,W-144,3);
 g.fillStyle='#b5f5dc';g.font=`800 38px ${F}`;g.fillText('Verificat la '+VERIF,72,H-142);
 g.fillStyle='#aab3c8';g.font=`600 30px ${F}`;g.fillText('Prototip vizual · cifre din pagina pilot, nu informație oficială nouă',72,H-90);
 return cv}
gate('share',()=>{
 const c=curCard();const cv=shareCanvas(c);shareText=`${c.title} — ${c.big}. ${c.line} Info Belgia · Verificat la ${VERIF} · prototip vizual, cifre din pagina pilot.`;shareName='info-belgia-'+c.id+'.png';shareBlob=null;
 $('#shareprev').src=cv.toDataURL('image/png');cv.toBlob(b=>{shareBlob=b},'image/png');openSheet('sh-share')});
function dl(){if(!shareBlob){toast('Imaginea nu e gata încă, mai încearcă o dată.');return false}const u=URL.createObjectURL(shareBlob),a=document.createElement('a');a.href=u;a.download=shareName;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),2000);return true}
async function copyTxt(){try{await navigator.clipboard.writeText(shareText);return true}catch(e){try{const t=document.createElement('textarea');t.value=shareText;t.style.position='fixed';t.style.opacity='0';document.body.appendChild(t);t.select();const ok=document.execCommand('copy');t.remove();return ok}catch(_){return false}}}
$('#sh-dl').onclick=()=>{if(dl())toast('Imaginea PNG a fost descărcată.')};
$('#sh-cp').onclick=async()=>{toast(await copyTxt()?'Textul a fost copiat.':'Nu am putut copia. Selectează textul manual.')};
$('#sh-send').onclick=async()=>{
 if(!shareBlob){toast('Imaginea nu e gata încă, mai încearcă o dată.');return}
 const f=new File([shareBlob],shareName,{type:'image/png'});
 try{if(navigator.canShare&&navigator.share&&navigator.canShare({files:[f]})){await navigator.share({files:[f],title:'Info Belgia',text:shareText});toast('Trimis.');return}}catch(e){if(e&&e.name==='AbortError')return}
 const a=dl(),b=await copyTxt();toast('Trimiterea directă nu merge aici. '+(a?'Am descărcat imaginea':'')+(a&&b?' și ':'')+(b?'am copiat textul.':'.'))};
/* ===== ADEVĂRAT / FALS ===== */
let deckA;
MYTHS.forEach((m,i)=>m.h=[210,330,150,30,265,185][i]);
function aCard(m){return `<div class="sc-in"><div class="stamp yes">Adevărat</div><div class="stamp no fal">Fals</div><div class="glyph">${ic('zap')}</div><h2 style="font-size:1.5625rem">${esc(m.q)}</h2><span class="gd">Mit sau adevăr? Trage și vezi sursa</span></div>`}
function buildAF(){
 const v=$('#v-af');
 const done=MYTHS.filter(m=>m.id in S.af).length;
 v.innerHTML=`<div class="dk-head"><span>Afirmația <b id="an">1</b> / ${MYTHS.length}</span></div>
 <div class="deck" id="deck-a"></div>
 <div class="acts"><button class="rb f" id="a-fal" aria-label="Fals">${ic('x')}</button><button class="rb y" id="a-adv" aria-label="Adevărat">${ic('check')}</button></div>
 ${S.hint.sw?'':'<p class="hint">La dreapta: adevărat. La stânga: fals.</p>'}
 <div id="af-fb" role="status" aria-live="polite"></div>`;
 deckA=Deck($('#deck-a'),{items:MYTHS,start:0,render:aCard,
  label:(m,i)=>`Afirmația ${i+1} din ${MYTHS.length}: ${m.q}. Dreapta adevărat, stânga fals.`,
  onIdx:i=>{const an=$('#an');if(an)an.textContent=Math.min(i+1,MYTHS.length);if(MYTHS[i]&&view==='af')setHue(MYTHS[i].h);updBar()},
  onSwipe:(m,dir)=>{hintDone();const ok=(dir>0)===m.a;S.af[m.id]=ok?1:0;save();blip(ok?740:300,.1);
   const fb=$('#af-fb');fb.className=ok?'':'bad';fb.innerHTML=`<h3>${ic(ok?'check':'x')} ${ok?'Corect':'Nu chiar'}: era ${m.a?'adevărat':'fals'}</h3><p>${esc(m.why)}</p><div class="row" style="margin:0;justify-content:flex-start"><button class="btn" id="fb-src">${ic('book')}Arată sursa</button><button class="btn pri" id="fb-ok">Continuă</button></div>`;
   requestAnimationFrame(()=>{fb.classList.add('on');$('#fb-ok').focus({preventScroll:true});updBar()});
   $('#fb-src').onclick=()=>{$('#shr-t').textContent='Sursa';$('#src-b').innerHTML=srcHTML(m.q,m.quotes);openSheet('sh-src')};
   $('#fb-ok').onclick=()=>{fb.classList.remove('on');if(deckA.idx>=MYTHS.length)aSummary();updBar()};
   say((ok?'Corect. ':'Nu chiar. ')+m.why)}});
 $('#a-adv').onclick=()=>{if(!afBusy())deckA.swipe(1)};$('#a-fal').onclick=()=>{if(!afBusy())deckA.swipe(-1)};
 updBar();
}
const afBusy=()=>$('#af-fb')&&$('#af-fb').classList.contains('on');
function aSummary(){const k=MYTHS.filter(m=>S.af[m.id]).length;$('#deck-a').innerHTML=`<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:10px"><h2 style="font-size:4rem;font-weight:900;letter-spacing:-.05em;color:var(--yel);line-height:1">${k}<small style="font-size:1.875rem;color:var(--mu)"> din ${MYTHS.length}</small></h2><p style="color:var(--mu);max-width:260px">afirmații la care ai răspuns corect, față de pagina pilot.</p><button class="btn pri" id="af-again">Încearcă din nou</button></div>`;$('#af-again').onclick=()=>{S.af={};save();buildAF()};updBar()}
/* ===== EXPLOREAZĂ ===== */
const DOMS=[{id:'loc',t:'Locuință',ic:'home',g:['garantie','locuire','adresa']},{id:'mun',t:'Muncă',ic:'brief',g:['salariu','ocupare']},{id:'fam',t:'Familie',ic:'users',g:['alocatii']},{id:'car',t:'Mașină',ic:'car',g:['permis']},{id:'act',t:'Acte',ic:'doc',g:['comuna','apostila']},{id:'pos',t:'Poștă',ic:'box',g:['bpost']},{id:'pub',t:'Servicii publice',ic:'globe',g:['plangere']}];
let openDom='loc';
function buildExplore(){
 const v=$('#v-explore'),k=seenN(ALL);
 v.innerHTML=`<h2>Explorează</h2>
 <div class="dom">${DOMS.map(d=>{const real=d.g.includes('garantie');return `<button class="dt${real?' real':''}" data-dom="${d.id}" aria-expanded="${openDom===d.id}">${ic(d.ic)}<b>${d.t}</b><small>${d.g.length} ${d.g.length===1?'ghid':'ghiduri'}${real?' · are cartonașe':''}</small></button>`}).join('')}</div>
 <div id="dom-det" aria-live="polite"></div>
 <h3>Garanția locativă, de sus</h3>
 <div class="tiles" id="tiles">${SEG.map((s,i)=>{const l=segAll(s.id),n=seenN(l);return `<button class="tl" data-seg="${s.id}" style="--h:${s.h};--i:${i}" aria-label="${esc(s.nm)}: ${subsOf(s.id).length} sub-cartonașe, ${n} din ${l.length} văzute. Intră."><span class="tl-h">${ic(s.ic)}<em>${subsOf(s.id).length}</em></span><b>${esc(s.nm)}</b><small>${n} din ${l.length} văzute</small><span class="tl-b"><i style="width:${n/l.length*100}%"></i></span></button>`}).join('')}</div>
 <div class="row"><button class="btn pri" id="ex-go">Pornește de la primul cartonaș</button><button class="btn" id="ex-af">Adevărat sau fals (extra)</button></div>`;
 const det=$('#dom-det',v),show=()=>{const d=DOMS.find(x=>x.id===openDom);$$('.dt',v).forEach(b=>b.setAttribute('aria-expanded',b.dataset.dom===openDom));
  det.innerHTML=d?`<div class="gl">${d.g.map(g=>g==='garantie'?`<button class="gi real" data-g="1"><span class="t">${esc(GH[g])}<span class="n">Are cartonașe în prototip</span></span>${ic('cdown')}</button>`:`<div class="gi"><span class="t">${esc(GH[g])}<span class="n">În prototip are cartonașe doar garanția locativă</span></span></div>`).join('')}</div>`:'';
  $$('[data-g]',det).forEach(b=>b.onclick=()=>openFlux(0,{from:'explore'}))};
 $$('.dt',v).forEach(b=>b.onclick=()=>{openDom=openDom===b.dataset.dom?null:b.dataset.dom;show()});show();
 $$('.tl',v).forEach(b=>b.onclick=()=>enterSub(b.dataset.seg,0,{from:'explore'}));
 $('#ex-go',v).onclick=()=>openFlux(0,{from:'explore'});$('#ex-af',v).onclick=()=>go('af');
}
/* ===== LISTA MEA ===== */
function buildLista(){
 const v=$('#v-lista'),seen=seenN(ALL),doneN=['d1','d2','d3'].filter(k=>S.done[k]).length;
 const lab=c=>c.lvl===2?`Sub-cartonaș · ${esc(SB[c.seg].nm)}`:`Cartonaș ${CARDS.indexOf(c)+1} · ${esc(c.tag)}`;
 const row=(c,k)=>`<div class="li"><button class="ri" data-o="${c.id}">${ic(c.ic)}<span>${esc(c.title)}<small style="display:block;color:var(--mu);font-weight:500;font-size:0.875rem">${lab(c)}</small></span></button><button class="x" data-rm="${k}:${c.id}" aria-label="Scoate din listă: ${esc(c.title)}">${ic('x')}</button></div>`;
 const fav=ALL.map(c=>S.fav[c.id]?row(c,'fav'):'').join(''),lat=ALL.map(c=>S.later[c.id]?row(c,'later'):'').join('');
 const yes=SIT.filter(s=>S.m[s.id]===1);
 v.innerHTML=`<h2>Lista mea</h2>
 <div class="coll"><div style="flex:1"><b>Ai văzut ${seen} din ${ALL.length} cartonașe</b></div>${ringHTML(seen/ALL.length,Math.round(seen/ALL.length*100)+'%',54)}</div>
 <div class="segl">${SEG.map(s=>{const l=segAll(s.id),n=seenN(l);return `<button data-seg="${s.id}" style="--h:${s.h}" aria-label="${esc(s.nm)}: ${n} din ${l.length} văzute. Intră."><span>${esc(s.lb)}</span><span class="tl-b"><i style="width:${n/l.length*100}%"></i></span><em>${n}/${l.length}</em></button>`}).join('')}</div>
 <div class="ls"><h3>${ic('heart')} Favorite</h3>${fav||'<div class="em">Încă nimic. În Flux dă dublu-tap pe un cartonaș (sau apasă F).</div>'}
 <h3>${ic('bookmark')} Mai târziu</h3>${lat||'<div class="em">Încă nimic. În Flux apasă „Mai târziu”.</div>'}
 <h3>${ic('cards')} Situațiile mele</h3>${yes.length?`<div class="sit">${yes.map(s=>`<span>${esc(s.t)}</span>`).join('')}</div>`:'<div class="em">Alege situații în Match și apar aici.</div>'}</div>
 <div class="row" style="justify-content:flex-start"><button class="btn dng" id="l-wipe">${ic('trash')}Șterge tot</button></div>`;
 $$('[data-o]',v).forEach(b=>b.onclick=()=>openCard(b.dataset.o));
 $$('.segl [data-seg]',v).forEach(b=>b.onclick=()=>enterSub(b.dataset.seg,0));
 $$('[data-rm]',v).forEach(b=>b.onclick=()=>{const [k,id]=b.dataset.rm.split(':');delete S[k][id];save();buildLista();updBadge();barState()});
 $('#l-wipe').onclick=()=>openSheet('sh-menu');
}
/* ===== CĂUTARE (cartonașe, sub-cartonașe, ghiduri, mituri, situații) ===== */
const IDX=[...CARDS.map((c,i)=>({t:'card',title:c.title,sub:c.tag+' · cartonaș '+(i+1),n:norm(c.title+' '+c.tag+' '+c.kw+' '+cardText(c,true)),txt:cardText(c,true),go:()=>openFlux(i)})),
 ...SUBS.map(c=>({t:'sub',title:c.title,sub:SB[c.seg].nm+' · sub-cartonaș '+(subsOf(c.seg).indexOf(c)+1)+' din '+subsOf(c.seg).length,n:norm(c.title+' '+c.tag+' '+cardText(c,true)),txt:cardText(c,true),go:()=>openCard(c.id)})),
 ...Object.keys(GH).map(k=>({t:'guide',title:GH[k],sub:k==='garantie'?'Are cartonașe în prototip':'În prototip are cartonașe doar garanția locativă',n:norm(GH[k]+(k==='garantie'?' garantie chirie locativa':'')),go:k==='garantie'?()=>openFlux(0,{from:'explore'}):null})),
 ...MYTHS.map(m=>({t:'myth',title:m.q,sub:'Adevărat sau fals',n:norm(m.q+' mit adevarat fals'),go:()=>go('af')})),
 ...SIT.map(s=>({t:'sit',title:s.t,sub:'Situație din Match',n:norm(s.t+' '+s.sub),go:()=>go('match')}))];
const GROUPS={card:'Cartonașe',sub:'Sub-cartonașe (mai adânc)',guide:'Ghiduri',myth:'Adevărat sau fals',sit:'Situații'};
function hl(text,toks){const nt=norm(text);if(nt.length!==text.length)return esc(text);let marks=[];toks.forEach(t=>{let i=nt.indexOf(t);if(i>=0)marks.push([i,i+t.length])});if(!marks.length)return esc(text);marks.sort((a,b)=>a[0]-b[0]);let out='',p=0;for(const [a,b] of marks){if(a<p)continue;out+=esc(text.slice(p,a))+'<mark>'+esc(text.slice(a,b))+'</mark>';p=b}return out+esc(text.slice(p))}
function snip(e,toks){if(!e.txt)return '';const nt=norm(e.txt);if(nt.length!==e.txt.length)return '';if(toks.every(t=>norm(e.title).includes(t)))return '';let i=-1;for(const t of toks){i=nt.indexOf(t);if(i>=0)break}if(i<0)return '';const a=Math.max(0,i-28),b=Math.min(e.txt.length,i+80);return (a?'…':'')+hl(e.txt.slice(a,b),toks)+(b<e.txt.length?'…':'')}
function doSearch(){
 const q=$('#q').value.trim(),rs=$('#rs');
 if(!q){rs.innerHTML='';return}
 const toks=norm(q).split(/\s+/).filter(Boolean),hits=IDX.filter(e=>toks.every(t=>e.n.includes(t)));
 if(!hits.length){rs.innerHTML='<div class="em">Nimic găsit pentru „'+esc(q)+'”. Încearcă „garanție”, „OCMW”, „termen” sau „acte”.</div>';return}
 rs.innerHTML=Object.keys(GROUPS).map(g=>{const h=hits.filter(e=>e.t===g);return h.length?`<h4>${GROUPS[g]} (${h.length})</h4>`+h.map(e=>`<button class="ri" data-k="${IDX.indexOf(e)}"><span>${hl(e.title,toks)}<small>${esc(e.sub)}</small>${e.txt?`<small class="sn">${snip(e,toks)}</small>`:''}</span></button>`).join(''):''}).join('');
 $$('.ri',rs).forEach(b=>b.onclick=()=>{const e=IDX[+b.dataset.k];if(e.go)e.go();else toast('În prototip are cartonașe doar garanția locativă.')});
 say(hits.length+' rezultate')
}
$('#sugg').innerHTML=['garanție','chirie','termen','capcană','acte','Flandra','OCMW','800 €'].map(s=>`<button class="sg">${s}</button>`).join('');
$$('#sugg .sg').forEach(b=>b.onclick=()=>{$('#q').value=b.textContent;doSearch();$('#q').focus({preventScroll:true})});
$('#q').addEventListener('input',doSearch);

/* ===== MOD ÎN CABINĂ ===== */
const cab=$('#cab');let cabI=0,speaking=false,tok=0,cabTimer=0;
const hasTTS='speechSynthesis' in window&&'SpeechSynthesisUtterance' in window;
function cabMsg(t){const m=$('#cab-msg');m.hidden=!t;m.textContent=t||''}
function cabFill(){const c=CARDS[cabI];$('#cab-n').textContent=`Cartonaș ${cabI+1} din ${N}`;const t=$('#cab-tag');t.style.setProperty('--h',c.h);t.innerHTML=ic(c.ic)+esc(c.tag);$('#cab-big').textContent=c.big;$('#cab-ti').textContent=c.title;$('#cab-su').textContent=c.line;
 $('#cab-pv').disabled=cabI===0;$('#cab-nx').disabled=cabI===N-1;cabUi()}
function cabUi(){cab.classList.toggle('speaking',speaking);$('#cab-go span').textContent=speaking?'Oprește citirea':'Citește cu voce tare';$('#cab-go').firstElementChild.innerHTML=`<use href="#i-${speaking?'stop':'vol'}"/>`}
function roVoice(){try{return speechSynthesis.getVoices().find(v=>/^ro([-_]|$)/i.test(v.lang))}catch(e){return null}}
function cabStop(){tok++;clearTimeout(cabTimer);speaking=false;if(hasTTS)try{speechSynthesis.cancel()}catch(e){}cabUi()}
function cabRead(){
 if(speaking){cabStop();return}
 if(!hasTTS){cabMsg('Browserul acesta nu are citire cu voce. Poți citi textul mare de pe ecran.');return}
 const c=CARDS[cabI],u=new SpeechSynthesisUtterance(c.speak),v=roVoice(),my=++tok;
 if(v){u.voice=v;u.lang=v.lang;cabMsg('')}else{u.lang='ro-RO';cabMsg('Nu am găsit o voce în română pe acest telefon. Citirea poate suna greșit; poți citi și textul mare.')}
 u.rate=.95;
 u.onend=()=>{if(my!==tok)return;speaking=false;cabUi();
  cabTimer=setTimeout(()=>{if(!cab.classList.contains('on'))return;if(cabI<N-1){cabI++;cabFill();cabRead()}else cabMsg('Gata, ai ajuns la ultimul cartonaș.')},1200)};
 u.onerror=()=>{if(my!==tok)return;speaking=false;cabUi();cabMsg('Citirea nu a pornit. Poți citi textul mare.')};
 try{speechSynthesis.cancel();speechSynthesis.speak(u);speaking=true;cabUi()}catch(e){cabMsg('Citirea nu a pornit.')}}
function cabOpen(){closeSheet(true);cabI=cur;cabMsg(hasTTS?'':'Browserul acesta nu are citire cu voce. Poți citi textul mare de pe ecran.');cabFill();cab.classList.add('on');setTimeout(()=>$('#cab-go').focus({preventScroll:true}),50)}
function cabClose(){cabStop();cab.classList.remove('on');openFlux(cabI);$('#b-cab').focus({preventScroll:true})}
$('#b-cab').onclick=cabOpen;$('#cab-x').onclick=cabClose;$('#cab-go').onclick=cabRead;$('#cab-b').onclick=()=>{cabStop()};
$('#cab-pv').onclick=()=>{cabStop();cabI=Math.max(0,cabI-1);cabFill()};$('#cab-nx').onclick=()=>{cabStop();cabI=Math.min(N-1,cabI+1);cabFill()};
if(hasTTS&&speechSynthesis.addEventListener)speechSynthesis.addEventListener('voiceschanged',()=>{});
/* ===== mărime text (A− / A+): 4 trepte, implicit 2; salvat în localStorage ===== */
const FZN=['implicită','mare','foarte mare']; // minim = treapta implicită (sub ea textul ar coborî sub pragurile de lizibilitate)
function applyFz(){const k=Math.min(4,Math.max(2,S.fz||2));document.documentElement.dataset.fz=k;const e=$('#fz-s');if(e)e.textContent=`Treapta ${k-1} din 3 (${FZN[k-2]}). Urmează și setarea de mărire a textului din telefon.`;
 const m=$('#fz-m'),p=$('#fz-p');if(m)m.disabled=k<=2;if(p)p.disabled=k>=4}
function setFz(k,msg){S.fz=Math.min(4,Math.max(2,k));save();applyFz();if(msg)toast(`Mărime text: treapta ${S.fz-1} din 3 (${FZN[S.fz-2]})`)}
$('#b-fz').onclick=()=>setFz((S.fz||2)>=4?2:(S.fz||2)+1,1);
$('#fz-m').onclick=()=>setFz((S.fz||2)-1,1);$('#fz-p').onclick=()=>setFz((S.fz||2)+1,1);
/* ===== meniu / setări / șterge ===== */
$('#b-menu').onclick=()=>{$('#sw-snd').setAttribute('aria-checked',S.sound);$('#sw-rm').setAttribute('aria-checked',S.rm);openSheet('sh-menu')};
$('#sw-snd').onclick=e=>{S.sound=!S.sound;e.currentTarget.setAttribute('aria-checked',S.sound);save();if(S.sound)blip(660,.1)};
$('#sw-rm').onclick=e=>{S.rm=!S.rm;e.currentTarget.setAttribute('aria-checked',S.rm);document.documentElement.classList.toggle('rm',S.rm);save();const so=subOpen,ss=subSeg,sc=curSub;if(so)exitSub(true);buildFlux(true);if(view==='flux')activate(cur,true);if(so)enterSub(ss,sc)};
let wipeArm=0;
$('#b-wipe').onclick=()=>{const b=$('#b-wipe'),sp=$('span',b);
 if(!wipeArm){wipeArm=setTimeout(()=>{wipeArm=0;sp.textContent='Șterge tot'},4000);sp.textContent='Sigur? Apasă încă o dată';return}
 clearTimeout(wipeArm);wipeArm=0;sp.textContent='Șterge tot';try{localStorage.removeItem(KEY)}catch(e){}S=defaults();mem=null;document.documentElement.classList.remove('rm');applyFz();
 exitSub(true);cur=0;buildMatch();buildFlux();buildAF();updBadge();updCnt();closeSheet(true);go('match');toast('Am șters tot de pe acest telefon.')};
/* ===== tastatură ===== */
addEventListener('keydown',e=>{
 if(e.key==='Tab'&&openSh){const f=$$('button:not(:disabled),input,a[href]',openSh).filter(x=>x.offsetParent!==null);if(f.length){const a=f[0],z=f[f.length-1];if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus({preventScroll:true})}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus({preventScroll:true})}}return}
 if(e.key==='Escape'){if(openSh){closeSheet();return}if(cab.classList.contains('on')){cabClose();return}if(view==='flux'&&subOpen){exitSub();return}}
 if(openSh||cab.classList.contains('on'))return;
 if(e.target.matches&&e.target.matches('input,textarea,select'))return;
 if(e.key==='ArrowRight'||e.key==='ArrowLeft'){const d=e.key==='ArrowRight'?1:-1;
  if(view==='match'&&!resShown){e.preventDefault();deckM.swipe(d)}else if(view==='af'&&!afBusy()){e.preventDefault();deckA.swipe(d)}
  else if(view==='flux'){if(!subOpen&&d<0){e.preventDefault();enterSub(CARDS[cur].seg,0)}else if(subOpen&&d>0){e.preventDefault();exitSub()}}}
 else if(e.key==='h'||e.key==='H'||e.key==='Home'){e.preventDefault();homeAct()}
 else if(view==='flux'){
  const i=subOpen?curSub:cur;
  if(['ArrowDown','PageDown'].includes(e.key)){e.preventDefault();scrollToCard(i+1)}
  else if(['ArrowUp','PageUp'].includes(e.key)){e.preventDefault();scrollToCard(i-1)}
  else if(e.key==='f'||e.key==='F'){setFav(!S.fav[curCard().id],{x:195,y:300})}
  else if(e.key==='r'||e.key==='R'){openRead()}}
});
/* ===== încadrare pe desktop ===== */
function fit(){const ph=$('#phone');if(innerWidth>520){ph.style.setProperty('--sc',Math.min(1,(innerHeight-24)/866).toFixed(3))}else ph.style.removeProperty('--sc')}
addEventListener('resize',()=>{fit();fitFlux()});fit();
/* ===== pornire ===== */
applyFz();buildMatch();buildFlux();buildAF();updBadge();updCnt();
go('tu');
window.__sb={setFz,get S(){return S},go,openFlux,openCard,enterSub,exitSub,openRead,CARDS,SUBS,SEG,ALL,SIT,MYTHS,RAW,sentences,cardText,readHTML,techHTML,PX,SRC,REG,get deckM(){return deckM},get deckA(){return deckA},get cur(){return cur},get curSub(){return curSub},get subOpen(){return subOpen},get subSeg(){return subSeg},get view(){return view},seenN,daysUntil,
 corpus(){const tmp=document.createElement('div'),txt=h=>{tmp.innerHTML=h;return tmp.textContent+' '+$$('a[href]',tmp).map(a=>a.getAttribute('href')).join(' ')};
  return{cards:CARDS.map(c=>({id:c.id,text:cardText(c,true),withQ:cardText(c)})),subs:SUBS.map(c=>({id:c.id,seg:c.seg,text:cardText(c,true),withQ:cardText(c)})),read:txt(readHTML('all')),readSeg:Object.fromEntries(SEG.map(s=>[s.id,txt(readHTML(s.id))]))}}};

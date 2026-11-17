'use strict';
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const experiments=window.ARENA.experiments;
const expDialog=$('#experimentDialog'),imageDialog=$('#imageDialog');
let priorFocus=null;
function renderExperiments(filter='All'){
 $('#experimentGrid').innerHTML=experiments.filter(e=>filter==='All'||e.category===filter).map(e=>`<a class="experiment-card" href="#experiment=${e.id}"><div class="thumb"><span class="card-number">${e.number}</span><img loading="lazy" src="${e.image}" alt="${esc(e.title)}: ${esc(e.question)}"></div><span class="card-category">${e.category}</span><h3>${e.title}</h3><p>${e.summary}</p><span class="card-link">Explore experiment <span aria-hidden="true"><span class="arrow-up" aria-hidden="true"></span></span></span></a>`).join('');
}
function mediaMarkup(m){return m.type==='video'?`<figure><video controls playsinline preload="metadata" src="${esc(m.src)}"></video><figcaption>${esc(m.caption)}</figcaption></figure>`:`<figure><img loading="lazy" src="${esc(m.src)}" alt="${esc(m.caption)}"><figcaption>${esc(m.caption)}</figcaption></figure>`;}
function openExperiment(id){
 const e=experiments.find(e=>e.id===id);if(!e)return;
 $('#experimentContent').innerHTML=`<article class="experiment-body"><div class="section-label">EXPERIMENT ${e.number} / ${e.category.toUpperCase()}</div><h2 id="experimentTitle">${e.title}</h2><p class="question">${e.question}</p><p>${e.summary}</p><div class="design">${e.design}</div><figure><button class="image-expand" data-image="${e.figure}" data-caption="${esc(e.reference)}"><img src="${e.figure}" alt="${esc(e.title)} evidence from the manuscript"><span>Enlarge figure <span class="arrow-up" aria-hidden="true"></span></span></button><figcaption>${e.reference}. Original manuscript figure or supplied marker photograph.</figcaption></figure><h3>How the test was performed</h3><p>${e.method}</p><div class="finding"><h3>What the test showed</h3><p>${e.finding}</p><div class="experiment-metric">${e.metric}<small>${e.metricLabel}</small></div></div><h3>How to interpret this result</h3><p>${e.limit}</p>${e.media.length?'<h3>Additional media</h3>'+e.media.map(mediaMarkup).join(''):''}<p class="source-note">Source: author manuscript, 17 November 2026. ${e.reference}. See the manuscript for metric definitions and acceptance criteria.</p><a class="button dark" href="assets/manuscript.pdf" target="_blank" rel="noopener">Open full manuscript <span class="arrow-up" aria-hidden="true"></span></a></article>`;
 expDialog.setAttribute('aria-labelledby','experimentTitle');
 if(!expDialog.open){priorFocus=document.activeElement;expDialog.showModal();}expDialog.scrollTop=0;
}
function route(){const hash=location.hash;if(hash.startsWith('#experiment='))openExperiment(decodeURIComponent(hash.slice(12)));else if(expDialog.open)expDialog.close();}
function closeExperiment(){expDialog.close();if(location.hash.startsWith('#experiment='))history.replaceState(null,'','#experiments');priorFocus?.focus();}
function openImage(src,caption){$('#largeImage').src=src;$('#largeImage').alt=caption;$('#largeCaption').textContent=caption;imageDialog.showModal();}
function renderFlight(){
 const maneuver=$('#maneuver').value,n=Number($('#fleet').value),single=n===1,index=[2,3,6].indexOf(n);
 const datum=single?window.ARENA.single.find(x=>x[0]===maneuver).slice(1):window.ARENA.multi[maneuver][index];
 $('#flightCondition').textContent=`${maneuver.toUpperCase()} / ${n} ${n===1?'DRONE':'DRONES'}`;
 $('#rmseLabel').textContent=single?'Mean flight tracking RMSE':'Mean session tracking RMSE';
 $('#rmseValue').innerHTML=`${datum[0].toFixed(3)} <small>cm</small>`;
 $('#rmseUncertainty').textContent=`± ${datum[1].toFixed(3)} cm sample SD across three ${single?'flights':'sessions'}`;
 $('#separation').innerHTML=single?'Single-drone trial; inter-drone separation is not applicable.':`<strong>${datum[2].toFixed(3)} m</strong> minimum sampled separation across three sessions`;
 $('#aggregation').textContent=single?'The RMSE is summarized across three flights. The chart compares reported means and sample standard deviations; it does not reconstruct a flight trajectory.':'Session RMSE first averages individual drone RMSE values within each session, then summarizes three sessions. Sampled separation does not establish continuous-time clearance.';
 $('#flightDetail').href=`#experiment=${single?'single':'multi'}`;
 const clip=window.ARENA.flightVideos[`${maneuver}-${n}`];
 if(clip){$('#flightVisual').innerHTML=`<video controls playsinline preload="metadata" src="${esc(clip.src)}"></video>`;$('#flightCaption').textContent=`${clip.caption} Session: ${clip.session}. Metrics shown summarize all three repetitions.`;}
 else{
 const values=[window.ARENA.single.find(x=>x[0]===maneuver).slice(1),...window.ARENA.multi[maneuver]];
 const sizes=[1,2,3,6], max=Math.max(...values.map(d=>d[0]+d[1]))*1.22;
 const y=v=>230-(v/max)*170;
 const bars=values.map((d,i)=>{const x=80+i*105,selected=sizes[i]===n;return `<rect x="${x}" y="${y(d[0])}" width="48" height="${230-y(d[0])}" rx="2" fill="${selected?'#197269':'#cad8ce'}"/><path d="M${x+24} ${y(d[0]+d[1])}V${y(d[0]-d[1])}M${x+17} ${y(d[0]+d[1])}h14M${x+17} ${y(d[0]-d[1])}h14" stroke="#182c32" stroke-width="1.5"/><text x="${x+24}" y="${y(d[0]+d[1])-12}" text-anchor="middle" fill="#182c32" font-size="13">${d[0].toFixed(3)}</text><text x="${x+24}" y="254" text-anchor="middle" fill="#617077" font-size="12">${sizes[i]} ${sizes[i]===1?'drone':'drones'}</text>`;}).join('');
 const ticks=[0,.5,1].map(t=>{const v=max*t;return `<path d="M58 ${y(v)}H470" stroke="#e0e6df"/><text x="48" y="${y(v)+4}" text-anchor="end" fill="#617077" font-size="10">${v.toFixed(1)}</text>`;}).join('');
 $('#flightVisual').innerHTML=`<svg viewBox="0 0 510 280" role="img" aria-label="${maneuver} tracking RMSE in centimetres for one, two, three and six drones. Bars show means and error lines show sample standard deviations."><text x="58" y="24" fill="#182c32" font-size="13">${maneuver} · tracking RMSE (cm)</text>${ticks}${bars}</svg>`;
 $('#flightCaption').textContent='Values transcribed from manuscript Tables 13 and 15. Error bars: sample SD across three flights or sessions. One-drone values summarize flight RMSE; multi-drone values summarize session RMSE. Selected condition is highlighted. Condition-specific footage has not yet been added.';
 }
}
renderExperiments();renderFlight();
$('#trackingTable').innerHTML=window.ARENA.single.map(([name,mean,sd])=>`<tr><th scope="row">${name}</th><td>${mean.toFixed(3)} ± ${sd.toFixed(3)}</td>${window.ARENA.multi[name].map(d=>`<td>${d[0].toFixed(3)} ± ${d[1].toFixed(3)}</td>`).join('')}</tr>`).join('');
document.addEventListener('click',e=>{
 const filter=e.target.closest('[data-filter]');if(filter){document.querySelectorAll('[data-filter]').forEach(b=>{b.classList.toggle('active',b===filter);b.setAttribute('aria-pressed',String(b===filter));});renderExperiments(filter.dataset.filter);}
 const img=e.target.closest('[data-image]');if(img)openImage(img.dataset.image,img.dataset.caption);
 if(e.target.closest('#experimentDialog .close'))closeExperiment();
 if(e.target.closest('#imageDialog .close'))imageDialog.close();
 if(e.target.closest('#nav a')){$('#nav').classList.remove('open');$('#menu').setAttribute('aria-expanded','false');}
});
expDialog.addEventListener('cancel',e=>{e.preventDefault();closeExperiment();});
for(const d of [expDialog,imageDialog])d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom){if(d===expDialog)closeExperiment();else d.close();}}});
$('#menu').addEventListener('click',()=>{const open=$('#nav').classList.toggle('open');$('#menu').setAttribute('aria-expanded',String(open));});
$('#maneuver').addEventListener('change',renderFlight);$('#fleet').addEventListener('change',renderFlight);
const hero=$('#heroVideo'),toggle=$('#videoToggle');
function videoLabel(){toggle.textContent=hero.paused?'Play video':'Pause video';toggle.setAttribute('aria-label',hero.paused?'Play background video':'Pause background video');}
toggle.addEventListener('click',async()=>{if(hero.paused){try{await hero.play();}catch{toggle.textContent='Video unavailable';}}else hero.pause();videoLabel();});
hero.addEventListener('pause',videoLabel);hero.addEventListener('play',videoLabel);
if(matchMedia('(prefers-reduced-motion: reduce)').matches){hero.autoplay=false;hero.pause();}hero.addEventListener('error',()=>{toggle.textContent='Video unavailable';});
$('#copyBibtex').addEventListener('click',async()=>{try{await navigator.clipboard.writeText($('#bibtex').textContent);$('#copyStatus').textContent='Citation copied.';}catch{$('#copyStatus').textContent='Select and copy the citation above.';}});
window.addEventListener('hashchange',route);route();

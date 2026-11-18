'use strict';
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const experiments=window.ARENA.experiments;
const expDialog=$('#experimentDialog'),imageDialog=$('#imageDialog');
let priorFocus=null;
const catalog=window.ARENA_MEDIA;
const mediaDialog=$('#mediaDialog');
const mediaById=new Map(catalog.animations.map(m=>[m.id,m]));
for(const e of experiments){e.media=[...e.media,...catalog.photos.filter(m=>m.experiment===e.id),...catalog.animations.filter(m=>m.experiment===e.id)];}
function gifCard(m){return `<article class="animation-card"><button class="gif-preview" data-gif="${esc(m.id)}" aria-label="Open animation: ${esc(m.title)}"><img loading="lazy" decoding="async" src="${esc(m.poster)}" alt="Still preview of ${esc(m.title)}"><span class="gif-badge">${esc(m.code)} · GIF</span><span class="gif-open">Open animation <span class="arrow-up" aria-hidden="true"></span></span></button><div class="animation-card-copy"><span class="card-category">${esc(m.mode)}</span><h3>${esc(m.title)}</h3><p>${esc(m.caption)}</p><span class="file-size">${(m.bytes/1048576).toFixed(1)} MB · ${m.frames} frames</span></div></article>`;}
function photoCard(m){return `<figure class="photo-card"><button class="image-expand" data-image="${esc(m.src)}" data-caption="${esc(m.caption)}"><img loading="lazy" decoding="async" src="${esc(m.src)}" alt="${esc(m.title)}"><span>Enlarge photograph <span class="arrow-up" aria-hidden="true"></span></span></button><figcaption><strong>${esc(m.title)}</strong><span>${esc(m.caption)}</span></figcaption></figure>`;}
let galleryLimit=9,currentGif=null;
function renderGallery(){
 const f=$('#animationFilter').value;
 const list=catalog.animations.filter(m=>f==='all'||(f==='capture'?['markers','volume','stability','calibration'].includes(m.experiment):m.experiment===f));
 $('#animationGrid').innerHTML=list.slice(0,galleryLimit).map(gifCard).join('');
 $('#animationCount').textContent=`${Math.min(galleryLimit,list.length)} of ${list.length} animations`;
 $('#moreAnimations').hidden=galleryLimit>=list.length;
}
function openGif(id){
 const m=mediaById.get(id);if(!m)return;currentGif=m;
 $('#mediaCode').textContent=`${m.code} / MATLAB GIF`;
 $('#mediaMode').textContent=m.mode.toUpperCase();$('#mediaTitle').textContent=m.title;
 $('#gifImage').src=m.poster;$('#gifImage').alt=`Still preview: ${m.title}`;
 $('#mediaCaption').textContent=m.caption;
 $('#mediaSession').textContent=m.session?`Illustrated session: ${m.session}. Metrics inside this GIF refer to its recorded session or diagnostic. Tracking summaries elsewhere on the page aggregate three repetitions.`:'This animation visualizes recorded experimental data or their summaries. Playback and display transformations follow the annotations in the GIF.';
 $('#mediaExperiment').href=`#experiment=${m.experiment}`;
 $('#gifDownload').href=m.src;$('#gifDownload').download=m.src.split('/').pop();
 $('#gifPlay').disabled=false;$('#gifStop').disabled=true;$('#gifRestart').disabled=true;
 $('#gifStatus').textContent=`Original GIF · ${(m.bytes/1048576).toFixed(1)} MB. Select Play GIF to load.`;
 mediaDialog.showModal();mediaDialog.scrollTop=0;
}
function stopGif(){if(!currentGif)return;$('#gifImage').src=currentGif.poster;$('#gifImage').alt=`Still preview: ${currentGif.title}`;$('#gifPlay').disabled=false;$('#gifStop').disabled=true;$('#gifRestart').disabled=true;$('#gifStatus').textContent='Stopped. Play starts from the beginning.';}
function playGif(restart=false){
 if(!currentGif)return;const m=currentGif,img=$('#gifImage');
 $('#gifStatus').textContent='Loading original GIF…';$('#gifPlay').disabled=true;$('#gifStop').disabled=false;
 img.onload=()=>{if(currentGif?.id===m.id&&img.getAttribute('src')===m.src){$('#gifStatus').textContent='Playing GIF · recorded timestamps and units appear in the graphic.';$('#gifRestart').disabled=false;}};
 img.onerror=()=>{$('#gifStatus').textContent='The GIF could not be loaded. Retry or use Download GIF.';$('#gifPlay').disabled=false;};
 if(restart)img.removeAttribute('src');img.alt=m.title;img.src=m.src;
}
function closeGif(){mediaDialog.close();}
mediaDialog.addEventListener('close',()=>{const img=$('#gifImage');img.onload=null;img.onerror=null;img.removeAttribute('src');currentGif=null;});
$('#gifPlay').addEventListener('click',()=>playGif());$('#gifStop').addEventListener('click',stopGif);$('#gifRestart').addEventListener('click',()=>playGif(true));
$('#mediaExperiment').addEventListener('click',()=>{const id=currentGif?.experiment;closeGif();if(id&&location.hash===`#experiment=${id}`)openExperiment(id);});
$('#animationFilter').addEventListener('change',()=>{galleryLimit=9;renderGallery();});
$('#moreAnimations').addEventListener('click',()=>{galleryLimit+=9;renderGallery();});
$('#photoGrid').innerHTML=catalog.photos.map(photoCard).join('');renderGallery();

function renderExperiments(filter='All'){
 $('#experimentGrid').innerHTML=experiments.filter(e=>filter==='All'||e.category===filter).map(e=>`<a class="experiment-card" href="#experiment=${e.id}"><div class="thumb"><span class="card-number">${e.number}</span><img loading="lazy" src="${e.image}" alt="${esc(e.title)}: ${esc(e.question)}"></div><span class="card-category">${e.category}</span><h3>${e.title}</h3><p>${e.summary}</p><span class="card-link">Explore experiment <span aria-hidden="true"><span class="arrow-up" aria-hidden="true"></span></span></span></a>`).join('');
}
function mediaMarkup(m){return m.type==='gif'?gifCard(m):m.type==='video'?`<figure><video controls playsinline preload="metadata" src="${esc(m.src)}"></video><figcaption>${esc(m.caption)}</figcaption></figure>`:photoCard(m);}

function openExperiment(id){
 const e=experiments.find(e=>e.id===id);if(!e)return;
 $('#experimentContent').innerHTML=`<article class="experiment-body"><div class="section-label">EXPERIMENT ${e.number} / ${e.category.toUpperCase()}</div><h2 id="experimentTitle">${e.title}</h2><p class="question">${e.question}</p><p>${e.summary}</p><div class="design">${e.design}</div><figure><button class="image-expand" data-image="${e.figure}" data-caption="${esc(e.reference)}"><img src="${e.figure}" alt="${esc(e.title)} evidence from the manuscript"><span>Enlarge figure <span class="arrow-up" aria-hidden="true"></span></span></button><figcaption>${e.reference}. Original manuscript figure or supplied marker photograph.</figcaption></figure><h3>How the test was performed</h3><p>${e.method}</p><div class="finding"><h3>What the test showed</h3><p>${e.finding}</p><div class="experiment-metric">${e.metric}<small>${e.metricLabel}</small></div></div><h3>How to interpret this result</h3><p>${e.limit}</p>${e.media.length?'<h3>Explore this experiment visually</h3><div class="experiment-media-grid">'+e.media.map(mediaMarkup).join('')+'</div>':''}<p class="source-note">Source: author manuscript, 17 November 2026. ${e.reference}. See the manuscript for metric definitions and acceptance criteria.</p><a class="button dark" href="assets/manuscript.pdf" target="_blank" rel="noopener">Open full manuscript <span class="arrow-up" aria-hidden="true"></span></a></article>`;
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
 const flightGifs=single?catalog.animations.filter(m=>m.code==='G15'&&m.id.includes('_'+maneuver.toUpperCase()+'_')):(maneuver==='Circle'&&n===6?catalog.animations.filter(m=>['G18','G19','G20','G21'].includes(m.code)):[]);
 $('#flightAnimations').innerHTML=flightGifs.length?`<div class="flight-animation-heading"><h3>Replay the recorded session</h3><p>Animations show repetition R01. The metrics above summarize three ${single?'flights':'sessions'}.</p></div><div class="animation-grid flight-gif-grid">${flightGifs.map(gifCard).join('')}</div>`:'<p class="source-note">No condition-specific animation has been supplied for this selection. The chart above remains the reported comparison across all tested group sizes.</p>';

 const clip=window.ARENA.flightVideos[`${maneuver}-${n}`];
 if(clip){$('#flightVisual').innerHTML=`<video controls playsinline preload="metadata" src="${esc(clip.src)}"></video>`;$('#flightCaption').textContent=`${clip.caption} Session: ${clip.session}. Metrics shown summarize all three repetitions.`;}
 else{
 const values=[window.ARENA.single.find(x=>x[0]===maneuver).slice(1),...window.ARENA.multi[maneuver]];
 const sizes=[1,2,3,6], max=Math.max(...values.map(d=>d[0]+d[1]))*1.22;
 const y=v=>230-(v/max)*170;
 const bars=values.map((d,i)=>{const x=80+i*105,selected=sizes[i]===n;return `<rect x="${x}" y="${y(d[0])}" width="48" height="${230-y(d[0])}" rx="2" fill="${selected?'#197269':'#cad8ce'}"/><path d="M${x+24} ${y(d[0]+d[1])}V${y(d[0]-d[1])}M${x+17} ${y(d[0]+d[1])}h14M${x+17} ${y(d[0]-d[1])}h14" stroke="#182c32" stroke-width="1.5"/><text x="${x+24}" y="${y(d[0]+d[1])-12}" text-anchor="middle" fill="#182c32" font-size="13">${d[0].toFixed(3)}</text><text x="${x+24}" y="254" text-anchor="middle" fill="#617077" font-size="12">${sizes[i]} ${sizes[i]===1?'drone':'drones'}</text>`;}).join('');
 const ticks=[0,.5,1].map(t=>{const v=max*t;return `<path d="M58 ${y(v)}H470" stroke="#e0e6df"/><text x="48" y="${y(v)+4}" text-anchor="end" fill="#617077" font-size="10">${v.toFixed(1)}</text>`;}).join('');
 $('#flightVisual').innerHTML=`<svg viewBox="0 0 510 280" role="img" aria-label="${maneuver} tracking RMSE in centimetres for one, two, three and six drones. Bars show means and error lines show sample standard deviations."><text x="58" y="24" fill="#182c32" font-size="13">${maneuver} · tracking RMSE (cm)</text>${ticks}${bars}</svg>`;
 $('#flightCaption').textContent='Values transcribed from manuscript Tables 13 and 15. Error bars: sample SD across three flights or sessions. One-drone values summarize flight RMSE; multi-drone values summarize session RMSE. Selected condition is highlighted. Available recorded-session animations appear below.';
 }
}
renderExperiments();renderFlight();
$('#trackingTable').innerHTML=window.ARENA.single.map(([name,mean,sd])=>`<tr><th scope="row">${name}</th><td>${mean.toFixed(3)} ± ${sd.toFixed(3)}</td>${window.ARENA.multi[name].map(d=>`<td>${d[0].toFixed(3)} ± ${d[1].toFixed(3)}</td>`).join('')}</tr>`).join('');
document.addEventListener('click',e=>{
 const gif=e.target.closest('[data-gif]');if(gif)openGif(gif.dataset.gif);
 if(e.target.closest('#mediaDialog .media-close'))closeGif();

 const filter=e.target.closest('[data-filter]');if(filter){document.querySelectorAll('[data-filter]').forEach(b=>{b.classList.toggle('active',b===filter);b.setAttribute('aria-pressed',String(b===filter));});renderExperiments(filter.dataset.filter);}
 const img=e.target.closest('[data-image]');if(img)openImage(img.dataset.image,img.dataset.caption);
 if(e.target.closest('#experimentDialog .close'))closeExperiment();
 if(e.target.closest('#imageDialog .close'))imageDialog.close();
 if(e.target.closest('#nav a')){$('#nav').classList.remove('open');$('#menu').setAttribute('aria-expanded','false');}
});
expDialog.addEventListener('cancel',e=>{e.preventDefault();closeExperiment();});
for(const d of [expDialog,imageDialog,mediaDialog])d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom){if(d===expDialog)closeExperiment();else d.close();}}});
$('#menu').addEventListener('click',()=>{const open=$('#nav').classList.toggle('open');$('#menu').setAttribute('aria-expanded',String(open));});
$('#maneuver').addEventListener('change',renderFlight);$('#fleet').addEventListener('change',renderFlight);
const hero=$('#heroVideo'),toggle=$('#videoToggle');
function videoLabel(){toggle.textContent=hero.paused?'Play video':'Pause video';toggle.setAttribute('aria-label',hero.paused?'Play background video':'Pause background video');}
toggle.addEventListener('click',async()=>{if(hero.paused){try{await hero.play();}catch{toggle.textContent='Video unavailable';}}else hero.pause();videoLabel();});
hero.addEventListener('pause',videoLabel);hero.addEventListener('play',videoLabel);
if(matchMedia('(prefers-reduced-motion: reduce)').matches){hero.autoplay=false;hero.pause();}hero.addEventListener('error',()=>{toggle.textContent='Video unavailable';});
$('#copyBibtex').addEventListener('click',async()=>{try{await navigator.clipboard.writeText($('#bibtex').textContent);$('#copyStatus').textContent='Citation copied.';}catch{$('#copyStatus').textContent='Select and copy the citation above.';}});
window.addEventListener('hashchange',route);route();

/* Tempered Tees splash (root site), built on Creative final_B_v7 (Paul-locked look) + Forge code delta. No third parties. No libraries. Respects prefers-reduced-motion. */
(()=>{const RM=matchMedia('(prefers-reduced-motion: reduce)').matches,D=document;
const desk=matchMedia('(hover:hover) and (pointer:fine)').matches&&innerWidth>=768;
D.documentElement.classList.add(RM?'rm':'anim');
// 1) headline heats letter by letter (once, on load)
D.querySelectorAll('[data-heat]').forEach(h=>{const t=h.textContent;h.setAttribute('aria-label',t);h.textContent='';
 let i=0;t.split(' ').forEach((w,k)=>{if(k)h.appendChild(D.createTextNode(' '));const g=D.createElement('span');g.className='wd';g.setAttribute('aria-hidden','true');
 [...w].forEach(c=>{const s=D.createElement('span');s.className='ch';s.textContent=c;s.style.animationDelay=(0.25+(i++)*0.045)+'s';g.appendChild(s)});h.appendChild(g)})});
// 2) embers (v7 + approved README, audit S2-14): one canvas, same seeded particles as v7. Desktop (fine pointer, >=768 px) animates
//    up to 160 with a cursor push, paused when the tab is hidden or the hero is off screen. Phones get a still frame (max 40), drawn once.
//    Reduced motion: canvas removed, exactly as the locked v7 frame (README says "drawn once"; logged as not applied, visual change).
const cv=D.querySelector('canvas.embers');
if(cv){if(RM){cv.remove()}else{const x=cv.getContext('2d'),live=desk,CAP=desk?160:40,dpr=Math.min(2,devicePixelRatio||1);let W=0,H=0,P=[],mx=-1e4,my=-1e4,raf=0,last=0,vis=true;
 let seed=7;const r=()=>(seed=(seed*16807)%2147483647)/2147483647;
 const mk=y0=>({x:r()*W,y:y0??H*(1-r()*r()),v:.15+r()*.45,s:.6+r()*1.9,a:.25+r()*.65,w:r()*6.28,c:['255,180,60','232,100,44','255,210,122'][r()*3|0]});
 const size=()=>{const w=cv.clientWidth,h=cv.clientHeight;if(w===W&&Math.abs(h-H)<2)return false; // ignore phone URL-bar jitter
  const sx=W?w/W:1,sy=H?h/H:1;W=w;H=h;cv.width=W*dpr;cv.height=H*dpr;x.setTransform(dpr,0,0,dpr,0,0);
  P.forEach(p=>{p.x*=sx;p.y*=sy});const n=Math.min(CAP,Math.round(W*H/9000));while(P.length<n)P.push(mk());P.length=n;return true}; // rescale, never regenerate
 const draw=()=>{x.clearRect(0,0,W,H);for(const p of P){const f=Math.min(1,p.y/H+.15);x.globalAlpha=p.a*f;x.fillStyle=`rgb(${p.c})`;x.beginPath();x.arc(p.x,p.y,p.s,0,6.283);x.fill()}};
 const step=t=>{const dt=Math.min(50,t-last)/16.7;last=t;
  for(const p of P){p.w+=.02*dt;p.y-=p.v*dt;p.x+=Math.sin(p.w)*.25*dt;
   const dx=p.x-mx,dy=p.y-my,d2=dx*dx+dy*dy;if(d2<14400){const k=(1-d2/14400)*1.2*dt,d=Math.sqrt(d2+1);p.x+=dx/d*k;p.y+=dy/d*k}
   if(p.y<-10)Object.assign(p,mk(H+10))}
  draw();raf=requestAnimationFrame(step)};
 const run=()=>{if(!live)return;const go=!D.hidden&&vis;if(go&&!raf){last=performance.now();raf=requestAnimationFrame(step)}else if(!go&&raf){cancelAnimationFrame(raf);raf=0}};
 let rt=0;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>{if(size()&&!raf)draw()},150)},{passive:true});
 size();draw();run();
 if(live){addEventListener('pointermove',e=>{const b=cv.getBoundingClientRect();mx=e.clientX-b.left;my=e.clientY-b.top},{passive:true});
  D.addEventListener('visibilitychange',run);
  if('IntersectionObserver'in window)new IntersectionObserver(e=>{vis=e[0].isIntersecting;run()}).observe(cv.parentElement)}
 window.__ttEmbers={count:()=>P.length,cap:CAP,live,running:()=>!!raf}}}
// 3) opt-in ambient sound: nothing loads before the first tap; Web Audio loop with 1.5 s fades.
//    S2-08: always starts off (a browser can't resume audio without a tap, so showing "on" after a reload would be untrue).
//    sessionStorage keeps the choice for this tab only. S2-09: state flips on the click frame, "Loading…" during the first fetch, visible failure.
const sb=D.querySelector('.snd');if(sb){let ac,g,on=false,ft=0;const K='tt_forge_sound',lab=sb.querySelector('.sl'),L0=lab.textContent,LON='Forge sound on';   // v7 labels: off 'Hear the forge', on 'Forge sound on'
 // iOS/iPadOS fix (2026-10-19): everything that needs the user gesture runs synchronously in the tap handler: AudioContext
 // create/resume, a silent-buffer unlock, and <audio>.play() (playsinline, muted=false). No await before them. Web Audio only fades.
 let el=null,unlocked=false;
 const AC=window.AudioContext||window.webkitAudioContext;
 const unlock=()=>{if(!AC)return;if(!ac){ac=new AC();g=ac.createGain();g.gain.value=0;g.connect(ac.destination);
   ac.onstatechange=()=>{if(on&&!D.hidden&&(ac.state==='suspended'||ac.state==='interrupted'))ac.resume().catch(()=>{})}}
  if(ac.state!=='running')ac.resume().catch(()=>{});
  if(!unlocked){try{const sbf=ac.createBuffer(1,1,22050),s0=ac.createBufferSource();s0.buffer=sbf;s0.connect(ac.destination);s0.start(0);unlocked=true}catch(e){}}};
 const mk=()=>{el=new Audio();el.loop=true;el.preload='auto';el.playsInline=true;el.setAttribute('playsinline','');el.setAttribute('webkit-playsinline','');el.crossOrigin='anonymous';
  el.src='assets/audio/forge_loop.'+(el.canPlayType('audio/mpeg')?'mp3':'webm');
  if(ac){try{ac.createMediaElementSource(el).connect(g)}catch(e){}}};
 const fade=v=>{if(!ac||!g){el.volume=v?.18:0;return}const t=ac.currentTime;g.gain.cancelScheduledValues(t);g.gain.setValueAtTime(g.gain.value,t);g.gain.linearRampToValueAtTime(v?.18:0,t+1.5)};
 // Button look + aria-pressed always come from the real playback state (el.paused/muted, ctx.state), re-derived on every event.
 let loading=false,live=false;   // live = the 'playing' event fired (el.paused flips false before any audio is output)
 const playing=()=>!!el&&live&&!el.paused&&!el.muted&&(!ac||ac.state==='running');
 const sync=()=>{const p=playing();if(p)loading=false;sb.setAttribute('aria-pressed',String(p));sb.classList.toggle('is-loading',loading&&!p);
  if(!sb.classList.contains('is-failed'))lab.textContent=p?LON:(loading?'Loading…':L0);if(p)try{sessionStorage.setItem(K,'on')}catch(e){}};
 const fail=()=>{on=false;loading=false;if(el){try{el.pause()}catch(e){}}sb.classList.add('is-failed');sb.title='Sound unavailable';lab.textContent='Sound unavailable';sync();
  clearTimeout(ft);ft=setTimeout(()=>{sb.classList.remove('is-failed');sb.title='Ambient sound, off by default';sync()},4000)};
 // One tap handler, no global first-touch handler. Sound never starts without a tap on this button. If not audibly playing, a tap means ON.
 const tap=()=>{const p=playing()||(loading&&on);sb.classList.remove('is-failed');
  if(!p){on=true;try{if(navigator.audioSession)navigator.audioSession.type='playback'}catch(e){}
   unlock();if(!el){mk();['playing','pause','ended','error','waiting','emptied'].forEach(t=>el.addEventListener(t,()=>{live=t==='playing';sync()}));['play','volumechange'].forEach(t=>el.addEventListener(t,sync));el.addEventListener('error',fail);if(ac)ac.addEventListener('statechange',sync);
    sb.style.minWidth=sb.offsetWidth+'px'}
   el.muted=false;loading=el.readyState<3;fade(true);let pr;try{pr=el.play()}catch(e){fail();return}
   sync();Promise.resolve(pr).then(()=>{if(ac&&ac.state!=='running')ac.resume().then(sync,()=>{});sync()},()=>fail())}
  else{on=false;loading=false;fade(false);try{sessionStorage.setItem(K,'off')}catch(e){}sync();
   setTimeout(()=>{if(!on&&el){el.pause();if(ac&&ac.state==='running')ac.suspend().catch(()=>{})}},1600)}};
 sb.addEventListener('click',tap);
 D.addEventListener('visibilitychange',()=>{if(!el||!on)return;if(D.hidden){el.pause()}else{if(ac)ac.resume().catch(()=>{});el.play().then(sync,sync)}});
 let mem=null;try{mem=sessionStorage.getItem(K)}catch(e){}
 if(mem==='on')sb.title='Tap to turn the forge sound back on'}
})();

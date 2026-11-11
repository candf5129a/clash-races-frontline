const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const dialog = $('#ui-dialog');
const skinGrid = $('#skin-grid');
const weaponGrid = $('#weapon-grid');
const selectedModes = new Set();

const skins = [
  ['Vanguard','Human','Blackstar recon armor','human','#61f0e3','#183c44'],
  ['Astral','Human','White solar sentinel','human','#e1cbff','#48395a'],
  ['Visitor','Grey','Silent orbit scout','alliance','#b5e9ff','#1a4853'],
  ['Tall Grey','Grey','Long-range observer','alliance','#94bfff','#354a70'],
  ['Saurian','Reptilian','Carbon-scale vanguard','alliance','#b0ef57','#31502b'],
  ['Khepri','Insectoid','Chitin breach specialist','alliance','#e2bb5b','#50441f'],
  ['Veil','Nordic','Cryo-born pathfinder','alliance','#afeafa','#325b6a'],
  ['Tideborn','Sirian','Deep-current guardian','alliance','#4ae9e6','#165a61'],
  ['Riftwalker','Andromedan','Phase-shift recon','alliance','#8a9cff','#342e66'],
  ['Ashguard','Draconian','Cinder-plated heavy','alliance','#ff8769','#6a362e'],
  ['Starforged','Anunnaki','Ancient relic keeper','alliance','#f0d676','#695524'],
  ['Ghost','Lyran','Quiet-step duelist','alliance','#c6a9ff','#483977'],
  ['Pelagic','Aquatic','Abyssal pressure suit','alliance','#69c5ff','#174166'],
  ['Concord','Hybrid','Two-world envoy','alliance','#d79eff','#56396d'],
  ['Prism','Crystalline','Light-bending vanguard','alliance','#9effea','#317774'],
  ['Eclipse','Shadowborn','Dark-matter infiltrator','alliance','#9aa9ff','#302c5d'],
  ['Oracle','Psionic','Neural command adept','alliance','#e6a5ff','#633a70'],
  ['Aerie','Avian','High-altitude interceptor','alliance','#ffd18b','#675130'],
  ['Ranger','Orion','Frontier marksman','alliance','#bbd77a','#405332'],
  ['Nomad','Vega','Deep-space pathfinder','alliance','#ff9aaf','#633747']
].map(([call,name,look,group,accent,glow],i)=>({id:i+1,call,name,look,group,accent,glow}));

const weaponSeeds = [
  ['ASSAULT',['VX-14 Kinetic Pulse','ARX-9 Starfall','A-17 Helix','BR-04 Nightglass','Cinder-12','Dynamo-6','Echelon 55','FJ-88 Ionwake','GR-31 Longlight','HX-7 Vector','Icarus 3','Javelin-21','Kestrel M4','Lancer-08','Morrow AR']],
  ['SMG',['S-19 Slipstream','Viper-5','Rift-2 Compact','Nacre-11','Pulsejack 8','Quark SM-3','Rook-17','Talon Micro']],
  ['SHOTGUN',['Breach-12','CQC-8 Thunder','Goliath Pump','Hush-6','Mantis Scatter','Redline 4']],
  ['SNIPER',['Astra Longbow','Blackout-77','Coldstar 9','Dreadnought 50','Eventide Rail','Farpoint M2','Lumen-6','Warden 12']],
  ['LMG',['Atlas Support','Bulwark-90','Cobalt Suppressor','Drumline 46','Exo-LMG 7']],
  ['MARKSMAN',['Falcon DMR','Glint-12','Horizon 6','Ionic Scout']],
  ['SIDEARM',['Kite-9','Mica Auto','Nova Pistol','Oathbreaker .44']]
];
const weapons = weaponSeeds.flatMap(([type,names])=>names.map((name,i)=>({type,name,index:i+1,description:`${type.toLowerCase()} platform · ${['balanced field profile','stable midrange pattern','fast target acquisition','reinforced energy receiver'][i%4]}`})));
const devices = [
  {name:'Arc Caster',nick:'ELECTRIFIER',icon:'ϟ',desc:'Short-range arc burst disrupts nearby training targets and flashes their shields.',color:'#63edff'},
  {name:'Breach Core',nick:'EXPLOSIVE',icon:'✹',desc:'A contained kinetic shock charge for practicing timed throws and blast radius.',color:'#ff8b69'},
  {name:'Vex Cloud',nick:'KILLER GAS',icon:'◌',desc:'Fictional visibility-denial cloud. Range simulation only; no real-world chemistry.',color:'#b4f76d'},
  {name:'Nullwave',nick:'POWER DISABLER',icon:'⌁',desc:'An EMP pulse that pauses the range targets and their shield effects.',color:'#ba9aff'},
  {name:'Flux Leech',nick:'DRAINER',icon:'⟲',desc:'A sci-fi energy siphon that drains a target shield in the simulation.',color:'#ff7fce'}
];
const friends = [
  {name:'NEBULA_09',status:'IN TRAINING GROUND',avatar:'N',color:'blue',online:true},
  {name:'VOIDWALKER',status:'IN MATCH // 20V20',avatar:'V',color:'purple',online:true},
  {name:'KHEPRI_RISING',status:'IN COMMAND',avatar:'K',color:'green',online:true},
  {name:'ORBITAL_JUNE',status:'LAST SEEN 12M AGO',avatar:'J',color:'pink',online:false},
  {name:'SAURIAN PRIME',status:'LAST SEEN 1H AGO',avatar:'S',color:'gold',online:false}
];
const dispatches = [
  {icon:'✦',title:'First Contact reward ready',body:'Claim 150 CR for completing your first field drill.',fresh:true},
  {icon:'⌖',title:'Nebula_09 sent a squad invite',body:'Training Ground · Calibration Range · 2 minutes ago',fresh:true},
  {icon:'◈',title:'Species archive expanded',body:'20 operative skins are now listed in the alliance archive.',fresh:false}
];
const rooms = [
  {name:'Dusthaven Breach',size:'5v5',players:'07 / 10',mode:'TEAM ELIMINATION'},
  {name:'Callaso: Outer Ring',size:'20v20',players:'28 / 40',mode:'FRONTLINE PUSH'},
  {name:'First Contact Open',size:'25v25',players:'16 / 50',mode:'GLOBAL CONFLICT'}
];

// Page navigation and in-screen routes.
function showPage(name) {
  const page = $(`#page-${name}`);
  if (!page) return;
  $$('.page').forEach(item => { item.hidden = item !== page; item.classList.toggle('active', item === page); });
  $$('.nav-item').forEach(item => item.classList.toggle('active', item.dataset.page === name));
  $('#page-label').textContent = ({command:'COMMAND',training:'TRAINING GROUND',species:'OPERATIVES',arsenal:'ARSENAL',social:'SOCIAL COMMAND'})[name] || 'COMMAND';
  if (name === 'training') startRange();
  window.scrollTo({top:0,behavior:'smooth'});
}
$$('[data-page]').forEach(button => button.addEventListener('click', () => showPage(button.dataset.page)));

// Lobby match setup. A random queue picks from the five requested team sizes.
$$('.battle-options button').forEach(button => button.addEventListener('click', () => {
  $$('.battle-options button').forEach(item => item.classList.toggle('selected', item === button));
  selectedModes.clear(); selectedModes.add(button.dataset.mode);
  $('#mode-selection').textContent = `${button.dataset.mode} // CALLASO FRONT SELECTED`;
}));
$('#find-match').addEventListener('click', () => {
  if (!selectedModes.size) {
    const options = $$('.battle-options button');
    const picked = options[Math.floor(Math.random() * options.length)];
    picked.click();
  }
  const mode = [...selectedModes][0];
  openDialog('SEARCHING FOR OPERATIVES', `<p class="dialog-copy">Searching the global network for a <strong>${mode}</strong> Callaso battle. Squad readiness: <strong>1 / ${Number(mode.split('v')[0]) * 2}</strong>.</p><div class="dialog-summary"><span>QUEUE</span><b>${mode} // GLOBAL AUTO</b></div><button class="cta-ghost dialog-wide" id="cancel-queue">CANCEL SEARCH</button>`);
  $('#cancel-queue').addEventListener('click', () => dialog.close());
});
$('#quick-match').addEventListener('click', () => $('#find-match').click());
$('#create-room').addEventListener('click', showRoomForm);
$('#social-create-room').addEventListener('click', showRoomForm);
function showRoomForm() {
  openDialog('CREATE A CALLASO ROOM', `<p class="dialog-copy">Set the battle scale and choose who can join your squad.</p><form class="dialog-form" id="room-form"><label>ROOM CALLSIGN<input name="name" maxlength="28" placeholder="Outer Ring Strike" required></label><label>TEAM SIZE<select name="size"><option>5v5</option><option>10v10</option><option>15v15</option><option>20v20</option><option>25v25</option></select></label><label>ACCESS<select name="access"><option>Friends and invite code</option><option>Global open room</option><option>Invite only</option></select></label><button>OPEN ROOM PREVIEW</button></form>`);
  $('#room-form').addEventListener('submit', event => {
    event.preventDefault(); const data = new FormData(event.currentTarget); const code = Math.random().toString(36).slice(2,8).toUpperCase();
    openDialog('ROOM CONFIGURED', `<p class="dialog-copy"><strong>${escapeHtml(data.get('name'))}</strong> is configured for <strong>${data.get('size')}</strong> with <strong>${escapeHtml(data.get('access'))}</strong>.</p><div class="dialog-summary"><span>INVITE CODE</span><b>${code}</b></div><p class="dialog-copy">Local preview only. Network rooms will connect in a later online-services milestone.</p>`);
  });
}

// Species archive (20 total; the two human skins include Black and White operatives).
function renderSkins() {
  const query = $('#species-search').value.trim().toLowerCase();
  const filter = $('#species-filters .selected').dataset.filter;
  const results = skins.filter(skin => (filter === 'all' || skin.group === filter) && `${skin.call} ${skin.name} ${skin.look}`.toLowerCase().includes(query));
  $('#skin-count').textContent = `${results.length}`.padStart(2,'0');
  skinGrid.innerHTML = results.map((skin,index)=>`<button class="skin-card ${skin.id===1?'selected':''}" style="--skin-accent:${skin.accent};--skin-glow:${skin.glow}" data-skin="${skin.id}"><span class="skin-code">${String(skin.id).padStart(2,'0')} // ${skin.name.slice(0,3).toUpperCase()}</span><span class="skin-figure"><i class="skin-head"></i><i class="skin-body"></i><i class="skin-arm"></i><i class="skin-arm right"></i></span><span class="skin-copy"><b>${skin.call.toUpperCase()}</b><small>${skin.name.toUpperCase()} <em>·</em> ${skin.look.toUpperCase()}</small></span></button>`).join('') || '<div class="weapon-empty">NO SPECIES MATCH THAT SEARCH.</div>';
  $$('.skin-card',skinGrid).forEach(card=>card.addEventListener('click',()=>{
    $$('.skin-card',skinGrid).forEach(item=>item.classList.toggle('selected',item===card));
    const skin=skins.find(item=>item.id===Number(card.dataset.skin));
    toast(`${skin.call.toUpperCase()} // ${skin.name.toUpperCase()} SELECTED`);
    if(skin.id===1||skin.id===2) $('.stage-caption b').textContent=`${skin.call.toUpperCase()} // HUMAN`;
  }));
}
$('#species-search').addEventListener('input',renderSkins);
$$('#species-filters button').forEach(button=>button.addEventListener('click',()=>{$$('#species-filters button').forEach(item=>item.classList.toggle('selected',item===button));renderSkins();}));
renderSkins();

// Arsenal: 50 original platforms, including 15 assault platforms and five fictional devices.
let weaponFilter='all';
function renderWeapons() {
  const query=$('#weapon-search').value.trim().toLowerCase();
  const results=weapons.filter(weapon=>(weaponFilter==='all'||weapon.type===weaponFilter)&&`${weapon.name} ${weapon.type} ${weapon.description}`.toLowerCase().includes(query));
  $('#weapon-count').textContent=String(results.length).padStart(2,'0');
  weaponGrid.innerHTML=results.map((weapon,index)=>`<button class="weapon-card ${weapon.name==='VX-14 Kinetic Pulse'?'selected':''}" data-weapon="${escapeHtml(weapon.name)}"><em>${weapon.type}</em><b>${escapeHtml(weapon.name)}</b><small>PLATFORM ${String(weapons.indexOf(weapon)+1).padStart(2,'0')} · ${weapon.type} SYSTEM</small></button>`).join('')||'<div class="weapon-empty">NO WEAPON SYSTEMS MATCH THAT SEARCH.</div>';
  $$('.weapon-card',weaponGrid).forEach(card=>card.addEventListener('click',()=>{
    $$('.weapon-card',weaponGrid).forEach(item=>item.classList.toggle('selected',item===card));
    const weapon=weapons.find(item=>item.name===card.dataset.weapon);
    $('#active-weapon-name').textContent=weapon.name.toUpperCase();
    $('#active-weapon-desc').textContent=`${weapon.type} platform · ${weapon.description.split('·')[1].trim()}`;
    $('#weapon-name-hud').textContent=`${weapon.name.toUpperCase()} // ${weapon.type}`;
    toast(`${weapon.name.toUpperCase()} EQUIPPED`);
  }));
}
$('#weapon-search').addEventListener('input',renderWeapons);
$$('#weapon-filters button').forEach(button=>button.addEventListener('click',()=>{$$('#weapon-filters button').forEach(item=>item.classList.toggle('selected',item===button));weaponFilter=button.dataset.filter;renderWeapons();}));
$('#throwable-list').innerHTML=devices.map((device,index)=>`<button class="throwable ${index===0?'selected':''}" data-device="${index}" style="--device:${device.color}"><span>${device.icon}</span><b>${device.nick}</b><small>${device.name}</small></button>`).join('');
$$('.throwable').forEach(button=>button.addEventListener('click',()=>selectDevice(Number(button.dataset.device))));
function selectDevice(index){range.selectedDevice=index;$$('.throwable').forEach((item,i)=>item.classList.toggle('selected',i===index));$('#device-count').textContent=`${range.deviceCharges[index]} / 05`;toast(`${devices[index].name.toUpperCase()} SELECTED`);}
renderWeapons();

// Social panels: activity, dispatches, and a local open-room board.
function friendMarkup(friend,full=false){return `<div class="${full?'social-friend':'friend-row'}"><span class="friend-avatar av-${friend.color}">${friend.avatar}</span><span class="friend-data"><b>${friend.name} ${friend.online?'<i class="online-mini"></i>':''}</b><small>${friend.status}</small></span><button class="invite-friend" data-friend="${friend.name}">${friend.online?'INVITE':'MESSAGE'}</button></div>`;}
$('#social-friends').innerHTML=friends.map(friend=>friendMarkup(friend,true)).join('');
$('#dispatch-list').innerHTML=dispatches.map(item=>`<div class="dispatch-item ${item.fresh?'new':''}"><span>${item.icon}</span><div><b>${item.title}</b><small>${item.body}</small></div></div>`).join('');
$('#room-board').innerHTML=rooms.map(room=>`<div class="room-tile"><div><b>${room.name}</b><small>${room.size} // ${room.players}</small></div><span>${room.mode}</span></div>`).join('');
document.addEventListener('click',event=>{const button=event.target.closest('.invite-friend');if(button)toast(`${button.dataset.friend}: SQUAD REQUEST SENT`);});
$('#social-refresh').addEventListener('click',()=>toast('ALLIANCE NETWORK REFRESHED'));
$('#mark-read').addEventListener('click',()=>{ $$('.dispatch-item').forEach(item=>item.classList.remove('new'));toast('DISPATCHES MARKED AS READ');});
$('#add-operative').addEventListener('click',()=>openDialog('FIND OPERATIVES','<p class="dialog-copy">Search by callsign to invite an operative to the Callaso alliance.</p><form class="dialog-form" id="find-form"><label>OPERATIVE CALLSIGN<input name="callsign" placeholder="Enter callsign" required></label><button>SEARCH ALLIANCE NETWORK</button></form>'));
$('#add-operative').addEventListener('click',()=>$('#find-form')?.addEventListener('submit',event=>{event.preventDefault();const name=new FormData(event.currentTarget).get('callsign');openDialog('OPERATIVE LOCATED',`<p class="dialog-copy">Alliance signal for <strong>${escapeHtml(name)}</strong> found. A local friend request is ready.</p><button class="cta-primary" id="send-friend-request">SEND REQUEST</button>`);$('#send-friend-request').addEventListener('click',()=>{dialog.close();toast('FRIEND REQUEST SENT');});}));
$('#notifications-btn').addEventListener('click',()=>openDialog('FIELD DISPATCHES',`<ul class="dialog-list">${dispatches.map(item=>`<li><strong>${item.title}</strong> — ${item.body}</li>`).join('')}</ul>`));
$('#reward-btn').addEventListener('click',()=>openDialog('CALLASO REWARD TRACK','<p class="dialog-copy">Complete training drills and frontline objectives to unlock non-pay-to-win cosmetic rewards.</p><div class="dialog-summary"><span>AVAILABLE NEXT</span><b>150 CR // NEBULA SKIN</b></div><div class="dialog-summary"><span>SEASON PROGRESS</span><b>2,400 / 5,000 XP</b></div>'));
$('#rewards-view').addEventListener('click',()=>$('#reward-btn').click());
$('#reward-next').addEventListener('click',()=>toast('NEXT REWARD: NEBULA WEAPON SKIN'));

// Reusable dialog, safe for user-entered text.
function openDialog(title,html){$('#dialog-title').textContent=title;$('#dialog-content').innerHTML=html;dialog.showModal();}
function escapeHtml(value){return String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));}
function toast(message){$('.toast')?.remove();const item=document.createElement('div');item.className='toast';item.textContent=message;document.body.append(item);setTimeout(()=>item.remove(),2400);}

// First-person raycast range. Keyboard/mouse and large touch controls share the same simulation state.
const canvas=$('#training-canvas');
const ctx=canvas.getContext('2d');
const W=canvas.width,H=canvas.height,FOV=Math.PI/3;
const map=[
  '1111111111111111','1000000000000001','1000100000000001','1000100010010001',
  '1000000010010001','1000000000000001','1001000000100001','1001000000100001',
  '1000000000000001','1000010000001001','1000010000001001','1000000000000001',
  '1000000100000001','1000000100000001','1000000000000001','1111111111111111'
];
const range={x:2.4,y:5.5,angle:.087,velocity:0,strafe:0,keys:new Set(),aiming:false,sprinting:false,sliding:0,jump:0,jumpVelocity:0,shots:0,hits:0,score:0,ammo:30,reserve:120,reloading:false,selectedDevice:0,deviceCharges:[5,5,5,5,5],paused:false,elapsed:0,lastTime:0,fireCooldown:0,recoil:0,flash:0,shout:0,projectile:null,dragging:false,previousX:0,stickX:0,stickY:0,stickActive:false,started:false,targetHits:0};
const targets=[{x:9.3,y:6.1,phase:0,hp:1,hitAt:0},{x:11.8,y:8.1,phase:2,hp:1,hitAt:0},{x:9.2,y:10.3,phase:4,hp:1,hitAt:0},{x:13.2,y:5.4,phase:1,hp:1,hitAt:0}];
let animationId=0;
function startRange(){if(range.started)return;range.started=true;range.lastTime=performance.now();animationId=requestAnimationFrame(tick);}
function tick(now){animationId=requestAnimationFrame(tick);if($('#page-training').hidden||range.paused)return;const dt=Math.min((now-range.lastTime)/1000,.045);range.lastTime=now;range.elapsed+=dt;updateRange(dt);drawRange();updateReadout();}
function updateRange(dt){
  if(range.fireCooldown>0)range.fireCooldown-=dt;if(range.flash>0)range.flash-=dt;if(range.recoil>0)range.recoil-=dt;if(range.shout>0)range.shout-=dt;
  range.sprinting=range.keys.has('shift')&&(range.keys.has('w')||range.keys.has('arrowup'));
  const forward=(range.keys.has('w')||range.keys.has('arrowup')?1:0)-(range.keys.has('s')||range.keys.has('arrowdown')?1:0)-range.stickY;
  const sideways=(range.keys.has('d')?1:0)-(range.keys.has('a')?1:0)+range.stickX;
  let speed=range.sprinting?3.5:2.2;if(range.sliding>0){range.sliding-=dt;speed=5.5;}else if(range.keys.has('c')&&Math.abs(forward)+Math.abs(sideways)>.1){range.sliding=.6;speed=5.5;range.keys.delete('c');$('#sim-status').textContent='SLIDE // MOMENTUM CARRY';}
  const moveAngle=range.angle;const dx=(Math.cos(moveAngle)*forward-Math.sin(moveAngle)*sideways)*speed*dt;const dy=(Math.sin(moveAngle)*forward+Math.cos(moveAngle)*sideways)*speed*dt;
  const nx=range.x+dx,ny=range.y+dy;if(!isWall(nx,range.y))range.x=nx;if(!isWall(range.x,ny))range.y=ny;
  if(range.keys.has('arrowleft'))range.angle-=1.8*dt;if(range.keys.has('arrowright'))range.angle+=1.8*dt;
  if(range.jumpVelocity!==0||range.jump>0){range.jump+=range.jumpVelocity*dt;range.jumpVelocity-=4.1*dt;if(range.jump<=0){range.jump=0;range.jumpVelocity=0;$('#sim-status').textContent='SYSTEMS NOMINAL';}}
  targets.forEach(target=>{if(target.hp<=0&&range.elapsed-target.hitAt>.65){target.hp=1;target.phase+=1.2;}});
  if(range.projectile){range.projectile.time+=dt;if(range.projectile.time>.8){const label=devices[range.projectile.type].name.toUpperCase();$('#sim-status').textContent=`${label} // SIM EFFECT COMPLETE`;range.projectile=null;setTimeout(()=>{if(!range.paused)$('#sim-status').textContent='SYSTEMS NOMINAL';},1700);}}
  $('#sim-clock').textContent=`${String(Math.floor(range.elapsed/60)).padStart(2,'0')}:${String(Math.floor(range.elapsed%60)).padStart(2,'0')}`;
}
function isWall(x,y){const mx=Math.floor(x),my=Math.floor(y);return !map[my]||map[my][mx]==='1';}
function drawRange(){
  const horizon=H*.48-range.jump*40+(range.sliding>0?27:0);const sky=ctx.createLinearGradient(0,0,0,horizon);sky.addColorStop(0,'#101b31');sky.addColorStop(.62,'#253f50');sky.addColorStop(1,'#8b755a');ctx.fillStyle=sky;ctx.fillRect(0,0,W,horizon);
  const floor=ctx.createLinearGradient(0,horizon,0,H);floor.addColorStop(0,'#4d5149');floor.addColorStop(.18,'#242d31');floor.addColorStop(1,'#0a1117');ctx.fillStyle=floor;ctx.fillRect(0,horizon,W,H-horizon);
  // distant bay gates and overhead light banks
  ctx.fillStyle='#12222b';ctx.fillRect(0,horizon-23,W,28);ctx.fillStyle='#55d8ce';for(let x=20;x<W;x+=98){ctx.fillRect(x,horizon-31,38,3);ctx.globalAlpha=.15;ctx.fillRect(x-7,horizon-27,52,13);ctx.globalAlpha=1;}
  const zbuf=new Float32Array(W);const rays=320,step=W/rays;
  for(let i=0;i<rays;i++){
    const rayAngle=range.angle-FOV/2+(i/rays)*FOV;const hit=castRay(rayAngle);const corrected=Math.max(.1,hit.distance*Math.cos(rayAngle-range.angle));for(let px=Math.floor(i*step);px<Math.ceil((i+1)*step);px++)zbuf[px]=corrected;
    const wallHeight=Math.min(H*1.7,H*.88/corrected);const top=horizon-wallHeight/2;const shade=Math.max(.14,1-corrected/14)*(hit.side===1?.72:1);const band=Math.floor(hit.texture*11)%2===0?1:.86;
    const v=shade*band;ctx.fillStyle=`rgb(${Math.floor(61*v)} ${Math.floor(119*v)} ${Math.floor(129*v)})`;ctx.fillRect(i*step,top,step+1,wallHeight);
    if(hit.texture>.92){ctx.fillStyle=`rgba(91,255,229,${.55*v})`;ctx.fillRect(i*step,top,step+1,Math.max(2,wallHeight*.014));}
    ctx.fillStyle=`rgba(205,229,216,${.11*v})`;ctx.fillRect(i*step,top,1,wallHeight);
    ctx.fillStyle=`rgba(5,11,17,${Math.min(.7,corrected/20)})`;ctx.fillRect(i*step,top,step+1,wallHeight);
  }
  drawFloorGrid(horizon);
  const ordered=[...targets].sort((a,b)=>distance(b)-distance(a));ordered.forEach(target=>drawTarget(target,horizon,zbuf));
  drawWeapon(horizon);
  if(range.flash>0){ctx.fillStyle=`rgba(180,255,242,${range.flash*1.6})`;ctx.fillRect(0,0,W,H);}
  if(range.projectile)drawProjectile();if(range.shout>0){ctx.fillStyle='#071018bb';ctx.fillRect(W*.35,H*.22,W*.3,34);ctx.fillStyle='#cfff56';ctx.font='bold 14px Barlow Condensed';ctx.textAlign='center';ctx.fillText('ALL UNITS — MOVE!',W/2,H*.22+22);}
}
function castRay(angle){let x=range.x,y=range.y,dx=Math.cos(angle),dy=Math.sin(angle);const step=.035;for(let distance=.03;distance<18;distance+=step){x+=dx*step;y+=dy*step;if(isWall(x,y)){const edgeX=Math.abs((x%1)-.5),edgeY=Math.abs((y%1)-.5);return{distance,side:edgeX<edgeY?0:1,texture:edgeX<edgeY?y%1:x%1};}}return{distance:18,side:0,texture:0};}
function distance(target){return Math.hypot(target.x-range.x,target.y-range.y);}
function drawFloorGrid(horizon){ctx.save();ctx.strokeStyle='#a9ded015';ctx.lineWidth=1;const vanX=W/2-range.recoil*40;for(let i=-12;i<=12;i++){ctx.beginPath();ctx.moveTo(vanX+i*4,horizon+1);ctx.lineTo(W/2+i*67,H);ctx.stroke();}for(let d=1;d<10;d++){const y=horizon+(H-horizon)*(1-Math.exp(-d*.42));ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}ctx.restore();}
function drawTarget(target,horizon,zbuf){if(target.hp<=0)return;const dx=target.x-range.x,dy=target.y-range.y,dist=Math.hypot(dx,dy),angle=Math.atan2(dy,dx)-range.angle;const normalized=Math.atan2(Math.sin(angle),Math.cos(angle));if(Math.abs(normalized)>FOV*.65||dist<.9||dist>14)return;const sx=W/2+Math.tan(normalized)/(Math.tan(FOV/2))*(W/2);const size=Math.min(185,H*.62/dist);const sy=horizon+size*.12+Math.sin(range.elapsed*2+target.phase)*5;const px=Math.round(sx);if(px>=0&&px<W&&dist>zbuf[px])return;const bob=Math.sin(range.elapsed*2.1+target.phase)*4;const x=sx,w=size*.46,h=size*.82;ctx.save();ctx.translate(x,sy+bob);ctx.globalAlpha=Math.max(.3,1-dist/18);ctx.shadowColor='#ff8e72';ctx.shadowBlur=15;ctx.fillStyle='#b4c0c6';ctx.beginPath();ctx.ellipse(0,-h*.43,w*.18,h*.12,0,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#4d606a';ctx.fillRect(-w*.27,-h*.3,w*.54,h*.43);ctx.fillStyle='#a2b1b3';ctx.fillRect(-w*.38,-h*.25,w*.12,h*.34);ctx.fillRect(w*.26,-h*.25,w*.12,h*.34);ctx.fillStyle='#293940';ctx.fillRect(-w*.23,h*.12,w*.16,h*.29);ctx.fillRect(w*.07,h*.12,w*.16,h*.29);ctx.fillStyle='#ff855f';ctx.fillRect(-w*.075,-h*.45,w*.15,Math.max(2,h*.022));ctx.strokeStyle='#ffe5a8';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,-h*.43,w*.27,-Math.PI*.85,-Math.PI*.15);ctx.stroke();ctx.restore();}
function drawWeapon(horizon){const tilt=range.sliding>0?42:0;ctx.save();ctx.translate(W*.69,H+25-range.recoil*80-range.jump*10+tilt);ctx.rotate(-.09);ctx.fillStyle='#111923';ctx.beginPath();ctx.moveTo(0,-115);ctx.lineTo(158,-82);ctx.lineTo(209,-33);ctx.lineTo(185,4);ctx.lineTo(82,-29);ctx.lineTo(20,24);ctx.lineTo(-17,-8);ctx.closePath();ctx.fill();ctx.fillStyle='#344653';ctx.fillRect(55,-87,162,13);ctx.fillStyle='#62f2df';ctx.fillRect(137,-96,30,3);ctx.fillStyle='#526773';ctx.fillRect(39,-53,29,59);ctx.fillStyle='#10171d';ctx.fillRect(65,-109,130,25);ctx.fillStyle='#81959b';ctx.fillRect(88,-117,8,7);ctx.fillStyle='#6bf7e6';ctx.globalAlpha=range.aiming?.9:.45;ctx.fillRect(183,-88,18,3);ctx.restore();}
function drawProjectile(){const p=range.projectile;const travel=p.time/.8;const x=W/2+(travel-.5)*140;const y=H*.53-Math.sin(travel*Math.PI)*180;ctx.save();ctx.fillStyle=devices[p.type].color;ctx.shadowColor=devices[p.type].color;ctx.shadowBlur=25;ctx.beginPath();ctx.arc(x,y,8*(1-travel*.4),0,Math.PI*2);ctx.fill();ctx.restore();}
function updateReadout(){const accuracy=range.shots?Math.round(range.hits/range.shots*100):0;$('#score-count').textContent=String(range.score).padStart(4,'0');$('#accuracy-count').textContent=range.shots?`${accuracy}%`:'—%';$('#hit-count').textContent=String(range.hits).padStart(2,'0');$('#ammo-count').textContent=range.reloading?'··':range.ammo;$('#crosshair').classList.toggle('aiming',range.aiming);$('#sim-action').textContent=range.sprinting?'SPRINT':range.aiming?'AIMING':range.reloading?'RELOADING':range.sliding>0?'SLIDE':range.jump>0?'AIRBORNE':'READY';}
function shoot(){if(range.paused||$('#page-training').hidden)return;if(range.reloading){toast('RELOAD IN PROGRESS');return;}if(range.ammo<=0){$('#sim-status').textContent='MAG EMPTY // PRESS R TO RELOAD';return;}if(range.fireCooldown>0)return;range.fireCooldown=.17;range.ammo--;range.shots++;range.flash=.045;range.recoil=.18;let best=null,bestDiff=.075;targets.forEach(target=>{if(target.hp<=0)return;const angle=Math.atan2(target.y-range.y,target.x-range.x)-range.angle;const diff=Math.abs(Math.atan2(Math.sin(angle),Math.cos(angle)));if(diff<bestDiff&&distance(target)<12){best=target;bestDiff=diff;}});if(best){best.hp=0;best.hitAt=range.elapsed;range.hits++;range.score+=100;range.targetHits++;$('#sim-status').textContent='TARGET IMPACT // +100';$('#hit-marker').classList.remove('show');void $('#hit-marker').offsetWidth;$('#hit-marker').classList.add('show');}else{$('#sim-status').textContent='SHOT FIRED // TRACK THE TARGET';}}
function reload(){if(range.reloading||range.ammo===30||range.reserve===0)return;range.reloading=true;$('#sim-status').textContent='RELOADING // MAGAZINE EXCHANGE';setTimeout(()=>{const amount=Math.min(30-range.ammo,range.reserve);range.ammo+=amount;range.reserve-=amount;range.reloading=false;$('#sim-status').textContent='MAGAZINE READY';},800);}
function jump(){if(range.jump===0){range.jumpVelocity=3.05;range.jump=.01;$('#sim-status').textContent='JUMP // AIRBORNE';}}
function shout(){range.shout=.9;$('#sim-status').textContent='COMMS // ALL UNITS, MOVE';toast('SQUAD COMMS // ALL UNITS, MOVE!');}
function throwDevice(){const i=range.selectedDevice;if(range.deviceCharges[i]<=0){toast('DEVICE CHARGES DEPLETED');return;}range.deviceCharges[i]--;$('#device-count').textContent=`${range.deviceCharges[i]} / 05`;range.projectile={type:i,time:0};$('#sim-status').textContent=`DEPLOYING ${devices[i].name.toUpperCase()}`;}
function resetRange(){range.x=2.4;range.y=5.5;range.angle=.087;range.velocity=0;range.strafe=0;range.jump=0;range.jumpVelocity=0;range.shots=0;range.hits=0;range.score=0;range.ammo=30;range.reserve=120;range.reloading=false;range.elapsed=0;range.deviceCharges=[5,5,5,5,5];range.selectedDevice=0;targets.forEach(t=>t.hp=1);$('#sim-status').textContent='SYSTEMS NOMINAL';selectDevice(0);updateReadout();}
$('#restart-drill').addEventListener('click',resetRange);$('#training-arsenal').addEventListener('click',()=>showPage('arsenal'));$('#open-devices').addEventListener('click',()=>openDialog('SELECT A FIELD DEVICE',`<p class="dialog-copy">Choose one of five fictional simulation devices for the next throw drill.</p>${devices.map((device,index)=>`<div class="dialog-summary"><span>${device.icon} ${device.nick}</span><b>${device.name}</b></div><p class="dialog-copy">${device.desc}</p><button class="cta-ghost device-pick" data-device-pick="${index}">SELECT DEVICE</button>`).join('')}`));
document.addEventListener('click',event=>{const button=event.target.closest('.device-pick');if(button){selectDevice(Number(button.dataset.devicePick));dialog.close();}});
window.addEventListener('keydown',event=>{if(event.target.matches('input,select,textarea'))return;const key=event.key.toLowerCase();if([' ','arrowup','arrowdown','arrowleft','arrowright'].includes(key))event.preventDefault();range.keys.add(key);if(key===' '){jump();}if(key==='r')reload();if(key==='q')shout();if(key==='f')shoot();if(key==='g')throwDevice();if(key==='c'){}if(['1','2','3','4','5'].includes(key))selectDevice(Number(key)-1);if(key==='escape'&&!$('#page-training').hidden)togglePause();});
window.addEventListener('keyup',event=>range.keys.delete(event.key.toLowerCase()));
canvas.addEventListener('pointerdown',event=>{if(event.button===2){range.aiming=!range.aiming;return;}if(event.button===0){range.dragging=true;range.previousX=event.clientX;if(event.detail===1)shoot();}});
canvas.addEventListener('pointermove',event=>{if(range.dragging){const dx=event.clientX-range.previousX;range.angle+=dx*.004;range.previousX=event.clientX;}});
window.addEventListener('pointerup',()=>range.dragging=false);canvas.addEventListener('contextmenu',event=>event.preventDefault());
$$('[data-touch]').forEach(button=>button.addEventListener('pointerdown',event=>{event.preventDefault();const action=button.dataset.touch;if(action==='aim')range.aiming=!range.aiming;if(action==='jump')jump();if(action==='slide'){range.sliding=.6;$('#sim-status').textContent='SLIDE // MOMENTUM CARRY';}if(action==='fire')shoot();button.classList.toggle('active',action==='aim'&&range.aiming);}));
const movePad=$('#move-pad');movePad.addEventListener('pointerdown',event=>{range.stickActive=true;movePad.setPointerCapture(event.pointerId);movePad.dataset.startX=event.clientX;movePad.dataset.startY=event.clientY;});movePad.addEventListener('pointermove',event=>{if(!range.stickActive)return;range.stickX=Math.max(-1,Math.min(1,(event.clientX-Number(movePad.dataset.startX))/30));range.stickY=Math.max(-1,Math.min(1,(event.clientY-Number(movePad.dataset.startY))/30));});movePad.addEventListener('pointerup',()=>{range.stickActive=false;range.stickX=0;range.stickY=0;});
function togglePause(){range.paused=!range.paused;$('#pause-overlay').hidden=!range.paused;if(!range.paused){range.lastTime=performance.now();requestAnimationFrame(tick);}}
$('#resume-sim').addEventListener('click',togglePause);

// Render before entering range so the first frame is already present.
drawRange();

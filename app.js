const modeButtons = [...document.querySelectorAll('.mode-card')];
const speciesButtons = [...document.querySelectorAll('.species-card')];
const dialog = document.querySelector('#action-dialog');
const dialogTitle = document.querySelector('#dialog-title');
const dialogBody = document.querySelector('#dialog-body');
const intelMode = document.querySelector('#intel-mode');
let selectedMode = '';
let selectedSpecies = 'Human';
let humanVariant = 'Black';

modeButtons.forEach((button) => button.addEventListener('click', () => {
  modeButtons.forEach((item) => item.classList.remove('active'));
  button.classList.add('active');
  selectedMode = button.dataset.mode;
  intelMode.textContent = `${selectedMode} // CALLASO FRONT`;
}));

speciesButtons.forEach((button) => button.addEventListener('click', () => {
  speciesButtons.forEach((item) => {
    item.classList.remove('selected');
    item.setAttribute('aria-selected', 'false');
  });
  button.classList.add('selected');
  button.setAttribute('aria-selected', 'true');
  selectedSpecies = button.dataset.species;
  toast(`${selectedSpecies.toUpperCase()} LINEAGE SELECTED`);
}));

document.querySelectorAll('.variant-button').forEach((button) => button.addEventListener('click', () => {
  document.querySelectorAll('.variant-button').forEach((item) => {
    item.classList.remove('active');
    item.setAttribute('aria-pressed', 'false');
  });
  button.classList.add('active');
  button.setAttribute('aria-pressed', 'true');
  humanVariant = button.dataset.variant;
  selectedSpecies = `Human · ${humanVariant} operator`;
  speciesButtons.forEach((item) => {
    item.classList.toggle('selected', item.dataset.species === 'Human');
    item.setAttribute('aria-selected', item.dataset.species === 'Human' ? 'true' : 'false');
  });
  toast(`${humanVariant.toUpperCase()} HUMAN OPERATOR SELECTED`);
}));

document.querySelector('#queue-btn').addEventListener('click', () => {
  if (!selectedMode) {
    toast('SELECT A BATTLE SIZE FIRST');
    return;
  }
  openDialog('SEARCHING FOR A MATCH', `<p class="dialog-copy">Your <b>${selectedSpecies}</b> operative is queued for a <b>${selectedMode}</b> Callaso Battle. Matchmaking is represented in this front end prototype.</p><div class="dialog-summary"><span>MODE</span><b>${selectedMode} · GLOBAL AUTO</b></div><button class="button button-outline" id="cancel-queue">CANCEL SEARCH</button>`);
  document.querySelector('#cancel-queue').addEventListener('click', () => dialog.close());
});

document.querySelector('#room-btn').addEventListener('click', () => {
  openDialog('CREATE A ROOM', `<p class="dialog-copy">Set the scale of your battle and invite friends or open the room to global players.</p><form class="room-form" id="room-form"><label>ROOM NAME<input name="roomName" maxlength="28" placeholder="e.g. Dusthaven Strike" required></label><label>TEAM SIZE<select name="teamSize"><option>5 vs 5</option><option>10 vs 10</option><option>15 vs 15</option><option>20 vs 20</option><option>25 vs 25</option></select></label><label>ACCESS<select name="access"><option>Friends &amp; invite code</option><option>Global — anyone can join</option><option>Invite only</option></select></label><button class="button button-primary dialog-submit" type="submit">GENERATE ROOM</button></form>`);
  document.querySelector('#room-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const code = Math.random().toString(36).slice(2, 8).toUpperCase();
    openDialog('ROOM READY', `<p class="dialog-copy">Your <b>${data.get('teamSize')}</b> room “<b>${escapeHtml(data.get('roomName'))}</b>” is configured for <b>${escapeHtml(data.get('access'))}</b>.</p><div class="dialog-summary"><span>ROOM CODE</span><b>${code}</b></div><p class="dialog-copy">Room creation is a local prototype interaction. Online invites will be connected in a later multiplayer milestone.</p>`);
  });
});

document.querySelector('#deploy-btn').addEventListener('click', () => {
  document.querySelector('.match-panel').scrollIntoView({ behavior: 'smooth', block: 'center' });
  toast('CHOOSE A BATTLE SIZE TO DEPLOY');
});
document.querySelector('#briefing-btn').addEventListener('click', () => openDialog('THE CALLASO BATTLE', '<p class="dialog-copy">A contested frontier. A coalition of species fights for control of the Callaso system. Build your squad, choose a scale from 5v5 to 25v25, and join the battle.</p><div class="dialog-summary"><span>FIRST PROTOTYPE</span><b>COMMAND &amp; MATCH SETUP</b></div>'));
document.querySelector('#refresh-btn').addEventListener('click', () => toast('GLOBAL MATCH LIST UPDATED'));

function openDialog(title, html) {
  dialogTitle.textContent = title;
  dialogBody.innerHTML = html;
  dialog.showModal();
}
function toast(message) {
  document.querySelector('.toast')?.remove();
  const element = document.createElement('div');
  element.className = 'toast';
  element.textContent = message;
  document.body.append(element);
  setTimeout(() => element.remove(), 2600);
}
function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

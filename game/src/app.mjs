import { plates } from './plates.mjs';
import { drawHarbor } from './harbor.mjs';
import { createHunt } from './hunt.mjs';
import { playDiscovery } from './feedback.mjs';

const byId = id => document.getElementById(id);
const board = byId('plates');
const navigation = byId('survey-nav');
const width = 640;
const height = 420;
const views = ['left', 'right'];
const completed = new Set();
let current = 0;
let plate;
let hunt;
let timed = false;
let sound = false;
let startedAt = null;
let stoppedAt = null;
let previousStatus;

function fieldNote(message, label = 'Field note') {
  byId('note-label').textContent = label;
  byId('message').textContent = message;
}

function elapsed(start = false) {
  if (start && startedAt === null) startedAt = performance.now();
  if (startedAt === null) return 0;
  return (stoppedAt ?? performance.now()) - startedAt;
}

function pictureMarkup(side, index) {
  const title = index === 0 ? 'Original view' : 'Altered view';
  return `<figure class="plate">
      <figcaption>${title}<span>Plate ${index === 0 ? 'A' : 'B'}</span></figcaption>
      <svg class="picture" data-side="${side}" viewBox="0 0 ${width} ${height}" role="button" tabindex="0"
        aria-label="${title} of ${plate.location}" aria-describedby="keyboard-help">
        <g aria-hidden="true">${drawHarbor(plate, side)}</g>
        <g class="markers" aria-hidden="true"></g>
        <g class="misses" aria-hidden="true"></g>
        <g class="crosshair" transform="translate(320 210)" aria-hidden="true">
          <path d="M-11 0h6m10 0h6M0-11v6m0 10v6" stroke="#244443" stroke-width="5"/>
          <path d="M-11 0h6m10 0h6M0-11v6m0 10v6" stroke="#fff2be" stroke-width="2"/>
        </g>
      </svg>
    </figure>`;
}

function updateNavigation() {
  for (const button of navigation.children) {
    const index = Number(button.dataset.plate);
    button.textContent = plates[index].edition + (completed.has(index) ? ' ✓' : '');
    if (index === current) button.setAttribute('aria-current', 'step');
    else button.removeAttribute('aria-current');
  }
}

function openSurvey(index, focusPicture = false) {
  current = index;
  plate = plates[index];
  hunt = createHunt(plate.differences, { duration: timed ? plate.time : null });
  startedAt = null;
  stoppedAt = null;
  previousStatus = 'playing';
  byId('survey-title').textContent = plate.title;
  byId('survey-description').textContent = plate.description;
  byId('ticks').replaceChildren(...plate.differences.map(() => {
    const tick = document.createElement('span');
    tick.className = 'tick';
    return tick;
  }));
  updateNavigation();
  board.innerHTML = views.map(pictureMarkup).join('');
  board.querySelectorAll('.picture').forEach(bindPicture);
  fieldNote('Find what changed. Choose a difference in either picture.');
  renderProgress(hunt.snapshot(0));
  if (focusPicture) board.querySelector('.picture').focus();
}

function renderProgress(state) {
  byId('remaining').textContent = state.remaining;
  byId('remaining').nextElementSibling.textContent = state.remaining === 1 ? 'difference left' : 'differences left';
  [...byId('ticks').children].forEach((tick, index) => tick.classList.toggle('found', index < state.found.length));

  const hint = byId('hint');
  hint.disabled = state.status !== 'playing' || (state.remainingHints === 0 && state.hinted === null);
  byId('hint-text').textContent = state.hinted ? 'Show hint' : `Hint (${state.remainingHints})`;
  byId('next').hidden = state.status !== 'complete' || current + 1 === plates.length;
  byId('clock').hidden = !timed;
  if (timed) renderClock(state.remainingTime);
}

function renderClock(milliseconds) {
  const seconds = Math.ceil(milliseconds / 1000);
  byId('clock-value').textContent = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  byId('time-bar').max = plate.time;
  byId('time-bar').value = milliseconds;
  byId('clock').classList.toggle('urgent', seconds <= 25);
}

function markerMarkup(area, number) {
  const { x, y, rx, ry } = area;
  const ring = `cx="${x}" cy="${y}" rx="${rx}" ry="${ry}"`;
  const badgeX = x + rx * .76;
  const badgeY = y - ry * .76;
  return `<g class="marker new"><ellipse class="rim" ${ring}/><ellipse class="ring" ${ring}/>
    <circle class="badge" cx="${badgeX}" cy="${badgeY}" r="10"/>
    <text x="${badgeX}" y="${badgeY}">${number}</text></g>`;
}

function markFound(difference, number) {
  for (const side of views) {
    const layer = board.querySelector(`[data-side="${side}"] .markers`);
    layer.insertAdjacentHTML('beforeend', markerMarkup(difference[side], number));
  }
}

function clearHint() {
  board.querySelectorAll('.hint-ring').forEach(ring => ring.remove());
}

function showHint(difference) {
  clearHint();
  for (const side of views) {
    const { x, y, rx, ry } = difference[side];
    const layer = board.querySelector(`[data-side="${side}"] .markers`);
    layer.insertAdjacentHTML('beforeend', `<ellipse class="hint-ring" cx="${x}" cy="${y}" rx="${rx + 9}" ry="${ry + 9}"/>`);
  }
}

function markMiss(picture, x, y) {
  const layer = picture.querySelector('.misses');
  layer.innerHTML = `<path class="miss" d="M${x-5} ${y-5}l10 10m0-10-10 10" stroke="#fff2be" stroke-width="3" stroke-linecap="round"/>`;
}

function finish(state) {
  if (state.status === previousStatus) return;
  previousStatus = state.status;
  if (startedAt !== null) stoppedAt = performance.now();
  clearHint();
  if (state.status === 'expired') {
    fieldNote(`The tide turned with ${state.remaining} still to find. Replay to try again.`, 'Time’s up');
  } else {
    completed.add(current);
    updateNavigation();
    const message = completed.size === plates.length
      ? 'Both surveys are complete. All changes are accounted for.'
      : `All ${state.found.length} changes are recorded in your fieldbook.`;
    fieldNote(message, 'Survey complete');
  }
}

function inspect(picture, x, y) {
  const time = elapsed(true);
  const result = hunt.inspect(picture.dataset.side, x, y, time);
  const state = hunt.snapshot(time);
  if (result.kind === 'found') {
    const difference = plate.differences.find(item => item.id === result.id);
    markFound(difference, state.found.length);
    if (!state.hinted) clearHint();
    fieldNote(`You found ${difference.label}.`, 'Recorded');
    if (sound) playDiscovery(state.status === 'complete');
  } else if (result.kind === 'miss') {
    markMiss(picture, x, y);
    fieldNote(timed ? 'No change there. Four seconds lost.' : 'No change there. Try another detail.');
  } else if (result.kind === 'repeat') {
    fieldNote('That difference is already recorded.');
  }
  finish(state);
  renderProgress(state);
}

function bindPicture(picture) {
  const cursor = { x: width / 2, y: height / 2 };
  const crosshair = picture.querySelector('.crosshair');
  const movement = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
  picture.addEventListener('pointerdown', () => picture.classList.remove('keyboard'));
  picture.addEventListener('focus', () => picture.classList.toggle('keyboard', picture.matches(':focus-visible')));
  picture.addEventListener('click', event => {
    if (event.detail === 0) {
      inspect(picture, cursor.x, cursor.y);
      return;
    }
    const transform = picture.getScreenCTM();
    if (!transform) return;
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(transform.inverse());
    if (point.x >= 0 && point.x <= width && point.y >= 0 && point.y <= height) inspect(picture, point.x, point.y);
  });
  picture.addEventListener('keydown', event => {
    const direction = movement[event.key];
    if (direction) {
      event.preventDefault();
      picture.classList.add('keyboard');
      const step = event.shiftKey ? 3 : 12;
      cursor.x = Math.max(0, Math.min(width, cursor.x + direction[0] * step));
      cursor.y = Math.max(0, Math.min(height, cursor.y + direction[1] * step));
      crosshair.setAttribute('transform', `translate(${cursor.x} ${cursor.y})`);
    } else if ((event.key === 'Enter' || event.key === ' ') && !event.repeat) {
      event.preventDefault();
      inspect(picture, cursor.x, cursor.y);
    }
  });
}

plates.forEach((item, index) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.dataset.plate = index;
  button.addEventListener('click', () => {
    if (index !== current) openSurvey(index);
  });
  navigation.append(button);
});

byId('hint').addEventListener('click', () => {
  const time = elapsed(true);
  const id = hunt.revealHint(time);
  if (id !== null) {
    const difference = plate.differences.find(item => item.id === id);
    showHint(difference);
    fieldNote(difference.hint, 'Hint');
  }
  const state = hunt.snapshot(time);
  finish(state);
  renderProgress(state);
});

byId('replay').addEventListener('click', () => openSurvey(current, true));
byId('next').addEventListener('click', () => openSurvey(current + 1, true));
byId('mode').addEventListener('click', event => {
  timed = !timed;
  event.currentTarget.setAttribute('aria-pressed', timed);
  event.currentTarget.textContent = timed ? 'Timed on' : 'Timed mode';
  openSurvey(current);
});
byId('sound').addEventListener('click', event => {
  sound = !sound;
  event.currentTarget.setAttribute('aria-pressed', sound);
  event.currentTarget.textContent = sound ? 'Sound on' : 'Sound off';
  if (sound) playDiscovery(false);
});

openSurvey(0);
setInterval(() => {
  if (!timed || startedAt === null || previousStatus !== 'playing') return;
  const state = hunt.snapshot(elapsed());
  renderClock(state.remainingTime);
  if (state.status !== 'playing') {
    finish(state);
    renderProgress(state);
  }
}, 100);

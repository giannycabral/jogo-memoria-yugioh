const grid = document.querySelector('.grid');
const spanPlayer = document.querySelector('.player');
const pauseBtn = document.querySelector('.pause-btn');
const timer = document.querySelector('.timer');
const recordSpan = document.querySelector('.record');

function getRecords() {
  const records = localStorage.getItem('records');
  if (records) {
    return JSON.parse(records);
  }
  return [];
}

function setRecords(records) {
  localStorage.setItem('records', JSON.stringify(records));
}

function addRecord(name, time) {
  let records = getRecords();
  records.push({ name, time });
  records = records.sort((a, b) => a.time - b.time).slice(0, 3);
  setRecords(records);
}

function showRecords() {
  const records = getRecords();
  const medals = ['🥇', '🥈', '🥉'];
  if (records.length) {
    let html = '<div class="record-list">';
    records.forEach((rec, idx) => {
      html += `<div class="record-item"><span class="record-medal">${medals[idx]}</span> ${rec.name} - ${formatTime(rec.time)}s</div>`;
    });
    html += '</div>';
    recordSpan.innerHTML = html;
  } else {
    recordSpan.textContent = 'Recorde: --';
  }
}

const characters = [
  'dark-magician-girl',
  'dragon-blue-eyes',
  'dragon-of-ra',
  'gardiao-celta',
  'exodia',
  'jinzo',
  'kuriboh',
  'obelisk',
  'rei-caveira',
  'slifer',
  'dark-magician',
  'la-moon',
  'mystical-elf',
];

const createElement = (tag, className) => {
  const element = document.createElement(tag);
  element.className = className;
  return element;
}

let firstCard = '';
let secondCard = '';
let loop = null;
let paused = false;

function formatTime(seconds) {
  return seconds.toString().padStart(2, '0');
}

// Modal de fim de jogo
const createEndGameModal = (player, time) => {
  let modal = document.querySelector('.endgame-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.className = 'endgame-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.innerHTML = `
      <div class="endgame-modal-content">
        <h2>Parabéns, <span class="modal-player"></span>!</h2>
        <p>Seu tempo foi de: <span class="modal-time"></span> segundos</p>
        <div class="modal-btns">
          <button class="modal-restart">Jogar novamente</button>
          <button class="modal-back">Voltar ao login</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }
  modal.querySelector('.modal-player').textContent = player;
  modal.querySelector('.modal-time').textContent = time;
  modal.style.display = 'flex';
  modal.querySelector('.modal-restart').focus();
  modal.querySelector('.modal-restart').onclick = () => {
    modal.style.display = 'none';
    window.location.reload();
  };
  modal.querySelector('.modal-back').onclick = () => {
    window.location.href = '/jogo-memoria-yugioh/';
  };
};

function getRecord() {
  const record = localStorage.getItem('record');
  if (record) {
    return JSON.parse(record);
  }
  return null;
}

function setRecord(name, time) {
  localStorage.setItem('record', JSON.stringify({ name, time }));
}

function showRecord() {
  const record = getRecord();
  if (record) {
    recordSpan.textContent = `Recorde: ${record.name} - ${formatTime(record.time)}s`;
  } else {
    recordSpan.textContent = 'Recorde: --';
  }
}

const checkEndGame = () => {
  const disabledCards = document.querySelectorAll('.disabled-card');
  const totalCards = document.querySelectorAll('.card').length;
  if (disabledCards.length === totalCards) {
    clearInterval(loop);
    const player = spanPlayer.innerHTML;
    const time = +timer.innerHTML;
    addRecord(player, time);
    showRecords();
    createEndGameModal(player, time);
  }
}

const checkCards = () => {
  const firstCharacter = firstCard.getAttribute('data-character');
  const secondCharacter = secondCard.getAttribute('data-character');

  if (firstCharacter === secondCharacter) {

    firstCard.firstChild.classList.add('disabled-card');
    secondCard.firstChild.classList.add('disabled-card');

    firstCard = '';
    secondCard = '';

    checkEndGame();

  } else {
    setTimeout(() => {

      firstCard.classList.remove('reveal-card');
      secondCard.classList.remove('reveal-card');

      firstCard = '';
      secondCard = '';

    }, 500);
  }

}

const setCardsBlocked = (block) => {
  const cards = document.querySelectorAll('.card');
  cards.forEach(card => {
    if (block) {
      card.classList.add('blocked');
    } else {
      card.classList.remove('blocked');
    }
  });
};

pauseBtn.addEventListener('click', () => {
  paused = !paused;
  const icon = pauseBtn.querySelector('.pause-icon');
  const text = pauseBtn.querySelector('.pause-text');
  if (paused) {
    icon.textContent = '▶️';
    text.textContent = 'Continuar';
  } else {
    icon.textContent = '⏸️';
    text.textContent = 'Pausar';
  }
  pauseBtn.setAttribute('aria-pressed', paused);
  if (paused) {
    clearInterval(loop);
    setCardsBlocked(true);
  } else {
    startTimer();
    setCardsBlocked(false);
  }
});

// Modifique a função revealCard para não permitir jogada se pausado ou bloqueado
const revealCard = ({ target }) => {
  if (paused || target.parentNode.className.includes('blocked')) {
    return;
  }

  if (target.parentNode.className.includes('reveal-card')) {
    return;
  }

  if (firstCard === '') {

    target.parentNode.classList.add('reveal-card');
    firstCard = target.parentNode;

  } else if (secondCard === '') {

    target.parentNode.classList.add('reveal-card');
    secondCard = target.parentNode;

    checkCards();

  }
}

const createCard = (character) => {
  const card = createElement('div', 'card');
  const front = createElement('div', 'face front');
  const back = createElement('div', 'face back');

  // Verifica extensão da imagem
  let ext = 'png';
  if ([
    'dark-magician',
    'la-moon',
    'mystical-elf'
  ].includes(character)) {
    ext = 'jpg';
  }
  front.style.backgroundImage = `url('/jogo-memoria-yugioh/imagens/${character}.${ext}')`;

  card.appendChild(front);
  card.appendChild(back);

  card.addEventListener('click', revealCard);
  card.setAttribute('data-character', character)

  return card;
}

const loadGame = () => {
  const duplicateCharacters = [...characters, ...characters];

  const shuffledArray = duplicateCharacters.sort(() => Math.random() - 0.5);

  shuffledArray.forEach((character) => {
    const card = createCard(character);
    grid.appendChild(card);
  });
}

const startTimer = () => {
  let seconds = 0;
  timer.innerHTML = formatTime(seconds);
  loop = setInterval(() => {
    seconds++;
    timer.innerHTML = formatTime(seconds);
  }, 1000);
}

window.onload = () => {
  spanPlayer.innerHTML = localStorage.getItem('player');
  showRecords();
  startTimer();
  loadGame();
}

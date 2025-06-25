// Overlay de orientação paisagem para mobile
function checkOrientation() {
  const overlay = document.getElementById('orientationOverlay');
  // Só ativa em telas pequenas (mobile)
  if (window.innerWidth < 700 && window.innerHeight > window.innerWidth) {
    overlay.classList.add('active');
  } else {
    overlay.classList.remove('active');
  }
}

window.addEventListener('orientationchange', checkOrientation);
window.addEventListener('resize', checkOrientation);

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

// Variáveis para controlar o Easter Egg do Exodia
let easterEggActive = false;
const exodiaPartsFound = [];

// Objetos de cartas em vez de simples strings
const cardObjects = [
  { name: 'dark-magician-girl', img: 'dark-magician-girl.png' },
  { name: 'dragon-blue-eyes', img: 'dragon-blue-eyes.png' },
  { name: 'dragon-of-ra', img: 'dragon-of-ra.png' },
  { name: 'gardiao-celta', img: 'gardiao-celta.png' },
  { name: 'jinzo', img: 'jinzo.png' },
  { name: 'kuriboh', img: 'kuriboh.png' },
  { name: 'obelisk', img: 'obelisk.png' },
  { name: 'rei-caveira', img: 'rei-caveira.png' },
  { name: 'slifer', img: 'slifer.png' },
  { name: 'dark-magician', img: 'dark-magician.jpg' },
  { name: 'la-moon', img: 'la-moon.jpg' },
  { name: 'mystical-elf', img: 'mystical-elf.jpg' },
  
  // Partes do Exodia (sem par!)
  { name: 'exodia-head', img: 'exodia.jpg', isExodiaPart: true },
  { name: 'exodia-right-arm', img: 'exodia-right-arm.jpg', isExodiaPart: true },
  { name: 'exodia-left-arm', img: 'exodia-left-arm.jpg', isExodiaPart: true },
  { name: 'exodia-right-leg', img: 'exodia-right-leg.jpg', isExodiaPart: true },
  { name: 'exodia-left-leg', img: 'exodia-left-leg.jpg', isExodiaPart: true }
];

// Lista simples para compatibilidade com o código existente
const characters = cardObjects.filter(card => !card.isExodiaPart).map(card => card.name);

const createElement = (tag, className) => {
  const element = document.createElement(tag);
  element.className = className;
  return element;
}

let firstCard = '';
let secondCard = '';

let loop = null;
let paused = false;
let seconds = 0;

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
    window.location.href = 'index.html';
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

// Função para exibir alertas no jogo
const showAlert = (message, duration = 3000) => {
  let alertBox = document.querySelector('.game-alert');
  if (!alertBox) {
    alertBox = document.createElement('div');
    alertBox.className = 'game-alert';
    document.body.appendChild(alertBox);
  }
  
  alertBox.innerHTML = message;
  alertBox.classList.add('active');
  
  setTimeout(() => {
    alertBox.classList.remove('active');
  }, duration);
};

// Função para lidar com as partes do Exodia encontradas
const handleExodiaLogic = (card) => {
  const cardName = card.getAttribute('data-character');
  
  // Se a carta já foi encontrada, não faz nada
  if (exodiaPartsFound.includes(cardName)) {
    return;
  }
  
  // Marca a carta como encontrada
  card.classList.add('exodia-found');
  exodiaPartsFound.push(cardName);
  
  // Atualiza o jogador sobre o progresso
  showAlert(`Parte ${exodiaPartsFound.length} de 5 do Exodia encontrada!`);
  
  // Verifica condição de vitória do Exodia
  checkForExodiaWin();
};

// Verifica se todas as 5 partes do Exodia foram encontradas
const checkForExodiaWin = () => {
  const exodiaParts = cardObjects.filter(card => card.isExodiaPart).map(card => card.name);
  
  if (exodiaPartsFound.length === 5) {
    // Para o cronômetro
    clearInterval(loop);
    
    setTimeout(() => {
      // EXODIA, OBLITERAR!
      grid.innerHTML = `
        <div class="exodia-win-screen">
          <h1>EXODIA, OBLITERAR!</h1>
          <h2>Você confiou no coração das cartas e Venceu o duelo! Parabéns!</h2>
          <div class="exodia-video-container">
            <video id="exodia-video" autoplay controls class="exodia-video">
              <source src="video/EXODIA.mp4" type="video/mp4">
              Seu navegador não suporta vídeos HTML5.
            </video>
          </div>
          <div class="exodia-buttons">
            <button class="exodia-button restart-button">Jogar novamente</button>
            <button class="exodia-button home-button">Voltar à tela inicial</button>
          </div>
        </div>
      `;
      
      // Reproduz o vídeo automaticamente
      const exodiaVideo = document.getElementById('exodia-video');
      if (exodiaVideo) {
        exodiaVideo.play().catch(error => {
          console.log('Reprodução automática bloqueada pelo navegador:', error);
        });
        
        // Adiciona um evento para continuar o jogo quando o vídeo terminar
        exodiaVideo.addEventListener('ended', () => {
          // O vídeo pode ser reproduzido novamente se o jogador quiser
          exodiaVideo.controls = true;
        });
      }
      
      // Adiciona event listeners aos botões
      document.querySelector('.restart-button').addEventListener('click', () => {
        window.location.reload();
      });
      
      document.querySelector('.home-button').addEventListener('click', () => {
        window.location.href = 'index.html';
      });
    }, 1000);
  }
};

// Modifique a função revealCard para não permitir jogada se pausado ou bloqueado e adicionar suporte ao Exodia
const revealCard = ({ target }) => {
  if (paused || target.parentNode.className.includes('blocked')) {
    return;
  }

  if (target.parentNode.className.includes('reveal-card')) {
    return;
  }
  
  // Verifica se é uma parte do Exodia
  if (target.parentNode.getAttribute('data-exodia') === 'true') {
    const cardName = target.parentNode.getAttribute('data-character');
    
    // Se for a cabeça do Exodia e o easter egg não estiver ativo ainda
    if (cardName === 'exodia-head' && !easterEggActive) {
      // Ativa o Easter Egg
      easterEggActive = true;
      target.parentNode.classList.add('reveal-card');
      target.parentNode.classList.add('exodia-found');
      
      // Adiciona à lista de partes encontradas
      exodiaPartsFound.push(cardName);
      
      // Avisa o jogador
      showAlert('Você libertou o Proibido! Encontre as outras 4 partes do Exodia para vencer!', 5000);
      return;
    }
    
    // Se o Easter Egg já estiver ativo
    if (easterEggActive) {
      target.parentNode.classList.add('reveal-card');
      handleExodiaLogic(target.parentNode);
      return;
    }
  }
  
  // Lógica normal de cartas para pares
  if (firstCard === '') {
    target.parentNode.classList.add('reveal-card');
    firstCard = target.parentNode;
  } else if (secondCard === '') {
    target.parentNode.classList.add('reveal-card');
    secondCard = target.parentNode;
    checkCards();
  }
}

const createCard = (cardData) => {
  const card = createElement('div', 'card');
  const front = createElement('div', 'face front');
  const back = createElement('div', 'face back');

  // Se for um objeto, pega o nome, senão usa o próprio valor
  let character = typeof cardData === 'object' ? cardData.name : cardData;
  let imagePath = typeof cardData === 'object' ? cardData.img : `${character}.png`;

  // Verifica extensão da imagem se não for especificada
  if (!imagePath.includes('.')) {
    let ext = 'png';
    if ([
      'dark-magician',
      'la-moon',
      'mystical-elf'
    ].includes(character)) {
      ext = 'jpg';
    }
    imagePath = `${character}.${ext}`;
  }
  
  front.style.backgroundImage = `url('imagens/${imagePath}')`;

  card.appendChild(front);
  card.appendChild(back);

  card.addEventListener('click', revealCard);
  card.setAttribute('data-character', character);
  
  // Se for uma parte do Exodia, adiciona o atributo
  if (cardData.isExodiaPart) {
    card.setAttribute('data-exodia', 'true');
  }

  return card;
}

const loadGame = () => {
  // Cria cartas normais com pares
  const normalCards = cardObjects.filter(card => !card.isExodiaPart);
  const duplicatedNormalCards = [...normalCards, ...normalCards];
  
  // Obtém cartas do Exodia (sem duplicar - são peças únicas)
  const exodiaCards = cardObjects.filter(card => card.isExodiaPart);
  
  // Combina todas as cartas
  const allCards = [...duplicatedNormalCards, ...exodiaCards];
  
  // Embaralha o array
  const shuffledArray = allCards.sort(() => Math.random() - 0.5);
  
  // Carrega as cartas no grid
  shuffledArray.forEach((cardData) => {
    const card = createCard(cardData);
    grid.appendChild(card);
  });
}


const startTimer = () => {
  // Só atualiza o timer na tela ao iniciar
  timer.innerHTML = formatTime(seconds);
  loop = setInterval(() => {
    seconds++;
    timer.innerHTML = formatTime(seconds);
  }, 1000);
}

// Função para carregar as imagens das partes do Exodia
const createExodiaImages = () => {
  // Lista todas as partes do Exodia com seus respectivos arquivos
  const partes = [
    { name: 'exodia-head', title: 'Exodia, o Proibido', img: 'exodia.jpg' },
    { name: 'exodia-right-arm', title: 'Braço Direito do Proibido', img: 'exodia-right-arm.jpg' },
    { name: 'exodia-left-arm', title: 'Braço Esquerdo do Proibido', img: 'exodia-left-arm.jpg' },
    { name: 'exodia-right-leg', title: 'Perna Direita do Proibido', img: 'exodia-right-leg.jpg' },
    { name: 'exodia-left-leg', title: 'Perna Esquerda do Proibido', img: 'exodia-left-leg.jpg' }
  ];
  
  // Pré-carrega as imagens para garantir que estarão disponíveis
  partes.forEach(parte => {
    // Verifica se a imagem já existe no DOM
    let img = document.querySelector(`#${parte.name}-img`);
    if (!img) {
      img = document.createElement('img');
      img.id = `${parte.name}-img`;
      img.src = `imagens/${parte.img}`; // Usa o caminho da imagem específica
      img.style.display = 'none';      
      document.body.appendChild(img);
    }
  });
};

window.onload = () => {
  spanPlayer.innerHTML = localStorage.getItem('player');
  showRecords();
  seconds = 0;
  startTimer();
  createExodiaImages(); // Cria as imagens temporárias para as partes do Exodia
  loadGame();
  checkOrientation();
}

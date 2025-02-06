import './style.css'
import { Scene } from './components/Scene'

// Сначала создаём HTML структуру
document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <header class="header">
    <div class="header-content">
      <div class="logo-container">
        <span class="logo-text">K</span>
      </div>
      <h1>Портфолио разработчика</h1>
      <nav class="nav-links">
        <a href="#projects">Проекты</a>
        <a href="#about">Обо мне</a>
        <a href="#contact">Контакты</a>
      </nav>
    </div>
  </header>
  <div class="container">
    <div class="left-section">
      <div class="model-container">
        <div id="scene-container"></div>
      </div>
    </div>
    <div class="right-section">
      <div class="projects-carousel">
        <div class="carousel-container">
          <div class="carousel-track">
            <div class="project-card active">
              <h2>Проект 1</h2>
              <p class="project-description">Описание проекта 1</p>
              <div class="project-links">
                <a href="#" class="project-link">Демо</a>
                <a href="#" class="project-link">GitHub</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="heart-container">
    <button id="heart-btn" class="heart-button">
      <svg class="heart-icon" viewBox="0 0 32 32">
        <path d="M16,28.261c0,0-14-7.926-14-17.046c0-9.356,13.159-10.399,14-0.454c1.011-9.938,14-8.903,14,0.454
        C30,20.335,16,28.261,16,28.261z"/>
      </svg>
    </button>
    <div id="like-count">Лайков: 0</div>
  </div>
`

// После создания DOM-структуры инициализируем сцену
const container = document.querySelector('#scene-container')
if (container) {
  const scene = new Scene(container as HTMLElement)
  
  // Теперь добавляем карточки проектов
  const carouselTrack = document.querySelector('.carousel-track')
  if (carouselTrack) {
    // Очищаем существующие карточки
    carouselTrack.innerHTML = ''
    
    // Создаем массив карточек в правильном порядке
    const cards = Array.from({ length: 12 }, (_, i) => {
      const card = document.createElement('div')
      card.className = 'project-card'
      
      const backgroundColor = scene.getFaceColor(i)
      const projectInfo = scene.getFaceInfo(i)
      const projectLink = scene.getFaceLink(i)
      
      card.style.setProperty('--card-color', backgroundColor)
      card.innerHTML = `
        <h2>Проект ${i + 1}</h2>
        <p class="project-description">${projectInfo}</p>
        <div class="project-links">
          <a href="${projectLink}" class="project-link" target="_blank">Демо</a>
          <a href="#" class="project-link">GitHub</a>
        </div>
      `
      return card
    })
    
    // Добавляем карточки в правильном порядке
    cards.forEach((card, index) => {
      if (index === 0) card.classList.add('active')
      carouselTrack.appendChild(card)
    })
  }
}

// Добавьте эту функцию после основного кода
function createStars() {
  const numberOfStars = 100;
  const container = document.body;
  
  for (let i = 0; i < numberOfStars; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    
    // Случайное положение
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;
    
    // Случайная длительность мерцания
    star.style.setProperty('--twinkle-duration', `${2 + Math.random() * 3}s`);
    
    container.appendChild(star);
  }
}

function setupHeartButton() {
  const heartButton = document.getElementById('heart-btn');
  const likeCountDisplay = document.getElementById('like-count');
  let scale = 1; // Начальный размер
  let hue = Math.random() * 360; // Случайный цвет
  let saturation = 80; // Увеличиваем насыщенность
  let lightness = 50; // Чуть светлее
  let growthFactor = 1.3;
  let clicks = 0;
  let opacity = 0.1; // Изначально слегка прозрачное
  let isCooldown = false; // Переменная для отслеживания состояния кнопки

  // Получаем количество лайков из localStorage
  let likeCount = parseInt(localStorage.getItem('likeCount') || '0', 10);
  likeCountDisplay!.innerText = `Лайков: ${likeCount}`;

  // Устанавливаем начальный цвет сердечка с прозрачностью
  const heartIcon = heartButton.querySelector('.heart-icon') as SVGElement;
  heartIcon.style.fill = `hsla(${hue}, ${saturation}%, ${lightness}%, ${opacity})`;
  const glowOpacity = 0.2; // Уровень свечения

  heartIcon.style.filter = `drop-shadow(0 0 2px hsla(${hue}, ${saturation}%, ${lightness}%, ${glowOpacity})`; // Убираем неоновость

  if (heartButton) {
    heartButton.addEventListener('click', () => {
      if (isCooldown) return; // Если в состоянии ожидания, игнорируем клик

      clicks++;
      growthFactor = Math.max(1.1, growthFactor * 0.95);
      scale *= growthFactor;

      // Более мягкое изменение оттенка
      hue = (hue + (Math.random() * 10 - 5)) % 360; // Случайное колебание оттенка

      // Случайные вариации насыщенности и яркости
      saturation = 80 + (Math.sin(clicks * 0.2) * 10); // Увеличиваем диапазон
      lightness = 50 + (Math.cos(clicks * 0.3) * 5); // Увеличиваем диапазон

      // Убираем подпрыгивания и вращения
      heartButton.style.transform = `scale(${scale})`;

      // Уменьшаем прозрачность после достижения порога
      if (clicks > 10) {
        opacity = Math.max(0.1, 0.5 - (clicks - 10) * 0.033); // Уменьшаем прозрачность, но не ниже 0.1
      } else {
        opacity = 0.5; // Увеличиваем прозрачность до 0.5 после первого клика
      }

      // Обновляем цвет сердечка
      heartIcon.style.fill = `hsla(${hue}, ${saturation}%, ${lightness}%, ${opacity})`;
      heartIcon.style.filter = `drop-shadow(0 0 2px hsla(${hue}, ${saturation}%, ${lightness}%, ${glowOpacity})`; // Обновляем цвет свечения

      // Анимация увеличения сердечка
      heartButton.style.transition = 'transform 0.3s ease';
      heartButton.style.transform = `scale(${scale})`;

      // Увеличиваем счётчик лайков
      likeCount++;
      localStorage.setItem('likeCount', likeCount.toString());
      likeCountDisplay!.innerText = `Лайков: ${likeCount}`;

      if (clicks >= 40) {
        setTimeout(() => {
          scale = 1; // Сброс размера
          hue = Math.random() * 360; // Случайный цвет
          opacity = 0.1; // Возвращаем к едва заметной прозрачности
          growthFactor = 1.3;
          clicks = 0; // Сбрасываем количество кликов

          // Плавное возвращение с эффектом света
          heartButton.style.transition = 'transform 0.5s ease, opacity 0.5s ease';
          heartButton.style.transform = `scale(1.5)`;
          setTimeout(() => {
            heartButton.style.transform = `scale(1)`; // Возвращаем к нормальному размеру
            heartIcon.style.fill = `hsla(${hue}, ${saturation}%, ${lightness}%, ${opacity})`; // Применяем прозрачность
            heartIcon.style.filter = `drop-shadow(0 0 2px hsla(${hue}, ${saturation}%, ${lightness}%, ${glowOpacity})`; // Обновляем цвет свечения
            isCooldown = true; // Включаем состояние ожидания
            setTimeout(() => {
              isCooldown = false; // Сбрасываем состояние ожидания
              // Устанавливаем прозрачность обратно на 0.1
              opacity = 0.1; // Возвращаем к изначальной прозрачности
              heartIcon.style.fill = `hsla(${hue}, ${saturation}%, ${lightness}%, ${opacity})`; // Возвращаем цвет
              heartIcon.style.filter = `drop-shadow(0 0 2px hsla(${hue}, ${saturation}%, ${lightness}%, ${glowOpacity})`; // Обновляем цвет свечения
            }, 0); // Убираем задержку
          }, 100);
        }, 300);
      }
    });

    // Эффект свечения при наведении
    heartButton.addEventListener('mouseenter', () => {
      heartIcon.style.filter = `drop-shadow(0 0 8px hsla(${hue}, ${saturation}%, ${lightness}%, ${glowOpacity})`; // Свечение
    });

    heartButton.addEventListener('mouseleave', () => {
      heartIcon.style.filter = `drop-shadow(0 0 2px hsla(${hue}, ${saturation}%, ${lightness}%, ${glowOpacity})`; // Убираем свечение
    });
  }
}

createStars()
setupHeartButton()

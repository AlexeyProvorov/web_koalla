import './style.css'
import { Scene } from './components/Scene'

// Создаём HTML-структуру
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
`;

// Инициализируем сцену (если используется)
const container = document.querySelector('#scene-container');
if (container) {
  const scene = new Scene(container as HTMLElement);

  // Добавляем карточки проектов
  const carouselTrack = document.querySelector('.carousel-track');
  if (carouselTrack) {
    carouselTrack.innerHTML = '';

    const cards = Array.from({ length: 12 }, (_, i) => {
      const card = document.createElement('div');
      card.className = 'project-card';

      const backgroundColor = scene.getFaceColor(i);
      const projectInfo = scene.getFaceInfo(i);
      const projectLink = scene.getFaceLink(i);

      card.style.setProperty('--card-color', backgroundColor);
      card.innerHTML = `
        <h2>Проект ${i + 1}</h2>
        <p class="project-description">${projectInfo}</p>
        <div class="project-links">
          <a href="${projectLink}" class="project-link" target="_blank">Демо</a>
          <a href="#" class="project-link">GitHub</a>
        </div>
      `;
      return card;
    });

    cards.forEach((card, index) => {
      if (index === 0) card.classList.add('active');
      carouselTrack.appendChild(card);
    });
  }
}

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
  let likeCount = parseInt(localStorage.getItem('likeCount') || '0', 10);

  heartButton!.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  likeCountDisplay!.innerText = `Лайков: ${likeCount}`;

  if (heartButton) {
    heartButton.addEventListener('click', () => {
      likeCount++;
      localStorage.setItem('likeCount', likeCount.toString());
      likeCountDisplay!.innerText = `Лайков: ${likeCount}`;

      // Добавляем класс active — сердечко становится большим (scale 1) и ярким (opacity 0.8)
      heartButton.classList.add('active');

      // Добавляем класс beat для пульсации
      heartButton.classList.add('beat');
      (heartButton as HTMLButtonElement).disabled = true;

      // Через 0.5 секунд удаляем класс beat, оставляя активное состояние (scale 1)
      setTimeout(() => {
        heartButton.classList.remove('beat');
      }, 500);

      // Через 3 секунды возвращаем сердечко в исходное состояние, обновляем цвет и разблокируем кнопку
      setTimeout(() => {
        const newHue = Math.random() * 360;
        const heartIcon = heartButton.querySelector('.heart-icon') as SVGElement;
        heartIcon.style.fill = `hsla(${newHue}, 80%, 50%, 1)`;
        heartButton.classList.remove('active');
        (heartButton as HTMLButtonElement).disabled = false;
      }, 3000);
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  createStars();
  setupHeartButton();
});

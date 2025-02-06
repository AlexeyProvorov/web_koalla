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

createStars();

import './style.css'
import { Scene } from './components/Scene'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div id="scene-container"></div>
  <div class="welcome">
    <h1>Добро пожаловать в мое портфолио</h1>
  </div>
`

const container = document.querySelector('#scene-container') as HTMLElement
const scene = new Scene(container)
scene.animate()

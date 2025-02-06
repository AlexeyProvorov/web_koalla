import * as THREE from 'three'
import TWEEN from '@tweenjs/tween.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

export class Scene {
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private renderer: THREE.WebGLRenderer
  private dodecahedronGroup: THREE.Group
  private raycaster: THREE.Raycaster = new THREE.Raycaster()
  private mouse: THREE.Vector2 = new THREE.Vector2()
  private isAnimating: boolean = false
  private initialY: number = 0
  private floatingAmplitude: number = 0.6
  private floatingSpeed: number = 0.0015
  private elapsedTime: number = 0
  private rotationInertia = { x: 0, y: 0, z: 0 }
  private controls: OrbitControls
  private isDragging: boolean = false
  private lastMousePosition = { x: 0, y: 0 }

  private colors: THREE.Color[] = [
    new THREE.Color('#FF9999'),  // Красный - Three.js проект
    new THREE.Color('#99FF99'),  // Зеленый - React проект
    new THREE.Color('#9999FF'),  // Синий - Vue проект
    new THREE.Color('#FFDD99'),  // Золотой - Next.js проект
    new THREE.Color('#FF99AA'),  // Розовый - Node.js проект
    new THREE.Color('#99FFFF'),  // Циан - Python проект
    new THREE.Color('#FFAA99'),  // Оранжевый - Angular проект
    new THREE.Color('#AA99FF'),  // Индиго - Mobile App
    new THREE.Color('#AAFF99'),  // Лайм - Game project
    new THREE.Color('#CCCCCC'),  // Серый - DevOps проект
    new THREE.Color('#99DDDD'),  // Морской - AI проект
    new THREE.Color('#FFAA88')   // Терракотовый - Blockchain
  ]

  private faceLinks: { link: string; info: string }[] = [
    { link: 'https://threejs-portfolio.com', info: '3D Portfolio: Интерактивное портфолио на Three.js' },
    { link: 'https://react-dashboard.com', info: 'React Dashboard: Аналитическая панель управления' },
    { link: 'https://vue-ecommerce.com', info: 'Vue E-commerce: Онлайн магазин с корзиной' },
    { link: 'https://next-blog.com', info: 'Next.js Blog: Блог-платформа с SSR' },
    { link: 'https://node-api.com', info: 'Node.js API: RESTful сервис с MongoDB' },
    { link: 'https://python-ml.com', info: 'Python ML: Система анализа данных' },
    { link: 'https://angular-crm.com', info: 'Angular CRM: Система управления клиентами' },
    { link: 'https://react-native-app.com', info: 'Mobile App: Кроссплатформенное приложение' },
    { link: 'https://unity-game.com', info: 'Game Dev: 2D платформер на Unity' },
    { link: 'https://devops-tools.com', info: 'DevOps: CI/CD пайплайны и мониторинг' },
    { link: 'https://ai-assistant.com', info: 'AI Chat: Чат-бот на основе ML' },
    { link: 'https://blockchain-dapp.com', info: 'DApp: Децентрализованное приложение' }
  ]

  constructor(container: HTMLElement) {
    // Сцена
    this.scene = new THREE.Scene()
    this.scene.background = null

    // Камера
    const aspect = container.clientWidth / container.clientHeight
    this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000)
    this.camera.position.z = 16

    // Рендерер с прозрачностью
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true
    })
    this.renderer.setSize(container.clientWidth, container.clientHeight)
    this.renderer.setClearColor(0x000000, 0)
    container.appendChild(this.renderer.domElement)

    // Свет
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
    this.scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)
    directionalLight.position.set(5, 10, 7.5)
    this.scene.add(directionalLight)

    // Группа граней
    this.dodecahedronGroup = new THREE.Group()
    this.scene.add(this.dodecahedronGroup)

    // Загружаем текстуру древесины
    const textureLoader = new THREE.TextureLoader()
    textureLoader.load(
      '/wood_texture.jpg',
      (texture) => {
        console.log('Текстура успешно загружена')
        texture.needsUpdate = true
        this.createDodecahedronFaces(texture)
      },
      undefined,
      (error) => {
        console.error('Ошибка загрузки текстуры:', error)
        // При ошибке используем "пустую" текстуру
        const fallbackTexture = new THREE.Texture()
        this.createDodecahedronFaces(fallbackTexture)
      }
    )

    // События
    window.addEventListener('keydown', this.handleKeyPress.bind(this))
    window.addEventListener('resize', this.onWindowResize.bind(this))
    this.renderer.domElement.addEventListener('click', this.onDocumentClick.bind(this), false)

    // Добавляем после создания камеры и рендерера
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.05
    this.controls.rotateSpeed = 0.5
    this.controls.enableZoom = false
    this.controls.enablePan = false

    // Добавляем обработчики событий мыши
    this.renderer.domElement.addEventListener('mousedown', this.onMouseDown.bind(this))
    this.renderer.domElement.addEventListener('mousemove', this.onMouseMove.bind(this))
    this.renderer.domElement.addEventListener('mouseup', this.onMouseUp.bind(this))

    this.animate()
  }

  /**
   * Разбивает додекаэдр на 12 граней (по 3 треугольника на грань).
   */
  private createDodecahedronFaces(woodTexture: THREE.Texture) {
    const geometry = new THREE.DodecahedronGeometry(6)
    const nonIndexedGeometry = geometry.toNonIndexed()

    const positionAttribute = nonIndexedGeometry.getAttribute('position')
    const positions = Array.from(positionAttribute.array)
    const totalTriangles = positions.length / 9
    const faceCount = 12

    for (let faceIndex = 0; faceIndex < faceCount; faceIndex++) {
      // Собираем вершины (3 треугольника => 9 вершин)
      const startTriangle = faceIndex * 3
      const facePositions: number[] = []

      for (let t = 0; t < 3; t++) {
        const triangleStart = (startTriangle + t) * 9
        for (let i = 0; i < 9; i++) {
          facePositions.push(positions[triangleStart + i])
        }
      }

      // Создаём геометрию
      const faceGeometry = new THREE.BufferGeometry()
      faceGeometry.setAttribute('position', new THREE.Float32BufferAttribute(facePositions, 3))
      faceGeometry.computeVertexNormals()

      // Генерируем UV-координаты
      this.generateFaceUVs(faceGeometry)

      // Используем предопределенный цвет вместо генерации
      const faceColor = this.colors[faceIndex]

      // Создаём текстуру с выгравированным текстом
      const engravedTexture = this.createEngravedTexture(
        woodTexture,
        this.faceLinks[faceIndex].info,
        faceColor
      )

      // Материал
      const material = new THREE.MeshStandardMaterial({
        map: engravedTexture,
        roughness: 1,
        metalness: 0,
        side: THREE.DoubleSide // двойная прорисовка, исключает чёрные "дыры"
      })

      const faceMesh = new THREE.Mesh(faceGeometry, material)

      // Не сдвигаем грань по нормали, чтобы не было зазоров
      this.dodecahedronGroup.add(faceMesh)
    }
  }

  /**
   * Генерирует UV-координаты для отдельной грани.
   */
  private generateFaceUVs(geometry: THREE.BufferGeometry) {
    const posAttr = geometry.getAttribute('position')
    const vertexCount = posAttr.count

    const positions: THREE.Vector3[] = []
    for (let i = 0; i < vertexCount; i++) {
      positions.push(new THREE.Vector3().fromBufferAttribute(posAttr, i))
    }

    // Центр грани
    const center = new THREE.Vector3()
    positions.forEach(v => center.add(v))
    center.divideScalar(vertexCount)

    // Ось X
    const axisX = new THREE.Vector3().subVectors(positions[0], center).normalize()
    // Нормаль (по первым 3 вершинам)
    const v0 = positions[0]
    const v1 = positions[1]
    const v2 = positions[2]
    const faceNormal = new THREE.Vector3()
      .subVectors(v1, v0)
      .cross(new THREE.Vector3().subVectors(v2, v0))
      .normalize()
    // Ось Y
    const axisY = new THREE.Vector3().crossVectors(faceNormal, axisX).normalize()

    // Проецируем вершины на 2D
    const uvs: number[] = []
    const proj: { u: number; v: number }[] = []

    positions.forEach(v => {
      const relative = new THREE.Vector3().subVectors(v, center)
      const u = relative.dot(axisX)
      const vCoord = relative.dot(axisY)
      proj.push({ u, v: vCoord })
    })

    // Находим min/max
    let minU = Infinity, maxU = -Infinity
    let minV = Infinity, maxV = -Infinity
    proj.forEach((p) => {
      if (p.u < minU) minU = p.u
      if (p.u > maxU) maxU = p.u
      if (p.v < minV) minV = p.v
      if (p.v > maxV) maxV = p.v
    })
    const rangeU = maxU - minU || 1
    const rangeV = maxV - minV || 1

    proj.forEach((p) => {
      const u = (p.u - minU) / rangeU
      const v = (p.v - minV) / rangeV
      uvs.push(u, v)
    })

    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  }

  /**
   * Создаёт канвас-текстуру, где на фоне яркого цвета накладывается "древесина"
   * и поверх печатается текст (гравировка).
   */
  private createEngravedTexture(
    woodTexture: THREE.Texture,
    text: string,
    faceColor: THREE.Color
  ): THREE.Texture {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext('2d')!

    // Заливаем фоном цветом грани (ярким)
    ctx.fillStyle = faceColor.getStyle()
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Если текстура дерева загружена
    if (woodTexture.image && (woodTexture.image as HTMLImageElement).complete) {
      ctx.globalCompositeOperation = 'multiply'
      ctx.drawImage(woodTexture.image as CanvasImageSource, 0, 0, canvas.width, canvas.height)
      ctx.globalCompositeOperation = 'source-over'
    }

    const maxWidth = canvas.width - 40
    const fontSize = 48
    ctx.font = `bold ${fontSize}px Arial`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)'
    ctx.shadowColor = 'rgba(255, 255, 255, 0.3)'
    ctx.shadowOffsetX = 1
    ctx.shadowOffsetY = 1
    ctx.shadowBlur = 2

    const lines = this.wrapText(ctx, text, maxWidth)
    const lineHeight = fontSize * 1.2
    const totalHeight = lines.length * lineHeight
    let y = canvas.height / 2 - totalHeight / 2 + lineHeight / 2

    for (const line of lines) {
      ctx.fillText(line, canvas.width / 2, y)
      y += lineHeight
    }

    const texture = new THREE.CanvasTexture(canvas)
    texture.needsUpdate = true
    return texture
  }

  /**
   * Помощник для переносов строк по длине (wrap text).
   */
  private wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    const words = text.split(' ')
    const lines: string[] = []
    let line = ''

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' '
      const metrics = ctx.measureText(testLine)
      if (metrics.width > maxWidth && n > 0) {
        lines.push(line.trim())
        line = words[n] + ' '
      } else {
        line = testLine
      }
    }
    lines.push(line.trim())
    return lines
  }

  private handleKeyPress(event: KeyboardEvent) {
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
      event.preventDefault()
      this.rotateTo(event.key)
    }
  }

  private rotateTo(direction: string) {
    if (this.isAnimating) return
    const STEP = Math.PI / 6
    const INERTIA = 0.01
    
    switch (direction) {
      case 'ArrowRight': this.rotationInertia.y += INERTIA; break
      case 'ArrowLeft':  this.rotationInertia.y -= INERTIA; break
      case 'ArrowUp':    this.rotationInertia.x -= INERTIA; break
      case 'ArrowDown':  this.rotationInertia.x += INERTIA; break
    }
  }

  private onDocumentClick(event: MouseEvent) {
    const rect = this.renderer.domElement.getBoundingClientRect()
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

    this.raycaster.setFromCamera(this.mouse, this.camera)
    const intersects = this.raycaster.intersectObjects(this.dodecahedronGroup.children, false)
    
    if (intersects.length > 0) {
      const clickedFaceIndex = this.dodecahedronGroup.children.indexOf(intersects[0].object)
      
      // Анимация качания
      const initialRotationX = this.dodecahedronGroup.rotation.x
      const swingAngle = 0.2

      const tweenSwing = new TWEEN.Tween(this.dodecahedronGroup.rotation)
        .to({ x: initialRotationX + swingAngle }, 200)
        .easing(TWEEN.Easing.Quadratic.Out)

      const tweenReturn = new TWEEN.Tween(this.dodecahedronGroup.rotation)
        .to({ x: initialRotationX }, 400)
        .easing(TWEEN.Easing.Bounce.Out)
        .onComplete(() => {
          // Обновляем карусель после анимации
          this.updateCarousel(clickedFaceIndex)
        })

      tweenSwing.chain(tweenReturn)
      tweenSwing.start()
    }
  }

  private updateCarousel(faceIndex: number) {
    const cards = document.querySelectorAll('.project-card')
    cards.forEach((card, index) => {
      if (index === faceIndex) {
        card.classList.add('active')
      } else {
        card.classList.remove('active')
      }
    })
  }

  private onWindowResize() {
    const container = this.renderer.domElement.parentElement
    if (!container) return
    
    const width = container.clientWidth
    const height = container.clientHeight
    
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(width, height)
  }

  private onMouseDown = (event: MouseEvent) => {
    this.isDragging = true
    this.lastMousePosition = {
      x: event.clientX,
      y: event.clientY
    }
  }

  private onMouseMove = (event: MouseEvent) => {
    if (!this.isDragging) return

    const deltaX = event.clientX - this.lastMousePosition.x
    const deltaY = event.clientY - this.lastMousePosition.y

    this.rotationInertia.y += deltaX * 0.0001
    this.rotationInertia.x += deltaY * 0.0001

    this.lastMousePosition = {
      x: event.clientX,
      y: event.clientY
    }
  }

  private onMouseUp = () => {
    this.isDragging = false
  }

  public animate = () => {
    requestAnimationFrame(this.animate)
    
    if (!this.isDragging) {
      this.elapsedTime += this.floatingSpeed
      
      // Существующая анимация парения
      const newY = this.initialY + Math.sin(this.elapsedTime) * this.floatingAmplitude
      this.dodecahedronGroup.position.y = newY
      
      // Автоматическое вращение (если не перетаскиваем)
      this.dodecahedronGroup.rotation.x += Math.sin(this.elapsedTime * 0.2) * 0.0006
      this.dodecahedronGroup.rotation.y += Math.cos(this.elapsedTime * 0.15) * 0.0006
      this.dodecahedronGroup.rotation.z += Math.sin(this.elapsedTime * 0.1) * 0.0004
    }
    
    // Применяем инерцию
    this.dodecahedronGroup.rotation.x += this.rotationInertia.x
    this.dodecahedronGroup.rotation.y += this.rotationInertia.y
    this.dodecahedronGroup.rotation.z += this.rotationInertia.z
    
    // Затухание инерции
    this.rotationInertia.x *= 0.98
    this.rotationInertia.y *= 0.98
    this.rotationInertia.z *= 0.98
    
    this.controls.update()
    TWEEN.update()
    this.renderer.render(this.scene, this.camera)
  }

  public getFaceInfo(index: number): string {
    return this.faceLinks[index].info
  }

  public getFaceLink(index: number): string {
    return this.faceLinks[index].link
  }

  public getFaceColor(index: number): string {
    return this.colors[index].getStyle()
  }
}

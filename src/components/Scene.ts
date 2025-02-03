import * as THREE from 'three'
import TWEEN from '@tweenjs/tween.js'

export class Scene {
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private renderer: THREE.WebGLRenderer
  private dodecahedronGroup: THREE.Group
  private raycaster: THREE.Raycaster = new THREE.Raycaster()
  private mouse: THREE.Vector2 = new THREE.Vector2()
  private isAnimating: boolean = false
  private initialY: number = 0
  private floatingAmplitude: number = 0.4
  private floatingSpeed: number = 0.0015
  private elapsedTime: number = 0
  private rotationInertia = { x: 0, y: 0, z: 0 }

  // Массив описаний для 12 граней (ссылки здесь не используются)
  private faceLinks: { link: string; info: string }[] = [
    { link: 'https://project1.example.com', info: 'Project 1: Инфографика и описание 1' },
    { link: 'https://project2.example.com', info: 'Project 2: Инфографика и описание 2' },
    { link: 'https://project3.example.com', info: 'Project 3: Инфографика и описание 3' },
    { link: 'https://project4.example.com', info: 'Project 4: Инфографика и описание 4' },
    { link: 'https://project5.example.com', info: 'Project 5: Инфографика и описание 5' },
    { link: 'https://project6.example.com', info: 'Project 6: Инфографика и описание 6' },
    { link: 'https://project7.example.com', info: 'Project 7: Инфографика и описание 7' },
    { link: 'https://project8.example.com', info: 'Project 8: Инфографика и описание 8' },
    { link: 'https://project9.example.com', info: 'Project 9: Инфографика и описание 9' },
    { link: 'https://project10.example.com', info: 'Project 10: Инфографика и описание 10' },
    { link: 'https://project11.example.com', info: 'Project 11: Инфографика и описание 11' },
    { link: 'https://project12.example.com', info: 'Project 12: Инфографика и описание 12' }
  ]

  constructor(container: HTMLElement) {
    // Сцена
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x1a1a1a)

    // Камера
    this.camera = new THREE.PerspectiveCamera(
      75, window.innerWidth / window.innerHeight, 0.1, 1000
    )
    this.camera.position.z = 7

    // Рендерер
    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setSize(window.innerWidth, window.innerHeight)
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

    this.animate()
  }

  /**
   * Разбивает додекаэдр на 12 граней (по 3 треугольника на грань).
   */
  private createDodecahedronFaces(woodTexture: THREE.Texture) {
    const geometry = new THREE.DodecahedronGeometry(2)
    const nonIndexedGeometry = geometry.toNonIndexed()

    const positionAttribute = nonIndexedGeometry.getAttribute('position')
    const positions = Array.from(positionAttribute.array)
    const totalTriangles = positions.length / 9
    const faceCount = 12

    if (totalTriangles !== faceCount * 3) {
      console.warn('Неожиданное число треугольников:', totalTriangles)
    }

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

      // Для каждой грани делаем уникальный цвет: hue = faceIndex / faceCount
      // s=1 (макс. насыщенность), l=0.6 (или варьируйте, как нравится)
      const hue = faceIndex / faceCount
      const faceColor = new THREE.Color().setHSL(hue, 1, 0.6)

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
      const initialRotationX = this.dodecahedronGroup.rotation.x
      const swingAngle = 0.2

      const tweenSwing = new TWEEN.Tween(this.dodecahedronGroup.rotation)
        .to({ x: initialRotationX + swingAngle }, 200)
        .easing(TWEEN.Easing.Quadratic.Out)

      const tweenReturn = new TWEEN.Tween(this.dodecahedronGroup.rotation)
        .to({ x: initialRotationX }, 400)
        .easing(TWEEN.Easing.Bounce.Out)

      tweenSwing.chain(tweenReturn)
      tweenSwing.start()
    }
  }

  private onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(window.innerWidth, window.innerHeight)
  }

  public animate = () => {
    requestAnimationFrame(this.animate)
    
    this.elapsedTime += this.floatingSpeed
    
    // Увеличенное парение вверх-вниз
    const newY = this.initialY + Math.sin(this.elapsedTime) * this.floatingAmplitude
    this.dodecahedronGroup.position.y = newY
    
    // Увеличенная в 4 раза скорость вращения
    this.dodecahedronGroup.rotation.x += Math.sin(this.elapsedTime * 0.2) * 0.0006
    this.dodecahedronGroup.rotation.y += Math.cos(this.elapsedTime * 0.15) * 0.0006
    this.dodecahedronGroup.rotation.z += Math.sin(this.elapsedTime * 0.1) * 0.0004
    
    // Добавляем инерцию
    this.dodecahedronGroup.rotation.x += this.rotationInertia.x
    this.dodecahedronGroup.rotation.y += this.rotationInertia.y
    this.dodecahedronGroup.rotation.z += this.rotationInertia.z
    
    // Затухание инерции
    this.rotationInertia.x *= 0.98
    this.rotationInertia.y *= 0.98
    this.rotationInertia.z *= 0.98
    
    TWEEN.update()
    this.renderer.render(this.scene, this.camera)
  }
}

const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')

const THUNDER_RATE = 0.0007
let TOTAL
let rains = []
let drops = []
let thunder
let mouse = { x: 0, y: 0, isActive: false }

// 빗방울 클래스
class Rain {
  constructor(x, y, velocity) {
    this.x = x
    this.y = y
    this.velocity = velocity
    this.alpha = 2
  }

  draw() {
    const { x, y, velocity, alpha } = this
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + (velocity.x) * alpha, y + (velocity.y) * alpha)
    ctx.strokeStyle = '#8899a6'
    ctx.lineWidth = 1.5
    ctx.stroke()
  }

  splash() {
    for (let i = 0; i < 3; i++) {
      drops.push(new Drop(this.x, this.velocity))
    }
  }

  animate() {
    if (this.y > innerHeight) {
      this.splash()
      this.x = -(innerWidth * 0.2) + Math.random() * (innerWidth * 1.4)
      this.y = -20
    }
    this.velocity.x = mouse.isActive ? -1 + Math.random() * 2 + (-innerWidth / 2 + mouse.x) / 150 : -1 + Math.random() * 2
    this.x += this.velocity.x
    this.y += this.velocity.y

    this.draw()
  }
}

// 스플래시 클래스
class Drop {
  constructor(x, velocity) {
    this.x = x
    this.y = innerHeight
    this.velocity = {
      x: velocity.x + -2 + Math.random() * 4,
      y: -velocity.y + 5 + Math.random() * 5
    }
    this.gravity = 1.5
  }

  draw() {
    ctx.beginPath()
    ctx.arc(this.x, this.y, 1.5, 0, Math.PI * 2, false)
    ctx.fillStyle = '#8899a6'
    ctx.fill()
  }

  animate() {
    this.velocity.y += this.gravity
    this.x += this.velocity.x
    this.y += this.velocity.y

    this.draw()
  }
}

// 천둥
class Thunder {
  constructor() {
    this.opacity = 0
  }

  draw() {
    const grid = ctx.createLinearGradient(0, 0, 0, innerHeight)
    grid.addColorStop(0, `rgba(66, 84, 99, ${this.opacity})`)
    grid.addColorStop(1, `rgba(18, 23, 27, ${this.opacity})`)
    ctx.fillStyle = grid
    ctx.fillRect(0, 0, innerWidth, innerHeight)
  }

  animate() {
    if (this.opacity === 0) return
    this.opacity -= 0.005
    this.draw()
  }
}

// 초기화 작업
function init() {
  canvas.width = innerWidth
  canvas.height = innerHeight

  TOTAL = Math.floor(innerWidth * innerHeight / 15000)
  rains = []
  drops = []
  thunder = new Thunder()

  for (let i = 0; i < TOTAL; i++) {
    const x = Math.random() * innerWidth
    const y = Math.random() * innerHeight
    const velocity = {
      y: 13 + Math.random() * 5
    }
    rains.push(new Rain(x, y, velocity))
  }
}

// 렌더 함수
function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  if (Math.random() < THUNDER_RATE) thunder.opacity = 1
  thunder.animate()
  rains.forEach(rain => rain.animate())
  drops.forEach((drop, index) => {
    drop.animate()
    if (drop.y > innerHeight) drops.splice(index, 1)
  })

  window.requestAnimationFrame(render)
}

// resize 이벤트
window.addEventListener('resize', () => init())

// mouse 이벤트
canvas.addEventListener('mouseenter', () => mouse.isActive = true)
canvas.addEventListener('mouseleave', () => mouse.isActive = false)
canvas.addEventListener('mousemove', e => {
  mouse.x = e.clientX
  mouse.y = e.clientY
})

// 날씨 api로 정보 데이터 가져오기
function getWeatherData() {
  const lat = 36.649864
  const lon = 127.430646
  const appKey = '0943233d97eefad5a3fd6d84b1abe417'
  const data = axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${appKey}`)
  return data
}

// 비오는 날만 캔버스에 그려주기
getWeatherData().then(result => {
  const currentWeather = result.data.weather[0].main
  console.log(currentWeather)
  const rainingStatus = ['Rain', 'Thunderstorm', 'Drizzle', 'Clear', 'Clouds']
  if (rainingStatus.includes(currentWeather)) {
    init()
    render()
  }
})
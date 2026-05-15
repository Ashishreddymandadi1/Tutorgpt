import { useEffect, useRef } from 'react'

interface Node {
  x: number; y: number
  vx: number; vy: number
  radius: number
  pulse: number; pulseSpeed: number
  color: string; glowColor: string
  type: 'star' | 'node' | 'bright'
}

interface ShootingStar {
  x: number; y: number
  vx: number; vy: number
  len: number; alpha: number
  active: boolean
}

const PALETTES = [
  { color: '100, 200, 255', glow: '80, 180, 255' },   // electric blue
  { color: '160, 120, 255', glow: '140, 100, 255' },   // purple
  { color: '80, 220, 200',  glow: '60, 200, 180' },    // teal-cyan
  { color: '220, 180, 255', glow: '200, 160, 255' },   // violet-white
  { color: '255, 255, 255', glow: '200, 220, 255' },   // white star
]

export default function NeuralBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let nodes: Node[] = []
    let shooters: ShootingStar[] = []
    let frameCount = 0

    const NODE_COUNT   = 130
    const BRIGHT_COUNT = 25   // extra bright "star" nodes
    const MAX_DIST     = 180

    function resize() {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }

    function initNodes() {
      nodes = []
      // Regular network nodes
      for (let i = 0; i < NODE_COUNT; i++) {
        const p = PALETTES[Math.floor(Math.random() * PALETTES.length)]
        nodes.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          radius: Math.random() * 1.4 + 0.5,
          pulse: Math.random() * Math.PI * 2,
          pulseSpeed: 0.008 + Math.random() * 0.012,
          color: p.color,
          glowColor: p.glow,
          type: 'node',
        })
      }
      // Bright "star" nodes — larger, more prominent
      for (let i = 0; i < BRIGHT_COUNT; i++) {
        const p = PALETTES[Math.floor(Math.random() * 2)] // blue or purple only
        nodes.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.15,
          radius: Math.random() * 2.5 + 1.5,
          pulse: Math.random() * Math.PI * 2,
          pulseSpeed: 0.005 + Math.random() * 0.008,
          color: p.color,
          glowColor: p.glow,
          type: 'bright',
        })
      }

      // Static tiny background stars
      for (let i = 0; i < 80; i++) {
        nodes.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: 0, vy: 0,
          radius: Math.random() * 0.8 + 0.2,
          pulse: Math.random() * Math.PI * 2,
          pulseSpeed: 0.015 + Math.random() * 0.02,
          color: '220, 240, 255',
          glowColor: '180, 210, 255',
          type: 'star',
        })
      }

      shooters = Array.from({ length: 3 }, () => makeShooter(true))
    }

    function makeShooter(random = false): ShootingStar {
      const angle = -0.3 - Math.random() * 0.4
      const speed = 8 + Math.random() * 6
      return {
        x: random ? Math.random() * canvas.width : -50 + Math.random() * canvas.width,
        y: random ? Math.random() * canvas.height * 0.5 : -20,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        len: 80 + Math.random() * 120,
        alpha: 0,
        active: false,
      }
    }

    function drawNebulaGlow() {
      // Faint nebula cloud in the background
      const cx = canvas.width * 0.6
      const cy = canvas.height * 0.3
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, canvas.width * 0.45)
      grad.addColorStop(0,   'rgba(80, 40, 160, 0.06)')
      grad.addColorStop(0.5, 'rgba(40, 80, 160, 0.04)')
      grad.addColorStop(1,   'rgba(0, 0, 0, 0)')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const grad2 = ctx.createRadialGradient(
        canvas.width * 0.2, canvas.height * 0.7, 0,
        canvas.width * 0.2, canvas.height * 0.7, canvas.width * 0.35
      )
      grad2.addColorStop(0,   'rgba(40, 120, 160, 0.05)')
      grad2.addColorStop(1,   'rgba(0, 0, 0, 0)')
      ctx.fillStyle = grad2
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    function draw() {
      frameCount++
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      drawNebulaGlow()

      // Update + draw nodes
      for (const n of nodes) {
        n.pulse += n.pulseSpeed
        if (n.type !== 'star') {
          n.x += n.vx; n.y += n.vy
          if (n.x < -20) n.x = canvas.width + 20
          if (n.x > canvas.width + 20) n.x = -20
          if (n.y < -20) n.y = canvas.height + 20
          if (n.y > canvas.height + 20) n.y = -20
        }
      }

      // Draw edges between network nodes only
      const networkNodes = nodes.filter(n => n.type !== 'star')
      for (let i = 0; i < networkNodes.length; i++) {
        for (let j = i + 1; j < networkNodes.length; j++) {
          const a = networkNodes[i], b = networkNodes[j]
          const dx = a.x - b.x, dy = a.y - b.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < MAX_DIST) {
            const fade = 1 - dist / MAX_DIST
            const alpha = fade * fade * 0.18
            // Blend the two node colors
            ctx.beginPath()
            const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y)
            grad.addColorStop(0, `rgba(${a.color}, ${alpha})`)
            grad.addColorStop(1, `rgba(${b.color}, ${alpha})`)
            ctx.strokeStyle = grad
            ctx.lineWidth = fade * 0.8
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        }
      }

      // Draw nodes
      for (const n of nodes) {
        const glow = 0.5 + 0.5 * Math.sin(n.pulse)

        if (n.type === 'star') {
          const alpha = 0.2 + 0.5 * glow
          ctx.beginPath()
          ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${n.color}, ${alpha})`
          ctx.fill()
          continue
        }

        const r     = n.radius + glow * (n.type === 'bright' ? 2 : 1)
        const alpha = n.type === 'bright' ? 0.5 + 0.4 * glow : 0.3 + 0.45 * glow

        // Outer glow ring
        const glowR = r * (n.type === 'bright' ? 8 : 5)
        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, glowR)
        g.addColorStop(0,   `rgba(${n.glowColor}, ${alpha * 0.5})`)
        g.addColorStop(0.4, `rgba(${n.glowColor}, ${alpha * 0.15})`)
        g.addColorStop(1,   `rgba(${n.glowColor}, 0)`)
        ctx.beginPath()
        ctx.arc(n.x, n.y, glowR, 0, Math.PI * 2)
        ctx.fillStyle = g
        ctx.fill()

        // Core
        ctx.beginPath()
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${n.color}, ${alpha})`
        ctx.fill()
      }

      // Shooting stars
      for (const s of shooters) {
        if (!s.active) {
          if (Math.random() < 0.002) { s.active = true; s.alpha = 0 }
          continue
        }
        s.x += s.vx; s.y += s.vy
        s.alpha = Math.min(s.alpha + 0.08, 1)

        const tailX = s.x - s.vx * (s.len / Math.hypot(s.vx, s.vy))
        const tailY = s.y - s.vy * (s.len / Math.hypot(s.vx, s.vy))

        const sg = ctx.createLinearGradient(tailX, tailY, s.x, s.y)
        sg.addColorStop(0, `rgba(180, 220, 255, 0)`)
        sg.addColorStop(1, `rgba(220, 240, 255, ${s.alpha * 0.8})`)
        ctx.beginPath()
        ctx.strokeStyle = sg
        ctx.lineWidth = 1.5
        ctx.moveTo(tailX, tailY)
        ctx.lineTo(s.x, s.y)
        ctx.stroke()

        if (s.x > canvas.width + 100 || s.y > canvas.height + 100) {
          Object.assign(s, makeShooter(false))
          s.active = false
        }
      }

      animId = requestAnimationFrame(draw)
    }

    resize()
    initNodes()
    draw()

    const observer = new ResizeObserver(() => { resize(); initNodes() })
    observer.observe(canvas)

    return () => { cancelAnimationFrame(animId); observer.disconnect() }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ pointerEvents: 'none' }}
    />
  )
}

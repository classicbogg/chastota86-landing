<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref } from 'vue'
import gsap from 'gsap'
import { useNightClock } from '../composables/useNightClock'

const CLEAR = 'Задняя, диск горячий, дальше не тянет.'
const STATIC = 'з·дн я  д··к г·рч··  дльш· н· тн·т'

const trucks = [
  { id: 'cargo', label: 'грузовая' },
  { id: 'house', label: 'жильё' },
  { id: 'clinic', label: 'лазарет' },
  { id: 'tank', label: 'цистерна' },
]

const { text: clock } = useNightClock()
const root = ref<HTMLElement | null>(null)
const stage = ref<HTMLElement | null>(null)
const wave = ref<HTMLCanvasElement | null>(null)
const voiceEl = ref<HTMLElement | null>(null)

let dead = false
let raf = 0
let master: gsap.core.Timeline | null = null
let observer: IntersectionObserver | null = null
const waveState = { live: 0.55 }
let waveHue: 'dust' | 'crt' = 'dust'
const scramble = { t: 1 }

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

const paintWave = (c: CanvasRenderingContext2D, w: number, h: number, t: number) => {
  c.clearRect(0, 0, w, h)
  const live = waveState.live
  c.strokeStyle = waveHue === 'crt' ? '#7cffb2' : '#c4a574'
  c.globalAlpha = 0.6 + live * 0.4
  c.lineWidth = 1.45
  c.beginPath()
  const mid = h * 0.52
  for (let x = 0; x < w; x++) {
    const n = x / w
    const amp = live * h * 0.4
    const noise = waveHue === 'dust' ? Math.sin(n * 120 + t * 0.05) * amp * 0.32 : 0
    const y =
      mid +
      Math.sin(n * 14 + t * (0.006 + live * 0.01)) * amp * 0.55 +
      Math.sin(n * 37 + t * 0.012) * amp * 0.22 +
      noise +
      (Math.sin(n * 88 + t * 0.045) > 0.9 ? amp * 0.26 : 0)
    if (x === 0) c.moveTo(x, y)
    else c.lineTo(x, y)
  }
  c.stroke()
  c.globalAlpha = 1
}

const startWave = () => {
  const el = wave.value
  if (!el) return
  const c = el.getContext('2d')
  if (!c) return
  const loop = (t: number) => {
    if (dead) return
    const dpr = window.devicePixelRatio || 1
    const w = el.clientWidth
    const h = el.clientHeight
    if (w > 0 && h > 0 && (el.width !== w * dpr || el.height !== h * dpr)) {
      el.width = w * dpr
      el.height = h * dpr
      c.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    if (w > 0 && h > 0) paintWave(c, w, h, t)
    raf = requestAnimationFrame(loop)
  }
  raf = requestAnimationFrame(loop)
}

const mixGlyph = (from: string, to: string, p: number) => {
  const len = Math.max(from.length, to.length)
  let out = ''
  for (let i = 0; i < len; i++) {
    const a = from[i] ?? ' '
    const b = to[i] ?? ' '
    if (a === b) {
      out += b
      continue
    }
    if (Math.random() > p) out += b
    else if (Math.random() > 0.45) out += '·'
    else out += a
  }
  return out
}

const renderVoice = () => {
  if (!voiceEl.value) return
  voiceEl.value.textContent = mixGlyph(STATIC, CLEAR, scramble.t)
}

const q = <T extends Element>(sel: string, base: HTMLElement | null = stage.value) =>
  base?.querySelector(sel) as T | null
const qa = <T extends Element>(sel: string) =>
  stage.value ? (gsap.utils.toArray(sel, stage.value) as T[]) : []

const chipDelta = () => {
  const chip = q<HTMLElement>('.chip')
  const pick = q<HTMLElement>('.plate--fix')
  if (!chip || !pick) return { x: 0, y: -120 }
  const a = pick.getBoundingClientRect()
  const b = chip.getBoundingClientRect()
  return {
    x: a.left + a.width * 0.2 - (b.left - gsap.getProperty(chip, 'x') as number),
    y: a.top + a.height * 0.55 - (b.top + b.height * 0.5 - (gsap.getProperty(chip, 'y') as number)),
  }
}

const buildShow = () => {
  master?.kill()
  master = null

  const lever = q<HTMLElement>('.toggle__knob')
  const lampCrew = q<HTMLElement>('.lamp--crew')
  const lampGround = q<HTMLElement>('.lamp--ground')
  const bandTag = q<HTMLElement>('.band-tag')
  const seals = qa<HTMLElement>('.seal')
  const plates = qa<HTMLElement>('.plate')
  const etch = qa<HTMLElement>('.plate__etch')
  const chip = q<HTMLElement>('.chip')
  const pick = q<HTMLElement>('.plate--fix')
  const others = plates.filter((p) => p !== pick)
  const result = q<HTMLElement>('.result')
  const scan = q<HTMLElement>('.scan')
  const dust = q<HTMLElement>('.map-dust')
  const pin = q<HTMLElement>('.convoy')
  const meetMark = q<HTMLElement>('.meet-mark')
  const freeze = q<HTMLElement>('.freeze', root.value)

  if (!lever || !chip || !pick || !result || !scan || !dust || !pin || !meetMark) return
  if (!lampCrew || !lampGround || !bandTag || !freeze || seals.length < 3) return

  gsap.set(seals, { yPercent: 0, opacity: 1 })
  gsap.set(etch, { opacity: 0, y: 6 })
  gsap.set(plates, {
    opacity: 1,
    filter: 'brightness(0.78)',
    borderColor: 'rgba(138,143,138,0.38)',
    backgroundColor: 'rgba(26,22,18,0.82)',
  })
  gsap.set(chip, { x: 0, y: 0, opacity: 1, scale: 1 })
  gsap.set(result, { opacity: 0, y: 8 })
  gsap.set(scan, { yPercent: -120, opacity: 0 })
  gsap.set(dust, { scaleX: 0.28, opacity: 0.7 })
  gsap.set(pin, { scale: 1 })
  gsap.set(meetMark, { opacity: 0, scale: 0.6 })
  gsap.set(freeze, { opacity: 0 })
  gsap.set(lever, { x: 30 })
  gsap.set(lampGround, { opacity: 1 })
  gsap.set(lampCrew, { opacity: 0.22 })
  bandTag.textContent = 'земля'
  scramble.t = 1
  waveState.live = 0.52
  waveHue = 'dust'
  renderVoice()

  const tl = gsap.timeline({
    defaults: { ease: 'power2.inOut' },
    repeat: -1,
    repeatDelay: 0.9,
  })

  tl.to(dust, { scaleX: 0.48, duration: 1.2, ease: 'sine.inOut' }, 0)
    .to(pin, { scale: 1.08, duration: 0.55, yoyo: true, repeat: 1, ease: 'sine.inOut' }, 0.2)
    .to(meetMark, { opacity: 0.9, scale: 1, duration: 0.45 }, 0.55)
    .to({}, { duration: 0.35 })

    .addLabel('flip')
    .to(lever, { x: 0, duration: 0.34, ease: 'back.out(1.7)' })
    .to(lampGround, { opacity: 0.2, duration: 0.22 }, 'flip')
    .to(lampCrew, { opacity: 1, duration: 0.28 }, 'flip+=0.04')
    .add(() => {
      bandTag.textContent = 'свои'
      waveHue = 'crt'
    }, 'flip+=0.06')
    .to(waveState, { live: 0.88, duration: 0.5 }, 'flip')
    .fromTo(
      scan,
      { yPercent: -120, opacity: 0.5 },
      { yPercent: 140, opacity: 0, duration: 0.5, ease: 'none' },
      'flip+=0.08',
    )
    .to(scramble, { t: 0, duration: 1.2, ease: 'power1.inOut', onUpdate: renderVoice }, 'flip+=0.15')
    .to(freeze, { opacity: 1, duration: 0.3 }, 'flip+=0.3')

    .addLabel('open')
    .to(plates, { filter: 'brightness(1)', duration: 0.35, stagger: 0.06 }, 'open')
    .to(
      seals,
      { yPercent: -115, opacity: 0, duration: 0.5, stagger: 0.1, ease: 'power3.in' },
      'open+=0.08',
    )
    .to(etch, { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, ease: 'power2.out' }, 'open+=0.22')
    .add(() => {
      const to = chipDelta()
      gsap.to(chip, { x: to.x, y: to.y, scale: 0.9, duration: 0.85, ease: 'power2.inOut' })
    }, 'open+=0.85')
    .to({}, { duration: 0.85 }, 'open+=0.85')
    .to(
      pick,
      {
        borderColor: 'rgba(124,255,178,0.8)',
        backgroundColor: 'rgba(124,255,178,0.08)',
        duration: 0.32,
      },
      'open+=1.7',
    )
    .to(others, { opacity: 0.38, duration: 0.35 }, 'open+=1.7')
    .to(result, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }, 'open+=1.85')
    .to(dust, { scaleX: 0.72, duration: 1.35, ease: 'sine.in' }, 'open+=1.9')
    .to(waveState, { live: 0.36, duration: 1.1 }, 'open+=1.95')
    .to({}, { duration: 1.9 })

    .addLabel('reset')
    .to([result, freeze, meetMark], { opacity: 0, duration: 0.4 }, 'reset')
    .to(etch, { opacity: 0, y: 6, duration: 0.3 }, 'reset')
    .to(seals, { yPercent: 0, opacity: 1, duration: 0.42, stagger: 0.05 }, 'reset+=0.08')
    .to(
      plates,
      {
        opacity: 1,
        filter: 'brightness(0.78)',
        borderColor: 'rgba(138,143,138,0.38)',
        backgroundColor: 'rgba(26,22,18,0.82)',
        duration: 0.35,
      },
      'reset+=0.12',
    )
    .to(chip, { x: 0, y: 0, scale: 1, duration: 0.45 }, 'reset+=0.15')
    .to(lever, { x: 30, duration: 0.36 }, 'reset+=0.18')
    .to(lampCrew, { opacity: 0.22, duration: 0.25 }, 'reset+=0.18')
    .to(lampGround, { opacity: 1, duration: 0.25 }, 'reset+=0.22')
    .add(() => {
      bandTag.textContent = 'земля'
      waveHue = 'dust'
    }, 'reset+=0.22')
    .to(scramble, { t: 1, duration: 0.65, onUpdate: renderVoice }, 'reset+=0.25')
    .to(dust, { scaleX: 0.28, duration: 0.75 }, 'reset+=0.25')
    .to(waveState, { live: 0.52, duration: 0.65 }, 'reset+=0.25')

  master = tl
}

const showStatic = async () => {
  await nextTick()
  if (!stage.value) return
  scramble.t = 0
  waveState.live = 0.45
  waveHue = 'crt'
  renderVoice()
  const bandTag = q<HTMLElement>('.band-tag')
  if (bandTag) bandTag.textContent = 'свои'
  const lever = q<HTMLElement>('.toggle__knob')
  const lampCrew = q<HTMLElement>('.lamp--crew')
  const lampGround = q<HTMLElement>('.lamp--ground')
  const freeze = q<HTMLElement>('.freeze', root.value)
  if (lever) gsap.set(lever, { x: 0 })
  if (lampCrew) gsap.set(lampCrew, { opacity: 1 })
  if (lampGround) gsap.set(lampGround, { opacity: 0.2 })
  gsap.set(qa('.seal'), { opacity: 0, yPercent: -110 })
  gsap.set(qa('.plate__etch'), { opacity: 1, y: 0 })
  const pick = q<HTMLElement>('.plate--fix')
  if (pick) {
    gsap.set(pick, {
      borderColor: 'rgba(124,255,178,0.8)',
      backgroundColor: 'rgba(124,255,178,0.08)',
    })
  }
  const result = q<HTMLElement>('.result')
  if (result) gsap.set(result, { opacity: 1, y: 0 })
  if (freeze) gsap.set(freeze, { opacity: 1 })
  const meetMark = q<HTMLElement>('.meet-mark')
  if (meetMark) gsap.set(meetMark, { opacity: 0.9, scale: 1 })
}

onMounted(async () => {
  await nextTick()
  startWave()
  if (reduceMotion()) {
    await showStatic()
    return
  }
  buildShow()
  observer = new IntersectionObserver(
    ([entry]) => {
      if (!master) return
      if (entry?.isIntersecting) master.play()
      else master.pause()
    },
    { threshold: 0.18 },
  )
  if (root.value) observer.observe(root.value)
})

onUnmounted(() => {
  dead = true
  cancelAnimationFrame(raf)
  observer?.disconnect()
  master?.kill()
  master = null
})
</script>

<template>
  <section id="efir" class="ether" ref="root" aria-labelledby="efir-title">
    <div class="inner">
      <header class="head">
        <h2 id="efir-title">эфир</h2>
        <div class="head__meta">
          <span class="freeze" aria-hidden="true">встреча</span>
          <time :datetime="clock">{{ clock }}</time>
        </div>
      </header>

      <p class="lead">
        Ты за рамой. В одном ухе свои, в другом - земля. Три плашки, и ночь не ждёт.
      </p>

      <div class="desk" ref="stage" aria-hidden="true">
        <div class="panel map">
          <div class="bevel" />
          <div class="map-clock">{{ clock }}</div>
          <div class="map-dust" />
          <svg class="schema" viewBox="0 0 360 220" fill="none" aria-hidden="true">
            <path
              class="road"
              d="M34 168 C78 150 110 120 148 112 C196 100 230 128 268 118 C300 110 322 86 338 62"
            />
            <path class="road road--dim" d="M148 112 C168 78 190 58 226 46" />
            <circle class="node" cx="42" cy="170" r="7" />
            <circle class="node" cx="148" cy="112" r="6" />
            <circle class="node node--live" cx="268" cy="118" r="7" />
            <circle class="node" cx="226" cy="46" r="5" />
            <circle class="node node--home" cx="338" cy="62" r="8" />
            <text x="18" y="198" class="label">карьер</text>
            <text x="118" y="96" class="label">пустырь</text>
            <text x="248" y="148" class="label">решётка</text>
            <text x="302" y="52" class="label">14</text>
          </svg>
          <div class="convoy" style="left: 38%; top: 46%">
            <i />
          </div>
          <div class="meet-mark" style="left: 71%; top: 48%" />
        </div>

        <div class="panel radio">
          <div class="bevel" />
          <div class="radio__top">
            <div class="well">
              <div class="toggle" aria-hidden="true">
                <span class="toggle__end">А</span>
                <i class="toggle__knob" />
                <span class="toggle__end">Б</span>
              </div>
              <div class="lamps">
                <span class="lamp lamp--crew" />
                <span class="lamp-cap">свои</span>
                <span class="lamp lamp--ground" />
                <span class="lamp-cap">земля</span>
              </div>
              <b class="band-tag">земля</b>
            </div>
            <div class="scope">
              <canvas ref="wave" class="scope__wave" />
              <div class="scan" />
            </div>
          </div>

          <div class="log">
            <p class="log__meta">эфир</p>
            <p class="log__voice" ref="voiceEl" />
          </div>

          <div class="plates">
            <div class="plate plate--fix">
              <span class="seal" />
              <span class="plate__etch">Чиним колесо</span>
            </div>
            <div class="plate">
              <span class="seal" />
              <span class="plate__etch">Тише ход</span>
            </div>
            <div class="plate plate--go">
              <span class="seal" />
              <span class="plate__etch">Едем</span>
            </div>
          </div>

          <p class="result">Механик с ленты. Стоите, пока диск не остынет.</p>
        </div>

        <div class="panel strip">
          <div class="bevel" />
          <div class="strip__trucks">
            <div v-for="truck in trucks" :key="truck.id" class="cart" :data-kind="truck.id">
              <span class="cart__face" />
              <span class="cart__well" />
              <b>{{ truck.label }}</b>
            </div>
          </div>
          <div class="shelf">
            <span class="chip">чинит</span>
            <span class="slot" />
            <span class="slot" />
          </div>
        </div>
      </div>

      <p class="sr">
        На столе диспетчера сама разыгрывается короткая ночная встреча: рычаг переключается на своих,
        голос проясняется, открываются три плашки, на починку уходит механик.
      </p>
    </div>
  </section>
</template>

<style scoped lang="scss">
.ether {
  position: relative;
  z-index: 1;
  padding: clamp(2.6rem, 6vw, 4.4rem) 0 clamp(3rem, 7vw, 5rem);
  background:
    radial-gradient(90% 70% at 8% 0%, rgb(196 165 116 / 0.1), transparent 55%),
    #0c0e0c;
}

.inner {
  width: var(--page);
  max-width: 100%;
  margin: 0 auto;
  padding: 0 clamp(1.1rem, 4vw, 2.4rem);
}

.head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 1rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid rgb(138 143 138 / 0.28);
  padding-bottom: 0.85rem;
}

h2 {
  margin: 0;
  font-family: var(--title);
  font-size: clamp(1.25rem, 2.8vw, 1.9rem);
  font-weight: 600;
  line-height: 1;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--paper);
}

.head__meta {
  display: flex;
  align-items: baseline;
  gap: 0.85rem;
}

.freeze {
  color: var(--crt);
  font-size: 0.68rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  opacity: 0;
}

.head time {
  color: var(--paper-dim);
  font-size: 0.72rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  font-variant-numeric: tabular-nums;
}

.lead {
  margin: 0 0 1.5rem;
  max-width: 36rem;
  font-family: var(--hero-voice);
  font-size: clamp(1.05rem, 2vw, 1.25rem);
  line-height: 1.45;
  color: var(--paper);
}

.desk {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(0, 0.95fr);
  grid-template-rows: auto auto;
  gap: 0.7rem;
}

.map {
  grid-column: 1;
  grid-row: 1;
  min-height: 18rem;
}

.radio {
  grid-column: 2;
  grid-row: 1;
}

.strip {
  grid-column: 1 / -1;
  grid-row: 2;
}

.panel {
  position: relative;
  overflow: hidden;
  border: 1px solid rgb(138 143 138 / 0.42);
  background:
    linear-gradient(165deg, rgb(58 52 44 / 0.55) 0%, transparent 34%),
    linear-gradient(180deg, #2a241c 0%, #1a1612 55%, #12100d 100%);
  box-shadow:
    inset 0 1px 0 rgb(232 224 212 / 0.12),
    inset 0 -1px 0 rgb(0 0 0 / 0.35);
}

.bevel {
  pointer-events: none;
  position: absolute;
  inset: 0;
  box-shadow:
    inset 0 0 0 1px rgb(0 0 0 / 0.28),
    inset 0 0 28px rgb(0 0 0 / 0.22);
  background:
    radial-gradient(120% 80% at 0% 0%, rgb(196 165 116 / 0.07), transparent 42%),
    radial-gradient(80% 60% at 100% 100%, rgb(0 0 0 / 0.28), transparent 50%);
  z-index: 0;
}

.map-clock {
  position: absolute;
  top: 0.7rem;
  right: 0.7rem;
  z-index: 2;
  padding: 0.28rem 0.55rem;
  border: 1px solid rgb(138 143 138 / 0.45);
  background: linear-gradient(180deg, #3a342c, #221e18);
  color: var(--crt);
  font-family: var(--ui);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  font-variant-numeric: tabular-nums;
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.08),
    0 1px 0 rgb(0 0 0 / 0.35);
}

.map-dust {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 100%;
  transform-origin: left center;
  background: linear-gradient(90deg, rgb(138 112 72 / 0.45), rgb(138 112 72 / 0.1) 40%, transparent 68%);
  clip-path: polygon(0 0, 72% 0, 100% 14%, 68% 32%, 94% 52%, 60% 74%, 86% 100%, 0 100%);
  z-index: 1;
  opacity: 0.7;
}

.schema {
  position: relative;
  z-index: 2;
  display: block;
  width: 100%;
  height: 100%;
  min-height: 18rem;
  padding: 1.2rem 1rem 0.8rem;
}

.road {
  stroke: rgb(196 165 116 / 0.55);
  stroke-width: 3;
  stroke-linecap: round;
}

.road--dim {
  stroke: rgb(138 143 138 / 0.35);
  stroke-width: 2;
}

.node {
  fill: #1a1612;
  stroke: var(--dust);
  stroke-width: 2;
}

.node--live {
  stroke: var(--amber);
}

.node--home {
  stroke: var(--crt);
  fill: rgb(124 255 178 / 0.12);
}

.label {
  fill: rgb(184 176 164 / 0.72);
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.convoy {
  position: absolute;
  z-index: 3;
  width: 1.5rem;
  height: 1.5rem;
  transform: translate(-50%, -50%);
}

.convoy i {
  display: block;
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg, #c4a06a, #7a6238);
  border: 1px solid rgb(26 22 18 / 0.7);
  box-shadow: 0 0 0 2px rgb(232 162 58 / 0.25);
  clip-path: polygon(12% 28%, 78% 18%, 92% 48%, 80% 78%, 18% 72%, 8% 48%);
}

.meet-mark {
  position: absolute;
  z-index: 3;
  width: 1.1rem;
  height: 1.1rem;
  border: 2px solid var(--amber);
  transform: translate(-50%, -50%) rotate(45deg);
  opacity: 0;
  box-shadow: 0 0 12px rgb(232 162 58 / 0.35);
}

.radio {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  padding: 0.75rem 0.7rem 0.8rem;
  min-height: 18rem;
}

.radio__top,
.log,
.plates,
.result {
  position: relative;
  z-index: 1;
}

.radio__top {
  display: grid;
  gap: 0.55rem;
}

.well {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 0.55rem;
  align-items: center;
  padding: 0.45rem 0.5rem;
  border: 1px solid rgb(138 143 138 / 0.35);
  background: rgb(0 0 0 / 0.35);
  box-shadow: inset 0 2px 6px rgb(0 0 0 / 0.45);
}

.toggle {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 4.2rem;
  height: 1.2rem;
  padding: 0 0.2rem;
  border: 1px solid rgb(138 143 138 / 0.5);
  background: #0a0b0a;
}

.toggle__end {
  position: relative;
  z-index: 1;
  font-size: 0.58rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: rgb(184 176 164 / 0.55);
}

.toggle__knob {
  position: absolute;
  top: 50%;
  left: 0.2rem;
  width: 1.2rem;
  height: 1.2rem;
  margin-top: -0.6rem;
  z-index: 2;
  background: linear-gradient(180deg, #d2ccc0, #7d776c);
  border: 1px solid rgb(26 22 18 / 0.55);
  box-shadow: 0 1px 0 rgb(255 255 255 / 0.18);
}

.lamps {
  display: grid;
  grid-template-columns: auto auto;
  grid-template-rows: auto auto;
  gap: 0.15rem 0.35rem;
  align-items: center;
}

.lamp {
  width: 0.72rem;
  height: 0.72rem;
  border: 1px solid rgb(138 143 138 / 0.4);
  background: #111;
  box-shadow: inset 0 1px 2px rgb(0 0 0 / 0.6);
}

.lamp--crew {
  background: var(--crt);
  box-shadow: 0 0 10px rgb(124 255 178 / 0.4);
}

.lamp--ground {
  background: var(--amber);
  box-shadow: 0 0 10px rgb(232 162 58 / 0.35);
}

.lamp-cap {
  font-size: 0.58rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--paper-dim);
}

.band-tag {
  font-family: var(--ui);
  font-size: 0.64rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--paper-dim);
}

.scope {
  position: relative;
  height: 3.4rem;
  border: 1px solid rgb(138 143 138 / 0.35);
  background: #050705;
  overflow: hidden;
  box-shadow: inset 0 0 0 1px rgb(0 0 0 / 0.4);
}

.scope__wave {
  display: block;
  width: 100%;
  height: 100%;
}

.scan {
  position: absolute;
  left: 0;
  right: 0;
  height: 30%;
  background: linear-gradient(180deg, transparent, rgb(124 255 178 / 0.2), transparent);
}

.log {
  flex: 1;
  min-height: 4.6rem;
  padding: 0.65rem 0.7rem 0.75rem;
  border: 1px solid rgb(138 143 138 / 0.32);
  background: rgb(4 7 5 / 0.78);
  box-shadow: inset 0 0 18px rgb(0 0 0 / 0.35);
}

.log__meta {
  margin: 0 0 0.35rem;
  color: var(--paper-dim);
  font-size: 0.62rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.log__voice {
  margin: 0;
  min-height: 2.4em;
  font-family: var(--hero-voice);
  font-size: clamp(1rem, 1.8vw, 1.2rem);
  line-height: 1.35;
  color: var(--paper);
}

.plates {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.4rem;
}

.plate {
  position: relative;
  overflow: hidden;
  min-height: 2.65rem;
  padding: 0.55rem 0.55rem;
  border: 1px solid rgb(138 143 138 / 0.38);
  background: rgb(26 22 18 / 0.82);
  box-shadow:
    inset 0 1px 0 rgb(232 224 212 / 0.08),
    inset 0 -1px 0 rgb(0 0 0 / 0.35);
  display: flex;
  align-items: center;
}

.plate--go {
  border-color: rgb(232 162 58 / 0.42);
}

.seal {
  position: absolute;
  inset: 0;
  z-index: 2;
  background:
    linear-gradient(180deg, rgb(74 68 58 / 0.98) 0%, rgb(42 38 32 / 0.98) 45%, rgb(28 26 22 / 0.98) 100%);
  border: 1px solid rgb(138 143 138 / 0.35);
  box-shadow:
    inset 0 1px 0 rgb(232 224 212 / 0.1),
    inset 0 -2px 6px rgb(0 0 0 / 0.4);
}

.seal::before,
.seal::after {
  content: '';
  position: absolute;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: rgb(90 84 74);
  box-shadow: inset 0 1px 1px rgb(0 0 0 / 0.55);
}

.seal::before {
  top: 7px;
  left: 7px;
}

.seal::after {
  top: 7px;
  right: 7px;
}

.plate__etch {
  position: relative;
  z-index: 1;
  font-family: var(--ui);
  font-size: 0.78rem;
  font-weight: 700;
  line-height: 1.25;
  letter-spacing: 0.02em;
  color: var(--paper);
}

.result {
  margin: 0;
  min-height: 1.35em;
  font-family: var(--hero-voice);
  font-size: 0.95rem;
  line-height: 1.35;
  color: var(--paper);
}

.strip {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.7rem;
  align-items: stretch;
  padding: 0.7rem;
}

.strip__trucks {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.45rem;
}

.cart {
  position: relative;
  min-height: 4.4rem;
  padding: 0.45rem 0.4rem 0.5rem;
  border: 1px solid rgb(138 143 138 / 0.4);
  background: linear-gradient(180deg, #322c24, #1c1814);
  box-shadow: inset 0 1px 0 rgb(232 224 212 / 0.08);
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.cart__face {
  width: 1.35rem;
  height: 1.35rem;
  border: 1px solid rgb(196 165 116 / 0.45);
  background: rgb(196 160 106 / 0.35);
  border-radius: 50%;
}

.cart[data-kind='clinic'] .cart__face {
  background: rgb(122 154 122 / 0.4);
  border-color: rgb(122 154 122 / 0.55);
}

.cart[data-kind='tank'] .cart__face {
  background: rgb(106 138 170 / 0.4);
  border-color: rgb(106 138 170 / 0.55);
}

.cart[data-kind='cargo'] .cart__face {
  background: rgb(138 143 138 / 0.35);
}

.cart__well {
  position: absolute;
  top: 0.45rem;
  right: 0.4rem;
  width: 0.28rem;
  bottom: 0.5rem;
  background: rgb(0 0 0 / 0.45);
  border: 1px solid rgb(138 143 138 / 0.25);
}

.cart b {
  margin-top: auto;
  font-family: var(--ui);
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--paper-dim);
}

.shelf {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  min-width: 10rem;
  padding: 0.45rem;
  border: 1px solid rgb(138 143 138 / 0.4);
  background: rgb(0 0 0 / 0.28);
  box-shadow: inset 0 2px 8px rgb(0 0 0 / 0.4);
}

.chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 3.8rem;
  height: 2rem;
  padding: 0 0.55rem;
  border: 1px solid rgb(232 162 58 / 0.55);
  background: rgb(26 22 18 / 0.92);
  color: var(--amber);
  font-family: var(--ui);
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  z-index: 3;
}

.slot {
  width: 2rem;
  height: 2rem;
  border: 1px dashed rgb(138 143 138 / 0.35);
  background: rgb(0 0 0 / 0.2);
}

.sr {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (max-width: 900px) {
  .desk {
    grid-template-columns: 1fr;
  }

  .map,
  .radio,
  .strip {
    grid-column: 1;
    grid-row: auto;
  }

  .map {
    min-height: 15rem;
  }

  .schema {
    min-height: 15rem;
  }

  .strip {
    grid-template-columns: 1fr;
  }

  .shelf {
    min-width: 0;
  }
}

@media (max-width: 560px) {
  .strip__trucks {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .plates {
    grid-template-columns: 1fr;
  }
}
</style>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import gsap from 'gsap'

type Platform = 'steam' | 'itch' | 'any'

const callsign = ref('')
const email = ref('')
const platform = ref<Platform>('any')
const note = ref('')
const sent = ref(false)
const busy = ref(false)
const ticket = ref('')
const root = ref<HTMLElement | null>(null)
const formEl = ref<HTMLFormElement | null>(null)
const sheet = ref<HTMLElement | null>(null)
const wave = ref<HTMLCanvasElement | null>(null)
const statusEl = ref<HTMLElement | null>(null)

let observer: IntersectionObserver | null = null
let introPlayed = false
let raf = 0
let dead = false
const waveLive = { v: 0.12 }

const platforms: { id: Platform; label: string; hint: string }[] = [
  { id: 'steam', label: 'Steam', hint: 'когда выложим' },
  { id: 'itch', label: 'itch', hint: 'раньше демо' },
  { id: 'any', label: 'всё равно', hint: 'главное ночь' },
]

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
const storageKey = 'ch86-preorder'

const statusLine = computed(() => {
  if (busy.value) return 'передаём в эфир…'
  if (sent.value) return 'принят · ждём ночь'
  return 'открыт · без оплаты'
})

const paintWave = (c: CanvasRenderingContext2D, w: number, h: number, t: number) => {
  c.clearRect(0, 0, w, h)
  const live = waveLive.v
  c.strokeStyle = '#7cffb2'
  c.globalAlpha = 0.45 + live * 0.5
  c.lineWidth = 1.4
  c.beginPath()
  const mid = h * 0.52
  for (let x = 0; x < w; x++) {
    const n = x / w
    const amp = live * h * 0.4
    const y =
      mid +
      Math.sin(n * 16 + t * (0.007 + live * 0.012)) * amp * 0.55 +
      Math.sin(n * 39 + t * 0.014) * amp * 0.22 +
      (Math.sin(n * 90 + t * 0.05) > 0.9 ? amp * 0.25 : 0)
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

const makeTicket = () => {
  const n = Math.floor(1000 + Math.random() * 9000)
  return `Ч86-${n}`
}

watch(busy, (v) => {
  gsap.to(waveLive, { v: v ? 0.9 : sent.value ? 0.28 : 0.14, duration: 0.55, ease: 'power2.out' })
})

watch(sent, (v) => {
  if (v) gsap.to(waveLive, { v: 0.28, duration: 0.6 })
})

onMounted(() => {
  try {
    const raw = localStorage.getItem(storageKey)
    if (raw) {
      const data = JSON.parse(raw) as { email?: string; callsign?: string; platform?: Platform; ticket?: string }
      sent.value = true
      email.value = data.email ?? ''
      callsign.value = data.callsign ?? ''
      platform.value = data.platform ?? 'any'
      ticket.value = data.ticket ?? makeTicket()
      waveLive.v = 0.28
    }
  } catch {
    /* ignore */
  }

  startWave()

  if (sent.value && sheet.value) {
    const stamp = sheet.value.querySelector('.order__stamp')
    if (stamp) gsap.set(stamp, { opacity: 0.9, scale: 1, rotation: -16 })
  }

  if (reduceMotion() || !root.value) return

  observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry?.isIntersecting || introPlayed || !root.value) return
      introPlayed = true
      const el = root.value
      gsap
        .timeline({ defaults: { ease: 'power3.out' } })
        .from(el.querySelector('.head'), { y: 16, opacity: 0, duration: 0.5 })
        .from(el.querySelector('.lead'), { y: 12, opacity: 0, duration: 0.45 }, '-=0.25')
        .from(el.querySelector('.order'), { y: 32, opacity: 0, duration: 0.7 }, '-=0.15')
        .from(
          el.querySelectorAll('.order__row, .band, .go'),
          { y: 14, opacity: 0, duration: 0.4, stagger: 0.06 },
          '-=0.35',
        )
    },
    { threshold: 0.22 },
  )
  observer.observe(root.value)
})

onUnmounted(() => {
  dead = true
  cancelAnimationFrame(raf)
  observer?.disconnect()
})

const playTransmit = async () => {
  if (!sheet.value) return
  const stamp = sheet.value.querySelector('.order__stamp')

  if (reduceMotion()) {
    if (stamp) gsap.set(stamp, { opacity: 0.9, scale: 1, rotation: -16 })
    return
  }

  const scan = sheet.value.querySelector('.scan')
  const flash = sheet.value.querySelector('.order__flash')

  const tl = gsap.timeline()
  if (statusEl.value) {
    tl.fromTo(
      statusEl.value,
      { opacity: 0.4 },
      { opacity: 1, duration: 0.2, yoyo: true, repeat: 3, ease: 'none' },
      0,
    )
  }
  if (scan) {
    tl.fromTo(
      scan,
      { yPercent: -120, opacity: 0.55 },
      { yPercent: 140, opacity: 0, duration: 0.7, ease: 'none' },
      0.1,
    )
  }
  if (flash) {
    tl.fromTo(flash, { opacity: 0.4 }, { opacity: 0, duration: 0.55 }, 0.35)
  }
  if (stamp) {
    tl.fromTo(
      stamp,
      { scale: 1.7, rotation: -34, opacity: 0 },
      { scale: 1, rotation: -16, opacity: 0.9, duration: 0.55, ease: 'back.out(2.2)' },
      0.55,
    )
  }
  await tl.then()
}

const submit = async (event: Event) => {
  event.preventDefault()
  if (sent.value || busy.value) return

  const mail = email.value.trim()
  const name = callsign.value.trim() || 'без позывного'

  if (!mail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
    note.value = 'Без почты не достучимся - проверь строку.'
    formEl.value?.querySelector<HTMLInputElement>('input[type="email"]')?.focus()
    return
  }

  busy.value = true
  note.value = ''
  const code = makeTicket()
  ticket.value = code

  await playTransmit()
  await new Promise((r) => window.setTimeout(r, reduceMotion() ? 120 : 280))

  try {
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        email: mail,
        callsign: name,
        platform: platform.value,
        ticket: code,
        at: Date.now(),
      }),
    )
  } catch {
    /* ignore */
  }

  sent.value = true
  busy.value = false
  await nextTick()

  if (!reduceMotion() && sheet.value) {
    gsap.from(sheet.value.querySelectorAll('.done > *'), {
      y: 10,
      opacity: 0,
      duration: 0.4,
      stagger: 0.07,
      ease: 'power2.out',
    })
  }
}
</script>

<template>
  <section id="predzakaz" class="pre" ref="root" aria-labelledby="pre-title">
    <div class="inner">
      <header class="head">
        <h2 id="pre-title">предзаказ</h2>
        <p>лист ожидания</p>
      </header>

      <p class="lead">
        Игру ещё никуда не выкладывали. Заполни заявку на смену - напишем, когда откроем первую ночь.
      </p>

      <div class="order" ref="sheet">
        <div class="order__flash" aria-hidden="true" />
        <div class="scan" aria-hidden="true" />
        <p class="order__stamp" aria-hidden="true">Ч86</p>

        <div class="order__top">
          <div>
            <p class="k">наряд</p>
            <p class="v">ожидание ночи</p>
          </div>
          <div class="scope">
            <canvas ref="wave" class="scope__wave" />
          </div>
          <div class="status">
            <p class="k">статус</p>
            <p class="v" ref="statusEl" :data-hot="busy || sent">{{ statusLine }}</p>
          </div>
        </div>

        <form v-if="!sent" ref="formEl" class="form" novalidate @submit="submit">
          <div class="order__row">
            <label class="field">
              <span>позывной</span>
              <input
                v-model="callsign"
                type="text"
                name="callsign"
                maxlength="32"
                autocomplete="nickname"
                placeholder="как звать в эфире"
                :disabled="busy"
              />
            </label>
            <label class="field">
              <span>почта</span>
              <input
                v-model="email"
                type="email"
                name="email"
                autocomplete="email"
                placeholder="куда стучать"
                required
                :disabled="busy"
              />
            </label>
          </div>

          <fieldset class="band" :disabled="busy">
            <legend>куда ждать релиз</legend>
            <div class="band__opts" role="radiogroup" aria-label="Платформа">
              <button
                v-for="item in platforms"
                :key="item.id"
                type="button"
                class="band__btn"
                :data-on="platform === item.id"
                :aria-pressed="platform === item.id"
                @click="platform = item.id"
              >
                <b>{{ item.label }}</b>
                <span>{{ item.hint }}</span>
              </button>
            </div>
          </fieldset>

          <div class="order__foot">
            <p v-if="note" class="hint" role="alert">{{ note }}</p>
            <p v-else class="hint">Без денег и без спама. Только весточка, когда ночь созреет.</p>
            <button type="submit" class="go" :disabled="busy">
              {{ busy ? 'В эфир…' : 'Отправить заявку' }}
            </button>
          </div>
        </form>

        <div v-else class="done" role="status">
          <p class="done__k">заявка принята</p>
          <p class="done__ticket">{{ ticket }}</p>
          <dl class="done__meta">
            <div>
              <dt>позывной</dt>
              <dd>{{ callsign || 'без позывного' }}</dd>
            </div>
            <div>
              <dt>почта</dt>
              <dd>{{ email }}</dd>
            </div>
            <div>
              <dt>ждать</dt>
              <dd>{{ platforms.find((p) => p.id === platform)?.label }}</dd>
            </div>
          </dl>
          <p class="done__v">Как соберём первую ночь - постучимся. Держи этот номер, если вдруг спросим.</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.pre {
  position: relative;
  z-index: 1;
  padding: clamp(2.8rem, 7vw, 4.8rem) 0 clamp(3.2rem, 8vw, 5.2rem);
  background:
    radial-gradient(90% 70% at 88% 0%, rgb(124 255 178 / 0.07), transparent 52%),
    radial-gradient(80% 60% at 6% 100%, rgb(196 165 116 / 0.1), transparent 48%),
    #0c0e0c;
  border-top: 1px solid rgb(138 143 138 / 0.22);
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
  padding-bottom: 0.85rem;
  border-bottom: 1px solid rgb(138 143 138 / 0.28);
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

.head p {
  margin: 0;
  color: var(--paper-dim);
  font-size: 0.72rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  flex-shrink: 0;
}

.lead {
  margin: 0 0 1.6rem;
  max-width: 38rem;
  font-family: var(--hero-voice);
  font-size: clamp(1.05rem, 2vw, 1.25rem);
  line-height: 1.45;
  color: var(--paper);
}

.order {
  position: relative;
  max-width: 44rem;
  padding: clamp(1.15rem, 2.8vw, 1.55rem);
  border: 1px solid rgb(138 143 138 / 0.4);
  background:
    linear-gradient(165deg, rgb(58 52 44 / 0.5) 0%, transparent 38%),
    linear-gradient(180deg, #2a241c 0%, #14110e 100%);
  box-shadow:
    inset 0 1px 0 rgb(232 224 212 / 0.1),
    0 20px 44px rgb(0 0 0 / 0.4);
  overflow: hidden;
}

.order__flash {
  pointer-events: none;
  position: absolute;
  inset: 0;
  z-index: 3;
  opacity: 0;
  background: radial-gradient(ellipse 70% 55% at 50% 35%, rgb(124 255 178 / 0.18), transparent 70%);
}

.scan {
  pointer-events: none;
  position: absolute;
  left: 0;
  right: 0;
  height: 22%;
  z-index: 3;
  opacity: 0;
  background: linear-gradient(180deg, transparent, rgb(124 255 178 / 0.18), transparent);
}

.order__stamp {
  pointer-events: none;
  position: absolute;
  right: 1.1rem;
  bottom: 1.1rem;
  z-index: 2;
  margin: 0;
  width: 4.5rem;
  height: 4.5rem;
  display: grid;
  place-items: center;
  border: 2px solid var(--rust);
  border-radius: 50%;
  color: var(--rust);
  font-family: var(--hero-display);
  font-size: 0.92rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  opacity: 0;
  transform: rotate(-16deg);
}

.order__top,
.form,
.done {
  position: relative;
  z-index: 1;
}

.order__top {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 0.85rem 1rem;
  align-items: center;
  margin-bottom: 1.15rem;
  padding-bottom: 0.95rem;
  border-bottom: 1px solid rgb(138 143 138 / 0.28);
}

.k {
  margin: 0;
  color: var(--paper-dim);
  font-size: 0.64rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.v {
  margin: 0.2rem 0 0;
  font-family: var(--ui);
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: var(--paper);
}

.status .v[data-hot='true'] {
  color: var(--crt);
}

.scope {
  height: 2.8rem;
  border: 1px solid rgb(138 143 138 / 0.32);
  background: #050705;
  overflow: hidden;
  box-shadow: inset 0 0 0 1px rgb(0 0 0 / 0.35);
}

.scope__wave {
  display: block;
  width: 100%;
  height: 100%;
}

.form {
  display: grid;
  gap: 1.05rem;
}

.order__row {
  display: grid;
  grid-template-columns: 0.9fr 1.1fr;
  gap: 0.75rem;
}

.field {
  display: grid;
  gap: 0.35rem;
}

.field span,
.band legend {
  color: var(--paper-dim);
  font-size: 0.68rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.field input {
  width: 100%;
  margin: 0;
  padding: 0.8rem 0.9rem;
  border: 1px solid rgb(138 143 138 / 0.4);
  background: rgb(4 7 5 / 0.75);
  color: var(--paper);
  font-family: var(--hero-voice);
  font-size: 1.05rem;
  line-height: 1.3;
  box-shadow: inset 0 2px 8px rgb(0 0 0 / 0.35);
}

.field input::placeholder {
  color: rgb(184 176 164 / 0.42);
}

.field input:focus {
  outline: 1px solid var(--amber);
  outline-offset: 2px;
}

.field input:disabled {
  opacity: 0.55;
}

.band {
  margin: 0;
  padding: 0;
  border: 0;
  min-inline-size: 0;
}

.band legend {
  padding: 0;
  margin-bottom: 0.45rem;
}

.band__opts {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.45rem;
}

.band__btn {
  appearance: none;
  display: grid;
  gap: 0.2rem;
  margin: 0;
  padding: 0.7rem 0.65rem;
  border: 1px solid rgb(138 143 138 / 0.4);
  background: rgb(0 0 0 / 0.28);
  color: var(--paper-dim);
  text-align: left;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    color 0.2s ease,
    background 0.2s ease;
}

.band__btn b {
  font-family: var(--ui);
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.band__btn span {
  font-family: var(--hero-voice);
  font-size: 0.78rem;
  line-height: 1.25;
  color: inherit;
  opacity: 0.75;
}

.band__btn[data-on='true'] {
  border-color: rgb(124 255 178 / 0.55);
  background: rgb(124 255 178 / 0.08);
  color: var(--crt);
}

.band__btn:focus-visible {
  outline: 1px solid var(--amber);
  outline-offset: 2px;
}

.band:disabled .band__btn {
  opacity: 0.55;
  cursor: default;
}

.order__foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.85rem 1.2rem;
  padding-top: 0.2rem;
}

.hint {
  margin: 0;
  flex: 1 1 14rem;
  color: var(--paper-dim);
  font-family: var(--hero-voice);
  font-size: 0.95rem;
  line-height: 1.4;
}

.go {
  appearance: none;
  margin: 0;
  padding: 0.85rem 1.25rem;
  border: 1px solid rgb(124 255 178 / 0.55);
  background: rgb(124 255 178 / 0.1);
  color: var(--crt);
  font-family: var(--ui);
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  cursor: pointer;
  transition:
    background 0.2s ease,
    border-color 0.2s ease;
}

.go:hover:not(:disabled) {
  background: rgb(124 255 178 / 0.18);
  border-color: var(--crt);
}

.go:focus-visible {
  outline: 1px solid var(--amber);
  outline-offset: 3px;
}

.go:disabled {
  opacity: 0.55;
  cursor: default;
}

.done {
  display: grid;
  gap: 0.75rem;
  padding-right: 5rem;
  min-height: 11rem;
  align-content: center;
}

.done__k {
  margin: 0;
  color: var(--crt);
  font-size: 0.68rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.done__ticket {
  margin: 0;
  font-family: var(--bill-type, var(--hero-voice));
  font-size: clamp(1.6rem, 3vw, 2rem);
  line-height: 1.1;
  color: var(--paper);
  letter-spacing: 0.04em;
}

.done__meta {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.7rem;
  margin: 0.2rem 0 0;
}

.done__meta dt {
  margin: 0;
  color: var(--paper-dim);
  font-size: 0.62rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.done__meta dd {
  margin: 0.25rem 0 0;
  font-family: var(--hero-voice);
  font-size: 0.98rem;
  color: var(--paper);
  word-break: break-word;
}

.done__v {
  margin: 0.2rem 0 0;
  max-width: 34rem;
  font-family: var(--hero-voice);
  font-size: 1.05rem;
  line-height: 1.4;
  color: var(--paper);
}

.sent .order__stamp,
.order:has(.done) .order__stamp {
  opacity: 0.9;
}

@media (max-width: 720px) {
  .order__top {
    grid-template-columns: 1fr 1fr;
  }

  .scope {
    grid-column: 1 / -1;
    order: 3;
  }

  .order__row,
  .band__opts,
  .done__meta {
    grid-template-columns: 1fr;
  }

  .order__foot {
    flex-direction: column;
    align-items: stretch;
  }

  .go {
    width: 100%;
  }

  .done {
    padding-right: 0;
    padding-bottom: 4.8rem;
  }

  .order__stamp {
    bottom: 0.8rem;
  }
}
</style>

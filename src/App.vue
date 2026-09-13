<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import gsap from 'gsap'
import { Flip } from 'gsap/Flip'
import { useEther } from './composables/useEther'
import { useJamTitle } from './composables/useJamTitle'
import SiteHeader from './components/SiteHeader.vue'
import SiteFooter from './components/SiteFooter.vue'
import CallDemo from './components/CallDemo.vue'
import NightPath from './components/NightPath.vue'
import Preorder from './components/Preorder.vue'

gsap.registerPlugin(Flip)

type Cargo = { what: string; where: string }

type Bill = {
  id: string
  no: string
  from: string
  to: string
  base: string
  hint: string
  cargo: Cargo[]
}

const bills: Bill[] = [
  {
    id: 'promka',
    no: '01',
    from: 'промка',
    to: 'город',
    base: 'вышка 14',
    hint: 'запчасти · цех №4',
    cargo: [
      { what: 'запчасти', where: 'цех №4' },
      { what: 'масло', where: 'своим' },
      { what: 'письма', where: 'совет' },
    ],
  },
  {
    id: 'quarry',
    no: '02',
    from: 'карьер',
    to: 'решётка',
    base: 'вышка 14',
    hint: 'вода · третий столб',
    cargo: [
      { what: 'вода', where: 'третий столб' },
      { what: 'солярка', where: 'своим' },
      { what: 'почта', where: 'местный двор' },
    ],
  },
  {
    id: 'waste',
    no: '03',
    from: 'пустырь',
    to: 'горы',
    base: 'вышка 14',
    hint: 'топливо · перевал',
    cargo: [
      { what: 'топливо', where: 'перевал' },
      { what: 'трос', where: 'своим' },
      { what: 'рация', where: 'пост у седла' },
    ],
  },
]

const activeId = ref('quarry')
const boardBusy = ref(false)
const boardEl = ref<HTMLElement | null>(null)
const sheetEl = ref<HTMLElement | null>(null)

const ordered = computed(() => {
  const active = bills.find((b) => b.id === activeId.value) ?? bills[1]
  const rest = bills.filter((b) => b.id !== active.id)
  return [rest[0], active, rest[1]] as [Bill, Bill, Bill]
})

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

const playOpenExtras = () => {
  const board = boardEl.value
  if (!board) return
  const main = board.querySelector<HTMLElement>('.bill--main')
  if (!main) return

  const bits = main.querySelectorAll('.way > div, .cargo, .sign')
  const stamp = main.querySelector<HTMLElement>('.bill__stamp')
  const flash = board.querySelector<HTMLElement>('.board__flash')
  const motes = board.querySelectorAll('.board__mote')

  gsap.fromTo(
    bits,
    { opacity: 0, y: 18, filter: 'blur(3px)' },
    {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      duration: 0.55,
      stagger: 0.07,
      delay: 0.22,
      ease: 'power2.out',
      clearProps: 'filter',
    },
  )

  if (stamp) {
    gsap.fromTo(
      stamp,
      { scale: 1.7, rotation: -38, opacity: 0, y: -12 },
      {
        scale: 1,
        rotation: -18,
        opacity: 1,
        y: 0,
        duration: 0.62,
        delay: 0.48,
        ease: 'back.out(2.4)',
      },
    )
  }

  if (flash) {
    gsap.fromTo(
      flash,
      { opacity: 0.45 },
      { opacity: 0, duration: 0.7, ease: 'power2.out' },
    )
  }

  if (motes.length) {
    gsap.fromTo(
      motes,
      { opacity: 0, y: 10, x: 0 },
      {
        opacity: 0.7,
        y: () => gsap.utils.random(-28, -12),
        x: (i) => (i % 2 === 0 ? -18 : 22),
        duration: 0.9,
        stagger: 0.05,
        ease: 'power1.out',
      },
    )
    gsap.to(motes, {
      opacity: 0,
      duration: 0.5,
      delay: 0.7,
      stagger: 0.04,
    })
  }

  gsap.fromTo(
    main,
    { boxShadow: '0 28px 50px rgb(0 0 0 / 0.65), 0 0 0 1px rgb(232 162 58 / 0.45)' },
    {
      boxShadow: '0 18px 40px rgb(0 0 0 / 0.55), 0 0 0 1px rgb(232 162 58 / 0.18)',
      duration: 0.8,
      delay: 0.15,
      ease: 'power2.out',
    },
  )
}

const pickBill = async (id: string) => {
  if (id === activeId.value || boardBusy.value) return
  boardBusy.value = true

  if (reduceMotion() || !boardEl.value) {
    activeId.value = id
    await nextTick()
    boardBusy.value = false
    return
  }

  const board = boardEl.value
  board.classList.add('board--flipping')
  const cards = board.querySelectorAll('.bill')
  gsap.set(cards, { clearProps: 'opacity,transform,y,rotation,filter' })
  const state = Flip.getState(cards, {
    props: 'padding,boxShadow',
  })

  activeId.value = id
  await nextTick()

  Flip.from(state, {
    duration: 0.75,
    ease: 'power3.inOut',
    absolute: true,
    stagger: 0.04,
    nested: true,
    onComplete: () => {
      gsap.set(cards, { clearProps: 'transform,opacity,position,width,height,top,left' })
      board.classList.remove('board--flipping')
      boardBusy.value = false
    },
  })

  playOpenExtras()
}

const { on } = useEther()
const brand = ref<HTMLElement | null>(null)
const jam = useJamTitle(brand, on)
let motion: gsap.Context | null = null
let sheetObserver: IntersectionObserver | null = null
let sheetIntroPlayed = false

onMounted(() => {
  jam.start()
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  motion = gsap.context(() => {
    gsap.from('.hero__copy > *', {
      y: 14,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power2.out',
    })
    const dye = gsap.timeline({ delay: 0.85 })
    dye
      .fromTo('.hero__dye', { opacity: 0 }, { opacity: 0.22, duration: 0.18, ease: 'none' })
      .to('.hero__dye', { opacity: 0, duration: 0.1, ease: 'none' })
      .to('.hero__dye', { opacity: 0.55, duration: 0.22, ease: 'none' })
      .to('.hero__dye', { opacity: 0.08, duration: 0.12, ease: 'none' })
      .to('.hero__dye', { opacity: 1, duration: 0.55, ease: 'power2.out' })
  })

  if (sheetEl.value) {
    sheetObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || sheetIntroPlayed || !sheetEl.value) return
        sheetIntroPlayed = true
        const root = sheetEl.value
        const cards = root.querySelectorAll('.bill')
        const tl = gsap.timeline({
          defaults: { ease: 'power3.out' },
          onComplete: () => {
            gsap.set(cards, { clearProps: 'opacity,transform,y,rotation' })
          },
        })
        tl.from(root.querySelector('.sheet__head'), { y: 18, opacity: 0, duration: 0.55 })
          .from(root.querySelector('.sheet__lead'), { y: 14, opacity: 0, duration: 0.5 }, '-=0.28')
          .from(
            cards,
            {
              y: 36,
              opacity: 0,
              duration: 0.7,
              stagger: 0.09,
              ease: 'power3.out',
            },
            '-=0.2',
          )
          .from(
            root.querySelector('.bill--main .bill__stamp'),
            { scale: 1.45, opacity: 0, duration: 0.5, ease: 'back.out(2)' },
            '-=0.3',
          )
      },
      { threshold: 0.22 },
    )
    sheetObserver.observe(sheetEl.value)
  }
})

onUnmounted(() => {
  jam.stop()
  motion?.revert()
  sheetObserver?.disconnect()
})
</script>

<template>
  <div id="top" class="desk" :data-on="on">
    <a class="skip" href="#efir">К эфиру</a>
    <div class="dust" aria-hidden="true" />
    <SiteHeader :live="on" />

    <section class="hero" aria-labelledby="brand">
      <div class="hero__copy">
        <h1 id="brand" ref="brand" class="hero__brand">
          <span class="hero__word">
            <span class="hero__ghost hero__ghost--crt" aria-hidden="true">ЧАСТОТА</span>
            <span class="hero__ghost hero__ghost--dust" aria-hidden="true">ЧАСТОТА</span>
            <span class="hero__face">ЧАСТОТА</span>
          </span>
          <em class="hero__word">
            <span class="hero__ghost hero__ghost--crt" aria-hidden="true">86</span>
            <span class="hero__ghost hero__ghost--dust" aria-hidden="true">86</span>
            <span class="hero__face hero__face--num">
              <span class="hero__dye" aria-hidden="true">86</span>
              86
            </span>
          </em>
        </h1>
        <p class="hero__line">Ночное радио колонны. Пока пыль ещё сзади.</p>
        <p class="power" :data-on="on" aria-live="polite">
          <i aria-hidden="true" />
          {{ on ? 'Эфир живой' : 'Выходим в эфир…' }}
        </p>
      </div>
    </section>

    <CallDemo />

    <NightPath />

    <div class="frame">
      <section id="nakladnaya" class="sheet" ref="sheetEl" aria-labelledby="bill-title">
        <header class="sheet__head">
          <h2 id="bill-title">накладная</h2>
          <p>перед выездом</p>
        </header>

        <p class="sheet__lead">
          На доске три листа. Возьми любой - откроется целиком, со всем грузом.
        </p>

        <div ref="boardEl" class="board" aria-label="Доска нарядов">
          <div class="board__flash" aria-hidden="true" />
          <i class="board__mote" aria-hidden="true" />
          <i class="board__mote" aria-hidden="true" />
          <i class="board__mote" aria-hidden="true" />
          <i class="board__mote" aria-hidden="true" />

          <article
            v-for="(bill, slot) in ordered"
            :key="bill.id"
            class="bill"
            :class="slot === 1 ? 'bill--main' : 'bill--side'"
            :data-slot="slot === 0 ? 'left' : slot === 2 ? 'right' : 'main'"
            :tabindex="slot === 1 ? -1 : 0"
            :role="slot === 1 ? 'article' : 'button'"
            :aria-pressed="slot === 1 ? undefined : false"
            :aria-label="
              slot === 1
                ? `Открыт лист ${bill.no}: ${bill.from} в ${bill.to}`
                : `Открыть лист ${bill.no}: ${bill.from} в ${bill.to}`
            "
            @click="slot !== 1 && pickBill(bill.id)"
            @keydown.enter.prevent="slot !== 1 && pickBill(bill.id)"
            @keydown.space.prevent="slot !== 1 && pickBill(bill.id)"
          >
            <p class="bill__no">{{ bill.no }}</p>
            <p v-if="slot === 1" class="bill__stamp" aria-hidden="true">Ч86</p>

            <template v-if="slot === 1">
              <dl class="way">
                <div>
                  <dt>откуда</dt>
                  <dd>{{ bill.from }}</dd>
                </div>
                <div>
                  <dt>куда</dt>
                  <dd>{{ bill.to }}</dd>
                </div>
                <div>
                  <dt>база</dt>
                  <dd>{{ bill.base }}</dd>
                </div>
              </dl>

              <table class="cargo">
                <caption>груз</caption>
                <thead>
                  <tr>
                    <th>что</th>
                    <th>куда сдать</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in bill.cargo" :key="row.what">
                    <td>{{ row.what }}</td>
                    <td>{{ row.where }}</td>
                  </tr>
                </tbody>
              </table>

              <div class="sign">
                <p>
                  <span>сдал</span>
                  <b>смена Ч86</b>
                </p>
                <p>
                  <span>принял</span>
                  <b></b>
                </p>
              </div>
            </template>

            <template v-else>
              <dl class="way way--short">
                <div>
                  <dt>откуда</dt>
                  <dd>{{ bill.from }}</dd>
                </div>
                <div>
                  <dt>куда</dt>
                  <dd>{{ bill.to }}</dd>
                </div>
              </dl>
              <p class="bill__hint">{{ bill.hint }}</p>
            </template>
          </article>
        </div>
      </section>
    </div>

    <Preorder />

    <SiteFooter />
  </div>
</template>

<style scoped lang="scss">
.skip {
  position: absolute;
  left: 0.8rem;
  top: -3rem;
  z-index: 1100;
  padding: 0.4rem 0.7rem;
  background: var(--paper);
  color: var(--ink);
  text-decoration: none;
}

.skip:focus {
  top: 0.8rem;
}

.desk {
  position: relative;
  min-height: 100vh;
  background: var(--ink);
}

.dust {
  pointer-events: none;
  position: fixed;
  inset: 0 auto 0 0;
  width: clamp(2.4rem, 7vw, 5.5rem);
  background: linear-gradient(90deg, rgb(138 112 72 / 0.35), transparent);
  clip-path: polygon(0 0, 86% 0, 100% 8%, 78% 18%, 100% 31%, 70% 48%, 96% 63%, 74% 79%, 100% 100%, 0 100%);
  z-index: 2;
}

.hero {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100svh;
  width: 100%;
  margin: 0;
  padding: var(--site-header-offset, 5.5rem) clamp(1.1rem, 4vw, 2.4rem) 2.2rem;
  text-align: center;
  background:
    linear-gradient(180deg, rgb(26 22 18 / 0.4) 0%, rgb(26 22 18 / 0.18) 38%, rgb(26 22 18 / 0.82) 100%),
    url('/img/night.jpg') center / 100% 100% no-repeat;
}

.hero__copy {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 46rem;
}

.hero__brand {
  position: relative;
  margin: 0 0 1.7rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.04em;
  font-family: var(--hero-display);
  font-size: clamp(4.8rem, 18vw, 11rem);
  line-height: 0.86;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.hero__word {
  position: relative;
  display: block;
  color: var(--paper);
}

em.hero__word {
  font-style: normal;
}

em.hero__word .hero__face {
  color: var(--paper);
}

.hero__dye {
  position: absolute;
  inset: 0;
  color: var(--dust);
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .hero__dye {
    opacity: 1;
  }
}

.hero__ghost,
.hero__face {
  display: block;
}

.hero__ghost {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0;
}

.hero__ghost--crt {
  color: var(--crt);
}

.hero__ghost--dust {
  color: var(--dust);
}

.hero__face {
  position: relative;
  color: var(--paper);
  text-shadow:
    0.018em 0.022em 0 rgb(26 22 18 / 0.62),
    0.034em 0.042em 0 rgb(20 16 12 / 0.38),
    0.05em 0.062em 0.04em rgb(10 8 6 / 0.28);
}

.hero__line {
  margin: 0 0 1.3rem;
  max-width: 24ch;
  font-family: var(--hero-voice);
  font-size: clamp(1.2rem, 2.1vw, 1.45rem);
  letter-spacing: -0.01em;
}

.power {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  margin: 0;
  min-height: 2.85rem;
  padding: 0 1.05rem;
  border: 1px solid rgb(138 143 138 / 0.45);
  background: transparent;
  color: var(--paper-dim);
  font-family: var(--ui);
  font-size: 0.82rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: default;
  transition:
    color 0.45s ease,
    border-color 0.45s ease;
}

.power i {
  width: 0.55rem;
  height: 0.55rem;
  border-radius: 50%;
  background: var(--steel);
  transition:
    background 0.45s ease,
    box-shadow 0.45s ease;
}

.power[data-on='true'] {
  color: var(--crt);
  border-color: var(--crt);
}

.power[data-on='true'] i {
  background: var(--crt);
  box-shadow: 0 0 0.6rem var(--crt);
}

.frame {
  position: relative;
  z-index: 1;
  width: 100%;
  padding: 0.4rem 0 1.8rem;
  background: #0c0e0c;
}

.frame > * {
  width: var(--page);
  margin-left: auto;
  margin-right: auto;
  padding-left: clamp(1.1rem, 4vw, 2.4rem);
  padding-right: clamp(1.1rem, 4vw, 2.4rem);
}

.sheet {
  padding: clamp(2.4rem, 6vw, 4rem) 0;
}

.sheet__head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 1rem;
  margin-bottom: 1rem;
  padding-bottom: 0.85rem;
  border-bottom: 1px solid rgb(138 143 138 / 0.28);
}

.sheet h2 {
  margin: 0;
  font-family: var(--title);
  font-size: clamp(1.25rem, 2.8vw, 1.9rem);
  font-weight: 600;
  line-height: 1;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--paper);
}

.sheet__head p {
  margin: 0;
  color: var(--paper-dim);
  font-size: 0.72rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  flex-shrink: 0;
}

.sheet__lead {
  margin: 0 0 1.5rem;
  max-width: 36rem;
  font-family: var(--hero-voice);
  font-size: clamp(1.05rem, 2vw, 1.25rem);
  line-height: 1.45;
  color: var(--paper);
}

.board {
  --bill: color-mix(in srgb, var(--paper) 88%, var(--dust) 12%);
  --bill-shade: color-mix(in srgb, var(--paper) 70%, var(--dust) 30%);
  --rule: color-mix(in srgb, var(--dust-dim) 55%, var(--ink) 45%);
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 0.72fr) minmax(0, 1.15fr) minmax(0, 0.72fr);
  gap: 0.75rem;
  align-items: start;
  padding: 1rem 0.85rem 1.15rem;
  background:
    linear-gradient(180deg, rgb(42 38 32 / 0.92), rgb(22 20 16 / 0.96)),
    repeating-linear-gradient(
      90deg,
      transparent,
      transparent 13px,
      rgb(0 0 0 / 0.12) 13px,
      rgb(0 0 0 / 0.12) 14px
    );
  border: 1px solid rgb(138 143 138 / 0.35);
  box-shadow:
    inset 0 1px 0 rgb(232 224 212 / 0.08),
    inset 0 0 40px rgb(0 0 0 / 0.35);
  overflow: visible;
}

.board__flash {
  pointer-events: none;
  position: absolute;
  inset: 0;
  z-index: 4;
  opacity: 0;
  background:
    radial-gradient(ellipse 70% 55% at 50% 40%, rgb(232 224 212 / 0.28), transparent 70%);
}

.board__mote {
  pointer-events: none;
  position: absolute;
  top: 48%;
  left: 50%;
  z-index: 5;
  width: 5px;
  height: 5px;
  margin: -2px;
  border-radius: 50%;
  background: rgb(196 165 116 / 0.75);
  opacity: 0;
}

.board__mote:nth-child(2) {
  left: 42%;
  width: 3px;
  height: 3px;
}

.board__mote:nth-child(3) {
  left: 58%;
  width: 4px;
  height: 4px;
}

.board__mote:nth-child(4) {
  left: 47%;
  top: 55%;
}

.board__mote:nth-child(5) {
  left: 55%;
  top: 52%;
  width: 3px;
  height: 3px;
}

.board--flipping .bill--side {
  transition: none;
  pointer-events: none;
}

.bill {
  position: relative;
  margin: 0;
  padding: 1.15rem 1.1rem 1.35rem 1.25rem;
  color: var(--ink);
  background:
    radial-gradient(ellipse 90% 46% at 50% -12%, rgb(232 162 58 / 0.14), transparent 62%),
    radial-gradient(circle at 10% 92%, rgb(163 58 42 / 0.1), transparent 28%),
    radial-gradient(circle at 94% 10%, rgb(138 112 72 / 0.16), transparent 32%),
    linear-gradient(165deg, var(--bill) 0%, var(--bill-shade) 100%);
  border: 1px solid var(--dust-dim);
  box-shadow:
    inset 0 0 3.5rem rgb(26 22 18 / 0.1),
    0 14px 28px rgb(0 0 0 / 0.4);
}

.bill--side {
  margin-top: 1.4rem;
  opacity: 0.88;
  filter: saturate(0.92);
  cursor: pointer;
  transition:
    transform 0.35s ease,
    opacity 0.35s ease,
    box-shadow 0.35s ease,
    filter 0.35s ease;
}

.bill--side:hover,
.bill--side:focus-visible {
  opacity: 1;
  filter: saturate(1);
  box-shadow:
    inset 0 0 3.5rem rgb(26 22 18 / 0.1),
    0 16px 32px rgb(0 0 0 / 0.5),
    0 0 0 1px rgb(232 162 58 / 0.28);
  outline: none;
}

.bill--side[data-slot='left'] {
  transform: rotate(-2.2deg);
}

.bill--side[data-slot='right'] {
  transform: rotate(2deg);
}

.bill--side[data-slot='left']:hover,
.bill--side[data-slot='left']:focus-visible {
  transform: rotate(-2.2deg) translateY(-4px);
}

.bill--side[data-slot='right']:hover,
.bill--side[data-slot='right']:focus-visible {
  transform: rotate(2deg) translateY(-4px);
}

.bill--main {
  z-index: 2;
  padding: 1.5rem 1.4rem 1.8rem 1.6rem;
  cursor: default;
  box-shadow:
    inset 0 0 3.5rem rgb(26 22 18 / 0.1),
    0 18px 40px rgb(0 0 0 / 0.55),
    0 0 0 1px rgb(232 162 58 / 0.18);
}

@media (prefers-reduced-motion: reduce) {
  .bill--side {
    transition: none;
  }
}

.bill__no {
  position: relative;
  z-index: 1;
  margin: 0 0 0.85rem;
  color: color-mix(in srgb, var(--ink) 55%, var(--dust-dim) 45%);
  font-size: 0.68rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.bill__hint {
  position: relative;
  z-index: 1;
  margin: 0.9rem 0 0;
  padding-top: 0.55rem;
  border-top: 1px solid var(--rule);
  font-family: var(--bill-type);
  font-size: 1.05rem;
  line-height: 1.35;
  color: var(--ink);
  -webkit-text-stroke: 0.35px var(--ink);
}

.bill::before {
  content: '';
  position: absolute;
  inset: 0 auto 0 0;
  width: 3px;
  background: color-mix(in srgb, var(--rust) 60%, var(--dust) 40%);
  opacity: 0.75;
}

.bill::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  opacity: 0.12;
  mix-blend-mode: multiply;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 140 140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

.way,
.cargo,
.sign {
  position: relative;
  z-index: 1;
}

.bill__stamp {
  position: absolute;
  right: 1.1rem;
  bottom: 1.35rem;
  z-index: 2;
  margin: 0;
  width: 4.7rem;
  height: 4.7rem;
  display: grid;
  place-items: center;
  border: 2px solid var(--rust);
  border-radius: 50%;
  background: radial-gradient(
    circle,
    transparent 61%,
    var(--rust) 62% 66%,
    transparent 67%
  );
  color: var(--rust);
  font-family: var(--hero-display);
  font-size: 0.92rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  transform: rotate(-18deg);
  mix-blend-mode: multiply;
  pointer-events: none;
}

.way dd,
.cargo td,
.sign b,
.bill__hint {
  font-family: var(--bill-type);
  font-weight: 400;
  color: var(--ink);
  font-kerning: none;
  font-variant-ligatures: contextual;
  font-feature-settings: 'calt' 1;
  -webkit-text-stroke: 0.35px var(--ink);
}

.way {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem 1.2rem;
  margin: 0 0 1.5rem;
}

.way--short {
  grid-template-columns: 1fr;
  gap: 0.85rem;
  margin-bottom: 0;
}

.way dt,
.cargo caption,
.cargo th,
.sign span {
  margin: 0;
  color: color-mix(in srgb, var(--ink) 70%, var(--dust-dim) 30%);
  font-size: 0.72rem;
  font-weight: 400;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.way dd {
  margin: 0.3rem 0 0;
  padding-bottom: 0.2rem;
  border-bottom: 1px solid var(--rule);
  font-size: 1.22rem;
  line-height: 1.4;
}

.bill--side .way dd {
  font-size: 1.08rem;
}

.cargo {
  width: 100%;
  border-collapse: collapse;
  margin: 0 0 1.6rem;
}

.cargo caption {
  caption-side: top;
  text-align: left;
  margin-bottom: 0.45rem;
}

.cargo th,
.cargo td {
  padding: 0.55rem 0.2rem 0.55rem 0;
  text-align: left;
  border-bottom: 1px solid var(--rule);
}

.cargo th {
  padding-top: 0;
}

.cargo td:first-child {
  width: 34%;
  font-size: 1.22rem;
}

.cargo td:last-child {
  font-size: 1.22rem;
}

.sign {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.4rem;
  max-width: 28rem;
}

.sign p {
  margin: 0;
}

.sign span {
  display: block;
  margin-bottom: 0.35rem;
}

.sign b {
  display: block;
  min-height: 1.65rem;
  border-bottom: 1px solid var(--rule);
  font-size: 1.22rem;
}

@media (max-width: 900px) {
  .board {
    grid-template-columns: 1fr;
    gap: 0.7rem;
  }

  .bill--side {
    margin-top: 0;
    transform: none;
  }

  .bill--side[data-slot='left'],
  .bill--side[data-slot='right'],
  .bill--side[data-slot='left']:hover,
  .bill--side[data-slot='right']:hover,
  .bill--side[data-slot='left']:focus-visible,
  .bill--side[data-slot='right']:focus-visible {
    transform: none;
  }

  .bill--main {
    order: -1;
  }
}

@media (max-width: 720px) {
  .dust {
    width: 1.4rem;
  }

  .way,
  .sign {
    grid-template-columns: 1fr;
  }

  .cargo td:first-child {
    width: auto;
  }

  .bill__stamp {
    right: 0.7rem;
    bottom: 0.9rem;
    width: 3.8rem;
    height: 3.8rem;
    font-size: 0.9rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero__ghost {
    display: none;
  }
}
</style>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import gsap from 'gsap'
import { useEther } from './composables/useEther'
import Waveform from './components/Waveform.vue'
import CallDemo from './components/CallDemo.vue'
import NightPath from './components/NightPath.vue'

const { on, toggle } = useEther()
const repo = 'https://github.com/classicbogg/efir86'
let motion: gsap.Context | null = null

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  motion = gsap.context(() => {
    gsap.from('.hero__brand, .hero__line, .hero__actions, .hero__wave', {
      y: 18,
      opacity: 0,
      duration: 0.9,
      stagger: 0.12,
      ease: 'power2.out',
    })
  })
})

onUnmounted(() => {
  motion?.revert()
})
</script>

<template>
  <div class="desk">
    <div class="dust" aria-hidden="true" />
    <div class="frame">
      <header class="top">
        <span>ЭФИР ОТКРЫТ</span>
        <span>демо-срез · Godot</span>
      </header>

      <section class="hero">
        <div class="hero__copy">
          <p class="eyebrow">ночное радио колонны</p>
          <h1 class="hero__brand">
            <span>ЧАСТОТА</span>
            <em>86</em>
          </h1>
          <p class="hero__line">Кого спасти сейчас, чтобы потом вообще доехать.</p>
          <div class="hero__actions">
            <button type="button" class="cta" :data-on="on" @click="toggle">
              {{ on ? 'Эфир включён' : 'Включить эфир' }}
            </button>
            <a class="ghost" :href="repo" target="_blank" rel="noreferrer">Репозиторий</a>
          </div>
        </div>
        <figure class="hero__wave">
          <figcaption>
            <span>мембрана</span>
            <span>{{ on ? 'шум живой' : 'тишина на рычаге' }}</span>
          </figcaption>
          <Waveform />
        </figure>
      </section>

      <CallDemo />
      <NightPath />

      <section id="nakladnaya" class="sheet">
        <p class="stamp">НАКЛАДНАЯ</p>
        <div class="sheet__paper">
          <h2>Не город. Не ледяной поезд. Не война за районы.</h2>
          <p>
            Ты смена на частоте. Колонна фур. Сзади пыль. Две шкалы: земля и свои.
            Антенна рисует правду — сдохла, карта врёт. Связной садится только на вышке 14.
          </p>
          <p>
            Нас трое. Код, логика, звук — нормально. Картинка нарочно бедная: штамп, силуэт,
            восемь красок. Меню нарисовал Ефим в Figma. Игра живёт как панель, не как фильм.
          </p>
          <p class="sheet__end">Демо уже открывается: карьер → Решётка или заправка → вышка 14.</p>
        </div>
      </section>

      <footer class="foot">
        <span>27.385 — рабочая ложь</span>
        <a :href="repo" target="_blank" rel="noreferrer">github.com/classicbogg/efir86</a>
      </footer>
    </div>
  </div>
</template>

<style scoped lang="scss">
.desk {
  position: relative;
  min-height: 100vh;
  background:
    linear-gradient(90deg, rgba(26, 22, 18, 0.72) 0%, rgba(26, 22, 18, 0.55) 42%, rgba(26, 22, 18, 0.78) 100%),
    url('/img/night.jpg') center / cover no-repeat;
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

.frame {
  position: relative;
  z-index: 1;
  margin: 1rem auto;
  width: var(--page);
  padding: 0 clamp(1.2rem, 4vw, 2.6rem) 2rem;
  outline: 1px solid var(--frame);
  outline-offset: -12px;
  background: color-mix(in srgb, var(--ink) 78%, transparent);
}

.top,
.foot {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.1rem 0 0.4rem;
  color: var(--paper-dim);
  font-size: 0.78rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.hero {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(16rem, 0.9fr);
  gap: clamp(1.5rem, 4vw, 3rem);
  align-items: end;
  padding: clamp(2.4rem, 7vw, 5rem) 0 3rem;
}

.eyebrow {
  margin: 0 0 0.4rem;
  color: var(--dust);
  letter-spacing: 0.22em;
  text-transform: lowercase;
  font-size: 0.86rem;
}

.hero__brand {
  margin: 0;
  font-family: var(--title);
  font-size: clamp(3.4rem, 10vw, 7rem);
  line-height: 0.88;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.hero__brand em {
  font-style: normal;
  color: var(--dust);
}

.hero__line {
  margin: 1.1rem 0 1.6rem;
  max-width: 22ch;
  font-size: clamp(1.15rem, 2.2vw, 1.4rem);
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.7rem;
  align-items: center;
}

.cta,
.ghost {
  display: inline-flex;
  align-items: center;
  min-height: 2.7rem;
  padding: 0 1rem;
  text-decoration: none;
  border: 1px solid var(--paper);
  cursor: pointer;
}

.cta {
  background: var(--paper);
  color: var(--ink);
  border-color: var(--paper);
}

.cta[data-on='true'] {
  background: transparent;
  color: var(--crt);
  border-color: var(--crt);
}

.ghost {
  background: transparent;
  color: var(--paper);
}

.hero__wave {
  margin: 0;
  border: 1px solid var(--steel);
  background: #0c0e0c;
  height: 12.5rem;
  padding: 0.6rem 0.7rem 0.4rem;
  display: flex;
  flex-direction: column;
}

.hero__wave figcaption {
  display: flex;
  justify-content: space-between;
  color: var(--crt-dim);
  font-size: 0.72rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  margin-bottom: 0.3rem;
}

.hero__wave canvas {
  flex: 1;
}

.stamp {
  margin: 0 0 0.6rem;
  color: var(--dust);
  letter-spacing: 0.28em;
  font-size: 0.78rem;
}

.sheet {
  padding: 1rem 0 3rem;
}

.sheet__paper {
  border: 1px solid var(--dust-dim);
  background: color-mix(in srgb, var(--ink-2) 88%, var(--dust) 12%);
  padding: clamp(1.2rem, 3vw, 2rem);
}

.sheet h2 {
  margin: 0 0 1rem;
  font-family: var(--title);
  font-size: clamp(1.6rem, 3.4vw, 2.3rem);
  font-weight: 600;
  line-height: 1.15;
  max-width: 22ch;
}

.sheet p {
  max-width: 42rem;
  color: var(--paper-dim);
}

.sheet__end {
  color: var(--paper) !important;
}

.foot {
  border-top: 1px solid rgb(138 143 138 / 0.35);
  padding-top: 1rem;
}

.foot a {
  text-transform: none;
  letter-spacing: 0;
}

@media (max-width: 860px) {
  .hero {
    grid-template-columns: 1fr;
  }

  .dust {
    width: 1.4rem;
  }
}
</style>

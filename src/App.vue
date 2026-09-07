<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import gsap from 'gsap'
import { useEther } from './composables/useEther'
import { useJamTitle } from './composables/useJamTitle'
import SiteHeader from './components/SiteHeader.vue'
import SiteFooter from './components/SiteFooter.vue'
import CallDemo from './components/CallDemo.vue'
import NightPath from './components/NightPath.vue'

const { on, toggle } = useEther()
const brand = ref<HTMLElement | null>(null)
const jam = useJamTitle(brand, on)
let motion: gsap.Context | null = null

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
})

onUnmounted(() => {
  jam.stop()
  motion?.revert()
})
</script>

<template>
  <div id="top" class="desk" :data-on="on">
    <a class="skip" href="#vyzov">К вызову</a>
    <div class="dust" aria-hidden="true" />
    <SiteHeader :live="on" @toggle-ether="toggle" />

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
        <p class="hero__line">Жми. Шли. Трасса скажет.</p>
        <div class="hero__actions">
          <button type="button" class="power" :data-on="on" @click="toggle">
            <i aria-hidden="true" />
            {{ on ? 'Эфир включён' : 'Включить эфир' }}
          </button>
        </div>
      </div>
    </section>

    <div class="frame">
      <CallDemo />
    </div>

    <NightPath />

    <div class="frame">
      <section id="nakladnaya" class="sheet" aria-labelledby="bill-title">
        <header class="sheet__head">
          <h2 id="bill-title">накладная</h2>
          <p>№ Ч86 · ночь</p>
        </header>

        <article class="bill">
          <p class="bill__stamp" aria-hidden="true">Ч86</p>

          <dl class="way">
            <div>
              <dt>откуда</dt>
              <dd>карьер</dd>
            </div>
            <div>
              <dt>через</dt>
              <dd>Решётка или заправка</dd>
            </div>
            <div>
              <dt>куда</dt>
              <dd>вышка 14</dd>
            </div>
          </dl>

          <table class="cargo">
            <caption>груз</caption>
            <thead>
              <tr>
                <th>наименование</th>
                <th>сдать</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>вода</td>
                <td>Решётка, третий столб</td>
              </tr>
              <tr>
                <td>солярка</td>
                <td>колонна</td>
              </tr>
              <tr>
                <td>почта</td>
                <td>вышка 14</td>
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
        </article>
      </section>
    </div>

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

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.7rem;
  align-items: center;
  justify-content: center;
}

.power {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  min-height: 2.85rem;
  padding: 0 1.05rem;
  border: 1px solid var(--paper);
  background: var(--paper);
  color: var(--ink);
  cursor: pointer;
}

.power:hover {
  background: var(--dust);
  border-color: var(--dust);
}

.power i {
  width: 0.55rem;
  height: 0.55rem;
  border-radius: 50%;
  background: var(--ink);
}

.power[data-on='true'] {
  background: transparent;
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
  margin-bottom: 1.8rem;
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

.bill {
  --bill: color-mix(in srgb, var(--paper) 88%, var(--dust) 12%);
  --bill-shade: color-mix(in srgb, var(--paper) 70%, var(--dust) 30%);
  --rule: color-mix(in srgb, var(--dust-dim) 55%, var(--ink) 45%);
  position: relative;
  max-width: 36rem;
  margin: 0;
  padding: 1.5rem 1.4rem 1.8rem 1.6rem;
  color: var(--ink);
  background:
    radial-gradient(ellipse 90% 46% at 50% -12%, rgb(232 162 58 / 0.14), transparent 62%),
    radial-gradient(circle at 10% 92%, rgb(163 58 42 / 0.1), transparent 28%),
    radial-gradient(circle at 94% 10%, rgb(138 112 72 / 0.16), transparent 32%),
    linear-gradient(165deg, var(--bill) 0%, var(--bill-shade) 100%);
  border: 1px solid var(--dust-dim);
  box-shadow:
    inset 0 0 3.5rem rgb(26 22 18 / 0.1),
    0 18px 40px rgb(0 0 0 / 0.5);
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
.sign b {
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

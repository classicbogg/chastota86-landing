<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import gsap from 'gsap'

const regions = [
  { id: 'city', label: 'город', x: 78, y: 28, home: true },
  { id: 'grid', label: 'решётка', x: 58, y: 48 },
  { id: 'waste', label: 'пустырь', x: 38, y: 36 },
  { id: 'quarry', label: 'карьер', x: 18, y: 62 },
  { id: 'mount', label: 'горы', x: 48, y: 18 },
  { id: 'ind', label: 'промка', x: 72, y: 68 },
]

const root = ref<HTMLElement | null>(null)
let intro: gsap.Context | null = null
let observer: IntersectionObserver | null = null
let played = false

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

onMounted(() => {
  if (reduceMotion() || !root.value) return

  observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry?.isIntersecting || played || !root.value) return
      played = true
      const el = root.value
      intro = gsap.context(() => {
        gsap
          .timeline({ defaults: { ease: 'power3.out' } })
          .from(el.querySelector('.head'), { y: 14, opacity: 0, duration: 0.45 })
          .from(el.querySelector('.about'), { y: 16, opacity: 0, duration: 0.5 }, '-=0.2')
          .from(
            el.querySelectorAll('.node'),
            { scale: 0.4, opacity: 0, duration: 0.45, stagger: 0.05 },
            '-=0.25',
          )
          .from(el.querySelector('.convoy'), { scale: 0.5, opacity: 0, duration: 0.4 }, '-=0.2')

        gsap.to(el.querySelector('.dust-wall'), {
          xPercent: 8,
          duration: 7,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        })
        gsap.to(el.querySelector('.convoy'), {
          y: -5,
          duration: 1.8,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        })
      }, el)
    },
    { threshold: 0.25 },
  )
  observer.observe(root.value)
})

onUnmounted(() => {
  observer?.disconnect()
  intro?.revert()
})
</script>

<template>
  <section id="trassa" class="path" ref="root" aria-labelledby="trassa-title">
    <div class="dust-wall" aria-hidden="true" />

    <div class="inner">
      <header class="head">
        <h2 id="trassa-title">трасса</h2>
        <p>только вперёд</p>
      </header>

      <p class="about">
        Шесть земель вокруг города. Вышка 14 - дом во дворе, не финиш.
        Наряд даёт откуда и куда - нитку чертишь сам. Пыль уже заметает след.
      </p>

      <div class="map" aria-hidden="true">
        <svg class="roads" viewBox="0 0 100 80" preserveAspectRatio="none">
          <path d="M18 62 C28 54 34 42 38 36 C44 28 52 24 58 48 C64 58 70 40 78 28" />
          <path d="M38 36 C44 22 46 18 48 18" />
          <path d="M58 48 C66 58 70 66 72 68" />
          <path d="M78 28 C76 48 74 60 72 68" />
        </svg>

        <div
          v-for="region in regions"
          :key="region.id"
          class="node"
          :class="{ 'node--home': region.home }"
          :style="{ left: `${region.x}%`, top: `${region.y}%` }"
        >
          <i />
          <span>{{ region.label }}</span>
        </div>

        <div class="convoy" style="left: 42%; top: 40%">
          <b />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.path {
  position: relative;
  z-index: 1;
  overflow: hidden;
  width: 100%;
  min-height: clamp(24rem, 58vw, 38rem);
  padding: clamp(2.6rem, 6vw, 4.4rem) clamp(1.1rem, 4vw, 2.4rem);
  background:
    linear-gradient(90deg, rgb(12 14 12 / 0.9) 0%, rgb(12 14 12 / 0.58) 38%, rgb(12 14 12 / 0.28) 100%),
    linear-gradient(180deg, rgb(12 14 12 / 0.55) 0%, transparent 38%, rgb(12 14 12 / 0.78) 100%),
    url('/img/trassa.png') center / cover no-repeat;
}

.dust-wall {
  pointer-events: none;
  position: absolute;
  left: -4%;
  top: 0;
  bottom: 0;
  width: clamp(5rem, 18vw, 11rem);
  background: linear-gradient(90deg, rgb(138 112 72 / 0.5), rgb(138 112 72 / 0.12) 55%, transparent);
  clip-path: polygon(0 0, 72% 0, 100% 10%, 68% 26%, 96% 44%, 60% 66%, 88% 84%, 54% 100%, 0 100%);
  opacity: 0.85;
  z-index: 1;
}

.inner {
  position: relative;
  z-index: 2;
  width: var(--page);
  max-width: 100%;
  margin: 0 auto;
}

.head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 1rem;
  border-bottom: 1px solid rgb(138 143 138 / 0.28);
  padding-bottom: 0.85rem;
  margin-bottom: 1.2rem;
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

.about {
  margin: 0 0 1.6rem;
  max-width: 36rem;
  font-family: var(--hero-voice);
  font-size: clamp(1.05rem, 2vw, 1.25rem);
  line-height: 1.45;
  color: var(--paper);
}

.map {
  position: relative;
  width: min(100%, 40rem);
  aspect-ratio: 100 / 72;
  max-height: 22rem;
}

.roads {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.roads path {
  fill: none;
  stroke: rgb(196 165 116 / 0.45);
  stroke-width: 0.7;
  stroke-linecap: round;
}

.node {
  position: absolute;
  transform: translate(-50%, -50%);
  display: grid;
  justify-items: center;
  gap: 0.28rem;
}

.node i {
  width: 0.72rem;
  height: 0.72rem;
  border: 2px solid var(--dust);
  background: rgb(26 22 18 / 0.85);
  box-shadow: 0 0 0 3px rgb(12 14 12 / 0.35);
}

.node--home i {
  border-color: var(--crt);
  background: rgb(124 255 178 / 0.16);
  box-shadow: 0 0 10px rgb(124 255 178 / 0.25);
}

.node span {
  padding: 0.12rem 0.35rem;
  background: rgb(12 14 12 / 0.72);
  color: var(--paper-dim);
  font-family: var(--ui);
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  white-space: nowrap;
}

.node--home span {
  color: var(--crt);
}

.convoy {
  position: absolute;
  z-index: 2;
  width: 1.35rem;
  height: 1.35rem;
  transform: translate(-50%, -50%);
}

.convoy b {
  display: block;
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg, #c4a06a, #7a6238);
  border: 1px solid rgb(26 22 18 / 0.7);
  box-shadow: 0 0 0 2px rgb(232 162 58 / 0.28);
  clip-path: polygon(12% 28%, 78% 18%, 92% 48%, 80% 78%, 18% 72%, 8% 48%);
}

@media (max-width: 720px) {
  .path {
    min-height: 0;
  }

  .map {
    width: 100%;
    max-height: none;
    aspect-ratio: 100 / 78;
  }

  .node span {
    font-size: 0.58rem;
    letter-spacing: 0.06em;
  }
}

@media (max-width: 480px) {
  .node span {
    padding: 0.1rem 0.28rem;
  }

  .dust-wall {
    width: 4.2rem;
    opacity: 0.7;
  }
}

@media (prefers-reduced-motion: reduce) {
  .dust-wall,
  .convoy {
    transform: none !important;
  }
}
</style>

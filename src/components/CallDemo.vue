<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, reactive, ref } from 'vue'
import { useNightClock } from '../composables/useNightClock'

type Who = 'desk' | 'unknown'

type Entry = {
  who: Who
  text: string
  hole?: boolean
}

const script: Entry[] = [
  { who: 'unknown', text: 'нужна в-да  ..еш-тка  трет.. столб', hole: true },
  { who: 'desk', text: 'Повторите место. Помехи в эфире.' },
  { who: 'unknown', text: 'Нужна вода. Решётка, третий столб после ямы.' },
  { who: 'desk', text: 'Шлю кого есть. Ждите у столба.' },
]

const { text: clock } = useNightClock()
const root = ref<HTMLElement | null>(null)
const entries = ref<Entry[]>([])
const speaking = ref(-1)
const nameOf = (who: Who) => (who === 'desk' ? 'диспетчер' : 'неизвестный')

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

let dead = false
let skip = false
let started = false
let wake: (() => void) | null = null
let wakeId = 0
let observer: IntersectionObserver | null = null

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    wake = () => {
      window.clearTimeout(wakeId)
      wake = null
      resolve()
    }
    wakeId = window.setTimeout(wake, ms)
  })

const hurry = () => {
  skip = true
  wake?.()
}

const speak = async (line: Entry, index: number) => {
  const row = reactive<Entry>({
    who: line.who,
    text: reduceMotion() ? line.text : '',
    hole: line.hole,
  })
  entries.value.push(row)
  speaking.value = index
  await nextTick()
  if (reduceMotion() || dead) return

  for (let i = 0; i < line.text.length; i++) {
    if (dead) return
    if (skip) {
      row.text = line.text
      skip = false
      break
    }
    row.text = line.text.slice(0, i + 1)
    const slow = line.who === 'unknown'
    await sleep((slow ? 36 : 24) + Math.random() * (line.hole ? 42 : 16))
  }
}

const chew = async (row: Entry, full: string) => {
  const waves = 2 + Math.floor(Math.random() * 2)
  for (let n = 0; n < waves; n++) {
    if (dead || skip) break
    const chars = [...full]
    const hits = 2 + Math.floor(Math.random() * 3)
    for (let h = 0; h < hits; h++) {
      const at = Math.floor(Math.random() * chars.length)
      if (chars[at] !== ' ') chars[at] = '·'
    }
    row.text = chars.join('')
    await sleep(80 + Math.random() * 70)
    if (dead) return
    row.text = full
    await sleep(140 + Math.random() * 200)
  }
  skip = false
}

const PLAYS = 3
const READ_PAUSE = 16000

const run = async () => {
  for (let play = 0; play < PLAYS; play++) {
    if (dead) return
    entries.value = []
    speaking.value = -1
    skip = false
    await sleep(play === 0 ? 420 : 640)
    if (dead) return

    for (let i = 0; i < script.length; i++) {
      if (dead) return
      if (i > 0) await sleep(script[i].who === 'desk' ? 780 : 1080)
      if (dead) return
      skip = false
      await speak(script[i], i)
      if (dead) return
      if (script[i].hole) await chew(entries.value[0], script[i].text)
    }

    speaking.value = -1
    if (play < PLAYS - 1) await sleep(READ_PAUSE)
  }
}

onMounted(() => {
  if (reduceMotion()) {
    entries.value = script.map((line) => ({ ...line }))
    return
  }

  observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry?.isIntersecting || started) return
      started = true
      void run()
    },
    { threshold: 0.32 },
  )
  if (root.value) observer.observe(root.value)
})

onUnmounted(() => {
  dead = true
  wake?.()
  observer?.disconnect()
})
</script>

<template>
  <section id="vyzov" class="call" ref="root">
    <header class="head">
      <h2>вызов</h2>
      <time :datetime="clock">{{ clock }}</time>
    </header>

    <ol class="talk" aria-live="polite" aria-relevant="additions text" @click="hurry">
      <li
        v-for="(entry, i) in entries"
        :key="i"
        :data-who="entry.who"
        :data-live="speaking === i"
      >
        <div class="meta">
          <b>{{ nameOf(entry.who) }}</b>
        </div>
        <p :data-hole="entry.hole">
          {{ entry.text }}<i v-if="speaking === i" class="caret" aria-hidden="true" />
        </p>
      </li>
    </ol>
  </section>
</template>

<style scoped lang="scss">
.call {
  padding: clamp(2.4rem, 6vw, 4rem) 0;
}

.head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 1rem;
  margin-bottom: 1.8rem;
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

.head time {
  color: var(--paper-dim);
  font-size: 0.72rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
}

.talk {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 1.35rem;
  min-height: 18rem;
  cursor: default;
}

li {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  width: min(34rem, 100%);
  padding: 0 0 0 0.9rem;
  border-left: 2px solid var(--dust);
}

li[data-who='desk'] {
  margin-left: auto;
  align-items: flex-end;
  text-align: right;
  padding: 0 0.9rem 0 0;
  border-left: 0;
  border-right: 2px solid var(--paper-dim);
}

li[data-live='true'] {
  border-color: var(--amber);
}

li[data-who='desk'][data-live='true'] {
  border-color: var(--crt);
}

.meta b {
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--dust);
}

li[data-who='desk'] .meta b {
  color: var(--paper);
}

p {
  margin: 0;
  font-size: clamp(1.15rem, 2.2vw, 1.5rem);
  line-height: 1.35;
  color: var(--paper);
}

p[data-hole='true'] {
  color: var(--paper);
  letter-spacing: 0.04em;
}

.caret {
  display: inline-block;
  width: 0.42em;
  height: 0.82em;
  margin-left: 0.08em;
  background: currentColor;
  vertical-align: -0.06em;
  animation: caret 0.72s step-end infinite;
}

@keyframes caret {
  50% {
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .caret {
    animation: none;
  }
}
</style>

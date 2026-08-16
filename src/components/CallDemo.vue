<script setup lang="ts">
import { computed, ref } from 'vue'

const hole = 'нужна в-да  ..еш-тка  трет.. столб'
const clear = 'Нужна вода. Решётка, третий столб после ямы.'
const located = ref(false)
const sent = ref(false)

const line = computed(() => (located.value ? clear : hole))
const status = computed(() => {
  if (sent.value) return 'Фишка пошла. Пин на схеме ещё янтарь — ты уже не успеваешь на всё.'
  if (located.value) return 'Место чуть яснее. Теперь кого слать — и кого оставить глухим.'
  return 'Глушение жрёт место и суть. Не колорит.'
})

const repeat = () => {
  located.value = true
}

const send = () => {
  sent.value = true
  located.value = true
}
</script>

<template>
  <section id="vyzov" class="call">
    <p class="stamp">ВЫЗОВ</p>
    <h2>Слышишь не всё.<br />Решать всё равно надо.</h2>
    <div class="set">
      <div class="radio">
        <div class="meta">
          <span>частота Б · земля</span>
          <span class="air">ON AIR</span>
        </div>
        <p class="line">{{ line }}</p>
        <div class="btns">
          <button type="button" :disabled="located" @click="repeat">Повторите место</button>
          <button type="button" :disabled="sent" @click="send">Шлю кого есть</button>
        </div>
      </div>
      <p class="note">{{ status }}</p>
    </div>
  </section>
</template>

<style scoped lang="scss">
.call {
  padding: clamp(3rem, 8vw, 6rem) 0;
}

.stamp {
  margin: 0 0 0.6rem;
  color: var(--dust);
  letter-spacing: 0.28em;
  font-size: 0.78rem;
}

h2 {
  margin: 0 0 1.8rem;
  font-family: var(--title);
  font-size: clamp(2rem, 5vw, 3.4rem);
  font-weight: 600;
  line-height: 1.05;
  max-width: 16ch;
}

.set {
  display: grid;
  gap: 1.2rem;
  grid-template-columns: minmax(0, 1.3fr) minmax(16rem, 0.8fr);
  align-items: end;
}

.radio {
  border: 1px solid var(--steel);
  background: var(--ink-2);
  padding: 1.2rem 1.3rem 1.3rem;
}

.meta {
  display: flex;
  justify-content: space-between;
  color: var(--paper-dim);
  font-size: 0.78rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.air {
  color: var(--crt);
}

.line {
  min-height: 3.2em;
  margin: 1rem 0 1.2rem;
  font-size: clamp(1.15rem, 2.4vw, 1.55rem);
  line-height: 1.35;
  color: var(--paper);
}

.btns {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

button {
  appearance: none;
  border: 1px solid var(--paper-dim);
  background: transparent;
  color: var(--paper);
  padding: 0.65rem 0.9rem;
  cursor: pointer;
}

button:hover:not(:disabled) {
  border-color: var(--amber);
  color: var(--amber);
}

button:disabled {
  opacity: 0.4;
  cursor: default;
}

.note {
  margin: 0;
  color: var(--paper-dim);
  max-width: 28ch;
}

@media (max-width: 800px) {
  .set {
    grid-template-columns: 1fr;
  }
}
</style>

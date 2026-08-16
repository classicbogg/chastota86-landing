<script setup lang="ts">
const nodes = [
  { id: 'q', name: 'Карьер', hint: 'старт · тепло' },
  { id: 'f', name: 'Вилка', hint: 'пусто или дворы' },
  { id: 't', name: 'Вышка 14', hint: 'живая частота' },
]
</script>

<template>
  <section id="trassa" class="path">
    <p class="stamp">ТРАССА</p>
    <h2>Назад нельзя.<br />Пыль это помнит.</h2>
    <p class="lead">
      Ночь — чётки из развилок. Прямая быстрее и глуше. Объезд — люди, ложь и эфир.
      Как проехал, так и будут говорить на следующей частоте.
    </p>
    <ol class="line">
      <li v-for="(n, i) in nodes" :key="n.id" :data-last="i === nodes.length - 1">
        <i />
        <strong>{{ n.name }}</strong>
        <span>{{ n.hint }}</span>
      </li>
    </ol>
  </section>
</template>

<style scoped lang="scss">
.path {
  padding: clamp(3rem, 8vw, 6rem) 0;
}

.stamp {
  margin: 0 0 0.6rem;
  color: var(--dust);
  letter-spacing: 0.28em;
  font-size: 0.78rem;
}

h2 {
  margin: 0 0 1rem;
  font-family: var(--title);
  font-size: clamp(2rem, 5vw, 3.4rem);
  font-weight: 600;
  line-height: 1.05;
}

.lead {
  max-width: 38rem;
  color: var(--paper-dim);
  margin: 0 0 2.4rem;
}

.line {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  position: relative;
}

.line::before {
  content: '';
  position: absolute;
  left: 8%;
  right: 8%;
  top: 11px;
  height: 1px;
  background: var(--steel);
}

li {
  position: relative;
  padding-top: 2rem;
}

i {
  position: absolute;
  top: 4px;
  left: 0;
  width: 16px;
  height: 16px;
  border: 2px solid var(--dust);
  border-radius: 50%;
  background: var(--ink);
}

li[data-last='true'] i {
  border-color: var(--crt);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--crt) 20%, transparent);
}

strong {
  display: block;
  font-family: var(--title);
  font-size: 1.4rem;
  font-weight: 600;
}

span {
  color: var(--paper-dim);
  font-size: 0.92rem;
}

@media (max-width: 700px) {
  .line {
    grid-template-columns: 1fr;
    gap: 1.4rem;
  }

  .line::before {
    left: 7px;
    right: auto;
    top: 0;
    bottom: 0;
    width: 1px;
    height: auto;
  }
}
</style>

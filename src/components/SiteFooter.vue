<script setup lang="ts">
const repo = 'https://github.com/classicbogg/efir86'
</script>

<template>
  <footer class="foot">
    <div class="plate">
      <div>
        <p class="k">позывной</p>
        <p class="v">Ч86</p>
        <p class="s">ночная смена</p>
      </div>
      <div>
        <p class="k">частота</p>
        <p class="v">27.385</p>
        <p class="s">так слышат на трассе</p>
      </div>
      <div>
        <p class="k">мы</p>
        <p class="v">трое</p>
        <p class="s">делаем эту игру</p>
      </div>
      <div class="end">
        <p class="k">сборка</p>
        <p class="v"><a :href="repo" target="_blank" rel="noreferrer">эфир86</a></p>
        <p class="s">демо на Godot</p>
      </div>
    </div>
  </footer>
</template>

<style scoped lang="scss">
.foot {
  border-top: 1px solid var(--steel);
  background: #0c0e0c;
}

.plate {
  width: var(--page);
  margin: 0 auto;
  padding: 1.4rem clamp(1.1rem, 4vw, 2.4rem) 1.7rem;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1.2rem 1.5rem;
}

.k,
.s {
  margin: 0;
  color: var(--paper-dim);
  font-size: 0.7rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.v {
  margin: 0.2rem 0 0.15rem;
  font-family: var(--title);
  font-size: 1.55rem;
  font-weight: 600;
  line-height: 1;
  letter-spacing: 0.04em;
}

.end a {
  color: inherit;
  text-decoration: none;
}

.end a:hover {
  color: var(--dust);
}

@media (max-width: 800px) {
  .plate {
    grid-template-columns: 1fr 1fr;
  }
}
</style>

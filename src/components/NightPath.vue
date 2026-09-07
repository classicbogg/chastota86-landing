<template>
  <section id="trassa" class="path" aria-labelledby="trassa-title">
    <div class="inner">
      <header class="head">
        <h2 id="trassa-title">трасса</h2>
      </header>
      <div class="about">
        <p>
          Карта не одна на все ночи. Места меняются: другой старт, другие дворы, другая вышка.
          Развилка каждый раз новая.
        </p>
        <p>Едешь только вперёд. Пыль закрывает то, что осталось за спиной.</p>
        <p>
          Прямая короче и глуше. В объезд - чужие окна и чужие голоса.
          Куда ехать - выбираешь сам.
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.path {
  position: relative;
  z-index: 1;
  width: 100%;
  min-height: clamp(22rem, 56vw, 36rem);
  padding: clamp(2.6rem, 6vw, 4.4rem) clamp(1.1rem, 4vw, 2.4rem);
  background:
    linear-gradient(90deg, rgb(12 14 12 / 0.88) 0%, rgb(12 14 12 / 0.55) 42%, rgb(12 14 12 / 0.22) 100%),
    linear-gradient(180deg, rgb(12 14 12 / 0.5) 0%, transparent 40%, rgb(12 14 12 / 0.72) 100%),
    url('/img/trassa.png') center / cover no-repeat;
}

.inner {
  width: var(--page);
  max-width: 100%;
  margin: 0 auto;
}

.head {
  display: flex;
  align-items: baseline;
  border-bottom: 1px solid rgb(138 143 138 / 0.28);
  padding-bottom: 0.85rem;
  margin-bottom: 1.6rem;
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

.about {
  max-width: 36rem;
  display: grid;
  gap: 1rem;
}

.about p {
  margin: 0;
  font-family: var(--hero-voice);
  font-size: clamp(1.05rem, 2vw, 1.25rem);
  line-height: 1.45;
  color: var(--paper);
}
</style>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

defineProps<{ live: boolean }>()

const links = [
  { href: '#efir', label: 'Эфир' },
  { href: '#trassa', label: 'Трасса' },
  { href: '#nakladnaya', label: 'Накладная' },
  { href: '#predzakaz', label: 'Предзаказ' },
]

const SCROLL_THRESHOLD = 16
const MOBILE_NAV_BREAKPOINT = 960

const isScrolled = ref(false)
const menuOpen = ref(false)
const headerShellRef = ref<HTMLElement | null>(null)
let headerResizeObserver: ResizeObserver | null = null

const updateHeaderOffset = () => {
  const shell = headerShellRef.value
  if (!shell) return
  const gap = window.innerWidth <= 720 ? 12 : 16
  const offset = Math.ceil(shell.getBoundingClientRect().bottom + gap)
  document.documentElement.style.setProperty('--site-header-offset', `${offset}px`)
}

const handleScroll = () => {
  isScrolled.value = window.scrollY > SCROLL_THRESHOLD
  requestAnimationFrame(updateHeaderOffset)
}

const setBodyLock = (value: boolean) => {
  document.body.style.overflow = value ? 'hidden' : ''
}

const closeMenu = () => {
  menuOpen.value = false
  setBodyLock(false)
}

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
  setBodyLock(menuOpen.value)
}

const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape') closeMenu()
}

const handleResize = () => {
  if (window.innerWidth > MOBILE_NAV_BREAKPOINT) closeMenu()
  requestAnimationFrame(updateHeaderOffset)
}

onMounted(() => {
  handleScroll()
  if (headerShellRef.value) {
    headerResizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(updateHeaderOffset)
    })
    headerResizeObserver.observe(headerShellRef.value)
  }
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('keydown', handleEscape)
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  headerResizeObserver?.disconnect()
  document.documentElement.style.removeProperty('--site-header-offset')
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('keydown', handleEscape)
  window.removeEventListener('resize', handleResize)
  setBodyLock(false)
})
</script>

<template>
  <header
    class="site-header"
    :class="{
      'site-header--scrolled': isScrolled,
      'site-header--menu-open': menuOpen,
    }"
  >
    <div ref="headerShellRef" class="site-header__wrap">
      <div class="site-header__cluster">
        <div class="site-header__bar">
          <a class="site-header__brand" href="#top" @click="closeMenu">
            <b>Ч86</b>
            <span>ночная смена</span>
          </a>

          <div class="site-header__end">
            <nav class="site-header__nav" aria-label="Главная навигация">
              <a v-for="item in links" :key="item.href" :href="item.href" @click="closeMenu">
                {{ item.label }}
              </a>
            </nav>

            <div class="site-header__tools">
              <button
                class="site-header__burger"
                :class="{ 'site-header__burger--active': menuOpen }"
                type="button"
                aria-label="Открыть меню"
                :aria-expanded="menuOpen"
                @click="toggleMenu"
              >
                <span></span>
                <span></span>
                <span></span>
              </button>
            </div>
          </div>
        </div>

        <div
          class="site-header__ether site-header__ether--detached"
          :data-on="live"
          aria-live="polite"
        >
          <i aria-hidden="true" />
          <em>{{ live ? 'эфир' : 'тишина' }}</em>
        </div>
      </div>
    </div>

    <div
      class="site-header__mobile"
      :class="{ 'site-header__mobile--active': menuOpen }"
      @click.self="closeMenu"
    >
      <div class="site-header__mobile-panel">
        <div class="site-header__mobile-head">
          <span>меню</span>
          <button type="button" aria-label="Закрыть меню" @click="closeMenu">закрыть</button>
        </div>

        <nav class="site-header__mobile-nav" aria-label="Мобильная навигация">
          <a v-for="item in links" :key="item.href" :href="item.href" @click="closeMenu">
            {{ item.label }}
          </a>
        </nav>

        <div class="site-header__mobile-bottom">
          <span>27.385 - так слышат на трассе</span>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped lang="scss">
.site-header {
  position: fixed;
  z-index: 1000;
  top: 0;
  left: 0;
  width: 100%;
  pointer-events: none;
}

.site-header__wrap {
  width: 100%;
  max-width: var(--page);
  margin: 0 auto;
  padding: 12px clamp(14px, 2.8vw, 28px) 0;
  pointer-events: auto;
  transition: padding 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.site-header__cluster {
  display: flex;
  align-items: stretch;
  gap: clamp(8px, 1.1vw, 12px);
}

.site-header__bar {
  flex: 1;
  min-width: 0;
  min-height: 72px;
  padding: 0 clamp(16px, 2.8vw, 36px);
  display: flex;
  align-items: center;
  gap: clamp(10px, 1.8vw, 24px);
  background: var(--header-bar-solid);
  border: 1px solid var(--header-glass-border);
  border-radius: 0 0 0 20px;
  box-shadow: 0 8px 32px rgb(0 0 0 / 0.18);
  transition:
    background 0.35s ease,
    border-color 0.35s ease,
    box-shadow 0.35s ease,
    backdrop-filter 0.35s ease;
}

.site-header--scrolled .site-header__bar,
.site-header--scrolled .site-header__ether--detached {
  background: var(--header-glass-bg);
  border-color: var(--header-glass-border);
  box-shadow: var(--header-glass-shadow);
  backdrop-filter: blur(16px);
}

.site-header__brand {
  flex-shrink: 0;
  display: flex;
  align-items: baseline;
  gap: 0.7rem;
  text-decoration: none;
  color: var(--header-nav-link);
}

.site-header__brand b {
  font-family: var(--title);
  font-size: clamp(1.4rem, 2.4vw, 1.85rem);
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--paper);
}

.site-header__brand span {
  color: var(--paper-dim);
  font-size: 0.72rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.site-header__end {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(12px, 1.8vw, 24px);
}

.site-header__nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(22px, 3vw, 48px);
}

.site-header__nav a {
  color: var(--header-nav-link);
  text-decoration: none;
  font-size: clamp(0.92rem, 1.15vw, 1.1rem);
  font-weight: 600;
  letter-spacing: 0.04em;
  white-space: nowrap;
  transition: color 0.2s ease, transform 0.2s ease;
}

.site-header__nav a:hover,
.site-header__brand:hover {
  color: var(--header-nav-link-hover);
}

.site-header__nav a:hover {
  transform: translateY(-1px);
}

.site-header__tools {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.site-header__ether {
  flex-shrink: 0;
  width: 86px;
  min-height: 72px;
  padding: 0.4rem 0.5rem;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  border: 1px solid var(--header-glass-border);
  border-radius: 0 0 20px 0;
  background: var(--header-bar-solid);
  color: var(--header-nav-link);
  cursor: default;
  transition:
    background 0.35s ease,
    border-color 0.35s ease,
    color 0.2s ease;
}

.site-header__ether i {
  width: 0.55rem;
  height: 0.55rem;
  border-radius: 50%;
  background: var(--steel);
}

.site-header__ether em {
  font-style: normal;
  font-size: 0.62rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.site-header__ether[data-on='true'] {
  color: var(--crt);
  border-color: rgb(124 255 178 / 0.35);
}

.site-header__ether[data-on='true'] i {
  background: var(--crt);
  box-shadow: 0 0 0.55rem var(--crt);
}

.site-header__burger {
  display: none;
  position: relative;
  width: 56px;
  height: 56px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
}

.site-header__burger span {
  position: absolute;
  left: 50%;
  width: 26px;
  height: 2.5px;
  margin-left: -13px;
  background: var(--header-nav-link);
  transition: transform 0.24s ease, opacity 0.2s ease, top 0.24s ease;
}

.site-header__burger span:nth-child(1) {
  top: 17px;
}

.site-header__burger span:nth-child(2) {
  top: 26.5px;
}

.site-header__burger span:nth-child(3) {
  top: 36px;
}

.site-header__burger--active span:nth-child(1) {
  top: 26.5px;
  transform: rotate(45deg);
}

.site-header__burger--active span:nth-child(2) {
  opacity: 0;
}

.site-header__burger--active span:nth-child(3) {
  top: 26.5px;
  transform: rotate(-45deg);
}

.site-header__mobile {
  position: fixed;
  inset: 0;
  z-index: 999;
  background: transparent;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transition: opacity 0.25s ease, visibility 0.25s ease;
}

.site-header__mobile--active {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
  background: var(--header-mobile-overlay);
}

.site-header__mobile-panel {
  position: absolute;
  top: 0;
  right: 0;
  width: min(400px, 92vw);
  height: 100%;
  padding: 24px 20px;
  background: var(--header-mobile-panel);
  border-left: 1px solid var(--header-glass-border);
  transform: translateX(110%);
  transition: transform 0.32s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  flex-direction: column;
}

.site-header__mobile--active .site-header__mobile-panel {
  transform: translateX(0);
}

.site-header__mobile-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgb(196 165 116 / 0.22);
}

.site-header__mobile-head span {
  font-family: var(--title);
  font-size: 1.7rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--header-nav-link);
}

.site-header__mobile-head button {
  min-height: 36px;
  padding: 0 14px;
  border: 1px solid var(--steel);
  background: transparent;
  color: var(--header-nav-link);
  font-size: 0.78rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  cursor: pointer;
}

.site-header__mobile-nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 24px 0;
}

.site-header__mobile-nav a {
  padding: 16px 18px;
  border: 1px solid rgb(138 143 138 / 0.28);
  background: var(--ink-2);
  color: var(--header-nav-link);
  text-decoration: none;
  font-family: var(--title);
  font-size: clamp(1.4rem, 5vw, 1.75rem);
  font-weight: 600;
}

.site-header__mobile-nav a:hover {
  border-color: var(--dust);
  color: var(--dust);
}

.site-header__mobile-bottom {
  margin-top: auto;
  padding-top: 20px;
  border-top: 1px solid rgb(196 165 116 / 0.22);
  color: var(--paper-dim);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-size: 0.78rem;
}

@media (max-width: 960px) {
  .site-header__nav {
    display: none;
  }

  .site-header__burger {
    display: block;
  }

  .site-header__end {
    flex: 0 0 auto;
    justify-content: flex-end;
  }

  .site-header__bar {
    justify-content: space-between;
  }
}

@media (max-width: 640px) {
  .site-header__wrap {
    padding: 8px 10px 0;
    padding-top: max(8px, env(safe-area-inset-top, 0px));
  }

  .site-header__bar {
    min-height: 64px;
    padding-inline: 14px;
    border-radius: 0 0 0 16px;
  }

  .site-header__brand span {
    display: none;
  }

  .site-header__ether {
    width: 64px;
    min-height: 64px;
    border-radius: 0 0 16px 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .site-header__bar,
  .site-header__ether,
  .site-header__wrap,
  .site-header__mobile,
  .site-header__mobile-panel {
    transition-duration: 0.01ms;
  }
}
</style>

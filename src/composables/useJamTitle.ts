import { onUnmounted, watch, type Ref } from 'vue'
import gsap from 'gsap'

export function useJamTitle(root: Ref<HTMLElement | null>, live: Ref<boolean>) {
  let ctx: gsap.Context | null = null
  let next: gsap.core.Tween | null = null
  let running = false

  const clearNext = () => {
    next?.kill()
    next = null
  }

  const burst = (el: HTMLElement) => {
    const crt = el.querySelectorAll<HTMLElement>('.hero__ghost--crt')
    const dust = el.querySelectorAll<HTMLElement>('.hero__ghost--dust')
    const face = el.querySelectorAll<HTMLElement>('.hero__face')
    if (!crt.length) return

    const x = gsap.utils.random(-14, 14)
    const y = gsap.utils.random(-4, 4)
    const top = gsap.utils.random(0, 60)
    const bot = gsap.utils.random(8, 48)
    const kind = gsap.utils.random(['crt', 'dust', 'both', 'tear', 'drop'] as const)
    const hot = live.value

    const tl = gsap.timeline()

    if (kind === 'crt' || kind === 'both') {
      tl.set(crt, {
        x,
        y,
        opacity: hot ? 0.9 : 0.5,
        clipPath: `inset(${top}% 0 ${bot}% 0)`,
      }, 0)
      tl.to(crt, { opacity: hot ? 0.16 : 0, x: hot ? 2 : 0, duration: 0.14, ease: 'none' }, 0.05)
    }

    if (kind === 'dust' || kind === 'both') {
      tl.set(dust, {
        x: -x * 0.8,
        opacity: 0.45,
        clipPath: `inset(${bot}% 0 ${top}% 0)`,
      }, 0)
      tl.to(dust, { opacity: 0, x: 0, duration: 0.18, ease: 'none' }, 0.04)
    }

    if (kind === 'tear') {
      tl.to(face, { x: x * 0.35, duration: 0.04, ease: 'none' }, 0)
      tl.to(face, { x: 0, duration: 0.14, ease: 'power1.out' }, 0.05)
    }

    if (kind === 'drop') {
      tl.to(face, { opacity: 0.35, filter: 'blur(0.6px)', duration: 0.05, ease: 'none' }, 0)
      tl.to(face, { opacity: 1, filter: 'blur(0px)', duration: 0.16 }, 0.06)
    }
  }

  const schedule = (el: HTMLElement) => {
    clearNext()
    if (!running) return
    const wait = live.value ? gsap.utils.random(0.18, 1.15) : gsap.utils.random(1.1, 3.2)
    next = gsap.delayedCall(wait, () => {
      burst(el)
      schedule(el)
    })
  }

  const start = () => {
    const el = root.value
    if (!el || running) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    running = true
    ctx = gsap.context(() => {
      gsap.set(el.querySelectorAll('.hero__ghost--crt'), {
        opacity: live.value ? 0.16 : 0,
        x: live.value ? 2 : 0,
      })
      gsap.to(el.querySelectorAll('.hero__ghost--crt'), {
        x: live.value ? 3.5 : 0,
        duration: 2.2,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
      })
      schedule(el)
    }, el)
  }

  const stop = () => {
    running = false
    clearNext()
    ctx?.revert()
    ctx = null
  }

  watch(live, (value) => {
    const el = root.value
    if (!el || !running) return
    gsap.to(el.querySelectorAll('.hero__ghost--crt'), {
      opacity: value ? 0.16 : 0,
      x: value ? 2 : 0,
      duration: 0.35,
      overwrite: 'auto',
    })
    schedule(el)
  })

  onUnmounted(stop)

  return { start, stop }
}

import { onMounted, ref } from 'vue'

/** Visual “эфир” only - no audio. Turns on by itself for a lighter first visit. */
export function useEther() {
  const on = ref(false)

  onMounted(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      on.value = true
      return
    }
    window.setTimeout(() => {
      on.value = true
    }, 900)
  })

  return { on }
}

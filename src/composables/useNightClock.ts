import { onMounted, onUnmounted, ref } from 'vue'

export function useNightClock() {
  const text = ref('--:--:--')
  let id = 0

  const tick = () => {
    text.value = new Date().toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })
  }

  onMounted(() => {
    tick()
    id = window.setInterval(tick, 1000)
  })

  onUnmounted(() => window.clearInterval(id))

  return { text }
}

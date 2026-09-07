<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const props = defineProps<{ live?: boolean }>()

const canvas = ref<HTMLCanvasElement | null>(null)
let raf = 0

const draw = (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => {
  ctx.clearRect(0, 0, w, h)
  const live = Boolean(props.live)
  ctx.strokeStyle = live ? '#7cffb2' : '#2a6a48'
  ctx.lineWidth = 1.6
  ctx.beginPath()
  const mid = h / 2
  for (let x = 0; x < w; x++) {
    const n = x / w
    const amp = live ? 0.32 * h : 0.08 * h
    const y =
      mid +
      Math.sin(n * 18 + t * 0.008) * amp * 0.55 +
      Math.sin(n * 41 + t * 0.013) * amp * 0.25 +
      (Math.sin(n * 90 + t * 0.04) > 0.92 ? amp * 0.35 : 0)
    if (x === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.stroke()
}

onMounted(() => {
  const el = canvas.value
  if (!el) return
  const ctx = el.getContext('2d')
  if (!ctx) return
  const loop = (t: number) => {
    const dpr = window.devicePixelRatio || 1
    const w = el.clientWidth
    const h = el.clientHeight
    if (el.width !== w * dpr) {
      el.width = w * dpr
      el.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    draw(ctx, w, h, t)
    raf = requestAnimationFrame(loop)
  }
  raf = requestAnimationFrame(loop)
})

onUnmounted(() => cancelAnimationFrame(raf))
</script>

<template>
  <canvas ref="canvas" class="wave" aria-hidden="true" />
</template>

<style scoped lang="scss">
.wave {
  display: block;
  width: 100%;
  height: 100%;
}
</style>

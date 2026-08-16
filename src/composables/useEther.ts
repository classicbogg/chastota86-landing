import { onUnmounted, ref } from 'vue'

export function useEther() {
  const on = ref(false)
  let ctx: AudioContext | null = null
  let gain: GainNode | null = null

  const start = async () => {
    if (on.value) return
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    ctx = new AC()
    await ctx.resume()
    gain = ctx.createGain()
    gain.gain.value = 0.0
    gain.connect(ctx.destination)

    const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.35
    const noise = ctx.createBufferSource()
    noise.buffer = buffer
    noise.loop = true
    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = 980
    filter.Q.value = 0.7
    noise.connect(filter)
    filter.connect(gain)

    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = 72
    const oscGain = ctx.createGain()
    oscGain.gain.value = 0.04
    osc.connect(oscGain)
    oscGain.connect(gain)

    noise.start()
    osc.start()
    gain.gain.linearRampToValueAtTime(0.22, ctx.currentTime + 0.8)
    on.value = true
  }

  const stop = () => {
    if (!ctx || !gain) return
    const now = ctx.currentTime
    gain.gain.cancelScheduledValues(now)
    gain.gain.linearRampToValueAtTime(0, now + 0.3)
    window.setTimeout(() => {
      void ctx?.close()
      ctx = null
      gain = null
      on.value = false
    }, 340)
  }

  const toggle = () => {
    if (on.value) stop()
    else void start()
  }

  onUnmounted(stop)
  return { on, toggle }
}

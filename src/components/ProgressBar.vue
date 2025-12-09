<template>
  <div class="progress-bar" :class="barClass">
    <div class="fill" :style="{ width: `${percentage}%` }"></div>
    <span class="text">{{ text }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  percentage: number
  text: string
  type?: 'hp' | 'mp' | 'exp'
}

const props = withDefaults(defineProps<Props>(), {
  type: 'hp',
})

const barClass = computed(() => {
  return {
    'hp-bar': props.type === 'hp',
    'mp-bar': props.type === 'mp',
    'exp-bar': props.type === 'exp',
  }
})
</script>

<style scoped>
.progress-bar {
  position: relative;
  width: 100%;
  height: 24px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid #333;
  border-radius: 4px;
  overflow: hidden;
}

.fill {
  height: 100%;
  transition: width 0.3s ease;
}

.hp-bar .fill {
  background: linear-gradient(90deg, #ff6b6b, #ff8787);
}

.mp-bar .fill {
  background: linear-gradient(90deg, #6b8eff, #8ba3ff);
}

.exp-bar .fill {
  background: linear-gradient(90deg, #ffd93d, #ffed4e);
}

.text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 12px;
  font-weight: bold;
  color: #fff;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
  z-index: 1;
}
</style>


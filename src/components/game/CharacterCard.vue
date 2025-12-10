<template>
  <div class="char-card" v-if="gameStore.currentRole">
    <div class="char-header">
      <div class="char-avatar">
        <img :src="avatarImage" :alt="gameStore.currentRole.role_name" />
      </div>
      <div class="char-basic">
        <h3>{{ gameStore.currentRole.role_name }}</h3>
        <div class="badges">
          <span class="badge">{{ gameStore.currentRole.role_class }}</span>
          <span class="badge">Lv.{{ gameStore.currentRole.level }}</span>
        </div>
      </div>
    </div>

    <div class="status-bars">
      <div class="bar-group">
        <label>HP</label>
        <ProgressBar
          :percentage="gameStore.hpPercentage"
          :text="`${Math.floor(gameStore.currentRole.hp)}/${gameStore.maxHp}`"
          type="hp"
        />
      </div>
      <div class="bar-group">
        <label>MP</label>
        <ProgressBar
          :percentage="gameStore.mpPercentage"
          :text="`${Math.floor(gameStore.currentRole.mp)}/${gameStore.maxMp}`"
          type="mp"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '@/stores/game'
import ProgressBar from '@/components/ProgressBar.vue'

const gameStore = useGameStore()

const avatarImage = computed(() => {
  if (!gameStore.currentRole) return '/static/img/Default.png'
  const gender = gameStore.currentRole.role_gender
  const roleClass = gameStore.currentRole.role_class
  const genderMap: Record<string, string> = { '男': 'Male', '女': 'Female' }
  const classMap: Record<string, string> = { '战士': 'Warrior', '法师': 'Mage', '道士': 'Taos' }
  const g = genderMap[gender] || 'Male'
  const c = classMap[roleClass] || 'Warrior'
  return `/static/img/${g}${c}Head.jpg`
})
</script>

<style scoped>
.char-card {
  background: var(--bg-panel);
  border: 1px solid #333;
  border-radius: 8px;
  padding: 20px;
}

.char-header {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.char-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid var(--accent-gold-dim);
}

.char-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.char-basic h3 {
  margin: 0 0 10px 0;
  color: var(--accent-gold);
  font-size: 18px;
}

.badges {
  display: flex;
  gap: 5px;
}

.badge {
  padding: 4px 8px;
  background: rgba(197, 160, 89, 0.2);
  border: 1px solid var(--accent-gold-dim);
  border-radius: 4px;
  font-size: 12px;
  color: var(--accent-gold);
}

.status-bars {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.bar-group label {
  display: block;
  font-size: 12px;
  color: #aaa;
  margin-bottom: 5px;
}
</style>
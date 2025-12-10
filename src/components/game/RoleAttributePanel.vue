<template>
  <div class="role-attribute-panel-overlay" @click="$emit('close')">
    <div class="role-attribute-content" @click.stop v-if="gameStore.currentRole">
      <button class="btn-close" @click="$emit('close')">×</button>
      <h2>📝 角色属性</h2>

      <div class="attribute-grid-container">
        <div class="attr-section">
          <h3>基础信息</h3>
          <div class="attr-row"><span class="attr-label">姓名:</span><span class="attr-value">{{ gameStore.currentRole.role_name }}</span></div>
          <div class="attr-row"><span class="attr-label">职业:</span><span class="attr-value">{{ gameStore.currentRole.role_class }}</span></div>
          <div class="attr-row"><span class="attr-label">等级:</span><span class="attr-value">{{ gameStore.currentRole.level }}</span></div>
          <div class="attr-row">
            <span class="attr-label">经验:</span>
            <span class="attr-value">{{ gameStore.currentExp }} / {{ gameStore.maxExp }}</span>
          </div>
        </div>

        <div class="attr-section">
          <h3>状态 (Vitals)</h3>
          <div class="attr-row">
            <span class="attr-label">HP (生命):</span>
            <span class="attr-value" style="color: #ff6b6b;">{{ Math.floor(gameStore.currentRole.hp) }} / {{ gameStore.maxHp }}</span>
          </div>
          <div class="attr-row">
            <span class="attr-label">MP (魔法):</span>
            <span class="attr-value" style="color: #6b8eff;">{{ Math.floor(gameStore.currentRole.mp) }} / {{ gameStore.maxMp }}</span>
          </div>
        </div>

        <div class="attr-section">
          <h3>战斗属性 (Stats)</h3>
          <div class="attr-row">
            <span class="attr-label">物理攻击 (DC):</span>
            <span class="attr-value">{{ gameStore.currentRole._temp_dc_min }}-{{ gameStore.currentRole._temp_dc_max }}</span>
          </div>
          <div class="attr-row">
            <span class="attr-label">魔法攻击 (MC):</span>
            <span class="attr-value">{{ gameStore.currentRole._temp_mc_min }}-{{ gameStore.currentRole._temp_mc_max }}</span>
          </div>
          <div class="attr-row">
            <span class="attr-label">道术攻击 (SC):</span>
            <span class="attr-value">{{ gameStore.currentRole._temp_sc_min }}-{{ gameStore.currentRole._temp_sc_max }}</span>
          </div>
          <div class="attr-row">
            <span class="attr-label">物理防御 (AC):</span>
            <span class="attr-value">{{ gameStore.currentRole._temp_ac_min }}-{{ gameStore.currentRole._temp_ac_max }}</span>
          </div>
          <div class="attr-row">
            <span class="attr-label">魔法防御 (MAC):</span>
            <span class="attr-value">{{ gameStore.currentRole._temp_mac_min }}-{{ gameStore.currentRole._temp_mac_max }}</span>
          </div>
        </div>

        <div class="attr-section">
          <h3>财富</h3>
          <div class="attr-row"><span class="attr-label">金币:</span><span class="attr-value gold">{{ gameStore.currentRole.gold }}</span></div>
          <div class="attr-row"><span class="attr-label">钻石:</span><span class="attr-value diamond">{{ gameStore.currentRole.diamond }}</span></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from '@/stores/game'
defineEmits<{ close: [] }>()
const gameStore = useGameStore()
</script>

<style scoped>
.role-attribute-panel-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.8); display: flex; align-items: center; justify-content: center; z-index: 1000;
}
.role-attribute-content {
  position: relative; background: var(--bg-panel); border: 2px solid var(--accent-gold);
  border-radius: 8px; padding: 30px; width: 600px; max-height: 90vh; overflow-y: auto;
}
.btn-close {
  position: absolute; top: 10px; right: 15px; background: none; border: none;
  color: #aaa; font-size: 24px; cursor: pointer;
}
.btn-close:hover { color: var(--accent-red); }
.role-attribute-content h2 { color: var(--accent-gold); margin-bottom: 20px; text-align: center; }
.attribute-grid-container { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
.attr-section { background: rgba(0, 0, 0, 0.3); padding: 15px; border-radius: 4px; border: 1px solid #333; }
.attr-section h3 { color: var(--accent-gold); margin: 0 0 10px 0; font-size: 14px; border-bottom: 1px solid #333; padding-bottom: 5px; }
.attr-row { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05); }
.attr-value { color: #fff; font-weight: bold; }
.gold { color: #ffd700; }
.diamond { color: #b9f2ff; }
</style>
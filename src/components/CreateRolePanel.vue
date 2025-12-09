<template>
  <div class="create-role-panel-overlay" @click="$emit('close')">
    <div class="create-role-content" @click.stop>
      <button class="btn-close" @click="$emit('close')">×</button>

      <div class="create-left">
        <h2>✍️ 创建新英雄</h2>

        <div class="input-group">
          <input
            v-model="roleName"
            type="text"
            placeholder="输入角色名"
            maxlength="20"
          />
        </div>

        <div class="radio-group">
          <label class="radio-label">职业 CLASS</label>
          <div class="radio-options">
            <label
              v-for="cls in classes"
              :key="cls"
              class="radio-option"
              :class="{ checked: selectedClass === cls }"
              @click="selectedClass = cls"
            >
              <input type="radio" :value="cls" v-model="selectedClass" />
              {{ getClassIcon(cls) }} {{ cls }}
            </label>
          </div>
        </div>

        <div class="radio-group">
          <label class="radio-label">性别 GENDER</label>
          <div class="radio-options">
            <label
              v-for="gender in genders"
              :key="gender"
              class="radio-option"
              :class="{ checked: selectedGender === gender }"
              @click="selectedGender = gender"
            >
              <input type="radio" :value="gender" v-model="selectedGender" />
              {{ getGenderIcon(gender) }} {{ gender }}
            </label>
          </div>
        </div>

        <div class="button-group">
          <button class="btn" @click="handleConfirm" :disabled="!canCreate">
            确认创建
          </button>
          <button class="btn btn-danger" @click="$emit('close')">取消</button>
        </div>
      </div>

      <div class="create-right">
        <img :src="previewImage" :alt="previewText" class="preview-img" />
        <div class="preview-overlay"></div>
        <h3 class="preview-text">{{ previewText }}</h3>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { socketService } from '@/services/socket'
import { useGameStore } from '@/stores/game'

interface Props {
  slotIndex: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  created: []
}>()

const gameStore = useGameStore()

const roleName = ref('')
const selectedClass = ref('战士')
const selectedGender = ref('男')

const classes = ['战士', '法师', '道士']
const genders = ['男', '女']

const canCreate = computed(() => {
  return roleName.value.trim().length >= 2 && roleName.value.trim().length <= 20
})

const previewText = computed(() => {
  return `${selectedGender.value} ${selectedClass.value}`
})

const previewImage = computed(() => {
  return getRoleImagePath(selectedGender.value, selectedClass.value)
})

function getClassIcon(cls: string): string {
  const icons: Record<string, string> = {
    战士: '🗡️',
    法师: '🔥',
    道士: '☯️',
  }
  return icons[cls] || '🗡️'
}

function getGenderIcon(gender: string): string {
  return gender === '男' ? '♂️' : '♀️'
}

function getRoleImagePath(gender: string, roleClass: string): string {
  const genderMap: Record<string, string> = { '男': 'Male', '女': 'Female' }
  const classMap: Record<string, string> = { '战士': 'Warrior', '法师': 'Mage', '道士': 'Taos' }
  
  const g = genderMap[gender] || 'Male'
  const c = classMap[roleClass] || 'Warrior'
  
  return `/static/img/${g}${c}.jpg`
}

function handleConfirm() {
  if (!canCreate.value) return

  if (!socketService.connected) {
    alert('未连接到服务器，请稍候再试')
    return
  }

  socketService.emit('rolecontrol', {
    type: 'createRole',
    createRole: {
      eRoleName: roleName.value.trim(),
      eRoleClass: selectedClass.value,
      eRoleGender: selectedGender.value,
    },
  })
  
  // 响应会在父组件的 handleRoleControlResponse 中处理
  // 这里只需要等待父组件通知创建成功
}
</script>

<style scoped>
.create-role-panel-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.create-role-content {
  position: relative;
  display: flex;
  width: 800px;
  max-width: 90vw;
  height: 600px;
  background: var(--bg-panel);
  border: 2px solid var(--accent-gold);
  border-radius: 8px;
  overflow: hidden;
}

.btn-close {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 40px;
  height: 40px;
  background: rgba(138, 28, 28, 0.8);
  border: none;
  color: #fff;
  border-radius: 50%;
  cursor: pointer;
  font-size: 24px;
  z-index: 10;
  transition: all 0.2s;
}

.btn-close:hover {
  background: #8a1c1c;
  transform: scale(1.1);
}

.create-left {
  flex: 1;
  padding: 40px;
  display: flex;
  flex-direction: column;
}

.create-left h2 {
  color: var(--accent-gold);
  margin-bottom: 30px;
}

.input-group {
  margin-bottom: 25px;
}

.input-group input {
  width: 100%;
  padding: 12px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid #333;
  border-radius: 4px;
  color: #fff;
  font-size: 16px;
  box-sizing: border-box;
}

.input-group input:focus {
  outline: none;
  border-color: var(--accent-gold);
}

.radio-group {
  margin-bottom: 30px;
}

.radio-label {
  display: block;
  color: #888;
  margin-bottom: 10px;
  font-size: 14px;
}

.radio-options {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.radio-option {
  flex: 1;
  padding: 12px;
  background: rgba(0, 0, 0, 0.3);
  border: 2px solid #333;
  border-radius: 4px;
  cursor: pointer;
  text-align: center;
  transition: all 0.2s;
  color: #aaa;
}

.radio-option.checked {
  border-color: var(--accent-gold);
  background: rgba(255, 215, 0, 0.1);
  color: var(--accent-gold);
}

.radio-option input {
  display: none;
}

.button-group {
  display: flex;
  gap: 15px;
  margin-top: auto;
}

.btn {
  flex: 1;
  padding: 12px;
  background: var(--accent-gold-dim);
  border: none;
  color: #000;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s;
}

.btn:hover:not(:disabled) {
  background: var(--accent-gold);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-danger {
  background: rgba(138, 28, 28, 0.8);
  color: #fff;
}

.btn-danger:hover {
  background: #8a1c1c;
}

.create-right {
  position: relative;
  width: 400px;
  overflow: hidden;
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 120px;
  background: linear-gradient(to top, #000, transparent);
}

.preview-text {
  position: absolute;
  bottom: 20px;
  left: 0;
  right: 0;
  text-align: center;
  color: var(--accent-gold);
  margin: 0;
  text-shadow: 0 2px 4px black;
  font-size: 20px;
}
</style>


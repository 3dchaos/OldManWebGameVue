<template>
  <div class="role-card" :class="{ 'has-role': hasRole, 'no-role': !hasRole }" @click="handleClick">
    <img v-if="hasRole" :src="roleImage" :alt="role?.role_name" class="role-card-img" />
    <img v-else :src="defaultImage" alt="Default" class="role-card-img" />

    <div v-if="hasRole" class="have-role">
      <h2>{{ role?.role_name }}</h2>
      <p>Lv.{{ role?.level }} | {{ role?.role_class }}</p>
      <button class="btn-delete" @click.stop="handleDelete">🗑️ 删除角色</button>
    </div>

    <div v-else class="no-role">
      <div class="no-role-plus">+</div>
      <button class="btn" @click.stop="handleCreate">创建角色</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Role } from '@/stores/game'

interface Props {
  role?: Role | null
  slotIndex: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  select: [roleId: number]
  create: [slotIndex: number]
  delete: [roleId: number]
}>()

const hasRole = computed(() => !!props.role)

const defaultImage = '/static/img/Default.png'

const roleImage = computed(() => {
  if (!props.role) return defaultImage
  return getRoleImagePath(props.role.role_gender, props.role.role_class)
})

function getRoleImagePath(gender: string, roleClass: string): string {
  const genderMap: Record<string, string> = { '男': 'Male', '女': 'Female' }
  const classMap: Record<string, string> = { '战士': 'Warrior', '法师': 'Mage', '道士': 'Taos' }
  
  const g = genderMap[gender] || 'Male'
  const c = classMap[roleClass] || 'Warrior'
  
  return `/static/img/${g}${c}.jpg`
}

function handleClick() {
  if (props.role) {
    emit('select', props.role.role_id)
  }
}

function handleCreate() {
  emit('create', props.slotIndex)
}

function handleDelete() {
  if (props.role) {
    emit('delete', props.role.role_id)
  }
}
</script>

<style scoped>
.role-card {
  position: relative;
  width: 280px;
  height: 400px;
  background: var(--bg-panel);
  border: 2px solid var(--accent-gold-dim);
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
}

.role-card:hover {
  border-color: var(--accent-gold);
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
  transform: translateY(-5px);
}

.role-card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.have-role,
.no-role {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.9), transparent);
  color: #fff;
}

.have-role h2 {
  margin: 0 0 5px 0;
  color: var(--accent-gold);
  font-size: 20px;
}

.have-role p {
  margin: 0 0 15px 0;
  color: #aaa;
  font-size: 14px;
}

.btn-delete {
  width: 100%;
  padding: 8px;
  background: rgba(138, 28, 28, 0.8);
  border: 1px solid #8a1c1c;
  color: #fff;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-delete:hover {
  background: #8a1c1c;
}

.no-role {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
}

.no-role-plus {
  font-size: 80px;
  color: var(--accent-gold-dim);
  margin-bottom: 20px;
}

.no-role .btn {
  padding: 12px 24px;
  background: var(--accent-gold-dim);
  border: none;
  color: #000;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s;
}

.no-role .btn:hover {
  background: var(--accent-gold);
}
</style>


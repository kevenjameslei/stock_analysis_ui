<template>
  <div class="time-scale">
    <button
      v-for="scale in scales"
      :key="scale.value"
      :class="['scale-btn', { active: modelValue === scale.value }]"
      @click="handleScaleChange(scale.value)"
    >
      {{ scale.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps({
  modelValue: {
    type: String,
    default: '1d',
  },
})

const emit = defineEmits(['update:modelValue'])

const scales = [
  { label: '1分', value: '1m' },
  { label: '5分', value: '5m' },
  { label: '15分', value: '15m' },
  { label: '30分', value: '30m' },
  { label: '1小时', value: '1h' },
  { label: '日线', value: '1d' },
  { label: '周线', value: '1w' },
]

const handleScaleChange = (scale) => {
  emit('update:modelValue', scale)
}
</script>

<style scoped lang="scss">
@use '@/assets/styles/_variables.scss' as *;

.time-scale {
  display: flex;
  gap: 4px;
  padding: 4px;
  background: $tiger-bg-dark;
  border-radius: 4px;
  border: 1px solid $tiger-border;

  .scale-btn {
    padding: 4px 10px;
    min-width: 50px;
    border: none;
    border-radius: 3px;
    background: $tiger-bg-input;
    color: $tiger-text-secondary;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: rgba($tiger-primary, 0.1);
      color: $tiger-primary;
    }

    &.active {
      background: $tiger-primary;
      color: white;
      box-shadow: 0 2px 4px rgba($tiger-primary, 0.2);
    }

    &:first-child {
      border-radius: 3px 0 0 3px;
    }
    &:last-child {
      border-radius: 0 3px 3px 0;
    }
  }

  @media (max-width: 768px) {
    flex-wrap: wrap;
    gap: 2px;

    .scale-btn {
      flex: 1 0 calc(25% - 2px);
      min-width: auto;
      padding: 4px 6px;
      font-size: 11px;
    }
  }
}
</style>

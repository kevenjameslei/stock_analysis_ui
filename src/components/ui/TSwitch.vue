<template>
  <label class="tswitch" :aria-checked="modelValue" role="switch">
    <input type="checkbox" class="tswitch__input" v-model="localValue" />
    <span class="tswitch__slider"></span>
    <slot />
  </label>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const localValue = ref(props.modelValue ?? false)

// 本地变更 -> 父组件
watch(localValue, (val) => emit('update:modelValue', val))

// 父组件变更 -> 本地
watch(
  () => props.modelValue,
  (val) => {
    if (val !== localValue.value) {
      localValue.value = val
    }
  },
)
</script>

<style scoped>
.tswitch {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  position: relative;
  width: 44px;
  height: 24px;
}

.tswitch__input {
  opacity: 0;
  width: 0;
  height: 0;
  position: absolute;
}

.tswitch__slider {
  position: absolute;
  top: 2px;
  left: 2px;
  right: 2px;
  bottom: 2px;
  background-color: #ccc;
  border-radius: 999px;
  transition: background-color 0.3s;
}

.tswitch__slider::before {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  left: 2px;
  bottom: 2px;
  background-color: #fff;
  border-radius: 50%;
  transition: transform 0.3s;
}

/* 选中状态 */
.tswitch__input:checked + .tswitch__slider {
  background-color: #42b983;
}

.tswitch__input:checked + .tswitch__slider::before {
  transform: translateX(20px);
}
</style>

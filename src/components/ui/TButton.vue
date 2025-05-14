<template>
  <button
    :class="[
      't-button',
      `t-button--${type}`,
      `t-button--${size}`,
      {
        'is-loading': loading,
        'is-disabled': disabled,
        'is-block': block,
      },
    ]"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <span class="t-button__content">
      <i v-if="icon && !loading" :class="['t-icon', icon]"></i>
      <i v-if="loading" class="t-icon-loading"></i>
      <slot></slot>
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: 'primary', // primary | secondary | text | danger
    validator: (val) => ['primary', 'secondary', 'text', 'danger'].includes(val),
  },
  size: {
    type: String,
    default: 'medium', // small | medium | large
    validator: (val) => ['small', 'medium', 'large'].includes(val),
  },
  icon: String,
  loading: Boolean,
  disabled: Boolean,
  block: Boolean,
})

const emit = defineEmits(['click'])

const handleClick = (e) => {
  if (!props.disabled && !props.loading) {
    emit('click', e)
  }
}

const iconSize = computed(() => {
  return {
    small: '14px',
    medium: '16px',
    large: '18px',
  }[props.size]
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/_variables.scss' as *;

.t-button {
  $self: &;
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  border-radius: 4px;
  font-family: inherit;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
  white-space: nowrap;

  // 尺寸
  &--small {
    height: 28px;
    padding: 0 12px;
    font-size: 12px;
  }

  &--medium {
    height: 36px;
    padding: 0 16px;
    font-size: 14px;
  }

  &--large {
    height: 44px;
    padding: 0 20px;
    font-size: 16px;
  }

  // 类型
  &--primary {
    background-color: $tiger-primary;
    color: white;

    &:not(.is-disabled):not(.is-loading):hover {
      background-color: darken($tiger-primary, 8%);
    }

    &:active {
      transform: scale(0.98);
    }
  }

  &--secondary {
    background-color: $tiger-bg-input;
    border-color: $tiger-border;
    color: $tiger-text-primary;

    &:not(.is-disabled):not(.is-loading):hover {
      border-color: $tiger-primary;
      color: $tiger-primary;
    }
  }

  &--text {
    background: transparent;
    color: $tiger-text-primary;
    border-color: transparent;

    &:not(.is-disabled):not(.is-loading):hover {
      background: rgba($tiger-primary, 0.1);
      color: $tiger-primary;
    }
  }

  &--danger {
    background-color: $tiger-down;
    color: white;

    &:not(.is-disabled):not(.is-loading):hover {
      background-color: darken($tiger-down, 10%);
    }
  }

  // 状态
  &.is-block {
    width: 100%;
  }

  &.is-loading {
    cursor: progress;
    opacity: 0.8;
  }

  &.is-disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  // 图标
  .t-icon {
    margin-right: 6px;
    font-size: v-bind(iconSize);
    line-height: 1;
  }

  // 加载动画
  .t-icon-loading {
    display: inline-block;
    width: v-bind(iconSize);
    height: v-bind(iconSize);
    margin-right: 6px;
    animation: spin 1s linear infinite;

    &::before {
      content: '';
      display: block;
      width: 100%;
      height: 100%;
      background: url('@/assets/icons/loading.svg') center / contain no-repeat;
    }
  }

  &__content {
    display: inline-flex;
    align-items: center;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>

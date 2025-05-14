<template>
  <div
    :class="[
      't-switch',
      `t-switch--${size}`,
      {
        'is-checked': modelValue,
        'is-disabled': disabled,
        'is-loading': loading,
        [`t-switch--${type}`]: type,
      },
    ]"
    @click="handleClick"
  >
    <input
      type="checkbox"
      class="t-switch__input"
      :checked="modelValue"
      :disabled="disabled"
      @change="handleChange"
    />
    <span class="t-switch__core">
      <span class="t-switch__thumb">
        <svg v-if="loading" class="t-switch__loading" viewBox="0 0 24 24">
          <path
            d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46A7.93 7.93 0 0020 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74A7.93 7.93 0 004 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"
          />
        </svg>
      </span>
    </span>
  </div>
</template>

<script setup lang="ts">
defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    default: 'primary', // primary | success | danger
    validator: (v) => ['primary', 'success', 'danger'].includes(v),
  },
  size: {
    type: String,
    default: 'medium', // small | medium | large
    validator: (v) => ['small', 'medium', 'large'].includes(v),
  },
  disabled: Boolean,
  loading: Boolean,
})

const emit = defineEmits(['update:modelValue', 'change'])

const handleClick = (e) => {
  if (!props.disabled && !props.loading) {
    const newVal = !props.modelValue
    emit('update:modelValue', newVal)
    emit('change', newVal)
  }
}

const handleChange = (e) => {
  e.stopPropagation()
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/_variables.scss' as *;

.t-switch {
  $self: &;
  position: relative;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  vertical-align: middle;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &__input {
    position: absolute;
    width: 0;
    height: 0;
    opacity: 0;
    margin: 0;
  }

  &__core {
    position: relative;
    border-radius: 16px;
    background-color: $tiger-bg-input;
    transition:
      background-color 0.3s,
      border-color 0.3s;
  }

  &__thumb {
    position: absolute;
    top: 2px;
    left: 2px;
    border-radius: 50%;
    background-color: $tiger-text-secondary;
    transition: all 0.3s;
  }

  &__loading {
    width: 60%;
    height: 60%;
    margin: 20%;
    fill: currentColor;
    animation: t-switch-spin 1.2s linear infinite;
  }

  // 尺寸
  &--small {
    #{$self}__core {
      width: 36px;
      height: 20px;
    }

    #{$self}__thumb {
      width: 16px;
      height: 16px;
    }

    &.is-checked #{$self}__thumb {
      transform: translateX(16px);
    }
  }

  &--medium {
    #{$self}__core {
      width: 44px;
      height: 24px;
    }

    #{$self}__thumb {
      width: 20px;
      height: 20px;
    }

    &.is-checked #{$self}__thumb {
      transform: translateX(20px);
    }
  }

  &--large {
    #{$self}__core {
      width: 52px;
      height: 28px;
    }

    #{$self}__thumb {
      width: 24px;
      height: 24px;
    }

    &.is-checked #{$self}__thumb {
      transform: translateX(24px);
    }
  }

  // 类型
  &--primary {
    #{$self}__core {
      background-color: rgba($tiger-primary, 0.2);
    }

    &.is-checked #{$self}__core {
      background-color: $tiger-primary;
    }

    &.is-checked #{$self}__thumb {
      background-color: white;
    }
  }

  &--success {
    #{$self}__core {
      background-color: rgba($tiger-up, 0.2);
    }

    &.is-checked #{$self}__core {
      background-color: $tiger-up;
    }

    &.is-checked #{$self}__thumb {
      background-color: white;
    }
  }

  &--danger {
    #{$self}__core {
      background-color: rgba($tiger-down, 0.2);
    }

    &.is-checked #{$self}__core {
      background-color: $tiger-down;
    }

    &.is-checked #{$self}__thumb {
      background-color: white;
    }
  }

  // 状态
  &.is-disabled {
    cursor: not-allowed;
    opacity: 0.6;

    #{$self}__core {
      cursor: not-allowed;
    }
  }

  &.is-loading {
    cursor: progress;
  }
}

@keyframes t-switch-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>

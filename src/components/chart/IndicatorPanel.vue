<template>
  <div class="indicator-panel">
    <div class="panel-header">
      <h3 class="title">技术指标设置</h3>
      <button class="close-btn" @click="$emit('close')">×</button>
    </div>

    <div class="indicator-list">
      <div
        v-for="(indicator, index) in activeIndicators"
        :key="indicator.name"
        class="indicator-item"
      >
        <div class="indicator-meta">
          <span class="indicator-name">{{ getIndicatorLabel(indicator.name) }}</span>
          <span class="indicator-params">{{ formatParams(indicator) }}</span>
        </div>

        <div class="indicator-actions">
          <button class="action-btn edit-btn" @click="openParamEditor(indicator)">
            <i class="icon-edit"></i>
          </button>
          <button class="action-btn remove-btn" @click="removeIndicator(index)">
            <i class="icon-close"></i>
          </button>
        </div>
      </div>

      <div v-if="!activeIndicators.length" class="empty-tip">当前未添加任何技术指标</div>
    </div>

    <!-- 参数编辑对话框 -->
    <div v-if="editingIndicator" class="param-dialog">
      <div class="dialog-mask" @click="cancelEdit"></div>
      <div class="dialog-content">
        <h4>{{ getIndicatorLabel(editingIndicator.name) }} 参数设置</h4>

        <div class="param-item" v-for="param in indicatorParams" :key="param.key">
          <label>{{ param.label }}</label>
          <input
            type="number"
            v-model.number="tempParams[param.key]"
            :min="param.min"
            :step="param.step"
          />
        </div>

        <div class="dialog-actions">
          <button class="btn-cancel" @click="cancelEdit">取消</button>
          <button class="btn-confirm" @click="confirmEdit">确认</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps({
  activeIndicators: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:params', 'remove', 'close'])

// 指标参数配置
const indicatorConfig = {
  MA: [{ key: 'period', label: '周期', min: 1, step: 1, default: 5 }],
  BOLL: [
    { key: 'period', label: '周期', min: 10, step: 1, default: 20 },
    { key: 'multiplier', label: '标准差倍数', min: 1, step: 0.5, default: 2 },
  ],
  MACD: [
    { key: 'short', label: '短期', min: 5, step: 1, default: 12 },
    { key: 'long', label: '长期', min: 10, step: 1, default: 26 },
    { key: 'signal', label: '信号线', min: 5, step: 1, default: 9 },
  ],
}

const editingIndicator = ref(null)
const tempParams = ref({})

// 获取当前指标的参数配置
const indicatorParams = computed(() => {
  return indicatorConfig[editingIndicator.value?.name] || []
})

// 打开参数编辑器
const openParamEditor = (indicator) => {
  editingIndicator.value = { ...indicator }
  tempParams.value = { ...indicator.params }
}

// 确认参数修改
const confirmEdit = () => {
  emit('update:params', {
    name: editingIndicator.value.name,
    params: { ...tempParams.value },
  })
  editingIndicator.value = null
}

// 取消编辑
const cancelEdit = () => {
  editingIndicator.value = null
}

// 删除指标
const removeIndicator = (index) => {
  emit('remove', index)
}

// 指标名称映射
const getIndicatorLabel = (name) => {
  const labels = {
    MA: '移动平均线',
    BOLL: '布林线',
    MACD: 'MACD指标',
    RSI: '相对强弱指数',
    KDJ: '随机指标',
  }
  return labels[name] || name
}

// 参数格式化显示
const formatParams = (indicator) => {
  const params = indicator.params || {}
  switch (indicator.name) {
    case 'MA':
      return `(${params.period || 5}周期)`
    case 'BOLL':
      return `(${params.period || 20}, ${params.multiplier || 2}σ)`
    case 'MACD':
      return `(${params.short || 12}, ${params.long || 26}, ${params.signal || 9})`
    default:
      return ''
  }
}
</script>

<style scoped lang="scss">
@use '@/assets/styles/_variables.scss' as *;

.indicator-panel {
  position: absolute;
  right: 20px;
  top: 60px;
  width: 280px;
  background: $tiger-bg-dark;
  border: 1px solid $tiger-border;
  border-radius: 4px;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid $tiger-border;

  .title {
    margin: 0;
    font-size: 14px;
    color: $tiger-text-primary;
  }

  .close-btn {
    background: none;
    border: none;
    color: $tiger-text-secondary;
    font-size: 20px;
    cursor: pointer;
    padding: 0 4px;

    &:hover {
      color: $tiger-primary;
    }
  }
}

.indicator-list {
  max-height: 400px;
  overflow-y: auto;
  padding: 8px 0;
}

.indicator-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  transition: background 0.2s;

  &:hover {
    background: rgba($tiger-primary, 0.05);
  }

  .indicator-meta {
    flex: 1;
    min-width: 0;
  }

  .indicator-name {
    display: block;
    color: $tiger-text-primary;
    font-size: 13px;
  }

  .indicator-params {
    display: block;
    color: $tiger-text-secondary;
    font-size: 12px;
    margin-top: 2px;
  }
}

.indicator-actions {
  display: flex;
  gap: 4px;
  margin-left: 8px;

  .action-btn {
    width: 24px;
    height: 24px;
    border: none;
    border-radius: 3px;
    background: $tiger-bg-input;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;

    &:hover {
      background: rgba($tiger-primary, 0.1);
    }

    i {
      display: block;
      width: 12px;
      height: 12px;
      background-size: contain;
    }

    .icon-edit {
      background-image: url('@/assets/icons/edit.svg');
    }

    .icon-close {
      background-image: url('@/assets/icons/close.svg');
    }
  }

  .remove-btn:hover {
    background: rgba($tiger-down, 0.1);
  }
}

.empty-tip {
  padding: 16px;
  text-align: center;
  color: $tiger-text-secondary;
  font-size: 12px;
}

.param-dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.dialog-mask {
  position: absolute;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
}

.dialog-content {
  position: relative;
  background: $tiger-bg-dark;
  border-radius: 6px;
  padding: 16px;
  width: 300px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);

  h4 {
    margin: 0 0 16px;
    color: $tiger-text-primary;
    font-size: 14px;
  }
}

.param-item {
  margin-bottom: 12px;

  label {
    display: block;
    color: $tiger-text-secondary;
    font-size: 12px;
    margin-bottom: 4px;
  }

  input {
    width: 100%;
    padding: 6px 8px;
    background: $tiger-bg-input;
    border: 1px solid $tiger-border;
    border-radius: 3px;
    color: $tiger-text-primary;
    font-size: 12px;

    &:focus {
      border-color: $tiger-primary;
      outline: none;
    }
  }
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;

  button {
    padding: 6px 16px;
    border: none;
    border-radius: 3px;
    cursor: pointer;
    font-size: 12px;
  }

  .btn-cancel {
    background: $tiger-bg-input;
    color: $tiger-text-secondary;

    &:hover {
      background: lighten($tiger-bg-input, 5%);
    }
  }

  .btn-confirm {
    background: $tiger-primary;
    color: white;

    &:hover {
      background: darken($tiger-primary, 5%);
    }
  }
}
</style>

<template>
  <div class="indicator-panel">
    <template v-if="indicators.length">
      <button
        v-for="indicator in indicators"
        :key="indicator.name"
        :class="{ selected: selectedSet.has(indicator.name) }"
        @click="toggle(indicator.name)"
        class="indicator-btn"
      >
        {{ indicator.label || indicator.name }}
      </button>
    </template>
    <p v-else class="empty">暂无可用指标</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useIndicatorStore } from '@/stores/indicator'

const indicatorStore = useIndicatorStore()

const indicators = computed(() => indicatorStore.allIndicators || [])

const selectedSet = computed(() => new Set(indicatorStore.selectedIndicators))

function toggle(name: string) {
  indicatorStore.toggleIndicator(name)
}
</script>

<style scoped>
.indicator-panel {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.indicator-btn {
  padding: 6px 12px;
  border: 1px solid #ccc;
  background: white;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.2s;
}

.indicator-btn.selected {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.empty {
  color: #999;
  font-style: italic;
  padding: 8px;
}
</style>

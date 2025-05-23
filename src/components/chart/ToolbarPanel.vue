<template>
  <div class="toolbar">
    <label for="symbol">股票代码</label>
    <select id="symbol" v-model="localSymbol" :disabled="!symbolList.length">
      <option v-for="symbol in symbolList" :key="symbol" :value="symbol">
        {{ symbol }}
      </option>
    </select>

    <label for="interval">周期</label>
    <select id="interval" v-model="localInterval" :disabled="!intervalList.length">
      <option v-for="interval in intervalList" :key="interval" :value="interval">
        {{ interval }}
      </option>
    </select>

    <label for="indicator">指标</label>
    <select id="indicator" v-model="localIndicator" :disabled="!indicatorList.length">
      <option v-for="indicator in indicatorList" :key="indicator" :value="indicator">
        {{ indicator }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'ToolbarPanel',
})
import { ref, watch } from 'vue'

const props = defineProps<{
  symbol: string
  interval: string
  indicator: string
  symbolList: string[]
  intervalList: string[]
  indicatorList: string[]
}>()

const emit = defineEmits<{
  (e: 'update:symbol', value: string): void
  (e: 'update:interval', value: string): void
  (e: 'update:indicator', value: string): void
}>()

const localSymbol = ref(props.symbol)
const localInterval = ref(props.interval)
const localIndicator = ref(props.indicator)

watch(localSymbol, (val) => emit('update:symbol', val))
watch(localInterval, (val) => emit('update:interval', val))
watch(localIndicator, (val) => emit('update:indicator', val))
</script>

<style scoped>
.toolbar {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
  padding: 0.5rem;
  background: #f9f9f9;
  border-bottom: 1px solid #ddd;
}

label {
  font-weight: bold;
  margin-right: 0.5rem;
}

select {
  padding: 4px 8px;
  font-size: 14px;
}
</style>

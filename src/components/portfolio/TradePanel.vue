<template>
  <div class="trade-panel">
    <h2>交易面板</h2>
    <div class="form-group">
      <label for="quantity">数量：</label>
      <input id="quantity" type="number" v-model.number="quantity" min="1" class="input" />
    </div>
    <div class="buttons">
      <button @click="buy" class="btn buy">买入</button>
      <button @click="sell" class="btn sell">卖出</button>
    </div>
    <p v-if="message" class="message">{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const quantity = ref(1)
const message = ref('')

function buy() {
  // 在此处添加买入逻辑
  message.value = `成功买入 ${quantity.value} 股。`
}

function sell() {
  // 在此处添加卖出逻辑
  message.value = `成功卖出 ${quantity.value} 股。`
}
</script>

<style scoped>
.trade-panel {
  border: 1px solid #ccc;
  padding: 16px;
  border-radius: 8px;
  width: 300px;
}

.form-group {
  margin-bottom: 12px;
}

.input {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
}

.buttons {
  display: flex;
  justify-content: space-between;
}

.btn {
  padding: 8px 16px;
  cursor: pointer;
}

.buy {
  background-color: #4caf50;
  color: white;
  border: none;
}

.sell {
  background-color: #f44336;
  color: white;
  border: none;
}

.message {
  margin-top: 12px;
  font-weight: bold;
}
</style>

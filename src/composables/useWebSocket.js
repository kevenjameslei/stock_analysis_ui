import { ref, watchEffect, onUnmounted } from 'vue'

export function useWebSocket(options) {
  const {
    urlBuilder,
    onMessage,
    onError,
    autoReconnect = true,
    reconnectInterval = 5000,
    maxReconnectAttempts = 5,
    heartbeatInterval = 30000,
  } = options

  // 响应式状态
  const ws = ref(null)
  const isConnected = ref(false)
  const reconnectCount = ref(0)
  const heartbeatTimer = ref(null)
  const messageQueue = ref([])

  // 核心连接逻辑
  const connect = () => {
    if (ws.value) disconnect()

    const wsUrl = urlBuilder()
    ws.value = new WebSocket(wsUrl)

    ws.value.onopen = () => {
      isConnected.value = true
      reconnectCount.value = 0
      startHeartbeat()
      flushMessageQueue()
    }

    ws.value.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        validateDataFormat(data) && onMessage(data)
      } catch (error) {
        handleError(new Error(`消息解析失败: ${error.message}`))
      }
    }

    ws.value.onerror = (error) => {
      handleError(new Error(`WebSocket错误: ${error.message}`))
      disconnect()
    }

    ws.value.onclose = (event) => {
      isConnected.value = false
      stopHeartbeat()
      if (autoReconnect && !event.wasClean) {
        scheduleReconnect()
      }
    }
  }

  // 数据格式验证（兼容不同交易所格式）
  const validateDataFormat = (data) => {
    const requiredFields = ['symbol', 'timestamp', 'open', 'high', 'low', 'close', 'volume']
    return requiredFields.every((field) => data.hasOwnProperty(field))
  }

  // 心跳机制
  const startHeartbeat = () => {
    heartbeatTimer.value = setInterval(() => {
      send({ type: 'ping' })
    }, heartbeatInterval)
  }

  const stopHeartbeat = () => {
    clearInterval(heartbeatTimer.value)
  }

  // 消息队列管理
  const send = (message) => {
    if (isConnected.value) {
      ws.value.send(JSON.stringify(message))
    } else {
      messageQueue.value.push(message)
    }
  }

  const flushMessageQueue = () => {
    while (messageQueue.value.length > 0) {
      const msg = messageQueue.value.shift()
      ws.value.send(JSON.stringify(msg))
    }
  }

  // 重连逻辑
  const scheduleReconnect = () => {
    if (reconnectCount.value < maxReconnectAttempts) {
      reconnectCount.value++
      setTimeout(connect, reconnectInterval)
    } else {
      handleError(new Error('达到最大重连次数，停止重连'))
    }
  }

  // 错误处理
  const handleError = (error) => {
    onError?.(error)
    console.error('[WebSocket Error]', error)
  }

  // 公开方法
  const disconnect = () => {
    if (ws.value) {
      ws.value.close()
      ws.value = null
    }
  }

  const reconnect = () => {
    reconnectCount.value = 0
    connect()
  }

  // 自动订阅管理
  const subscribe = (symbol, timeframe) => {
    send({
      type: 'subscribe',
      symbol: symbol.toUpperCase(),
      timeframe: timeframe.toLowerCase(),
    })
  }

  const unsubscribe = (symbol) => {
    send({
      type: 'unsubscribe',
      symbol: symbol.toUpperCase(),
    })
  }

  // 响应式参数处理（示例）
  watchEffect(() => {
    if (isConnected.value) {
      subscribe(options.symbol, options.timeframe)
    }
  })

  // 生命周期
  onUnmounted(() => {
    disconnect()
    stopHeartbeat()
  })

  return {
    isConnected,
    connect,
    disconnect,
    reconnect,
    send,
    subscribe,
    unsubscribe,
  }
}

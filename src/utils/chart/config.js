import * as echarts from 'echarts'

// 主题配色配置
export const CHART_COLORS = {
  dark: {
    up: '#F6465D', // 涨色 - 红
    down: '#0ECB81', // 跌色 - 绿
    bg: '#1E222D', // 背景色
    grid: '#2A2E3A', // 网格线
    text: {
      primary: '#E8E8E8', // 主要文字
      secondary: '#7F848E', // 次要文字
    },
  },
}

// 技术指标配色方案
export const INDICATOR_COLORS = {
  MA5: '#FF9800', // 橙色
  MA10: '#2196F3', // 蓝色
  MA20: '#E91E63', // 玫红
  BOLL_UPPER: '#4CAF50', // 绿色
  BOLL_MID: '#2196F3', // 蓝色
  BOLL_LOWER: '#E91E63', // 玫红
  MACD: '#FFC107', // 金色
  VOLUME: '#666', // 成交量默认色
}

// 生成基础K线配置
export const getBaseKLineOption = (theme = 'dark') => {
  const colors = CHART_COLORS[theme]

  return {
    backgroundColor: colors.bg,
    animation: false,
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      backgroundColor: 'rgba(30,34,45,0.95)',
      borderColor: colors.grid,
      textStyle: { color: colors.text.primary },
      position: (pos, _, el, elRect, size) => ({
        top: pos[1] < size.viewSize[1] / 2 ? pos[1] + 20 : pos[1] - 100,
        left: pos[0] < size.viewSize[0] / 2 ? pos[0] + 20 : pos[0] - 150,
      }),
      formatter: (params) => {
        const kData = params[0].data
        const change = (((kData[2] - kData[1]) / kData[1]) * 100).toFixed(2)
        const color = kData[2] >= kData[1] ? colors.up : colors.down

        return `
          <div style="margin-bottom:8px;color:${colors.text.primary};font-weight:bold">
            ${echarts.time.format(kData[0], '{yyyy}-{MM}-{dd} {HH}:{mm}', false)}
          </div>
          <div style="display:flex;flex-direction:column;gap:4px">
            ${[
              ['开盘', kData[1]],
              ['收盘', kData[2], color],
              ['最高', kData[4]],
              ['最低', kData[3]],
              ['涨跌', `${change}%`, color],
            ]
              .map(
                ([label, value, clr]) => `
              <div style="display:flex;justify-content:space-between;gap:20px">
                <span style="color:${colors.text.secondary}">${label}</span>
                <span style="color:${clr || colors.text.primary}">${value}</span>
              </div>
            `,
              )
              .join('')}
          </div>
        `
      },
    },
    grid: [
      {
        left: '3%',
        right: '1%',
        top: '10%',
        height: '60%',
      },
    ],
    xAxis: {
      type: 'category',
      axisLine: { lineStyle: { color: colors.grid } },
      axisLabel: { color: colors.text.secondary },
      splitLine: { show: false },
    },
    yAxis: {
      scale: true,
      position: 'right',
      splitLine: { lineStyle: { color: colors.grid, type: 'dashed' } },
      axisLabel: {
        color: colors.text.secondary,
        inside: true,
        formatter: (value) => value.toFixed(2),
      },
    },
    dataZoom: [
      {
        type: 'inside',
        start: 80,
        end: 100,
        fillerColor: 'rgba(42,46,58,0.5)',
        borderColor: 'transparent',
        handleStyle: {
          color: colors.grid,
          borderWidth: 0,
        },
      },
    ],
  }
}

// 生成成交量配置
export const getVolumeOption = (theme = 'dark') => {
  const colors = CHART_COLORS[theme]

  return {
    grid: {
      left: '3%',
      right: '1%',
      top: '72%',
      height: '18%',
    },
    xAxis: {
      type: 'category',
      show: false,
      axisLine: { lineStyle: { color: colors.grid } },
      splitLine: { show: false },
    },
    yAxis: {
      position: 'right',
      splitLine: { show: false },
      axisLabel: { show: false },
    },
    series: [
      {
        type: 'bar',
        itemStyle: {
          color: (params) => {
            const data = params.data
            return data[1] >= data[0] ? colors.up : colors.down
          },
        },
        barWidth: '80%',
        emphasis: { itemStyle: { opacity: 0.8 } },
      },
    ],
  }
}

// 技术指标样式生成器
export const getIndicatorStyle = (name) => {
  const styleMap = {
    MA5: {
      type: 'line',
      lineStyle: { color: INDICATOR_COLORS.MA5, width: 1 },
      symbol: 'none',
    },
    MA10: {
      type: 'line',
      lineStyle: { color: INDICATOR_COLORS.MA10, width: 1 },
      symbol: 'none',
    },
    BOLL_UPPER: {
      type: 'line',
      lineStyle: { color: INDICATOR_COLORS.BOLL_UPPER, width: 1 },
      symbol: 'none',
    },
    BOLL_MID: {
      type: 'line',
      lineStyle: { color: INDICATOR_COLORS.BOLL_MID, width: 1 },
      symbol: 'none',
    },
    BOLL_LOWER: {
      type: 'line',
      lineStyle: { color: INDICATOR_COLORS.BOLL_LOWER, width: 1 },
      symbol: 'none',
    },
    MACD: {
      type: 'bar',
      itemStyle: { color: INDICATOR_COLORS.MACD },
    },
  }

  return (
    styleMap[name] || {
      type: 'line',
      lineStyle: { color: '#666', width: 1 },
      symbol: 'none',
    }
  )
}

// 初始化完整配置
export const initChartConfig = (theme = 'dark') => {
  const baseOption = getBaseKLineOption(theme)
  const volumeOption = getVolumeOption(theme)

  return {
    base: baseOption,
    volume: volumeOption,
    indicators: Object.keys(INDICATOR_COLORS).reduce((acc, name) => {
      acc[name] = getIndicatorStyle(name)
      return acc
    }, {}),
  }
}

// 导出默认暗色主题配置
export default initChartConfig('dark')

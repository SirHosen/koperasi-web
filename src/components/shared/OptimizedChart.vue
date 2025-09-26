<template>
  <div class="chart-container" :style="{ width: width, height: height }">
    <canvas ref="chartCanvas" :width="canvasWidth" :height="canvasHeight"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import Chart, { type ChartConfiguration, type Chart as ChartType } from 'chart.js/auto'

interface Props {
  config: ChartConfiguration
  width?: string
  height?: string
  responsive?: boolean
  maintainAspectRatio?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  width: '100%',
  height: '400px',
  responsive: true,
  maintainAspectRatio: false,
})

const chartCanvas = ref<HTMLCanvasElement | null>(null)
let chartInstance: ChartType | null = null

// Computed canvas dimensions
const canvasWidth = ref(400)
const canvasHeight = ref(300)

const createChart = async () => {
  await nextTick()

  if (!chartCanvas.value) {
    console.warn('Chart canvas not available')
    return
  }

  // Destroy existing chart to prevent memory leaks
  destroyChart()

  try {
    const ctx = chartCanvas.value.getContext('2d')
    if (!ctx) {
      console.error('Could not get 2D context from canvas')
      return
    }

    // Update canvas dimensions based on container
    updateCanvasDimensions()

    // Create chart with optimized configuration
    const optimizedConfig: ChartConfiguration = {
      ...props.config,
      options: {
        ...props.config.options,
        responsive: props.responsive,
        maintainAspectRatio: props.maintainAspectRatio,
        // Performance optimizations
        animation: {
          duration: 400, // Reduce animation time
          ...(props.config.options?.animation as object),
        },
        // Memory optimization
        plugins: {
          ...props.config.options?.plugins,
          legend: {
            labels: {
              usePointStyle: true, // Reduces memory usage
            },
            ...props.config.options?.plugins?.legend,
          },
        },
        // Disable hover effects for better performance on mobile
        onHover: undefined,
        // Optimize tooltips
        interaction: {
          intersect: false,
          mode: 'index',
          ...props.config.options?.interaction,
        },
      },
    }

    chartInstance = new Chart(ctx, optimizedConfig)

    // Add resize observer for responsive behavior
    if (props.responsive) {
      addResizeObserver()
    }
  } catch (error) {
    console.error('Error creating chart:', error)
  }
}

const destroyChart = () => {
  if (chartInstance) {
    try {
      chartInstance.destroy()
      chartInstance = null
    } catch (error) {
      console.error('Error destroying chart:', error)
    }
  }

  // Clean up resize observer
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
}

const updateChart = (newConfig: ChartConfiguration) => {
  if (!chartInstance) {
    createChart()
    return
  }

  try {
    // Update data
    if (newConfig.data) {
      chartInstance.data = newConfig.data
    }

    // Update options
    if (newConfig.options) {
      Object.assign(chartInstance.options, newConfig.options)
    }

    // Update chart
    chartInstance.update('none') // Skip animation for better performance
  } catch (error) {
    console.error('Error updating chart:', error)
    // Fallback: recreate chart
    createChart()
  }
}

const updateCanvasDimensions = () => {
  if (!chartCanvas.value?.parentElement) return

  const container = chartCanvas.value.parentElement
  const rect = container.getBoundingClientRect()

  canvasWidth.value = rect.width || 400
  canvasHeight.value = parseInt(props.height) || 300
}

// Resize observer for responsive charts
let resizeObserver: ResizeObserver | null = null

const addResizeObserver = () => {
  if (!chartCanvas.value?.parentElement || !window.ResizeObserver) return

  resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      if (entry.target === chartCanvas.value?.parentElement) {
        updateCanvasDimensions()
        if (chartInstance) {
          chartInstance.resize()
        }
      }
    }
  })

  resizeObserver.observe(chartCanvas.value.parentElement)
}

// Watch for config changes
watch(
  () => props.config,
  (newConfig) => {
    updateChart(newConfig)
  },
  { deep: true },
)

// Lifecycle hooks
onMounted(() => {
  createChart()
})

onBeforeUnmount(() => {
  destroyChart()
})

// Expose methods for manual control
defineExpose({
  chartInstance: () => chartInstance,
  updateChart,
  destroyChart,
  createChart,
})
</script>

<style scoped>
.chart-container {
  position: relative;
  width: 100%;
  height: 100%;
}

canvas {
  max-width: 100%;
  height: auto;
}

/* Prevent canvas from causing layout shifts */
.chart-container canvas {
  display: block;
}

/* Performance optimization for mobile */
@media (max-width: 768px) {
  .chart-container {
    /* Reduce hardware acceleration on mobile to save memory */
    transform: translateZ(0);
  }
}
</style>

/**
 * Performance utilities for Vue.js application
 * Provides preloading, lazy loading, and component optimization utilities
 */

// Preload critical route components
export const preloadCriticalRoutes = () => {
  // Preload login and dashboard components as they're likely to be accessed first
  const criticalRoutes = [
    () => import('@/views/auth/LoginView.vue'),
    () => import('@/layouts/DashboardLayout.vue'),
  ]

  // Preload after initial page load to avoid blocking
  if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
      setTimeout(() => {
        criticalRoutes.forEach((route) => route())
      }, 1000) // Delay to ensure initial page is fully loaded
    })
  }
}

// Intelligent preloading based on user role
export const preloadRoleBasedRoutes = (userRole: string) => {
  const roleRoutes: Record<string, (() => Promise<unknown>)[]> = {
    anggota: [
      () => import('@/views/anggota/AnggotaDashboardView.vue'),
      () => import('@/views/anggota/SimpananView.vue'),
      () => import('@/views/anggota/PinjamanFormView.vue'),
    ],
    pengurus: [
      () => import('@/views/pengurus/DashboardView.vue'),
      () => import('@/views/pengurus/AnggotaManagementView.vue'),
      () => import('@/views/pengurus/PinjamanVerifikasiView.vue'),
    ],
    pengawas: [() => import('@/views/pengawas/DashboardView.vue')],
  }

  const routes = roleRoutes[userRole] || []

  // Preload role-specific routes with a small delay
  setTimeout(() => {
    routes.forEach((route) => route())
  }, 2000)
}

// Lazy loading wrapper with loading state
export const createLazyComponent = (importFn: () => Promise<unknown>, fallback?: unknown) => {
  return {
    component: importFn,
    loading: fallback || {
      template: `
        <div class="d-flex justify-content-center align-items-center" style="min-height: 200px;">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      `,
    },
    error: {
      template: `
        <div class="alert alert-danger" role="alert">
          <i class="bi bi-exclamation-triangle me-2"></i>
          Gagal memuat komponen. <button class="btn btn-link p-0" onclick="window.location.reload()">Reload halaman</button>
        </div>
      `,
    },
    delay: 200, // Show loading after 200ms
    timeout: 10000, // Show error after 10s
  }
}

// Image lazy loading utility
export const setupImageLazyLoading = () => {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement
          const src = img.dataset.src
          if (src) {
            img.src = src
            img.removeAttribute('data-src')
            imageObserver.unobserve(img)
          }
        }
      })
    })

    // Observe all images with data-src attribute
    document.querySelectorAll('img[data-src]').forEach((img) => {
      imageObserver.observe(img)
    })
  }
}

// Debounce utility for performance
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
  immediate = false,
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    const later = () => {
      timeout = null
      if (!immediate) func(...args)
    }

    const callNow = immediate && !timeout

    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)

    if (callNow) func(...args)
  }
}

// Throttle utility for scroll/resize events
export const throttle = <T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number,
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// Memory cleanup utility
export const cleanup = {
  // Cancel all pending timeouts
  timeouts: new Set<NodeJS.Timeout>(),

  setTimeout(callback: () => void, delay: number) {
    const timeout = setTimeout(() => {
      callback()
      this.timeouts.delete(timeout)
    }, delay)
    this.timeouts.add(timeout)
    return timeout
  },

  clearAllTimeouts() {
    this.timeouts.forEach((timeout) => clearTimeout(timeout))
    this.timeouts.clear()
  },

  // Chart cleanup
  charts: new Set<{ destroy?: () => void }>(),

  addChart(chart: { destroy?: () => void }) {
    this.charts.add(chart)
  },

  destroyAllCharts() {
    this.charts.forEach((chart) => {
      if (chart && typeof chart.destroy === 'function') {
        chart.destroy()
      }
    })
    this.charts.clear()
  },

  // Event listeners cleanup
  listeners: new Map<EventTarget, { event: string; handler: EventListener }[]>(),

  addEventListener(target: EventTarget, event: string, handler: EventListener) {
    target.addEventListener(event, handler)

    if (!this.listeners.has(target)) {
      this.listeners.set(target, [])
    }
    this.listeners.get(target)!.push({ event, handler })
  },

  removeAllEventListeners() {
    this.listeners.forEach((listeners, target) => {
      listeners.forEach(({ event, handler }) => {
        target.removeEventListener(event, handler)
      })
    })
    this.listeners.clear()
  },

  // Complete cleanup
  cleanupAll() {
    this.clearAllTimeouts()
    this.destroyAllCharts()
    this.removeAllEventListeners()
  },
}

// Performance monitoring
export const performanceMonitor = {
  // Track component render times
  trackRender(componentName: string, startTime: number) {
    const endTime = performance.now()
    const renderTime = endTime - startTime

    if (renderTime > 16) {
      // Slower than 60fps
      console.warn(`Slow render detected: ${componentName} took ${renderTime.toFixed(2)}ms`)
    }

    // Store in session storage for debugging
    if (typeof window !== 'undefined') {
      const key = `render_${componentName}`
      const existing = JSON.parse(sessionStorage.getItem(key) || '[]')
      existing.push(renderTime)

      // Keep only last 10 measurements
      if (existing.length > 10) {
        existing.shift()
      }

      sessionStorage.setItem(key, JSON.stringify(existing))
    }
  },

  // Get performance metrics
  getMetrics() {
    if (typeof window === 'undefined') return {}

    const metrics: Record<string, unknown> = {}

    // Get all render times from session storage
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i)
      if (key?.startsWith('render_')) {
        const componentName = key.replace('render_', '')
        const times = JSON.parse(sessionStorage.getItem(key) || '[]')
        const avg = times.reduce((sum: number, time: number) => sum + time, 0) / times.length

        metrics[componentName] = {
          average: avg.toFixed(2),
          latest: times[times.length - 1]?.toFixed(2),
          count: times.length,
        }
      }
    }

    return metrics
  },
}

// Bundle analysis helper (development only)
// Define webpack require interface
declare global {
  interface Window {
    __webpack_require__?: {
      cache: Record<string, unknown>
    }
  }
}

export const analyzeBundleSize = () => {
  if (process.env.NODE_ENV !== 'development') return

  const modules = Object.keys(window.__webpack_require__?.cache || {})
  const sizes = modules
    .map((id) => {
      const module = window.__webpack_require__?.cache[id]
      return {
        id,
        size: JSON.stringify(module).length,
      }
    })
    .sort((a, b) => b.size - a.size)

  console.group('Bundle Analysis')
  console.table(sizes.slice(0, 20)) // Top 20 largest modules
  console.groupEnd()
}

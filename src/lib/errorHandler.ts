/**
 * Error handling utility for the Koperasi application
 */

import { ref } from 'vue'

interface ErrorHandlerOptions {
  logToConsole?: boolean
  showToUser?: boolean
  duration?: number
}

const defaultOptions: ErrorHandlerOptions = {
  logToConsole: true,
  showToUser: true,
  duration: 5000, // 5 seconds
}

/**
 * Creates an error handler with reactive state for Vue components
 */
export function useErrorHandler() {
  const error = ref<string>('')
  const loading = ref<boolean>(false)
  const success = ref<string>('')

  /**
   * Handle errors from async operations
   * @param action - Async function to execute
   * @param errorMessage - User-friendly error message
   * @param options - Error handling options
   */
  const handleAsync = async <T>(
    action: () => Promise<T>,
    errorMessage: string = 'Terjadi kesalahan, silakan coba lagi',
    options: ErrorHandlerOptions = {},
  ): Promise<T | null> => {
    const opts = { ...defaultOptions, ...options }
    loading.value = true
    error.value = ''

    try {
      const result = await action()
      return result
    } catch (e) {
      if (opts.logToConsole) {
        console.error(`${errorMessage}:`, e)
      }

      if (opts.showToUser) {
        error.value = errorMessage

        if (opts.duration && opts.duration > 0) {
          setTimeout(() => {
            error.value = ''
          }, opts.duration)
        }
      }

      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Set a success message that will automatically clear after specified duration
   * @param message - Success message to display
   * @param duration - Time in milliseconds before clearing (default: 3000)
   */
  const showSuccess = (message: string, duration: number = 3000): void => {
    success.value = message

    if (duration > 0) {
      setTimeout(() => {
        success.value = ''
      }, duration)
    }
  }

  /**
   * Clear all error and success messages
   */
  const clearMessages = (): void => {
    error.value = ''
    success.value = ''
  }

  return {
    error,
    loading,
    success,
    handleAsync,
    showSuccess,
    clearMessages,
  }
}

/**
 * Parse API error response to extract user-friendly error message
 * @param error - Error object from API call
 * @param defaultMessage - Default message if parsing fails
 */
interface ApiErrorResponse {
  response?: {
    data?: {
      message?: string
      error?: string
    }
  }
  message?: string
}

export function parseApiError(
  error: unknown,
  defaultMessage: string = 'Terjadi kesalahan pada server',
): string {
  if (!error) {
    return defaultMessage
  }

  // Cast to ApiErrorResponse type for type checking
  const apiError = error as ApiErrorResponse

  // Handle axios error responses
  if (apiError.response && apiError.response.data) {
    if (apiError.response.data.message) {
      return apiError.response.data.message
    }
    if (apiError.response.data.error) {
      return apiError.response.data.error
    }
  }

  // Handle direct error messages
  if (apiError.message) {
    return apiError.message
  }

  // Return default for unknown error formats
  return defaultMessage
}

/**
 * Format validation errors into a readable list
 * @param errors - Validation errors object from API
 */
export function formatValidationErrors(errors: Record<string, string[]>): string {
  if (!errors || Object.keys(errors).length === 0) {
    return ''
  }

  const errorMessages = Object.entries(errors).map(([field, messages]) => {
    return `${field}: ${messages.join(', ')}`
  })

  return errorMessages.join('\n')
}

import { AppError, ErrorCode, ErrorSeverity, ErrorContext } from './errorTypes'

// Error reporting service
export class ErrorReporter {
  private static instance: ErrorReporter
  
  public static getInstance(): ErrorReporter {
    if (!ErrorReporter.instance) {
      ErrorReporter.instance = new ErrorReporter()
    }
    return ErrorReporter.instance
  }
  
  // Report error to external service (e.g., Sentry, LogRocket)
  public reportError(error: AppError, context?: ErrorContext): void {
    // In development, log to console
    if (import.meta.env.MODE === 'development') {
      console.error('Error reported:', error, context)
      return
    }
    
    // In production, send to external service
    this.sendToExternalService(error, context)
  }
  
  // Create structured error from various sources
  public createError(
    code: ErrorCode,
    message: string,
    details?: Record<string, any>,
    stack?: string
  ): AppError {
    return {
      code,
      message,
      details,
      timestamp: new Date().toISOString(),
      stack,
    }
  }
  
  // Handle API errors
  public handleApiError(error: any): AppError {
    if (error.response) {
      // Server responded with error status
      const status = error.response.status
      const data = error.response.data
      
      return this.createError(
        this.getErrorCodeFromStatus(status),
        data.message || error.message,
        { status, data },
        error.stack
      )
    } else if (error.request) {
      // Network error
      return this.createError(
        ErrorCode.NETWORK_ERROR,
        'Network error occurred',
        { request: error.request },
        error.stack
      )
    } else {
      // Other error
      return this.createError(
        ErrorCode.INTERNAL_ERROR,
        error.message || 'An unexpected error occurred',
        {},
        error.stack
      )
    }
  }
  
  // Handle validation errors
  public handleValidationError(errors: Record<string, string[]>): AppError {
    return this.createError(
      ErrorCode.VALIDATION_ERROR,
      'Validation failed',
      { validationErrors: errors }
    )
  }
  
  // Get user-friendly error message
  public getUserFriendlyMessage(error: AppError): string {
    const messages: Record<ErrorCode, string> = {
      [ErrorCode.UNAUTHORIZED]: 'Please log in to continue',
      [ErrorCode.FORBIDDEN]: 'You do not have permission to perform this action',
      [ErrorCode.INVALID_CREDENTIALS]: 'Invalid email or password',
      [ErrorCode.TOKEN_EXPIRED]: 'Your session has expired. Please log in again',
      [ErrorCode.VALIDATION_ERROR]: 'Please check your input and try again',
      [ErrorCode.REQUIRED_FIELD]: 'This field is required',
      [ErrorCode.INVALID_FORMAT]: 'Please enter a valid format',
      [ErrorCode.NETWORK_ERROR]: 'Network connection failed. Please check your internet connection',
      [ErrorCode.TIMEOUT]: 'Request timed out. Please try again',
      [ErrorCode.CONNECTION_FAILED]: 'Unable to connect to server',
      [ErrorCode.INTERNAL_ERROR]: 'An unexpected error occurred. Please try again',
      [ErrorCode.SERVICE_UNAVAILABLE]: 'Service is temporarily unavailable',
      [ErrorCode.BAD_GATEWAY]: 'Server error. Please try again later',
      [ErrorCode.LOAD_NOT_FOUND]: 'Load not found',
      [ErrorCode.DRIVER_NOT_AVAILABLE]: 'No drivers available at this time',
      [ErrorCode.INSUFFICIENT_PERMISSIONS]: 'You do not have sufficient permissions',
      [ErrorCode.DUPLICATE_ENTRY]: 'This item already exists',
      [ErrorCode.FILE_TOO_LARGE]: 'File is too large. Please choose a smaller file',
      [ErrorCode.INVALID_FILE_TYPE]: 'Invalid file type. Please choose a valid file',
      [ErrorCode.UPLOAD_FAILED]: 'File upload failed. Please try again',
    }
    
    return messages[error.code] || error.message
  }
  
  // Private methods
  private sendToExternalService(error: AppError, context?: ErrorContext): void {
    // Implement external error reporting service integration
    // e.g., Sentry, LogRocket, Bugsnag, etc.
    console.warn('External error reporting not implemented', error, context)
  }
  
  private getErrorCodeFromStatus(status: number): ErrorCode {
    switch (status) {
      case 401:
        return ErrorCode.UNAUTHORIZED
      case 403:
        return ErrorCode.FORBIDDEN
      case 400:
        return ErrorCode.VALIDATION_ERROR
      case 404:
        return ErrorCode.LOAD_NOT_FOUND
      case 408:
        return ErrorCode.TIMEOUT
      case 500:
        return ErrorCode.INTERNAL_ERROR
      case 502:
        return ErrorCode.BAD_GATEWAY
      case 503:
        return ErrorCode.SERVICE_UNAVAILABLE
      default:
        return ErrorCode.INTERNAL_ERROR
    }
  }
}

// Export singleton instance
export const errorReporter = ErrorReporter.getInstance()

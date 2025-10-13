import { z } from 'zod'
import { schemas } from './schemas'
import { errorReporter } from '../error-handling/errorReporting'

// Validation helper functions
export class Validator {
  // Generic validation function
  public static validate<T>(
    schema: z.ZodSchema<T>,
    data: unknown,
    context?: string
  ): { success: true; data: T } | { success: false; errors: string[] } {
    try {
      const result = schema.parse(data)
      return { success: true, data: result }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => {
          const path = err.path.join('.')
          return path ? `${path}: ${err.message}` : err.message
        })
        
        // Report validation error
        errorReporter.reportError(
          errorReporter.createError(
            'VALIDATION_ERROR' as any,
            `Validation failed for ${context || 'data'}`,
            { errors: error.errors }
          )
        )
        
        return { success: false, errors }
      }
      
      // Handle unexpected errors
      errorReporter.reportError(
        errorReporter.createError(
          'VALIDATION_ERROR' as any,
          'Unexpected validation error',
          { originalError: error }
        )
      )
      
      return { success: false, errors: ['An unexpected validation error occurred'] }
    }
  }
  
  // Validate form data
  public static validateForm<T>(
    schema: z.ZodSchema<T>,
    formData: FormData,
    context?: string
  ): { success: true; data: T } | { success: false; errors: Record<string, string> } {
    try {
      // Convert FormData to object
      const data = Object.fromEntries(formData.entries())
      
      const result = schema.parse(data)
      return { success: true, data: result }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {}
        
        error.errors.forEach(err => {
          const path = err.path[0] as string
          if (path) {
            errors[path] = err.message
          }
        })
        
        return { success: false, errors }
      }
      
      return { success: false, errors: { general: 'An unexpected validation error occurred' } }
    }
  }
  
  // Validate API response
  public static validateApiResponse<T>(
    schema: z.ZodSchema<T>,
    response: any,
    context?: string
  ): { success: true; data: T } | { success: false; errors: string[] } {
    return this.validate(schema, response, `API response for ${context || 'unknown endpoint'}`)
  }
  
  // Validate file upload
  public static validateFile(
    file: File,
    options: {
      maxSize?: number // in bytes
      allowedTypes?: string[]
      required?: boolean
    } = {}
  ): { success: true } | { success: false; error: string } {
    const { maxSize = 10 * 1024 * 1024, allowedTypes = [], required = false } = options
    
    if (required && !file) {
      return { success: false, error: 'File is required' }
    }
    
    if (file) {
      // Check file size
      if (file.size > maxSize) {
        return { success: false, error: `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB` }
      }
      
      // Check file type
      if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
        return { success: false, error: `File type must be one of: ${allowedTypes.join(', ')}` }
      }
    }
    
    return { success: true }
  }
  
  // Validate email format
  public static validateEmail(email: string): boolean {
    const result = schemas.email.safeParse(email)
    return result.success
  }
  
  // Validate phone format
  public static validatePhone(phone: string): boolean {
    const result = schemas.phone.safeParse(phone)
    return result.success
  }
  
  // Validate password strength
  public static validatePassword(password: string): {
    isValid: boolean
    errors: string[]
  } {
    const result = schemas.password.safeParse(password)
    
    if (result.success) {
      return { isValid: true, errors: [] }
    }
    
    const errors = result.error?.errors.map(err => err.message) || []
    return { isValid: false, errors }
  }
  
  // Sanitize input
  public static sanitizeInput(input: string): string {
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
  }
  
  // Validate URL
  public static validateUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }
  
  // Validate date range
  public static validateDateRange(
    startDate: string,
    endDate: string
  ): { isValid: boolean; error?: string } {
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return { isValid: false, error: 'Invalid date format' }
    }
    
    if (start >= end) {
      return { isValid: false, error: 'Start date must be before end date' }
    }
    
    return { isValid: true }
  }
}

// Export commonly used validation functions
export const validateEmail = Validator.validateEmail
export const validatePhone = Validator.validatePhone
export const validatePassword = Validator.validatePassword
export const validateFile = Validator.validateFile
export const sanitizeInput = Validator.sanitizeInput
export const validateUrl = Validator.validateUrl
export const validateDateRange = Validator.validateDateRange

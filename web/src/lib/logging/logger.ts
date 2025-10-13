// Logging utility for development and production
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

export interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: Record<string, any>
  userId?: string
  sessionId?: string
}

export class Logger {
  private static instance: Logger
  private isDevelopment: boolean
  
  private constructor() {
    this.isDevelopment = import.meta.env.MODE === 'development'
  }
  
  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }
  
  // Debug logging (development only)
  public debug(message: string, context?: Record<string, any>): void {
    if (this.isDevelopment) {
      this.log(LogLevel.DEBUG, message, context)
    }
  }
  
  // Info logging
  public info(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, context)
  }
  
  // Warning logging
  public warn(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, context)
  }
  
  // Error logging
  public error(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.ERROR, message, context)
  }
  
  // Generic logging method
  private log(level: LogLevel, message: string, context?: Record<string, any>): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      userId: this.getCurrentUserId(),
      sessionId: this.getSessionId(),
    }
    
    // Console logging for development
    if (this.isDevelopment) {
      this.logToConsole(entry)
    }
    
    // Send to external logging service in production
    if (!this.isDevelopment) {
      this.sendToExternalService(entry)
    }
  }
  
  // Console logging with appropriate styling
  private logToConsole(entry: LogEntry): void {
    const { level, message, timestamp, context } = entry
    const time = new Date(timestamp).toLocaleTimeString()
    
    const styles = {
      [LogLevel.DEBUG]: 'color: #888',
      [LogLevel.INFO]: 'color: #0066cc',
      [LogLevel.WARN]: 'color: #ff9900',
      [LogLevel.ERROR]: 'color: #cc0000; font-weight: bold',
    }
    
    console.log(
      `%c[${time}] ${level.toUpperCase()}: ${message}`,
      styles[level],
      context || ''
    )
  }
  
  // Send to external logging service
  private sendToExternalService(entry: LogEntry): void {
    // Implement external logging service integration
    // e.g., LogRocket, Sentry, DataDog, etc.
    
    // For now, just store in localStorage for debugging
    try {
      const logs = JSON.parse(localStorage.getItem('app-logs') || '[]')
      logs.push(entry)
      
      // Keep only last 100 logs
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100)
      }
      
      localStorage.setItem('app-logs', JSON.stringify(logs))
    } catch (error) {
      console.error('Failed to store log entry:', error)
    }
  }
  
  // Get current user ID from auth context
  private getCurrentUserId(): string | undefined {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      return user.id
    } catch {
      return undefined
    }
  }
  
  // Get session ID
  private getSessionId(): string | undefined {
    try {
      return localStorage.getItem('session-id') || undefined
    } catch {
      return undefined
    }
  }
  
  // Performance logging
  public time(label: string): void {
    if (this.isDevelopment) {
      console.time(label)
    }
  }
  
  public timeEnd(label: string): void {
    if (this.isDevelopment) {
      console.timeEnd(label)
    }
  }
  
  // Group logging for related operations
  public group(label: string): void {
    if (this.isDevelopment) {
      console.group(label)
    }
  }
  
  public groupEnd(): void {
    if (this.isDevelopment) {
      console.groupEnd()
    }
  }
  
  // Clear logs
  public clear(): void {
    if (this.isDevelopment) {
      console.clear()
    }
    
    try {
      localStorage.removeItem('app-logs')
    } catch (error) {
      console.error('Failed to clear logs:', error)
    }
  }
  
  // Get stored logs
  public getStoredLogs(): LogEntry[] {
    try {
      return JSON.parse(localStorage.getItem('app-logs') || '[]')
    } catch {
      return []
    }
  }
}

// Export singleton instance
export const logger = Logger.getInstance()

// Convenience functions
export const logDebug = (message: string, context?: Record<string, any>) => logger.debug(message, context)
export const logInfo = (message: string, context?: Record<string, any>) => logger.info(message, context)
export const logWarn = (message: string, context?: Record<string, any>) => logger.warn(message, context)
export const logError = (message: string, context?: Record<string, any>) => logger.error(message, context)

/**
 * SMS Service
 * Handles driver acceptance SMS integration
 */

export interface SMSMessage {
  to: string
  message: string
  type: 'load_acceptance' | 'load_rejection' | 'notification'
}

export interface DriverAcceptanceData {
  workflowId: string
  loadId: string
  driverPhone: string
  dispatchPhone: string
  customerPhone: string
  pickupAddress: string
  deliveryAddress: string
  pickupDate: string
  rate: number
  rateMode: string
  deadline: string
}

class SMSService {
  private static instance: SMSService
  private sentMessages: Map<string, SMSMessage[]> = new Map()

  static getInstance(): SMSService {
    if (!SMSService.instance) {
      SMSService.instance = new SMSService()
    }
    return SMSService.instance
  }

  /**
   * Send driver acceptance SMS
   */
  async sendDriverAcceptanceSMS(data: DriverAcceptanceData): Promise<boolean> {
    try {
      const acceptanceUrl = `${window.location.origin}/accept-load/${data.workflowId}`
      const rejectionCode = `REJECT ${data.loadId}`
      
      const message = `
🚛 LOAD ASSIGNMENT - ACCEPT REQUIRED

Load: ${data.loadId}
From: ${data.pickupAddress}
To: ${data.deliveryAddress}
Date: ${data.pickupDate}
Rate: $${data.rate}/${data.rateMode.replace('PER_', '/').toLowerCase()}

⏰ YOU HAVE 30 MINUTES TO ACCEPT
Deadline: ${new Date(data.deadline).toLocaleString()}

✅ Accept: ${acceptanceUrl}
❌ Reject: Reply "${rejectionCode}"

If you don't respond, load goes back to load board.
      `.trim()

      const smsMessage: SMSMessage = {
        to: data.driverPhone,
        message,
        type: 'load_acceptance'
      }

      // In development, simulate SMS sending
      if (window.location.hostname === 'localhost') {
        console.log('📱 [DEV] SMS to driver:', smsMessage)
        
        // Store for testing
        this.storeMessage(data.driverPhone, smsMessage)
        
        // Show browser notification for testing
        if (Notification.permission === 'granted') {
          new Notification('Driver SMS Sent', {
            body: `Load ${data.loadId} sent to ${data.driverPhone}`,
            icon: '/icons/icon-192x192.png'
          })
        }
        
        return true
      }

      // In production, integrate with actual SMS service
      // await this.sendViaTwilio(smsMessage)
      // await this.sendViaAWS(smsMessage)
      
      return true
      
    } catch (error) {
      console.error('Error sending driver acceptance SMS:', error)
      return false
    }
  }

  /**
   * Send load rejection SMS
   */
  async sendLoadRejectionSMS(loadId: string, driverPhone: string, reason?: string): Promise<boolean> {
    try {
      const message = `
🚛 LOAD REJECTED

Load: ${loadId}
Status: Rejected
${reason ? `Reason: ${reason}` : ''}

Load has been returned to load board.
      `.trim()

      const smsMessage: SMSMessage = {
        to: driverPhone,
        message,
        type: 'load_rejection'
      }

      // In development, simulate SMS sending
      if (window.location.hostname === 'localhost') {
        console.log('📱 [DEV] Rejection SMS to driver:', smsMessage)
        this.storeMessage(driverPhone, smsMessage)
        return true
      }

      // In production, integrate with actual SMS service
      return true
      
    } catch (error) {
      console.error('Error sending rejection SMS:', error)
      return false
    }
  }

  /**
   * Send notification SMS
   */
  async sendNotificationSMS(to: string, message: string): Promise<boolean> {
    try {
      const smsMessage: SMSMessage = {
        to,
        message,
        type: 'notification'
      }

      // In development, simulate SMS sending
      if (window.location.hostname === 'localhost') {
        console.log('📱 [DEV] Notification SMS:', smsMessage)
        this.storeMessage(to, smsMessage)
        return true
      }

      // In production, integrate with actual SMS service
      return true
      
    } catch (error) {
      console.error('Error sending notification SMS:', error)
      return false
    }
  }

  /**
   * Validate phone number
   */
  validatePhoneNumber(phone: string): boolean {
    // Basic US phone number validation
    const phoneRegex = /^\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/
    return phoneRegex.test(phone)
  }

  /**
   * Format phone number for SMS
   */
  formatPhoneNumber(phone: string): string {
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '')
    
    // Add country code if missing
    if (digits.length === 10) {
      return `+1${digits}`
    }
    
    return phone
  }

  /**
   * Store message for development/testing
   */
  private storeMessage(phone: string, message: SMSMessage): void {
    if (!this.sentMessages.has(phone)) {
      this.sentMessages.set(phone, [])
    }
    this.sentMessages.get(phone)!.push(message)
  }

  /**
   * Get sent messages (for development/testing)
   */
  getSentMessages(phone?: string): SMSMessage[] {
    if (phone) {
      return this.sentMessages.get(phone) || []
    }
    
    // Return all messages
    const allMessages: SMSMessage[] = []
    for (const messages of this.sentMessages.values()) {
      allMessages.push(...messages)
    }
    return allMessages
  }

  /**
   * Clear sent messages (for testing)
   */
  clearSentMessages(): void {
    this.sentMessages.clear()
  }

  /**
   * Request notification permission
   */
  async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('Browser does not support notifications')
      return false
    }

    if (Notification.permission === 'granted') {
      return true
    }

    if (Notification.permission === 'denied') {
      console.log('Notification permission denied')
      return false
    }

    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }

  /**
   * Show browser notification
   */
  showNotification(title: string, body: string, icon?: string): void {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: icon || '/icons/icon-192x192.png'
      })
    }
  }

  /**
   * Production SMS integration examples
   */
  
  /**
   * Send via Twilio (example)
   */
  private async sendViaTwilio(message: SMSMessage): Promise<boolean> {
    // Example Twilio integration
    /*
    const twilio = require('twilio')
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    
    try {
      await client.messages.create({
        body: message.message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: message.to
      })
      return true
    } catch (error) {
      console.error('Twilio SMS error:', error)
      return false
    }
    */
    return true
  }

  /**
   * Send via AWS SNS (example)
   */
  private async sendViaAWS(message: SMSMessage): Promise<boolean> {
    // Example AWS SNS integration
    /*
    const AWS = require('aws-sdk')
    const sns = new AWS.SNS({ region: process.env.AWS_REGION })
    
    try {
      await sns.publish({
        Message: message.message,
        PhoneNumber: message.to
      }).promise()
      return true
    } catch (error) {
      console.error('AWS SNS SMS error:', error)
      return false
    }
    */
    return true
  }
}

// Export singleton instance
export const smsService = SMSService.getInstance()

// Request notification permission on load
if (typeof window !== 'undefined') {
  smsService.requestNotificationPermission()
}

export default smsService



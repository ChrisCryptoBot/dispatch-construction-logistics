/**
 * Rate Confirmation Service
 * Handles Rate Con generation, sending, and workflow management
 */

export interface RateConData {
  loadId: string
  customerId: string
  carrierId: string
  driverId?: string
  bidId: string
  
  // Load Details
  commodity: string
  equipment: string
  units: number
  rateMode: string
  rate: number
  
  // Locations (Full addresses revealed after acceptance)
  pickupAddress: string
  deliveryAddress: string
  pickupContact: { name: string; phone: string }
  deliveryContact: { name: string; phone: string }
  
  // Dates & Times
  pickupDate: string
  pickupETA: string
  deliveryDate: string
  deliveryETA: string
  
  // Financial
  grossRevenue: number
  platformFee: number
  carrierPayout: number
  
  // Accessorial Charges
  accessorials: {
    layover: { rate: number; platformFee: number; carrierPayout: number }
    equipmentNotUsed: { rate: number; platformFee: number; carrierPayout: number }
  }
  
  // Workflow
  dispatchPhone: string
  driverPhone: string
  customerPhone: string
}

export interface RateConWorkflow {
  id: string
  loadId: string
  status: 'GENERATED' | 'DISPATCH_SIGNED' | 'DRIVER_ACCEPTED' | 'EXPIRED' | 'REJECTED'
  dispatchSignedAt?: string
  driverAcceptanceDeadline?: string
  driverAcceptedAt?: string
  expiresAt?: string
  pdfUrl?: string
}

class RateConService {
  private static instance: RateConService
  private workflows: Map<string, RateConWorkflow> = new Map()

  static getInstance(): RateConService {
    if (!RateConService.instance) {
      RateConService.instance = new RateConService()
    }
    return RateConService.instance
  }

  /**
   * Generate Rate Con after customer accepts bid
   */
  async generateRateCon(rateConData: RateConData): Promise<RateConWorkflow> {
    console.log('🔄 Generating Rate Con for load:', rateConData.loadId)
    
    // Create workflow record
    const workflow: RateConWorkflow = {
      id: `rc-${Date.now()}`,
      loadId: rateConData.loadId,
      status: 'GENERATED',
      dispatchSignedAt: new Date().toISOString(),
      driverAcceptanceDeadline: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    }

    // Store workflow
    this.workflows.set(workflow.id, workflow)

    // Generate PDF (mock for now - in production, use PDF generation library)
    const pdfUrl = await this.generateRateConPDF(rateConData)
    workflow.pdfUrl = pdfUrl

    // Send to dispatch (mock SMS/email)
    await this.sendToDispatch(rateConData, workflow)

    // Send to driver (mock SMS)
    await this.sendToDriver(rateConData, workflow)

    // Update status
    workflow.status = 'DISPATCH_SIGNED'
    this.workflows.set(workflow.id, workflow)

    console.log('✅ Rate Con generated and sent:', workflow.id)
    return workflow
  }

  /**
   * Generate Rate Con PDF
   */
  private async generateRateConPDF(data: RateConData): Promise<string> {
    // Mock PDF generation - in production, use libraries like jsPDF or PDFKit
    const pdfContent = this.createRateConHTML(data)
    
    // In production, convert HTML to PDF and store in cloud storage
    // For now, return a mock URL
    return `https://api.superioronelogistics.com/rate-cons/rc-${Date.now()}.pdf`
  }

  /**
   * Create Rate Con HTML content
   */
  private createRateConHTML(data: RateConData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Rate Confirmation - ${data.loadId}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
          .section { margin-bottom: 20px; }
          .section h3 { background: #f0f0f0; padding: 10px; margin: 0 0 10px 0; }
          .row { display: flex; justify-content: space-between; margin-bottom: 5px; }
          .label { font-weight: bold; }
          .signature-section { margin-top: 40px; border-top: 1px solid #333; padding-top: 20px; }
          .signature-box { display: inline-block; width: 200px; height: 60px; border: 1px solid #333; margin: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>RATE CONFIRMATION</h1>
          <h2>Load ID: ${data.loadId}</h2>
          <p>Generated: ${new Date().toLocaleString()}</p>
        </div>

        <div class="section">
          <h3>LOAD DETAILS</h3>
          <div class="row"><span class="label">Commodity:</span><span>${data.commodity}</span></div>
          <div class="row"><span class="label">Equipment:</span><span>${data.equipment}</span></div>
          <div class="row"><span class="label">Units:</span><span>${data.units} tons</span></div>
          <div class="row"><span class="label">Rate Mode:</span><span>${data.rateMode}</span></div>
          <div class="row"><span class="label">Rate:</span><span>$${data.rate}/${data.rateMode.replace('PER_', '/').toLowerCase()}</span></div>
        </div>

        <div class="section">
          <h3>PICKUP INFORMATION</h3>
          <div class="row"><span class="label">Location:</span><span>${data.pickupAddress}</span></div>
          <div class="row"><span class="label">Date:</span><span>${data.pickupDate}</span></div>
          <div class="row"><span class="label">ETA:</span><span>${data.pickupETA}</span></div>
          <div class="row"><span class="label">Contact:</span><span>${data.pickupContact.name} - ${data.pickupContact.phone}</span></div>
        </div>

        <div class="section">
          <h3>DELIVERY INFORMATION</h3>
          <div class="row"><span class="label">Location:</span><span>${data.deliveryAddress}</span></div>
          <div class="row"><span class="label">Date:</span><span>${data.deliveryDate}</span></div>
          <div class="row"><span class="label">ETA:</span><span>${data.deliveryETA}</span></div>
          <div class="row"><span class="label">Contact:</span><span>${data.deliveryContact.name} - ${data.deliveryContact.phone}</span></div>
        </div>

        <div class="section">
          <h3>FINANCIAL TERMS</h3>
          <div class="row"><span class="label">Gross Revenue:</span><span>$${data.grossRevenue.toFixed(2)}</span></div>
          <div class="row"><span class="label">Platform Fee:</span><span>$${data.platformFee.toFixed(2)}</span></div>
          <div class="row"><span class="label">Carrier Payout:</span><span>$${data.carrierPayout.toFixed(2)}</span></div>
        </div>

        <div class="section">
          <h3>ACCESSORIAL CHARGES</h3>
          <div class="row"><span class="label">Layover (if applicable):</span><span>$${data.accessorials.layover.rate.toFixed(2)}</span></div>
          <div class="row"><span class="label">Equipment Not Used (if applicable):</span><span>$${data.accessorials.equipmentNotUsed.rate.toFixed(2)}</span></div>
          <p><strong>Note:</strong> 25% of accessorial charges go to Superior One Logistics, 75% to carrier.</p>
        </div>

        <div class="signature-section">
          <h3>ACCEPTANCE & SIGNATURES</h3>
          <p><strong>IMPORTANT:</strong> Driver must accept this load within 30 minutes of dispatch signature or load will be returned to load board.</p>
          
          <div style="margin-top: 20px;">
            <div class="signature-box"></div>
            <span style="margin-left: 10px;">Dispatch/Owner Signature</span>
          </div>
          
          <div style="margin-top: 20px;">
            <div class="signature-box"></div>
            <span style="margin-left: 10px;">Driver Signature</span>
          </div>
        </div>

        <div class="section">
          <p style="font-size: 12px; color: #666;">
            This Rate Confirmation is automatically generated by Superior One Logistics.<br>
            All terms are subject to the service agreement signed during onboarding.
          </p>
        </div>
      </body>
      </html>
    `
  }

  /**
   * Send Rate Con to dispatch
   */
  private async sendToDispatch(data: RateConData, workflow: RateConWorkflow): Promise<void> {
    console.log('📧 Sending Rate Con to dispatch:', data.dispatchPhone)
    
    // Mock SMS/Email to dispatch
    const message = `
🚛 RATE CONFIRMATION GENERATED

Load: ${data.loadId}
Commodity: ${data.commodity}
Rate: $${data.rate}/${data.rateMode.replace('PER_', '/').toLowerCase()}
Revenue: $${data.grossRevenue.toFixed(2)}

✅ You have automatically signed as dispatch
⏰ Driver has 30 MINUTES to accept

Driver: ${data.driverPhone}
Deadline: ${new Date(workflow.driverAcceptanceDeadline!).toLocaleString()}

View Rate Con: ${workflow.pdfUrl}
    `

    // In production, integrate with SMS service (Twilio/AWS SNS)
    console.log('📱 SMS to dispatch:', message)
  }

  /**
   * Send Rate Con to driver
   */
  private async sendToDriver(data: RateConData, workflow: RateConWorkflow): Promise<void> {
    console.log('📱 Sending Rate Con to driver:', data.driverPhone)
    
    // Create acceptance link (in production, use secure token)
    const acceptanceUrl = `https://superioronelogistics.com/accept-load/${workflow.id}`
    
    const message = `
🚛 LOAD ASSIGNMENT - ACCEPT REQUIRED

Load: ${data.loadId}
From: ${data.pickupAddress}
To: ${data.deliveryAddress}
Date: ${data.pickupDate}
Rate: $${data.rate}/${data.rateMode.replace('PER_', '/').toLowerCase()}

⏰ YOU HAVE 30 MINUTES TO ACCEPT
Deadline: ${new Date(workflow.driverAcceptanceDeadline!).toLocaleString()}

Accept: ${acceptanceUrl}
Reject: Reply "REJECT ${data.loadId}"

If you don't respond, load goes back to load board.
    `

    // In production, integrate with SMS service
    console.log('📱 SMS to driver:', message)
  }

  /**
   * Driver accepts load
   */
  async driverAcceptLoad(workflowId: string, driverPhone: string): Promise<boolean> {
    const workflow = this.workflows.get(workflowId)
    if (!workflow) {
      throw new Error('Workflow not found')
    }

    // Check if deadline has passed
    const deadline = new Date(workflow.driverAcceptanceDeadline!).getTime()
    const now = Date.now()
    
    if (now > deadline) {
      workflow.status = 'EXPIRED'
      this.workflows.set(workflowId, workflow)
      console.log('⏰ Driver acceptance deadline expired for workflow:', workflowId)
      return false
    }

    // Accept load
    workflow.status = 'DRIVER_ACCEPTED'
    workflow.driverAcceptedAt = new Date().toISOString()
    this.workflows.set(workflowId, workflow)

    console.log('✅ Driver accepted load:', workflow.loadId)
    
    // Notify dispatch and customer
    await this.notifyAcceptance(workflow)
    
    return true
  }

  /**
   * Driver rejects load
   */
  async driverRejectLoad(workflowId: string, driverPhone: string): Promise<void> {
    const workflow = this.workflows.get(workflowId)
    if (!workflow) {
      throw new Error('Workflow not found')
    }

    workflow.status = 'REJECTED'
    this.workflows.set(workflowId, workflow)

    console.log('❌ Driver rejected load:', workflow.loadId)
    
    // Notify dispatch and customer
    await this.notifyRejection(workflow)
    
    // Return load to load board
    await this.returnToLoadBoard(workflow.loadId)
  }

  /**
   * Get workflow status
   */
  getWorkflow(workflowId: string): RateConWorkflow | undefined {
    return this.workflows.get(workflowId)
  }

  /**
   * Get workflow by load ID
   */
  getWorkflowByLoadId(loadId: string): RateConWorkflow | undefined {
    for (const workflow of this.workflows.values()) {
      if (workflow.loadId === loadId) {
        return workflow
      }
    }
    return undefined
  }

  /**
   * Check for expired workflows
   */
  checkExpiredWorkflows(): void {
    const now = Date.now()
    
    for (const [workflowId, workflow] of this.workflows.entries()) {
      if (workflow.status === 'DISPATCH_SIGNED') {
        const deadline = new Date(workflow.driverAcceptanceDeadline!).getTime()
        
        if (now > deadline) {
          workflow.status = 'EXPIRED'
          this.workflows.set(workflowId, workflow)
          console.log('⏰ Workflow expired:', workflowId)
          
          // Return load to load board
          this.returnToLoadBoard(workflow.loadId)
        }
      }
    }
  }

  /**
   * Notify acceptance
   */
  private async notifyAcceptance(workflow: RateConWorkflow): Promise<void> {
    console.log('✅ Load accepted - notifying dispatch and customer:', workflow.loadId)
    // In production, send notifications to dispatch and customer
  }

  /**
   * Notify rejection
   */
  private async notifyRejection(workflow: RateConWorkflow): Promise<void> {
    console.log('❌ Load rejected - notifying dispatch and customer:', workflow.loadId)
    // In production, send notifications to dispatch and customer
  }

  /**
   * Return load to load board
   */
  private async returnToLoadBoard(loadId: string): Promise<void> {
    console.log('🔄 Returning load to load board:', loadId)
    // In production, update load status in database
  }
}

// Export singleton instance
export const rateConService = RateConService.getInstance()

// Start periodic check for expired workflows
setInterval(() => {
  rateConService.checkExpiredWorkflows()
}, 60000) // Check every minute

export default rateConService



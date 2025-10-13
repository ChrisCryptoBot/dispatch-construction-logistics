import { z } from 'zod'
import { VALIDATION } from '../../config/constants'

// Common validation schemas
export const emailSchema = z.string()
  .email('Please enter a valid email address')
  .min(1, 'Email is required')

export const passwordSchema = z.string()
  .min(VALIDATION.PASSWORD_MIN_LENGTH, `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters`)
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')

export const phoneSchema = z.string()
  .regex(VALIDATION.PHONE_REGEX, 'Please enter a valid phone number (xxx) xxx-xxxx')

// User schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
})

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  companyName: z.string().min(2, 'Company name is required'),
  phone: phoneSchema,
  role: z.enum(['carrier', 'customer']),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

// Load schemas
export const loadSchema = z.object({
  loadNumber: z.string().min(1, 'Load number is required'),
  origin: z.string().min(1, 'Origin is required'),
  destination: z.string().min(1, 'Destination is required'),
  pickupDate: z.string().min(1, 'Pickup date is required'),
  deliveryDate: z.string().min(1, 'Delivery date is required'),
  revenue: z.number().min(0, 'Revenue must be a positive number'),
  permitCost: z.number().min(0).optional(),
  specialInstructions: z.string().optional(),
})

// Driver schemas
export const driverSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: emailSchema,
  phone: phoneSchema,
  licenseNumber: z.string().min(1, 'License number is required'),
  licenseExpiry: z.string().min(1, 'License expiry date is required'),
  certifications: z.array(z.object({
    type: z.string().min(1, 'Certification type is required'),
    issuedDate: z.string().min(1, 'Issued date is required'),
    expiryDate: z.string().min(1, 'Expiry date is required'),
  })).optional(),
})

// Equipment schemas
export const equipmentSchema = z.object({
  type: z.enum(['tractor', 'trailer', 'both']),
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.number().min(1900).max(new Date().getFullYear() + 1),
  vin: z.string().min(17, 'VIN must be 17 characters'),
  licensePlate: z.string().min(1, 'License plate is required'),
})

// Job site schemas
export const jobSiteSchema = z.object({
  name: z.string().min(1, 'Job site name is required'),
  address: z.string().min(1, 'Address is required'),
  contactPerson: z.string().min(1, 'Contact person is required'),
  phone: phoneSchema,
  email: emailSchema,
  specialInstructions: z.string().optional(),
  accessRequirements: z.string().optional(),
})

// Document schemas
export const documentSchema = z.object({
  type: z.enum(['bol', 'pod', 'permit', 'insurance', 'invoice', 'receipt', 'other']),
  name: z.string().min(1, 'Document name is required'),
  file: z.instanceof(File).optional(),
})

// Billing schemas
export const billingSchema = z.object({
  paymentMethod: z.enum(['credit_card', 'ach', 'check', 'wire_transfer']),
  billingAddress: z.object({
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(2, 'State is required'),
    zipCode: z.string().min(5, 'ZIP code is required'),
    country: z.string().min(1, 'Country is required'),
  }),
  taxId: z.string().optional(),
  paymentTerms: z.string().min(1, 'Payment terms are required'),
})

// Search and filter schemas
export const searchSchema = z.object({
  query: z.string().optional(),
  filters: z.record(z.any()).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
})

// Export all schemas
export const schemas = {
  email: emailSchema,
  password: passwordSchema,
  phone: phoneSchema,
  login: loginSchema,
  register: registerSchema,
  load: loadSchema,
  driver: driverSchema,
  equipment: equipmentSchema,
  jobSite: jobSiteSchema,
  document: documentSchema,
  billing: billingSchema,
  search: searchSchema,
}

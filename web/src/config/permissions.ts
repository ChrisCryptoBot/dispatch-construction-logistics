import { USER_TYPES } from './constants'

// Permission definitions for role-based access control
export const PERMISSIONS = {
  // Load Management
  LOAD_VIEW: 'load:view',
  LOAD_CREATE: 'load:create',
  LOAD_EDIT: 'load:edit',
  LOAD_DELETE: 'load:delete',
  LOAD_ASSIGN: 'load:assign',
  
  // Driver Management
  DRIVER_VIEW: 'driver:view',
  DRIVER_CREATE: 'driver:create',
  DRIVER_EDIT: 'driver:edit',
  DRIVER_DELETE: 'driver:delete',
  DRIVER_ASSIGN: 'driver:assign',
  
  // Fleet Management
  FLEET_VIEW: 'fleet:view',
  FLEET_CREATE: 'fleet:create',
  FLEET_EDIT: 'fleet:edit',
  FLEET_DELETE: 'fleet:delete',
  
  // Compliance
  COMPLIANCE_VIEW: 'compliance:view',
  COMPLIANCE_EDIT: 'compliance:edit',
  
  // Billing
  BILLING_VIEW: 'billing:view',
  BILLING_CREATE: 'billing:create',
  BILLING_EDIT: 'billing:edit',
  
  // Settings
  SETTINGS_VIEW: 'settings:view',
  SETTINGS_EDIT: 'settings:edit',
} as const

// Role-based permissions mapping
export const ROLE_PERMISSIONS = {
  [USER_TYPES.CARRIER]: [
    PERMISSIONS.LOAD_VIEW,
    PERMISSIONS.LOAD_CREATE,
    PERMISSIONS.LOAD_EDIT,
    PERMISSIONS.LOAD_DELETE,
    PERMISSIONS.LOAD_ASSIGN,
    PERMISSIONS.DRIVER_VIEW,
    PERMISSIONS.DRIVER_CREATE,
    PERMISSIONS.DRIVER_EDIT,
    PERMISSIONS.DRIVER_DELETE,
    PERMISSIONS.DRIVER_ASSIGN,
    PERMISSIONS.FLEET_VIEW,
    PERMISSIONS.FLEET_CREATE,
    PERMISSIONS.FLEET_EDIT,
    PERMISSIONS.FLEET_DELETE,
    PERMISSIONS.COMPLIANCE_VIEW,
    PERMISSIONS.COMPLIANCE_EDIT,
    PERMISSIONS.BILLING_VIEW,
    PERMISSIONS.BILLING_CREATE,
    PERMISSIONS.BILLING_EDIT,
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.SETTINGS_EDIT,
  ],
  [USER_TYPES.CUSTOMER]: [
    PERMISSIONS.LOAD_VIEW,
    PERMISSIONS.LOAD_CREATE,
    PERMISSIONS.LOAD_EDIT,
    PERMISSIONS.BILLING_VIEW,
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.SETTINGS_EDIT,
  ],
  [USER_TYPES.ADMIN]: Object.values(PERMISSIONS),
} as const

// Helper function to check permissions
export const hasPermission = (userType: string, permission: string): boolean => {
  return ROLE_PERMISSIONS[userType as keyof typeof ROLE_PERMISSIONS]?.includes(permission) ?? false
}

// Helper function to check multiple permissions
export const hasAnyPermission = (userType: string, permissions: string[]): boolean => {
  return permissions.some(permission => hasPermission(userType, permission))
}

// Helper function to check all permissions
export const hasAllPermissions = (userType: string, permissions: string[]): boolean => {
  return permissions.every(permission => hasPermission(userType, permission))
}

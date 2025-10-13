import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext-fixed';
import { useTheme } from '../contexts/ThemeContext';
import { 
  User, 
  Building, 
  Truck, 
  MapPin, 
  Phone, 
  Mail, 
  Shield, 
  Star,
  CheckCircle,
  AlertCircle,
  Edit,
  Save,
  X,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  FileText,
  CreditCard,
  Settings
} from 'lucide-react';

const profileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  address: z.string().min(10, 'Address must be at least 10 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  state: z.string().min(2, 'State must be at least 2 characters'),
  zipCode: z.string().min(5, 'ZIP code must be at least 5 characters'),
});

const organizationSchema = z.object({
  name: z.string().min(2, 'Organization name must be at least 2 characters'),
  type: z.enum(['CARRIER', 'SHIPPER', 'BROKER']),
  mcNumber: z.string().optional(),
  dotNumber: z.string().optional(),
  ein: z.string().optional(),
  address: z.string().min(10, 'Address must be at least 10 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  state: z.string().min(2, 'State must be at least 2 characters'),
  zipCode: z.string().min(5, 'ZIP code must be at least 5 characters'),
});

const equipmentSchema = z.object({
  type: z.string().min(1, 'Equipment type is required'),
  capacity: z.number().min(0, 'Capacity must be positive'),
  dimensions: z.string().optional(),
  specialFeatures: z.array(z.string()).optional(),
  isActive: z.boolean().default(true),
});

type ProfileFormData = z.infer<typeof profileSchema>;
type OrganizationFormData = z.infer<typeof organizationSchema>;
type EquipmentFormData = z.infer<typeof equipmentSchema>;

const equipmentTypes = [
  'End Dump', 'Transfer Dump', 'Belly Dump', 'Side Dump',
  'Concrete Mixer', 'Flatbed', 'Stepdeck', 'Lowboy/RGN',
  'Dry Van', 'Curtainside', 'Reefer', 'Pneumatic Tanker',
  'Walking Floor', 'Liquid Tanker', 'Hotshot', 'Tilt-bed',
  'Landoll', 'Schnabel', 'Water Truck', 'Fuel Truck'
];

const specialFeatures = [
  'Hazmat Endorsement', 'Temperature Controlled', 'Oversize Capable',
  'Heavy Haul', 'Cross-border', 'Food Grade', 'Liquid Tanker',
  'Pneumatic', 'Walking Floor', 'Side Load', 'Rear Load'
];

export default function ProfilePage() {
  const { user, organization, updateUser, updateOrganization } = useAuth();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [showEquipmentForm, setShowEquipmentForm] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<any>(null);
  const queryClient = useQueryClient();

  // Fetch user profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await api.get('/auth/me');
      return response.data;
    },
  });

  // Fetch organization details
  const { data: orgDetails, isLoading: orgLoading } = useQuery({
    queryKey: ['organization', organization?.id],
    queryFn: async () => {
      const response = await api.get(`/organizations/${organization?.id}`);
      return response.data;
    },
    enabled: !!organization?.id,
  });

  // Fetch equipment
  const { data: equipment, isLoading: equipmentLoading } = useQuery({
    queryKey: ['equipment', organization?.id],
    queryFn: async () => {
      const response = await api.get(`/organizations/${organization?.id}/equipment`);
      return response.data;
    },
    enabled: !!organization?.id && organization?.type === 'CARRIER',
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const response = await api.put('/auth/profile', data);
      return response.data;
    },
    onSuccess: (data) => {
      updateUser(data);
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  // Update organization mutation
  const updateOrganizationMutation = useMutation({
    mutationFn: async (data: OrganizationFormData) => {
      const response = await api.put(`/organizations/${organization?.id}`, data);
      return response.data;
    },
    onSuccess: (data) => {
      updateOrganization(data);
      queryClient.invalidateQueries({ queryKey: ['organization', organization?.id] });
    },
  });

  // Add equipment mutation
  const addEquipmentMutation = useMutation({
    mutationFn: async (data: EquipmentFormData) => {
      const response = await api.post(`/organizations/${organization?.id}/equipment`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment', organization?.id] });
      setShowEquipmentForm(false);
    },
  });

  // Update equipment mutation
  const updateEquipmentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: EquipmentFormData }) => {
      const response = await api.put(`/organizations/${organization?.id}/equipment/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment', organization?.id] });
      setEditingEquipment(null);
    },
  });

  // Delete equipment mutation
  const deleteEquipmentMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/organizations/${organization?.id}/equipment/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment', organization?.id] });
    },
  });

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: profile,
  });

  const {
    register: registerOrg,
    handleSubmit: handleSubmitOrg,
    formState: { errors: orgErrors },
    reset: resetOrg,
  } = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
    defaultValues: orgDetails,
  });

  const {
    register: registerEquipment,
    handleSubmit: handleSubmitEquipment,
    formState: { errors: equipmentErrors },
    reset: resetEquipment,
    watch: watchEquipment,
  } = useForm<EquipmentFormData>({
    resolver: zodResolver(equipmentSchema),
    defaultValues: editingEquipment,
  });

  const onSubmitProfile = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  const onSubmitOrg = (data: OrganizationFormData) => {
    updateOrganizationMutation.mutate(data);
  };

  const onSubmitEquipment = (data: EquipmentFormData) => {
    if (editingEquipment) {
      updateEquipmentMutation.mutate({ id: editingEquipment.id, data });
    } else {
      addEquipmentMutation.mutate(data);
    }
  };

  const handleEditProfile = () => {
    setIsEditing(true);
    resetProfile(profile);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    resetProfile(profile);
  };

  const handleEditEquipment = (equipment: any) => {
    setEditingEquipment(equipment);
    resetEquipment(equipment);
    setShowEquipmentForm(true);
  };

  const handleCancelEquipment = () => {
    setShowEquipmentForm(false);
    setEditingEquipment(null);
    resetEquipment();
  };

  const handleDeleteEquipment = (id: string) => {
    if (confirm('Are you sure you want to delete this equipment?')) {
      deleteEquipmentMutation.mutate(id);
    }
  };

  if (profileLoading || orgLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Profile Management</h1>
            <p className="text-gray-600">Manage your personal and organization information</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center text-sm text-gray-500">
              <Shield className="w-4 h-4 mr-1" />
              Verified
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'personal', label: 'Personal Info', icon: User },
              { id: 'organization', label: 'Organization', icon: Building },
              { id: 'equipment', label: 'Equipment', icon: Truck },
              { id: 'billing', label: 'Billing', icon: CreditCard },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Personal Info Tab */}
          {activeTab === 'personal' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
                {!isEditing ? (
                  <button
                    onClick={handleEditProfile}
                    className="btn btn-secondary flex items-center"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleCancelEdit}
                      className="btn btn-secondary flex items-center"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmitProfile(onSubmitProfile)}
                      disabled={updateProfileMutation.isPending}
                      className="btn btn-primary flex items-center"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </button>
                  </div>
                )}
              </div>

              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      {...registerProfile('firstName')}
                      disabled={!isEditing}
                      className="input"
                    />
                    {profileErrors.firstName && (
                      <p className="mt-1 text-sm text-red-600">{profileErrors.firstName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      {...registerProfile('lastName')}
                      disabled={!isEditing}
                      className="input"
                    />
                    {profileErrors.lastName && (
                      <p className="mt-1 text-sm text-red-600">{profileErrors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    {...registerProfile('email')}
                    disabled={!isEditing}
                    type="email"
                    className="input"
                  />
                  {profileErrors.email && (
                    <p className="mt-1 text-sm text-red-600">{profileErrors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    {...registerProfile('phone')}
                    disabled={!isEditing}
                    type="tel"
                    className="input"
                  />
                  {profileErrors.phone && (
                    <p className="mt-1 text-sm text-red-600">{profileErrors.phone.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <input
                    {...registerProfile('address')}
                    disabled={!isEditing}
                    className="input"
                  />
                  {profileErrors.address && (
                    <p className="mt-1 text-sm text-red-600">{profileErrors.address.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      {...registerProfile('city')}
                      disabled={!isEditing}
                      className="input"
                    />
                    {profileErrors.city && (
                      <p className="mt-1 text-sm text-red-600">{profileErrors.city.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State
                    </label>
                    <input
                      {...registerProfile('state')}
                      disabled={!isEditing}
                      className="input"
                    />
                    {profileErrors.state && (
                      <p className="mt-1 text-sm text-red-600">{profileErrors.state.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ZIP Code
                    </label>
                    <input
                      {...registerProfile('zipCode')}
                      disabled={!isEditing}
                      className="input"
                    />
                    {profileErrors.zipCode && (
                      <p className="mt-1 text-sm text-red-600">{profileErrors.zipCode.message}</p>
                    )}
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Organization Tab */}
          {activeTab === 'organization' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Organization Information</h3>
                <button
                  onClick={handleSubmitOrg(onSubmitOrg)}
                  disabled={updateOrganizationMutation.isPending}
                  className="btn btn-primary flex items-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </button>
              </div>

              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization Name
                  </label>
                  <input
                    {...registerOrg('name')}
                    className="input"
                  />
                  {orgErrors.name && (
                    <p className="mt-1 text-sm text-red-600">{orgErrors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization Type
                  </label>
                  <select {...registerOrg('type')} className="input">
                    <option value="CARRIER">Carrier</option>
                    <option value="SHIPPER">Shipper</option>
                    <option value="BROKER">Broker</option>
                  </select>
                  {orgErrors.type && (
                    <p className="mt-1 text-sm text-red-600">{orgErrors.type.message}</p>
                  )}
                </div>

                {organization?.type === 'CARRIER' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        MC Number
                      </label>
                      <input
                        {...registerOrg('mcNumber')}
                        className="input"
                        placeholder="123456"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        DOT Number
                      </label>
                      <input
                        {...registerOrg('dotNumber')}
                        className="input"
                        placeholder="1234567"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    EIN (Employer Identification Number)
                  </label>
                  <input
                    {...registerOrg('ein')}
                    className="input"
                    placeholder="12-3456789"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Address
                  </label>
                  <input
                    {...registerOrg('address')}
                    className="input"
                  />
                  {orgErrors.address && (
                    <p className="mt-1 text-sm text-red-600">{orgErrors.address.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      {...registerOrg('city')}
                      className="input"
                    />
                    {orgErrors.city && (
                      <p className="mt-1 text-sm text-red-600">{orgErrors.city.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State
                    </label>
                    <input
                      {...registerOrg('state')}
                      className="input"
                    />
                    {orgErrors.state && (
                      <p className="mt-1 text-sm text-red-600">{orgErrors.state.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ZIP Code
                    </label>
                    <input
                      {...registerOrg('zipCode')}
                      className="input"
                    />
                    {orgErrors.zipCode && (
                      <p className="mt-1 text-sm text-red-600">{orgErrors.zipCode.message}</p>
                    )}
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Equipment Tab */}
          {activeTab === 'equipment' && organization?.type === 'CARRIER' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Equipment Fleet</h3>
                <button
                  onClick={() => setShowEquipmentForm(true)}
                  className="btn btn-primary flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Equipment
                </button>
              </div>

              {equipmentLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : equipment && equipment.length > 0 ? (
                <div className="space-y-4">
                  {equipment.map((item: any) => (
                    <div key={item.id} className="bg-white rounded-lg border border-gray-200 p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-lg font-medium text-gray-900">{item.type}</h4>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              item.isActive ? 'text-green-600 bg-green-100' : 'text-gray-600 bg-gray-100'
                            }`}>
                              {item.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Capacity:</span> {item.capacity} lbs
                            </div>
                            {item.dimensions && (
                              <div>
                                <span className="font-medium">Dimensions:</span> {item.dimensions}
                              </div>
                            )}
                            {item.specialFeatures && item.specialFeatures.length > 0 && (
                              <div>
                                <span className="font-medium">Features:</span> {item.specialFeatures.join(', ')}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => handleEditEquipment(item)}
                            className="btn btn-secondary text-sm"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteEquipment(item.id)}
                            className="btn btn-danger text-sm"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Truck className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No equipment added yet</h3>
                  <p className="text-gray-500 mb-4">Add your equipment to get better load matches.</p>
                  <button
                    onClick={() => setShowEquipmentForm(true)}
                    className="btn btn-primary"
                  >
                    Add Equipment
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Billing Tab */}
          {activeTab === 'billing' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Billing Information</h3>
              <div className="text-center py-12">
                <CreditCard className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Billing coming soon</h3>
                <p className="text-gray-500">Payment methods and billing history will be available here.</p>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Account Settings</h3>
              <div className="text-center py-12">
                <Settings className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Settings coming soon</h3>
                <p className="text-gray-500">Account preferences and notifications will be available here.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Equipment Form Modal */}
      {showEquipmentForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingEquipment ? 'Edit Equipment' : 'Add Equipment'}
              </h3>
              <form onSubmit={handleSubmitEquipment(onSubmitEquipment)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Equipment Type
                  </label>
                  <select {...registerEquipment('type')} className="input">
                    <option value="">Select equipment type</option>
                    {equipmentTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {equipmentErrors.type && (
                    <p className="mt-1 text-sm text-red-600">{equipmentErrors.type.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Capacity (lbs)
                  </label>
                  <input
                    {...registerEquipment('capacity', { valueAsNumber: true })}
                    type="number"
                    className="input"
                    placeholder="80000"
                  />
                  {equipmentErrors.capacity && (
                    <p className="mt-1 text-sm text-red-600">{equipmentErrors.capacity.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dimensions (optional)
                  </label>
                  <input
                    {...registerEquipment('dimensions')}
                    className="input"
                    placeholder="48' x 8' x 13'"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Features
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {specialFeatures.map((feature) => (
                      <label key={feature} className="flex items-center">
                        <input
                          type="checkbox"
                          value={feature}
                          {...registerEquipment('specialFeatures')}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">{feature}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    {...registerEquipment('isActive')}
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">Active</label>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCancelEquipment}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addEquipmentMutation.isPending || updateEquipmentMutation.isPending}
                    className="btn btn-primary"
                  >
                    {editingEquipment ? 'Update' : 'Add'} Equipment
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext-fixed';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  organizationName: z.string().min(2, 'Organization name must be at least 2 characters'),
  organizationType: z.enum(['CARRIER', 'SHIPPER', 'BROKER']),
  mcNumber: z.string().optional(),
  dotNumber: z.string().optional(),
  ein: z.string().optional(),
  address: z.string().min(10, 'Address must be at least 10 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  state: z.string().min(2, 'State must be at least 2 characters'),
  zipCode: z.string().min(5, 'ZIP code must be at least 5 characters'),
  equipmentTypes: z.array(z.string()).optional(),
  serviceAreas: z.array(z.string()).optional(),
  maxDistance: z.number().optional(),
  factoringPreference: z.enum(['QUICKPAY', 'BYOF', 'MARKETPLACE', 'NONE']).optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

const equipmentOptions = [
  'End Dump', 'Transfer Dump', 'Belly Dump', 'Side Dump',
  'Concrete Mixer', 'Flatbed', 'Stepdeck', 'Lowboy/RGN',
  'Dry Van', 'Curtainside', 'Reefer', 'Pneumatic Tanker',
  'Walking Floor', 'Liquid Tanker', 'Hotshot', 'Tilt-bed',
  'Landoll', 'Schnabel', 'Water Truck', 'Fuel Truck'
];

const serviceAreaOptions = [
  'Metro/Zone', 'Regional (50-150mi)', 'OTR (150+mi)',
  'Local (30mi radius)', 'Cross-border', 'Heavy Haul',
  'Hazmat', 'Temperature Controlled'
];

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
    getValues
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const organizationType = watch('organizationType');

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post('/auth/register', {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        organizationName: data.organizationName,
        organizationType: data.organizationType,
        mcNumber: data.mcNumber,
        dotNumber: data.dotNumber,
        ein: data.ein,
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        equipmentTypes: data.equipmentTypes,
        serviceAreas: data.serviceAreas,
        maxDistance: data.maxDistance,
        factoringPreference: data.factoringPreference,
      });

      if (response.data.token) {
        await login(response.data.token, response.data.user, response.data.organization);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Dispatch Logistics</h1>
          <p className="mt-2 text-sm text-gray-600">
            Join the carrier-first construction logistics platform
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    First Name *
                  </label>
                  <input
                    {...register('firstName')}
                    className="input"
                    placeholder="John"
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Last Name *
                  </label>
                  <input
                    {...register('lastName')}
                    className="input"
                    placeholder="Doe"
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email Address *
                </label>
                <input
                  {...register('email')}
                  type="email"
                  className="input"
                  placeholder="john@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone Number *
                </label>
                <input
                  {...register('phone')}
                  type="tel"
                  className="input"
                  placeholder="(555) 123-4567"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Password *
                  </label>
                  <input
                    {...register('password')}
                    type="password"
                    className="input"
                    placeholder="••••••••"
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Confirm Password *
                  </label>
                  <input
                    {...register('confirmPassword')}
                    type="password"
                    className="input"
                    placeholder="••••••••"
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Organization Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Organization Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Organization Type *
                </label>
                <select {...register('organizationType')} className="input">
                  <option value="">Select organization type</option>
                  <option value="CARRIER">Carrier (Transportation Company)</option>
                  <option value="SHIPPER">Shipper (Construction Company)</option>
                  <option value="BROKER">Broker (Freight Broker)</option>
                </select>
                {errors.organizationType && (
                  <p className="mt-1 text-sm text-red-600">{errors.organizationType.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Organization Name *
                </label>
                <input
                  {...register('organizationName')}
                  className="input"
                  placeholder="ABC Construction LLC"
                />
                {errors.organizationName && (
                  <p className="mt-1 text-sm text-red-600">{errors.organizationName.message}</p>
                )}
              </div>

              {/* Carrier-specific fields */}
              {organizationType === 'CARRIER' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        MC Number
                      </label>
                      <input
                        {...register('mcNumber')}
                        className="input"
                        placeholder="123456"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        DOT Number
                      </label>
                      <input
                        {...register('dotNumber')}
                        className="input"
                        placeholder="1234567"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Equipment Types
                    </label>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {equipmentOptions.map((equipment) => (
                        <label key={equipment} className="flex items-center">
                          <input
                            type="checkbox"
                            value={equipment}
                            {...register('equipmentTypes')}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">{equipment}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Service Areas
                    </label>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {serviceAreaOptions.map((area) => (
                        <label key={area} className="flex items-center">
                          <input
                            type="checkbox"
                            value={area}
                            {...register('serviceAreas')}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">{area}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Maximum Distance (miles)
                    </label>
                    <input
                      {...register('maxDistance', { valueAsNumber: true })}
                      type="number"
                      className="input"
                      placeholder="500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Factoring Preference
                    </label>
                    <select {...register('factoringPreference')} className="input">
                      <option value="">Select preference</option>
                      <option value="QUICKPAY">QuickPay (36h payout)</option>
                      <option value="BYOF">Bring Your Own Factor</option>
                      <option value="MARKETPLACE">Marketplace (Compare offers)</option>
                      <option value="NONE">No factoring needed</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Business Information */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  EIN (Employer Identification Number)
                </label>
                <input
                  {...register('ein')}
                  className="input"
                  placeholder="12-3456789"
                />
              </div>
            </div>

            {/* Address Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Address Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Street Address *
                </label>
                <input
                  {...register('address')}
                  className="input"
                  placeholder="123 Main St"
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    City *
                  </label>
                  <input
                    {...register('city')}
                    className="input"
                    placeholder="Dallas"
                  />
                  {errors.city && (
                    <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    State *
                  </label>
                  <input
                    {...register('state')}
                    className="input"
                    placeholder="TX"
                  />
                  {errors.state && (
                    <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    ZIP Code *
                  </label>
                  <input
                    {...register('zipCode')}
                    className="input"
                    placeholder="75201"
                  />
                  {errors.zipCode && (
                    <p className="mt-1 text-sm text-red-600">{errors.zipCode.message}</p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn btn-primary"
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

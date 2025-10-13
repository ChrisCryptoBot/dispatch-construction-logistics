import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext-fixed';
import { useTheme } from '../contexts/ThemeContext';
import { 
  MapPin, 
  Calendar, 
  Package, 
  Truck, 
  DollarSign, 
  AlertCircle,
  CheckCircle,
  Info,
  Calculator,
  Scale,
  FileText,
  Zap
} from 'lucide-react';

const loadSchema = z.object({
  commodity: z.string().min(1, 'Commodity is required'),
  loadType: z.enum(['AGGREGATE', 'CONCRETE', 'EQUIPMENT', 'DEBRIS', 'STEEL', 'LUMBER', 'OTHER']),
  origin: z.string().min(1, 'Origin is required'),
  destination: z.string().min(1, 'Destination is required'),
  pickupDate: z.string().min(1, 'Pickup date is required'),
  deliveryDate: z.string().min(1, 'Delivery date is required'),
  rateMode: z.enum(['PER_TON', 'PER_YARD', 'PER_MILE', 'PER_TRIP', 'PER_HOUR', 'PER_LOAD', 'DAILY']),
  rate: z.number().min(0, 'Rate must be positive'),
  weight: z.number().optional(),
  volume: z.number().optional(),
  distance: z.number().optional(),
  equipmentType: z.string().optional(),
  equipmentOverride: z.string().optional(),
  specialInstructions: z.string().optional(),
  hazmat: z.boolean().optional(),
  temperatureControlled: z.boolean().optional(),
  oversize: z.boolean().optional(),
  overweight: z.boolean().optional(),
  publicProject: z.boolean().optional(),
  prevailingWage: z.boolean().optional(),
  dumpFee: z.number().optional(),
  fuelSurcharge: z.number().optional(),
  tolls: z.number().optional(),
  accessorials: z.number().optional(),
});

type LoadFormData = z.infer<typeof loadSchema>;

const commodityOptions = [
  'Crushed Stone', 'Gravel', 'Sand', 'Concrete', 'Asphalt', 'Dirt', 'Debris',
  'Steel Beams', 'Lumber', 'Equipment', 'Pipe', 'Aggregates', 'Topsoil',
  'Mulch', 'Rip-rap', 'Railroad Ballast', 'Other'
];

const equipmentOptions = [
  { value: 'END_DUMP', label: 'End Dump', tier: 'optimal', description: 'Standard for aggregates, dirt, debris' },
  { value: 'TRANSFER_DUMP', label: 'Transfer Dump', tier: 'optimal', description: 'Higher capacity for bulk materials' },
  { value: 'BELLY_DUMP', label: 'Belly Dump', tier: 'optimal', description: 'Faster unloading for loose materials' },
  { value: 'SIDE_DUMP', label: 'Side Dump', tier: 'optimal', description: 'Precise placement for walls, trenches' },
  { value: 'CONCRETE_MIXER', label: 'Concrete Mixer', tier: 'optimal', description: 'Ready-mix concrete delivery' },
  { value: 'FLATBED', label: 'Flatbed', tier: 'acceptable', description: 'Steel, lumber, equipment transport' },
  { value: 'STEPDECK', label: 'Stepdeck', tier: 'acceptable', description: 'Taller loads, equipment' },
  { value: 'LOWBOY', label: 'Lowboy/RGN', tier: 'optimal', description: 'Heavy equipment transport' },
  { value: 'DRY_VAN', label: 'Dry Van', tier: 'unusual', description: 'Weather-sensitive materials' },
  { value: 'CURTAINSIDE', label: 'Curtainside', tier: 'acceptable', description: 'Side-load access' },
  { value: 'REEFER', label: 'Reefer', tier: 'unusual', description: 'Temperature-controlled materials' },
  { value: 'PNEUMATIC_TANKER', label: 'Pneumatic Tanker', tier: 'optimal', description: 'Cement, fly ash, lime' },
  { value: 'WALKING_FLOOR', label: 'Walking Floor', tier: 'optimal', description: 'Wood chips, mulch, lightweight' },
  { value: 'LIQUID_TANKER', label: 'Liquid Tanker', tier: 'optimal', description: 'Asphalt emulsion, sealants' },
  { value: 'HOTSHOT', label: 'Hotshot', tier: 'acceptable', description: 'Urgent small loads' },
  { value: 'TILT_BED', label: 'Tilt-bed', tier: 'acceptable', description: 'Non-running equipment' },
  { value: 'LANDOLL', label: 'Landoll', tier: 'acceptable', description: 'Low-angle loading' },
  { value: 'SCHNABEL', label: 'Schnabel', tier: 'optimal', description: 'Extreme heavy haul' },
];

const rateModeOptions = [
  { value: 'PER_TON', label: 'Per Ton', description: 'Aggregates, asphalt, concrete rubble, dirt' },
  { value: 'PER_YARD', label: 'Per Yard', description: 'Concrete, topsoil, mulch' },
  { value: 'PER_MILE', label: 'Per Mile', description: 'OTR hauls, equipment moves' },
  { value: 'PER_TRIP', label: 'Per Trip', description: 'Dump runs, debris removal' },
  { value: 'PER_HOUR', label: 'Per Hour', description: 'Equipment transport, wait time' },
  { value: 'PER_LOAD', label: 'Per Load', description: 'Flat rate for specific origin → destination' },
  { value: 'DAILY', label: 'Daily Rate', description: 'Equipment rental with operator' },
];

export default function LoadCreatePage() {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [equipmentSuggestions, setEquipmentSuggestions] = useState<any[]>([]);
  const [haulType, setHaulType] = useState<string>('');
  const [distance, setDistance] = useState<number>(0);
  const [complianceChecks, setComplianceChecks] = useState<any[]>([]);
  const [grossRevenue, setGrossRevenue] = useState<number>(0);
  const navigate = useNavigate();
  const { organization } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<LoadFormData>({
    resolver: zodResolver(loadSchema),
  });

  const watchedCommodity = watch('commodity');
  const watchedRateMode = watch('rateMode');
  const watchedRate = watch('rate');
  const watchedWeight = watch('weight');
  const watchedVolume = watch('volume');
  const watchedDistance = watch('distance');

  // Equipment matching logic
  React.useEffect(() => {
    if (watchedCommodity) {
      const suggestions = equipmentOptions.filter(equipment => {
        const commodity = watchedCommodity.toLowerCase();
        if (commodity.includes('stone') || commodity.includes('gravel') || commodity.includes('aggregate')) {
          return equipment.value.includes('DUMP') || equipment.value === 'PNEUMATIC_TANKER';
        }
        if (commodity.includes('concrete')) {
          return equipment.value === 'CONCRETE_MIXER';
        }
        if (commodity.includes('steel') || commodity.includes('beam')) {
          return equipment.value === 'FLATBED' || equipment.value === 'STEPDECK';
        }
        if (commodity.includes('equipment')) {
          return equipment.value === 'LOWBOY' || equipment.value === 'TILT_BED';
        }
        return true;
      });
      setEquipmentSuggestions(suggestions);
    }
  }, [watchedCommodity]);

  // Distance calculation
  React.useEffect(() => {
    const origin = watch('origin');
    const destination = watch('destination');
    if (origin && destination) {
      // In a real app, you'd call a mapping service
      const mockDistance = Math.floor(Math.random() * 500) + 50;
      setDistance(mockDistance);
      setValue('distance', mockDistance);
      
      // Determine haul type
      if (mockDistance < 50) {
        setHaulType('Metro');
      } else if (mockDistance < 150) {
        setHaulType('Regional');
      } else {
        setHaulType('OTR');
      }
    }
  }, [watch('origin'), watch('destination')]);

  // Compliance checking
  React.useEffect(() => {
    const checks = [];
    const weight = watchedWeight || 0;
    const isOversize = watch('oversize');
    const isOverweight = watch('overweight');
    const isHazmat = watch('hazmat');

    if (weight > 80000) {
      checks.push({
        type: 'warning',
        message: 'Load exceeds 80,000 lbs. Overweight permit required.',
        action: 'Add overweight permit'
      });
    }

    if (isOversize) {
      checks.push({
        type: 'warning',
        message: 'Oversize load detected. Escort and permits required.',
        action: 'Add oversize permit and escort'
      });
    }

    if (isHazmat) {
      checks.push({
        type: 'warning',
        message: 'Hazmat load detected. Proper placarding and documentation required.',
        action: 'Add hazmat documentation'
      });
    }

    setComplianceChecks(checks);
  }, [watchedWeight, watch('oversize'), watch('overweight'), watch('hazmat')]);

  // Revenue calculation
  React.useEffect(() => {
    const rate = watchedRate || 0;
    const weight = watchedWeight || 0;
    const volume = watchedVolume || 0;
    const distance = watchedDistance || 0;
    const dumpFee = watch('dumpFee') || 0;
    const fuelSurcharge = watch('fuelSurcharge') || 0;
    const tolls = watch('tolls') || 0;
    const accessorials = watch('accessorials') || 0;

    let revenue = 0;
    switch (watchedRateMode) {
      case 'PER_TON':
        revenue = (weight * rate) + dumpFee + fuelSurcharge;
        break;
      case 'PER_YARD':
        revenue = (volume * rate) + dumpFee + fuelSurcharge;
        break;
      case 'PER_MILE':
        revenue = (distance * rate) + tolls + fuelSurcharge;
        break;
      case 'PER_TRIP':
      case 'PER_LOAD':
        revenue = rate + accessorials;
        break;
      case 'PER_HOUR':
        revenue = rate * 8; // Assuming 8-hour day
        break;
      case 'DAILY':
        revenue = rate;
        break;
    }

    setGrossRevenue(revenue);
  }, [watchedRate, watchedWeight, watchedVolume, watchedDistance, watchedRateMode, watch('dumpFee'), watch('fuelSurcharge'), watch('tolls'), watch('accessorials')]);

  const onSubmit = async (data: LoadFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post('/loads', {
        ...data,
        orgId: organization?.id,
        shipperId: organization?.id,
        status: 'DRAFT',
        haulType,
        distance,
        grossRevenue,
      });

      navigate(`/loads/${response.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create load');
    } finally {
      setIsLoading(false);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'optimal': return 'text-green-600 bg-green-100 border-green-200';
      case 'acceptable': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'unusual': return 'text-orange-600 bg-orange-100 border-orange-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'optimal': return <CheckCircle className="w-4 h-4" />;
      case 'acceptable': return <Info className="w-4 h-4" />;
      case 'unusual': return <AlertCircle className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create New Load</h1>
            <p className="text-gray-600">Create a load and let our system suggest optimal equipment</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center text-sm text-gray-500">
              <Zap className="w-4 h-4 mr-1" />
              Smart Matching
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Load Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Package className="w-5 h-5 mr-2" />
            Load Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Commodity *
              </label>
              <select {...register('commodity')} className="input">
                <option value="">Select commodity</option>
                {commodityOptions.map((commodity) => (
                  <option key={commodity} value={commodity}>{commodity}</option>
                ))}
              </select>
              {errors.commodity && (
                <p className="mt-1 text-sm text-red-600">{errors.commodity.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Load Type *
              </label>
              <select {...register('loadType')} className="input">
                <option value="">Select load type</option>
                <option value="AGGREGATE">Aggregate</option>
                <option value="CONCRETE">Concrete</option>
                <option value="EQUIPMENT">Equipment</option>
                <option value="DEBRIS">Debris</option>
                <option value="STEEL">Steel</option>
                <option value="LUMBER">Lumber</option>
                <option value="OTHER">Other</option>
              </select>
              {errors.loadType && (
                <p className="mt-1 text-sm text-red-600">{errors.loadType.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Route Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Route Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Origin *
              </label>
              <input
                {...register('origin')}
                className="input"
                placeholder="123 Main St, Dallas, TX"
              />
              {errors.origin && (
                <p className="mt-1 text-sm text-red-600">{errors.origin.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Destination *
              </label>
              <input
                {...register('destination')}
                className="input"
                placeholder="456 Oak Ave, Houston, TX"
              />
              {errors.destination && (
                <p className="mt-1 text-sm text-red-600">{errors.destination.message}</p>
              )}
            </div>
          </div>

          {distance > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-900">Distance: {distance} miles</p>
                  <p className="text-sm text-blue-700">Haul Type: {haulType}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-blue-700">
                    {haulType === 'Metro' && 'Local construction work'}
                    {haulType === 'Regional' && 'Regional haul'}
                    {haulType === 'OTR' && 'Long-haul transport'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Schedule */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Schedule
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pickup Date *
              </label>
              <input
                {...register('pickupDate')}
                type="datetime-local"
                className="input"
              />
              {errors.pickupDate && (
                <p className="mt-1 text-sm text-red-600">{errors.pickupDate.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Date *
              </label>
              <input
                {...register('deliveryDate')}
                type="datetime-local"
                className="input"
              />
              {errors.deliveryDate && (
                <p className="mt-1 text-sm text-red-600">{errors.deliveryDate.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Equipment Matching */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Truck className="w-5 h-5 mr-2" />
            Equipment Matching
          </h3>
          
          {equipmentSuggestions.length > 0 && (
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-3">Suggested equipment for {watchedCommodity}:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {equipmentSuggestions.slice(0, 6).map((equipment) => (
                  <div
                    key={equipment.value}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${getTierColor(equipment.tier)}`}
                    onClick={() => setValue('equipmentType', equipment.value)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {getTierIcon(equipment.tier)}
                        <span className="ml-2 font-medium">{equipment.label}</span>
                      </div>
                      <div className="text-xs font-medium">
                        {equipment.tier === 'optimal' && 'OPTIMAL'}
                        {equipment.tier === 'acceptable' && 'ACCEPTABLE'}
                        {equipment.tier === 'unusual' && 'UNUSUAL'}
                      </div>
                    </div>
                    <p className="text-xs mt-1 opacity-75">{equipment.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Equipment Override (Optional)
            </label>
            <input
              {...register('equipmentOverride')}
              className="input"
              placeholder="Reason for override (e.g., 'These are 1-ton super sacks for rooftop ballast')"
            />
            <p className="mt-1 text-xs text-gray-500">
              If you choose non-standard equipment, explain why to help us learn.
            </p>
          </div>
        </div>

        {/* Rate & Pricing */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <DollarSign className="w-5 h-5 mr-2" />
            Rate & Pricing
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rate Mode *
              </label>
              <select {...register('rateMode')} className="input">
                <option value="">Select rate mode</option>
                {rateModeOptions.map((mode) => (
                  <option key={mode.value} value={mode.value}>
                    {mode.label} - {mode.description}
                  </option>
                ))}
              </select>
              {errors.rateMode && (
                <p className="mt-1 text-sm text-red-600">{errors.rateMode.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rate *
              </label>
              <input
                {...register('rate', { valueAsNumber: true })}
                type="number"
                step="0.01"
                className="input"
                placeholder="0.00"
              />
              {errors.rate && (
                <p className="mt-1 text-sm text-red-600">{errors.rate.message}</p>
              )}
            </div>
          </div>

          {/* Load Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weight (lbs)
              </label>
              <input
                {...register('weight', { valueAsNumber: true })}
                type="number"
                className="input"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Volume (cubic yards)
              </label>
              <input
                {...register('volume', { valueAsNumber: true })}
                type="number"
                step="0.1"
                className="input"
                placeholder="0.0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Distance (miles)
              </label>
              <input
                {...register('distance', { valueAsNumber: true })}
                type="number"
                value={distance}
                readOnly
                className="input bg-gray-50"
              />
            </div>
          </div>

          {/* Additional Fees */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dump Fee
              </label>
              <input
                {...register('dumpFee', { valueAsNumber: true })}
                type="number"
                step="0.01"
                className="input"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fuel Surcharge
              </label>
              <input
                {...register('fuelSurcharge', { valueAsNumber: true })}
                type="number"
                step="0.01"
                className="input"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tolls
              </label>
              <input
                {...register('tolls', { valueAsNumber: true })}
                type="number"
                step="0.01"
                className="input"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Accessorials
              </label>
              <input
                {...register('accessorials', { valueAsNumber: true })}
                type="number"
                step="0.01"
                className="input"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Revenue Calculation */}
          {grossRevenue > 0 && (
            <div className="mt-6 p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Calculator className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-sm font-medium text-green-900">Estimated Gross Revenue</span>
                </div>
                <span className="text-2xl font-bold text-green-600">${grossRevenue.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>

        {/* Compliance & Special Requirements */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            Compliance & Special Requirements
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  {...register('hazmat')}
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">Hazmat Load</label>
              </div>

              <div className="flex items-center">
                <input
                  {...register('temperatureControlled')}
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">Temperature Controlled</label>
              </div>

              <div className="flex items-center">
                <input
                  {...register('oversize')}
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">Oversize Load</label>
              </div>

              <div className="flex items-center">
                <input
                  {...register('overweight')}
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">Overweight Load</label>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  {...register('publicProject')}
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">Public Project</label>
              </div>

              <div className="flex items-center">
                <input
                  {...register('prevailingWage')}
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">Prevailing Wage Required</label>
              </div>
            </div>
          </div>

          {/* Compliance Checks */}
          {complianceChecks.length > 0 && (
            <div className="mt-6 space-y-3">
              <h4 className="text-sm font-medium text-gray-900">Compliance Checks</h4>
              {complianceChecks.map((check, index) => (
                <div key={index} className="flex items-center p-3 bg-yellow-50 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mr-3" />
                  <div className="flex-1">
                    <p className="text-sm text-yellow-800">{check.message}</p>
                    <p className="text-xs text-yellow-600 mt-1">Action: {check.action}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Special Instructions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Special Instructions
          </h3>
          
          <textarea
            {...register('specialInstructions')}
            rows={4}
            className="input"
            placeholder="Any special instructions for the carrier..."
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary"
          >
            {isLoading ? 'Creating Load...' : 'Create Load'}
          </button>
        </div>
      </form>
    </div>
  );
}
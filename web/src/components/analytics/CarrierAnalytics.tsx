import React from 'react';
import { 
  Truck, 
  DollarSign, 
  Clock, 
  TrendingUp, 
  MapPin,
  Star,
  Award,
  Calendar,
  Users,
  Target
} from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { formatNumber, formatCurrency } from '../../utils/formatters';

interface CarrierAnalyticsProps {
  data?: {
    totalEarnings: number;
    monthlyEarnings: number;
    activeLoads: number;
    availableLoads: number;
    performanceScore: number;
    averageRating: number;
    totalMiles: number;
    completedThisMonth: number;
    onTimeRate: number;
    driverCount: number;
  };
  isLoading?: boolean;
}

const CarrierAnalytics: React.FC<CarrierAnalyticsProps> = ({ 
  data = {
    totalEarnings: 89500,
    monthlyEarnings: 18500,
    activeLoads: 4,
    availableLoads: 12,
    performanceScore: 87,
    averageRating: 4.6,
    totalMiles: 15420,
    completedThisMonth: 18,
    onTimeRate: 96,
    driverCount: 3
  }, 
  isLoading = false 
}) => {
  const { theme } = useTheme();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg h-32"></div>
        ))}
      </div>
    );
  }

  const metrics = [
    {
      title: 'Total Earnings',
      value: formatCurrency(data?.totalEarnings),
      change: '+15.3%',
      changeType: 'positive' as const,
      icon: DollarSign,
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      title: 'This Month',
      value: formatCurrency(data?.monthlyEarnings),
      change: '+22.1%',
      changeType: 'positive' as const,
      icon: TrendingUp,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      title: 'Active Loads',
      value: data.activeLoads.toString(),
      change: '+1',
      changeType: 'positive' as const,
      icon: Truck,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    },
    {
      title: 'Available Loads',
      value: data.availableLoads.toString(),
      change: '+3',
      changeType: 'positive' as const,
      icon: MapPin,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20'
    },
    {
      title: 'Performance Score',
      value: `${data.performanceScore}%`,
      change: '+3%',
      changeType: 'positive' as const,
      icon: Award,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20'
    },
    {
      title: 'Average Rating',
      value: formatNumber(data?.averageRating, '0'),
      change: '+0.2',
      changeType: 'positive' as const,
      icon: Star,
      color: 'text-amber-500',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20'
    },
    {
      title: 'Total Miles',
      value: formatNumber(data?.totalMiles),
      change: '+1,240',
      changeType: 'positive' as const,
      icon: Target,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20'
    },
    {
      title: 'Completed This Month',
      value: data.completedThisMonth.toString(),
      change: '+4',
      changeType: 'positive' as const,
      icon: Calendar,
      color: 'text-teal-500',
      bgColor: 'bg-teal-50 dark:bg-teal-900/20'
    },
    {
      title: 'On-Time Rate',
      value: `${data.onTimeRate}%`,
      change: '+1.5%',
      changeType: 'positive' as const,
      icon: Clock,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20'
    },
    {
      title: 'Active Drivers',
      value: data.driverCount.toString(),
      change: '+1',
      changeType: 'positive' as const,
      icon: Users,
      color: 'text-rose-500',
      bgColor: 'bg-rose-50 dark:bg-rose-900/20'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div
              key={index}
              className={`${metric.bgColor} rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-200`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    {metric.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {metric.value}
                  </p>
                  <div className="flex items-center mt-2">
                    <span
                      className={`text-xs font-medium ${
                        metric.changeType === 'positive'
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {metric.change}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                      vs last month
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                  <Icon className={`w-6 h-6 ${metric.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Performance Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Score */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Performance Score
          </h3>
          <div className="flex items-center justify-center mb-4">
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-gray-200 dark:text-gray-700"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 54}`}
                  strokeDashoffset={`${2 * Math.PI * 54 * (1 - data.performanceScore / 100)}`}
                  className="text-green-500 transition-all duration-1000"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  {data.performanceScore}%
                </span>
              </div>
            </div>
          </div>
          <p className="text-center text-sm text-gray-600 dark:text-gray-300">
            Based on on-time delivery, customer ratings, and load completion rate
          </p>
        </div>

        {/* Rating & Metrics */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Ratings & Metrics
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-300">Customer Rating</span>
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(data.averageRating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {data.averageRating}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-300">On-Time Rate</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">{data.onTimeRate}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${data.onTimeRate}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-300">Load Completion</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">98%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: '98%' }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="flex items-center justify-center gap-2 p-4 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
            <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Browse Loads</span>
          </button>
          <button className="flex items-center justify-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors">
            <Truck className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-green-900 dark:text-green-100">My Loads</span>
          </button>
          <button className="flex items-center justify-center gap-2 p-4 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors">
            <DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-medium text-purple-900 dark:text-purple-100">Earnings</span>
          </button>
          <button className="flex items-center justify-center gap-2 p-4 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded-lg transition-colors">
            <Users className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            <span className="text-sm font-medium text-orange-900 dark:text-orange-100">Drivers</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CarrierAnalytics;

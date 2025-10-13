import React from 'react';
import { 
  Truck, 
  DollarSign, 
  Clock, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Calendar,
  Package
} from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { formatNumber, formatCurrency } from '../../utils/formatters';

interface CustomerAnalyticsProps {
  data?: {
    totalRevenue: number;
    monthlyRevenue: number;
    activeLoads: number;
    pendingDeliveries: number;
    averageDeliveryTime: number;
    onTimeRate: number;
    totalLoads: number;
    completedThisMonth: number;
  };
  isLoading?: boolean;
}

const CustomerAnalytics: React.FC<CustomerAnalyticsProps> = ({ 
  data = {
    totalRevenue: 125000,
    monthlyRevenue: 25000,
    activeLoads: 8,
    pendingDeliveries: 3,
    averageDeliveryTime: 2.5,
    onTimeRate: 94,
    totalLoads: 156,
    completedThisMonth: 23
  }, 
  isLoading = false 
}) => {
  const { theme } = useTheme();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg h-32"></div>
        ))}
      </div>
    );
  }

  const metrics = [
    {
      title: 'Total Revenue',
      value: formatCurrency(data?.totalRevenue),
      change: '+12.5%',
      changeType: 'positive' as const,
      icon: DollarSign,
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      title: 'This Month',
      value: formatCurrency(data?.monthlyRevenue),
      change: '+8.2%',
      changeType: 'positive' as const,
      icon: TrendingUp,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      title: 'Active Loads',
      value: data.activeLoads.toString(),
      change: '+2',
      changeType: 'positive' as const,
      icon: Truck,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    },
    {
      title: 'Pending Deliveries',
      value: data.pendingDeliveries.toString(),
      change: '-1',
      changeType: 'positive' as const,
      icon: Package,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20'
    },
    {
      title: 'Avg Delivery Time',
      value: `${data.averageDeliveryTime} days`,
      change: '-0.3 days',
      changeType: 'positive' as const,
      icon: Clock,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20'
    },
    {
      title: 'On-Time Rate',
      value: `${data.onTimeRate}%`,
      change: '+2.1%',
      changeType: 'positive' as const,
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      title: 'Total Loads',
      value: data.totalLoads.toString(),
      change: '+15',
      changeType: 'positive' as const,
      icon: Calendar,
      color: 'text-teal-500',
      bgColor: 'bg-teal-50 dark:bg-teal-900/20'
    },
    {
      title: 'Completed This Month',
      value: data.completedThisMonth.toString(),
      change: '+5',
      changeType: 'positive' as const,
      icon: CheckCircle,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      {/* Performance Insights */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Performance Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-300">On-Time Delivery Rate</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">{data.onTimeRate}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${data.onTimeRate}%` }}
              ></div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-300">Average Delivery Time</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">{data.averageDeliveryTime} days</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((data.averageDeliveryTime / 5) * 100, 100)}%` }}
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center gap-2 p-4 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
            <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Create New Load</span>
          </button>
          <button className="flex items-center justify-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors">
            <Truck className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-green-900 dark:text-green-100">Track Loads</span>
          </button>
          <button className="flex items-center justify-center gap-2 p-4 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors">
            <DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-medium text-purple-900 dark:text-purple-100">View Invoices</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerAnalytics;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext-fixed';
import { useTheme } from '../contexts/ThemeContext';
import { 
  Package, 
  MapPin, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  MessageSquare,
  Filter,
  Search,
  Plus,
  Calendar,
  BarChart3,
  Truck,
  Users,
  FileText,
  Scale
} from 'lucide-react';

interface Load {
  id: string;
  commodity: string;
  origin: string;
  destination: string;
  pickupDate: string;
  deliveryDate: string;
  rate: number;
  rateMode: string;
  status: string;
  equipmentType: string;
  distance: number;
  weight: number;
  carrierName?: string;
  driverName?: string;
  createdAt: string;
}

interface Stats {
  totalLoads: number;
  activeLoads: number;
  completedLoads: number;
  totalSpent: number;
  averageRate: number;
  onTimeDelivery: number;
  pendingCarriers: number;
  totalCarriers: number;
}

export default function ShipperDashboard() {
  const { user, organization } = useAuth();
  const { theme } = useTheme();
  const [selectedTab, setSelectedTab] = useState('overview');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['shipper-stats'],
    queryFn: async () => {
      const response = await api.get('/shipper/stats');
      return response.data;
    },
  });

  // Fetch loads
  const { data: loads, isLoading: loadsLoading, refetch: refetchLoads } = useQuery({
    queryKey: ['shipper-loads', filterStatus, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await api.get(`/loads?${params.toString()}`);
      return response.data;
    },
  });

  // Fetch carrier interests
  const { data: carrierInterests, isLoading: interestsLoading } = useQuery({
    queryKey: ['carrier-interests'],
    queryFn: async () => {
      const response = await api.get('/shipper/interests');
      return response.data;
    },
  });

  const handleAssignCarrier = async (loadId: string, carrierId: string) => {
    try {
      await api.post(`/marketplace/${loadId}/assign`, { carrierId });
      refetchLoads();
    } catch (error) {
      console.error('Failed to assign carrier:', error);
    }
  };

  const handleRejectInterest = async (loadId: string, carrierId: string) => {
    try {
      await api.post(`/marketplace/${loadId}/reject-interest`, { carrierId });
      refetchLoads();
    } catch (error) {
      console.error('Failed to reject interest:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'text-gray-600 bg-gray-100';
      case 'POSTED': return 'text-blue-600 bg-blue-100';
      case 'ASSIGNED': return 'text-yellow-600 bg-yellow-100';
      case 'IN_PROGRESS': return 'text-blue-600 bg-blue-100';
      case 'COMPLETED': return 'text-green-600 bg-green-100';
      case 'CANCELLED': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DRAFT': return <FileText className="w-4 h-4" />;
      case 'POSTED': return <Package className="w-4 h-4" />;
      case 'ASSIGNED': return <Truck className="w-4 h-4" />;
      case 'IN_PROGRESS': return <Clock className="w-4 h-4" />;
      case 'COMPLETED': return <CheckCircle className="w-4 h-4" />;
      case 'CANCELLED': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Shipper Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.firstName}!</p>
            <p className="text-sm text-gray-500">{organization?.name}</p>
          </div>
          <div className="flex space-x-3">
            <Link
              to="/load-board"
              className="btn btn-secondary flex items-center"
            >
              <Eye className="w-4 h-4 mr-2" />
              Browse Carriers
            </Link>
            <Link
              to="/loads/create"
              className="btn btn-primary flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Load
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {statsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Loads</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalLoads || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Loads</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.activeLoads || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">${stats?.totalSpent?.toLocaleString() || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Carrier Network</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalCarriers || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'my-loads', label: 'My Loads', icon: Package },
              { id: 'carrier-interests', label: 'Carrier Interests', icon: MessageSquare },
              { id: 'carriers', label: 'Carrier Network', icon: Users },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === tab.id
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
          {/* Overview Tab */}
          {selectedTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Loads</h3>
                  <div className="space-y-3">
                    {loads?.slice(0, 5).map((load: Load) => (
                      <div key={load.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <div className="flex items-center">
                          <div className={`p-2 rounded-full ${getStatusColor(load.status)}`}>
                            {getStatusIcon(load.status)}
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{load.commodity}</p>
                            <p className="text-xs text-gray-500">{load.origin} → {load.destination}</p>
                            {load.carrierName && (
                              <p className="text-xs text-gray-400">Carrier: {load.carrierName}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">${load.rate.toLocaleString()}</p>
                          <p className="text-xs text-gray-500">{load.rateMode}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <Link
                      to="/loads/create"
                      className="flex items-center p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Plus className="w-5 h-5 text-blue-600 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Create New Load</p>
                        <p className="text-xs text-gray-500">Post a load for carriers to bid on</p>
                      </div>
                    </Link>
                    <Link
                      to="/carriers"
                      className="flex items-center p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Users className="w-5 h-5 text-green-600 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Browse Carriers</p>
                        <p className="text-xs text-gray-500">Find trusted carriers in your area</p>
                      </div>
                    </Link>
                    <Link
                      to="/analytics"
                      className="flex items-center p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <BarChart3 className="w-5 h-5 text-purple-600 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">View Analytics</p>
                        <p className="text-xs text-gray-500">Track spending and performance</p>
                      </div>
                    </Link>
                    <Link
                      to="/scale-tickets"
                      className="flex items-center p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Scale className="w-5 h-5 text-orange-600 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Scale Tickets</p>
                        <p className="text-xs text-gray-500">Manage weight verification</p>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* My Loads Tab */}
          {selectedTab === 'my-loads' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search loads..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="all">All Status</option>
                    <option value="DRAFT">Draft</option>
                    <option value="POSTED">Posted</option>
                    <option value="ASSIGNED">Assigned</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Load Details
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Route
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rate
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Carrier
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {loadsLoading ? (
                        [...Array(3)].map((_, i) => (
                          <tr key={i}>
                            <td className="px-6 py-4 animate-pulse">
                              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            </td>
                            <td className="px-6 py-4 animate-pulse">
                              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            </td>
                            <td className="px-6 py-4 animate-pulse">
                              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                            </td>
                            <td className="px-6 py-4 animate-pulse">
                              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                            </td>
                            <td className="px-6 py-4 animate-pulse">
                              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            </td>
                            <td className="px-6 py-4 animate-pulse">
                              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        loads?.map((load: Load) => (
                          <tr key={load.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{load.commodity}</div>
                                <div className="text-sm text-gray-500">{load.equipmentType}</div>
                                <div className="text-xs text-gray-400">
                                  {new Date(load.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">{load.origin}</div>
                              <div className="text-sm text-gray-500">→ {load.destination}</div>
                              <div className="text-xs text-gray-400">{load.distance} miles</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">${load.rate.toLocaleString()}</div>
                              <div className="text-xs text-gray-500">{load.rateMode}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">{load.carrierName || 'Not assigned'}</div>
                              {load.driverName && (
                                <div className="text-xs text-gray-500">Driver: {load.driverName}</div>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(load.status)}`}>
                                {getStatusIcon(load.status)}
                                <span className="ml-1">{load.status.replace('_', ' ')}</span>
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex space-x-2">
                                <Link
                                  to={`/loads/${load.id}`}
                                  className="text-primary-600 hover:text-primary-900 text-sm font-medium"
                                >
                                  View
                                </Link>
                                {load.status === 'DRAFT' && (
                                  <Link
                                    to={`/loads/${load.id}/edit`}
                                    className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                                  >
                                    Edit
                                  </Link>
                                )}
                                {load.status === 'POSTED' && (
                                  <button
                                    onClick={() => {/* Handle post to marketplace */}}
                                    className="text-green-600 hover:text-green-900 text-sm font-medium"
                                  >
                                    Post
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Carrier Interests Tab */}
          {selectedTab === 'carrier-interests' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Carrier Interests</h3>
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="p-6 text-center text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No carrier interests yet. Create and post loads to receive carrier bids.</p>
                  <Link
                    to="/loads/create"
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                  >
                    Create Load
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Carriers Tab */}
          {selectedTab === 'carriers' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Carrier Network</h3>
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="p-6 text-center text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No carriers in your network yet. Browse available carriers or wait for them to express interest in your loads.</p>
                  <Link
                    to="/carriers"
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                  >
                    Browse Carriers
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {selectedTab === 'analytics' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Analytics & Reports</h3>
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="p-6 text-center text-gray-500">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Analytics dashboard coming soon. Track your spending, carrier performance, and load efficiency.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useCertifications } from '@/lib/hooks';
import { formatDate, getDaysUntilExpiry } from '@/lib/utils';
import Button from '@/components/ui/button';
import AddCertificationDialog from '@/components/certifications/add-certification-dialog';
import { Search, Filter, Plus, Download, Calendar, Target, Activity, Zap, ArrowRight, TrendingUp, BarChart3, Award, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

export default function CertificationsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  
  const { data: certificationsData, isLoading, error } = useCertifications();

  const filteredCertifications = certificationsData?.certifications?.filter((cert: any) => {
    const matchesSearch = cert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cert.issuingBody.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || cert.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800 border-green-200';
      case 'EXPIRING_SOON': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'EXPIRED': return 'bg-red-100 text-red-800 border-red-200';
      case 'RENEWAL_IN_PROGRESS': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getExpiryStatus = (expiryDate: string) => {
    const days = getDaysUntilExpiry(new Date(expiryDate));
    if (days < 0) return { status: 'EXPIRED', color: 'text-red-600', days: Math.abs(days) };
    if (days <= 30) return { status: 'EXPIRING_SOON', color: 'text-yellow-600', days };
    return { status: 'ACTIVE', color: 'text-green-600', days };
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-8 space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Certifications</h1>
          <p className="text-muted-foreground mt-1">Manage your compliance certifications and expiry tracking</p>
        </div>
        
        <div className="flex items-center gap-3">
          <AddCertificationDialog>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Certification
            </Button>
          </AddCertificationDialog>
        </div>
      </div>

      {/* Certification Management Feature Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
      >
        <div className="flex items-center gap-4">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center"
          >
            <Award className="w-6 h-6 text-green-600" />
          </motion.div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-green-900 mb-1">Certification Lifecycle Management</h3>
            <p className="text-green-700 text-sm mb-3">
              Track certification expiry, renewals, and compliance status in real-time
            </p>
            
            {/* Certification Tracking Flow Visualization */}
            <div className="flex items-center gap-2 flex-wrap">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-green-200 shadow-sm"
              >
                <Target className="w-4 h-4 text-green-600" />
                <span className="text-xs font-medium text-green-800">Add Certification</span>
              </motion.div>
              
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <ArrowRight className="w-4 h-4 text-green-400" />
              </motion.div>
              
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-emerald-200 shadow-sm"
              >
                <Activity className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-medium text-emerald-800">Track Expiry</span>
              </motion.div>
              
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
              >
                <ArrowRight className="w-4 h-4 text-emerald-400" />
              </motion.div>
              
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-blue-200 shadow-sm"
              >
                <CheckCircle className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-medium text-blue-800">Renewal Alerts</span>
              </motion.div>
            </div>
          </div>
          
          <motion.div
            animate={{ 
              rotate: [0, 15, -15, 0],
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="hidden md:block"
          >
            <Zap className="w-8 h-8 text-green-400" />
          </motion.div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass p-6 text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3"
          >
            <Award className="w-6 h-6 text-green-600" />
          </motion.div>
          <div className="text-2xl font-bold text-foreground">24</div>
          <div className="text-sm text-muted-foreground">Total Certifications</div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass p-6 text-center"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3"
          >
            <CheckCircle className="w-6 h-6 text-blue-600" />
          </motion.div>
          <div className="text-2xl font-bold text-foreground">18</div>
          <div className="text-sm text-muted-foreground">Active</div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="glass p-6 text-center"
        >
          <motion.div
            animate={{ 
              y: [0, -5, 0],
            }}
            transition={{ duration: 1, repeat: Infinity }}
            className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mx-auto mb-3"
          >
            <Clock className="w-6 h-6 text-yellow-600" />
          </motion.div>
          <div className="text-2xl font-bold text-foreground">3</div>
          <div className="text-sm text-muted-foreground">Expiring Soon</div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="glass p-6 text-center"
        >
          <motion.div
            animate={{ 
              opacity: [1, 0.5, 1],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-3"
          >
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </motion.div>
          <div className="text-2xl font-bold text-foreground">2</div>
          <div className="text-sm text-muted-foreground">Expired</div>
        </motion.div>
      </div>

      {/* Filters and Search */}
      <div className="glass p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Search certifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          
          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border border-input bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="all">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="EXPIRING_SOON">Expiring Soon</option>
              <option value="EXPIRED">Expired</option>
              <option value="RENEWAL_IN_PROGRESS">Renewal in Progress</option>
            </select>

            <div className="flex items-center border border-input rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'}`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-2 ${viewMode === 'table' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'}`}
              >
                Table
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass p-6 animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-4" />
              <div className="h-3 bg-muted rounded w-1/2 mb-2" />
              <div className="h-3 bg-muted rounded w-2/3" />
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="glass p-6 text-center">
          <p className="text-red-600">Error loading certifications. Please try again.</p>
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && !isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCertifications.map((cert: any, index: number) => {
            const expiryStatus = getExpiryStatus(cert.expiryDate);
            
            return (
              <motion.div
                key={cert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass p-6 hover-lift"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-foreground">{cert.name}</h3>
                    <p className="text-sm text-muted-foreground">{cert.issuingBody}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(cert.status)}`}>
                    {cert.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Certificate ID</span>
                    <span className="font-mono text-foreground">{cert.certificateId}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Issue Date</span>
                    <span className="text-foreground">{formatDate(cert.issueDate)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Expiry Date</span>
                    <span className={`font-medium ${expiryStatus.color}`}>
                      {formatDate(cert.expiryDate)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Days Remaining</span>
                    <span className={`font-medium ${expiryStatus.color}`}>
                      {expiryStatus.days} days
                    </span>
                  </div>

                  {cert.owner && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Owner</span>
                      <span className="text-foreground">{cert.owner}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-border flex items-center gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    View Details
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Edit
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && !isLoading && !error && (
        <div className="glass overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Certification
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Certificate ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Issue Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Expiry Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredCertifications.map((cert: any) => {
                  const expiryStatus = getExpiryStatus(cert.expiryDate);
                  
                  return (
                    <tr key={cert.id} className="hover:bg-muted/25 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-foreground">{cert.name}</div>
                          <div className="text-sm text-muted-foreground">{cert.issuingBody}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono text-foreground">{cert.certificateId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {formatDate(cert.issueDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${expiryStatus.color}`}>
                          {formatDate(cert.expiryDate)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {expiryStatus.days} days
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(cert.status)}`}>
                          {cert.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredCertifications.length === 0 && (
        <div className="glass p-12 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No certifications found</h3>
          <p className="text-muted-foreground mb-6">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filters' 
              : 'Get started by adding your first certification'}
          </p>
          <AddCertificationDialog>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Certification
            </Button>
          </AddCertificationDialog>
        </div>
      )}
    </motion.div>
  );
}

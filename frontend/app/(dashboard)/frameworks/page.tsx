'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useFrameworks } from '@/lib/hooks';
import Button from '@/components/ui/button';
import { Search, Plus, Shield, CheckCircle, AlertCircle, Clock, Target, Activity, Zap, ArrowRight, TrendingUp, BarChart3, FileText } from 'lucide-react';

export default function FrameworksPage() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: frameworksData, isLoading, error } = useFrameworks();

  const filteredFrameworks = frameworksData?.frameworks?.filter((framework: any) => 
    framework.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    framework.type.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getComplianceColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600 bg-green-100';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getMaturityColor = (level: number) => {
    if (level >= 4) return 'text-green-600';
    if (level >= 3) return 'text-yellow-600';
    if (level >= 2) return 'text-orange-600';
    return 'text-red-600';
  };

  const getFrameworkIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'iso': return Shield;
      case 'soc': return CheckCircle;
      case 'hipaa': return AlertCircle;
      case 'pci': return Clock;
      default: return Shield;
    }
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
          <h1 className="text-3xl font-bold text-foreground">Compliance Frameworks</h1>
          <p className="text-muted-foreground mt-1">Track and manage your compliance framework coverage</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Map Framework
          </Button>
        </div>
      </div>

      {/* Framework Overview Feature Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200"
      >
        <div className="flex items-center gap-4">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center"
          >
            <Shield className="w-6 h-6 text-blue-600" />
          </motion.div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-blue-900 mb-1">Framework Coverage Analysis</h3>
            <p className="text-blue-700 text-sm mb-3">
              Monitor compliance maturity and framework alignment across your organization
            </p>
            
            {/* Framework Tracking Flow Visualization */}
            <div className="flex items-center gap-2 flex-wrap">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-blue-200 shadow-sm"
              >
                <Target className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-medium text-blue-800">Framework Mapping</span>
              </motion.div>
              
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <ArrowRight className="w-4 h-4 text-blue-400" />
              </motion.div>
              
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-indigo-200 shadow-sm"
              >
                <Activity className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-medium text-indigo-800">Compliance Analysis</span>
              </motion.div>
              
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
              >
                <ArrowRight className="w-4 h-4 text-indigo-400" />
              </motion.div>
              
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-green-200 shadow-sm"
              >
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-xs font-medium text-green-800">Maturity Tracking</span>
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
            <Zap className="w-8 h-8 text-blue-400" />
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
            className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3"
          >
            <Shield className="w-6 h-6 text-blue-600" />
          </motion.div>
          <div className="text-2xl font-bold text-foreground">12</div>
          <div className="text-sm text-muted-foreground">Total Frameworks</div>
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
            className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3"
          >
            <CheckCircle className="w-6 h-6 text-green-600" />
          </motion.div>
          <div className="text-2xl font-bold text-foreground">78%</div>
          <div className="text-sm text-muted-foreground">Avg Compliance</div>
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
            <AlertCircle className="w-6 h-6 text-yellow-600" />
          </motion.div>
          <div className="text-2xl font-bold text-foreground">3.2</div>
          <div className="text-sm text-muted-foreground">Avg Maturity</div>
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
            className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3"
          >
            <BarChart3 className="w-6 h-6 text-purple-600" />
          </motion.div>
          <div className="text-2xl font-bold text-foreground">5</div>
          <div className="text-sm text-muted-foreground">Need Review</div>
        </motion.div>
      </div>

      {/* Search */}
      <div className="glass p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input
            type="text"
            placeholder="Search frameworks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
          />
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
          <p className="text-red-600">Error loading frameworks. Please try again.</p>
        </div>
      )}

      {/* Frameworks Grid */}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFrameworks.map((framework: any, index: number) => {
            const Icon = getFrameworkIcon(framework.type);
            const complianceColor = getComplianceColor(framework.compliancePercentage);
            const maturityColor = getMaturityColor(framework.maturityLevel);
            
            return (
              <motion.div
                key={framework.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass p-6 hover-lift"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{framework.name}</h3>
                      <p className="text-sm text-muted-foreground">{framework.type}</p>
                    </div>
                  </div>
                </div>

                {framework.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {framework.description}
                  </p>
                )}

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Compliance</span>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${complianceColor}`}>
                      {framework.compliancePercentage}%
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Maturity Level</span>
                    <span className={`text-sm font-medium ${maturityColor}`}>
                      Level {framework.maturityLevel}/5
                    </span>
                  </div>

                  {framework.owner && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Owner</span>
                      <span className="text-sm text-foreground">{framework.owner}</span>
                    </div>
                  )}

                  {framework.reviewSchedule && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Review Schedule</span>
                      <span className="text-sm text-foreground">{framework.reviewSchedule}</span>
                    </div>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-accent h-2 rounded-full transition-all duration-300"
                      style={{ width: `${framework.compliancePercentage}%` }}
                    />
                  </div>
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

      {/* Empty State */}
      {!isLoading && !error && filteredFrameworks.length === 0 && (
        <div className="glass p-12 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No frameworks found</h3>
          <p className="text-muted-foreground mb-6">
            {searchTerm 
              ? 'Try adjusting your search' 
              : 'Get started by mapping your first compliance framework'}
          </p>
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Map Framework
          </Button>
        </div>
      )}
    </motion.div>
  );
}

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useFrameworks } from '@/lib/hooks';
import Button from '@/components/ui/button';
import { Search, Plus, Shield, CheckCircle, AlertCircle, Clock } from 'lucide-react';

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

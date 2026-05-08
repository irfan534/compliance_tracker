'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Card from '@/components/ui/card';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import { Database, Search, Plus, Building2, Users, Calendar, Mail, Phone, Edit, Trash2, Eye, X, TrendingUp, Globe, Award, Target, Zap, ArrowRight } from 'lucide-react';

interface Company {
  id: string;
  name: string;
  industry: string;
  size: string;
  description?: string;
  website?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  createdAt: string;
  userCount: number;
  certificationCount: number;
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    description: '',
    website: '',
    certificateName: '',
    region: '',
    logo: null as File | null,
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await fetch('/api/companies');
      const data = await response.json();
      setCompanies(data.companies || []);
    } catch (error) {
      console.error('Failed to fetch companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCompany = async () => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('industry', formData.industry);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('website', formData.website);
      formDataToSend.append('certificateName', formData.certificateName);
      formDataToSend.append('region', formData.region);
      
      if (formData.logo) {
        formDataToSend.append('logo', formData.logo);
      }

      const response = await fetch('/api/companies', {
        method: 'POST',
        body: formDataToSend,
      });

      if (response.ok) {
        setShowAddModal(false);
        setFormData({
          name: '',
          industry: '',
          description: '',
          website: '',
          certificateName: '',
          region: '',
          logo: null,
        });
        fetchCompanies(); // Refresh the list
      }
    } catch (error) {
      console.error('Failed to add company:', error);
    }
  };

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.industry.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || company.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'text-green-600 bg-green-50';
      case 'INACTIVE': return 'text-red-600 bg-red-50';
      case 'PENDING': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getSizeColor = (size: string) => {
    switch (size) {
      case 'small': return 'text-blue-600 bg-blue-50';
      case 'medium': return 'text-purple-600 bg-purple-50';
      case 'large': return 'text-orange-600 bg-orange-50';
      case 'enterprise': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="h-12 bg-gray-200 rounded mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Companies</h1>
            <p className="text-gray-600">Manage organizations and their compliance data</p>
          </div>

          {/* Companies Management Feature Card */}
          <Card className="mb-6 bg-gradient-to-r from-emerald-50 to-blue-50 border-emerald-200">
            <div className="p-6">
              <div className="flex items-center gap-4">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center"
                >
                  <Building2 className="w-6 h-6 text-emerald-600" />
                </motion.div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-emerald-900 mb-1">Company Management System</h3>
                  <p className="text-emerald-700 text-sm mb-3">
                    Track organizations, certifications, and compliance metrics in real-time
                  </p>
                  
                  {/* Management Flow Visualization */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5 }}
                      className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-emerald-200 shadow-sm"
                    >
                      <Building2 className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-medium text-emerald-800">Company Data</span>
                    </motion.div>
                    
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <ArrowRight className="w-4 h-4 text-emerald-400" />
                    </motion.div>
                    
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-blue-200 shadow-sm"
                    >
                      <Award className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-medium text-blue-800">Certifications</span>
                    </motion.div>
                    
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                    >
                      <ArrowRight className="w-4 h-4 text-blue-400" />
                    </motion.div>
                    
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-purple-200 shadow-sm"
                    >
                      <Target className="w-4 h-4 text-purple-600" />
                      <span className="text-xs font-medium text-purple-800">Compliance</span>
                    </motion.div>
                  </div>
                </div>
                
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="hidden md:block"
                >
                  <Globe className="w-8 h-8 text-emerald-400" />
                </motion.div>
              </div>
            </div>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center"
                  >
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </motion.div>
                  <div>
                    <motion.p 
                      className="text-2xl font-bold text-gray-900"
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      {companies.length}
                    </motion.p>
                    <p className="text-sm text-gray-600">Total Companies</p>
                  </div>
                </div>
              </Card>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-l-green-500">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center"
                  >
                    <Database className="w-6 h-6 text-green-600" />
                  </motion.div>
                  <div>
                    <motion.p 
                      className="text-2xl font-bold text-gray-900"
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                    >
                      {companies.filter(c => c.status === 'ACTIVE').length}
                    </motion.p>
                    <p className="text-sm text-gray-600">Active</p>
                  </div>
                </div>
              </Card>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-l-purple-500">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ 
                      y: [0, -5, 0],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center"
                  >
                    <Users className="w-6 h-6 text-purple-600" />
                  </motion.div>
                  <div>
                    <motion.p 
                      className="text-2xl font-bold text-gray-900"
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      {companies.reduce((sum, c) => sum + c.userCount, 0)}
                    </motion.p>
                    <p className="text-sm text-gray-600">Total Users</p>
                  </div>
                </div>
              </Card>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-l-orange-500">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ 
                      rotate: [0, 180, 360],
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center"
                  >
                    <Zap className="w-6 h-6 text-orange-600" />
                  </motion.div>
                  <div>
                    <motion.p 
                      className="text-2xl font-bold text-gray-900"
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                    >
                      {companies.reduce((sum, c) => sum + c.certificationCount, 0)}
                    </motion.p>
                    <p className="text-sm text-gray-600">Certifications</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Filters */}
          <Card className="p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search companies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="PENDING">Pending</option>
              </select>
            </div>
          </Card>

          {/* Companies Grid */}
          {filteredCompanies.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCompanies.map((company) => (
                <motion.div
                  key={company.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ y: -5 }}
                >
                  <Card className="p-6 hover:shadow-xl transition-all duration-300 border border-gray-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <motion.div
                          animate={{ 
                            rotate: company.status === 'ACTIVE' ? 360 : 0,
                          }}
                          transition={{ 
                            duration: 3, 
                            repeat: company.status === 'ACTIVE' ? Infinity : 0, 
                            ease: "linear" 
                          }}
                          className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center"
                        >
                          <Building2 className="w-5 h-5 text-gray-600" />
                        </motion.div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{company.name}</h3>
                          <p className="text-sm text-gray-600">{company.industry}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(company.status)}`}>
                          {company.status}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSizeColor(company.size)}`}>
                          {company.size}
                        </span>
                      </div>
                    </div>
                    
                    {company.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {company.description}
                      </p>
                    )}
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Users:</span>
                        <span className="font-medium">{company.userCount}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Certifications:</span>
                        <span className="font-medium">{company.certificationCount}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Created:</span>
                        <span className="font-medium">
                          {new Date(company.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    {(company.contactEmail || company.contactPhone) && (
                      <div className="border-t pt-3 mb-4">
                        {company.contactEmail && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                            <Mail className="w-4 h-4" />
                            {company.contactEmail}
                          </div>
                        )}
                        {company.contactPhone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-4 h-4" />
                            {company.contactPhone}
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="p-12 text-center">
                <motion.div
                  animate={{ 
                    y: [0, -10, 0],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center"
                >
                  <Building2 className="w-8 h-8 text-gray-400" />
                </motion.div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No companies found</h3>
                <p className="text-gray-600 mb-4">Add your first company to get started</p>
                <Button 
                  className="bg-black text-white hover:bg-gray-800"
                  onClick={() => setShowAddModal(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Company
                </Button>
              </Card>
            </motion.div>
          )}

          {/* Add Company Modal */}
          {showAddModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-xl p-6 w-full max-w-md"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Add New Company</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddModal(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Name *
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter company name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Industry *
                    </label>
                    <Input
                      value={formData.industry}
                      onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                      placeholder="e.g., Technology, Healthcare, Finance"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Certificate Name
                    </label>
                    <Input
                      value={formData.certificateName}
                      onChange={(e) => setFormData(prev => ({ ...prev, certificateName: e.target.value }))}
                      placeholder="e.g., ISO 9001, SOC 2, HIPAA"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Region
                    </label>
                    <Input
                      value={formData.region}
                      onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
                      placeholder="e.g., North America, Europe, Asia"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description of the company"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Website
                    </label>
                    <Input
                      value={formData.website}
                      onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                      placeholder="https://example.com"
                      type="url"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Logo Upload (Max 10MB)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file && file.size <= 10 * 1024 * 1024) {
                            setFormData(prev => ({ ...prev, logo: file }));
                          } else if (file) {
                            alert('Logo file must be less than 10MB');
                          }
                        }}
                        className="hidden"
                        id="logo-upload"
                      />
                      <label htmlFor="logo-upload" className="cursor-pointer">
                        {formData.logo ? (
                          <div>
                            <div className="w-16 h-16 mx-auto mb-2 bg-gray-100 rounded-lg flex items-center justify-center">
                              <img
                                src={URL.createObjectURL(formData.logo)}
                                alt="Logo preview"
                                className="w-full h-full object-cover rounded-lg"
                              />
                            </div>
                            <p className="text-sm text-gray-600">{formData.logo.name}</p>
                            <p className="text-xs text-gray-500">Click to change</p>
                          </div>
                        ) : (
                          <div>
                            <div className="w-16 h-16 mx-auto mb-2 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Building2 className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-sm text-gray-600">Click to upload logo</p>
                            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-black text-white hover:bg-gray-800"
                    onClick={handleAddCompany}
                    disabled={!formData.name || !formData.industry}
                  >
                    Add Company
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Card from '@/components/ui/card';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge';
import Input from '@/components/ui/input';
import { Calendar, Download, Filter, Search, FileText, BarChart3, FileDown, TrendingUp, Clock, CheckCircle, AlertCircle, Zap, ArrowRight, Activity, Target } from 'lucide-react';

interface Report {
  id: string;
  type: string;
  title: string;
  description: string;
  status: 'PENDING' | 'GENERATING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
  completedAt?: string;
  fileSize?: number;
  downloadUrl?: string;
  processedRecords?: number;
  totalRecords?: number;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await fetch('/api/reports');
      const data = await response.json();
      setReports(data.reports || []);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (type: string) => {
    try {
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });
      
      if (response.ok) {
        await fetchReports();
      }
    } catch (error) {
      console.error('Failed to generate report:', error);
    }
  };

  const downloadReport = async (reportId: string) => {
    try {
      const response = await fetch(`/api/reports/${reportId}/download`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report-${reportId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Failed to download report:', error);
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || report.type === filterType;
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'text-green-600 bg-green-50';
      case 'GENERATING': return 'text-yellow-600 bg-yellow-50';
      case 'FAILED': return 'text-red-600 bg-red-50';
      case 'PENDING': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle className="w-4 h-4" />;
      case 'GENERATING': return <Clock className="w-4 h-4" />;
      case 'FAILED': return <AlertCircle className="w-4 h-4" />;
      case 'PENDING': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Reports</h1>
            <p className="text-gray-600">Generate and download compliance reports</p>
          </div>

          {/* Report Generation Feature Card */}
          <Card className="mb-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
            <div className="p-6">
              <div className="flex items-center gap-4">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center"
                >
                  <BarChart3 className="w-6 h-6 text-indigo-600" />
                </motion.div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-indigo-900 mb-1">Advanced Report Generation</h3>
                  <p className="text-indigo-700 text-sm mb-3">
                    Generate comprehensive compliance and expiry reports with real-time data
                  </p>
                  
                  {/* Report Generation Flow Visualization */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5 }}
                      className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-indigo-200 shadow-sm"
                    >
                      <Target className="w-4 h-4 text-indigo-600" />
                      <span className="text-xs font-medium text-indigo-800">Data Analysis</span>
                    </motion.div>
                    
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <ArrowRight className="w-4 h-4 text-indigo-400" />
                    </motion.div>
                    
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-purple-200 shadow-sm"
                    >
                      <Activity className="w-4 h-4 text-purple-600" />
                      <span className="text-xs font-medium text-purple-800">Report Generation</span>
                    </motion.div>
                    
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                    >
                      <ArrowRight className="w-4 h-4 text-purple-400" />
                    </motion.div>
                    
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-green-200 shadow-sm"
                    >
                      <FileDown className="w-4 h-4 text-green-600" />
                      <span className="text-xs font-medium text-green-800">Download Ready</span>
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
                  <Zap className="w-8 h-8 text-indigo-400" />
                </motion.div>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center"
                    >
                      <BarChart3 className="w-6 h-6 text-blue-600" />
                    </motion.div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Compliance Report</h3>
                      <p className="text-sm text-gray-600">Complete compliance overview</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => generateReport('compliance')}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Generate
                  </Button>
                </div>
              </Card>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50 to-pink-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <motion.div
                      animate={{ 
                        scale: [1, 1.2, 1],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center"
                    >
                      <Calendar className="w-6 h-6 text-purple-600" />
                    </motion.div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Expiry Report</h3>
                      <p className="text-sm text-gray-600">Upcoming expirations</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => generateReport('expiry')}
                    variant="outline"
                    className="border-purple-600 text-purple-600 hover:bg-purple-50"
                  >
                    Generate
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-l-indigo-500">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ 
                      y: [0, -3, 0],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center"
                  >
                    <FileText className="w-6 h-6 text-indigo-600" />
                  </motion.div>
                  <div>
                    <motion.p 
                      className="text-2xl font-bold text-gray-900"
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      {reports.length}
                    </motion.p>
                    <p className="text-sm text-gray-600">Total Reports</p>
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
                    animate={{ 
                      rotate: [0, 180, 360],
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center"
                  >
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </motion.div>
                  <div>
                    <motion.p 
                      className="text-2xl font-bold text-gray-900"
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                    >
                      {reports.filter(r => r.status === 'COMPLETED').length}
                    </motion.p>
                    <p className="text-sm text-gray-600">Completed</p>
                  </div>
                </div>
              </Card>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-l-yellow-500">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center"
                  >
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </motion.div>
                  <div>
                    <motion.p 
                      className="text-2xl font-bold text-gray-900"
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      {reports.filter(r => r.status === 'GENERATING').length}
                    </motion.p>
                    <p className="text-sm text-gray-600">Generating</p>
                  </div>
                </div>
              </Card>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-l-red-500">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ 
                      opacity: [1, 0.5, 1],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center"
                  >
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </motion.div>
                  <div>
                    <motion.p 
                      className="text-2xl font-bold text-gray-900"
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                    >
                      {reports.filter(r => r.status === 'FAILED').length}
                    </motion.p>
                    <p className="text-sm text-gray-600">Failed</p>
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
                    placeholder="Search reports..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full md:w-48 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="compliance">Compliance</option>
                <option value="expiry">Expiry</option>
                <option value="audit">Audit</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full md:w-48 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="COMPLETED">Completed</option>
                <option value="GENERATING">Generating</option>
                <option value="FAILED">Failed</option>
                <option value="PENDING">Pending</option>
              </select>
            </div>
          </Card>

          {/* Reports Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReports.map((report) => (
              <motion.div
                key={report.id}
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
                          rotate: report.status === 'GENERATING' ? 360 : 0,
                        }}
                        transition={{ 
                          duration: 3, 
                          repeat: report.status === 'GENERATING' ? Infinity : 0, 
                          ease: "linear" 
                        }}
                        className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center"
                      >
                        {report.type === 'compliance' ? (
                          <BarChart3 className="w-5 h-5 text-gray-600" />
                        ) : (
                          <Calendar className="w-5 h-5 text-gray-600" />
                        )}
                      </motion.div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{report.title}</h3>
                        <p className="text-sm text-gray-600">{report.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(report.status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                        {report.status}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{report.description}</p>
                  
                  {/* Progress for generating reports */}
                  {report.status === 'GENERATING' && (
                    <motion.div 
                      className="mb-4"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                    >
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span className="flex items-center gap-1">
                          <Activity className="w-3 h-3" />
                          Generating report...
                        </span>
                        {report.processedRecords && report.totalRecords && (
                          <span className="font-medium">{report.processedRecords} / {report.totalRecords}</span>
                        )}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <motion.div 
                          className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full"
                          style={{ 
                            width: report.processedRecords && report.totalRecords 
                              ? `${(report.processedRecords / report.totalRecords) * 100}%`
                              : '50%'
                          }}
                          animate={{ 
                            width: report.processedRecords && report.totalRecords 
                              ? `${(report.processedRecords / report.totalRecords) * 100}%`
                              : ['50%', '70%', '50%']
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                        ></motion.div>
                      </div>
                    </motion.div>
                  )}
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>Created: {new Date(report.createdAt).toLocaleDateString()}</span>
                    {report.fileSize && <span>{formatFileSize(report.fileSize)}</span>}
                  </div>
                  
                  {report.status === 'COMPLETED' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Button
                        onClick={() => downloadReport(report.id)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Report
                      </Button>
                    </motion.div>
                  )}
                  
                  {report.status === 'GENERATING' && (
                    <div className="w-full text-center text-sm text-gray-500 flex items-center justify-center gap-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Clock className="w-4 h-4" />
                      </motion.div>
                      Generating...
                    </div>
                  )}
                  
                  {report.status === 'FAILED' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Button
                        onClick={() => generateReport(report.type)}
                        className="w-full bg-red-600 hover:bg-red-700 text-white"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Retry Generation
                      </Button>
                    </motion.div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredReports.length === 0 && (
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
                  <FileText className="w-8 h-8 text-gray-400" />
                </motion.div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
                <p className="text-gray-600 mb-4">Generate your first report to get started</p>
                <Button 
                  onClick={() => generateReport('compliance')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Generate Report
                </Button>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

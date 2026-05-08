'use client';

import { Suspense } from 'react';
import { motion } from 'framer-motion';
import Dashboard from '@/components/dashboard/dashboard';

function DashboardContent() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-8"
    >
      <Suspense fallback={<DashboardSkeleton />}>
        <Dashboard />
      </Suspense>
    </motion.div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 bg-muted rounded-lg w-48 animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export default DashboardContent;

import React from 'react';
import { motion } from 'framer-motion';
import { calculateStats } from '../data/meetingsData';
export function SummaryBar() {
  const stats = calculateStats();
  const statItems = [
  {
    label: 'Ministries',
    value: stats.ministries
  },
  {
    label: 'Meeting Bodies Tracked',
    value: stats.totalBodies
  },
  {
    label: 'RTI Requests Sent',
    value: stats.totalRtisSent
  },
  {
    label: 'Sets of Minutes Available',
    value: stats.minutesAvailable
  }];

  return (
    <div className="bg-slate-900 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statItems.map((stat, index) =>
          <motion.div
            key={stat.label}
            initial={{
              opacity: 0,
              y: -10
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            transition={{
              delay: index * 0.1
            }}
            className="text-center">
            
              <div className="text-3xl sm:text-4xl font-bold text-white mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-slate-400 font-medium">
                {stat.label}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>);

}
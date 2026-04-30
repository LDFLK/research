import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Ministry } from '../data/meetingsData';
import { MinistryCard } from './MinistryCard';
interface MinistryGridProps {
  ministries: Ministry[];
}
export function MinistryGrid({ ministries }: MinistryGridProps) {
  const navigate = useNavigate();
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{
          opacity: 0
        }}
        animate={{
          opacity: 1
        }}
        className="mb-8">
        
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
          Meetings Tracker
        </h1>
        <p className="text-lg text-slate-600">
          Tracking statutory meeting bodies and their transparency through RTI
          requests
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ministries.map((ministry, index) =>
        <MinistryCard
          key={ministry.id}
          ministry={ministry}
          onClick={() => navigate(`/ministry/${ministry.id}`)}
          index={index} />

        )}
      </div>
    </div>);

}
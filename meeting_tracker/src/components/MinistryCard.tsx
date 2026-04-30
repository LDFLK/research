import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRightIcon } from 'lucide-react';
import { Ministry, getLatestRti } from '../data/meetingsData';
interface MinistryCardProps {
  ministry: Ministry;
  onClick: () => void;
  index: number;
}
export function MinistryCard({ ministry, onClick, index }: MinistryCardProps) {
  const respondedBodies = ministry.bodies.filter(
    (body) => getLatestRti(body).dateResponded
  ).length;
  const totalBodies = ministry.bodies.length;
  const progressPercentage = respondedBodies / totalBodies * 100;
  return (
    <motion.button
      initial={{
        opacity: 0,
        y: 20
      }}
      animate={{
        opacity: 1,
        y: 0
      }}
      transition={{
        delay: index * 0.05
      }}
      onClick={onClick}
      className="group relative bg-white rounded-lg border-2 border-slate-200 hover:border-slate-300 p-6 text-left transition-all hover:shadow-lg">
      
      <div
        className="absolute top-0 left-0 w-1.5 h-full rounded-l-lg"
        style={{
          backgroundColor: ministry.color
        }} />
      

      <div className="pl-3">
        <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-slate-700 transition-colors">
          {ministry.name}
        </h3>

        <div className="flex items-center justify-between text-sm text-slate-600 mb-3">
          <span>
            {totalBodies} {totalBodies === 1 ? 'body' : 'bodies'} tracked
          </span>
          <ChevronRightIcon className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>RTI Progress</span>
            <span className="font-medium">
              {respondedBodies}/{totalBodies}
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{
                width: 0
              }}
              animate={{
                width: `${progressPercentage}%`
              }}
              transition={{
                delay: index * 0.05 + 0.2,
                duration: 0.6
              }}
              className="h-full rounded-full"
              style={{
                backgroundColor: ministry.color
              }} />
            
          </div>
        </div>
      </div>
    </motion.button>);

}
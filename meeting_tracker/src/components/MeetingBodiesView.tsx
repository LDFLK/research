import React from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from 'lucide-react';
import { ministriesData } from '../data/meetingsData';
import { MeetingBodyTile } from './MeetingBodyTile';
export function MeetingBodiesView() {
  const { ministryId } = useParams<{
    ministryId: string;
  }>();
  const navigate = useNavigate();
  const ministry = ministriesData.find((m) => m.id === ministryId);
  if (!ministry) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-slate-600">Ministry not found</p>
      </div>);

  }
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.button
        initial={{
          opacity: 0,
          x: -10
        }}
        animate={{
          opacity: 1,
          x: 0
        }}
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors">
        
        <ArrowLeftIcon className="w-5 h-5" />
        <span className="font-medium">Back to Ministries</span>
      </motion.button>

      <motion.div
        initial={{
          opacity: 0,
          y: 10
        }}
        animate={{
          opacity: 1,
          y: 0
        }}
        className="mb-8">
        
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-1.5 h-12 rounded-full"
            style={{
              backgroundColor: ministry.color
            }} />
          
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
            {ministry.name}
          </h2>
        </div>
        <p className="text-lg text-slate-600 ml-6">
          {ministry.bodies.length} meeting{' '}
          {ministry.bodies.length === 1 ? 'body' : 'bodies'} tracked
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ministry.bodies.map((body, index) =>
        <MeetingBodyTile
          key={body.id}
          body={body}
          ministryId={ministry.id}
          onClick={() => navigate(`/details/${ministry.id}/${body.id}`)}
          index={index} />

        )}
      </div>
    </div>);

}
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { SummaryBar } from './components/SummaryBar';
import { MinistryGrid } from './components/MinistryGrid';
import { MeetingBodiesView } from './components/MeetingBodiesView';
import { BodyDetailPage } from './components/BodyDetailPage';
import { ministriesData } from './data/meetingsData';
export function App() {
  return (
    <div className="min-h-screen w-full bg-slate-50">
      <header className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl text-slate-400 mt-0.5">
                Government Transparency Initiative
              </p>
            </div>
          </div>
        </div>
      </header>

      <SummaryBar />

      <main className="pb-12">
        <Routes>
          <Route
            path="/"
            element={<MinistryGrid ministries={ministriesData} />} />
          
          <Route path="/ministry/:ministryId" element={<MeetingBodiesView />} />
          <Route
            path="/details/:ministryId/:bodyId"
            element={<BodyDetailPage />} />
          
        </Routes>
      </main>
    </div>);

}
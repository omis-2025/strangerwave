
import React from 'react';
import { MarketAnalysisDashboard } from '../components/analytics/MarketAnalysisDashboard';

export default function Analytics() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Market & Performance Analytics</h1>
      <MarketAnalysisDashboard />
    </div>
  );
}

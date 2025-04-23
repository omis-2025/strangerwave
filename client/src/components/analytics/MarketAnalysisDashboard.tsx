
import React from 'react';
import { Card } from '../ui/card';
import { Chart } from '../ui/chart';

export const MarketAnalysisDashboard = () => {
  const marketSizeData = {
    labels: ['2024', '2025', '2026', '2027', '2028'],
    datasets: [{
      label: 'Market Size ($B)',
      data: [1.2, 1.45, 1.8, 2.3, 2.9],
      borderColor: '#4CAF50',
      fill: false
    }]
  };

  const technicalBenchmarks = {
    labels: ['StrangerWave', 'Competitor Avg'],
    datasets: [{
      label: 'Matching Efficiency (%)',
      data: [94.7, 82.5],
      backgroundColor: ['#2196F3', '#9E9E9E']
    }, {
      label: 'Connection Success (%)',
      data: [92.3, 79.8],
      backgroundColor: ['#4CAF50', '#9E9E9E']
    }]
  };

  const financialProjections = {
    labels: ['Q2 2025', 'Q3 2025', 'Q4 2025', 'Q1 2026'],
    datasets: [{
      label: 'Monthly Revenue ($K)',
      data: [232, 431, 766, 1287],
      borderColor: '#FFC107',
      fill: false
    }]
  };

  return (
    <div className="grid gap-4 p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Market Size Growth</h3>
          <Chart type="line" data={marketSizeData} />
        </Card>

        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Technical Performance</h3>
          <Chart type="bar" data={technicalBenchmarks} />
        </Card>

        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Revenue Projections</h3>
          <Chart type="line" data={financialProjections} />
        </Card>

        <Card className="p-4 col-span-full">
          <h3 className="text-lg font-semibold mb-4">Competitive Comparison</h3>
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div>
              <h4 className="font-medium">User Metrics</h4>
              <p>DAU: 5,400+</p>
              <p>Growth: 20.3% MoM</p>
              <p>Session Duration: 12.5min</p>
            </div>
            <div>
              <h4 className="font-medium">Technical</h4>
              <p>Match Rate: 94.7%</p>
              <p>Response Time: 217ms</p>
              <p>Uptime: 99.9%</p>
            </div>
            <div>
              <h4 className="font-medium">Financial</h4>
              <p>ARPU: $1.87</p>
              <p>LTV/CAC: 4.3</p>
              <p>Conversion: 8.7%</p>
            </div>
            <div>
              <h4 className="font-medium">Market Position</h4>
              <p>Premium Segment</p>
              <p>Safety Focus</p>
              <p>Global Reach</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

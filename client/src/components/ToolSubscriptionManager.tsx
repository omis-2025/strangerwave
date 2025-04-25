
import React from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';

export default function ToolSubscriptionManager() {
  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">Tool Access Dashboard</h2>
      <div className="grid gap-4">
        <div className="p-4 bg-gray-50 rounded">
          <h3 className="font-semibold">Active Subscription</h3>
          <p>All Access Membership</p>
          <p className="text-sm text-gray-600">Next billing: €29.99 on May 1, 2024</p>
        </div>
        
        <div className="space-y-2">
          <h3 className="font-semibold">Quick Access</h3>
          <Button className="w-full">Launch Desktop App</Button>
          <Button variant="outline" className="w-full">Download App</Button>
        </div>
      </div>
    </Card>
  );
}

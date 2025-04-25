
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';

export default function ToolsAccess() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">All-in-One Tool Access</h1>
      
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <Card>
          <CardHeader>
            <CardTitle>Spy Tools Package</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li>✓ 20+ Premium Spy Tools</li>
              <li>✓ Competitor Analysis</li>
              <li>✓ Product Research Tools</li>
              <li>✓ Market Intelligence</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Tools Package</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li>✓ 20+ AI Optimization Tools</li>
              <li>✓ Content Generation</li>
              <li>✓ Marketing Automation</li>
              <li>✓ Performance Analytics</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>All Access Membership</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold mb-4">€29.99/month</div>
          <ul className="space-y-2 mb-6">
            <li>✓ Access All Tools</li>
            <li>✓ Desktop App Access</li>
            <li>✓ No Technical Setup</li>
            <li>✓ Instant Access</li>
          </ul>
          <Button size="lg" className="w-full">Get Access Now</Button>
        </CardContent>
      </Card>
    </div>
  );
}

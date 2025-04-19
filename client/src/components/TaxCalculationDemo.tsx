import { useState } from 'react';
import { useTaxCalculation } from '@/hooks/useTaxCalculation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';

// EU country options - this can be expanded with more countries as needed
const COUNTRIES = [
  { code: 'ES', name: 'Spain' },
  { code: 'FR', name: 'France' },
  { code: 'DE', name: 'Germany' },
  { code: 'IT', name: 'Italy' },
  { code: 'PT', name: 'Portugal' },
  { code: 'BE', name: 'Belgium' },
  { code: 'NL', name: 'Netherlands' },
];

export default function TaxCalculationDemo() {
  // Form state
  const [amount, setAmount] = useState<number>(1000); // €10.00 in cents
  const [country, setCountry] = useState<string>('ES');
  const [postalCode, setPostalCode] = useState<string>('28001');
  const [city, setCity] = useState<string>('Madrid');
  
  // Tax calculation hook
  const { calculateTax, loading, error, result } = useTaxCalculation();
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await calculateTax({
      amount,
      customerLocation: country,
      customerPostalCode: postalCode,
      customerCity: city
    });
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Tax Calculation Demo</CardTitle>
        <CardDescription>
          Test calculating tax for different locations and order amounts
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount input */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (in cents)</Label>
            <div className="flex items-center space-x-2">
              <span className="text-gray-500">€</span>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                placeholder="Amount in cents"
                required
              />
              <span className="text-gray-500 text-sm">cents</span>
            </div>
            <p className="text-gray-500 text-xs">
              {(amount / 100).toFixed(2)} EUR
            </p>
          </div>
          
          {/* Country select */}
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Select
              value={country}
              onValueChange={setCountry}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    {country.name} ({country.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Postal code input */}
          <div className="space-y-2">
            <Label htmlFor="postalCode">Postal Code</Label>
            <Input
              id="postalCode"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              placeholder="Postal code"
            />
          </div>
          
          {/* City input */}
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City"
            />
          </div>
          
          {/* Error display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {/* Results display */}
          {result && (
            <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span>Subtotal:</span>
                <span>€{(amount / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span>Tax ({(result.taxRate * 100).toFixed(1)}%):</span>
                <span>€{(result.taxAmount / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center font-semibold">
                <span>Total:</span>
                <span>€{(result.totalAmount / 100).toFixed(2)}</span>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Tax Calculation ID: {result.calculationId}
              </div>
            </div>
          )}
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Calculating...' : 'Calculate Tax'}
          </Button>
        </form>
      </CardContent>
      
      <CardFooter className="flex-col space-y-2">
        <p className="text-xs text-gray-500">
          This demo uses the Stripe Tax API to calculate applicable taxes for the given location and amount.
        </p>
      </CardFooter>
    </Card>
  );
}
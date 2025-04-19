import TaxCalculationDemo from '@/components/TaxCalculationDemo';

export default function FoodSourceDemo() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            FoodSource Demo
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            FoodSource is a marketplace connecting businesses with excess food inventory to consumers at discounted prices,
            reducing food waste while providing affordable options.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              About FoodSource
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              FoodSource helps businesses reduce food waste by connecting them with consumers looking for good deals.
              Our platform handles everything from listing to payment processing, making it easy for both sides.
            </p>
            
            <h3 className="text-lg font-semibold mt-6 mb-2 text-gray-900 dark:text-white">
              Key Features
            </h3>
            <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Businesses can list excess inventory at discounted prices</li>
              <li>Consumers can browse deals by location, type, and dietary needs</li>
              <li>Automatic tax calculation based on location</li>
              <li>Secure payment processing</li>
              <li>Ratings and reviews system</li>
              <li>Analytics dashboard for businesses</li>
              <li>Automatic notifications for nearby deals</li>
            </ul>
            
            <h3 className="text-lg font-semibold mt-6 mb-2 text-gray-900 dark:text-white">
              Business Model
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              FoodSource offers tiered subscription plans for businesses ($49-$299/month) and takes a small commission on each transaction (15-20%).
              We also offer a premium membership for consumers at $5.99/month for additional benefits like priority access and exclusive deals.
            </p>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Tax Calculation Demo
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              This demo shows how FoodSource calculates taxes automatically based on the customer's location.
              Try different countries and amounts to see how the tax rates change.
            </p>
            
            <TaxCalculationDemo />
          </div>
        </div>
      </div>
    </div>
  );
}
import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Crown, Zap, MapPin, User, Users, Video, Shield, Coins, Check, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PremiumFeaturesProps {
  isOpen: boolean;
  onClose: () => void;
}

const plans = [
  {
    id: 'basic',
    name: 'Basic',
    price: 'Free',
    features: [
      { name: 'Random Matching', included: true },
      { name: 'Text Chat', included: true },
      { name: 'Basic Filters', included: true },
      { name: 'Video Chat', included: true },
      { name: 'Gender Filters', included: false },
      { name: 'Location Filters', included: false },
      { name: 'Username Tags', included: false },
      { name: 'Priority Matching', included: false },
      { name: 'Ad-Free Experience', included: false },
    ],
    color: 'gray',
    recommended: false,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '$4.99',
    period: 'monthly',
    features: [
      { name: 'Random Matching', included: true },
      { name: 'Text Chat', included: true },
      { name: 'All Filters', included: true },
      { name: 'Video Chat', included: true },
      { name: 'Gender Filters', included: true },
      { name: 'Location Filters', included: true },
      { name: 'Username Tags', included: true },
      { name: 'Priority Matching', included: false },
      { name: 'Ad-Free Experience', included: true },
    ],
    color: 'blue',
    recommended: true,
  },
  {
    id: 'vip',
    name: 'VIP',
    price: '$9.99',
    period: 'monthly',
    features: [
      { name: 'Random Matching', included: true },
      { name: 'Text Chat', included: true },
      { name: 'All Filters', included: true },
      { name: 'Video Chat', included: true },
      { name: 'Gender Filters', included: true },
      { name: 'Location Filters', included: true },
      { name: 'Username Tags', included: true },
      { name: 'Priority Matching', included: true },
      { name: 'Ad-Free Experience', included: true },
    ],
    color: 'yellow',
    recommended: false,
  }
];

const coinPackages = [
  { id: 'small', amount: 100, price: 4.99, discount: 0 },
  { id: 'medium', amount: 250, price: 9.99, discount: 15 },
  { id: 'large', amount: 500, price: 19.99, discount: 25 },
  { id: 'xl', amount: 1000, price: 34.99, discount: 40 },
];

export default function PremiumFeatures({
  isOpen,
  onClose
}: PremiumFeaturesProps) {
  const [activeTab, setActiveTab] = useState<'subscription' | 'coins'>('subscription');
  const [selectedPlan, setSelectedPlan] = useState('premium');
  const [selectedPackage, setSelectedPackage] = useState('medium');
  
  if (!isOpen) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-auto"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-gradient-to-b from-gray-900 to-gray-950 border border-gray-800 rounded-xl shadow-2xl max-w-3xl w-full overflow-hidden my-4"
      >
        <div className="flex justify-between items-center border-b border-gray-800 p-4">
          <h2 className="text-lg font-semibold text-white flex items-center">
            <Crown className="mr-2 h-5 w-5 text-yellow-500" />
            Premium Features
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b border-gray-800">
          <button
            className={`flex-1 py-3 px-4 text-center font-medium ${activeTab === 'subscription' ? 'text-white border-b-2 border-primary' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setActiveTab('subscription')}
          >
            <span className="flex items-center justify-center">
              <Zap className={`mr-2 h-4 w-4 ${activeTab === 'subscription' ? 'text-primary' : 'text-gray-400'}`} />
              Subscription Plans
            </span>
          </button>
          <button
            className={`flex-1 py-3 px-4 text-center font-medium ${activeTab === 'coins' ? 'text-white border-b-2 border-yellow-500' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setActiveTab('coins')}
          >
            <span className="flex items-center justify-center">
              <Coins className={`mr-2 h-4 w-4 ${activeTab === 'coins' ? 'text-yellow-500' : 'text-gray-400'}`} />
              Wave Coins
            </span>
          </button>
        </div>
        
        <div className="p-4">
          {activeTab === 'subscription' ? (
            <div>
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-white mb-2">Unlock the Full Experience</h3>
                <p className="text-gray-400 max-w-lg mx-auto">
                  Choose the plan that's right for you and enjoy advanced features, enhanced matching, and a premium experience.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`border ${selectedPlan === plan.id ? `border-${plan.color}-500 bg-${plan.color}-500/10` : 'border-gray-700 bg-gray-800/40'} rounded-xl p-4 relative hover:border-${plan.color}-500/70 transition-colors`}
                  >
                    {plan.recommended && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-white px-3 py-1 rounded-full text-xs font-medium">
                        Recommended
                      </div>
                    )}
                    
                    <div className="text-center mb-4">
                      <h4 className={`text-lg font-bold ${plan.id === 'basic' ? 'text-white' : `text-${plan.color}-400`}`}>{plan.name}</h4>
                      <div className="flex items-center justify-center mt-1">
                        <span className="text-2xl font-bold text-white">{plan.price}</span>
                        {plan.period && <span className="text-gray-400 ml-1">/{plan.period}</span>}
                      </div>
                    </div>
                    
                    <ul className="space-y-2 mb-4">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm">
                          {feature.included ? (
                            <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          ) : (
                            <X className="h-4 w-4 text-gray-500 mr-2 flex-shrink-0" />
                          )}
                          <span className={feature.included ? 'text-gray-200' : 'text-gray-500'}>
                            {feature.name}
                          </span>
                        </li>
                      ))}
                    </ul>
                    
                    <div className="mt-auto">
                      <Button
                        variant={plan.id === 'basic' ? 'outline' : 'default'}
                        className={`w-full ${plan.id === 'basic' ? 'border-gray-700 text-white hover:bg-gray-700' : `bg-${plan.color}-600 hover:bg-${plan.color}-700 text-white`}`}
                        onClick={() => setSelectedPlan(plan.id)}
                      >
                        {selectedPlan === plan.id ? (
                          <span className="flex items-center">
                            <Check className="mr-1 h-4 w-4" /> Selected
                          </span>
                        ) : plan.id === 'basic' ? 'Current Plan' : 'Select Plan'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-800/50 rounded-xl p-4 flex items-start">
                  <div className="p-2 bg-primary/20 rounded-lg mr-3 flex-shrink-0">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white mb-1">Location Filters</h3>
                    <p className="text-gray-400 text-sm">Find chat partners from specific countries or regions. Connect with people from places that interest you.</p>
                  </div>
                </div>
                
                <div className="bg-gray-800/50 rounded-xl p-4 flex items-start">
                  <div className="p-2 bg-yellow-500/20 rounded-lg mr-3 flex-shrink-0">
                    <User className="h-6 w-6 text-yellow-500" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white mb-1">Username Tags</h3>
                    <p className="text-gray-400 text-sm">Create a unique username that others can search for. Reconnect with friends or interesting conversations.</p>
                  </div>
                </div>
                
                <div className="bg-gray-800/50 rounded-xl p-4 flex items-start">
                  <div className="p-2 bg-green-500/20 rounded-lg mr-3 flex-shrink-0">
                    <Users className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white mb-1">Priority Matching</h3>
                    <p className="text-gray-400 text-sm">Get matched faster during peak hours. VIP members are prioritized in the queue for quicker connections.</p>
                  </div>
                </div>
                
                <div className="bg-gray-800/50 rounded-xl p-4 flex items-start">
                  <div className="p-2 bg-blue-500/20 rounded-lg mr-3 flex-shrink-0">
                    <Video className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white mb-1">Enhanced Video Chat</h3>
                    <p className="text-gray-400 text-sm">Enjoy higher quality video calls with premium members. Better resolution and connection stability.</p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button variant="outline" onClick={onClose} className="mr-2 border-gray-700 text-gray-300">
                  Cancel
                </Button>
                <Button
                  className={`${selectedPlan === 'premium' ? 'bg-blue-600 hover:bg-blue-700' : selectedPlan === 'vip' ? 'bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700' : 'bg-primary'} text-white`}
                >
                  {selectedPlan === 'basic' ? 'Continue with Free Plan' : 'Upgrade Now'}
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-white mb-2">Wave Coins</h3>
                <p className="text-gray-400 max-w-lg mx-auto">
                  Purchase Wave Coins to spend on premium features, unlock special filters, or pay for one-time services without a subscription.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {coinPackages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className={`border ${selectedPackage === pkg.id ? 'border-yellow-500 bg-yellow-500/10' : 'border-gray-700 bg-gray-800/40'} rounded-xl p-4 cursor-pointer hover:border-yellow-500/50 transition-colors`}
                    onClick={() => setSelectedPackage(pkg.id)}
                  >
                    {pkg.discount > 0 && (
                      <div className="bg-green-600 text-white px-2 py-0.5 rounded text-xs font-medium inline-block mb-2">
                        Save {pkg.discount}%
                      </div>
                    )}
                    
                    <div className="flex items-center mb-3">
                      <Coins className="h-5 w-5 text-yellow-500 mr-2" />
                      <span className="text-xl font-bold text-white">{pkg.amount}</span>
                      <span className="text-gray-400 ml-1 text-sm">coins</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-white">${pkg.price}</span>
                      {selectedPackage === pkg.id && (
                        <Check className="h-5 w-5 text-yellow-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="bg-gray-800/50 rounded-xl p-4 mb-6">
                <h3 className="font-medium text-white mb-3">What can you do with coins?</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Shield className="h-5 w-5 text-red-400 mr-3" />
                      <span className="text-gray-300">Unban account</span>
                    </div>
                    <div className="flex items-center bg-gray-700 px-2 py-1 rounded">
                      <Coins className="h-3 w-3 text-yellow-500 mr-1" />
                      <span className="text-white text-sm">200</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 text-blue-400 mr-3" />
                      <span className="text-gray-300">Country filter (24 hours)</span>
                    </div>
                    <div className="flex items-center bg-gray-700 px-2 py-1 rounded">
                      <Coins className="h-3 w-3 text-yellow-500 mr-1" />
                      <span className="text-white text-sm">50</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Users className="h-5 w-5 text-green-400 mr-3" />
                      <span className="text-gray-300">Priority matching (5 matches)</span>
                    </div>
                    <div className="flex items-center bg-gray-700 px-2 py-1 rounded">
                      <Coins className="h-3 w-3 text-yellow-500 mr-1" />
                      <span className="text-white text-sm">30</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <User className="h-5 w-5 text-purple-400 mr-3" />
                      <span className="text-gray-300">Custom username (30 days)</span>
                    </div>
                    <div className="flex items-center bg-gray-700 px-2 py-1 rounded">
                      <Coins className="h-3 w-3 text-yellow-500 mr-1" />
                      <span className="text-white text-sm">100</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button variant="outline" onClick={onClose} className="mr-2 border-gray-700 text-gray-300">
                  Cancel
                </Button>
                <Button className="bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 text-white">
                  Purchase Coins
                </Button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
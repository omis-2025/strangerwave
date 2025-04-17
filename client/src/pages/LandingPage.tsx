import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FaVideo, FaComments, FaShieldAlt, FaGlobe, FaCoins, FaMobile, FaRandom, FaVideo as FaVideoIcon } from 'react-icons/fa';
import { RiChatSmile2Line, RiChatSmileLine } from 'react-icons/ri'; // Using alternative icons
import { motion } from 'framer-motion';

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState('features');
  const [heroImageLoaded, setHeroImageLoaded] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 flex flex-col">
      {/* Header */}
      <header className="container mx-auto py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <motion.div 
            initial={{ rotate: -10 }}
            animate={{ rotate: 10 }}
            transition={{ repeat: Infinity, repeatType: 'reverse', duration: 2 }}
            className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xl"
          >
            S
          </motion.div>
          <h1 className="text-2xl font-bold">StrangerWave</h1>
        </div>
        <div className="flex gap-4">
          <Link href="/chat">
            <Button variant="outline" className="gap-2">
              <FaShieldAlt className="h-4 w-4" />
              Report
            </Button>
          </Link>
          <Link href="/chat">
            <Button>Get Started</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto py-20 flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            Connect with the World, <span className="text-primary">Instantly</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-muted-foreground mb-6"
          >
            StrangerWave brings you authentic connections through text and video chat with people around the globe. Safe, high-quality, and designed for meaningful interactions.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex gap-4"
          >
            <Link href="/chat">
              <Button size="lg" className="gap-2">
                <FaVideo className="h-4 w-4" />
                Start Chatting
              </Button>
            </Link>
            <Link href="/chat">
              <Button size="lg" variant="outline" className="gap-2">
                <FaCoins className="h-4 w-4" />
                Go Premium
              </Button>
            </Link>
          </motion.div>
        </div>
        <div className="md:w-1/2">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="relative rounded-xl overflow-hidden border shadow-xl"
          >
            <img 
              src="/assets/hero-image.png" 
              alt="StrangerWave in action" 
              className="w-full rounded-xl"
              onLoad={() => setHeroImageLoaded(true)}
              onError={(e) => {
                console.log("Image failed to load, falling back");
                e.currentTarget.src = "/assets/phone-mockup.png";
              }}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
              <div className="flex items-center gap-2 text-white">
                <span className="inline-block h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                <span>8,543 users online now</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto py-16 bg-muted/30 rounded-xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Why Choose StrangerWave?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            StrangerWave redefines random chats with premium features designed for better connections.
          </p>
        </div>

        <Tabs defaultValue="features" className="w-full max-w-4xl mx-auto"
          onValueChange={(value) => setActiveTab(value)}>
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="comparison">Vs. Competitors</TabsTrigger>
            <TabsTrigger value="premium">Premium Benefits</TabsTrigger>
          </TabsList>
          
          <TabsContent value="features" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FeatureCard 
                icon={<FaVideo className="h-10 w-10 text-primary" />}
                title="HD Video Chat"
                description="Crystal clear video with adaptive quality that adjusts to your connection."
              />
              <FeatureCard 
                icon={<FaShieldAlt className="h-10 w-10 text-primary" />}
                title="Advanced Safety"
                description="AI-powered moderation and comprehensive reporting system."
              />
              <FeatureCard 
                icon={<FaGlobe className="h-10 w-10 text-primary" />}
                title="Global Matching"
                description="Connect with people worldwide with advanced country filtering."
              />
              <FeatureCard 
                icon={<FaComments className="h-10 w-10 text-primary" />}
                title="Smart Matching"
                description="Find connections based on interests and preferences."
              />
              <FeatureCard 
                icon={<FaMobile className="h-10 w-10 text-primary" />}
                title="Mobile Ready"
                description="Full experience on mobile with native apps for iOS and Android."
              />
              <FeatureCard 
                icon={<FaCoins className="h-10 w-10 text-primary" />}
                title="Fair Monetization"
                description="Free core experience with affordable premium options."
              />
            </div>
          </TabsContent>
          
          <TabsContent value="comparison">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-primary/10">
                    <th className="p-3 text-left">Feature</th>
                    <th className="p-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className="font-bold">StrangerWave</span>
                      </div>
                    </th>
                    <th className="p-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <RiChatSmileLine className="h-4 w-4" />
                        <span>Omegle</span>
                      </div>
                    </th>
                    <th className="p-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <RiChatSmile2Line className="h-4 w-4" />
                        <span>Chatroulette</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <ComparisonRow 
                    feature="Video Quality" 
                    strangerwave="HD Adaptive" 
                    omegle="Basic" 
                    chatroulette="Medium"
                  />
                  <ComparisonRow 
                    feature="Mobile Apps" 
                    strangerwave="Native iOS/Android" 
                    omegle="None" 
                    chatroulette="Basic Web"
                  />
                  <ComparisonRow 
                    feature="Content Moderation" 
                    strangerwave="AI + Human" 
                    omegle="Basic" 
                    chatroulette="Basic"
                  />
                  <ComparisonRow 
                    feature="Gender Options" 
                    strangerwave="Comprehensive" 
                    omegle="Binary Only" 
                    chatroulette="Binary Only"
                  />
                  <ComparisonRow 
                    feature="Premium Features" 
                    strangerwave="Multiple Tiers" 
                    omegle="None" 
                    chatroulette="Limited"
                  />
                  <ComparisonRow 
                    feature="UI Design" 
                    strangerwave="Modern" 
                    omegle="Outdated" 
                    chatroulette="Basic"
                  />
                </tbody>
              </table>
            </div>
          </TabsContent>
          
          <TabsContent value="premium">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <PricingCard 
                title="Basic"
                price="Free"
                period=""
                features={[
                  "Random matching",
                  "Basic filters",
                  "Standard video quality",
                  "Text chat",
                  "20 matches per day",
                  "Basic reporting"
                ]}
                buttonText="Start Free"
                buttonLink="/chat"
                popular={false}
              />
              <PricingCard 
                title="Premium"
                price="$2.99"
                period="monthly"
                features={[
                  "All Basic features",
                  "No advertisements",
                  "Premium badge",
                  "Advanced filters",
                  "Priority matching",
                  "Unlimited matches",
                  "HD video quality"
                ]}
                buttonText="Go Premium"
                buttonLink="/chat"
                popular={true}
              />
              <PricingCard 
                title="VIP"
                price="$7.99"
                period="monthly"
                features={[
                  "All Premium features",
                  "Exclusive VIP badge",
                  "Ultra HD video",
                  "Extended history",
                  "Priority support",
                  "Custom themes",
                  "Read receipts"
                ]}
                buttonText="Upgrade to VIP"
                buttonLink="/chat"
                popular={false}
              />
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto py-16">
        <h2 className="text-3xl font-bold text-center mb-12">What Our Users Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <TestimonialCard 
            quote="I've tried all the random chat apps, but StrangerWave is in a league of its own. The video quality is amazing and I feel much safer."
            author="Sarah K."
            location="United States"
            rating={5}
          />
          <TestimonialCard 
            quote="As a language learner, I use StrangerWave to practice with native speakers. The country filter is perfect for finding people from specific regions."
            author="Miguel R."
            location="Spain"
            rating={5}
          />
          <TestimonialCard 
            quote="The premium features are actually worth it. Priority matching means I spend less time waiting and more time having great conversations."
            author="Aiden T."
            location="Australia"
            rating={4}
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto py-16 mb-8">
        <div className="bg-primary/10 rounded-xl p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Connect?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Join thousands of users already making meaningful connections on StrangerWave. Start chatting for free today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/chat">
              <Button size="lg" className="w-full sm:w-auto">Create Account</Button>
            </Link>
            <Link href="/chat">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Explore Features
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t py-8">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                S
              </div>
              <span className="font-semibold">StrangerWave</span>
            </div>
            <div className="flex gap-8">
              <Link href="/chat">About</Link>
              <Link href="/chat">Privacy</Link>
              <Link href="/chat">Terms</Link>
              <Link href="/chat">Support</Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-muted-foreground text-sm">
            &copy; 2025 StrangerWave. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

// Types for our components
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface ComparisonRowProps {
  feature: string;
  strangerwave: string;
  omegle: string;
  chatroulette: string;
}

interface PricingCardProps {
  title: string;
  price: string;
  period?: string;  // Optional for "Free" tier
  features: string[];
  buttonText: string;
  buttonLink: string;
  popular: boolean;
}

interface TestimonialCardProps {
  quote: string;
  author: string;
  location: string;
  rating: number;
}

// Helper Components
const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
  <Card>
    <CardHeader className="pb-2">
      <div className="mb-2">{icon}</div>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <CardDescription>{description}</CardDescription>
    </CardContent>
  </Card>
);

const ComparisonRow: React.FC<ComparisonRowProps> = ({ feature, strangerwave, omegle, chatroulette }) => (
  <tr className="border-b">
    <td className="p-3 font-medium">{feature}</td>
    <td className="p-3 text-center bg-primary/5 font-medium text-primary">{strangerwave}</td>
    <td className="p-3 text-center">{omegle}</td>
    <td className="p-3 text-center">{chatroulette}</td>
  </tr>
);

const PricingCard: React.FC<PricingCardProps> = ({ title, price, period, features, buttonText, buttonLink, popular }) => (
  <Card className={`relative overflow-hidden ${popular ? 'border-primary shadow-lg' : ''}`}>
    {popular && (
      <div className="absolute top-0 right-0">
        <div className="bg-primary text-primary-foreground px-3 py-1 text-xs font-medium rounded-bl-lg">
          MOST POPULAR
        </div>
      </div>
    )}
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      <div className="mt-2">
        <span className="text-3xl font-bold">{price}</span>
        {period && <span className="text-muted-foreground">/{period}</span>}
      </div>
    </CardHeader>
    <CardContent>
      <ul className="space-y-2">
        {features.map((feature: string, i: number) => (
          <li key={i} className="flex items-center gap-2">
            <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {feature}
          </li>
        ))}
      </ul>
    </CardContent>
    <CardFooter>
      <Link href={buttonLink} className="w-full">
        <Button className={`w-full ${popular ? '' : 'bg-muted/70 hover:bg-muted'}`} variant={popular ? "default" : "outline"}>
          {buttonText}
        </Button>
      </Link>
    </CardFooter>
  </Card>
);

const TestimonialCard: React.FC<TestimonialCardProps> = ({ quote, author, location, rating }) => (
  <Card>
    <CardContent className="pt-6">
      <div className="flex mb-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <svg 
            key={i} 
            className={`h-4 w-4 ${i < rating ? 'text-yellow-500' : 'text-muted'}`} 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <p className="italic mb-4">"{quote}"</p>
      <div className="text-sm">
        <p className="font-semibold">{author}</p>
        <p className="text-muted-foreground">{location}</p>
      </div>
    </CardContent>
  </Card>
);
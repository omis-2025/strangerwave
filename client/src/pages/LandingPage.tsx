import { useState, useEffect, useRef } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FaVideo, FaComments, FaShieldAlt, FaGlobe, FaCoins, FaMobile, 
  FaVideo as FaVideoIcon, FaRandom, FaBan, FaStar, FaPalette
} from 'react-icons/fa';
import { FaInfinity } from 'react-icons/fa6';
import { RiChatSmile2Line, RiChatSmileLine } from 'react-icons/ri'; // Using alternative icons
import { motion } from 'framer-motion';
import { MessageSquare, Video, Check, Crown, AlertCircle } from 'lucide-react';
import StaticImage from '@/components/StaticImage';
import { TrustBadgesGroup, PaymentProviderLogos, SecurityTestimonial } from '@/components/TrustBadges';

// Import images directly
import heroImage from '@/assets/hero-image.png';
import phoneMockup from '@/assets/phone-mockup.png';
import sarahProfile from '@/assets/profiles/sarah.png';
import miguelProfile from '@/assets/profiles/miguel.png';
import aidenProfile from '@/assets/profiles/aiden.png';

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState('features');
  const [heroImageLoaded, setHeroImageLoaded] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [autoScrollPaused, setAutoScrollPaused] = useState(false);
  const testimonialsRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll testimonials every 5 seconds
  useEffect(() => {
    if (autoScrollPaused) return;
    
    const interval = setInterval(() => {
      setCurrentTestimonial(prev => {
        // If we're at the last testimonial, go back to the first
        if (prev >= testimonialsData.length - 1) {
          return 0;
        }
        return prev + 1;
      });
    }, 5000);
    
    return () => clearInterval(interval);
  }, [autoScrollPaused]);
  
  const testimonialsData = [
    {
      quote: "I've tried all the random chat apps, but StrangerWave is in a league of its own. The video quality is amazing and I feel much safer.",
      author: "Sarah K.",
      location: "United States",
      rating: 5,
      imageSrc: sarahProfile
    },
    {
      quote: "As a language learner, I use StrangerWave to practice with native speakers. The country filter is perfect for finding people from specific regions.",
      author: "Miguel R.",
      location: "Spain",
      rating: 5,
      imageSrc: miguelProfile
    },
    {
      quote: "The premium features are actually worth it. Priority matching means I spend less time waiting and more time having great conversations.",
      author: "Aiden T.",
      location: "Australia",
      rating: 4,
      imageSrc: aidenProfile
    },
    {
      quote: "I was skeptical at first, but the VIP subscription is totally worth it. Ultra HD video calls and the extra privacy features make it stand out.",
      author: "Emma L.",
      location: "Canada",
      rating: 5,
      imageSrc: sarahProfile
    },
    {
      quote: "Meeting people from around the world has never been easier. The interface is sleek and I love how I can quickly filter by interests.",
      author: "Jason M.",
      location: "UK",
      rating: 4,
      imageSrc: aidenProfile
    }
  ];

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

      {/* Hero Section - Improved layout for both mobile and desktop */}
      <section className="container mx-auto py-12 md:py-20 max-w-7xl">
        {/* Mobile version (stacked) */}
        <div className="flex flex-col items-center text-center md:hidden">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold mb-2"
          >
            Connect with the World,
            <div className="relative inline-block mt-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">Instantly</span>
              <motion.span 
                className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-400/20 blur-xl z-[-1] rounded-lg"
                initial={{ opacity: 0.5, scale: 1 }}
                animate={{ opacity: [0.5, 0.8, 0.5], scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-lg text-gray-400 mb-4 font-medium"
          >
            Meet new people through fast, anonymous chats — no sign-up required.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="relative rounded-xl overflow-hidden border shadow-xl w-full max-w-md mb-8"
          >
            <img 
              src={heroImage} 
              alt="StrangerWave in action" 
              className="w-full rounded-xl"
              onLoad={() => setHeroImageLoaded(true)}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
              <div className="flex items-center justify-center gap-2 text-white">
                <span className="inline-block h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                <span>8,543 users online now</span>
              </div>
            </div>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-muted-foreground mb-6 max-w-md"
          >
            StrangerWave brings you authentic connections through text and video chat with people around the globe. Safe, high-quality, and designed for meaningful interactions.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 w-full justify-center"
          >
            <Link href="/chat" onClick={() => {
              console.log("Start chatting clicked - setting navigation flag");
              localStorage.setItem('startChatting', 'true');
              try {
                if (window.gtag) window.gtag('event', 'start_chatting_click');
              } catch (e) {
                console.warn("Analytics tracking error:", e);
              }
            }} className="w-full sm:w-auto">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className="w-full"
              >
                <Button size="lg" className="gap-2 group relative overflow-hidden bg-gradient-to-r from-primary to-primary/90 w-full sm:w-auto shadow-md hover:shadow-lg transition-shadow">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-95 group-hover:scale-100" />
                  <div className="relative z-10 flex items-center">
                    <FaVideo className="h-4 w-4 animate-pulse mr-2" />
                    <motion.span 
                      initial={{ opacity: 1 }}
                      animate={{ opacity: [1, 0.8, 1] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      Start Chatting
                    </motion.span>
                  </div>
                </Button>
              </motion.div>
            </Link>
            <Link href="/pricing" onClick={() => {
              console.log("Go premium clicked");
              try {
                if (window.gtag) window.gtag('event', 'premium_click');
              } catch (e) {
                console.warn("Analytics tracking error:", e);
              }
            }} className="w-full sm:w-auto">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className="w-full"
              >
                <Button size="lg" variant="outline" className="gap-2 group border-primary hover:border-primary/80 transition-colors w-full sm:w-auto">
                  <FaCoins className="h-4 w-4 text-primary group-hover:animate-spin-slow" />
                  <span>View Pricing</span>
                </Button>
              </motion.div>
            </Link>
          </motion.div>
          
          {/* Trust Badges for mobile */}
          <div className="mt-8 w-full">
            <TrustBadgesGroup />
          </div>
        </div>
        
        {/* Desktop version (side by side) */}
        <div className="hidden md:flex md:flex-row md:items-center md:justify-between">
          <div className="w-5/12 pr-8">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-5xl font-bold mb-6"
            >
              <div className="mb-2">Connect with the World,</div>
              <div className="relative inline-block">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">Instantly</span>
                <motion.span 
                  className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-400/20 blur-xl z-[-1] rounded-lg"
                  initial={{ opacity: 0.5, scale: 1 }}
                  animate={{ opacity: [0.5, 0.8, 0.5], scale: [1, 1.05, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-xl text-gray-400 mb-4 font-medium"
            >
              Meet new people through fast, anonymous chats — no sign-up required.
            </motion.p>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-muted-foreground mb-8"
            >
              StrangerWave brings you authentic connections through text and video chat with people around the globe. Safe, high-quality, and designed for meaningful interactions.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex gap-4"
            >
              <Link href="/chat" onClick={() => {
                console.log("Start chatting clicked - setting navigation flag");
                localStorage.setItem('startChatting', 'true');
                try {
                  if (window.gtag) window.gtag('event', 'start_chatting_click');
                } catch (e) {
                  console.warn("Analytics tracking error:", e);
                }
              }}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Button size="lg" className="gap-2 group relative overflow-hidden bg-gradient-to-r from-primary to-primary/90 shadow-md hover:shadow-lg transition-shadow">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-95 group-hover:scale-100" />
                    <div className="relative z-10 flex items-center">
                      <FaVideo className="h-4 w-4 animate-pulse mr-2" />
                      <motion.span 
                        initial={{ opacity: 1 }}
                        animate={{ opacity: [1, 0.8, 1] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      >
                        Start Chatting
                      </motion.span>
                    </div>
                  </Button>
                </motion.div>
              </Link>
              <Link href="/pricing" onClick={() => {
                console.log("Go premium clicked");
                try {
                  if (window.gtag) window.gtag('event', 'premium_click');
                } catch (e) {
                  console.warn("Analytics tracking error:", e);
                }
              }}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Button size="lg" variant="outline" className="gap-2 group border-primary hover:border-primary/80 transition-colors">
                    <FaCoins className="h-4 w-4 text-primary group-hover:animate-spin-slow" />
                    <span>View Pricing</span>
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
            
            {/* Trust Badges for desktop */}
            <div className="mt-8">
              <TrustBadgesGroup />
            </div>
          </div>
          
          <div className="w-7/12 flex justify-center items-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="relative rounded-xl overflow-hidden border shadow-2xl w-full max-w-2xl ml-4"
            >
              <img 
                src={heroImage} 
                alt="StrangerWave in action" 
                className="w-full rounded-xl"
                onLoad={() => setHeroImageLoaded(true)}
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                <div className="flex items-center gap-2 text-white">
                  <span className="inline-block h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                  <span>8,543 users online now</span>
                </div>
              </div>
            </motion.div>
          </div>
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
                price="$4.99"
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
                buttonText="View Plan"
                buttonLink="/pricing"
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
      <section className="container mx-auto py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-purple-500/5 opacity-50 rounded-3xl" />
        
        <div className="relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Users Say</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join thousands of satisfied users already connecting on StrangerWave
            </p>
            <div className="flex justify-center gap-2 mt-4">
              <span className="inline-block h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="inline-block h-2 w-2 rounded-full bg-primary/70 animate-pulse" style={{ animationDelay: '0.2s' }} />
              <span className="inline-block h-2 w-2 rounded-full bg-primary/50 animate-pulse" style={{ animationDelay: '0.4s' }} />
            </div>
          </motion.div>
          
          <div className="relative max-w-5xl mx-auto" ref={testimonialsRef}>
            <div className="overflow-hidden"
             onMouseEnter={() => setAutoScrollPaused(true)}
             onMouseLeave={() => setAutoScrollPaused(false)}
            >
              <motion.div 
                className="flex gap-6 px-4"
                animate={{ x: -currentTestimonial * 100 + '%' }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                {testimonialsData.map((testimonial, index) => (
                  <div 
                    key={index} 
                    className="w-full md:w-1/2 lg:w-1/3 flex-shrink-0 px-2"
                  >
                    <TestimonialCard 
                      quote={testimonial.quote}
                      author={testimonial.author}
                      location={testimonial.location}
                      rating={testimonial.rating}
                      imageSrc={testimonial.imageSrc}
                    />
                  </div>
                ))}
              </motion.div>
            </div>
            
            {/* Navigation dots */}
            <div className="flex justify-center gap-3 mt-10">
              {testimonialsData.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    currentTestimonial === index 
                      ? 'bg-primary scale-125' 
                      : 'bg-gray-600 hover:bg-gray-500'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
            
            {/* Navigation arrows */}
            <div className="hidden md:block">
              <motion.button
                whileHover={{ scale: 1.1, x: -3 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentTestimonial(prev => Math.max(0, prev - 1))}
                className={`absolute top-1/2 -translate-y-1/2 left-0 -ml-6 w-12 h-12 rounded-full bg-background/80 backdrop-blur-sm border border-gray-800 shadow-lg flex items-center justify-center group ${
                  currentTestimonial === 0 ? 'opacity-50 cursor-not-allowed' : 'opacity-90 hover:opacity-100 hover:border-primary/50 hover:shadow-primary/20 hover:shadow-xl'
                }`}
                disabled={currentTestimonial === 0}
              >
                <motion.div
                  className="h-5 w-5 text-gray-400 group-hover:text-primary transition-colors duration-200"
                  initial={{ x: 0 }}
                  whileHover={{ x: -2 }}
                >
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </motion.div>
                <div className="absolute inset-0 bg-primary/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1, x: 3 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentTestimonial(prev => Math.min(testimonialsData.length - 1, prev + 1))}
                className={`absolute top-1/2 -translate-y-1/2 right-0 -mr-6 w-12 h-12 rounded-full bg-background/80 backdrop-blur-sm border border-gray-800 shadow-lg flex items-center justify-center group ${
                  currentTestimonial === testimonialsData.length - 1 ? 'opacity-50 cursor-not-allowed' : 'opacity-90 hover:opacity-100 hover:border-primary/50 hover:shadow-primary/20 hover:shadow-xl'
                }`}
                disabled={currentTestimonial === testimonialsData.length - 1}
              >
                <motion.div
                  className="h-5 w-5 text-gray-400 group-hover:text-primary transition-colors duration-200"
                  initial={{ x: 0 }}
                  whileHover={{ x: 2 }}
                >
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </motion.div>
                <div className="absolute inset-0 bg-primary/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </motion.button>
            </div>
            
            {/* Mobile navigation arrows */}
            <div className="flex justify-between md:hidden mt-8">
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setCurrentTestimonial(prev => Math.max(0, prev - 1))}
                disabled={currentTestimonial === 0}
                className="border-gray-700 hover:bg-primary/10 hover:border-primary/50"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Button>
              
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setCurrentTestimonial(prev => Math.min(testimonialsData.length - 1, prev + 1))}
                disabled={currentTestimonial === testimonialsData.length - 1}
                className="border-gray-700 hover:bg-primary/10 hover:border-primary/50"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto py-16 mb-8">
        <div className="bg-primary/10 rounded-xl p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Connect?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            Join thousands of users already making meaningful connections on StrangerWave. Start chatting for free today.
          </p>
          
          {/* Trust Badges */}
          <TrustBadgesGroup />
          <PaymentProviderLogos />
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
            <Link href="/chat" onClick={() => {
              console.log("Create account clicked - setting navigation flag");
              localStorage.setItem('startChatting', 'true');
              try {
                if (window.gtag) window.gtag('event', 'create_account_click');
              } catch (e) {
                console.warn("Analytics tracking error:", e);
              }
            }}>
              <Button size="lg" className="w-full sm:w-auto">Create Account</Button>
            </Link>
            <Link href="/pricing" onClick={() => {
              console.log("Explore features clicked");
              // Don't set startChatting flag for features link
              try {
                if (window.gtag) window.gtag('event', 'explore_features_click');
              } catch (e) {
                console.warn("Analytics tracking error:", e);
              }
            }}>
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Explore Features
              </Button>
            </Link>
          </div>
          
          {/* Security Testimonial */}
          <div className="max-w-md mx-auto mt-8">
            <SecurityTestimonial />
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
  imageSrc?: string;
}

// Helper Components
const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
  <motion.div
    whileHover={{ y: -5 }}
    transition={{ type: "spring", stiffness: 300 }}
  >
    <Card className="h-full border border-gray-800 hover:border-primary/50 transition-colors duration-300">
      <CardHeader className="pb-2">
        <motion.div 
          className="mb-3 text-primary"
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          {icon}
        </motion.div>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-gray-400">{description}</CardDescription>
      </CardContent>
    </Card>
  </motion.div>
);

const ComparisonRow: React.FC<ComparisonRowProps> = ({ feature, strangerwave, omegle, chatroulette }) => (
  <tr className="border-b">
    <td className="p-3 font-medium">{feature}</td>
    <td className="p-3 text-center bg-primary/5 font-medium text-primary">{strangerwave}</td>
    <td className="p-3 text-center">{omegle}</td>
    <td className="p-3 text-center">{chatroulette}</td>
  </tr>
);

const PricingCard: React.FC<PricingCardProps> = ({ title, price, period, features, buttonText, buttonLink, popular }) => {
  // Function to get the icon for a feature based on keywords
  const getFeatureIcon = (feature: string) => {
    if (feature.includes("chat") || feature.includes("match")) return <MessageSquare className="h-4 w-4 text-primary" />;
    if (feature.includes("filter")) return <FaRandom className="h-3.5 w-3.5 text-primary" />;
    if (feature.includes("video")) return <Video className="h-4 w-4 text-primary" />;
    if (feature.includes("HD") || feature.includes("Ultra")) return <FaVideoIcon className="h-3.5 w-3.5 text-amber-500" />;
    if (feature.includes("premium") || feature.includes("badge")) return <Crown className="h-4 w-4 text-amber-500" />;
    if (feature.includes("support")) return <FaShieldAlt className="h-3.5 w-3.5 text-green-500" />;
    if (feature.includes("report")) return <AlertCircle className="h-4 w-4 text-red-500" />;
    if (feature.includes("theme")) return <FaPalette className="h-3.5 w-3.5 text-purple-500" />;
    if (feature.includes("advertisement") || feature.includes("ad")) return <FaBan className="h-3.5 w-3.5 text-red-500" />;
    if (feature.includes("unlimited")) return <FaInfinity className="h-3.5 w-3.5 text-blue-500" />;
    if (feature.includes("priorit")) return <FaStar className="h-3.5 w-3.5 text-yellow-500" />;
    // Default icon
    return <Check className="h-4 w-4 text-primary" />;
  };

  // Generate the pricing description based on the plan title
  const getPricingDescription = () => {
    if (title === "Basic") return "Just here to vibe? We gotchu.";
    if (title === "Premium") return "No ads, better filters, unlimited matches. Big brain move.";
    if (title === "VIP") return "You get the royal treatment. Ultra HD, custom vibes, and priority everything.";
    return "";
  };

  // Calculate the daily price for premium plan
  const getDailyPrice = () => {
    if (title === "Premium" && period === "monthly") {
      return "$0.10/day";
    }
    return null;
  };

  // Calculate yearly savings
  const getYearlySavings = () => {
    if (title === "Premium" && price === "$4.99") {
      return "Save 16% with yearly billing";
    }
    if (title === "VIP" && price === "$7.99") {
      return "Save 16% with yearly billing";
    }
    return null;
  };

  const dailyPrice = getDailyPrice();
  const yearlySavings = getYearlySavings();
  const pricingDescription = getPricingDescription();
  
  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card 
        className={`relative overflow-hidden h-full ${
          popular 
            ? 'border-primary border-2 shadow-lg shadow-primary/20' 
            : 'border-gray-700 hover:border-gray-600'
        } ${
          title === "VIP" ? 'bg-gradient-to-b from-gray-900 to-gray-900' : ''
        }`}
      >
        {/* Best Value Ribbon for Premium */}
        {title === "Premium" && (
          <div className="absolute -top-1 -right-1 z-10">
            <div className="bg-blue-500 text-white px-3 py-1 text-xs font-medium rounded-br-md shadow-lg transform rotate-12 translate-y-2">
              BEST VALUE
            </div>
          </div>
        )}
        
        {/* VIP Crown & Glow Effect */}
        {title === "VIP" && (
          <>
            <div className="absolute -top-3 -left-3">
              <motion.div 
                className="text-amber-500 text-2xl z-10"
                animate={{ y: [0, 3, 0], rotate: [0, 5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Crown />
              </motion.div>
            </div>
            <motion.div 
              className="absolute inset-0 bg-amber-500/5 z-0"
              animate={{ 
                boxShadow: ['0 0 15px 2px rgba(245, 158, 11, 0.1)', '0 0 20px 3px rgba(245, 158, 11, 0.2)', '0 0 15px 2px rgba(245, 158, 11, 0.1)'] 
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </>
        )}
        
        <CardHeader className={`relative ${title === "VIP" ? 'pb-2' : 'pb-3'}`}>
          <div className="flex justify-between items-center mb-1">
            <CardTitle className={`text-2xl ${title === "VIP" ? 'text-amber-500' : ''}`}>
              {title}
            </CardTitle>
            
            {title === "VIP" && (
              <motion.div 
                className="text-amber-500"
                animate={{ rotate: [0, 10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <Crown className="h-5 w-5" />
              </motion.div>
            )}
          </div>
          
          {pricingDescription && (
            <p className="text-sm text-gray-400 font-normal">
              {pricingDescription}
            </p>
          )}
          
          <div className="mt-3 flex items-baseline">
            <span className={`text-3xl font-bold ${title === "VIP" ? 'text-white' : ''}`}>{price}</span>
            {period && <span className="text-muted-foreground ml-1">/{period}</span>}
          </div>
          
          {dailyPrice && (
            <p className="text-xs text-green-500 mt-1 font-medium">
              {dailyPrice}
            </p>
          )}
          
          {yearlySavings && (
            <p className="text-xs text-amber-500/80 mt-1 font-medium flex items-center">
              <motion.span 
                className="mr-1"
                animate={{ rotate: 360 }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              >
                <FaCoins className="h-3 w-3" />
              </motion.span>
              {yearlySavings}
            </p>
          )}
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {features.map((feature: string, i: number) => (
              <motion.li 
                key={i} 
                className="flex items-center gap-2 text-sm"
                whileHover={{ x: 3 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                {getFeatureIcon(feature)}
                <span className={title === "VIP" ? 'text-gray-300' : ''}>
                  {feature}
                </span>
              </motion.li>
            ))}
          </ul>
        </CardContent>
        <CardFooter>
          <Link href={buttonLink} className="w-full" onClick={() => localStorage.setItem('startChatting', 'true')}>
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="w-full"
            >
              <Button 
                className={`w-full group ${
                  title === "VIP" 
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white' 
                    : title === "Premium" 
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white'
                      : 'bg-gray-700 hover:bg-gray-600 text-white'
                }`}
              >
                <span className="relative z-10 flex items-center gap-2">
                  {title === "VIP" && <Crown className="h-4 w-4 group-hover:animate-pulse" />}
                  {buttonText}
                </span>
              </Button>
            </motion.div>
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

const TestimonialCard: React.FC<TestimonialCardProps> = ({ quote, author, location, rating, imageSrc }) => (
  <motion.div
    whileHover={{ y: -5 }}
    transition={{ type: "spring", stiffness: 300 }}
  >
    <Card className="h-full border border-gray-800 hover:border-primary/40 transition-all duration-300 relative overflow-hidden">
      {/* Quote mark background */}
      <div className="absolute top-3 right-3 opacity-5 text-primary text-7xl font-serif z-0">
        "
      </div>
      
      <CardContent className="pt-6 relative z-10">
        <div className="flex mb-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.svg 
              key={i} 
              className={`h-4 w-4 ${i < rating ? 'text-yellow-500' : 'text-muted'}`} 
              fill="currentColor" 
              viewBox="0 0 20 20"
              initial={{ scale: 1 }}
              whileHover={{ scale: 1.2, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </motion.svg>
          ))}
          <span className="ml-2 text-xs text-gray-400 mt-0.5">{rating}.0</span>
        </div>
        
        <p className="italic mb-6 text-gray-300 relative z-10">"{quote}"</p>
        
        <div className="flex items-center gap-3 pt-4 border-t border-gray-800">
          {imageSrc && (
            <motion.div 
              className="h-12 w-12 rounded-full overflow-hidden ring-2 ring-primary/30"
              whileHover={{ scale: 1.1 }}
            >
              <img src={imageSrc} alt={`${author} profile`} className="h-full w-full object-cover" />
            </motion.div>
          )}
          <div className="text-sm">
            <p className="font-semibold text-white">{author}</p>
            <p className="text-muted-foreground flex items-center gap-1">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary/60 mr-1"></span>
              {location}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);
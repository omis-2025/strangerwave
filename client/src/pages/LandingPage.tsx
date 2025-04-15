import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { FlexContainer, ResponsiveContainer } from '@/components/ui/responsive-container';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/lib/useAuth';
import { MessageSquare, Shield, Zap, Globe, Users, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const testimonials = [
  {
    name: "Alex",
    location: "United States",
    message: "Made so many interesting connections! Way better than other anonymous chat apps.",
    stars: 5,
  },
  {
    name: "Sophia",
    location: "Germany",
    message: "Love the chat filters. I can actually have meaningful conversations with people who share my interests.",
    stars: 5,
  },
  {
    name: "Miguel",
    location: "Spain",
    message: "The moderation system actually works - no more inappropriate messages!",
    stars: 4,
  },
];

// Random number between min and max, inclusive
const getRandomNumber = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export default function LandingPage() {
  const [activeUsers, setActiveUsers] = useState(getRandomNumber(150, 350));
  const [countriesCount, setCountriesCount] = useState(getRandomNumber(25, 45));
  const [_, navigate] = useLocation();
  const isMobile = useIsMobile();
  const { user, login } = useAuth();
  const { toast } = useToast();

  // Simulate fluctuating user count
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveUsers(prev => {
        const change = getRandomNumber(-5, 10);
        return Math.max(150, prev + change);
      });
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const handleGetStarted = async () => {
    try {
      await login();
      navigate('/chat');
      toast({
        title: "Welcome to StrangerWave!",
        description: "You're now logged in anonymously.",
      });
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 md:pt-20 pb-20 md:pb-28">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-900 to-primary/20 opacity-80 z-0"></div>
        
        {/* Animated background dots */}
        <div className="absolute inset-0 z-0">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-2 w-2 rounded-full bg-primary/30"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0.2, 0.8, 0.2],
              }}
              transition={{
                duration: Math.random() * 5 + 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
        
        <ResponsiveContainer className="relative z-10 px-6 mx-auto max-w-7xl">
          <div className="text-center">
            {/* User count badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center px-3 py-1 mb-6 text-sm font-medium rounded-full bg-primary/20 text-primary-foreground border border-primary/30"
            >
              <Users className="w-4 h-4 mr-1" />
              <span>{activeUsers} users online now</span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300"
            >
              Connect Anonymously with <span className="text-primary">Real People</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg md:text-xl text-gray-300 mb-8 max-w-3xl mx-auto"
            >
              Chat instantly with strangers around the world, filtered by your interests, in a safe, moderated environment.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Button 
                onClick={handleGetStarted}
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-white font-medium rounded-full px-8 py-3 text-lg shadow-lg hover:shadow-primary/20 transition-all"
              >
                Start Chatting Now
              </Button>
              <p className="mt-4 text-sm text-gray-400">No registration required</p>
            </motion.div>
          </div>
          
          {/* Device mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="mt-16 mx-auto max-w-lg relative"
          >
            <div className="relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[600px] max-w-[300px] md:h-[682px] md:max-w-[341px]">
              <div className="h-[32px] w-[3px] bg-gray-800 dark:bg-gray-800 absolute -left-[17px] top-[72px] rounded-l-lg"></div>
              <div className="h-[46px] w-[3px] bg-gray-800 dark:bg-gray-800 absolute -left-[17px] top-[124px] rounded-l-lg"></div>
              <div className="h-[46px] w-[3px] bg-gray-800 dark:bg-gray-800 absolute -left-[17px] top-[178px] rounded-l-lg"></div>
              <div className="h-[64px] w-[3px] bg-gray-800 dark:bg-gray-800 absolute -right-[17px] top-[142px] rounded-r-lg"></div>
              <div className="rounded-[2rem] overflow-hidden h-full w-full bg-white">
                <img 
                  src="/assets/phone-mockup.png" 
                  className="h-full w-full object-cover"
                  alt="StrangerChat mobile preview" 
                />
              </div>
            </div>
          </motion.div>
          
          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="p-6 rounded-xl bg-gray-800/50 backdrop-blur-sm"
            >
              <div className="text-3xl md:text-4xl font-bold text-primary mb-1">{activeUsers}+</div>
              <div className="text-gray-400 text-sm">Active Users</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="p-6 rounded-xl bg-gray-800/50 backdrop-blur-sm"
            >
              <div className="text-3xl md:text-4xl font-bold text-primary mb-1">{countriesCount}+</div>
              <div className="text-gray-400 text-sm">Countries</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="p-6 rounded-xl bg-gray-800/50 backdrop-blur-sm"
            >
              <div className="text-3xl md:text-4xl font-bold text-primary mb-1">24/7</div>
              <div className="text-gray-400 text-sm">Availability</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 }}
              className="p-6 rounded-xl bg-gray-800/50 backdrop-blur-sm"
            >
              <div className="text-3xl md:text-4xl font-bold text-primary mb-1">100%</div>
              <div className="text-gray-400 text-sm">Anonymous</div>
            </motion.div>
          </div>
        </ResponsiveContainer>
      </section>
      
      {/* Features Section */}
      <section className="py-20 md:py-28 bg-gray-900">
        <ResponsiveContainer className="px-6 mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose StrangerWave?</h2>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto">Our platform combines anonymity with safety to create the best chat experience.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="p-6 rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700"
            >
              <div className="h-12 w-12 bg-primary/20 rounded-xl flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">AI-Powered Moderation</h3>
              <p className="text-gray-400">Our advanced AI detects inappropriate content in real-time, creating a safe environment for all users.</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="p-6 rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700"
            >
              <div className="h-12 w-12 bg-primary/20 rounded-xl flex items-center justify-center mb-4">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Global Matching</h3>
              <p className="text-gray-400">Connect with people from over {countriesCount} countries with our intelligent matching system.</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="p-6 rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700"
            >
              <div className="h-12 w-12 bg-primary/20 rounded-xl flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Lightning Fast</h3>
              <p className="text-gray-400">Get connected with new chat partners in seconds with our optimized matching algorithm.</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="p-6 rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700"
            >
              <div className="h-12 w-12 bg-primary/20 rounded-xl flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Smart Filters</h3>
              <p className="text-gray-400">Set gender and location preferences to find exactly the kind of people you want to chat with.</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="p-6 rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700"
            >
              <div className="h-12 w-12 bg-primary/20 rounded-xl flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Text Chat</h3>
              <p className="text-gray-400">Enjoy smooth, responsive text chat with real-time typing indicators and read receipts.</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="p-6 rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700"
            >
              <div className="h-12 w-12 bg-primary/20 rounded-xl flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Total Privacy</h3>
              <p className="text-gray-400">Your identity remains completely anonymous. We don't store personal information or chat histories.</p>
            </motion.div>
          </div>
        </ResponsiveContainer>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-20 md:py-28 bg-gray-900/50 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-primary/10 opacity-50 z-0"></div>
        
        <ResponsiveContainer className="relative z-10 px-6 mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Users Say</h2>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto">Join thousands of satisfied users who love StrangerWave.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * index }}
                className="p-6 rounded-xl bg-gray-800 border border-gray-700 shadow-xl relative"
              >
                {/* Quote mark */}
                <div className="absolute -top-4 -left-2 text-6xl text-primary/20 font-serif">"</div>
                
                <p className="text-gray-300 mb-6 relative z-10">{testimonial.message}</p>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{testimonial.name}</p>
                    <p className="text-sm text-gray-400">{testimonial.location}</p>
                  </div>
                  
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg
                        key={i}
                        className={`h-5 w-5 ${i < testimonial.stars ? 'text-yellow-400' : 'text-gray-500'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </ResponsiveContainer>
      </section>
      
      {/* Trust Badges Section */}
      <section className="py-12 md:py-16 bg-gray-900 border-t border-gray-800">
        <ResponsiveContainer className="px-6 mx-auto max-w-7xl">
          <div className="text-center mb-10">
            <h3 className="text-xl md:text-2xl font-bold mb-2">Trusted & Secure</h3>
            <p className="text-gray-400">Your safety and privacy are our top priorities</p>
          </div>
          
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex flex-wrap justify-center items-center gap-8 md:gap-12"
          >
            <div className="flex flex-col items-center">
              <div className="h-16 w-16 bg-gray-800 rounded-full flex items-center justify-center mb-2">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <span className="text-sm text-gray-400">256-bit SSL</span>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="h-16 w-16 bg-gray-800 rounded-full flex items-center justify-center mb-2">
                <svg
                  className="h-10 w-10"
                  viewBox="0 0 40 40"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M20 40C31.0457 40 40 31.0457 40 20C40 8.9543 31.0457 0 20 0C8.9543 0 0 8.9543 0 20C0 31.0457 8.9543 40 20 40Z"
                    fill="#6772E5"
                  />
                  <path
                    d="M20.5 15.5C19.1802 15.5 17.9692 16.0576 17.0503 17.0503C16.0576 18.0692 15.5 19.2802 15.5 20.6C15.5 23.4901 17.8262 25.7 20.5 25.7C22.2378 25.7 23.7918 24.7099 24.59 23.2599M20.5 15.5C22.7091 15.5 24.5 17.2909 24.5 19.5C24.5 21.7091 22.7091 23.5 20.5 23.5C18.2909 23.5 16.5 21.7091 16.5 19.5C16.5 17.2909 18.2909 15.5 20.5 15.5Z"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="text-sm text-gray-400">Stripe Secure</span>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="h-16 w-16 bg-gray-800 rounded-full flex items-center justify-center mb-2">
                <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 3V7M12 7L9 5M12 7L15 5" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M7 14V10C7 8.89543 7.89543 8 9 8H15C16.1046 8 17 8.89543 17 10V14" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M5 14H19V18C19 19.1046 18.1046 20 17 20H7C5.89543 20 5 19.1046 5 18V14Z" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M9 14V15M12 14V15M15 14V15" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-sm text-gray-400">AI Moderated</span>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="h-16 w-16 bg-gray-800 rounded-full flex items-center justify-center mb-2">
                <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M11.9999 2C16.4182 2 19.9999 5.58172 19.9999 10C19.9999 14.4183 16.4182 18 11.9999 18C7.58169 18 3.99997 14.4183 3.99997 10C3.99997 5.58172 7.58169 2 11.9999 2Z"
                    stroke="#0284c7"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M3.99997 10H19.9999"
                    stroke="#0284c7"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M11.9999 2C14.2091 2 15.9999 5.58172 15.9999 10C15.9999 14.4183 14.2091 18 11.9999 18C9.79083 18 7.99997 14.4183 7.99997 10C7.99997 5.58172 9.79083 2 11.9999 2Z"
                    stroke="#0284c7"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M11.9999 2V18"
                    stroke="#0284c7"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="text-sm text-gray-400">Global Service</span>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="h-16 w-16 bg-gray-800 rounded-full flex items-center justify-center mb-2">
                <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
                    stroke="#06b6d4"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M18.7273 14.7273C18.6063 15.0754 18.6063 15.4509 18.7273 15.7991C18.8484 16.1472 19.0831 16.4364 19.3914 16.6245L19.4723 16.6245C19.7186 16.7691 19.9205 16.9695 20.0629 17.2073C20.2053 17.4451 20.2837 17.7125 20.2919 17.9873C20.3001 18.262 20.2377 18.5341 20.1099 18.7799C19.9821 19.0257 19.7927 19.2376 19.5559 19.3955C19.3191 19.5534 19.0438 19.6526 18.7605 19.6841C18.4772 19.7156 18.1901 19.678 17.927 19.5744C17.6639 19.4708 17.4324 19.304 17.2519 19.0886C17.0713 18.8731 16.9468 18.6155 16.8886 18.3409L16.8886 18.3409C16.813 17.9937 16.6299 17.6836 16.3667 17.4514C16.1035 17.2193 15.7741 17.0778 15.4259 17.0452C15.0777 17.0126 14.7277 17.0902 14.4298 17.2661C14.1318 17.442 13.9032 17.7073 13.7773 18.0273L13.7773 18.0273C13.6381 18.2802 13.439 18.494 13.1977 18.6476C12.9563 18.8013 12.6805 18.8893 12.3962 18.9033C12.1119 18.9173 11.8284 18.857 11.5731 18.7281C11.3178 18.5992 11.0988 18.4056 10.9355 18.1664C10.7721 17.9273 10.6699 17.6509 10.6391 17.3628C10.6082 17.0746 10.6495 16.7831 10.7593 16.5139C10.869 16.2447 11.044 16.0067 11.2687 15.8196C11.4935 15.6324 11.7611 15.502 12.0455 15.44L12.0455 15.44C12.3937 15.3615 12.7039 15.1785 12.936 14.9153C13.1682 14.6521 13.3097 14.3227 13.3423 13.9745C13.3749 13.6263 13.2972 13.2763 13.1214 12.9783C12.9455 12.6804 12.6801 12.4518 12.3602 12.3259L12.3602 12.3258C12.1072 12.1867 11.8935 11.9876 11.7398 11.7462C11.5862 11.5048 11.4982 11.2291 11.4842 10.9448C11.4702 10.6605 11.5304 10.377 11.6594 10.1217C11.7883 9.86633 11.9819 9.64735 12.221 9.48401C12.4602 9.32067 12.7366 9.21839 13.0247 9.18756C13.3129 9.15673 13.6043 9.19804 13.8736 9.30777C14.1428 9.4175 14.3808 9.59258 14.5679 9.81729C14.755 10.0421 14.8854 10.3097 14.9475 10.5941L14.9475 10.5941C15.026 10.9422 15.209 11.2524 15.4722 11.4846C15.7354 11.7167 16.0648 11.8583 16.413 11.8909C16.7612 11.9234 17.1112 11.8458 17.4091 11.6699C17.7071 11.494 17.9356 11.2287 18.0616 10.9087L18.0616 10.9086C18.2007 10.6557 18.3998 10.4419 18.6412 10.2883C18.8826 10.1346 19.1584 10.0467 19.4427 10.0327C19.727 10.0187 20.0104 10.0789 20.2657 10.2079C20.521 10.3368 20.74 10.5304 20.9033 10.7695C21.0667 11.0087 21.1689 11.285 21.1998 11.5732C21.2306 11.8614 21.1893 12.1528 21.0796 12.422C20.9698 12.6913 20.7948 12.9293 20.5701 13.1164C20.3453 13.3035 20.0777 13.434 19.7933 13.496L19.7933 13.496C19.4451 13.5745 19.1349 13.7575 18.9028 14.0207C18.6706 14.2839 18.5291 14.6133 18.4965 14.9615C18.4965 14.9615 18.4965 14.9615 18.4965 14.9615L18.7273 14.7273ZM18.7273 14.7273L18.4965 14.9615C18.4965 14.9615 18.4965 14.9615 18.4965 14.9615L18.7273 14.7273Z"
                    stroke="#06b6d4"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M6 10.7273C6.12097 10.3791 6.12097 10.0037 6 9.65553C5.87903 9.30736 5.64435 9.0182 5.33609 8.83008L5.25518 8.83008C5.00891 8.68551 4.80702 8.48507 4.66461 8.24728C4.52219 8.00949 4.44387 7.74213 4.43561 7.46736C4.42735 7.19259 4.48978 6.92052 4.61758 6.67474C4.74538 6.42896 4.93477 6.21703 5.17158 6.05912C5.40839 5.90121 5.68364 5.80203 5.96695 5.77051C6.25026 5.739 6.53737 5.77663 6.80044 5.88022C7.06351 5.98381 7.29503 6.15062 7.47559 6.36608C7.65615 6.58154 7.78066 6.83915 7.83886 7.11373L7.83886 7.11373C7.91446 7.46094 8.09754 7.77101 8.36073 8.00317C8.62392 8.23534 8.95333 8.37682 9.30154 8.40944C9.64974 8.44205 9.99974 8.36442 10.2977 8.18853C10.5956 8.01264 10.8242 7.74727 10.9502 7.42727L10.9502 7.42727C11.0894 7.17436 11.2884 6.96061 11.5298 6.80696C11.7712 6.65332 12.047 6.56529 12.3313 6.55127C12.6156 6.53725 12.899 6.59756 13.1544 6.72646C13.4097 6.85536 13.6287 7.04898 13.792 7.28815C13.9554 7.52732 14.0576 7.80367 14.0884 8.09185C14.1193 8.38003 14.078 8.67155 13.9682 8.94076C13.8585 9.20997 13.6835 9.44796 13.4587 9.63512C13.234 9.8223 12.9664 9.95271 12.682 10.0146L12.682 10.0146C12.3338 10.0932 12.0236 10.2762 11.7915 10.5394C11.5593 10.8026 11.4178 11.132 11.3852 11.4802C11.3526 11.8284 11.4302 12.1784 11.6061 12.4763C11.782 12.7743 12.0474 13.0028 12.3673 13.1288L12.3673 13.1288C12.6203 13.2679 12.834 13.467 12.9877 13.7084C13.1413 13.9498 13.2293 14.2255 13.2433 14.5098C13.2573 14.7941 13.1971 15.0776 13.0681 15.3329C12.9392 15.5882 12.7456 15.8071 12.5064 15.9705C12.2673 16.1338 11.9909 16.2361 11.7028 16.267C11.4146 16.2978 11.1232 16.2565 10.8539 16.1468C10.5847 16.0371 10.3467 15.862 10.1596 15.6373C9.97241 15.4125 9.842 15.1449 9.77996 14.8605L9.77996 14.8605C9.70154 14.5123 9.51847 14.2022 9.25528 13.97C8.99209 13.7379 8.66267 13.5964 8.31447 13.5638C7.96626 13.5312 7.61627 13.6088 7.31833 13.7847C7.02039 13.9606 6.79179 14.2259 6.66585 14.5459L6.66585 14.546C6.5267 14.7989 6.32762 14.9926 6.08622 15.1463C5.84481 15.2999 5.56905 15.3879 5.28475 15.4019C5.00044 15.416 4.71702 15.3556 4.46165 15.2267C4.20628 15.0978 3.98729 14.9042 3.82394 14.6651C3.6606 14.4259 3.55831 14.1496 3.52749 13.8614C3.49666 13.5732 3.53797 13.2818 3.6477 13.0125C3.75742 12.7432 3.93251 12.5053 4.15722 12.3182C4.38193 12.131 4.64952 12.0006 4.93388 11.9385L4.93388 11.9385C5.28205 11.86 5.59236 11.677 5.82453 11.4138C6.0567 11.1506 6.19818 10.8212 6.2308 10.473C6.2308 10.473 6.2308 10.473 6.2308 10.473L6 10.7273ZM6 10.7273L6.2308 10.473C6.2308 10.473 6.2308 10.473 6.2308 10.473L6 10.7273Z"
                    stroke="#06b6d4"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="text-sm text-gray-400">GDPR Compliant</span>
            </div>
          </motion.div>
        </ResponsiveContainer>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 md:py-28 bg-gray-900 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-gray-900 opacity-70 z-0"></div>
        
        <ResponsiveContainer className="relative z-10 px-6 mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="p-8 md:p-10 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 shadow-xl"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to start chatting?</h2>
            <p className="text-lg text-gray-300 mb-8 max-w-xl mx-auto">
              Connect with interesting people from around the world in just a few seconds.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                onClick={handleGetStarted}
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-white font-medium rounded-full px-8 py-3 text-lg shadow-lg hover:shadow-primary/20 transition-all w-full sm:w-auto"
              >
                Start Anonymous Chat
              </Button>
              
              <Button 
                variant="outline"
                size="lg" 
                className="border-gray-600 text-gray-300 font-medium rounded-full px-8 py-3 text-lg hover:bg-gray-800 transition-all w-full sm:w-auto"
                onClick={() => navigate('/about')}
              >
                Learn More
              </Button>
            </div>
            
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6">
              <div className="flex items-center">
                <Check className="h-5 w-5 text-primary mr-2" />
                <span className="text-gray-300">No registration</span>
              </div>
              <div className="flex items-center">
                <Check className="h-5 w-5 text-primary mr-2" />
                <span className="text-gray-300">Free to use</span>
              </div>
              <div className="flex items-center">
                <Check className="h-5 w-5 text-primary mr-2" />
                <span className="text-gray-300">Safe & moderated</span>
              </div>
            </div>
          </motion.div>
        </ResponsiveContainer>
      </section>
      
      {/* Footer */}
      <footer className="py-12 bg-gray-900 border-t border-gray-800">
        <ResponsiveContainer className="px-6 mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div className="md:col-span-2">
              <h3 className="text-xl font-bold mb-4">StrangerWave</h3>
              <p className="text-gray-400 mb-4">
                The leading platform for anonymous chat with strangers. Connect with people from all over the world instantly.
              </p>
              <p className="text-sm text-gray-500">
                © {new Date().getFullYear()} StrangerWave. All rights reserved.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-medium mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-primary transition-colors">Home</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">About</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Premium</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-medium mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Cookie Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Acceptable Use</a></li>
              </ul>
            </div>
          </div>
        </ResponsiveContainer>
      </footer>
    </div>
  );
}
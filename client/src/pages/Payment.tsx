import { useState, useEffect } from "react";
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useAuth } from "@/lib/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Shield, Lock, CreditCard, AlertTriangle, CheckCircle, RefreshCw, ArrowLeft } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import PayPalButton from "@/components/PayPalButton";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  console.warn('Missing Stripe public key. Payment features will be limited.');
}

const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
  : null;

const PaymentForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [, navigate] = useLocation();
  const isMobile = useIsMobile();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Payment Successful",
          description: "Your access has been restored. You can now continue chatting.",
        });
        
        // Navigate back to the chat
        setTimeout(() => {
          navigate('/chat');
        }, 2000);
      }
    } catch (error: any) {
      toast({
        title: "Payment Error",
        description: error.message || "An error occurred during payment processing",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Security badge at the top */}
      <div className="flex items-center justify-center mb-4 bg-primary/10 p-2 rounded-lg border border-primary/20">
        <Lock className="h-4 w-4 mr-2 text-primary" />
        <span className="text-sm text-primary font-medium">Secure Payment Processing</span>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative">
          <PaymentElement />
          
          {/* Secure payment badge */}
          <div className="absolute -top-3 right-0 bg-gray-900 px-2 py-0.5 rounded text-xs font-medium border border-gray-700 flex items-center space-x-1">
            <Lock className="h-3 w-3 text-primary" />
            <span>256-bit SSL</span>
          </div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Button 
            type="submit" 
            disabled={!stripe || isProcessing} 
            className="w-full h-14 text-lg font-medium bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 shadow-lg shadow-primary/20 border-2 border-blue-500/30 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {isProcessing ? (
              <span className="flex items-center justify-center">
                <RefreshCw className="animate-spin mr-2 h-5 w-5" />
                Processing Payment...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <CreditCard className="mr-2 h-6 w-6" />
                Pay $10.99 & Restore Access
              </span>
            )}
          </Button>
        </motion.div>
      </form>
      
      {/* Trust badges */}
      <div className="pt-4 border-t border-gray-700">
        <div className="flex flex-wrap justify-center gap-4 mb-4">
          <div className="flex items-center text-xs text-gray-400">
            <Shield className="h-4 w-4 mr-1 text-primary" />
            <span>Secure Payments</span>
          </div>
          <div className="flex items-center text-xs text-gray-400">
            <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
            <span>Instant Restoration</span>
          </div>
          <div className="flex items-center text-xs text-gray-400">
            <Lock className="h-4 w-4 mr-1 text-blue-500" />
            <span>GDPR Compliant</span>
          </div>
        </div>
        
        <div className="flex justify-center gap-5 py-2">
          {/* VISA SVG */}
          <svg className="h-8 w-auto opacity-80" viewBox="0 0 780 500" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M293.2 348.73L318.72 149.58H362.12L336.6 348.73H293.2Z" fill="#3C58BF"/>
            <path d="M293.2 348.73L325.66 149.58H362.12L336.6 348.73H293.2Z" fill="#293688"/>
            <path d="M459.56 152.12C450.42 148.64 435.91 144.73 418.06 144.73C367.47 144.73 332.01 170.7 331.79 209.04C331.58 237.22 356.86 252.79 375.9 262.16C395.36 271.74 402.15 277.75 402.15 286.02C401.94 298.49 386.79 304.29 372.73 304.29C352.84 304.29 341.97 301.03 324.54 292.93L317.54 289.89L310.11 327.59C320.91 332.94 341.32 337.5 362.58 337.72C416.52 337.72 451.34 312.18 451.77 271.31C451.98 248.88 438.44 231.45 408.81 217.49C390.52 208.35 379.65 202.11 379.65 192.7C379.87 184.02 390.3 175.18 413.5 175.18C429.9 175.18 441.63 178.44 450.77 182.57L456.08 184.92L463.73 148.42L459.56 152.12Z" fill="#3C58BF"/>
            <path d="M459.56 152.12C450.42 148.64 435.91 144.73 418.06 144.73C367.47 144.73 350.06 170.7 349.84 209.04C349.62 237.22 356.86 252.79 375.9 262.16C395.36 271.74 402.15 277.75 402.15 286.02C401.94 298.49 386.79 304.29 372.73 304.29C352.84 304.29 341.97 301.03 324.54 292.93L317.54 289.89L310.11 327.59C320.91 332.94 341.32 337.5 362.58 337.72C416.52 337.72 451.34 312.18 451.77 271.31C451.98 248.88 438.44 231.45 408.81 217.49C390.52 208.35 379.65 202.11 379.65 192.7C379.87 184.02 390.3 175.18 413.5 175.18C429.9 175.18 441.63 178.44 450.77 182.57L456.08 184.92L463.73 148.42L459.56 152.12Z" fill="#293688"/>
            <path d="M508.7 148.85C499.13 148.85 492.34 149.28 487.1 156.68L423.73 348.52H477.68L486.67 322.02H540.18L545.53 348.52H593.52L558.05 148.85H508.7ZM500.56 291.03C504.26 280.91 520.5 235.31 520.5 235.31C520.29 235.74 524.42 223.91 526.77 217.05L530.29 233.82C530.29 233.82 540.61 281.56 542.31 291.03H500.56Z" fill="#3C58BF"/>
            <path d="M511.1 148.85C501.53 148.85 494.74 149.28 489.5 156.68L423.73 348.52H477.68L486.67 322.02H540.18L545.53 348.52H593.52L558.05 148.85H511.1ZM500.56 291.03C505.12 278.99 520.5 235.31 520.5 235.31C520.5 235.31 524.42 223.91 526.77 217.05L530.29 233.82C530.29 233.82 540.61 281.56 542.31 291.03H500.56Z" fill="#293688"/>
            <path d="M231.2 148.64L180.29 282.11L175.15 258.46C165.56 227.17 138.24 193.35 107.38 176.71L154.39 348.3H208.77L283.18 148.64H231.2Z" fill="#3C58BF"/>
            <path d="M231.2 148.64L180.29 282.11L175.15 258.46C165.56 227.17 138.24 193.35 107.38 176.71L154.39 348.3H208.77L283.18 148.64H231.2Z" fill="#293688"/>
            <path d="M107.6 149.15H19.9C15.95 149.36 10.17 151.07 7.61 158.6L0.61 199.55C76.74 222.21 128.08 264.94 148.18 316.5L127 176.28C124.87 159.06 117.42 149.58 107.6 149.15Z" fill="#FFBC00"/>
            <path d="M0.61 199.77C76.74 222.43 128.08 265.16 148.18 316.72L127 176.5C124.87 159.28 117.42 149.8 107.6 149.37H87.93C84.24 149.58 87.5 150.64 87.5 159.06V162.54C87.5 172.16 97.08 198.78 107.6 212.09C118.34 187.77 137.59 150.85 169.16 150.85H156.1C142.78 150.85 134.11 153.68 129.51 166.15L89.43 285.16C88.58 286.44 90.07 282.97 93.12 277.75C67.65 236.79 19.9 201.25 0.61 199.77Z" fill="#F7981D"/>
            <path d="M87.5 162.54V159.06C87.5 149.36 85.3 149.36 82.04 149.36H0.61C0.61 149.36 5.85 183.61 39.88 211.66C72.35 238.28 93.12 258.02 93.12 277.75L107.6 212.09C97.08 198.56 87.5 172.16 87.5 162.54Z" fill="#ED7C00"/>
            <path d="M467.63 348.09L427.34 309.07C423.21 313.41 413.84 321.59 402.11 325.5L410.89 348.09H467.63Z" fill="#051244"/>
            <path d="M539.97 291.03L526.55 272.52L520.49 291.03H539.97Z" fill="#051244"/>
            <path d="M400.62 286.02C400.41 298.49 392.84 304.29 378.79 304.29C358.89 304.29 348.03 301.03 330.59 292.93L323.59 289.89L316.16 327.59C326.97 332.94 341.32 337.5 362.58 337.72C394.41 337.5 424.47 328.79 441.05 307.55L400.62 286.02Z" fill="#051244"/>
            <path d="M154.17 348.3H208.34L230.13 282.97L215.84 229.95C211.71 265.59 188.73 301.03 154.17 348.3Z" fill="#051244"/>
          </svg>
          
          {/* Mastercard SVG */}
          <svg className="h-8 w-auto opacity-80" viewBox="0 0 141.732 141.732" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g>
              <path fill="#ffffff" d="M68.792,70.866c0,16.387-13.289,29.675-29.676,29.675S9.441,87.253,9.441,70.866c0-16.388,13.289-29.676,29.675-29.676S68.792,54.478,68.792,70.866L68.792,70.866z" />
              <path fill="#FF0000" d="M39.116,41.19c-16.386,0-29.675,13.289-29.675,29.676c0,16.387,13.289,29.675,29.675,29.675c16.387,0,29.676-13.288,29.676-29.675C68.792,54.479,55.503,41.19,39.116,41.19z M14.358,70.866c0-13.677,11.082-24.76,24.758-24.76c5.839,0,11.212,2.029,15.462,5.411c-4.248,3.382-9.623,5.412-15.462,5.412c-13.676,0-24.758,11.082-24.758,24.759c0,5.839,2.03,11.212,5.412,15.461C16.388,92.899,14.358,87.525,14.358,70.866L14.358,70.866z" />
              <path fill="#F79F1A" d="M102.616,41.19c-16.387,0-29.676,13.289-29.676,29.676c0,16.387,13.289,29.675,29.676,29.675c16.386,0,29.675-13.288,29.675-29.675C132.291,54.479,119.002,41.19,102.616,41.19z M77.858,70.866c0-13.677,11.082-24.76,24.758-24.76c5.839,0,11.212,2.029,15.462,5.411c-4.248,3.382-9.623,5.412-15.462,5.412c-13.676,0-24.758,11.082-24.758,24.759c0,5.839,2.03,11.212,5.412,15.461C79.887,92.899,77.858,87.525,77.858,70.866L77.858,70.866z" />
            </g>
          </svg>
          
          {/* PayPal SVG */}
          <svg className="h-8 w-auto opacity-80" viewBox="0 0 124 33" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M46.211 6.749H41.233C40.991 6.749 40.783 6.907 40.736 7.13L38.535 21.358C38.5 21.524 38.63 21.682 38.809 21.682H41.172C41.414 21.682 41.622 21.524 41.67 21.301L42.263 17.705C42.31 17.483 42.519 17.325 42.76 17.325H44.57C47.558 17.325 49.313 15.795 49.852 13.016C50.09 11.961 49.936 11.11 49.46 10.517C48.936 9.864 47.802 6.749 46.211 6.749ZM46.848 13.159C46.538 14.818 45.273 14.818 44.048 14.818H43.303L43.886 11.25C43.915 11.095 44.048 10.988 44.207 10.988H44.602C45.435 10.988 46.214 10.988 46.619 11.465C46.863 11.734 46.927 12.366 46.848 13.159Z" fill="#253B80"/>
            <path d="M73.481 13.089H71.105C70.947 13.089 70.813 13.195 70.784 13.35L70.692 13.963L70.541 13.755C70.066 13.099 69.004 12.873 67.941 12.873C65.338 12.873 63.11 14.89 62.714 17.705C62.505 19.099 62.846 20.444 63.663 21.37C64.406 22.221 65.489 22.58 66.773 22.58C68.833 22.58 70.043 21.22 70.043 21.22L69.95 21.832C69.914 21.997 70.043 22.155 70.222 22.155H72.341C72.582 22.155 72.791 21.997 72.838 21.775L74.199 13.413C74.235 13.247 74.105 13.089 73.927 13.089H73.481ZM70.57 17.762C70.361 19.085 69.299 19.969 67.941 19.969C67.255 19.969 66.707 19.774 66.363 19.375C66.018 18.976 65.886 18.406 65.991 17.762C66.185 16.452 67.268 15.541 68.598 15.541C69.269 15.541 69.82 15.737 70.177 16.15C70.536 16.562 70.683 17.145 70.57 17.762Z" fill="#253B80"/>
            <path d="M94.884 13.089H92.495C92.3 13.089 92.118 13.175 92.01 13.33L87.891 19.356L86.209 13.562C86.14 13.31 85.903 13.089 85.629 13.089H83.297C83.105 13.089 82.961 13.301 83.043 13.474L86.13 21.61L83.212 25.673C83.069 25.873 83.213 26.148 83.461 26.148H85.849C86.041 26.148 86.22 26.066 86.327 25.915L94.997 13.563C95.143 13.364 94.999 13.089 94.75 13.089H94.884Z" fill="#253B80"/>
            <path d="M121.741 6.749H116.763C116.521 6.749 116.313 6.907 116.266 7.13L114.065 21.358C114.03 21.524 114.159 21.682 114.339 21.682H116.763C117.004 21.682 117.213 21.524 117.26 21.301L118.69 11.47C118.736 11.247 118.945 11.089 119.186 11.089H121.741C121.921 11.089 122.05 10.932 122.014 10.765C121.929 10.232 121.865 9.696 121.741 6.749Z" fill="#179BD7"/>
            <path d="M7.863 29.448L8.372 26.297L7.093 26.268H1.202L4.791 1.289C4.794 1.26 4.808 1.234 4.83 1.213C4.852 1.193 4.881 1.182 4.91 1.182H15.359C18.588 1.182 20.742 1.937 21.774 3.429C22.248 4.115 22.518 4.863 22.584 5.712C22.653 6.599 22.515 7.622 22.173 8.817L22.158 8.878V9.598L22.732 9.94C23.213 10.207 23.599 10.53 23.883 10.904C24.318 11.476 24.591 12.193 24.692 13.029C24.797 13.893 24.73 14.903 24.488 16.026C24.212 17.338 23.766 18.465 23.166 19.371C22.612 20.212 21.897 20.908 21.044 21.431C20.224 21.936 19.258 22.306 18.177 22.526C17.131 22.738 15.934 22.848 14.624 22.848H13.937C13.299 22.848 12.679 23.056 12.175 23.435C11.673 23.816 11.312 24.344 11.149 24.942L11.089 25.241L10.21 30.818L10.164 31.03C10.16 31.059 10.146 31.084 10.124 31.104C10.102 31.125 10.073 31.136 10.044 31.136H7.863V29.448Z" fill="#253B80"/>
            <path d="M23.048 8.94C23.001 9.249 22.943 9.567 22.872 9.895C21.543 15.968 17.786 18.276 13.003 18.276H10.235C9.511 18.276 8.915 18.773 8.812 19.461L7.474 28.099L7.049 30.826C7.006 31.118 7.235 31.377 7.543 31.377H10.044C10.674 31.377 11.204 30.944 11.294 30.34L11.348 30.064L11.794 27.21L11.861 26.849C11.951 26.244 12.481 25.811 13.111 25.811H13.938C18.104 25.811 21.364 23.768 22.53 18.456C23.01 16.269 22.81 14.426 21.698 13.128C21.331 12.705 20.876 12.359 20.33 12.08C21.082 11.166 21.614 10.07 21.897 8.771C21.976 8.409 22.034 8.071 22.075 7.747C22.557 8.255 22.872 8.879 23.048 8.94Z" fill="#179BD7"/>
            <path d="M21.754 8.611C21.712 8.935 21.655 9.277 21.577 9.639C20.293 15.963 16.535 18.277 11.752 18.277H8.986C8.262 18.277 7.665 18.774 7.562 19.458L6.234 27.863L5.809 30.59C5.766 30.882 5.995 31.14 6.303 31.14H8.803C9.434 31.14 9.963 30.707 10.053 30.103L10.108 29.826L10.553 26.973L10.621 26.611C10.71 26.006 11.24 25.573 11.87 25.573H12.697C16.864 25.573 20.123 23.531 21.29 18.219C21.769 16.032 21.569 14.188 20.457 12.89C20.09 12.46 19.635 12.11 19.089 11.831C19.381 11.447 19.621 11.008 19.816 10.512C20.198 9.457 20.294 8.239 20.048 6.862C20.502 7.13 20.889 7.454 21.196 7.846C21.717 8.506 21.955 9.462 21.754 8.611Z" fill="#222D65"/>
            <path d="M20.048 6.862C19.916 6.427 19.732 6.028 19.496 5.664C19.264 5.305 18.978 4.988 18.65 4.722C17.813 3.979 16.601 3.622 15.023 3.622H7.272C6.55 3.622 5.932 4.098 5.819 4.765L3.046 22.158C2.996 22.497 3.269 22.802 3.623 22.802H7.562L8.812 14.164V14.414C8.926 13.747 9.543 13.271 10.265 13.271H12.246C16.891 13.271 20.555 11.025 21.583 5.778C21.609 5.663 21.632 5.553 21.653 5.444C21.433 5.918 21.132 6.429 20.048 6.862Z" fill="#253B80"/>
          </svg>
          
          {/* Apple Pay SVG */}
          <svg className="h-8 w-auto opacity-80" viewBox="0 0 165.8 105.9" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M150.7,0H15.1C6.7,0,0,6.7,0,15.1v75.8c0,8.3,6.7,15.1,15.1,15.1h135.7c8.3,0,15.1-6.7,15.1-15.1V15.1C165.8,6.7,159,0,150.7,0z" fill="#000"/>
            <path d="M150.7,3.8c6.2,0,11.3,5.1,11.3,11.3v75.8c0,6.2-5.1,11.3-11.3,11.3H15.1c-6.2,0-11.3-5.1-11.3-11.3V15.1c0-6.2,5.1-11.3,11.3-11.3H150.7" fill="#fff"/>
            <g>
              <path d="M46.1,31.8c2.2-2.7,3.7-6.3,3.2-10c-3.1,0.2-7,2.1-9.2,4.7c-2,2.3-3.8,6-3.3,9.5C40.1,36.3,43.8,34.5,46.1,31.8" fill="#000"/>
              <path d="M49.2,37.1c-5-0.3-9.3,2.9-11.7,2.9c-2.4,0-6.1-2.8-10-2.7c-5.2,0.1-9.9,3-12.6,7.6c-5.4,9.2-1.4,22.9,3.8,30.4c2.5,3.7,5.6,7.7,9.6,7.6c3.8-0.1,5.2-2.5,9.8-2.5c4.6,0,5.9,2.5,9.9,2.4c4.1-0.1,6.7-3.7,9.2-7.4c2.9-4.2,4-8.3,4.1-8.5c-0.1-0.1-7.8-3-7.9-11.9c-0.1-7.5,6.1-11,6.4-11.2C56.3,38.2,50.7,37.2,49.2,37.1" fill="#000"/>
            </g>
            <g>
              <path d="M79.1,31.5h6.5l7.5,20h-5l-1.8-5.2h-8.1l-1.8,5.2h-4.9L79.1,31.5z M85,42.8l-2.1-6.5h-0.1l-2.2,6.5H85z" fill="#000"/>
              <path d="M94.3,39.8c0-6.8,5-8.6,8.3-8.6c1.3,0,2.5,0.2,3.3,0.5v4.2c-0.7-0.4-1.5-0.6-2.5-0.6c-1.9,0-4.2,1-4.2,4.3c0,3.2,2.3,4.4,4.2,4.4c1,0,1.8-0.2,2.5-0.6v4.2c-0.9,0.3-2,0.5-3.3,0.5C99.2,48.1,94.3,46.5,94.3,39.8" fill="#000"/>
              <path d="M107.5,39.8c0-5.7,4.2-8.6,8.4-8.6c4.2,0,8.4,2.9,8.4,8.6c0,5.7-4.2,8.3-8.4,8.3C111.7,48.1,107.5,45.5,107.5,39.8 M119.4,39.8c0-2.6-1.3-4.6-3.5-4.6c-2.2,0-3.5,2-3.5,4.6c0,2.5,1.3,4.3,3.5,4.3C118.1,44.1,119.4,42.3,119.4,39.8" fill="#000"/>
              <path d="M126,31.5h4.9v3.2h0.1c0.9-2,2.6-3.5,5.2-3.5c0.4,0,0.8,0.1,1.2,0.1v4.9c-0.5-0.2-1.3-0.3-2-0.3c-2.7,0-4.3,2-4.3,4.7v10.1H126V31.5z" fill="#000"/>
              <path d="M137.6,31.5h4.9v1.8h0.1c1.3-1.6,3.2-2.2,5-2.2c4.7,0,7.3,3.7,7.3,8.5c0,4.4-2.6,8.4-7.2,8.4c-2.1,0-3.8-0.7-4.9-2h-0.1v7.7h-5.1V31.5z M149.8,39.6c0-2.5-1.3-4.5-3.7-4.5c-2.5,0-3.8,2-3.8,4.5c0,2.5,1.4,4.5,3.8,4.5C148.5,44.1,149.8,42.1,149.8,39.6" fill="#000"/>
              <rect x="79.2" y="54.7" width="4.9" height="21.9" fill="#000"/>
              <path d="M86.4,54.7h5.1v8.3h0.1c1.2-1.5,3-2.2,4.8-2.2c4.7,0,5.8,2.7,5.8,6.6v9.2h-5.1v-8.4c0-2.4-0.7-3.6-2.5-3.6c-2.1,0-3.2,1.2-3.2,4.2v7.7h-5.1V54.7z" fill="#000"/>
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default function Payment() {
  const { user, isBanned } = useAuth();
  const [clientSecret, setClientSecret] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const isMobile = useIsMobile();

  useEffect(() => {
    // If user is not banned, redirect to home
    if (user && !isBanned) {
      navigate('/chat');
      return;
    }
    
    // Skip payment flow if Stripe is not configured
    if (!stripePromise) {
      setIsLoading(false);
      return;
    }

    // Create PaymentIntent when component mounts
    const createPaymentIntent = async () => {
      try {
        if (!user) return;
        
        const response = await apiRequest(
          "POST", 
          "/api/create-payment-intent", 
          { userId: user.userId }
        );
        
        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (error) {
        console.error("Error creating payment intent:", error);
        toast({
          title: "Payment Setup Failed",
          description: "Could not initialize payment. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      createPaymentIntent();
    } else {
      setIsLoading(false);
    }
  }, [user, isBanned, navigate, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center"
        >
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mb-4" />
          <p className="text-gray-300">Preparing secure payment...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col bg-gray-900"
    >
      <header className="bg-gray-800 py-4 px-4 sm:px-6 shadow-lg border-b border-gray-700">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-white flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-yellow-500" />
              Account Restricted
            </h1>
            <Button 
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="text-gray-300 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              {!isMobile && "Back"}
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4 sm:p-6 flex flex-col items-center justify-center">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="max-w-md w-full bg-gray-800 border border-gray-700 shadow-xl">
            <CardHeader className="text-center space-y-3 pb-3">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
              <CardTitle className="text-2xl text-white">Account Restricted</CardTitle>
              <CardDescription className="text-gray-300">
                Due to violations of our community guidelines, your account has been restricted from using our chat service.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6 pt-3">
              <div className="bg-gray-900/50 p-5 rounded-lg mb-4 border border-gray-700 shadow-inner">
                <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-700">
                  <h3 className="font-medium text-lg text-white">Restore Access</h3>
                  <div className="px-2 py-1 bg-primary/10 rounded text-xs font-medium text-primary border border-primary/20 flex items-center">
                    <Lock className="h-3 w-3 mr-1" />
                    Secure
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="bg-gray-700/30 p-1.5 rounded-full mr-3 mt-0.5">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">One-time $10.99 payment</p>
                      <p className="text-gray-400 text-xs">No recurring charges</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-gray-700/30 p-1.5 rounded-full mr-3 mt-0.5">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">Instant access restoration</p>
                      <p className="text-gray-400 text-xs">Resume chatting immediately</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-gray-700/30 p-1.5 rounded-full mr-3 mt-0.5">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">Private & anonymous</p>
                      <p className="text-gray-400 text-xs">Your personal data remains protected</p>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    {(!stripePromise && !user) ? (
                      <div className="text-center p-5 bg-gray-900/80 rounded-lg border border-red-500/30">
                        <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                        <p className="text-red-400 font-medium mb-1">Payment services unavailable</p>
                        <p className="text-gray-400 text-sm">Please try again later or contact support</p>
                      </div>
                    ) : (
                      <Tabs defaultValue="card" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-4">
                          <TabsTrigger value="card" className="flex items-center justify-center">
                            <CreditCard className="h-4 w-4 mr-2" />
                            Credit Card
                          </TabsTrigger>
                          <TabsTrigger value="paypal" className="flex items-center justify-center">
                            <img src="https://cdn.pixabay.com/photo/2015/05/26/09/37/paypal-784404_960_720.png" alt="PayPal" className="h-4 mr-2" />
                            PayPal
                          </TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="card" className="mt-0">
                          {clientSecret ? (
                            <Elements stripe={stripePromise} options={{ clientSecret }}>
                              <PaymentForm />
                            </Elements>
                          ) : (
                            <div className="flex justify-center p-4">
                              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                            </div>
                          )}
                        </TabsContent>
                        
                        <TabsContent value="paypal" className="mt-0">
                          {user ? (
                            <div className="space-y-6">
                              <div className="flex items-center justify-center mb-4 bg-blue-500/10 p-2 rounded-lg border border-blue-500/20">
                                <Lock className="h-4 w-4 mr-2 text-blue-500" />
                                <span className="text-sm text-blue-500 font-medium">Secure PayPal Processing</span>
                              </div>
                              
                              <PayPalButton 
                                userId={user.userId}
                                productType="unban"
                                onSuccess={() => {
                                  // Navigate back to the chat after successful payment
                                  setTimeout(() => {
                                    navigate('/chat');
                                  }, 2000);
                                }}
                                onCancel={() => {
                                  toast({
                                    title: "Payment Cancelled",
                                    description: "You have cancelled the payment process.",
                                  });
                                }}
                              />
                              
                              <div className="flex flex-wrap justify-center gap-4 mt-4 pt-4 border-t border-gray-700">
                                <div className="flex items-center text-xs text-gray-400">
                                  <Shield className="h-4 w-4 mr-1 text-primary" />
                                  <span>Buyer Protection</span>
                                </div>
                                <div className="flex items-center text-xs text-gray-400">
                                  <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                                  <span>No PayPal Account Required</span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex justify-center p-4">
                              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                            </div>
                          )}
                        </TabsContent>
                      </Tabs>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="text-center text-gray-400 text-sm space-y-2">
                <p>Need help? <a href="#" className="text-primary hover:underline">Contact support</a></p>
                <p>By proceeding, you agree to our <a href="#" className="text-primary hover:underline">Terms of Service</a></p>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col pt-0">
              <div className="w-full py-3 border-t border-gray-700 mt-2">
                <div className="flex justify-center space-x-4 items-center">
                  <div className="flex items-center text-xs text-gray-400">
                    <Shield className="h-4 w-4 mr-1 text-primary" />
                    <span>Secure</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-400">
                    <Lock className="h-4 w-4 mr-1 text-blue-400" />
                    <span>Encrypted</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-400">
                    <CreditCard className="h-4 w-4 mr-1 text-green-400" />
                    <span>PCI Compliant</span>
                  </div>
                </div>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </main>

      <footer className="bg-gray-800 py-4 px-4 sm:px-6 border-t border-gray-700">
        <div className="container mx-auto max-w-7xl text-center text-gray-400 text-sm">
          <p>© {new Date().getFullYear()} StrangerWave - <a href="#" className="hover:text-primary">Terms</a> · <a href="#" className="hover:text-primary">Privacy</a> · <a href="#" className="hover:text-primary">Support</a></p>
        </div>
      </footer>
    </motion.div>
  );
}

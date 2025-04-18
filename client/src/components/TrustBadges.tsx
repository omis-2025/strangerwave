import React from 'react';

export function LockIcon() {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  );
}

export function ShieldIcon() {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );
}

export function PrivacyIcon() {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4a6.5 6.5 0 1 0-4-4Z"/>
      <circle cx="16.5" cy="7.5" r=".5" fill="currentColor"/>
    </svg>
  );
}

export function PaymentIcon() {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <rect width="20" height="14" x="2" y="5" rx="2"/>
      <line x1="2" x2="22" y1="10" y2="10"/>
    </svg>
  );
}

export function CheckIcon() {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5"/>
    </svg>
  );
}

// Create the Trust Badge component
interface TrustBadgeProps {
  icon: React.ReactNode;
  text: string;
  className?: string;
}

export function TrustBadge({ icon, text, className = "" }: TrustBadgeProps) {
  return (
    <div className={`flex items-center gap-2 bg-gray-900/90 border border-gray-800 backdrop-blur-sm rounded-lg px-3 py-2 ${className}`}>
      <span className="text-blue-500">{icon}</span>
      <span className="text-sm font-medium text-gray-300">{text}</span>
    </div>
  );
}

// Create a component for payment provider logos
export function PaymentProviderLogos() {
  return (
    <div className="flex items-center justify-center gap-3 mt-3">
      <div className="text-muted-foreground/80 flex items-center gap-1.5">
        <span className="text-xs">Powered by</span>
        <span className="font-semibold text-sm bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-indigo-600">Stripe</span>
      </div>
      <div className="text-muted-foreground/80 flex items-center gap-1.5">
        <span className="text-xs">and</span>
        <span className="font-semibold text-sm bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-blue-700">PayPal</span>
      </div>
    </div>
  );
}

// Create a Trust Badges group component
export function TrustBadgesGroup() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
      <TrustBadge 
        icon={<LockIcon />} 
        text="256-bit encryption" 
      />
      <TrustBadge 
        icon={<ShieldIcon />} 
        text="Secure payments" 
      />
      <TrustBadge 
        icon={<PrivacyIcon />} 
        text="Privacy protected" 
      />
      <TrustBadge 
        icon={<CheckIcon />} 
        text="30-day refunds" 
      />
    </div>
  );
}

// Create the testimonial block 
export function SecurityTestimonial() {
  return (
    <div className="bg-card/50 backdrop-blur-sm border rounded-xl p-4 relative">
      <div className="text-muted-foreground italic text-sm">
        "I've been using StrangerWave for months and trust it completely because my payment info is always secure."
      </div>
      <div className="flex items-center gap-2 mt-3">
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
          <span className="text-xs font-medium text-primary">JD</span>
        </div>
        <div>
          <div className="text-sm font-medium">John D.</div>
          <div className="text-xs text-muted-foreground">Premium user since 2024</div>
        </div>
      </div>
      <div className="absolute top-2 right-3 text-primary/30">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-10zm-14 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
        </svg>
      </div>
    </div>
  );
}
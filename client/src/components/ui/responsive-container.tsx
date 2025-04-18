import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  mobileClassName?: string;
  desktopClassName?: string;
  fixOverflow?: boolean;
}

/**
 * A responsive container that applies different styles based on screen size
 * with improved handling for mobile devices
 */
export function ResponsiveContainer({
  children,
  className = "",
  mobileClassName = "",
  desktopClassName = "",
  fixOverflow = true, // Default to fixing overflow issues
}: ResponsiveContainerProps) {
  const isMobile = useIsMobile();
  const [viewportHeight, setViewportHeight] = useState<number>(0);
  
  // Update viewport height on mount and resize
  useEffect(() => {
    const updateViewportHeight = () => {
      // Use visual viewport height for better mobile handling
      const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight;
      setViewportHeight(vh);
      
      // Fix for mobile browsers: set CSS variable to real viewport height
      document.documentElement.style.setProperty('--vh', `${vh * 0.01}px`);
    };
    
    updateViewportHeight();
    window.addEventListener('resize', updateViewportHeight);
    window.addEventListener('orientationchange', updateViewportHeight);
    
    // Some mobile browsers need a slight delay after orientation change
    window.addEventListener('orientationchange', () => {
      setTimeout(updateViewportHeight, 100);
    });
    
    return () => {
      window.removeEventListener('resize', updateViewportHeight);
      window.removeEventListener('orientationchange', updateViewportHeight);
    };
  }, []);
  
  return (
    <div
      className={cn(
        "w-full transition-all duration-200",
        fixOverflow && isMobile ? "max-h-[100vh] max-h-[calc(var(--vh,1vh)*100)]" : "",
        className,
        isMobile ? mobileClassName : desktopClassName
      )}
      style={fixOverflow && isMobile ? { 
        height: viewportHeight > 0 ? `${viewportHeight}px` : '100vh',
        overflowY: 'hidden'
      } : undefined}
    >
      {children}
    </div>
  );
}

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
  };
}

/**
 * A responsive grid that changes columns based on screen size
 */
export function ResponsiveGrid({
  children,
  className = "",
  columns = {
    mobile: 1,
    tablet: 2,
    desktop: 3,
  },
  gap = {
    mobile: '1rem',
    tablet: '1.5rem',
    desktop: '2rem',
  },
}: ResponsiveGridProps) {
  const isMobile = useIsMobile();
  
  // Determine current columns and gap
  const currentColumns = isMobile ? columns.mobile : 
                        window.innerWidth < 1024 ? columns.tablet : 
                        columns.desktop;
                        
  const currentGap = isMobile ? gap.mobile : 
                     window.innerWidth < 1024 ? gap.tablet : 
                     gap.desktop;
  
  return (
    <div
      className={cn("w-full grid", className)}
      style={{
        gridTemplateColumns: `repeat(${currentColumns}, 1fr)`,
        gap: currentGap,
      }}
    >
      {children}
    </div>
  );
}

interface FlexContainerProps {
  children: React.ReactNode;
  className?: string;
  direction?: {
    mobile?: "row" | "column";
    tablet?: "row" | "column";
    desktop?: "row" | "column";
  };
  gap?: string;
  align?: {
    mobile?: "start" | "center" | "end" | "stretch" | "baseline";
    tablet?: "start" | "center" | "end" | "stretch" | "baseline";
    desktop?: "start" | "center" | "end" | "stretch" | "baseline";
  };
  justify?: {
    mobile?: "start" | "center" | "end" | "between" | "around" | "evenly";
    tablet?: "start" | "center" | "end" | "between" | "around" | "evenly";
    desktop?: "start" | "center" | "end" | "between" | "around" | "evenly";
  };
  wrap?: boolean;
  fullHeight?: boolean;
}

/**
 * A responsive flex container that changes direction, alignment, and justification based on screen size
 * with special handling for mobile devices
 */
export function FlexContainer({
  children,
  className = "",
  direction = {
    mobile: "column",
    tablet: "row",
    desktop: "row",
  },
  align = {
    mobile: "center",
    tablet: "center",
    desktop: "center",
  },
  justify = {
    mobile: "center",
    tablet: "center",
    desktop: "center",
  },
  gap = "1rem",
  wrap = false,
  fullHeight = false,
}: FlexContainerProps) {
  const isMobile = useIsMobile();
  const [viewportHeight, setViewportHeight] = useState<number>(0);
  
  // Get screen dimensions for proper mobile sizing
  useEffect(() => {
    const updateViewportHeight = () => {
      const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight;
      setViewportHeight(vh);
    };
    
    updateViewportHeight();
    window.addEventListener('resize', updateViewportHeight);
    window.addEventListener('orientationchange', updateViewportHeight);
    
    return () => {
      window.removeEventListener('resize', updateViewportHeight);
      window.removeEventListener('orientationchange', updateViewportHeight);
    };
  }, []);
  
  const currentDirection = isMobile ? direction.mobile : 
                         window.innerWidth < 1024 ? direction.tablet : 
                         direction.desktop;
                         
  const currentAlign = isMobile ? align.mobile : 
                     window.innerWidth < 1024 ? align.tablet : 
                     align.desktop;
                     
  const currentJustify = isMobile ? justify.mobile : 
                       window.innerWidth < 1024 ? justify.tablet : 
                       justify.desktop;
  
  // Generate alignment classes
  const alignClass = (() => {
    if (currentDirection === "column") {
      switch(currentAlign) {
        case "start": return "items-start";
        case "center": return "items-center";
        case "end": return "items-end";
        case "stretch": return "items-stretch";
        case "baseline": return "items-baseline";
        default: return "items-center";
      }
    } else {
      switch(currentAlign) {
        case "start": return "items-start";
        case "center": return "items-center";
        case "end": return "items-end";
        case "stretch": return "items-stretch";
        case "baseline": return "items-baseline";
        default: return "items-center";
      }
    }
  })();
  
  // Generate justify classes
  const justifyClass = (() => {
    if (currentDirection === "column") {
      switch(currentJustify) {
        case "start": return "justify-start";
        case "center": return "justify-center";
        case "end": return "justify-end";
        case "between": return "justify-between";
        case "around": return "justify-around";
        case "evenly": return "justify-evenly";
        default: return "justify-center";
      }
    } else {
      switch(currentJustify) {
        case "start": return "justify-start";
        case "center": return "justify-center";
        case "end": return "justify-end";
        case "between": return "justify-between";
        case "around": return "justify-around";
        case "evenly": return "justify-evenly";
        default: return "justify-center";
      }
    }
  })();
  
  return (
    <div
      className={cn(
        "flex w-full transition-all duration-200",
        className,
        currentDirection === "column" ? "flex-col" : "flex-row",
        alignClass,
        justifyClass,
        wrap ? "flex-wrap" : "flex-nowrap",
        // For mobile, use special height treatment to avoid overflows
        isMobile && fullHeight ? "h-[100vh] h-[calc(var(--vh,1vh)*100)]" : ""
      )}
      style={{ 
        gap,
        ...(isMobile && fullHeight && viewportHeight > 0 ? { height: `${viewportHeight}px` } : {})
      }}
    >
      {children}
    </div>
  );
}
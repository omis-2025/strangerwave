import React from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  mobileClassName?: string;
  desktopClassName?: string;
}

/**
 * A responsive container that applies different styles based on screen size
 */
export function ResponsiveContainer({
  children,
  className = "",
  mobileClassName = "",
  desktopClassName = "",
}: ResponsiveContainerProps) {
  const isMobile = useIsMobile();
  
  return (
    <div
      className={cn(
        "w-full transition-all duration-200",
        className,
        isMobile ? mobileClassName : desktopClassName
      )}
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
}

/**
 * A responsive flex container that changes direction based on screen size
 */
export function FlexContainer({
  children,
  className = "",
  direction = {
    mobile: "column",
    tablet: "row",
    desktop: "row",
  },
  gap = "1rem",
}: FlexContainerProps) {
  const isMobile = useIsMobile();
  
  const currentDirection = isMobile ? direction.mobile : 
                           window.innerWidth < 1024 ? direction.tablet : 
                           direction.desktop;
  
  return (
    <div
      className={cn(
        "flex w-full transition-all duration-200",
        className,
        currentDirection === "column" ? "flex-col" : "flex-row"
      )}
      style={{ gap }}
    >
      {children}
    </div>
  );
}
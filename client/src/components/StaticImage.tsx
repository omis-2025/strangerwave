import React, { useEffect } from 'react';

interface StaticImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  onLoad?: () => void;
}

const StaticImage: React.FC<StaticImageProps> = ({ 
  src, 
  alt, 
  className = "", 
  fallbackSrc,
  onLoad 
}) => {
  const [imgSrc, setImgSrc] = React.useState(src);
  const [loadFailed, setLoadFailed] = React.useState(false);
  const [isLoaded, setIsLoaded] = React.useState(false);
  
  // Attempt to load the image with different paths if initial load fails
  useEffect(() => {
    // Reset state when src changes
    setLoadFailed(false);
    setImgSrc(src);
    setIsLoaded(false);
  }, [src]);

  const handleError = () => {
    if (!loadFailed && fallbackSrc) {
      console.log("Image failed to load, using fallback:", src);
      setImgSrc(fallbackSrc);
      setLoadFailed(true);
    } else if (loadFailed) {
      // Apply a default background color if all images fail
      console.log("Fallback image also failed to load");
    }
  };

  const handleLoad = () => {
    setIsLoaded(true);
    if (onLoad) {
      onLoad();
    }
  };

  // Use inline styling for fallback background if all images fail
  const style = loadFailed && !isLoaded ? { 
    backgroundColor: '#1e1e2e',
    minHeight: '300px',
  } : {};

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      style={style}
      onError={handleError}
      onLoad={handleLoad}
    />
  );
};

export default StaticImage;
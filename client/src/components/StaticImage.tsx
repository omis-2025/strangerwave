import React from 'react';

interface StaticImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
}

const StaticImage: React.FC<StaticImageProps> = ({ 
  src, 
  alt, 
  className = "", 
  fallbackSrc 
}) => {
  const [imgSrc, setImgSrc] = React.useState(src);
  const [loadFailed, setLoadFailed] = React.useState(false);
  
  const handleError = () => {
    if (!loadFailed && fallbackSrc) {
      console.log("Image failed to load, using fallback");
      setImgSrc(fallbackSrc);
      setLoadFailed(true);
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={handleError}
    />
  );
};

export default StaticImage;
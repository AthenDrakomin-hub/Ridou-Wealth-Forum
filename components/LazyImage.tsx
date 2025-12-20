import React, { useState, useEffect } from 'react';

// 创建一个简单的图片懒加载组件
const LazyImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
}> = ({ src, alt, className, placeholder = '/placeholder.png' }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => setLoaded(true);
    img.onerror = () => setError(true);
  }, [src]);

  if (error) {
    return <img src={placeholder} alt={alt} className={className} />;
  }

  return (
    <img
      src={loaded ? src : placeholder}
      alt={alt}
      className={`${className} ${loaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
      onLoad={() => setLoaded(true)}
      onError={() => setError(true)}
    />
  );
};

export default LazyImage;
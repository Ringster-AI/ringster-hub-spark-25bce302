import { useState, useRef, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  containerClassName?: string;
  aspectRatio?: string;
  fallback?: React.ReactNode;
}

/**
 * Applies Supabase Storage image transformations to optimize images
 * @param url - Original image URL
 * @param options - Transformation options
 */
const getOptimizedUrl = (
  url: string,
  options: { width?: number; height?: number; format?: string }
): string => {
  if (!url) return url;
  
  // Only apply transformations to Supabase storage URLs
  const isSupabaseStorage = url.includes('supabase') && url.includes('/storage/');
  
  if (!isSupabaseStorage) return url;
  
  const params = new URLSearchParams();
  if (options.width) params.set('width', options.width.toString());
  if (options.height) params.set('height', options.height.toString());
  params.set('resize', 'cover');
  params.set('format', options.format || 'webp');
  
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}${params.toString()}`;
};

const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  className,
  containerClassName,
  aspectRatio = "16/9",
  fallback,
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "100px", // Start loading 100px before entering viewport
        threshold: 0,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const optimizedSrc = getOptimizedUrl(src, { width, height });

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
  };

  if (hasError) {
    return (
      <div
        ref={imgRef}
        className={cn(
          "flex items-center justify-center bg-muted rounded-lg",
          containerClassName
        )}
        style={{ aspectRatio }}
      >
        {fallback || (
          <span className="text-muted-foreground text-sm">Failed to load image</span>
        )}
      </div>
    );
  }

  return (
    <div
      ref={imgRef}
      className={cn("relative overflow-hidden rounded-lg", containerClassName)}
      style={{ aspectRatio }}
    >
      {/* Skeleton placeholder */}
      {!isLoaded && (
        <Skeleton className="absolute inset-0 w-full h-full" />
      )}

      {/* Only load image when in view */}
      {isInView && (
        <img
          src={optimizedSrc}
          alt={alt}
          loading="lazy"
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0",
            className
          )}
        />
      )}
    </div>
  );
};

export { OptimizedImage, getOptimizedUrl };

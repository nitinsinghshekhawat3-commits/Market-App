import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface ScrollImageCardProps {
  src: string;
  alt: string;
  title: string;
  description: string;
  delay?: number;
  className?: string;
}

/**
 * ScrollImageCard - Image card that animates when scrolled into view
 * Uses Intersection Observer for performance
 * Animation: opacity 0→1, translateY(50px)→0, scale(0.95)→1
 */
const ScrollImageCard: React.FC<ScrollImageCardProps> = ({
  src,
  alt,
  title,
  description,
  delay = 0,
  className = ''
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Only trigger animation once when element enters viewport
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
          // Unobserve after animation triggers to prevent repeat
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.1, // Trigger when 10% of element is visible
        rootMargin: '50px', // Start animation 50px before element is visible
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [isVisible]);

  return (
    <motion.div
      ref={ref}
      className={`relative rounded-2xl overflow-hidden shadow-xl ${className}`}
      initial={{
        opacity: 0,
        y: 50,
        scale: 0.95,
      }}
      animate={
        isVisible
          ? {
              opacity: 1,
              y: 0,
              scale: 1,
            }
          : {
              opacity: 0,
              y: 50,
              scale: 0.95,
            }
      }
      transition={{
        duration: 0.7,
        delay,
        ease: 'easeOut',
      }}
    >
      {/* Image Container */}
      <div className="relative h-80 overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800">
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          loading="lazy"
        />

        {/* Overlay Gradient - only show if has title */}
        {title && <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />}
      </div>

      {/* Content Overlay - only show if has title */}
      {title && (
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <motion.h3
            className="text-xl font-bold text-white mb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ delay: delay + 0.2, duration: 0.5 }}
          >
            {title}
          </motion.h3>
          <motion.p
            className="text-sm text-gray-200 line-clamp-2"
            initial={{ opacity: 0, y: 10 }}
            animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ delay: delay + 0.3, duration: 0.5 }}
          >
            {description}
          </motion.p>
        </div>
      )}
    </motion.div>
  );
};

export default ScrollImageCard;

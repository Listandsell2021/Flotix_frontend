'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

interface PageTransitionProps {
  children: React.ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => {
      setDisplayChildren(children);
      setIsTransitioning(false);
    }, 100); // Quick fade for professional look

    return () => clearTimeout(timer);
  }, [pathname, children]);

  return (
    <div
      className="transition-opacity duration-100 ease-in-out"
      style={{
        minHeight: 'calc(100vh - 8rem)',
        opacity: isTransitioning ? 0.95 : 1 // Subtle fade, not full transparency
      }}
    >
      {displayChildren}
    </div>
  );
}
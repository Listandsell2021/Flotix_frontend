'use client';

import { ReactNode } from 'react';

interface PageWrapperProps {
  children: ReactNode;
  className?: string;
}

export default function PageWrapper({ children, className = '' }: PageWrapperProps) {
  return (
    <div
      className={`page-content ${className}`}
      style={{
        minHeight: 'calc(100vh - 8rem)',
        opacity: 1,
        transform: 'translateY(0)'
      }}
    >
      {children}
    </div>
  );
}
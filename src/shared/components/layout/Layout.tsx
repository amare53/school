import React from 'react';
import { Header } from './Header';
import { cn } from '../../utils';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, className }) => {
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header with navigation */}
      <Header />
      
      {/* Main content */}
      <main className={cn(
        'flex-1 overflow-y-auto',
        className
      )}>
        <div className="max-w-7xl mx-auto px-6 py-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export { Layout };
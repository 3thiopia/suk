import React from 'react';
import { BusinessMarketplace } from './BusinessMarketplace';

interface ProductLibraryProps {
  onNavigate?: (path: string) => void;
}

export function ProductLibrary({ onNavigate }: ProductLibraryProps) {
  return <BusinessMarketplace onNavigate={onNavigate} />;
}

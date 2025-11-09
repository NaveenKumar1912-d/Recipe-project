
import React from 'react';
import { ChefHatIcon } from './icons';

const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-40 bg-white shadow-md border-b border-stone-200">
      <div className="container mx-auto px-4 md:px-8 py-4 flex items-center justify-center">
        <ChefHatIcon className="h-10 w-10 text-red-800 mr-3" />
        <h1 className="text-2xl md:text-3xl font-bold text-stone-800 tracking-tight font-serif">
          Tamil Nadu <span className="text-red-800">AI Recipe Chef</span>
        </h1>
      </div>
    </header>
  );
};

export default Header;
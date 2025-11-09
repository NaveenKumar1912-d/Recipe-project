
import React from 'react';
import { ChefHatIcon } from './icons';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 md:px-8 py-4 flex items-center justify-center">
        <ChefHatIcon className="h-10 w-10 text-orange-500 mr-3" />
        <h1 className="text-2xl md:text-3xl font-bold text-stone-800 tracking-tight">
          Tamil Nadu <span className="text-orange-500">AI Recipe Chef</span>
        </h1>
      </div>
    </header>
  );
};

export default Header;

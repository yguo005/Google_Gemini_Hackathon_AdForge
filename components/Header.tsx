import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="text-center p-6 border-b border-slate-700">
      <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-600">
        AdForge
      </h1>
      <p className="text-slate-400 mt-2">Autonomous, Hyper-Personalized Ad Creatives</p>
    </header>
  );
};

export default Header;
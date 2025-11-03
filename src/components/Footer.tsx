
import React from 'react';
import { ChoicesLogoIcon } from './icons';

const Footer: React.FC = () => {
  return (
    <footer className="w-full p-4 mt-auto text-center text-slate-600 text-sm no-print">
      <div className="max-w-7xl mx-auto backdrop-blur-xl bg-white/30 border border-white/40 shadow-lg rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <ChoicesLogoIcon className="h-12" />
        <p className="text-xs text-slate-500">&copy; {new Date().getFullYear()} All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;

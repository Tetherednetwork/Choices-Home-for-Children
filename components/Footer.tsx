
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full p-4 mt-auto text-center text-slate-600 text-sm no-print">
      <div className="max-w-7xl mx-auto backdrop-blur-xl bg-white/30 border border-white/40 shadow-lg rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-left">
          <div className="p-2 backdrop-blur-md bg-white/40 border border-white/50 shadow-md rounded-lg flex items-center justify-center">
            <img 
              src="https://choiceshomes.co.uk/wp-content/uploads/2019/12/Choices-Logo-Transparent-300x168.png" 
              alt="Choices Home for Children Logo" 
              className="h-10"
            />
          </div>
          <div>
            <p className="font-semibold text-slate-800">Choices Home for Children</p>
            <p className="text-xs text-slate-500">This is an internal web application.</p>
          </div>
        </div>
        <p className="text-xs text-slate-500">&copy; {new Date().getFullYear()} Choices Home for Children. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;

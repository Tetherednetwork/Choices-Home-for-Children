import React, { useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import UserIcon from './UserIcon';
import { ShieldQuestionIcon, BackspaceIcon } from './icons';

interface LoginScreenProps {
  users: User[];
  onLogin: (user: User) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ users, onLogin }) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [showForgotPinMessage, setShowForgotPinMessage] = useState(false);

  const handleUserSelect = (user: User) => {
    if (!user.pin) {
      onLogin(user);
    } else {
      setSelectedUser(user);
      setError(false);
      setPin('');
      setShowForgotPinMessage(false);
    }
  };

  const handlePinSubmit = useCallback(() => {
    if (!selectedUser) return;

    if (pin === selectedUser.pin) {
      onLogin(selectedUser);
    } else {
      setError(true);
      setTimeout(() => {
        setPin('');
        setError(false);
      }, 820); // Corresponds to shake animation duration
    }
  }, [pin, selectedUser, onLogin]);


  useEffect(() => {
    if (pin.length === 4) {
      // Short delay for UI to update before submitting
      const timer = setTimeout(() => handlePinSubmit(), 100);
      return () => clearTimeout(timer);
    }
  }, [pin, handlePinSubmit]);

  const handlePinInput = (digit: string) => {
    if (pin.length < 4) {
      setPin(prevPin => prevPin + digit);
    }
  };

  const handleBackspace = () => {
    setPin(prevPin => prevPin.slice(0, -1));
  };
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!selectedUser || showForgotPinMessage) return;

      if (event.key >= '0' && event.key <= '9') {
        handlePinInput(event.key);
      } else if (event.key === 'Backspace') {
        handleBackspace();
      } else if (event.key === 'Enter' && pin.length === 4) {
        handlePinSubmit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedUser, showForgotPinMessage, pin, handlePinSubmit]);


  const handleBack = () => {
    setSelectedUser(null);
    setError(false);
    setPin('');
    setShowForgotPinMessage(false);
  };
  
  const keypadButtons = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'backspace'];


  const userSelectionView = (
     <div className="w-full max-w-md mx-auto">
        <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900">Sign In</h1>
            <p className="mt-2 text-md text-gray-600">Please select a user to log in</p>
        </div>
        <div className="space-y-4 mt-8">
          {users.map((user) => (
            <button
              key={user.id}
              onClick={() => handleUserSelect(user)}
              className="w-full flex items-center p-4 text-left backdrop-blur-md bg-white/30 border border-white/40 shadow-sm hover:bg-white/40 hover:shadow-md rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-sky-500/80"
            >
              <UserIcon name={user.name} color={user.color} className="flex-shrink-0 h-10 w-10" />
              <div className="ml-4">
                <p className="text-lg font-semibold text-slate-800">{user.name}</p>
                <p className="text-sm text-slate-500">{user.role}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
  );

  return (
    <div className="flex items-center justify-center h-full p-4 sm:p-6">
      <div className="w-full max-w-4xl backdrop-blur-xl bg-white/40 border border-white/50 shadow-2xl rounded-2xl flex overflow-hidden min-h-[600px] md:min-h-[650px]">
        {/* Left Column: Sign-in */}
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
            {selectedUser ? (
                <div className="relative w-full max-w-sm mx-auto text-center">
                    <button onClick={handleBack} className="absolute -top-4 -left-4 text-sm text-slate-600 hover:text-slate-900">&larr; Back to users</button>
                    <div className="flex flex-col items-center">
                        <UserIcon name={selectedUser.name} color={selectedUser.color} className="flex-shrink-0 h-20 w-20 mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900">{selectedUser.name}</h2>
                        <p className="mt-1 text-md text-gray-600">
                        {showForgotPinMessage ? 'PIN Recovery' : 'Enter your PIN'}
                        </p>
                    </div>
                    
                    {showForgotPinMessage ? (
                    <div className="space-y-4 text-center pt-4">
                        <ShieldQuestionIcon className="w-16 h-16 mx-auto text-sky-500"/>
                        <p className="text-slate-600">
                        Please contact an administrator to have your PIN reset. They will provide you with a temporary PIN to log in.
                        </p>
                        <button
                        onClick={() => setShowForgotPinMessage(false)}
                        className="w-full mt-4 p-3 text-lg font-semibold text-white backdrop-blur-md bg-sky-600/70 border border-sky-600/80 shadow-md hover:bg-sky-600/90 hover:shadow-lg rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500/80"
                        >
                        Back to Login
                        </button>
                    </div>
                    ) : (
                    <>
                        <div className={`my-8 flex justify-center space-x-4 ${error ? 'animate-shake' : ''}`}>
                            {[...Array(4)].map((_, i) => (
                                <div
                                    key={i}
                                    className={`h-4 w-4 rounded-full border-2 transition-all ${
                                        error ? 'border-red-500' : 'border-slate-400'
                                    } ${pin.length > i ? (error ? 'bg-red-500' : 'bg-slate-800') : 'bg-transparent'}`}
                                />
                            ))}
                        </div>
                        <p className={`text-red-500 text-sm -mt-4 mb-4 transition-opacity duration-300 ${error ? 'opacity-100' : 'opacity-0'}`}>Incorrect PIN</p>
                        <div className="grid grid-cols-3 gap-4">
                            {keypadButtons.map((key, index) => {
                                if (key === '') return <div key={index} />;
                                
                                const isBackspace = key === 'backspace';

                                return (
                                    <button
                                        key={index}
                                        onClick={() => isBackspace ? handleBackspace() : handlePinInput(key)}
                                        className="flex items-center justify-center h-16 text-3xl font-semibold text-slate-800 backdrop-blur-md bg-white/20 border border-white/40 shadow-sm hover:bg-white/40 hover:shadow-md rounded-full focus:outline-none focus:ring-2 focus:ring-sky-500/80 transition-all disabled:opacity-50 disabled:bg-white/10 disabled:cursor-not-allowed"
                                        disabled={isBackspace && pin.length === 0}
                                    >
                                        {isBackspace ? <BackspaceIcon className="w-8 h-8"/> : key}
                                    </button>
                                )
                            })}
                        </div>
                        <div className="text-center mt-6">
                            <button 
                                onClick={() => setShowForgotPinMessage(true)}
                                className="text-sm text-sky-700 hover:text-sky-900 hover:underline"
                            >
                                Forgot PIN?
                            </button>
                        </div>
                    </>
                    )}
                </div>
            ) : userSelectionView}
        </div>

        {/* Right Column: Banner */}
        <div className="hidden md:flex w-1/2 p-12 text-white flex-col justify-center items-center text-center animate-illuminate">
          <img 
            src="https://choiceshomes.co.uk/wp-content/uploads/2019/12/Choices-Logo-Transparent-300x168.png" 
            alt="Choices Home for Children Logo" 
            className="h-20"
            style={{ filter: 'brightness(0) invert(1)' }}
          />
          <h2 className="text-3xl font-bold mt-6">Welcome Back</h2>
          <p className="mt-2 text-white/80">Your collaborative workspace awaits.</p>
          <div className="mt-8 border-t border-white/50 w-1/3"></div>
        </div>
        
        <style>{`
            @keyframes shake {
              10%, 90% { transform: translate3d(-1px, 0, 0); }
              20%, 80% { transform: translate3d(2px, 0, 0); }
              30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
              40%, 60% { transform: translate3d(4px, 0, 0); }
            }
            .animate-shake {
              animation: shake 0.82s cubic-bezier(.36,.07,.19,.97) both;
            }
            @keyframes illuminate {
              0%, 100% { background-color: #10b981; } /* emerald-600 */
              33% { background-color: #3b82f6; } /* blue-500 */
              66% { background-color: #f97316; } /* orange-500 */
            }
            .animate-illuminate {
              animation: illuminate 15s infinite ease-in-out;
            }
        `}</style>
      </div>
    </div>
  );
};

export default LoginScreen;
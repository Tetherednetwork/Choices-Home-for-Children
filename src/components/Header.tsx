import React, { useState, useEffect, useRef } from 'react';
import { User, Notification } from '../types';
import { LogOutIcon, BellIcon, UsersIcon, ArchiveIcon, ChevronDownIcon, FileTextIcon, EditIcon, ClipboardCopyIcon, TrashIcon, PlusIcon, ChoicesLogoIcon } from './icons';
import UserIcon from './UserIcon';
import { DashboardView } from '../types';

interface HeaderProps {
    currentUser: User | null;
    notifications: Notification[];
    onLogout: () => void;
    onNavigate: (view: DashboardView) => void;
    onNewFormClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentUser, notifications, onLogout, onNavigate, onNewFormClick }) => {
    const [isFormMenuOpen, setIsFormMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsFormMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleNavAndClose = (view: DashboardView) => {
        onNavigate(view);
        setIsFormMenuOpen(false);
    }

    return (
        <header className="w-full p-4 no-print sticky top-0 z-40">
            <div className="max-w-7xl mx-auto backdrop-blur-xl bg-white/40 border border-white/50 shadow-lg rounded-xl p-3 sm:p-4 flex items-center justify-between">
                <div 
                    className={`flex items-center gap-4 ${currentUser ? 'cursor-pointer' : ''}`}
                    onClick={() => currentUser && onNavigate('published')}
                    title={currentUser ? 'Go to Dashboard' : ''}
                >
                    <ChoicesLogoIcon className="w-28" />
                    <div className="hidden sm:block">
                        <p className="font-semibold text-slate-800">Choices Home for Children</p>
                        <p className="text-xs text-slate-500">Collaborative Form System</p>
                    </div>
                </div>
                {currentUser && (
                    <div className="flex items-center gap-2 sm:gap-4">
                        <div className="relative" ref={menuRef}>
                            <button
                                onClick={() => setIsFormMenuOpen(!isFormMenuOpen)}
                                className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-800 backdrop-blur-md bg-white/30 border border-white/40 shadow-sm hover:bg-white/40 hover:shadow-md rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500/80"
                            >
                                <span className="hidden lg:inline">Forms</span>
                                <ChevronDownIcon className="w-5 h-5"/>
                            </button>
                            {isFormMenuOpen && (
                                <div className="absolute right-0 mt-2 w-56 backdrop-blur-xl bg-white/60 border border-white/50 shadow-2xl rounded-lg py-1 z-50">
                                    {currentUser.role === 'Admin' && (
                                        <div className="px-2 py-2">
                                            <button 
                                                onClick={() => { onNewFormClick(); setIsFormMenuOpen(false); }}
                                                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-lime-500 hover:bg-lime-600 shadow-md rounded-md transition-all"
                                            >
                                                <PlusIcon className="w-4 h-4" />
                                                New Form
                                            </button>
                                        </div>
                                    )}
                                    <button onClick={() => handleNavAndClose('published')} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-white/50 flex items-center gap-3"><FileTextIcon className="w-4 h-4 text-sky-700"/> Published Forms</button>
                                    {currentUser.role === 'Admin' && (
                                        <>
                                            <button onClick={() => handleNavAndClose('drafts')} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-white/50 flex items-center gap-3"><EditIcon className="w-4 h-4 text-amber-700"/> Drafts</button>
                                            <button onClick={() => handleNavAndClose('templates')} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-white/50 flex items-center gap-3"><ClipboardCopyIcon className="w-4 h-4 text-lime-700"/> Templates</button>
                                            <div className="my-1 h-px bg-slate-200"></div>
                                            <button onClick={() => handleNavAndClose('trash')} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-white/50 flex items-center gap-3"><TrashIcon className="w-4 h-4 text-red-700"/> Trash</button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {currentUser.role === 'Admin' && (
                             <button
                                onClick={() => onNavigate('userManagement')}
                                className="hidden md:flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-800 backdrop-blur-md bg-white/30 border border-white/40 shadow-sm hover:bg-white/40 hover:shadow-md rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500/80"
                                title="Manage Users"
                              >
                                  <UsersIcon className="w-5 h-5" />
                                  <span className="hidden lg:inline">Manage Users</span>
                              </button>
                        )}
                        <button
                            className="relative p-2 text-slate-700 backdrop-blur-md bg-white/30 border border-white/40 shadow-sm hover:bg-white/40 hover:shadow-md rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500/80 transition-colors"
                            aria-label={`View notifications (${notifications.length})`}
                            title={`${notifications.length} notifications`}
                        >
                            <BellIcon className="w-5 h-5" />
                            {notifications.length > 0 && (
                            <span className="absolute top-0 right-0 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                            </span>
                            )}
                        </button>
                        <button
                            onClick={() => onNavigate('profile')}
                            className="p-1.5 backdrop-blur-md bg-white/30 border border-white/40 shadow-sm hover:bg-white/40 hover:shadow-md rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500/80"
                            title="My Profile"
                        >
                            <UserIcon name={currentUser.name} color={currentUser.color} className="w-8 h-8" />
                        </button>
                        <button
                            onClick={onLogout}
                            className="flex items-center justify-center p-2 text-sm font-semibold text-slate-800 backdrop-blur-md bg-white/30 border border-white/40 shadow-sm hover:bg-white/40 hover:shadow-md rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500/80"
                            title="Logout"
                        >
                            <LogOutIcon className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;

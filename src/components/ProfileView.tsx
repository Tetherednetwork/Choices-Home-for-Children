
import React, { useState } from 'react';
import { User } from '../types';
import { ChevronLeftIcon, SettingsIcon } from './icons';
import UserIcon from './UserIcon';

interface ProfileViewProps {
    currentUser: User;
    onUpdateUser: (updatedUser: User) => void;
    onBack: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ currentUser, onUpdateUser, onBack }) => {
    const [name, setName] = useState(currentUser.name || '');
    const [email, setEmail] = useState(currentUser.email || '');
    const [emailError, setEmailError] = useState('');

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSaveChanges = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateEmail(email.trim())) {
            setEmailError('Please enter a valid email address.');
            return;
        }

        if (name.trim() && email.trim()) {
            onUpdateUser({
                ...currentUser,
                name: name.trim(),
                email: email.trim(),
            });
            alert('Profile updated successfully!');
            onBack();
        } else {
            alert('Name and email cannot be empty.');
        }
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
        if (emailError) {
            setEmailError('');
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
            <header className="flex items-center justify-between mb-6">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-800 backdrop-blur-md bg-white/30 border border-white/40 shadow-sm hover:bg-white/40 hover:shadow-md rounded-xl transition-all duration-300"
                >
                    <ChevronLeftIcon className="w-4 h-4"/>
                    Back to Dashboard
                </button>
                <div className="flex items-center gap-3">
                    <SettingsIcon className="w-8 h-8 text-slate-600"/>
                    <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
                </div>
            </header>

            <form onSubmit={handleSaveChanges} className="backdrop-blur-xl bg-white/50 p-8 rounded-2xl shadow-2xl border border-white/60 space-y-8">
                <div className="flex flex-col sm:flex-row items-center gap-8">
                    <div className="flex-shrink-0">
                        <UserIcon name={name} color={currentUser.color} className="w-32 h-32" />
                    </div>
                    <div className="flex-grow w-full">
                        <div>
                            <label htmlFor="user-name" className="block text-sm font-medium text-slate-700">Full Name</label>
                            <input
                                type="text"
                                id="user-name"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="mt-1 block w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500"
                                required
                            />
                        </div>
                        <div className="mt-4">
                            <label htmlFor="user-email" className="block text-sm font-medium text-slate-700">Email Address</label>
                            <input
                                type="email"
                                id="user-email"
                                value={email}
                                onChange={handleEmailChange}
                                className={`mt-1 block w-full p-2 border rounded-md shadow-sm ${emailError ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-slate-300 focus:ring-sky-500 focus:border-sky-500'}`}
                                aria-invalid={!!emailError}
                                aria-describedby="profile-email-error"
                                required
                            />
                             {emailError && <p id="profile-email-error" className="mt-1 text-sm text-red-600">{emailError}</p>}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end border-t pt-6">
                     <button
                        type="submit"
                        className="px-6 py-2 font-semibold text-white backdrop-blur-md bg-sky-600/80 border border-sky-600/90 shadow-lg hover:bg-sky-700/80 hover:shadow-xl rounded-xl transition-all duration-300"
                    >
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProfileView;

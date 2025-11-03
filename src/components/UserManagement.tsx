
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { ChevronLeftIcon, PlusIcon, UsersIcon, XIcon, SettingsIcon, EyeIcon, EyeOffIcon } from './icons';
import UserIcon from './UserIcon';

interface UserManagementProps {
    currentUser: User;
    allUsers: User[];
    onCreateUser: (newUser: Omit<User, 'id' | 'color'>) => void;
    onUpdateUser: (updatedUser: User) => void;
    onBack: () => void;
}

const EditUserModal: React.FC<{
    userToEdit: User;
    currentUser: User;
    onSave: (updatedUser: User) => void;
    onClose: () => void;
}> = ({ userToEdit, currentUser, onSave, onClose }) => {
    const [name, setName] = useState(userToEdit.name || '');
    const [email, setEmail] = useState(userToEdit.email || '');
    const [role, setRole] = useState<UserRole>(userToEdit.role);
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [errors, setErrors] = useState<{name?: string; email?: string; pin?: string}>({});
    const [showPin, setShowPin] = useState(false);

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSave = () => {
        const newErrors: {name?: string, email?: string, pin?: string} = {};
        if (!name.trim()) {
            newErrors.name = 'Name cannot be empty.';
        }
        if (!validateEmail(email.trim())) {
            newErrors.email = 'Please enter a valid email.';
        }
        if (pin || confirmPin) {
             if (pin.length !== 4) {
                newErrors.pin = 'PIN must be 4 digits.';
            } else if (pin !== confirmPin) {
                newErrors.pin = 'PINs do not match.';
            }
        }
        
        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            return;
        }

        const updatedUser = {
            ...userToEdit,
            name: name.trim(),
            email: email.trim(),
            role: role,
            pin: pin ? pin : userToEdit.pin,
        };
        onSave(updatedUser);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="backdrop-blur-xl bg-white/50 p-6 rounded-2xl shadow-2xl border border-white/60 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-slate-800">Edit User: {userToEdit.name}</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200"><XIcon className="w-5 h-5"/></button>
                </div>
                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    <div>
                        <label htmlFor="edit-user-name" className="block text-sm font-medium text-slate-700">Full Name</label>
                        <input
                            type="text"
                            id="edit-user-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={`mt-1 block w-full p-2 border rounded-md shadow-sm ${errors.name ? 'border-red-500' : 'border-slate-300'}`}
                        />
                        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                    </div>
                    <div>
                        <label htmlFor="edit-user-email" className="block text-sm font-medium text-slate-700">Email Address</label>
                        <input
                            type="email"
                            id="edit-user-email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={`mt-1 block w-full p-2 border rounded-md shadow-sm ${errors.email ? 'border-red-500' : 'border-slate-300'}`}
                        />
                        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                    </div>
                    <div>
                        <label htmlFor="edit-user-role" className="block text-sm font-medium text-slate-700">Role</label>
                        <select
                            id="edit-user-role"
                            value={role}
                            onChange={(e) => setRole(e.target.value as UserRole)}
                            disabled={userToEdit.id === currentUser.id}
                            className="mt-1 block w-full p-2 border border-slate-300 rounded-md shadow-sm bg-white disabled:bg-slate-100 disabled:cursor-not-allowed"
                        >
                            <option value="Admin">Admin</option>
                            <option value="User">User</option>
                            <option value="Viewer">Viewer</option>
                        </select>
                         {userToEdit.id === currentUser.id && <p className="text-xs text-slate-500 mt-1">You cannot change your own role.</p>}
                    </div>

                    <div className="border-t pt-4">
                        <p className="text-sm font-medium text-slate-700">Reset PIN (optional)</p>
                        <div className="mt-2">
                            <label htmlFor="edit-user-pin" className="block text-sm font-medium text-slate-700">New 4-Digit PIN</label>
                            <div className="relative mt-1">
                                <input
                                    type={showPin ? 'text' : 'password'}
                                    id="edit-user-pin"
                                    value={pin}
                                    onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                    maxLength={4}
                                    className={`block w-full p-2 pr-10 border rounded-md shadow-sm ${errors.pin ? 'border-red-500' : 'border-slate-300'}`}
                                    inputMode="numeric"
                                />
                                <button type="button" onClick={() => setShowPin(!showPin)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-700">
                                    {showPin ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>
                        <div className="mt-4">
                            <label htmlFor="edit-user-pin-confirm" className="block text-sm font-medium text-slate-700">Confirm New PIN</label>
                             <div className="relative mt-1">
                                <input
                                    type={showPin ? 'text' : 'password'}
                                    id="edit-user-pin-confirm"
                                    value={confirmPin}
                                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                    maxLength={4}
                                    className={`block w-full p-2 pr-10 border rounded-md shadow-sm ${errors.pin ? 'border-red-500' : 'border-slate-300'}`}
                                    inputMode="numeric"
                                />
                                <button type="button" onClick={() => setShowPin(!showPin)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-700">
                                    {showPin ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>
                        {errors.pin && <p className="mt-1 text-sm text-red-600">{errors.pin}</p>}
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-800 backdrop-blur-md bg-white/30 border border-white/40 shadow-sm hover:bg-white/40 hover:shadow-md rounded-xl transition-all duration-300">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 text-sm font-semibold text-white backdrop-blur-md bg-sky-600/80 border border-sky-600/90 shadow-lg hover:bg-sky-700/80 hover:shadow-xl rounded-xl transition-all duration-300">Save Changes</button>
                </div>
            </div>
        </div>
    )
}

const UserManagement: React.FC<UserManagementProps> = ({ currentUser, allUsers, onCreateUser, onUpdateUser, onBack }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [role, setRole] = useState<UserRole>('User');
    const [showPin, setShowPin] = useState(false);
    
    const [emailError, setEmailError] = useState('');
    const [pinError, setPinError] = useState('');
    const [confirmPinError, setConfirmPinError] = useState('');

    const [editingUser, setEditingUser] = useState<User | null>(null);

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    const validatePin = (pin: string): boolean => {
        return /^\d{4}$/.test(pin);
    }

    const handleCreateUser = (e: React.FormEvent) => {
        e.preventDefault();
        let hasError = false;
        setEmailError('');
        setPinError('');
        setConfirmPinError('');
        
        if (!validateEmail(email.trim())) {
            setEmailError('Please enter a valid email address.');
            hasError = true;
        }
        if (!validatePin(pin.trim())) {
            setPinError('PIN must be 4 digits.');
            hasError = true;
        }
        if (pin.trim() !== confirmPin.trim()) {
            setConfirmPinError('PINs do not match.');
            hasError = true;
        }
        if (hasError) return;

        if (name.trim() && email.trim() && pin.trim()) {
            if (allUsers.some(u => u.email.toLowerCase() === email.trim().toLowerCase())) {
                alert('A user with this email already exists.');
                return;
            }
            onCreateUser({
                name: name.trim(),
                email: email.trim(),
                role,
                pin: pin.trim(),
            });
            setName('');
            setEmail('');
            setPin('');
            setConfirmPin('');
            setRole('User');
            setEmailError('');
            setPinError('');
            setConfirmPinError('');
        } else {
            alert('Please fill in all fields.');
        }
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
        if (emailError) setEmailError('');
    };
    
    const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'pin' | 'confirmPin') => {
        const value = e.target.value;
        if (/^\d*$/.test(value) && value.length <= 4) {
            if (field === 'pin') {
                setPin(value);
                if (pinError) setPinError('');
            } else {
                setConfirmPin(value);
            }
            if (confirmPinError) setConfirmPinError('');
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
            {editingUser && (
                <EditUserModal 
                    userToEdit={editingUser} 
                    currentUser={currentUser}
                    onSave={(updatedUser) => {
                        onUpdateUser(updatedUser);
                        setEditingUser(null);
                    }}
                    onClose={() => setEditingUser(null)} 
                />
            )}
            <header className="flex items-center justify-between mb-6">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-800 backdrop-blur-md bg-white/30 border border-white/40 shadow-sm hover:bg-white/40 hover:shadow-md rounded-xl transition-all duration-300"
                >
                    <ChevronLeftIcon className="w-4 h-4"/>
                    Back to Dashboard
                </button>
                <div className="flex items-center gap-3">
                    <UsersIcon className="w-8 h-8 text-slate-600"/>
                    <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Create User Form */}
                <div className="md:col-span-1">
                    <div className="backdrop-blur-xl bg-white/50 p-6 rounded-2xl shadow-lg border border-white/60">
                        <h2 className="text-xl font-semibold text-slate-800 mb-4">Create New User</h2>
                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div>
                                <label htmlFor="user-name" className="block text-sm font-medium text-slate-700">Full Name</label>
                                <input
                                    type="text"
                                    id="user-name"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="mt-1 block w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500"
                                    placeholder="e.g., John Doe"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="user-email" className="block text-sm font-medium text-slate-700">Email Address</label>
                                <input
                                    type="email"
                                    id="user-email"
                                    value={email}
                                    onChange={handleEmailChange}
                                    className={`mt-1 block w-full p-2 border rounded-md shadow-sm ${emailError ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-slate-300 focus:ring-sky-500 focus:border-sky-500'}`}
                                    placeholder="e.g., john.doe@example.com"
                                    aria-invalid={!!emailError}
                                    aria-describedby="email-error"
                                    required
                                />
                                {emailError && <p id="email-error" className="mt-1 text-sm text-red-600">{emailError}</p>}
                            </div>
                             <div>
                                <label htmlFor="user-role" className="block text-sm font-medium text-slate-700">Role</label>
                                <select
                                    id="user-role"
                                    value={role}
                                    onChange={e => setRole(e.target.value as UserRole)}
                                    className="mt-1 block w-full p-2 border border-slate-300 rounded-md shadow-sm bg-white focus:ring-sky-500 focus:border-sky-500"
                                >
                                    <option value="Admin">Admin</option>
                                    <option value="User">User</option>
                                    <option value="Viewer">Viewer</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="user-pin" className="block text-sm font-medium text-slate-700">4-Digit PIN</label>
                                <div className="relative mt-1">
                                    <input
                                        type={showPin ? 'text' : 'password'}
                                        id="user-pin"
                                        value={pin}
                                        onChange={(e) => handlePinChange(e, 'pin')}
                                        maxLength={4}
                                        className={`block w-full p-2 pr-10 border rounded-md shadow-sm ${pinError ? 'border-red-500' : 'border-slate-300'}`}
                                        placeholder="e.g., 1234"
                                        inputMode="numeric"
                                        required
                                    />
                                    <button type="button" onClick={() => setShowPin(!showPin)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-700">
                                        {showPin ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                                    </button>
                                </div>
                                {pinError && <p className="mt-1 text-sm text-red-600">{pinError}</p>}
                            </div>
                             <div>
                                <label htmlFor="user-pin-confirm" className="block text-sm font-medium text-slate-700">Confirm PIN</label>
                                <div className="relative mt-1">
                                    <input
                                        type={showPin ? 'text' : 'password'}
                                        id="user-pin-confirm"
                                        value={confirmPin}
                                        onChange={(e) => handlePinChange(e, 'confirmPin')}
                                        maxLength={4}
                                        className={`block w-full p-2 pr-10 border rounded-md shadow-sm ${confirmPinError ? 'border-red-500' : 'border-slate-300'}`}
                                        placeholder="Repeat PIN"
                                        inputMode="numeric"
                                        required
                                    />
                                    <button type="button" onClick={() => setShowPin(!showPin)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-700">
                                        {showPin ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                                    </button>
                                </div>
                                {confirmPinError && <p className="mt-1 text-sm text-red-600">{confirmPinError}</p>}
                            </div>
                            <button
                                type="submit"
                                className="w-full flex justify-center items-center gap-2 px-4 py-2 font-semibold text-white backdrop-blur-md bg-lime-500/80 border border-lime-500/90 shadow-lg hover:bg-lime-600/80 hover:shadow-xl rounded-xl transition-all duration-300"
                            >
                                <PlusIcon className="w-5 h-5"/>
                                Create User
                            </button>
                        </form>
                    </div>
                </div>

                {/* User List */}
                <div className="md:col-span-2">
                    <div className="backdrop-blur-xl bg-white/50 p-6 rounded-2xl shadow-lg border border-white/60">
                         <h2 className="text-xl font-semibold text-slate-800 mb-4">Existing Users ({allUsers.length})</h2>
                         <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                            {allUsers.map(user => (
                                <div key={user.id} className="flex items-center p-3 bg-white/50 rounded-lg">
                                    <UserIcon name={user.name} color={user.color} className="flex-shrink-0 h-10 w-10"/>
                                    <div className="ml-4 flex-grow">
                                        <p className="font-semibold text-slate-800">{user.name}</p>
                                        <p className="text-sm text-slate-500">{user.email}</p>
                                    </div>
                                    <span
                                        className={`px-3 py-1 text-xs font-medium rounded-full
                                          ${user.role === 'Admin' ? 'bg-red-100 text-red-800' : 
                                          user.role === 'Viewer' ? 'bg-indigo-100 text-indigo-800' : 'bg-blue-100 text-blue-800'}`}
                                    >
                                        {user.role}
                                    </span>
                                    <button onClick={() => setEditingUser(user)} className="ml-4 p-2 text-slate-500 hover:bg-slate-200 rounded-full" title={`Edit user ${user.name}`}>
                                        <SettingsIcon className="w-5 h-5"/>
                                    </button>
                                </div>
                            ))}
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserManagement;

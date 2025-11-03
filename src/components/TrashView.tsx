import React from 'react';
import { Form, User } from '../types';
import { ChevronLeftIcon, RotateCwIcon, TrashIcon, ArchiveIcon, FileIcon } from './icons';

interface TrashViewProps {
    deletedForms: Form[];
    onRestore: (formId: number) => void;
    onDeletePermanently: (formId: number) => void;
    onBack: () => void;
    allUsers: User[];
}

const TrashView: React.FC<TrashViewProps> = ({ deletedForms, onRestore, onDeletePermanently, onBack, allUsers }) => {
    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <header className="flex items-center justify-between mb-6">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-800 backdrop-blur-md bg-white/30 border border-white/40 shadow-sm hover:bg-white/40 hover:shadow-md rounded-xl transition-all duration-300"
                >
                    <ChevronLeftIcon className="w-4 h-4"/>
                    Back to Dashboard
                </button>
                <div className="flex items-center gap-3">
                    <ArchiveIcon className="w-8 h-8 text-slate-600"/>
                    <h1 className="text-3xl font-bold text-slate-900">Trash</h1>
                </div>
                {/* Spacer to keep title centered */}
                <div className="w-48" /> 
            </header>

            <main>
                {deletedForms.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {deletedForms.map(form => {
                            const creator = allUsers.find(u => u.id === form.createdBy);
                            return (
                                <div key={form.id} className="backdrop-blur-md bg-white/40 p-6 rounded-2xl border border-white/50 shadow-lg flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="p-3 bg-slate-100 rounded-lg">
                                                <FileIcon className="w-6 h-6 text-slate-500" />
                                            </div>
                                        </div>
                                        <h3 className="text-xl font-semibold text-slate-800 truncate">{form.title}</h3>
                                        {creator && <p className="text-xs text-slate-500 mt-1">Created by: {creator.name}</p>}
                                        <p className="text-xs text-red-600 mt-1 font-medium">Status: In Trash</p>
                                    </div>
                                    
                                    <div className="mt-6 flex justify-end gap-3 border-t pt-4">
                                        <button
                                            onClick={() => onRestore(form.id)}
                                            className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-slate-800 backdrop-blur-md bg-white/30 border border-white/40 shadow-sm hover:bg-white/40 hover:shadow-md rounded-xl transition-all duration-300"
                                            title="Restore Form"
                                        >
                                            <RotateCwIcon className="w-4 h-4"/>
                                            <span>Restore</span>
                                        </button>
                                        <button
                                            onClick={() => onDeletePermanently(form.id)}
                                            className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur-md bg-red-600/70 border border-red-600/80 shadow-md hover:bg-red-600/90 hover:shadow-lg rounded-xl transition-all duration-300"
                                            title="Delete Permanently"
                                        >
                                            <TrashIcon className="w-4 h-4"/>
                                            <span>Delete Forever</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-20 backdrop-blur-md bg-white/40 rounded-2xl shadow-lg border border-white/50">
                        <ArchiveIcon className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                        <h2 className="text-2xl font-semibold text-slate-700">Trash is empty</h2>
                        <p className="text-slate-500 mt-2">Deleted forms will appear here.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default TrashView;
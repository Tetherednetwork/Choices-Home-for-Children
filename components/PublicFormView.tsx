import React from 'react';
import { Form, Section, User, Question } from '../types';
import { FileUpIcon } from './icons';
import UserIcon from './UserIcon';

// Simplified StarRating, only for display
const StarRating: React.FC<{ value: number }> = ({ value }) => {
    const stars = Array.from({ length: 5 }, (_, i) => i + 1);
    return (
        <div className="flex items-center space-x-1">
            {stars.map(starValue => (
                <svg
                    key={starValue}
                    className={`w-8 h-8 ${starValue <= value ? 'text-amber-400' : 'text-slate-300'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            ))}
        </div>
    );
};

// Simplified SectionContent, only for display
const SectionContent: React.FC<{ section: Section }> = ({ section }) => {
    return (
        <div className="space-y-6">
            {section.questions.map(q => (
                <div key={q.id}>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        {q.text} {q.required && <span className="text-red-500">*</span>}
                    </label>
                    {q.type === 'short-answer' && <div className="w-full p-2 border border-slate-300 rounded-md bg-slate-100 cursor-not-allowed min-h-[40px]"></div>}
                    {q.type === 'paragraph' && <div className="w-full p-2 border border-slate-300 rounded-md bg-slate-100 cursor-not-allowed min-h-[96px]"></div>}
                    {q.type === 'multiple-choice' && q.options && <div className="space-y-2">{q.options.map(o => <label key={o} className="flex items-center"><input type="radio" disabled className="h-4 w-4" /><span className="ml-3 text-sm text-slate-700">{o}</span></label>)}</div>}
                    {q.type === 'checkboxes' && q.options && <div className="space-y-2">{q.options.map(o => <label key={o} className="flex items-center"><input type="checkbox" disabled className="h-4 w-4 rounded" /><span className="ml-3 text-sm text-slate-700">{o}</span></label>)}</div>}
                    {q.type === 'signature' && <div className="w-full h-32 border border-dashed border-slate-400 rounded-md bg-slate-50 flex items-center justify-center text-slate-500">Signature Area</div>}
                    {q.type === 'rating' && <StarRating value={0} />}
                    {q.type === 'date' && <div className="w-full p-2 border border-slate-300 rounded-md bg-slate-100 cursor-not-allowed min-h-[40px]"></div>}
                    {q.type === 'mobile' && <div className="w-full p-2 border border-slate-300 rounded-md bg-slate-100 cursor-not-allowed min-h-[40px] flex items-center text-slate-500">Mobile number input</div>}
                    {q.type === 'email' && <div className="w-full p-2 border border-slate-300 rounded-md bg-slate-100 cursor-not-allowed min-h-[40px] flex items-center text-slate-500">Email address input</div>}
                    {q.type === 'url' && <div className="w-full p-2 border border-slate-300 rounded-md bg-slate-100 cursor-not-allowed min-h-[40px] flex items-center text-slate-500">URL input</div>}
                    {q.type === 'file-upload' && <div className="flex items-center gap-2 p-3 bg-slate-100 border border-slate-300 rounded-md cursor-not-allowed"><FileUpIcon className="w-5 h-5 text-slate-500" /> <span className="text-slate-500">File upload area</span></div>}
                </div>
            ))}
        </div>
    );
};


interface PublicFormViewProps {
  form: Form;
  allSections: Section[];
  allUsers: User[];
}

const PublicFormView: React.FC<PublicFormViewProps> = ({ form, allSections, allUsers }) => {
    const sortedSections = [...allSections].sort((a, b) => a.order - b.order);

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
            <header className="text-center my-4">
                <p className="text-sm font-semibold text-sky-700 bg-sky-100 px-3 py-1 rounded-full inline-block">PUBLIC PREVIEW</p>
            </header>
            
            <div className="backdrop-blur-xl bg-white/50 p-8 sm:p-12 rounded-2xl shadow-2xl border border-white/60">
                <div className="border-b pb-4 mb-8">
                    <h1 className="text-4xl font-bold text-slate-900 text-center">{form.title}</h1>
                    {form.dueDate && (
                        <p className="mt-2 text-sm font-medium text-slate-500 text-center">
                            Due by: {new Date(form.dueDate).toLocaleDateString()}
                        </p>
                    )}
                </div>
                <div className="space-y-12">
                    {sortedSections.map(section => {
                        const assignedUser = allUsers.find(u => u.id === section.assignedTo);
                        return (
                            <div key={section.id} className="border-t pt-8">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-2xl font-semibold text-slate-800">{section.title}</h2>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm text-slate-500 text-right">
                                            Assigned to: {assignedUser?.name || 'Unknown'}
                                        </span>
                                        <UserIcon name={assignedUser?.name || ''} color={assignedUser?.color || 'bg-slate-400'} className="w-8 h-8" />
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <SectionContent section={section} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default PublicFormView;
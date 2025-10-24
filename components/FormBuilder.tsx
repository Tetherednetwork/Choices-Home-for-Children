import React, { useState, useEffect } from 'react';
import { User, Question, QuestionType } from '../types';
import { PlusIcon, TrashIcon, GripVerticalIcon } from './icons';

type TempQuestion = Omit<Question, 'id'> & { tempId: string; options: string[] };
type TempSection = {
    tempId: string;
    title: string;
    assignedTo: number;
    questions: TempQuestion[];
};

interface FormBuilderProps {
    allUsers: User[];
    onSave: (form: { title: string; sections: any[] }) => void;
    onCancel: () => void;
}

const DRAFT_KEY = 'form-builder-draft';

const FormBuilder: React.FC<FormBuilderProps> = ({ allUsers, onSave, onCancel }) => {
    const [title, setTitle] = useState('');
    const [sections, setSections] = useState<TempSection[]>([]);
    const [draggedSectionId, setDraggedSectionId] = useState<string | null>(null);
    
    useEffect(() => {
        const savedDraft = localStorage.getItem(DRAFT_KEY);
        if (savedDraft) {
            try {
                const draft = JSON.parse(savedDraft);
                if (draft.title || draft.sections?.length > 0) {
                     if (window.confirm('You have an unsaved draft. Would you like to restore it?')) {
                        setTitle(draft.title || '');
                        setSections(draft.sections || []);
                    } else {
                        localStorage.removeItem(DRAFT_KEY);
                    }
                }
            } catch (error) {
                console.error("Failed to parse form builder draft:", error);
                localStorage.removeItem(DRAFT_KEY);
            }
        }
    }, []);

    useEffect(() => {
        if (title.trim() || sections.length > 0) {
            const draft = { title, sections };
            localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
        } else {
            localStorage.removeItem(DRAFT_KEY);
        }
    }, [title, sections]);

    const addSection = () => {
        setSections([...sections, {
            tempId: `section-${Date.now()}`,
            title: '',
            assignedTo: allUsers[0]?.id || 0,
            questions: [],
        }]);
    };

    const updateSection = (tempId: string, field: 'title' | 'assignedTo', value: string | number) => {
        setSections(sections.map(s => s.tempId === tempId ? { ...s, [field]: value } : s));
    };
    
    const removeSection = (tempId: string) => {
        if (confirm('Are you sure you want to delete this section?')) {
            setSections(sections.filter(s => s.tempId !== tempId));
        }
    };

    const addQuestion = (sectionTempId: string) => {
        const newQuestion: TempQuestion = {
            tempId: `question-${Date.now()}`,
            text: '',
            type: 'short-answer',
            options: [],
            required: false,
        };
        setSections(sections.map(s =>
            s.tempId === sectionTempId ? { ...s, questions: [...s.questions, newQuestion] } : s
        ));
    };

    const updateQuestion = (sectionTempId: string, questionTempId: string, field: keyof TempQuestion, value: any) => {
        setSections(sections.map(s =>
            s.tempId === sectionTempId
                ? { ...s, questions: s.questions.map(q => q.tempId === questionTempId ? { ...q, [field]: value } : q) }
                : s
        ));
    };
    
    const removeQuestion = (sectionTempId: string, questionTempId: string) => {
        setSections(sections.map(s =>
            s.tempId === sectionTempId
                ? { ...s, questions: s.questions.filter(q => q.tempId !== questionTempId) }
                : s
        ));
    };

    const addOption = (sectionTempId: string, questionTempId: string) => {
        setSections(sections.map(s =>
            s.tempId === sectionTempId
                ? { ...s, questions: s.questions.map(q => q.tempId === questionTempId ? { ...q, options: [...q.options, ''] } : q) }
                : s
        ));
    };
    
    const updateOption = (sectionTempId: string, questionTempId: string, optionIndex: number, value: string) => {
        setSections(sections.map(s =>
            s.tempId === sectionTempId
                ? { ...s, questions: s.questions.map(q => q.tempId === questionTempId ? { ...q, options: q.options.map((opt, i) => i === optionIndex ? value : opt) } : q) }
                : s
        ));
    };
    
    const removeOption = (sectionTempId: string, questionTempId: string, optionIndex: number) => {
        setSections(sections.map(s =>
            s.tempId === sectionTempId
                ? { ...s, questions: s.questions.map(q => q.tempId === questionTempId ? { ...q, options: q.options.filter((_, i) => i !== optionIndex) } : q) }
                : s
        ));
    };

    const handleSave = () => {
        if (!title.trim()) {
            alert('Please provide a title for the form.');
            return;
        }
        if (sections.length === 0) {
            alert('Please add at least one section.');
            return;
        }

        const finalSections = sections.map(s => ({
            title: s.title,
            assignedTo: s.assignedTo,
            questions: s.questions.map(q => ({
                id: q.tempId, // Will be replaced by backend, but needed for now
                text: q.text,
                type: q.type,
                options: q.options.filter(opt => opt.trim() !== ''),
                required: q.required
            }))
        }));
        
        localStorage.removeItem(DRAFT_KEY);
        onSave({ title, sections: finalSections });
    };

    const handleCancel = () => {
        localStorage.removeItem(DRAFT_KEY);
        onCancel();
    };

    // Drag and Drop handlers
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, sectionTempId: string) => {
        e.dataTransfer.effectAllowed = 'move';
        setDraggedSectionId(sectionTempId);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault(); // Necessary to allow dropping.
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetSectionTempId: string) => {
        e.preventDefault();
        if (!draggedSectionId || draggedSectionId === targetSectionTempId) {
            return;
        }

        const newSections = [...sections];
        const draggedIndex = newSections.findIndex(s => s.tempId === draggedSectionId);
        const targetIndex = newSections.findIndex(s => s.tempId === targetSectionTempId);

        if (draggedIndex === -1 || targetIndex === -1) return;

        const [draggedItem] = newSections.splice(draggedIndex, 1);
        newSections.splice(targetIndex, 0, draggedItem);

        setSections(newSections);
    };

    const handleDragEnd = () => {
        setDraggedSectionId(null);
    };

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
            <header className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-slate-900">Create New Form</h1>
                <div className="flex gap-4">
                    <button onClick={handleCancel} className="px-4 py-2 text-sm font-semibold text-slate-800 backdrop-blur-md bg-white/30 border border-white/40 shadow-sm hover:bg-white/40 hover:shadow-md rounded-xl transition-all duration-300">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 text-sm font-semibold text-white backdrop-blur-md bg-sky-600/80 border border-sky-600/90 shadow-lg hover:bg-sky-700/80 hover:shadow-xl rounded-xl transition-all duration-300">Save Form</button>
                </div>
            </header>

            <div className="space-y-8">
                <div className="backdrop-blur-xl bg-white/50 p-6 rounded-2xl shadow-lg border border-white/60">
                    <label htmlFor="form-title" className="block text-sm font-medium text-slate-700">Form Title</label>
                    <input
                        type="text"
                        id="form-title"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        className="mt-1 block w-full text-lg p-2 border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500"
                        placeholder="e.g., Quarterly Performance Review"
                    />
                </div>

                {sections.map((section, sectionIndex) => (
                    <div 
                        key={section.tempId} 
                        className={`backdrop-blur-xl bg-white/50 p-6 rounded-2xl shadow-lg border border-white/60 transition-opacity ${draggedSectionId === section.tempId ? 'opacity-50' : 'opacity-100'}`}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, section.tempId)}
                    >
                        <div 
                            className="flex justify-between items-center pb-4 border-b"
                        >
                            <div 
                                className="flex items-center gap-3 flex-grow cursor-move"
                                draggable
                                onDragStart={(e) => handleDragStart(e, section.tempId)}
                                onDragEnd={handleDragEnd}
                            >
                                <span className="text-slate-400 hover:text-slate-600" title="Drag to reorder section">
                                    <GripVerticalIcon className="w-6 h-6" />
                                </span>
                                <h2 className="text-xl font-semibold text-slate-800">Section {sectionIndex + 1}</h2>
                            </div>
                            <button onClick={() => removeSection(section.tempId)} className="p-2 text-red-500 hover:bg-red-100 rounded-full"><TrashIcon className="w-5 h-5"/></button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                                <label htmlFor={`section-title-${section.tempId}`} className="block text-sm font-medium text-slate-700">Section Title</label>
                                <input
                                    type="text"
                                    id={`section-title-${section.tempId}`}
                                    value={section.title}
                                    onChange={e => updateSection(section.tempId, 'title', e.target.value)}
                                    className="mt-1 block w-full p-2 border border-slate-300 rounded-md shadow-sm"
                                    placeholder="e.g., Marketing Goals"
                                />
                            </div>
                            <div>
                                <label htmlFor={`section-assignee-${section.tempId}`} className="block text-sm font-medium text-slate-700">Assign To</label>
                                <select
                                    id={`section-assignee-${section.tempId}`}
                                    value={section.assignedTo}
                                    onChange={e => updateSection(section.tempId, 'assignedTo', parseInt(e.target.value))}
                                    className="mt-1 block w-full p-2 border border-slate-300 rounded-md shadow-sm bg-white"
                                >
                                    {allUsers.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="mt-6 space-y-4">
                            <h3 className="text-lg font-semibold text-slate-700">Questions</h3>
                            {section.questions.map((q, qIndex) => (
                                <div key={q.tempId} className="p-4 border rounded-md bg-white/50">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-grow pr-4">
                                            <input
                                                type="text"
                                                value={q.text}
                                                onChange={e => updateQuestion(section.tempId, q.tempId, 'text', e.target.value)}
                                                placeholder={`Question ${qIndex + 1}`}
                                                className="w-full p-2 border-b border-slate-200 focus:border-sky-500 outline-none bg-transparent"
                                            />
                                            <div className="mt-4">
                                                {(q.type === 'multiple-choice' || q.type === 'checkboxes') && (
                                                    <div className="space-y-2">
                                                        {q.options.map((opt, optIndex) => (
                                                            <div key={optIndex} className="flex items-center gap-2">
                                                                <input
                                                                    type="text"
                                                                    value={opt}
                                                                    onChange={e => updateOption(section.tempId, q.tempId, optIndex, e.target.value)}
                                                                    className="w-full text-sm p-1 border border-slate-300 rounded-md"
                                                                    placeholder={`Option ${optIndex + 1}`}
                                                                />
                                                                <button onClick={() => removeOption(section.tempId, q.tempId, optIndex)} className="p-1 text-slate-400 hover:text-red-500"><TrashIcon className="w-4 h-4"/></button>
                                                            </div>
                                                        ))}
                                                        <button onClick={() => addOption(section.tempId, q.tempId)} className="text-sm text-sky-800 hover:text-sky-900 flex items-center gap-1"><PlusIcon className="w-4 h-4"/> Add Option</button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <select
                                                value={q.type}
                                                onChange={e => updateQuestion(section.tempId, q.tempId, 'type', e.target.value as QuestionType)}
                                                className="text-sm p-2 border border-slate-300 rounded-md shadow-sm bg-white"
                                            >
                                                <option value="short-answer">Short Answer</option>
                                                <option value="paragraph">Paragraph</option>
                                                <option value="multiple-choice">Multiple Choice</option>
                                                <option value="checkboxes">Checkboxes</option>
                                                <option value="signature">Signature</option>
                                            </select>
                                            <button onClick={() => removeQuestion(section.tempId, q.tempId)} className="p-2 text-slate-400 hover:text-red-500 rounded-full hover:bg-red-50"><TrashIcon className="w-5 h-5"/></button>
                                        </div>
                                    </div>
                                    <div className="flex justify-end mt-2">
                                        <label className="flex items-center text-sm">
                                            <input
                                                type="checkbox"
                                                checked={q.required}
                                                onChange={e => updateQuestion(section.tempId, q.tempId, 'required', e.target.checked)}
                                                className="h-4 w-4 text-sky-700 border-slate-300 rounded focus:ring-sky-500"
                                            />
                                            <span className="ml-2 text-slate-600">Required</span>
                                        </label>
                                    </div>
                                </div>
                            ))}
                            <button onClick={() => addQuestion(section.tempId)} className="w-full text-center p-2 mt-4 border-2 border-dashed border-slate-400/50 text-slate-500 rounded-lg hover:bg-white/30 hover:border-slate-400/80 transition-colors flex items-center justify-center gap-2">
                                <PlusIcon className="w-5 h-5" /> Add Question
                            </button>
                        </div>
                    </div>
                ))}

                <button onClick={addSection} className="w-full text-center p-3 mt-4 backdrop-blur-md bg-sky-500/20 border border-sky-500/30 text-sky-800 font-semibold rounded-xl hover:bg-sky-500/30 transition-colors flex items-center justify-center gap-2">
                    <PlusIcon className="w-5 h-5" /> Add Section
                </button>
            </div>
        </div>
    );
};

export default FormBuilder;
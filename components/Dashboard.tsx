import React, { useState, useMemo } from 'react';
import { User, Form, Section, Response, Notification, FormStatus } from '../types';
import FormView from './FormView';
import { LogOutIcon, FileIcon, PlusIcon, UsersIcon, CheckCircleIcon, ArchiveIcon, TrashIcon, BellIcon, EditIcon, EyeIcon } from './icons';
import FormBuilder from './FormBuilder';
import UserManagement from './UserManagement';
import ProfileView from './ProfileView';
import TrashView from './TrashView';
import UserIcon from './UserIcon';

interface DashboardProps {
  currentUser: User;
  onLogout: () => void;
  allUsers: User[];
  onCreateUser: (newUser: Omit<User, 'id' | 'color'>) => void;
  onUpdateUser: (updatedUser: User) => void;
  forms: Form[];
  sections: Section[];
  responses: Response[];
  setForms: React.Dispatch<React.SetStateAction<Form[]>>;
  setSections: React.Dispatch<React.SetStateAction<Section[]>>;
  setResponses: React.Dispatch<React.SetStateAction<Response[]>>;
  addNotification: (message: string) => void;
  onDeleteForm: (formId: number) => void;
  onRestoreForm: (formId: number) => void;
  onPermanentlyDeleteForm: (formId: number) => void;
  notifications: Notification[];
}

type DashboardView = 'dashboard' | 'formBuilder' | 'userManagement' | 'profile' | 'trash';

const Dashboard: React.FC<DashboardProps> = ({ 
  currentUser, onLogout, allUsers, onCreateUser, onUpdateUser,
  forms, sections, responses, setForms, setSections, setResponses,
  addNotification, onDeleteForm, onRestoreForm, onPermanentlyDeleteForm,
  notifications
}) => {
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [view, setView] = useState<DashboardView>('dashboard');
  const [editingForm, setEditingForm] = useState<Form | null>(null);
  const [previewingForm, setPreviewingForm] = useState<Form | null>(null);

  const handleSaveForm = (
    formData: { id?: number; title: string; sections: Omit<Section, 'id' | 'formId' | 'order'>[]; dueDate?: string },
    status: 'draft' | 'published'
  ) => {
    if (formData.id) { // Update existing form
        setForms(prev => prev.map(f => f.id === formData.id ? { ...f, title: formData.title, dueDate: formData.dueDate, status } : f));
        
        const oldSectionIds = sections.filter(s => s.formId === formData.id).map(s => s.id);
        const remainingSections = sections.filter(s => s.formId !== formData.id);
        const remainingResponses = responses.filter(r => !oldSectionIds.includes(r.sectionId));
        
        let lastSectionId = Math.max(0, ...sections.map(s => s.id));
        const newSections: Section[] = formData.sections.map((sectionData, index) => ({
            ...(sectionData as any),
            id: ++lastSectionId,
            formId: formData.id!,
            order: index + 1,
        }));

        let lastResponseId = Math.max(0, ...responses.map(r => r.id));
        const newResponses: Response[] = newSections.map(s => ({
            id: ++lastResponseId,
            sectionId: s.id,
            content: {},
            filledBy: s.assignedTo,
            status: 'pending',
        }));

        setSections([...remainingSections, ...newSections]);
        setResponses([...remainingResponses, ...newResponses]);
        addNotification(`Form "${formData.title}" has been updated.`);

    } else { // Create new form
        const newFormId = Math.max(0, ...forms.map(f => f.id)) + 1;
        const createdForm: Form = {
            id: newFormId,
            title: formData.title,
            createdBy: currentUser.id,
            status: status,
            dueDate: formData.dueDate || undefined,
        };

        let lastSectionId = Math.max(0, ...sections.map(s => s.id));
        const newSections: Section[] = formData.sections.map((sectionData, index) => ({
            ...(sectionData as any),
            id: ++lastSectionId,
            formId: newFormId,
            order: index + 1,
        }));

        let lastResponseId = Math.max(0, ...responses.map(r => r.id));
        const newResponses: Response[] = newSections.map(s => ({
            id: ++lastResponseId,
            sectionId: s.id,
            content: {},
            filledBy: s.assignedTo,
            status: 'pending',
        }));
        
        setForms(prev => [...prev, createdForm]);
        setSections(prev => [...prev, ...newSections]);
        setResponses(prev => [...prev, ...newResponses]);
        addNotification(`Form "${formData.title}" created successfully.`);
    }

    setEditingForm(null);
    setView('dashboard');
  };

  const handlePublishForm = (formId: number) => {
    if (window.confirm('Are you sure you want to publish this form? It will become visible to assigned users.')) {
        setForms(prev => prev.map(f => f.id === formId ? { ...f, status: 'published' } : f));
        addNotification('Form published successfully.');
    }
  };

  const userVisibleForms = useMemo(() => {
    const publishedForms = forms.filter(f => f.status === 'published');
    if (currentUser.role === 'Admin' || currentUser.role === 'Viewer') {
      return publishedForms;
    }
    const userSections = sections.filter(s => s.assignedTo === currentUser.id);
    const formIds = [...new Set(userSections.map(s => s.formId))];
    return publishedForms.filter(f => formIds.includes(f.id));
  }, [currentUser, forms, sections]);
  
  const draftForms = useMemo(() => forms.filter(f => f.status === 'draft'), [forms]);
  const publishedForms = useMemo(() => forms.filter(f => f.status === 'published'), [forms]);


  if (selectedForm) {
    return (
      <FormView
        form={selectedForm}
        allSections={sections.filter(s => s.formId === selectedForm.id)}
        allResponses={responses}
        setResponses={setResponses}
        currentUser={currentUser}
        allUsers={allUsers}
        onBack={() => setSelectedForm(null)}
        addNotification={addNotification}
      />
    );
  }

  if (previewingForm) {
    return (
        <FormView
            isPreview={true}
            form={previewingForm}
            allSections={sections.filter(s => s.formId === previewingForm.id)}
            allResponses={[]} // No responses needed for a structural preview
            setResponses={() => {}}
            currentUser={currentUser}
            allUsers={allUsers}
            onBack={() => setPreviewingForm(null)}
            addNotification={() => {}}
        />
    );
  }
  
  if (view === 'formBuilder') {
      return (
          <FormBuilder 
            allUsers={allUsers.filter(u => u.role === 'User' || u.id === currentUser.id)}
            onSave={handleSaveForm}
            onCancel={() => { setEditingForm(null); setView('dashboard'); }}
            formToEdit={editingForm}
            sectionsForForm={editingForm ? sections.filter(s => s.formId === editingForm.id) : []}
            responses={responses}
          />
      );
  }

  if (view === 'userManagement') {
    return (
      <UserManagement
        currentUser={currentUser}
        allUsers={allUsers}
        onCreateUser={onCreateUser}
        onUpdateUser={onUpdateUser}
        onBack={() => setView('dashboard')}
      />
    );
  }

  if (view === 'profile') {
      return (
          <ProfileView
            currentUser={currentUser}
            onUpdateUser={onUpdateUser}
            onBack={() => setView('dashboard')}
          />
      )
  }

  if (view === 'trash') {
    return (
      <TrashView
        deletedForms={forms.filter(f => f.status === 'deleted')}
        onRestore={onRestoreForm}
        onDeletePermanently={onPermanentlyDeleteForm}
        onBack={() => setView('dashboard')}
        allUsers={allUsers}
      />
    )
  }

  const formsForCurrentUser = currentUser.role === 'Admin' ? publishedForms : userVisibleForms;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
             <div className="p-2 backdrop-blur-md bg-white/40 border border-white/50 shadow-md rounded-xl flex items-center justify-center">
              <img 
                src="https://choiceshomes.co.uk/wp-content/uploads/2019/12/Choices-Logo-Transparent-300x168.png" 
                alt="Choices Home for Children Logo" 
                className="h-12"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Welcome, {currentUser.name.split(' ')[0]}</h1>
              <p className="text-slate-600 mt-1">Here are the forms available to you.</p>
            </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          {currentUser.role === 'Admin' && (
            <>
              <button
                onClick={() => { setEditingForm(null); setView('formBuilder'); }}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md bg-lime-500/80 border border-lime-500/90 shadow-lg hover:bg-lime-600/80 hover:shadow-xl rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lime-500/80"
              >
                  <PlusIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">New Form</span>
              </button>
              <button
                onClick={() => setView('userManagement')}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md bg-sky-600/80 border border-sky-600/90 shadow-lg hover:bg-sky-700/80 hover:shadow-xl rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500/80"
              >
                  <UsersIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Manage Users</span>
              </button>
              <button
                onClick={() => setView('trash')}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-800 backdrop-blur-md bg-white/30 border border-white/40 shadow-sm hover:bg-white/40 hover:shadow-md rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500/80"
              >
                  <ArchiveIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Trash</span>
              </button>
            </>
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
            onClick={() => setView('profile')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-800 backdrop-blur-md bg-white/30 border border-white/40 shadow-sm hover:bg-white/40 hover:shadow-md rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500/80"
          >
            <UserIcon name={currentUser.name} color={currentUser.color} className="w-6 h-6" />
            <span className="hidden sm:inline">My Profile</span>
          </button>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md bg-sky-600/80 border border-sky-600/90 shadow-lg hover:bg-sky-700/80 hover:shadow-xl rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500/80"
          >
            <LogOutIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>
      
      <main className="space-y-12">
        {currentUser.role === 'Admin' && (
            <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Drafts ({draftForms.length})</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {draftForms.map(form => {
                        const creator = allUsers.find(u => u.id === form.createdBy);
                        return (
                            <div key={form.id} className="relative group backdrop-blur-md bg-white/40 p-6 rounded-2xl border border-white/50 shadow-lg flex flex-col justify-between">
                                <div>
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="p-3 bg-amber-100 rounded-lg">
                                            <FileIcon className="w-6 h-6 text-amber-700" />
                                        </div>
                                        <span className="text-xs font-semibold text-amber-800 bg-amber-200 px-2 py-1 rounded-full">DRAFT</span>
                                    </div>
                                    <h3 className="text-xl font-semibold text-slate-800 truncate">{form.title}</h3>
                                    {creator && <p className="text-xs text-slate-500 mt-1">Created by: {creator.name}</p>}
                                </div>
                                <div className="mt-6 flex justify-end gap-2 border-t pt-4">
                                    <button onClick={() => onDeleteForm(form.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors" title="Move to Trash"><TrashIcon className="w-5 h-5"/></button>
                                    <button onClick={(e) => { e.stopPropagation(); setPreviewingForm(form); }} className="p-2 text-sky-600 hover:bg-sky-100 rounded-lg transition-colors" title="Preview Form"><EyeIcon className="w-5 h-5"/></button>
                                    <button onClick={() => { setEditingForm(form); setView('formBuilder'); }} className="p-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors" title="Edit Form"><EditIcon className="w-5 h-5"/></button>
                                    <button onClick={() => handlePublishForm(form.id)} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md bg-lime-500/80 border border-lime-500/90 shadow-lg hover:bg-lime-600/80 rounded-xl transition-all" title="Publish Form">
                                        <CheckCircleIcon className="w-4 h-4"/> Publish
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        )}
        
        <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Published Forms ({formsForCurrentUser.length})</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {formsForCurrentUser.map(form => {
                    const formSections = sections.filter(s => s.formId === form.id);
                    const formResponses = responses.filter(r => formSections.some(fs => fs.id === r.sectionId));
                    const creator = allUsers.find(u => u.id === form.createdBy);
                    
                    const completedCount = formResponses.filter(r => r.status === 'completed').length;
                    const progress = formSections.length > 0 ? (completedCount / formSections.length) * 100 : 0;
                    const isComplete = progress === 100;
                    
                    return (
                    <div
                        key={form.id}
                        onClick={() => setSelectedForm(form)}
                        className="relative group backdrop-blur-md bg-white/40 p-6 rounded-2xl border border-white/50 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between"
                    >
                        {currentUser.role === 'Admin' && (
                             <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setPreviewingForm(form);
                                    }}
                                    className="p-2 backdrop-blur-sm bg-white/30 rounded-full text-sky-700 hover:bg-sky-500/30 transition-all"
                                    title="Preview Form"
                                >
                                    <EyeIcon className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingForm(form);
                                        setView('formBuilder');
                                    }}
                                    className="p-2 backdrop-blur-sm bg-white/30 rounded-full text-slate-700 hover:bg-slate-500/30 transition-all"
                                    title="Edit Form"
                                >
                                    <EditIcon className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteForm(form.id);
                                    }}
                                    className="p-2 backdrop-blur-sm bg-white/30 rounded-full text-red-700 hover:bg-red-500/30 transition-all"
                                    title="Move to Trash"
                                >
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                        <div>
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-sky-100 rounded-lg">
                                <FileIcon className="w-6 h-6 text-sky-700" />
                            </div>
                            {isComplete && <span title="Form Completed"><CheckCircleIcon className="w-6 h-6 text-lime-500" /></span>}
                        </div>
                        <h3 className="text-xl font-semibold text-slate-800 truncate">{form.title}</h3>
                        {creator && <p className="text-xs text-slate-500 mt-1">Created by: {creator.name}</p>}
                        </div>
                        
                        <div className="mt-4">
                        <div className="flex justify-between items-center mb-1 text-sm text-slate-600">
                            <span>Progress</span>
                            <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2.5">
                            <div className={`${isComplete ? 'bg-lime-500' : 'bg-sky-800'} h-2.5 rounded-full transition-all duration-500`} style={{ width: `${progress}%` }}></div>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">{completedCount} of {formSections.length} sections completed</p>
                        </div>
                    </div>
                    );
                })}
            </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
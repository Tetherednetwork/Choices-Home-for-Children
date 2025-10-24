import React, { useState, useMemo } from 'react';
import { User, Form, Section, Response, Notification } from '../types';
import FormView from './FormView';
import { LogOutIcon, FileIcon, PlusIcon, UsersIcon, CheckCircleIcon, ArchiveIcon, TrashIcon, BellIcon } from './icons';
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

  const handleSaveNewForm = (newForm: { title: string; sections: Omit<Section, 'id' | 'formId' | 'order'>[] }) => {
    const newFormId = Math.max(0, ...forms.map(f => f.id)) + 1;
    const createdForm: Form = {
        id: newFormId,
        title: newForm.title,
        createdBy: currentUser.id,
        status: 'active',
    };

    let lastSectionId = Math.max(0, ...sections.map(s => s.id));
    const newSections: Section[] = newForm.sections.map((sectionData, index) => ({
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
    setView('dashboard');
  };

  const userVisibleForms = useMemo(() => {
    const activeForms = forms.filter(f => f.status === 'active');
    if (currentUser.role === 'Admin' || currentUser.role === 'Viewer') {
      return activeForms;
    }
    const userSections = sections.filter(s => s.assignedTo === currentUser.id);
    const formIds = [...new Set(userSections.map(s => s.formId))];
    return activeForms.filter(f => formIds.includes(f.id));
  }, [currentUser, forms, sections]);

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
  
  if (view === 'formBuilder') {
      return (
          <FormBuilder 
            allUsers={allUsers.filter(u => u.role === 'User' || u.id === currentUser.id)}
            onSave={handleSaveNewForm}
            onCancel={() => setView('dashboard')}
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
                onClick={() => setView('formBuilder')}
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
      
      <main>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {userVisibleForms.map(form => {
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
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDeleteForm(form.id);
                        }}
                        className="absolute top-4 right-4 p-2 backdrop-blur-sm bg-white/30 rounded-full text-red-700 hover:bg-red-500/30 transition-all opacity-0 group-hover:opacity-100"
                        title="Move to Trash"
                    >
                        <TrashIcon className="w-5 h-5" />
                    </button>
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
      </main>
    </div>
  );
};

export default Dashboard;
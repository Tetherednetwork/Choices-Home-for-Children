import React, { useState, useEffect, useRef, useMemo } from 'react';
import { User, Form, Section, Response, Notification, DashboardView } from './types';
import LoginScreen from './components/LoginScreen';
import Dashboard, { DashboardHandle } from './components/Dashboard';
import { initialUsers, initialForms, initialSections, initialResponses } from './data/mockData';
import NotificationContainer from './components/NotificationContainer';
import Footer from './components/Footer';
import PublicFormView from './components/PublicFormView';
import Header from './components/Header';

const userColors = ['bg-sky-600', 'bg-lime-600', 'bg-amber-600', 'bg-violet-600', 'bg-rose-600', 'bg-teal-600'];

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sharedFormId, setSharedFormId] = useState<string | null>(null);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const dashboardRef = useRef<DashboardHandle>(null);

  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem('collaborative-forms-users');
      return saved ? JSON.parse(saved) : initialUsers;
    } catch {
      return initialUsers;
    }
  });
  const [forms, setForms] = useState<Form[]>(() => {
    try {
      const saved = localStorage.getItem('collaborative-forms-forms');
      return saved ? JSON.parse(saved) : initialForms;
    } catch {
      return initialForms;
    }
  });
  const [sections, setSections] = useState<Section[]>(() => {
    try {
      const saved = localStorage.getItem('collaborative-forms-sections');
      return saved ? JSON.parse(saved) : initialSections;
    } catch {
      return initialSections;
    }
  });
  const [responses, setResponses] = useState<Response[]>(() => {
    try {
      const saved = localStorage.getItem('collaborative-forms-responses');
      return saved ? JSON.parse(saved) : initialResponses;
    } catch {
      return initialResponses;
    }
  });
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const shareId = urlParams.get('share');
    if (shareId) {
        setSharedFormId(shareId);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('collaborative-forms-users', JSON.stringify(users));
  }, [users]);
  useEffect(() => {
    localStorage.setItem('collaborative-forms-forms', JSON.stringify(forms));
  }, [forms]);
  useEffect(() => {
    localStorage.setItem('collaborative-forms-sections', JSON.stringify(sections));
  }, [sections]);
  useEffect(() => {
    localStorage.setItem('collaborative-forms-responses', JSON.stringify(responses));
  }, [responses]);

  const addNotification = (message: string) => {
    const newNotification = {
        id: Date.now(),
        message,
    };
    setNotifications(prev => [...prev, newNotification]);
  };

  const handleLogin = (user: User) => {
    localStorage.setItem('collaborative-forms-last-user-id', user.id.toString());
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleNavigation = (view: DashboardView) => {
    dashboardRef.current?.setView(view);
  };

  const handleNewFormClick = () => {
    setIsTemplateModalOpen(true);
  };
  
  const handleCreateUser = (newUser: Omit<User, 'id' | 'color'>) => {
    setUsers(prevUsers => {
        const newId = Math.max(0, ...prevUsers.map(u => u.id)) + 1;
        const userWithId = { 
            ...newUser, 
            id: newId,
            color: userColors[newId % userColors.length]
        };
        return [...prevUsers, userWithId];
    });
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUsers(prevUsers => prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (currentUser?.id === updatedUser.id) {
        setCurrentUser(updatedUser);
    }
  };

  const handleDeleteForm = (formId: number) => {
    setForms(prevForms => prevForms.map(form =>
      form.id === formId ? { ...form, status: 'deleted' } : form
    ));
    addNotification('Form moved to trash.');
  };

  const handleRestoreForm = (formId: number) => {
    setForms(prevForms => prevForms.map(form =>
      form.id === formId ? { ...form, status: 'draft' } : form
    ));
    addNotification('Form restored as a draft.');
  };

  const handlePermanentlyDeleteForm = (formId: number) => {
    if (window.confirm('Are you sure? This will permanently delete the form and all its data. This action cannot be undone.')) {
      const sectionsToDelete = sections.filter(s => s.formId === formId).map(s => s.id);
      
      setForms(prev => prev.filter(f => f.id !== formId));
      setSections(prev => prev.filter(s => s.formId !== formId));
      setResponses(prev => prev.filter(r => !sectionsToDelete.includes(r.sectionId)));
      
      addNotification('Form permanently deleted.');
    }
  };

  const handleDuplicateDraft = (formId: number) => {
    const formToDuplicate = forms.find(f => f.id === formId);
    if (!formToDuplicate || formToDuplicate.status !== 'draft') {
      addNotification('Error: Only draft forms can be duplicated.');
      return;
    }
    
    const sectionsToDuplicate = sections.filter(s => s.formId === formId);

    const newFormId = Math.max(0, ...forms.map(f => f.id)) + 1;
    const newForm: Form = {
      ...formToDuplicate,
      id: newFormId,
      title: `Copy of ${formToDuplicate.title}`,
      status: 'draft',
      dueDate: undefined, // Duplicates are fresh drafts
    };
    
    let lastSectionId = Math.max(0, ...sections.map(s => s.id));
    const newSections: Section[] = sectionsToDuplicate.map((section, index) => ({
        ...section,
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

    setForms(prev => [...prev, newForm]);
    setSections(prev => [...prev, ...newSections]);
    setResponses(prev => [...prev, ...newResponses]);
    addNotification(`Draft "${formToDuplicate.title}" duplicated successfully.`);
  };

  const handleSaveAsTemplate = (formId: number) => {
    const formToTemplate = forms.find(f => f.id === formId);
    if (!formToTemplate || !currentUser) return;

    const sectionsToTemplate = sections.filter(s => s.formId === formId);

    const newTemplateId = Math.max(0, ...forms.map(f => f.id)) + 1;
    const newTemplate: Form = {
      id: newTemplateId,
      title: `[Template] ${formToTemplate.title}`,
      createdBy: currentUser.id,
      status: 'template',
    };

    let lastSectionId = Math.max(0, ...sections.map(s => s.id));
    const newSections: Section[] = sectionsToTemplate.map((section, index) => ({
      ...section,
      id: ++lastSectionId,
      formId: newTemplateId,
      order: index + 1,
    }));
    
    setForms(prev => [...prev, newTemplate]);
    setSections(prev => [...prev, ...newSections]);
    addNotification(`"${formToTemplate.title}" saved as a new template.`);
  };

  if (sharedFormId) {
    const formToShare = forms.find(f => f.shareId === sharedFormId && f.status === 'published');

    let content;
    if (formToShare) {
        content = (
            <PublicFormView
                form={formToShare}
                allSections={sections.filter(s => s.formId === formToShare.id)}
                allUsers={users}
            />
        );
    } else {
        content = (
             <div className="flex-grow flex items-center justify-center p-4">
                <div className="backdrop-blur-xl bg-white/50 p-8 rounded-2xl shadow-2xl border border-white/60 text-center">
                    <h1 className="text-2xl font-bold text-red-600">Form Not Found</h1>
                    <p className="text-slate-600 mt-2">The requested form could not be found or is no longer available for sharing.</p>
                    <a href={window.location.pathname} className="mt-6 inline-block px-4 py-2 text-sm font-semibold text-white bg-sky-600 rounded-xl shadow-md hover:bg-sky-700 transition-colors">
                        Go to Homepage
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen text-slate-800 flex flex-col">
            <Header currentUser={null} notifications={[]} onLogout={() => {}} onNavigate={() => {}} onNewFormClick={() => {}} />
            <main className="flex-grow flex flex-col">
                <NotificationContainer notifications={notifications} setNotifications={setNotifications} />
                {content}
            </main>
            <Footer />
        </div>
    );
  }

  const sortedUsersForLogin = useMemo(() => {
    const lastUserIdStr = localStorage.getItem('collaborative-forms-last-user-id');
    if (lastUserIdStr) {
      const lastUserId = parseInt(lastUserIdStr, 10);
      const lastUser = users.find(u => u.id === lastUserId);
      if (lastUser) {
        const otherUsers = users.filter(u => u.id !== lastUserId);
        return [lastUser, ...otherUsers];
      }
    }
    return users;
  }, [users]);


  return (
    <div className="min-h-screen text-slate-800 flex flex-col">
      <Header 
        currentUser={currentUser} 
        onLogout={handleLogout} 
        notifications={notifications}
        onNavigate={handleNavigation}
        onNewFormClick={handleNewFormClick}
      />
      <main className="flex-grow">
        <NotificationContainer notifications={notifications} setNotifications={setNotifications} />
        {currentUser ? (
          <Dashboard 
            ref={dashboardRef}
            currentUser={currentUser} 
            onLogout={handleLogout} 
            allUsers={users}
            onCreateUser={handleCreateUser}
            onUpdateUser={handleUpdateUser}
            forms={forms}
            sections={sections}
            responses={responses}
            setForms={setForms}
            setSections={setSections}
            setResponses={setResponses}
            addNotification={addNotification}
            onDeleteForm={handleDeleteForm}
            onRestoreForm={handleRestoreForm}
            onPermanentlyDeleteForm={handlePermanentlyDeleteForm}
            notifications={notifications}
            onDuplicateDraft={handleDuplicateDraft}
            onSaveAsTemplate={handleSaveAsTemplate}
            isTemplateModalOpen={isTemplateModalOpen}
            setIsTemplateModalOpen={setIsTemplateModalOpen}
          />
        ) : (
          <LoginScreen users={sortedUsersForLogin} onLogin={handleLogin} />
        )}
      </main>
      <Footer />
    </div>
  );
};

export default App;
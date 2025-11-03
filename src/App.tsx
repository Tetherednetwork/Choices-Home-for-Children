
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { User, Form, Section, Response, Notification, DashboardView } from './types';
import LoginScreen from './components/LoginScreen';
import Dashboard, { DashboardHandle } from './components/Dashboard';
import NotificationContainer from './components/NotificationContainer';
import Footer from './components/Footer';
import PublicFormView from './components/PublicFormView';
import Header from './components/Header';

// --- Supabase Client Setup ---
const supabaseUrl = 'https://uvgcvasoiqhmwblvpvcd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2Z2N2YXNvaXFobXdibHZwdmNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMDY5OTMsImV4cCI6MjA3Njg4Mjk5M30.13_FYJrdQ4h73PSGdvpRU1wA8EsLZRok2oX_Rnw874g';
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const userColors = [
    'bg-sky-600', 'bg-lime-600', 'bg-amber-600', 'bg-violet-600', 
    'bg-rose-600', 'bg-teal-600', 'bg-cyan-600', 'bg-fuchsia-600',
    'bg-emerald-600', 'bg-indigo-600'
];

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sharedFormId, setSharedFormId] = useState<string | null>(null);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const dashboardRef = useRef<DashboardHandle>(null);

  const [users, setUsers] = useState<User[]>([]);
  const [forms, setForms] = useState<Form[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [responses, setResponses] = useState<Response[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (message: string) => {
    const newNotification = {
        id: Date.now(),
        message,
    };
    setNotifications(prev => [...prev, newNotification]);
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const shareId = urlParams.get('share');
    if (shareId) {
        setSharedFormId(shareId);
    }

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const results = await Promise.all([
                supabase.from('users').select('*').order('id', { ascending: true }),
                supabase.from('forms').select('*'),
                supabase.from('sections').select('*'),
                supabase.from('responses').select('*'),
            ]);

            const errors = results.map(r => r.error).filter(Boolean);
            if (errors.length > 0) {
                errors.forEach(error => console.error("Supabase fetch error:", error.message));
                const errorMessages = errors.map(e => e!.message).join('; ');
                throw new Error(errorMessages);
            }

            const [
                { data: usersData },
                { data: formsData },
                { data: sectionsData },
                { data: responsesData },
            ] = results;
            
            setUsers(usersData || []);
            setForms(formsData || []);
            setSections(sectionsData || []);
            setResponses(responsesData || []);
        } catch (error: any) {
            console.error("Error fetching data:", error);
            addNotification(`Failed to load data: ${error.message}. Please check your Supabase setup (tables, RLS policies) and refresh.`);
        } finally {
            setIsLoading(false);
        }
    };

    fetchData();
  }, []);

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
  
  const handleCreateUser = async (newUser: Omit<User, 'id' | 'color'>) => {
    const nextId = Math.max(0, ...users.map(u => u.id)) + 1;
    const userWithColor = {
        ...newUser,
        color: userColors[nextId % userColors.length]
    };
    
    const { data, error } = await supabase.from('users').insert(userWithColor).select();
    
    if (error) {
        addNotification(`Error creating user: ${error.message}`);
        return;
    }

    if(data) {
        setUsers(prev => [...prev, data[0]]);
        addNotification(`User "${data[0].name}" created successfully.`);
    }
  };

  const handleUpdateUser = async (updatedUser: User) => {
    const { error } = await supabase.from('users').update({
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        pin: updatedUser.pin
    }).eq('id', updatedUser.id);
    
    if (error) {
        addNotification(`Error updating user: ${error.message}`);
        return;
    }

    setUsers(prevUsers => prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (currentUser?.id === updatedUser.id) {
        setCurrentUser(updatedUser);
    }
    addNotification(`User "${updatedUser.name}" updated.`);
  };

  const handleUpdateResponse = async (updatedResponse: Response) => {
      const { error } = await supabase
          .from('responses')
          .update({ content: updatedResponse.content, status: updatedResponse.status, filledBy: updatedResponse.filledBy })
          .eq('id', updatedResponse.id);
      
      if (error) {
          addNotification(`Error submitting section: ${error.message}`);
          return;
      }
      
      const newResponses = responses.map(r => r.id === updatedResponse.id ? updatedResponse : r);
      setResponses(newResponses);

      const completedSection = sections.find(s => s.id === updatedResponse.sectionId);
      if (!completedSection) return;

      const form = forms.find(f => f.id === completedSection.formId);

      addNotification(`${currentUser?.name} completed the "${completedSection.title}" section in "${form?.title}".`);

      const sortedSections = [...sections.filter(s => s.formId === completedSection.formId)].sort((a, b) => a.order - b.order);
      const currentSectionIndex = sortedSections.findIndex(s => s.id === completedSection.id);
      const nextSection = sortedSections[currentSectionIndex + 1];

      if (nextSection) {
          const nextUser = users.find(u => u.id === nextSection.assignedTo);
          const nextResponse = newResponses.find(r => r.sectionId === nextSection.id);
          if (nextUser && nextUser.id !== currentUser?.id && nextResponse?.status === 'pending') {
              addNotification(`Hi ${nextUser.name.split(' ')[0]}, "${completedSection.title}" is complete. It's your turn for "${nextSection.title}".`);
          }
      }

      const sectionsForThisFormIds = sortedSections.map(s => s.id);
      const completedCount = newResponses.filter(r => sectionsForThisFormIds.includes(r.sectionId) && r.status === 'completed').length;
      
      if (completedCount === sortedSections.length && sortedSections.length > 0) {
          addNotification(`🎉 The form "${form?.title}" is now fully completed!`);
      }
  };


  const handleDeleteForm = async (formId: number) => {
    const { error } = await supabase.from('forms').update({ status: 'deleted' }).eq('id', formId);
    if (error) {
        addNotification(`Error deleting form: ${error.message}`);
        return;
    }
    setForms(prevForms => prevForms.map(form =>
      form.id === formId ? { ...form, status: 'deleted' } : form
    ));
    addNotification('Form moved to trash.');
  };

  const handleRestoreForm = async (formId: number) => {
    const { error } = await supabase.from('forms').update({ status: 'draft' }).eq('id', formId);
    if (error) {
        addNotification(`Error restoring form: ${error.message}`);
        return;
    }
    setForms(prevForms => prevForms.map(form =>
      form.id === formId ? { ...form, status: 'draft' } : form
    ));
    addNotification('Form restored as a draft.');
  };

  const handlePermanentlyDeleteForm = async (formId: number) => {
    if (window.confirm('Are you sure? This will permanently delete the form and all its data. This action cannot be undone.')) {
      const sectionsToDelete = sections.filter(s => s.formId === formId).map(s => s.id);
      if (sectionsToDelete.length > 0) {
        const { error: responseError } = await supabase.from('responses').delete().in('sectionId', sectionsToDelete);
        if (responseError) {
          addNotification(`Error deleting responses: ${responseError.message}`);
          return;
        }
      }
      const { error: sectionError } = await supabase.from('sections').delete().eq('formId', formId);
      if (sectionError) {
        addNotification(`Error deleting sections: ${sectionError.message}`);
        return;
      }
      const { error: formError } = await supabase.from('forms').delete().eq('id', formId);
      if (formError) {
        addNotification(`Error deleting form: ${formError.message}`);
        return;
      }
      
      setForms(prev => prev.filter(f => f.id !== formId));
      setSections(prev => prev.filter(s => s.formId !== formId));
      setResponses(prev => prev.filter(r => !sectionsToDelete.includes(r.sectionId)));
      
      addNotification('Form permanently deleted.');
    }
  };

  const handleDuplicateDraft = async (formId: number) => {
    const formToDuplicate = forms.find(f => f.id === formId);
    if (!formToDuplicate || formToDuplicate.status !== 'draft' || !currentUser) {
      addNotification('Error: Only draft forms can be duplicated.');
      return;
    }
    
    const sectionsToDuplicate = sections.filter(s => s.formId === formId);

    const { data: newFormData, error: formError } = await supabase.from('forms').insert({
      title: `Copy of ${formToDuplicate.title}`,
      createdBy: currentUser.id,
      status: 'draft',
      dueDate: undefined,
    }).select();

    if (formError || !newFormData) {
        addNotification(`Error duplicating form: ${formError?.message}`);
        return;
    }
    const newForm = newFormData[0];

    const newSectionsPayload = sectionsToDuplicate.map((section, index) => ({
        formId: newForm.id,
        title: section.title,
        assignedTo: section.assignedTo,
        order: index + 1,
        questions: section.questions
    }));
    
    const { data: newSectionsData, error: sectionError } = await supabase.from('sections').insert(newSectionsPayload).select();
    
    if (sectionError || !newSectionsData) {
        addNotification(`Error duplicating sections: ${sectionError?.message}`);
        await supabase.from('forms').delete().eq('id', newForm.id); // Rollback
        return;
    }

    const newResponsesPayload = newSectionsData.map(s => ({
        sectionId: s.id,
        content: {},
        filledBy: s.assignedTo,
        status: 'pending',
    }));

    const { data: newResponsesData, error: responseError } = await supabase.from('responses').insert(newResponsesPayload).select();

    if (responseError || !newResponsesData) {
        addNotification(`Error creating responses: ${responseError.message}`);
        // Rollback...
        return;
    }

    setForms(prev => [...prev, newForm]);
    setSections(prev => [...prev, ...newSectionsData]);
    setResponses(prev => [...prev, ...newResponsesData]);
    addNotification(`Draft "${formToDuplicate.title}" duplicated successfully.`);
  };

  const handleSaveAsTemplate = async (formId: number) => {
    const formToTemplate = forms.find(f => f.id === formId);
    if (!formToTemplate || !currentUser) return;

    const sectionsToTemplate = sections.filter(s => s.formId === formId);

    const { data: newTemplateData, error: formError } = await supabase.from('forms').insert({
      title: `[Template] ${formToTemplate.title}`,
      createdBy: currentUser.id,
      status: 'template',
    }).select();

    if (formError || !newTemplateData) {
        addNotification(`Error creating template: ${formError?.message}`);
        return;
    }
    const newTemplate = newTemplateData[0];

    const newSectionsPayload = sectionsToTemplate.map((section, index) => ({
      formId: newTemplate.id,
      title: section.title,
      assignedTo: section.assignedTo,
      order: index + 1,
      questions: section.questions
    }));

    const { data: newSectionsData, error: sectionError } = await supabase.from('sections').insert(newSectionsPayload).select();

    if (sectionError || !newSectionsData) {
        addNotification(`Error creating template sections: ${sectionError?.message}`);
        await supabase.from('forms').delete().eq('id', newTemplate.id); // Rollback
        return;
    }

    setForms(prev => [...prev, newTemplate]);
    setSections(prev => [...prev, ...newSectionsData]);
    addNotification(`"${formToTemplate.title}" saved as a new template.`);
  };

  if (isLoading) {
      return (
          <div className="flex items-center justify-center h-screen text-xl font-semibold text-slate-700">
              Loading Collaborative Forms...
          </div>
      )
  }

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
            onUpdateResponse={handleUpdateResponse}
            addNotification={addNotification}
            onDeleteForm={handleDeleteForm}
            onRestoreForm={handleRestoreForm}
            onPermanentlyDeleteForm={handlePermanentlyDeleteForm}
            notifications={notifications}
            onDuplicateDraft={handleDuplicateDraft}
            onSaveAsTemplate={handleSaveAsTemplate}
            isTemplateModalOpen={isTemplateModalOpen}
            setIsTemplateModalOpen={setIsTemplateModalOpen}
            setForms={setForms}
            setSections={setSections}
            setResponses={setResponses}
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


import React, { useState, useEffect } from 'react';
import { User, Form, Section, Response, Notification } from './types';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';
import { initialUsers, initialForms, initialSections, initialResponses } from './data/mockData';
import NotificationContainer from './components/NotificationContainer';
import Footer from './components/Footer';

const userColors = ['bg-sky-600', 'bg-lime-600', 'bg-amber-600', 'bg-violet-600', 'bg-rose-600', 'bg-teal-600'];

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

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
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
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
      form.id === formId ? { ...form, status: 'active' } : form
    ));
    addNotification('Form restored.');
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


  return (
    <div className="min-h-screen text-slate-800 flex flex-col">
      <main className="flex-grow">
        <NotificationContainer notifications={notifications} setNotifications={setNotifications} />
        {currentUser ? (
          <Dashboard 
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
          />
        ) : (
          <LoginScreen users={users} onLogin={handleLogin} />
        )}
      </main>
      <Footer />
    </div>
  );
};

export default App;

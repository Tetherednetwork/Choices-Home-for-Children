import React, { useState, useMemo, forwardRef, useImperativeHandle } from 'react';
import { User, Form, Section, Response, Notification, FormStatus, DashboardView } from '../types';
import FormView from './FormView';
import { PlusIcon, CheckCircleIcon, UsersIcon, ArchiveIcon, BellIcon, EditIcon, EyeIcon, CopyIcon, ClipboardCopyIcon, XIcon, SearchIcon, ShareIcon, TrashIcon, FileIcon, FileTextIcon } from './icons';
import FormBuilder from './FormBuilder';
import UserManagement from './UserManagement';
import ProfileView from './ProfileView';
import TrashView from './TrashView';
import UserIcon from './UserIcon';
import { supabase } from '../App';

interface DashboardProps {
  currentUser: User;
  onLogout: () => void;
  allUsers: User[];
  onCreateUser: (newUser: Omit<User, 'id' | 'color'>) => void;
  onUpdateUser: (updatedUser: User) => void;
  forms: Form[];
  sections: Section[];
  responses: Response[];
  onUpdateResponse: (updatedResponse: Response) => void;
  addNotification: (message: string) => void;
  onDeleteForm: (formId: number) => void;
  onRestoreForm: (formId: number) => void;
  onPermanentlyDeleteForm: (formId: number) => void;
  notifications: Notification[];
  onDuplicateDraft: (formId: number) => void;
  onSaveAsTemplate: (formId: number) => void;
  isTemplateModalOpen: boolean;
  setIsTemplateModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  // Props for new/updated forms
  setForms: React.Dispatch<React.SetStateAction<Form[]>>;
  setSections: React.Dispatch<React.SetStateAction<Section[]>>;
  setResponses: React.Dispatch<React.SetStateAction<Response[]>>;
}

export interface DashboardHandle {
    setView: (view: DashboardView) => void;
}

type FormProgressStatus = 'all' | 'completed' | 'inProgress' | 'overdue' | 'notStarted';

const TemplateModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  templates: Form[];
  onSelectTemplate: (template: Form) => void;
  onStartFromScratch: () => void;
}> = ({ isOpen, onClose, templates, onSelectTemplate, onStartFromScratch }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="backdrop-blur-xl bg-white/50 p-6 rounded-2xl shadow-2xl border border-white/60 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-slate-800">Create New Form</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200"><XIcon className="w-5 h-5"/></button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
          <div className="p-4 border-2 border-dashed border-slate-300 hover:border-sky-500 hover:bg-sky-50 rounded-lg flex flex-col items-center justify-center text-center cursor-pointer transition-colors" onClick={onStartFromScratch}>
            <PlusIcon className="w-10 h-10 text-sky-600 mb-2"/>
            <h4 className="font-semibold text-slate-800">Start from Scratch</h4>
            <p className="text-sm text-slate-500">Create a brand new form.</p>
          </div>
          {templates.length > 0 && (
            <div className="md:col-span-2 border-t pt-4 mt-2">
              <h4 className="font-semibold text-slate-800 mb-2 text-center">Or use a template</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {templates.map(template => (
                  <div key={template.id} className="p-3 border border-slate-200 bg-white/50 hover:border-sky-400 hover:shadow-md rounded-lg cursor-pointer transition-all" onClick={() => onSelectTemplate(template)}>
                    <p className="font-semibold text-slate-700 truncate">{template.title.replace(/\[Template\]\s*/i, '')}</p>
                    <p className="text-xs text-slate-500">Template</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const ShareModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    data: { formTitle: string; link: string } | null;
}> = ({ isOpen, onClose, data }) => {
    const [isCopied, setIsCopied] = useState(false);

    if (!isOpen || !data) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(data.link);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="backdrop-blur-xl bg-white/50 p-6 rounded-2xl shadow-2xl border border-white/60 w-full max-w-lg">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-slate-800">Share Form: {data.formTitle}</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200"><XIcon className="w-5 h-5"/></button>
                </div>
                <div>
                    <p className="text-sm text-slate-600 mb-2">Anyone with this link can view a read-only preview of the form.</p>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            readOnly
                            value={data.link}
                            className="w-full p-2 border border-slate-300 rounded-md bg-white/70"
                            onFocus={(e) => e.target.select()}
                        />
                        <button
                            onClick={handleCopy}
                            className={`flex items-center justify-center gap-2 px-4 py-2 w-32 font-semibold text-white rounded-xl shadow-lg transition-all duration-300 ${isCopied ? 'bg-lime-500/90 border-lime-600/90' : 'bg-sky-600/80 border-sky-600/90 hover:bg-sky-700/80'}`}
                        >
                            {isCopied ? (
                                <> <CheckCircleIcon className="w-5 h-5"/> Copied! </>
                            ) : (
                                <> <ClipboardCopyIcon className="w-5 h-5"/> Copy </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


const Dashboard = forwardRef<DashboardHandle, DashboardProps>(({ 
  currentUser, onLogout, allUsers, onCreateUser, onUpdateUser,
  forms, sections, responses, onUpdateResponse, 
  addNotification, onDeleteForm, onRestoreForm, onPermanentlyDeleteForm,
  notifications, onDuplicateDraft, onSaveAsTemplate, isTemplateModalOpen, setIsTemplateModalOpen,
  setForms, setSections, setResponses
}, ref) => {
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [view, setView] = useState<DashboardView>('published');
  const [editingForm, setEditingForm] = useState<Form | null>(null);
  const [previewingForm, setPreviewingForm] = useState<Form | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [creatorFilter, setCreatorFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<FormProgressStatus>('all');
  const [shareModalData, setShareModalData] = useState<{ formTitle: string; link: string } | null>(null);

  useImperativeHandle(ref, () => ({
      setView: (newView: DashboardView) => {
          setSelectedForm(null);
          setEditingForm(null);
          setPreviewingForm(null);
          setView(newView);
      }
  }));
  
  const handleSaveForm = async (
    formData: { id?: number; title: string; sections: Omit<Section, 'id' | 'formId' | 'order'>[]; dueDate?: string },
    status: 'draft' | 'published'
  ) => {
    if (formData.id) { // Update existing form
      const { error: formUpdateError } = await supabase.from('forms').update({ title: formData.title, dueDate: formData.dueDate || undefined, status }).eq('id', formData.id);
      if (formUpdateError) {
        addNotification(`Error updating form: ${formUpdateError.message}`);
        return;
      }

      const oldSectionIds = sections.filter(s => s.formId === formData.id).map(s => s.id);
      if(oldSectionIds.length > 0) {
        await supabase.from('responses').delete().in('sectionId', oldSectionIds);
        await supabase.from('sections').delete().eq('formId', formData.id);
      }
      
      const newSectionsPayload = formData.sections.map((sectionData, index) => ({
          ...sectionData,
          formId: formData.id!,
          order: index + 1,
      }));

      const { data: newSectionsData, error: sectionsError } = await supabase.from('sections').insert(newSectionsPayload).select();
      if(sectionsError || !newSectionsData) {
        addNotification(`Error saving sections: ${sectionsError?.message}`); return;
      }
      
      const newResponsesPayload = newSectionsData.map(s => ({ sectionId: s.id, content: {}, filledBy: s.assignedTo, status: 'pending' as const }));
      const { data: newResponsesData, error: responsesError } = await supabase.from('responses').insert(newResponsesPayload).select();
      if(responsesError || !newResponsesData) {
        addNotification(`Error creating responses: ${responsesError?.message}`); return;
      }

      setForms(prev => prev.map(f => f.id === formData.id ? { ...f, title: formData.title, dueDate: formData.dueDate, status } : f));
      setSections(prev => [...prev.filter(s => s.formId !== formData.id), ...newSectionsData]);
      setResponses(prev => [...prev.filter(r => !oldSectionIds.includes(r.sectionId)), ...newResponsesData]);

      addNotification(`Form "${formData.title}" has been updated.`);

    } else { // Create new form
        const { data: newFormData, error: formError } = await supabase.from('forms').insert({
          title: formData.title, createdBy: currentUser.id, status: status, dueDate: formData.dueDate || undefined
        }).select();

        if (formError || !newFormData) {
            addNotification(`Error creating form: ${formError?.message}`); return;
        }
        const createdForm = newFormData[0];
        
        const newSectionsPayload = formData.sections.map((sectionData, index) => ({ ...sectionData, formId: createdForm.id, order: index + 1 }));
        const { data: newSectionsData, error: sectionsError } = await supabase.from('sections').insert(newSectionsPayload).select();
        
        if (sectionsError || !newSectionsData) {
            addNotification(`Error saving sections: ${sectionsError?.message}`);
            await supabase.from('forms').delete().eq('id', createdForm.id); // Rollback
            return;
        }

        const newResponsesPayload = newSectionsData.map(s => ({ sectionId: s.id, content: {}, filledBy: s.assignedTo, status: 'pending' as const }));
        const { data: newResponsesData, error: responsesError } = await supabase.from('responses').insert(newResponsesPayload).select();

        if (responsesError || !newResponsesData) {
          addNotification(`Error creating responses: ${responsesError?.message}`);
          // More complex rollback needed in real app
          return;
        }
        
        setForms(prev => [...prev, createdForm]);
        setSections(prev => [...prev, ...newSectionsData]);
        setResponses(prev => [...prev, ...newResponsesData]);
        addNotification(`Form "${formData.title}" created successfully.`);
    }

    setEditingForm(null);
    setView(status === 'published' ? 'published' : 'drafts');
  };


  const handlePublishForm = async (formId: number) => {
    if (window.confirm('Are you sure you want to publish this form? It will become visible to assigned users.')) {
        const { error } = await supabase.from('forms').update({ status: 'published' }).eq('id', formId);
        if (error) {
          addNotification(`Error publishing form: ${error.message}`);
          return;
        }
        setForms(prev => prev.map(f => f.id === formId ? { ...f, status: 'published' } : f));
        addNotification('Form published successfully.');
    }
  };

  const handleShareForm = async (formId: number) => {
    const form = forms.find(f => f.id === formId);
    if (!form) return;

    let shareId = form.shareId;
    if (!shareId) {
        shareId = crypto.randomUUID();
        const { error } = await supabase.from('forms').update({ shareId }).eq('id', formId);
        if (error) {
          addNotification(`Could not generate share link: ${error.message}`);
          return;
        }
        setForms(prevForms => prevForms.map(f => f.id === formId ? { ...f, shareId } : f));
    }

    const link = `${window.location.origin}${window.location.pathname}?share=${shareId}`;
    setShareModalData({ formTitle: form.title, link });
  };

  const getFormStatus = (form: Form, formSections: Section[], formResponses: Response[]): Omit<FormProgressStatus, 'all'> => {
    if (form.status !== 'published') {
        return 'notStarted'; // Should not happen for this function's use case
    }
    const completedCount = formResponses.filter(r => r.status === 'completed').length;
    const progress = formSections.length > 0 ? (completedCount / formSections.length) * 100 : 0;

    if (progress === 100) return 'completed';

    const isOverdue = form.dueDate ? new Date() > new Date(form.dueDate) : false;
    if (isOverdue) return 'overdue';
    
    if (progress > 0) return 'inProgress';

    return 'notStarted';
  };

  const uniqueCreators = useMemo(() => {
    const creatorIds = [...new Set(forms.filter(f => f.status !== 'template').map(f => f.createdBy))];
    return allUsers.filter(u => creatorIds.includes(u.id));
  }, [forms, allUsers]);

  const filteredBaseForms = useMemo(() => {
    return forms.filter(form => {
        if (searchQuery && !form.title.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false;
        }

        if (currentUser.role === 'Admin' && creatorFilter !== 'all' && form.createdBy !== parseInt(creatorFilter)) {
            return false;
        }
        
        return true;
    });
  }, [forms, searchQuery, creatorFilter, currentUser.role]);


  const draftForms = useMemo(() => filteredBaseForms.filter(f => f.status === 'draft'), [filteredBaseForms]);
  const allTemplates = useMemo(() => filteredBaseForms.filter(f => f.status === 'template'), [filteredBaseForms]);

  const publishedForms = useMemo(() => {
    let basePublished = filteredBaseForms.filter(f => f.status === 'published');

    if (statusFilter !== 'all') {
        basePublished = basePublished.filter(form => {
            const formSections = sections.filter(s => s.formId === form.id);
            const formResponses = responses.filter(r => formSections.some(fs => fs.id === r.sectionId));
            const currentStatus = getFormStatus(form, formSections, formResponses);
            return currentStatus === statusFilter;
        });
    }

    if (currentUser.role === 'Admin' || currentUser.role === 'Viewer') {
      return basePublished;
    }

    const userSections = sections.filter(s => s.assignedTo === currentUser.id);
    const formIds = [...new Set(userSections.map(s => s.formId))];
    return basePublished.filter(f => formIds.includes(f.id));

  }, [filteredBaseForms, statusFilter, sections, responses, currentUser]);
  
  const handleStartFromScratch = () => {
    setEditingForm(null);
    setIsTemplateModalOpen(false);
    setView('formBuilder');
  };

  const handleStartFromTemplate = (template: Form) => {
    setEditingForm({ ...template, id: undefined, title: template.title.replace(/\[Template\]\s*/i, '') });
    setIsTemplateModalOpen(false);
    setView('formBuilder');
  };


  if (selectedForm) {
    return (
      <FormView
        form={selectedForm}
        allSections={sections.filter(s => s.formId === selectedForm.id)}
        allResponses={responses}
        onUpdateResponse={onUpdateResponse}
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
            onUpdateResponse={() => {}}
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
            onCancel={() => { setEditingForm(null); setView('published'); }}
            formToEdit={editingForm}
            sectionsForForm={editingForm ? sections.filter(s => s.formId === (editingForm as any).id) : []}
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
        onBack={() => setView('published')}
      />
    );
  }

  if (view === 'profile') {
      return (
          <ProfileView
            currentUser={currentUser}
            onUpdateUser={onUpdateUser}
            onBack={() => setView('published')}
          />
      )
  }

  if (view === 'trash') {
    return (
      <TrashView
        deletedForms={forms.filter(f => f.status === 'deleted')}
        onRestore={onRestoreForm}
        onDeletePermanently={onPermanentlyDeleteForm}
        onBack={() => setView('published')}
        allUsers={allUsers}
      />
    )
  }

  const viewTitles: Record<DashboardView, string> = {
    published: `Published Forms (${publishedForms.length})`,
    drafts: `Drafts (${draftForms.length})`,
    templates: `Templates (${allTemplates.length})`,
    trash: 'Trash',
    formBuilder: 'Form Builder',
    userManagement: 'User Management',
    profile: 'My Profile',
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <TemplateModal 
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        templates={allTemplates}
        onSelectTemplate={handleStartFromTemplate}
        onStartFromScratch={handleStartFromScratch}
      />
      <ShareModal
        isOpen={!!shareModalData}
        onClose={() => setShareModalData(null)}
        data={shareModalData}
      />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Welcome, {currentUser.name.split(' ')[0]}</h1>
            <p className="text-slate-600 mt-1">Here are the forms available to you.</p>
          </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 mb-8 p-4 backdrop-blur-md bg-white/30 border border-white/40 shadow-sm rounded-xl">
        <div className="relative w-full sm:flex-grow">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            <input
                type="text"
                placeholder="Search forms by title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm font-semibold text-slate-800 bg-white/50 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500/80"
            />
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto">
            {currentUser.role === 'Admin' && (
                <select
                    value={creatorFilter}
                    onChange={(e) => setCreatorFilter(e.target.value)}
                    className="w-full sm:w-auto px-4 py-2 text-sm font-semibold text-slate-800 bg-white/50 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500/80"
                    aria-label="Filter by creator"
                >
                    <option value="all">All Creators</option>
                    {uniqueCreators.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
                </select>
            )}
            {view === 'published' && (
              <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as FormProgressStatus)}
                  className="w-full sm:w-auto px-4 py-2 text-sm font-semibold text-slate-800 bg-white/50 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500/80"
                  aria-label="Filter by status"
              >
                  <option value="all">All Statuses</option>
                  <option value="completed">Completed</option>
                  <option value="inProgress">In Progress</option>
                  <option value="overdue">Overdue</option>
                  <option value="notStarted">Not Started</option>
              </select>
            )}
        </div>
      </div>
      
      <main className="space-y-12">
        <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">{viewTitles[view]}</h2>
            
            {view === 'published' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {publishedForms.map(form => {
                      const formSections = sections.filter(s => s.formId === form.id);
                      const formResponses = responses.filter(r => formSections.some(fs => fs.id === r.sectionId));
                      const creator = allUsers.find(u => u.id === form.createdBy);
                      
                      const completedCount = formResponses.filter(r => r.status === 'completed').length;
                      const progress = formSections.length > 0 ? (completedCount / formSections.length) * 100 : 0;

                      const status = getFormStatus(form, formSections, formResponses);
                      const getStatusIndicator = () => {
                          switch (status) {
                              case 'completed':
                                  return { text: 'Completed', color: 'bg-lime-100 text-lime-800' };
                              case 'inProgress':
                                  return { text: 'In Progress', color: 'bg-sky-100 text-sky-800' };
                              case 'overdue':
                                  return { text: 'Overdue', color: 'bg-red-100 text-red-800' };
                              case 'notStarted':
                              default:
                                  return { text: 'Not Started', color: 'bg-slate-100 text-slate-800' };
                          }
                      };
                      const statusIndicator = getStatusIndicator();
                      
                      return (
                      <div
                          key={form.id}
                          onClick={() => setSelectedForm(form)}
                          className="relative group backdrop-blur-md bg-white/40 p-6 rounded-2xl border border-white/50 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between"
                      >
                          {currentUser.role === 'Admin' && (
                               <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                      onClick={(e) => { e.stopPropagation(); handleShareForm(form.id); }}
                                      className="p-2 backdrop-blur-sm bg-white/30 rounded-full text-sky-700 hover:bg-sky-500/30 transition-all"
                                      title="Share Form"
                                  >
                                      <ShareIcon className="w-5 h-5" />
                                  </button>
                                  <button
                                      onClick={(e) => { e.stopPropagation(); onSaveAsTemplate(form.id); }}
                                      className="p-2 backdrop-blur-sm bg-white/30 rounded-full text-lime-700 hover:bg-lime-500/30 transition-all"
                                      title="Save as Template"
                                  >
                                      <ClipboardCopyIcon className="w-5 h-5" />
                                  </button>
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
                                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusIndicator.color}`}>
                                      {statusIndicator.text}
                                  </span>
                              </div>
                              <h3 className="text-xl font-semibold text-slate-800 truncate">{form.title}</h3>
                              {creator && <p className="text-xs text-slate-500 mt-1">Created by: {creator.name}</p>}
                              {form.dueDate && (
                                  <p className={`text-xs font-medium mt-2 ${status === 'overdue' ? 'text-red-600' : 'text-slate-500'}`}>
                                      Due: {new Date(form.dueDate).toLocaleDateString()}
                                  </p>
                              )}
                          </div>
                          
                          <div className="mt-4">
                              <div className="flex justify-between items-center mb-1 text-sm text-slate-600">
                                  <span>Progress</span>
                                  <span>{completedCount} / {formSections.length}</span>
                              </div>
                              <div className="w-full bg-slate-200 rounded-full h-2.5">
                                  <div className={`${status === 'completed' ? 'bg-lime-500' : 'bg-sky-800'} h-2.5 rounded-full transition-all duration-500`} style={{ width: `${progress}%` }}></div>
                              </div>
                          </div>
                      </div>
                      );
                  })}
              </div>
            )}
            
            {view === 'drafts' && currentUser.role === 'Admin' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {draftForms.map(form => {
                      const creator = allUsers.find(u => u.id === form.createdBy);
                      return (
                          <div key={form.id} className="relative group backdrop-blur-md bg-white/40 p-6 rounded-2xl border border-white/50 shadow-lg flex flex-col justify-between">
                              <div>
                                  <div className="flex items-start justify-between mb-4">
                                      <div className="p-3 bg-amber-100 rounded-lg">
                                          <EditIcon className="w-6 h-6 text-amber-700" />
                                      </div>
                                      <span className="text-xs font-semibold text-amber-800 bg-amber-200 px-2 py-1 rounded-full">DRAFT</span>
                                  </div>
                                  <h3 className="text-xl font-semibold text-slate-800 truncate">{form.title}</h3>
                                  {creator && <p className="text-xs text-slate-500 mt-1">Created by: {creator.name}</p>}
                              </div>
                              <div className="mt-6 flex justify-end gap-2 border-t pt-4">
                                  <button onClick={() => onDeleteForm(form.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors" title="Move to Trash"><TrashIcon className="w-5 h-5"/></button>
                                  <button onClick={(e) => { e.stopPropagation(); onDuplicateDraft(form.id); }} className="p-2 text-sky-600 hover:bg-sky-100 rounded-lg transition-colors" title="Duplicate Draft"><CopyIcon className="w-5 h-5"/></button>
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
            )}

            {view === 'templates' && currentUser.role === 'Admin' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {allTemplates.map(template => {
                      const creator = allUsers.find(u => u.id === template.createdBy);
                      return (
                          <div key={template.id} className="relative group backdrop-blur-md bg-white/40 p-6 rounded-2xl border border-white/50 shadow-lg flex flex-col justify-between">
                              <div>
                                  <div className="flex items-start justify-between mb-4">
                                      <div className="p-3 bg-lime-100 rounded-lg">
                                          <ClipboardCopyIcon className="w-6 h-6 text-lime-700" />
                                      </div>
                                      <span className="text-xs font-semibold text-lime-800 bg-lime-200 px-2 py-1 rounded-full">TEMPLATE</span>
                                  </div>
                                  <h3 className="text-xl font-semibold text-slate-800 truncate">{template.title.replace(/\[Template\]\s*/i, '')}</h3>
                                  {creator && <p className="text-xs text-slate-500 mt-1">Created by: {creator.name}</p>}
                              </div>
                              <div className="mt-6 flex justify-end gap-2 border-t pt-4">
                                  <button onClick={() => onDeleteForm(template.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors" title="Move to Trash"><TrashIcon className="w-5 h-5"/></button>
                                  <button onClick={() => { setEditingForm(template); setView('formBuilder'); }} className="p-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors" title="Edit Template"><EditIcon className="w-5 h-5"/></button>
                                  <button onClick={() => handleStartFromTemplate(template)} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md bg-sky-600/80 border border-sky-600/90 shadow-lg hover:bg-sky-700/80 rounded-xl transition-all">
                                      Use Template
                                  </button>
                              </div>
                          </div>
                      )
                  })}
              </div>
            )}
        </div>
      </main>
    </div>
  );
});

export default Dashboard;
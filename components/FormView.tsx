import React, { useRef, useState, useEffect } from 'react';
import { Form, Section, Response, User, Question } from '../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { DownloadIcon, ChevronLeftIcon, MailIcon, ClockIcon, CheckCircleIcon } from './icons';
import UserIcon from './UserIcon';
import SignaturePad from './SignaturePad';

interface FormViewProps {
  form: Form;
  allSections: Section[];
  allResponses: Response[];
  setResponses: React.Dispatch<React.SetStateAction<Response[]>>;
  currentUser: User;
  allUsers: User[];
  onBack: () => void;
  addNotification: (message: string) => void;
}

const SectionContent: React.FC<{
  section: Section;
  response: Response | undefined;
  setResponses: React.Dispatch<React.SetStateAction<Response[]>>;
  canEdit: boolean;
  allUsers: User[];
  addNotification: (message: string) => void;
  currentUser: User;
}> = ({ section, response, setResponses, canEdit, allUsers, addNotification, currentUser }) => {
  const [answers, setAnswers] = useState(response?.content || {});
  
  useEffect(() => {
    setAnswers(response?.content || {});
  }, [response]);

  const handleInputChange = (questionId: string, value: string | string[]) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleCheckboxChange = (questionId: string, option: string, checked: boolean) => {
    const currentAnswers = (answers[questionId] as string[] || []);
    const newAnswers = checked
      ? [...currentAnswers, option]
      : currentAnswers.filter(item => item !== option);
    setAnswers(prev => ({ ...prev, [questionId]: newAnswers }));
  };

  const handleSave = () => {
    if (window.confirm("Are you sure you want to submit? This action is final and will lock this section from further edits.")) {
      setResponses(prev =>
        prev.map(r =>
          r.sectionId === section.id ? { ...r, content: answers, status: 'completed' } : r
        )
      );
      addNotification(`${currentUser.name} has completed the "${section.title}" section.`);
    }
  };
  
  const isCompleted = response?.status === 'completed';

  if (!canEdit || isCompleted) {
    if (isCompleted || currentUser.role === 'Viewer' || currentUser.role === 'Admin') {
      return (
        <div className="space-y-4">
          {section.questions.map(q => {
            const answer = response?.content[q.id] as string | string[] | undefined;
            return (
              <div key={q.id}>
                <label className="block text-sm font-medium text-slate-700">{q.text}</label>
                <div className="mt-1 p-3 bg-slate-100 rounded-md text-sm text-slate-800 min-h-[40px] prose prose-sm max-w-none">
                  {q.type === 'signature' && typeof answer === 'string' && answer.startsWith('data:image') ? (
                     <img src={answer} alt="Signature" className="max-w-xs border rounded-md" />
                  ) : Array.isArray(answer) ? 
                    (answer.length > 0 ? <ul>{answer.map(item => <li key={item}>{item}</li>)}</ul> : <span className="text-slate-400">Not answered</span>) : 
                    (answer || <span className="text-slate-400">Not answered</span>)
                  }
                </div>
              </div>
            );
          })}
        </div>
      );
    } else {
      const assignedUser = allUsers.find(u => u.id === section.assignedTo);
      return (
        <div className="flex flex-col items-center justify-center p-8 bg-amber-50 border-2 border-dashed border-amber-200 rounded-lg text-center">
          <ClockIcon className="w-12 h-12 text-amber-500 mb-3"/>
          <h3 className="text-lg font-semibold text-amber-800">Pending Submission</h3>
          <p className="text-sm text-amber-700">Awaiting completion from {assignedUser?.name}.</p>
        </div>
      );
    }
  }

  return (
    <div className="space-y-6">
      {section.questions.map(q => (
        <div key={q.id}>
          <label htmlFor={q.id} className="block text-sm font-medium text-slate-700 mb-2">
            {q.text} {q.required && <span className="text-red-500">*</span>}
          </label>
          {q.type === 'short-answer' && (
            <input
              type="text"
              id={q.id}
              value={(answers[q.id] as string || '')}
              onChange={e => handleInputChange(q.id, e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500"
            />
          )}
          {q.type === 'paragraph' && (
            <textarea
              id={q.id}
              rows={4}
              value={(answers[q.id] as string || '')}
              onChange={e => handleInputChange(q.id, e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500"
            />
          )}
          {q.type === 'multiple-choice' && q.options && (
            <div className="space-y-2">
              {q.options.map(option => (
                <label key={option} className="flex items-center">
                  <input
                    type="radio"
                    name={q.id}
                    value={option}
                    checked={answers[q.id] === option}
                    onChange={e => handleInputChange(q.id, e.target.value)}
                    className="h-4 w-4 text-sky-700 border-slate-300 focus:ring-sky-500"
                  />
                  <span className="ml-3 text-sm text-slate-700">{option}</span>
                </label>
              ))}
            </div>
          )}
          {q.type === 'checkboxes' && q.options && (
            <div className="space-y-2">
              {q.options.map(option => (
                <label key={option} className="flex items-center">
                  <input
                    type="checkbox"
                    name={q.id}
                    value={option}
                    checked={(answers[q.id] as string[] || []).includes(option)}
                    onChange={e => handleCheckboxChange(q.id, option, e.target.checked)}
                    className="h-4 w-4 text-sky-700 border-slate-300 rounded focus:ring-sky-500"
                  />
                  <span className="ml-3 text-sm text-slate-700">{option}</span>
                </label>
              ))}
            </div>
          )}
          {q.type === 'signature' && (
             <SignaturePad
                value={answers[q.id] as string || ''}
                onChange={dataUrl => handleInputChange(q.id, dataUrl)}
            />
          )}
        </div>
      ))}
      <div className="mt-6 flex justify-end items-center gap-4">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 font-semibold text-white backdrop-blur-md bg-lime-500/80 border border-lime-500/90 shadow-lg hover:bg-lime-600/80 hover:shadow-xl rounded-xl transition-all duration-300 no-print"
        >
          <CheckCircleIcon className="w-5 h-5" />
          Save & Submit
        </button>
      </div>
    </div>
  );
};

const FormView: React.FC<FormViewProps> = ({ form, allSections, allResponses, setResponses, currentUser, allUsers, onBack, addNotification }) => {
  const formRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = () => {
    if (formRef.current) {
      setIsExporting(true);
      const formElement = formRef.current;
      const buttonsToHide = formElement.querySelectorAll('.no-print');
      buttonsToHide.forEach(btn => (btn as HTMLElement).style.display = 'none');

      html2canvas(formElement, { scale: 2, allowTaint: true, useCORS: true }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const imgProps = pdf.getImageProperties(imgData);
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${form.title.replace(/\s/g, '_')}.pdf`);

        buttonsToHide.forEach(btn => (btn as HTMLElement).style.display = '');
        setIsExporting(false);
      }).catch(err => {
        console.error("Error exporting PDF: ", err);
        alert("Could not export PDF.");
        buttonsToHide.forEach(btn => (btn as HTMLElement).style.display = '');
        setIsExporting(false);
      });
    }
  };

  const sortedSections = [...allSections].sort((a, b) => a.order - b.order);
  
  const formResponses = allResponses.filter(r => sortedSections.some(s => s.id === r.sectionId));
  const completedCount = formResponses.filter(r => r.status === 'completed').length;
  const progress = sortedSections.length > 0 ? (completedCount / sortedSections.length) * 100 : 0;
  const isComplete = progress === 100;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <header className="flex items-center justify-between mb-6 no-print">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-800 backdrop-blur-md bg-white/30 border border-white/40 shadow-sm hover:bg-white/40 hover:shadow-md rounded-xl transition-all duration-300"
        >
          <ChevronLeftIcon className="w-4 h-4"/>
          Back to Dashboard
        </button>
        
        <div className="flex-grow flex items-center justify-center px-4">
            <div className="w-full max-w-xs">
                <div className="flex justify-between items-center mb-1 text-sm text-slate-600">
                    <span>Overall Progress</span>
                    <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className={`${isComplete ? 'bg-lime-500' : 'bg-sky-800'} h-2 rounded-full transition-all duration-500`} style={{ width: `${progress}%` }}></div>
                </div>
            </div>
        </div>

        {(currentUser.role === 'Admin' || currentUser.role === 'Viewer') && (
          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md bg-sky-600/80 border border-sky-600/90 shadow-lg hover:bg-sky-700/80 hover:shadow-xl rounded-xl transition-all duration-300 disabled:bg-sky-400/80 disabled:cursor-not-allowed"
          >
            <DownloadIcon className="w-4 h-4"/>
            {isExporting ? 'Exporting...' : 'Download PDF'}
          </button>
        )}
      </header>

      <div ref={formRef} className="backdrop-blur-xl bg-white/50 p-8 sm:p-12 rounded-2xl shadow-2xl border border-white/60">
        <h1 className="text-4xl font-bold text-slate-900 border-b pb-4 mb-8">{form.title}</h1>
        <div className="space-y-12">
          {sortedSections.map(section => {
            const assignedUser = allUsers.find(u => u.id === section.assignedTo);
            const response = allResponses.find(r => r.sectionId === section.id);
            const canEdit = currentUser.role === 'User' && section.assignedTo === currentUser.id && response?.status !== 'completed';

            return (
              <div key={section.id} className="border-t pt-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-slate-800">{section.title}</h2>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-slate-500 text-right">
                          Assigned to: {assignedUser?.name || 'Unknown'}
                        </span>
                        <UserIcon name={assignedUser?.name || ''} color={assignedUser?.color || 'bg-slate-400'} className="w-8 h-8" />
                        
                        {currentUser.role === 'Admin' && currentUser.id !== assignedUser?.id && (
                            <button 
                                onClick={() => alert(`An invitation reminder has been sent to ${assignedUser?.email}.`)}
                                className="p-1.5 rounded-full hover:bg-slate-200 transition-colors no-print"
                                aria-label={`Send invite to ${assignedUser?.name}`}
                                title={`Send invite to ${assignedUser?.name}`}
                            >
                                <MailIcon className="w-4 h-4 text-slate-600" />
                            </button>
                        )}
                    </div>
                </div>
                
                <div className="mt-4">
                  <SectionContent
                    section={section}
                    response={response}
                    setResponses={setResponses}
                    canEdit={canEdit}
                    allUsers={allUsers}
                    addNotification={addNotification}
                    currentUser={currentUser}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FormView;
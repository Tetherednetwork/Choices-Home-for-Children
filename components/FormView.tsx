import React, { useRef, useState, useEffect } from 'react';
import { Form, Section, Response, User, Question } from '../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { DownloadIcon, ChevronLeftIcon, MailIcon, ClockIcon, CheckCircleIcon, FileUpIcon, FileTextIcon, LinkIcon } from './icons';
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
  isPreview?: boolean;
}

const StarRating: React.FC<{
    count?: number;
    value: number;
    onChange: (value: number) => void;
    disabled?: boolean;
}> = ({ count = 5, value, onChange, disabled }) => {
    const [hover, setHover] = useState(0);
    const stars = Array.from({ length: count }, (_, i) => i + 1);

    return (
        <div className="flex items-center space-x-1">
            {stars.map(starValue => (
                <button
                    key={starValue}
                    type="button"
                    disabled={disabled}
                    onClick={() => onChange(starValue)}
                    onMouseEnter={() => !disabled && setHover(starValue)}
                    onMouseLeave={() => !disabled && setHover(0)}
                    className={`cursor-pointer transition-colors ${disabled ? 'cursor-not-allowed' : ''}`}
                    aria-label={`Rate ${starValue} out of ${count}`}
                >
                    <svg
                        className={`w-8 h-8 ${starValue <= (hover || value) ? 'text-amber-400' : 'text-slate-300'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                </button>
            ))}
        </div>
    );
};


const SectionContent: React.FC<{
  section: Section;
  response: Response | undefined;
  onSectionSubmit: (sectionId: number, answers: { [questionId: string]: any }) => void;
  canEdit: boolean;
  allUsers: User[];
  currentUser: User;
  isPreview?: boolean;
}> = ({ section, response, onSectionSubmit, canEdit, allUsers, currentUser, isPreview }) => {
  const [answers, setAnswers] = useState(response?.content || {});
  
  useEffect(() => {
    setAnswers(response?.content || {});
  }, [response]);

  const handleInputChange = (questionId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleCheckboxChange = (questionId: string, option: string, checked: boolean) => {
    const currentAnswers = (answers[questionId] as string[] || []);
    const newAnswers = checked
      ? [...currentAnswers, option]
      : currentAnswers.filter(item => item !== option);
    setAnswers(prev => ({ ...prev, [questionId]: newAnswers }));
  };
  
  const handleFileChange = (questionId: string, file: File | null) => {
    if (file) {
        // In a real app, you'd upload the file and store a URL.
        // Here, we'll store file metadata as we can't store blobs in localStorage easily.
        handleInputChange(questionId, {
            name: file.name,
            size: file.size,
            type: file.type,
        });
    } else {
        handleInputChange(questionId, null);
    }
  };


  const handleSave = () => {
    onSectionSubmit(section.id, answers);
  };
  
  const isCompleted = response?.status === 'completed';

  if (isPreview) {
    return (
        <div className="space-y-6">
            {section.questions.map(q => (
                <div key={q.id}>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        {q.text} {q.required && <span className="text-red-500">*</span>}
                    </label>
                    {q.type === 'short-answer' && <input type="text" disabled className="w-full p-2 border border-slate-300 rounded-md bg-slate-100 cursor-not-allowed" />}
                    {q.type === 'paragraph' && <textarea rows={4} disabled className="w-full p-2 border border-slate-300 rounded-md bg-slate-100 cursor-not-allowed" />}
                    {q.type === 'multiple-choice' && q.options && <div className="space-y-2">{q.options.map(o => <label key={o} className="flex items-center"><input type="radio" disabled className="h-4 w-4" /><span className="ml-3 text-sm text-slate-700">{o}</span></label>)}</div>}
                    {q.type === 'checkboxes' && q.options && <div className="space-y-2">{q.options.map(o => <label key={o} className="flex items-center"><input type="checkbox" disabled className="h-4 w-4 rounded" /><span className="ml-3 text-sm text-slate-700">{o}</span></label>)}</div>}
                    {q.type === 'signature' && <div className="w-full h-32 border border-dashed border-slate-400 rounded-md bg-slate-50 flex items-center justify-center text-slate-500">Signature Area</div>}
                    {q.type === 'rating' && <StarRating value={0} onChange={() => {}} disabled={true} />}
                    {q.type === 'date' && <input type="date" disabled className="w-full p-2 border border-slate-300 rounded-md bg-slate-100 cursor-not-allowed" />}
                    {q.type === 'mobile' && <input type="tel" disabled className="w-full p-2 border border-slate-300 rounded-md bg-slate-100 cursor-not-allowed" placeholder="Mobile number input" />}
                    {q.type === 'email' && <input type="email" disabled className="w-full p-2 border border-slate-300 rounded-md bg-slate-100 cursor-not-allowed" placeholder="Email address input" />}
                    {q.type === 'url' && <input type="url" disabled className="w-full p-2 border border-slate-300 rounded-md bg-slate-100 cursor-not-allowed" placeholder="URL input" />}
                    {q.type === 'file-upload' && <div className="flex items-center gap-2 p-3 bg-slate-100 border border-slate-300 rounded-md cursor-not-allowed"><FileUpIcon className="w-5 h-5 text-slate-500" /> <span className="text-slate-500">File upload area</span></div>}
                </div>
            ))}
        </div>
    );
  }

  if (!canEdit || isCompleted) {
    if (isCompleted || currentUser.role === 'Viewer' || currentUser.role === 'Admin') {
      return (
        <div className="space-y-4">
          {section.questions.map(q => {
            const answer = response?.content[q.id];
            return (
              <div key={q.id}>
                <label className="block text-sm font-medium text-slate-700">{q.text}</label>
                <div className="mt-1 p-3 bg-slate-100 rounded-md text-sm text-slate-800 min-h-[40px] prose prose-sm max-w-none">
                  {q.type === 'signature' && typeof answer === 'string' && answer.startsWith('data:image') ? (
                     <img src={answer} alt="Signature" className="max-w-xs border rounded-md" />
                  ) : q.type === 'rating' ? (
                     answer ? <StarRating value={Number(answer)} onChange={() => {}} disabled={true} /> : <span className="text-slate-400">Not rated</span>
                  ) : q.type === 'file-upload' && answer && typeof answer === 'object' && answer.name ? (
                     <div className="flex items-center gap-2 p-2 bg-slate-200 rounded-md max-w-sm">
                        <FileTextIcon className="w-5 h-5 text-slate-600 flex-shrink-0"/>
                        <span className="text-sm font-medium text-slate-800 truncate">{answer.name}</span>
                        <span className="text-xs text-slate-500 ml-auto flex-shrink-0">({(answer.size / 1024).toFixed(1)} KB)</span>
                    </div>
                  ) : q.type === 'url' && typeof answer === 'string' ? (
                     <a href={!answer.startsWith('http') ? `https://${answer}`: answer} target="_blank" rel="noopener noreferrer" className="text-sky-700 hover:underline break-all">{answer}</a>
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
          {q.type === 'rating' && (
            <StarRating
                value={Number(answers[q.id]) || 0}
                onChange={rating => handleInputChange(q.id, rating)}
            />
          )}
          {q.type === 'date' && (
              <input
                  type="date"
                  id={q.id}
                  value={(answers[q.id] as string || '')}
                  onChange={e => handleInputChange(q.id, e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500"
              />
          )}
          {q.type === 'mobile' && (
              <input
                  type="tel"
                  id={q.id}
                  value={(answers[q.id] as string || '')}
                  onChange={e => handleInputChange(q.id, e.target.value)}
                  placeholder="e.g., 07123 456789"
                  className="w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500"
              />
          )}
          {q.type === 'email' && (
              <input
                  type="email"
                  id={q.id}
                  value={(answers[q.id] as string || '')}
                  onChange={e => handleInputChange(q.id, e.target.value)}
                  placeholder="e.g., name@example.com"
                  className="w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500"
              />
          )}
          {q.type === 'url' && (
            <input
                type="url"
                id={q.id}
                value={(answers[q.id] as string || '')}
                onChange={e => handleInputChange(q.id, e.target.value)}
                placeholder="https://example.com"
                className="w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500"
            />
           )}
          {q.type === 'file-upload' && (
            <div className="w-full">
                <label className="flex items-center px-4 py-2 bg-white text-slate-700 rounded-lg shadow-sm tracking-wide border border-slate-300 cursor-pointer hover:bg-slate-100">
                    <FileUpIcon className="w-5 h-5 mr-2" />
                    <span className="text-base leading-normal">
                        {answers[q.id] && answers[q.id].name ? 'Change file...' : 'Select a file...'}
                    </span>
                    <input
                        type='file'
                        className="hidden"
                        onChange={e => handleFileChange(q.id, e.target.files ? e.target.files[0] : null)}
                    />
                </label>
                {answers[q.id] && answers[q.id].name && (
                    <div className="mt-2 text-sm text-slate-600">
                        Selected: <span className="font-semibold">{answers[q.id].name}</span>
                    </div>
                )}
            </div>
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

const FormView: React.FC<FormViewProps> = ({ form, allSections, allResponses, setResponses, currentUser, allUsers, onBack, addNotification, isPreview }) => {
  const formRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleSectionSubmit = (sectionId: number, answers: { [questionId: string]: any }) => {
    if (window.confirm("Are you sure you want to submit? This action is final and will lock this section from further edits.")) {
        const newResponses = allResponses.map(r =>
            r.sectionId === sectionId ? { ...r, content: answers, status: 'completed', filledBy: currentUser.id } : r
        );
        setResponses(newResponses);

        const completedSection = allSections.find(s => s.id === sectionId);
        if (!completedSection) return;

        // General completion notification for everyone
        addNotification(`${currentUser.name} completed the "${completedSection.title}" section in "${form.title}".`);

        // Reminder for next user
        const sortedSections = [...allSections].sort((a, b) => a.order - b.order);
        const currentSectionIndex = sortedSections.findIndex(s => s.id === completedSection.id);
        const nextSection = sortedSections[currentSectionIndex + 1];

        if (nextSection) {
            const nextUser = allUsers.find(u => u.id === nextSection.assignedTo);
            const nextResponse = newResponses.find(r => r.sectionId === nextSection.id);
            // only notify if it's not the same user and the next section is pending
            if (nextUser && nextUser.id !== currentUser.id && nextResponse?.status === 'pending') {
                const reminderMessage = `Hi ${nextUser.name.split(' ')[0]}, "${completedSection.title}" is complete. It's your turn for "${nextSection.title}".`;
                addNotification(reminderMessage);
            }
        }

        // Check for overall form completion
        const sectionsForThisFormIds = allSections.map(s => s.id);
        const completedCount = newResponses.filter(r => sectionsForThisFormIds.includes(r.sectionId) && r.status === 'completed').length;
        
        if (completedCount === allSections.length && allSections.length > 0) {
            const formCompletedMessage = `🎉 The form "${form.title}" is now fully completed!`;
            addNotification(formCompletedMessage);
        }
    }
  };


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
  const isOverdue = form.dueDate ? new Date() > new Date(form.dueDate) && !isComplete : false;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <header className="flex items-center justify-between mb-6 no-print">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-800 backdrop-blur-md bg-white/30 border border-white/40 shadow-sm hover:bg-white/40 hover:shadow-md rounded-xl transition-all duration-300"
        >
          <ChevronLeftIcon className="w-4 h-4"/>
          {isPreview ? 'Close Preview' : 'Back to Dashboard'}
        </button>
        
        {!isPreview && (
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
        )}

        {!isPreview && currentUser.role === 'Admin' && (
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
        <div className="border-b pb-4 mb-8">
            <h1 className="text-4xl font-bold text-slate-900">{form.title}</h1>
            {isPreview && <p className="mt-2 text-sm font-semibold text-sky-700 bg-sky-100 px-3 py-1 rounded-full inline-block">PREVIEW MODE</p>}
            {form.dueDate && !isPreview && (
                <p className={`mt-2 text-sm font-medium ${isOverdue ? 'text-red-600' : 'text-slate-500'}`}>
                    Due by: {new Date(form.dueDate).toLocaleDateString()}
                </p>
            )}
        </div>
        <div className="space-y-12">
          {sortedSections.map(section => {
            const assignedUser = allUsers.find(u => u.id === section.assignedTo);
            const response = allResponses.find(r => r.sectionId === section.id);
            const canEdit = currentUser.role === 'User' && section.assignedTo === currentUser.id && response?.status !== 'completed';
            const isSectionPending = response?.status === 'pending';

            return (
              <div key={section.id} className="border-t pt-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-slate-800">{section.title}</h2>
                    <div className="flex items-center gap-3">
                        {!isPreview && isSectionPending && isOverdue && (
                            <span className="text-xs font-semibold text-white bg-red-500 px-2 py-0.5 rounded-full">
                                OVERDUE
                            </span>
                        )}
                        <span className="text-sm text-slate-500 text-right">
                          Assigned to: {assignedUser?.name || 'Unknown'}
                        </span>
                        <UserIcon name={assignedUser?.name || ''} color={assignedUser?.color || 'bg-slate-400'} className="w-8 h-8" />
                        
                        {!isPreview && currentUser.role === 'Admin' && isSectionPending && currentUser.id !== assignedUser?.id && (
                            <button 
                                onClick={() => addNotification(`A reminder email has been sent to ${assignedUser?.email}.`)}
                                className={`p-1.5 rounded-full transition-colors no-print ${isOverdue ? 'bg-red-100 hover:bg-red-200' : 'hover:bg-slate-200'}`}
                                aria-label={`Send reminder to ${assignedUser?.name}`}
                                title={`Send reminder to ${assignedUser?.name}`}
                            >
                                <MailIcon className={`w-4 h-4 ${isOverdue ? 'text-red-600' : 'text-slate-600'}`} />
                            </button>
                        )}
                    </div>
                </div>
                
                <div className="mt-4">
                  <SectionContent
                    section={section}
                    response={response}
                    onSectionSubmit={handleSectionSubmit}
                    canEdit={canEdit}
                    allUsers={allUsers}
                    currentUser={currentUser}
                    isPreview={isPreview}
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
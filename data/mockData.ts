import { User, Form, Section, Response, Question } from '../types';

const userColors = ['bg-sky-600', 'bg-lime-600', 'bg-amber-600', 'bg-violet-600', 'bg-rose-600', 'bg-teal-600'];

export const initialUsers: User[] = [
  { id: 1, name: 'Alice (Admin)', email: 'alice@example.com', role: 'Admin', color: userColors[0], pin: '1111' },
  { id: 2, name: 'Bob (Marketing)', email: 'bob@example.com', role: 'User', color: userColors[1], pin: '2222' },
  { id: 3, name: 'Charlie (Sales)', email: 'charlie@example.com', role: 'User', color: userColors[2], pin: '3333' },
  { id: 4, name: 'Diana (Engineering)', email: 'diana@example.com', role: 'User', color: userColors[3], pin: '4444' },
  { id: 5, name: 'Eve (Viewer)', email: 'eve@example.com', role: 'Viewer', color: userColors[4], pin: '5555' },
];

const tenDaysAgo = new Date();
tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

const tenDaysFromNow = new Date();
tenDaysFromNow.setDate(tenDaysFromNow.getDate() + 10);


export const initialForms: Form[] = [
  { id: 1, title: 'Q3 Project Proposal', createdBy: 1, status: 'published', dueDate: tenDaysFromNow.toISOString().split('T')[0] },
  { id: 2, title: 'Annual Department Review', createdBy: 1, status: 'published', dueDate: tenDaysAgo.toISOString().split('T')[0] },
  { id: 3, title: 'Employee Onboarding Checklist', createdBy: 1, status: 'draft' },
];

const projectProposalQuestions: { [key: string]: Question[] } = {
    summary: [
        { id: 'summary-1', type: 'paragraph', text: 'Provide a brief overview of the project.', required: true },
        { id: 'summary-2', type: 'short-answer', text: 'What is the projected completion date?' },
    ],
    marketing: [
        { id: 'mkt-1', type: 'paragraph', text: 'Describe the target audience for this project.', required: true },
        { id: 'mkt-2', type: 'checkboxes', text: 'Which channels will be used for promotion?', options: ['Social Media', 'Email Marketing', 'Content Marketing', 'Paid Ads'] },
        { id: 'mkt-3', type: 'short-answer', text: 'What is the estimated marketing budget?' },
    ],
    sales: [
        { id: 'sales-1', type: 'short-answer', text: 'What are the projected revenue figures for the first year?', required: true },
        { id: 'sales-2', type: 'multiple-choice', text: 'Which sales team will handle this project?', options: ['Enterprise Team', 'SMB Team', 'Direct Sales Team'] },
    ],
    technical: [
        { id: 'tech-1', type: 'paragraph', text: 'Outline the technical stack and architecture.', required: true },
        { id: 'tech-2', type: 'checkboxes', text: 'What are the key technical risks?', options: ['Scalability', 'Security', 'Integration', 'Performance'] },
    ],
};

const departmentReviewQuestions: { [key: string]: Question[] } = {
    marketing: [
        { id: 'rev-mkt-1', type: 'paragraph', text: 'Summarize the department\'s key achievements this year.' },
        { id: 'rev-mkt-2', type: 'short-answer', text: 'What was the most successful campaign?' },
    ],
    sales: [
        { id: 'rev-sales-1', type: 'short-answer', text: 'Total revenue generated this year?' },
        { id: 'rev-sales-2', type: 'paragraph', text: 'What were the biggest challenges faced?' },
    ],
    engineering: [
        { id: 'rev-eng-1', type: 'paragraph', text: 'Describe major product releases and technical milestones.' },
        { id: 'rev-eng-2', type: 'multiple-choice', text: 'How would you rate team morale?', options: ['Excellent', 'Good', 'Fair', 'Poor'] },
        { id: 'rev-eng-3', type: 'signature', text: 'Head of Engineering Signature', required: true },
    ],
};

const onboardingQuestions: { [key: string]: Question[] } = {
    hr: [
        { id: 'hr-1', type: 'short-answer', text: 'Employee Full Name', required: true },
        { id: 'hr-2', type: 'date', text: 'Start Date' },
        { id: 'hr-3', type: 'signature', text: 'Employee Agreement Signature', required: true },
    ],
    it: [
        { id: 'it-1', type: 'checkboxes', text: 'Hardware to be provided', options: ['Laptop', 'Monitor', 'Keyboard', 'Mouse'] },
        { id: 'it-2', type: 'multiple-choice', text: 'Access Level Required', options: ['Standard User', 'Developer', 'Admin'] },
    ]
};


export const initialSections: Section[] = [
  // Sections for Form 1
  { id: 1, formId: 1, title: 'Executive Summary', assignedTo: 1, order: 1, questions: projectProposalQuestions.summary },
  { id: 2, formId: 1, title: 'Marketing Plan', assignedTo: 2, order: 2, questions: projectProposalQuestions.marketing },
  { id: 3, formId: 1, title: 'Sales Projections', assignedTo: 3, order: 3, questions: projectProposalQuestions.sales },
  { id: 4, formId: 1, title: 'Technical Specifications', assignedTo: 4, order: 4, questions: projectProposalQuestions.technical },
  // Sections for Form 2
  { id: 5, formId: 2, title: 'Marketing Department Achievements', assignedTo: 2, order: 1, questions: departmentReviewQuestions.marketing },
  { id: 6, formId: 2, title: 'Sales Department Performance', assignedTo: 3, order: 2, questions: departmentReviewQuestions.sales },
  { id: 7, formId: 2, title: 'Engineering Team Milestones', assignedTo: 4, order: 3, questions: departmentReviewQuestions.engineering },
  // Sections for Form 3 (Draft)
  { id: 8, formId: 3, title: 'HR Paperwork', assignedTo: 1, order: 1, questions: onboardingQuestions.hr },
  { id: 9, formId: 3, title: 'IT Setup', assignedTo: 4, order: 2, questions: onboardingQuestions.it },
];

export const initialResponses: Response[] = [
    {id: 1, sectionId: 1, content: { 'summary-1': 'This project aims to build a new collaborative platform to increase user engagement by 50%.', 'summary-2': 'Q4 2024' }, filledBy: 1, status: 'completed'},
    {id: 2, sectionId: 2, content: {}, filledBy: 2, status: 'pending'},
    {id: 3, sectionId: 3, content: { 'sales-1': '$1.2 Million', 'sales-2': 'Enterprise Team' }, filledBy: 3, status: 'completed'},
    {id: 4, sectionId: 4, content: { 'tech-1': 'React frontend, Node.js backend, PostgreSQL database.', 'tech-2': ['Scalability', 'Security'] }, filledBy: 4, status: 'completed'},
    {id: 5, sectionId: 5, content: {}, filledBy: 2, status: 'pending'},
    {id: 6, sectionId: 6, content: {}, filledBy: 3, status: 'pending'},
    {id: 7, sectionId: 7, content: {}, filledBy: 4, status: 'pending'},
    // Responses for Form 3
    {id: 8, sectionId: 8, content: {}, filledBy: 1, status: 'pending'},
    {id: 9, sectionId: 9, content: {}, filledBy: 4, status: 'pending'},
];
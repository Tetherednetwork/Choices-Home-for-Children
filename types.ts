export type UserRole = 'Admin' | 'User' | 'Viewer';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  color: string;
  pin?: string;
}

export interface Form {
  id: number;
  title: string;
  createdBy: number; // user id
  status: 'active' | 'deleted';
}

export type QuestionType = 'short-answer' | 'paragraph' | 'multiple-choice' | 'checkboxes';

export interface Question {
    id: string;
    text: string;
    type: QuestionType;
    options?: string[];
    required?: boolean;
}

export interface Section {
  id: number;
  formId: number;
  title: string;
  assignedTo: number; // user id
  order: number;
  questions: Question[];
}

export interface Response {
  id: number;
  sectionId: number;
  content: { [questionId: string]: string | string[] }; // e.g., { 'q1': 'Answer text', 'q2': ['Option 1', 'Option 3'] }
  filledBy: number; // user id
  status: 'pending' | 'completed';
}

export interface Notification {
  id: number;
  message: string;
}
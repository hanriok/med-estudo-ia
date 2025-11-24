
export type LearningStyle = 'visual' | 'auditory' | 'practical';

export type View = 'dashboard' | 'question_bank' | 'flashcards' | 'tutor' | 'patient_sim' | 'progress' | 'settings' | 'materials';

export type Language = 'en' | 'pt';

export interface User {
  name: string;
  email: string;
  phone?: string;
  university: string;
  period: string;
  learningStyle: LearningStyle;
}

export interface StudyMaterial {
    id: string;
    name: string;
    type: string;
    data: string; // Base64 string without prefix
}

export interface Question {
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
}

export interface Flashcard {
  id: number;
  question: string;
  answer: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface ProgressData {
  [topic: string]: {
    correct: number;
    total: number;
  };
}

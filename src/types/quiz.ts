export interface Quiz {
  id: string; // UUID string
  title: string;
  imageUrl: string;
  isActive: boolean;
  participantsCount: number;
  questions: Question[];
}

export interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswers: number[];
}

export interface User {
  id: string; // UUID string
  name: string;
  isTeam: boolean;
  teamMembers?: string[];
}

export interface Score {
  id: string; // UUID string
  userId: string;
  quizId: string;
  score: number;
  answers: Record<string, number[]>;
}
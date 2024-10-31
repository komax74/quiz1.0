import React, { createContext, useContext, useReducer } from 'react';

interface QuizState {
  currentQuestion: number;
  answers: Record<number, number[]>;
  userId: string;
  playerName: string;
  teamMembers: string[];
  isTeam: boolean;
  score: number;
}

type QuizAction =
  | { type: 'SET_PLAYER_INFO'; payload: { userId: string; name: string; isTeam: boolean; teamMembers?: string[] } }
  | { type: 'SET_ANSWER'; payload: { questionId: number; selectedAnswers: number[] } }
  | { type: 'SET_SCORE'; payload: number }
  | { type: 'NEXT_QUESTION' }
  | { type: 'RESET_QUIZ' };

const initialState: QuizState = {
  currentQuestion: 0,
  answers: {},
  userId: '',
  playerName: '',
  teamMembers: [],
  isTeam: false,
  score: 0,
};

const QuizContext = createContext<{
  state: QuizState;
  dispatch: React.Dispatch<QuizAction>;
} | null>(null);

function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case 'SET_PLAYER_INFO':
      return {
        ...state,
        userId: action.payload.userId,
        playerName: action.payload.name,
        isTeam: action.payload.isTeam,
        teamMembers: action.payload.teamMembers || [],
      };
    case 'SET_ANSWER':
      return {
        ...state,
        answers: {
          ...state.answers,
          [action.payload.questionId]: action.payload.selectedAnswers,
        },
      };
    case 'SET_SCORE':
      return {
        ...state,
        score: action.payload,
      };
    case 'NEXT_QUESTION':
      return {
        ...state,
        currentQuestion: state.currentQuestion + 1,
      };
    case 'RESET_QUIZ':
      return {
        ...initialState,
      };
    default:
      return state;
  }
}

export function QuizProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(quizReducer, initialState);

  return (
    <QuizContext.Provider value={{ state, dispatch }}>
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
}
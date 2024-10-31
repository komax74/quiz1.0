export interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswers: number[];
}

export const quizData: Question[] = [
  {
    id: 0,
    text: "Which of these programming languages are statically typed?",
    options: [
      "JavaScript",
      "TypeScript",
      "Python",
      "Java",
      "Rust"
    ],
    correctAnswers: [1, 3, 4]
  },
  {
    id: 1,
    text: "Which of these are valid HTTP methods?",
    options: [
      "GET",
      "SEND",
      "POST",
      "FETCH",
      "DELETE"
    ],
    correctAnswers: [0, 2, 4]
  },
  // Add 10 more questions here...
];

interface LeaderboardEntry {
  name: string;
  score: number;
  date: string;
  isTeam: boolean;
  teamMembers?: string[];
}

export function saveScore(entry: LeaderboardEntry) {
  const leaderboard = getLeaderboard();
  leaderboard.push(entry);
  leaderboard.sort((a, b) => b.score - a.score);
  localStorage.setItem('quizLeaderboard', JSON.stringify(leaderboard));
}

export function getLeaderboard(): LeaderboardEntry[] {
  const stored = localStorage.getItem('quizLeaderboard');
  return stored ? JSON.parse(stored) : [];
}

export function isNameTaken(name: string): boolean {
  const leaderboard = getLeaderboard();
  return leaderboard.some(entry => 
    entry.name.toLowerCase() === name.toLowerCase()
  );
}
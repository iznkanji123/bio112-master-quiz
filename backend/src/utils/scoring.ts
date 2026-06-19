export const calculateXP = (correctAnswers: number, totalQuestions: number, difficulty: string): number => {
  const baseXP = correctAnswers * 10;
  const difficultyMultiplier = difficulty === 'hard' ? 1.5 : difficulty === 'easy' ? 0.8 : 1;
  return Math.floor(baseXP * difficultyMultiplier);
};

export const calculateLevel = (totalXP: number): number => {
  return Math.floor(Math.sqrt(totalXP / 100)) + 1;
};

export const calculateStreak = (lastQuizDate: Date | null): number => {
  if (!lastQuizDate) return 1;
  const today = new Date();
  const lastQuiz = new Date(lastQuizDate);
  const daysDiff = Math.floor((today.getTime() - lastQuiz.getTime()) / (1000 * 60 * 60 * 24));
  return daysDiff === 1 ? (lastQuizDate ? 1 : 1) : 0;
};

export const calculatePercentage = (correct: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
};

export const getPerformanceAnalysis = (correct: number, total: number): string => {
  const percentage = calculatePercentage(correct, total);
  if (percentage >= 90) return 'Excellent';
  if (percentage >= 80) return 'Good';
  if (percentage >= 70) return 'Satisfactory';
  if (percentage >= 60) return 'Pass';
  return 'Needs Improvement';
};

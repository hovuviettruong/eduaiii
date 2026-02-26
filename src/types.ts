export type Subject = 'Toán' | 'Vật lý' | 'Hóa học';
export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type QuestionType = 'Direct' | 'Applied';
export type RiskLevel = 'Thấp' | 'Trung bình' | 'Cao';
export type Language = 'vi' | 'en';
export type Theme = 'light' | 'dark';

export interface Question {
  id: string;
  subject: Subject;
  topic: string;
  difficulty: Difficulty;
  type: QuestionType;
  content: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  pairedQuestionId?: string;
}

export interface AnswerRecord {
  id: string;
  questionId: string;
  question: Question;
  selectedAnswerIndex: number;
  isCorrect: boolean;
  timeTakenMs: number;
  timestamp: number;
}

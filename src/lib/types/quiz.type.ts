export enum QuizStatus {
  DRAFT = "draft",
  OPEN = "open",
  CLOSED = "closed",
  ARCHIVED = "archived",
}

export interface Quiz {
  id: string;
  courseId: string;
  lessonId: string | null;
  title: string;
  durationMinutes: number | null;
  maxAttempts: number;
  shuffleQuestions: boolean;
  status: QuizStatus;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
  course?: {
    id: string;
    title?: string;
    name?: string;
  };
}

export interface CreateQuizDto {
  courseId: string;
  lessonId?: string;
  title: string;
  durationMinutes?: number | null;
  maxAttempts?: number;
  shuffleQuestions?: boolean;
  status?: QuizStatus;
}

export interface UpdateQuizDto {
  title?: string;
  lessonId?: string | null;
  durationMinutes?: number | null;
  maxAttempts?: number;
  shuffleQuestions?: boolean;
  status?: QuizStatus;
}

export interface QuizQuestion {
  id: string;
  quizId: string;
  questionId: string;
  score: number;
  orderIndex: number;
  question?: any; // To be populated with QuestionBank details
}

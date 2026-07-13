export enum QuestionTypeEnum {
  MCQ_SINGLE = 'MCQ_SINGLE',
  MCQ_MULTIPLE = 'MCQ_MULTIPLE',
  TRUE_FALSE = 'TRUE_FALSE',
}

export enum QuestionStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  ARCHIVED = 'archived',
}

export interface QuestionOption {
  id: string;
  content: string;
  isCorrect: boolean;
  orderIndex: number;
}

export interface QuestionBank {
  id: string;
  courseId: string;
  lessonId: string | null;
  questionType: QuestionTypeEnum;
  content: string;
  difficulty: string;
  status: QuestionStatus;
  createdAt: string;
  updatedAt: string;
  course?: { id: string; title: string };
  lesson?: { id: string; title: string };
  options?: QuestionOption[];
}

export interface CreateOptionDto {
  content: string;
  isCorrect: boolean;
  orderIndex: number;
}

export interface CreateQuestionDto {
  courseId: string;
  lessonId?: string | null;
  questionType: QuestionTypeEnum;
  content: string;
  difficulty?: string;
  status?: QuestionStatus;
  options?: CreateOptionDto[];
}

export interface UpdateQuestionDto extends Partial<CreateQuestionDto> {}

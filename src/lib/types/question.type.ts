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

export enum QuestionApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
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
  approvalStatus: QuestionApprovalStatus;
  rejectionReason?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
  course?: { id: string; title: string; name?: string };
  lesson?: { id: string; title: string };
  creator?: { id: string; fullName: string; email?: string; role?: string } | null;
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
  approvalStatus?: QuestionApprovalStatus;
  options?: CreateOptionDto[];
}

export interface UpdateQuestionDto extends Partial<CreateQuestionDto> {}

export interface ReviewQuestionDto {
  status: QuestionApprovalStatus;
  rejectionReason?: string;
}

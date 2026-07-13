import { axiosClient as api } from "./axios";
import { Quiz, CreateQuizDto, UpdateQuizDto, QuizStatus } from "../types/quiz.type";
import { ApiResponse } from "../types/api.types";

export const quizApi = {
  getQuizzes: async (params?: { courseId?: string; status?: string; search?: string }) => {
    return api.get<ApiResponse<Quiz[]>>("/quizzes", { params }).then((res) => res.data);
  },

  getQuizById: async (id: string) => {
    return api.get<ApiResponse<Quiz>>(`/quizzes/${id}`).then((res) => res.data);
  },

  createQuiz: async (data: CreateQuizDto) => {
    return api.post<ApiResponse<Quiz>>("/quizzes", data).then((res) => res.data);
  },

  updateQuiz: async (id: string, data: UpdateQuizDto) => {
    return api.patch<ApiResponse<Quiz>>(`/quizzes/${id}`, data).then((res) => res.data);
  },

  updateQuizStatus: async (id: string, status: QuizStatus) => {
    return api.patch<ApiResponse<Quiz>>(`/quizzes/${id}/status`, { status }).then((res) => res.data);
  },

  deleteQuiz: async (id: string) => {
    return api.delete<ApiResponse<any>>(`/quizzes/${id}`).then((res) => res.data);
  },

  getQuizQuestions: async (quizId: string) => {
    return api.get<ApiResponse<any>>(`/quizzes/${quizId}/questions`).then((res) => res.data);
  },

  addQuestionToQuiz: async (quizId: string, questionId: string, score: number = 1) => {
    return api.post<ApiResponse<any>>(`/quizzes/${quizId}/questions`, { questionId, score }).then((res) => res.data);
  },

  addMultipleQuestionsToQuiz: async (quizId: string, questions: { questionId: string; score?: number }[]) => {
    return api.post<ApiResponse<any>>(`/quizzes/${quizId}/questions/bulk`, { questions }).then((res) => res.data);
  },

  removeQuestionFromQuiz: async (quizId: string, questionId: string) => {
    return api.delete<ApiResponse<any>>(`/quizzes/${quizId}/questions/${questionId}`).then((res) => res.data);
  },
};

import { axiosClient } from "./axios";
import {
  QuestionBank,
  CreateQuestionDto,
  UpdateQuestionDto,
} from "../types/question.type";
import { ApiResponse, PaginatedResponse } from "../types/api.types";

export const questionBankApi = {
  /** Lấy danh sách câu hỏi */
  getQuestions: async (params?: {
    courseId?: string;
    lessonId?: string;
    type?: string;
  }): Promise<ApiResponse<QuestionBank[]>> => {
    // Lưu ý: Backend trả về { success: true, data: QuestionBank[] } nhưng
    // không phân trang, nên ta dùng kiểu trực tiếp thay vì PaginatedResponse.
    const res = await axiosClient.get("/question-bank", { params });
    return res.data;
  },

  /** Lấy chi tiết câu hỏi (kèm options) */
  getQuestionById: async (id: string): Promise<ApiResponse<QuestionBank>> => {
    const res = await axiosClient.get(`/question-bank/${id}`);
    return res.data;
  },

  /** Tạo câu hỏi mới */
  createQuestion: async (
    data: CreateQuestionDto
  ): Promise<ApiResponse<QuestionBank>> => {
    const res = await axiosClient.post("/question-bank", data);
    return res.data;
  },

  /** Cập nhật câu hỏi */
  updateQuestion: async (
    id: string,
    data: UpdateQuestionDto
  ): Promise<ApiResponse<QuestionBank>> => {
    const res = await axiosClient.patch(`/question-bank/${id}`, data);
    return res.data;
  },

  /** Xóa câu hỏi */
  deleteQuestion: async (id: string): Promise<ApiResponse<void>> => {
    const res = await axiosClient.delete(`/question-bank/${id}`);
    return res.data;
  },
};

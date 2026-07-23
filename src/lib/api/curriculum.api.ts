import { axiosClient } from "./axios";
import * as ApiTypes from "@/lib/types/api.types";

export interface CreateChapterDto {
  title: string;
  description?: string;
}

export interface UpdateChapterDto {
  title?: string;
  description?: string;
}

export interface ReorderDto {
  orderedIds: string[];
}

export interface CreateLessonDto {
  title: string;
  contentSummary?: string;
  status?: string;
}

export interface UpdateLessonDto {
  title?: string;
  contentSummary?: string;
  status?: string;
}

export const curriculumApi = {
  // CHAPTERS
  getChapters: async (courseId: string) => {
    const response = await axiosClient.get<ApiTypes.ApiResponse<any[]>>(`/courses/${courseId}/chapters`);
    return response.data;
  },

  createChapter: async (courseId: string, data: CreateChapterDto) => {
    const response = await axiosClient.post<ApiTypes.ApiResponse<any>>(`/courses/${courseId}/chapters`, data);
    return response.data;
  },

  updateChapter: async (courseId: string, chapterId: string, data: UpdateChapterDto) => {
    const response = await axiosClient.patch<ApiTypes.ApiResponse<any>>(`/courses/${courseId}/chapters/${chapterId}`, data);
    return response.data;
  },

  deleteChapter: async (courseId: string, chapterId: string) => {
    const response = await axiosClient.delete<ApiTypes.ApiResponse<any>>(`/courses/${courseId}/chapters/${chapterId}`);
    return response.data;
  },

  reorderChapters: async (courseId: string, data: ReorderDto) => {
    const response = await axiosClient.patch<ApiTypes.ApiResponse<any>>(`/courses/${courseId}/chapters/reorder`, data);
    return response.data;
  },

  // LESSONS
  createLesson: async (courseId: string, chapterId: string, data: CreateLessonDto) => {
    const response = await axiosClient.post<ApiTypes.ApiResponse<any>>(`/courses/${courseId}/chapters/${chapterId}/lessons`, data);
    return response.data;
  },

  updateLesson: async (courseId: string, chapterId: string, lessonId: string, data: UpdateLessonDto) => {
    const response = await axiosClient.patch<ApiTypes.ApiResponse<any>>(`/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}`, data);
    return response.data;
  },

  deleteLesson: async (courseId: string, chapterId: string, lessonId: string) => {
    const response = await axiosClient.delete<ApiTypes.ApiResponse<any>>(`/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}`);
    return response.data;
  },

  reorderLessons: async (courseId: string, chapterId: string, data: ReorderDto) => {
    const response = await axiosClient.patch<ApiTypes.ApiResponse<any>>(`/courses/${courseId}/chapters/${chapterId}/lessons/reorder`, data);
    return response.data;
  },
};

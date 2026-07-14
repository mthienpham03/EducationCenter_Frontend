import { axiosClient } from "./axios";
import * as ApiTypes from "@/lib/types/api.types";

export interface DocumentEntity {
  id: string;
  title: string;
  type: string;
  fileUrl: string;
  status: string;
  visibility: string;
  createdAt: string;
  lesson?: {
    id: string;
    title: string;
  };
  owner?: {
    id: string;
    fullName: string;
  };
}

export interface GetDocumentsParams {
  search?: string;
  status?: string;
  visibility?: string;
  lessonId?: string;
  chapterId?: string;
  courseId?: string;
}

export const documentsApi = {
  getDocuments: async (params?: GetDocumentsParams) => {
    const response = await axiosClient.get<ApiTypes.ApiResponse<DocumentEntity[]>>("/documents", { params });
    return response.data;
  },
  
  uploadDocument: async (formData: FormData) => {
    const response = await axiosClient.post<ApiTypes.ApiResponse<DocumentEntity>>("/documents", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  addDocumentVersion: async (id: string, formData: FormData) => {
    const response = await axiosClient.post<ApiTypes.ApiResponse<any>>(`/documents/${id}/versions`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteDocument: async (id: string) => {
    const response = await axiosClient.delete<ApiTypes.ApiResponse<any>>(`/documents/${id}`);
    return response.data;
  },
};

/**
 * Documents API Service
 * Kết nối với backend /api/v1/documents
 */

import { axiosClient } from "./axios";
import * as ApiTypes from "@/lib/types/api.types";

// Types
export interface DocumentItem {
  id: string;
  lessonId: string | null;
  title: string;
  type: string;
  fileUrl: string;
  visibility: string | null;
  status: string;
  owner: {
    id: string;
    fullName: string;
    email?: string;
  } | null;
  lesson: {
    id: string;
    title: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentEntity extends DocumentItem {}

export interface DocumentDetail extends DocumentItem {
  versions: DocumentVersionItem[];
}

export interface DocumentVersionItem {
  id: string;
  versionNo: number;
  fileUrl: string;
  changeNote: string | null;
  createdBy: string;
  creator?: {
    id: string;
    fullName: string;
  } | null;
  createdAt: string;
}

export interface DocumentsResponse {
  success: boolean;
  data: DocumentItem[];
}

export interface DocumentDetailResponse {
  success: boolean;
  data: DocumentDetail;
}

export interface DocumentUploadResponse {
  success: boolean;
  message: string;
  data: DocumentItem & { currentVersion: number; cloudinaryUrl: string };
}

export interface DocumentVersionsResponse {
  success: boolean;
  data: DocumentVersionItem[];
}

export interface DocumentQueryParams {
  lessonId?: string;
  chapterId?: string;
  courseId?: string;
  status?: string;
  search?: string;
  visibility?: string;
}

export interface GetDocumentsParams extends DocumentQueryParams {}

export const documentService = {
  /**
   * Lấy danh sách tài liệu (lọc theo lesson/chapter/course/status, phân quyền theo role)
   */
  getDocuments: async (params?: DocumentQueryParams): Promise<DocumentsResponse> => {
    const response = await axiosClient.get<DocumentsResponse>("/documents", { params });
    return response.data;
  },

  /**
   * Lấy chi tiết tài liệu kèm danh sách phiên bản
   */
  getDocumentById: async (id: string): Promise<DocumentDetailResponse> => {
    const response = await axiosClient.get<DocumentDetailResponse>(`/documents/${id}`);
    return response.data;
  },

  /**
   * Upload tài liệu mới (Admin/Lecturer)
   * @param file - File tài liệu
   * @param data - Metadata: lessonId, title, type, visibility?, status?
   */
  uploadDocument: async (
    file: File,
    data: {
      lessonId: string;
      title: string;
      type: string;
      visibility?: string;
      status?: string;
    }
  ): Promise<DocumentUploadResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("lessonId", data.lessonId);
    formData.append("title", data.title);
    formData.append("type", data.type);
    if (data.visibility) formData.append("visibility", data.visibility);
    if (data.status) formData.append("status", data.status);

    const response = await axiosClient.post<DocumentUploadResponse>(
      "/documents/upload",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data;
  },

  /**
   * Cập nhật metadata tài liệu (Admin/Lecturer)
   */
  updateDocument: async (
    id: string,
    data: { title?: string; visibility?: string; status?: string }
  ): Promise<{ success: boolean; message: string; data: DocumentItem }> => {
    const response = await axiosClient.patch(`/documents/${id}`, data);
    return response.data;
  },

  /**
   * Xóa tài liệu (soft-delete) (Admin/Lecturer)
   */
  deleteDocument: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await axiosClient.delete(`/documents/${id}`);
    return response.data;
  },

  /**
   * Upload phiên bản mới cho tài liệu (Admin/Lecturer)
   */
  uploadVersion: async (
    documentId: string,
    file: File,
    changeNote?: string
  ): Promise<{ success: boolean; message: string; data: DocumentVersionItem }> => {
    const formData = new FormData();
    formData.append("file", file);
    if (changeNote) formData.append("changeNote", changeNote);

    const response = await axiosClient.post(
      `/documents/${documentId}/versions`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data;
  },

  /**
   * Lấy danh sách phiên bản của tài liệu
   */
  getVersions: async (documentId: string): Promise<DocumentVersionsResponse> => {
    const response = await axiosClient.get<DocumentVersionsResponse>(
      `/documents/${documentId}/versions`
    );
    return response.data;
  },

  /**
   * Lấy chi tiết một phiên bản
   */
  getVersionById: async (
    documentId: string,
    versionId: string
  ): Promise<{ success: boolean; data: DocumentVersionItem }> => {
    const response = await axiosClient.get(
      `/documents/${documentId}/versions/${versionId}`
    );
    return response.data;
  },
};

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

  updateDocument: async (id: string, data: any) => {
    const response = await axiosClient.patch<ApiTypes.ApiResponse<DocumentEntity>>(`/documents/${id}`, data);
    return response.data;
  },
};

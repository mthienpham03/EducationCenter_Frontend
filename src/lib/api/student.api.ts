import { axiosClient } from "./axios";

export interface StudentEnrollment {
  courseId: string;
  courseCode: string;
  courseName: string;
  courseDescription: string;
  courseStatus: string;
  classId: string;
  className: string;
  classStatus: string;
  enrolledAt: string;
  completedPercent: number;
}

export const studentApi = {
  getMyEnrollments: async () => {
    const response = await axiosClient.get<{ success: boolean; data: StudentEnrollment[] }>("/courses/my-enrollments");
    return response.data;
  },
};

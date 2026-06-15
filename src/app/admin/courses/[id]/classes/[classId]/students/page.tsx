import React from "react";
import EnrollStudentView from "@/components/courses/EnrollStudentView";

export default function EnrollStudentPage({ params }: { params: Promise<{ id: string; classId: string }> }) {
  const { id: courseId, classId } = React.use(params);
  
  return <EnrollStudentView courseId={courseId} classId={classId} />;
}

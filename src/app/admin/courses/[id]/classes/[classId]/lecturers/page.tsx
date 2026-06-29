import React from "react";
import AssignLecturerView from "@/components/courses/AssignLecturerView";

export default function AssignLecturerPage({ params }: { params: Promise<{ id: string; classId: string }> }) {
  const { id: courseId, classId } = React.use(params);
  
  return <AssignLecturerView courseId={courseId} classId={classId} />;
}

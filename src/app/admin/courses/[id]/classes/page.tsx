import React from "react";
import ClassManagementView from "@/components/courses/ClassManagementView";

export default function ClassManagementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  
  return <ClassManagementView courseId={id} />;
}

"use client";

import { useState } from "react";

export default function LecturerQuizzesPage() {
  const [quizzes] = useState([
    { id: 1, title: "IELTS Listening Practice - Test 1", questions: 40, duration: "30 mins", status: "Published" },
    { id: 2, title: "Comparing Bar Charts & Line Graphs", questions: 10, duration: "15 mins", status: "Published" },
    { id: 3, title: "Grammar Quiz - Conditional Sentences", questions: 20, duration: "20 mins", status: "Draft" },
  ]);

  return (
    <div className="p-stack-md max-w-container-max mx-auto space-y-stack-md">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-stack-md">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Đề trắc nghiệm & Bài kiểm tra</h1>
          <p className="font-body-md text-on-surface-variant mt-1">
            Thiết lập các đề thi thử, bài kiểm tra định kỳ và đánh giá năng lực học viên.
          </p>
        </div>
        <button className="bg-primary text-on-primary font-label-md px-stack-md py-stack-sm rounded-lg flex items-center gap-base hover:opacity-90 transition-all">
          <span className="material-symbols-outlined">add_circle</span>
          Tạo Đề Thi Mới
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
        {quizzes.map((quiz) => (
          <div key={quiz.id} className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between h-48 hover:shadow-[0_8px_35px_rgba(0,0,0,0.06)] hover:border-primary/20 transition-all">
            <div>
              <div className="flex justify-between items-start mb-3">
                <span className="w-10 h-10 rounded-lg bg-secondary-container/10 text-secondary flex items-center justify-center">
                  <span className="material-symbols-outlined">quiz</span>
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-caption font-semibold ${
                  quiz.status === "Published" ? "bg-green-500/10 text-green-600" : "bg-yellow-500/10 text-yellow-600"
                }`}>
                  {quiz.status}
                </span>
              </div>
              <h3 className="font-headline-md text-lg text-on-surface font-semibold line-clamp-1">{quiz.title}</h3>
              <p className="text-caption text-on-surface-variant mt-1">{quiz.questions} Câu hỏi &bull; Thời gian: {quiz.duration}</p>
            </div>
            
            <div className="pt-4 flex gap-2 border-t border-outline-variant/20 justify-end">
              <button className="text-caption font-semibold text-primary hover:underline flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">edit</span> Chỉnh sửa
              </button>
              <button className="text-caption font-semibold text-error hover:underline flex items-center gap-1 ml-4">
                <span className="material-symbols-outlined text-sm">delete</span> Xóa
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

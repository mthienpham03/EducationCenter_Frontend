"use client";

import { useState } from "react";

export default function LecturerDocumentsPage() {
  const [documents] = useState([
    { id: 1, name: "IELTS Writing Task 1 Tips.pdf", size: "2.4 MB", date: "2026-06-01", downloads: 48 },
    { id: 2, name: "Sample Essay Band 8.0.docx", size: "1.2 MB", date: "2026-06-03", downloads: 35 },
    { id: 3, name: "Vocabulary List - Education Topic.xlsx", size: "520 KB", date: "2026-06-04", downloads: 29 },
  ]);

  return (
    <div className="p-stack-md max-w-container-max mx-auto space-y-stack-md">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-stack-md">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Tài liệu học tập</h1>
          <p className="font-body-md text-on-surface-variant mt-1">
            Quản lý, tải lên và chia sẻ giáo trình, tài liệu tham khảo cho học viên.
          </p>
        </div>
        <button className="bg-primary text-on-primary font-label-md px-stack-md py-stack-sm rounded-lg flex items-center gap-base hover:opacity-90 transition-all">
          <span className="material-symbols-outlined">upload</span>
          Tải Lên Tài Liệu
        </button>
      </div>

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
        <div className="p-6 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low/30">
          <h3 className="font-headline-md text-lg text-on-surface">Danh sách tài liệu đã tải lên</h3>
        </div>
        
        <div className="divide-y divide-outline-variant/20">
          {documents.map((doc) => (
            <div key={doc.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-surface-container-low/20 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-tertiary-container/10 text-tertiary flex items-center justify-center">
                  <span className="material-symbols-outlined">description</span>
                </div>
                <div>
                  <h4 className="font-body-md font-semibold text-on-surface">{doc.name}</h4>
                  <p className="text-caption text-on-surface-variant">{doc.size} &bull; Tải lên ngày {doc.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right sm:text-left">
                  <p className="text-caption text-on-surface-variant">Lượt tải xuống</p>
                  <p className="text-body-md font-bold text-on-surface">{doc.downloads}</p>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-all" title="Tải xuống">
                    <span className="material-symbols-outlined">download</span>
                  </button>
                  <button className="p-2 text-error hover:bg-error-container/20 rounded-lg transition-all" title="Xóa">
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

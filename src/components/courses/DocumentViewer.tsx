import React from 'react';

interface DocumentProps {
  document: {
    title: string;
    type: string;
    fileUrl: string;
  } | null;
  lessonSummary?: string;
}

export default function DocumentViewer({ document, lessonSummary }: DocumentProps) {
  if (!document) {
    return (
      <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-8">
        <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-3xl">menu_book</span>
        </div>
        <h3 className="font-headline-sm text-on-surface mb-2">Không gian học tập</h3>
        <p className="text-on-surface-variant text-center max-w-md">
          {lessonSummary || "Chọn một bài học hoặc tài liệu từ mục lục bên phải để bắt đầu."}
        </p>
      </div>
    );
  }

  const docTypeLower = document.type.toLowerCase();
  const isVideo = docTypeLower.includes('video');
  const isPdf = docTypeLower.includes('pdf');

  return (
    <div className="w-full h-full flex flex-col bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden shadow-sm">
      <div className="p-4 border-b border-outline-variant/30 bg-surface">
        <h2 className="font-title-lg font-bold text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">
            {isVideo ? 'play_circle' : 'description'}
          </span>
          {document.title}
        </h2>
      </div>
      
      <div className="flex-1 w-full bg-[#1e1e1e] relative min-h-[500px]">
        {isVideo ? (
          <video 
            controls 
            className="w-full h-full absolute inset-0 object-contain"
            src={document.fileUrl}
            controlsList="nodownload"
          >
            Trình duyệt của bạn không hỗ trợ thẻ video.
          </video>
        ) : isPdf ? (
          <iframe 
            src={`${document.fileUrl}#toolbar=0`} 
            className="w-full h-full absolute inset-0 border-0"
            title={document.title}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-white/70">
            <span className="material-symbols-outlined text-5xl mb-4 opacity-50">description</span>
            <p className="mb-4">Không thể hiển thị trực tiếp định dạng tài liệu này.</p>
            <a 
              href={document.fileUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-primary text-on-primary px-6 py-2 rounded-lg font-label-md hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">download</span>
              Tải xuống để xem
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { documentsApi, DocumentEntity } from "@/lib/api/documents.api";
import DocumentViewer from "@/components/courses/DocumentViewer";
import dayjs from "dayjs";
import "dayjs/locale/vi";

dayjs.locale("vi");

export default function StudentDocumentsPage() {
  const [documents, setDocuments] = useState<DocumentEntity[]>([]);
  const [filteredDocs, setFilteredDocs] = useState<DocumentEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all"); // all, video, pdf, ppt

  // Viewer Modal
  const [selectedDoc, setSelectedDoc] = useState<DocumentEntity | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await documentsApi.getDocuments();
      if (res.success) {
        setDocuments(res.data || []);
        setFilteredDocs(res.data || []);
      }
    } catch (err) {
      console.error("Error fetching documents:", err);
      setError("Không thể tải danh sách tài liệu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = documents;
    
    // Apply search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(doc => doc.title.toLowerCase().includes(q));
    }

    // Apply type filter
    if (activeFilter !== "all") {
      result = result.filter(doc => {
        const typeLower = doc.type.toLowerCase();
        if (activeFilter === "video" && typeLower.includes("video")) return true;
        if (activeFilter === "pdf" && typeLower.includes("pdf")) return true;
        if (activeFilter === "ppt" && (typeLower.includes("ppt") || typeLower.includes("presentation"))) return true;
        return false;
      });
    }

    setFilteredDocs(result);
  }, [searchQuery, activeFilter, documents]);

  const getDocIconAndColor = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes("video")) return { icon: "play_circle", color: "text-error", bg: "bg-error/10" };
    if (t.includes("pdf")) return { icon: "picture_as_pdf", color: "text-primary", bg: "bg-primary/10" };
    if (t.includes("ppt") || t.includes("presentation")) return { icon: "slideshow", color: "text-secondary", bg: "bg-secondary/10" };
    return { icon: "description", color: "text-tertiary", bg: "bg-tertiary/10" };
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-display-sm font-display-sm font-bold text-on-surface mb-2 flex items-center gap-3">
            <span className="material-symbols-outlined text-4xl text-primary">local_library</span>
            Thư viện Tài liệu
          </h1>
          <p className="text-on-surface-variant text-body-lg max-w-2xl">
            Nơi tổng hợp các tài liệu tham khảo chung và tài nguyên từ các khóa học bạn đang tham gia.
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/50 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          {[
            { id: "all", label: "Tất cả" },
            { id: "video", label: "Video" },
            { id: "pdf", label: "PDF" },
            { id: "ppt", label: "Slide bài giảng" },
          ].map(filter => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-5 py-2 rounded-full font-label-md whitespace-nowrap transition-all ${
                activeFilter === filter.id
                  ? "bg-primary text-on-primary shadow-md shadow-primary/20"
                  : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
        
        <div className="relative w-full md:w-72">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
          <input 
            type="text" 
            placeholder="Tìm kiếm tài liệu..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl focus:border-primary focus:ring-1 focus:ring-primary transition-all text-body-md"
          />
        </div>
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="h-64 rounded-2xl bg-surface-container-lowest animate-pulse border border-outline-variant/30"></div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-20 bg-surface-container-lowest rounded-2xl border border-outline-variant/30">
          <span className="material-symbols-outlined text-6xl text-error mb-4">error</span>
          <h3 className="text-title-lg font-bold text-on-surface">{error}</h3>
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="text-center py-20 bg-surface-container-lowest rounded-2xl border border-dashed border-outline-variant">
          <span className="material-symbols-outlined text-6xl text-on-surface-variant/50 mb-4">search_off</span>
          <h3 className="text-title-lg font-bold text-on-surface mb-2">Không tìm thấy tài liệu nào</h3>
          <p className="text-on-surface-variant">Hãy thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm của bạn.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDocs.map((doc) => {
            const { icon, color, bg } = getDocIconAndColor(doc.type);
            
            return (
              <div 
                key={doc.id}
                onClick={() => setSelectedDoc(doc)}
                className="group bg-surface-container-lowest rounded-2xl border border-outline-variant/50 overflow-hidden hover:shadow-xl hover:border-primary/40 transition-all cursor-pointer flex flex-col hover:-translate-y-1 duration-300"
              >
                {/* Card Top / Visual Area */}
                <div className={`h-32 ${bg} flex flex-col items-center justify-center relative overflow-hidden`}>
                  {/* Decorative background circle */}
                  <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/20 blur-xl"></div>
                  <div className="absolute -left-6 -bottom-6 w-20 h-20 rounded-full bg-black/5 blur-xl"></div>
                  
                  <span className={`material-symbols-outlined text-6xl ${color} group-hover:scale-110 transition-transform duration-500`}>
                    {icon}
                  </span>
                  
                  {/* Visibility Tag */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    {doc.visibility === 'public' ? (
                      <span className="px-2 py-0.5 bg-success/20 text-success text-[10px] uppercase font-bold rounded flex items-center gap-1 backdrop-blur-md">
                        <span className="material-symbols-outlined text-[12px]">public</span> Public
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-tertiary/20 text-tertiary text-[10px] uppercase font-bold rounded flex items-center gap-1 backdrop-blur-md">
                        <span className="material-symbols-outlined text-[12px]">lock</span> Khóa học
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-title-md font-bold text-on-surface line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                    {doc.title}
                  </h3>
                  
                  <div className="mt-auto space-y-2">
                    {doc.lesson && (
                      <p className="text-label-sm text-on-surface-variant flex items-start gap-1.5">
                        <span className="material-symbols-outlined text-[14px] mt-0.5 shrink-0">auto_stories</span>
                        <span className="line-clamp-1">{doc.lesson.title}</span>
                      </p>
                    )}
                    <div className="flex items-center justify-between text-label-sm text-on-surface-variant pt-2 border-t border-outline-variant/30">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                        {dayjs(doc.createdAt).format("DD/MM/YYYY")}
                      </span>
                      <span className="font-bold">{doc.type}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Viewer Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest w-full h-full max-w-7xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-outline-variant/50 bg-surface">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getDocIconAndColor(selectedDoc.type).bg} ${getDocIconAndColor(selectedDoc.type).color}`}>
                  <span className="material-symbols-outlined">
                    {getDocIconAndColor(selectedDoc.type).icon}
                  </span>
                </div>
                <div>
                  <h3 className="font-title-md font-bold text-on-surface leading-tight max-w-xl truncate">
                    {selectedDoc.title}
                  </h3>
                  <p className="text-label-sm text-on-surface-variant flex items-center gap-1">
                    {selectedDoc.visibility === 'public' ? 'Tài liệu chung' : 'Tài liệu khóa học'}
                    {selectedDoc.lesson && ` • ${selectedDoc.lesson.title}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a 
                  href={selectedDoc.fileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-primary-container text-on-primary-container rounded-lg font-label-md hover:opacity-90 transition-opacity"
                >
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  <span className="hidden sm:inline">Tải xuống</span>
                </a>
                <button 
                  onClick={() => setSelectedDoc(null)}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-highest text-on-surface-variant transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>
            
            {/* Modal Body: DocumentViewer */}
            <div className="flex-1 bg-surface-container-lowest overflow-hidden relative">
              <DocumentViewer 
                document={{
                  title: selectedDoc.title,
                  type: selectedDoc.type,
                  fileUrl: selectedDoc.fileUrl
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

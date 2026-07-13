"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { questionBankApi } from "@/lib/api/question-bank.api";
import { QuestionTypeEnum } from "@/lib/types/question.type";

interface QuestionBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (selectedQuestionIds: string[]) => void;
  existingQuestionIds: string[];
  courseId?: string;
}

export default function QuestionBankModal({ isOpen, onClose, onAdd, existingQuestionIds, courseId }: QuestionBankModalProps) {
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const { data: response, isLoading } = useQuery({
    queryKey: ["questions"],
    queryFn: () => questionBankApi.getQuestions(),
    enabled: isOpen,
  });

  const questions = response?.data || [];

  const availableQuestions = useMemo(() => {
    return questions.filter(q => 
      !existingQuestionIds.includes(q.id) && 
      q.content.toLowerCase().includes(search.toLowerCase()) &&
      (!courseId || q.courseId === courseId)
    );
  }, [questions, existingQuestionIds, search, courseId]);

  const handleToggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === availableQuestions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(availableQuestions.map(q => q.id)));
    }
  };

  const handleAdd = () => {
    if (selectedIds.size === 0) return;
    onAdd(Array.from(selectedIds));
    setSelectedIds(new Set());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-outline-variant/30 flex items-center justify-between bg-surface-container-lowest">
          <h2 className="font-headline-sm text-on-surface">Thêm câu hỏi từ Ngân hàng</h2>
          <button onClick={onClose} className="p-2 hover:bg-surface-container rounded-full text-on-surface-variant transition-colors">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-6 py-4 border-b border-outline-variant/20 flex gap-4 items-center bg-surface-container-lowest">
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm câu hỏi..."
              className="w-full pl-9 pr-4 py-2 bg-surface-container rounded-lg border border-outline-variant/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          </div>
          <div className="text-sm text-on-surface-variant font-medium">
            Đã chọn <span className="font-bold text-primary">{selectedIds.size}</span> câu hỏi
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-6 bg-surface-container-lowest">
          {isLoading ? (
            <div className="text-center py-10 text-on-surface-variant">Đang tải...</div>
          ) : availableQuestions.length === 0 ? (
            <div className="text-center py-10 text-on-surface-variant">Không có câu hỏi nào phù hợp.</div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3 px-4 py-2 bg-surface-container-low rounded-lg border border-outline-variant/30 font-medium text-sm text-on-surface-variant">
                <input 
                  type="checkbox" 
                  checked={selectedIds.size > 0 && selectedIds.size === availableQuestions.length}
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded text-primary focus:ring-primary border-outline-variant/50 cursor-pointer"
                />
                <span className="cursor-pointer select-none" onClick={handleSelectAll}>Chọn tất cả ({availableQuestions.length})</span>
              </div>
              {availableQuestions.map(q => (
                <div 
                  key={q.id} 
                  onClick={() => handleToggleSelect(q.id)}
                  className={`flex items-start gap-3 p-4 rounded-xl border transition-all cursor-pointer hover:shadow-sm ${
                    selectedIds.has(q.id) 
                      ? 'border-primary bg-primary-fixed' 
                      : 'border-outline-variant/30 hover:border-primary/30'
                  }`}
                >
                  <input 
                    type="checkbox" 
                    checked={selectedIds.has(q.id)}
                    onChange={() => {}} // Controlled by outer div onClick
                    className="w-4 h-4 mt-1 rounded text-primary focus:ring-primary border-outline-variant/50 cursor-pointer"
                  />
                  <div>
                    <p className="font-medium text-on-surface text-sm">{q.content}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs px-2 py-0.5 bg-surface-container-high rounded text-on-surface-variant font-semibold">
                        {q.questionType === QuestionTypeEnum.MCQ_SINGLE ? "Một đáp án" :
                         q.questionType === QuestionTypeEnum.MCQ_MULTIPLE ? "Nhiều đáp án" : "Đúng/Sai"}
                      </span>
                      <span className="text-xs px-2 py-0.5 bg-surface-container-high rounded text-on-surface-variant font-semibold">
                        Khó: {q.difficulty || "Chưa chọn"}
                      </span>
                      <span className="text-xs text-on-surface-variant opacity-70">
                        Khóa: {(q.course as any)?.title || (q.course as any)?.name || "Chưa phân loại"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-outline-variant/30 flex justify-end gap-3 bg-surface-container-lowest">
          <button
            onClick={onClose}
            className="px-5 py-2 font-label-md text-on-surface-variant hover:bg-surface-container rounded-xl transition-all"
          >
            Đóng
          </button>
          <button
            onClick={handleAdd}
            disabled={selectedIds.size === 0}
            className="px-6 py-2 bg-primary text-white font-label-md rounded-xl hover:opacity-90 disabled:opacity-50 transition-all shadow-md shadow-primary/20"
          >
            Thêm {selectedIds.size > 0 ? `(${selectedIds.size})` : ""}
          </button>
        </div>
      </div>
    </div>
  );
}

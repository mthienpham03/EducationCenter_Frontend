"use client";

import React, { useState, useMemo, useRef } from "react";
import { Specialization } from "@/lib/api/specialization.api";

interface SpecializationSelectorProps {
  availableSpecs: Specialization[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  loading?: boolean;
}

export default function SpecializationSelector({
  availableSpecs,
  selectedIds,
  onSelectionChange,
  loading = false,
}: SpecializationSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [swapPosition, setSwapPosition] = useState(false);
  const listContainerRef = useRef<HTMLDivElement>(null);

  // Filter chuyên ngành dựa trên search query
  const filteredSpecs = useMemo(() => {
    return availableSpecs.filter(
      (spec) =>
        spec.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        spec.code.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [availableSpecs, searchQuery]);

  // Lấy danh sách chuyên ngành được chọn
  const selectedSpecs = useMemo(() => {
    return availableSpecs.filter((spec) => selectedIds.includes(spec.id));
  }, [availableSpecs, selectedIds]);

  const handleToggleSpec = (specId: string) => {
    if (selectedIds.includes(specId)) {
      onSelectionChange(selectedIds.filter((id) => id !== specId));
    } else {
      onSelectionChange([...selectedIds, specId]);
    }
  };

  const handleRemoveSpec = (specId: string) => {
    onSelectionChange(selectedIds.filter((id) => id !== specId));
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const handleScrollUp = () => {
    if (listContainerRef.current) {
      listContainerRef.current.scrollBy({
        top: -150,
        behavior: "smooth",
      });
    }
  };

  const handleScrollDown = () => {
    if (listContainerRef.current) {
      listContainerRef.current.scrollBy({
        top: 150,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="space-y-3">
      {/* Label & Info with Swap Button */}
      <div className="flex items-center justify-between">
        <label className="block text-label-md font-bold text-on-surface">
          Chuyên ngành giảng dạy
          <span className="text-rose-500 ml-1">*</span>
        </label>
        <div className="flex items-center gap-2">
          <span className="text-xs text-on-surface-variant font-medium">
            {selectedIds.length} chuyên ngành được chọn
          </span>
          {selectedIds.length > 0 && (
            <button
              type="button"
              onClick={() => setSwapPosition(!swapPosition)}
              className="p-1 hover:bg-primary/10 rounded-lg transition-colors text-primary"
              title="Hoán đổi vị trí"
            >
              <span className="material-symbols-outlined text-lg">swap_vert</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Container with Flexbox */}
      <div className="flex flex-col gap-3" style={{ display: "flex", flexDirection: "column" }}>
        {/* Part 1: Search & List (Can be swapped) */}
        <div style={{ order: swapPosition && selectedIds.length > 0 ? 2 : 1 }} className="relative">
          {/* Search Box */}
          <div
            className={`relative border rounded-lg transition-all ${
              isOpen
                ? "border-primary ring-2 ring-primary/20 shadow-lg"
                : "border-outline-variant hover:border-outline"
            }`}
          >
            {/* Search Input */}
            <div className="flex items-center gap-2 px-3 py-2.5">
              <span className="material-symbols-outlined text-lg text-outline">search</span>
              <input
                type="text"
                placeholder="Tìm chuyên ngành theo tên hoặc mã..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsOpen(true)}
                onBlur={() => setTimeout(() => setIsOpen(false), 100)}
                disabled={loading}
                className="flex-1 bg-transparent border-none outline-none text-body-md text-on-surface placeholder-on-surface-variant/60 disabled:opacity-50"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="p-1 hover:bg-surface-container rounded-md transition-colors text-outline-variant hover:text-on-surface-variant"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              )}
              {isOpen && (
                <span className="material-symbols-outlined text-lg text-outline">
                  unfold_less
                </span>
              )}
            </div>
          </div>

          {/* Dropdown List */}
          {isOpen && (
            <>

              {/* Results Container */}
              <div className="absolute left-0 right-0 bottom-full mb-2 bg-white border border-outline-variant rounded-lg shadow-xl z-40 overflow-hidden"
                style={{ width: "100%" }}
              >
                {/* Header with Collapse Button */}
                {filteredSpecs.length > 0 && !loading && (
                  <div className="px-4 py-2 bg-surface-container/30 border-b border-outline-variant/20 flex items-center justify-between">
                    <span className="text-xs font-bold text-on-surface-variant">
                      Danh sách chuyên ngành ({filteredSpecs.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="p-1 hover:bg-surface-container rounded-md transition-colors text-outline-variant hover:text-on-surface-variant"
                      title={isExpanded ? "Thu gọn" : "Mở rộng"}
                    >
                      <span className="material-symbols-outlined text-lg">
                        {isExpanded ? "unfold_less" : "unfold_more"}
                      </span>
                    </button>
                  </div>
                )}
                {loading ? (
                  <div className="p-6 flex items-center justify-center text-on-surface-variant">
                    <div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin mr-2"></div>
                    <span className="text-sm">Đang tải...</span>
                  </div>
                ) : filteredSpecs.length === 0 ? (
                  <div className="p-6 text-center space-y-2">
                    <span className="material-symbols-outlined text-4xl text-outline-variant opacity-20 block">
                      search_off
                    </span>
                    <p className="text-sm text-on-surface-variant font-medium">
                      {searchQuery ? "Không tìm thấy chuyên ngành" : "Chưa có chuyên ngành nào"}
                    </p>
                    {!searchQuery && (
                      <p className="text-xs text-on-surface-variant/70">
                        Hãy tạo chuyên ngành ở trang Quản lý chuyên ngành
                      </p>
                    )}
                  </div>
                ) : (
                  <div
                    ref={listContainerRef}
                    className={`overflow-y-auto transition-all duration-300 ${
                      isExpanded ? "max-h-96" : "max-h-56"
                    }`}
                  >
                    {filteredSpecs.map((spec) => {
                      const isChecked = selectedIds.includes(spec.id);
                      return (
                        <label
                          key={spec.id}
                          className="flex items-center gap-3 px-4 py-3 border-b border-outline-variant/20 hover:bg-surface-container/50 cursor-pointer transition-colors group last:border-b-0"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleSpec(spec.id)}
                            className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-2 focus:ring-primary/20 cursor-pointer"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="font-bold text-xs px-2 py-1 rounded bg-primary/10 text-primary font-mono">
                                {spec.code}
                              </span>
                              {isChecked && (
                                <span className="material-symbols-outlined text-sm text-emerald-600 font-bold">
                                  check_circle
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-on-surface font-medium truncate">{spec.name}</p>
                            {spec.description && (
                              <p className="text-xs text-on-surface-variant truncate">
                                {spec.description}
                              </p>
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}

                {/* Footer Stats & Scroll Controls */}
                {filteredSpecs.length > 0 && (
                  <div className="px-4 py-3 bg-surface border-t border-outline-variant/20 flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <span className="text-xs text-on-surface-variant font-medium">
                        Hiển thị {filteredSpecs.length} / {availableSpecs.length}
                      </span>
                      {selectedIds.length > 0 && (
                        <span className="text-primary font-bold ml-2 text-xs">
                          {selectedIds.length} được chọn
                        </span>
                      )}
                    </div>
                    
                    {/* Scroll Controls */}
                    {filteredSpecs.length > 4 && (
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={handleScrollUp}
                          className="p-1.5 hover:bg-primary/10 rounded-md transition-colors text-primary hover:text-primary-fixed-variant"
                          title="Cuộn lên"
                        >
                          <span className="material-symbols-outlined text-lg">arrow_upward</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleScrollDown}
                          className="p-1.5 hover:bg-primary/10 rounded-md transition-colors text-primary hover:text-primary-fixed-variant"
                          title="Cuộn xuống"
                        >
                          <span className="material-symbols-outlined text-lg">arrow_downward</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Part 2: Selected Tags (Can be swapped) */}
        {selectedSpecs.length > 0 && (
          <div style={{ order: swapPosition ? 1 : 2 }}>
            <div className="relative">
              {/* Background gradient for scrolling effect */}
              <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-primary-fixed/10 to-transparent pointer-events-none z-10 rounded-l-lg" />
              <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-primary-fixed/10 to-transparent pointer-events-none z-10 rounded-r-lg" />
              
              {/* Scrollable tags container */}
              <div className="overflow-x-auto scrollbar-hide">
                <div className="flex gap-2 p-3 bg-primary-fixed/10 rounded-lg border border-primary/10 min-w-max">
                  {selectedSpecs.map((spec) => (
                    <div
                      key={spec.id}
                      className="flex items-center gap-1.5 bg-white border border-primary/30 rounded-full px-3 py-1.5 text-xs font-medium text-primary shadow-sm hover:shadow-md transition-all group whitespace-nowrap flex-shrink-0"
                    >
                      <span className="font-bold px-1.5 py-0 rounded text-[9px] bg-primary/10 text-primary-fixed-variant">{spec.code}</span>
                      <span className="text-primary-fixed-variant line-clamp-1 max-w-[120px]">{spec.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSpec(spec.id)}
                        className="ml-1 text-primary/60 hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                      >
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Scroll indicator */}
              {selectedSpecs.length > 3 && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                  <span className="material-symbols-outlined text-xs text-on-surface-variant animate-pulse">
                    chevron_right
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Empty State */}
      {availableSpecs.length === 0 && !loading && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
          <div className="flex gap-2">
            <span className="material-symbols-outlined text-amber-600 flex-shrink-0">
              info
            </span>
            <div>
              <p className="font-medium">Chưa có chuyên ngành</p>
              <p className="text-xs text-amber-700/80">Vui lòng tạo chuyên ngành trước khi thêm giảng viên mới.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

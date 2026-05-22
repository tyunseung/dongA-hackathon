"use client";

import { useRef, useState, DragEvent } from "react";
import { Upload, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  className?: string;
}

export default function FileUpload({
  onFileSelect,
  accept = ".pdf",
  className,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selected, setSelected] = useState<File | null>(null);

  const handleFile = (file: File) => {
    setSelected(file);
    onFileSelect(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div
      className={cn(
        "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors select-none",
        isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/30 hover:border-muted-foreground/50",
        className
      )}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {selected ? (
        <div className="flex items-center justify-center gap-2 text-foreground">
          <FileText className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium truncate max-w-[200px]">{selected.name}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelected(null);
            }}
            className="text-muted-foreground hover:text-destructive transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Upload className="w-8 h-8" />
          <p className="text-sm font-medium">PDF를 드래그하거나 클릭해서 업로드</p>
          <p className="text-xs">이력서, 포트폴리오 등 PDF 파일 지원</p>
        </div>
      )}
    </div>
  );
}

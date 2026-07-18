import { useState, useRef } from 'react';
import { HiOutlineCloudArrowUp, HiOutlineTrash, HiOutlineDocumentText } from 'react-icons/hi2';
import toast from 'react-hot-toast';

const ALLOWED_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.cpp', '.c', '.go', '.rb', '.txt'];
const MAX_FILE_SIZE = 500 * 1024; // 500 KB
const MAX_FILES = 5;

export default function FileUploader({ files, onChange }) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const getExtension = (filename) => {
    const parts = filename.split('.');
    return parts.length > 1 ? `.${parts.pop().toLowerCase()}` : '';
  };

  const validateFiles = (incomingFiles) => {
    const validated = [];
    const currentTotal = files.length;

    if (currentTotal + incomingFiles.length > MAX_FILES) {
      toast.error(`Maximum limit is ${MAX_FILES} files.`);
      return;
    }

    for (const file of incomingFiles) {
      const ext = getExtension(file.name);
      
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        toast.error(`File "${file.name}" has unsupported format. Allowed formats: ${ALLOWED_EXTENSIONS.join(', ')}`);
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        toast.error(`File "${file.name}" exceeds the size limit of 500 KB.`);
        continue;
      }

      validated.push(file);
    }

    if (validated.length > 0) {
      onChange([...files, ...validated]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      validateFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files) {
      validateFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (indexToRemove) => {
    const updated = files.filter((_, index) => index !== indexToRemove);
    onChange(updated);
  };

  const formatSize = (bytes) => {
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center ${
          isDragging
            ? 'border-[var(--color-accent)] bg-[var(--color-accent-muted)]'
            : 'border-[var(--color-border)] hover:border-[var(--color-border-hover)] bg-[var(--color-bg-secondary)]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          accept={ALLOWED_EXTENSIONS.join(',')}
        />
        <div
          className="flex items-center justify-center w-12 h-12 rounded-xl mb-4"
          style={{
            backgroundColor: isDragging ? 'var(--color-accent-glow)' : 'rgba(99, 102, 241, 0.08)',
          }}
        >
          <HiOutlineCloudArrowUp
            className={`w-6 h-6 transition-transform duration-300 ${
              isDragging ? '-translate-y-1' : ''
            }`}
            style={{ color: 'var(--color-accent)' }}
          />
        </div>
        <p className="text-sm font-semibold text-[var(--color-text)]">
          Drag & drop files here or <span style={{ color: 'var(--color-accent-hover)' }}>browse</span>
        </p>
        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
          Supports: JS, TS, Python, Java, C++, Go, Ruby (Max 500 KB per file)
        </p>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div
          className="rounded-xl border p-4 space-y-2 max-h-60 overflow-y-auto"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
            Selected Files ({files.length}/{MAX_FILES})
          </div>
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] transition-colors duration-200"
            >
              <div className="flex items-center gap-3">
                <HiOutlineDocumentText className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-[var(--color-text)] max-w-[200px] sm:max-w-xs truncate">
                    {file.name}
                  </span>
                  <span className="text-xs text-[var(--color-text-muted)]">
                    {formatSize(file.size)}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
                className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-error)] hover:bg-[var(--color-error-muted)] transition-all duration-200 cursor-pointer"
                title="Remove file"
              >
                <HiOutlineTrash className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import React from 'react';
import { FileText } from 'lucide-react';

function FileTypeIcon({ type }) {
  if (type === 'pdf') {
    return (
      <div className="w-8 h-8 rounded-md bg-white flex items-center justify-center shadow-sm">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M6 2h9l5 5v15a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" fill="#EA4335" />
          <path d="M15 2v5h5" fill="#F9AB9A" />
        </svg>
      </div>
    );
  }
  if (type === 'docx') {
    return (
      <div className="w-8 h-8 rounded-md bg-[#2B579A] flex items-center justify-center shadow-sm text-white text-[11px] font-bold">
        W
      </div>
    );
  }
  return (
    <div className="w-8 h-8 rounded-md bg-white flex items-center justify-center shadow-sm">
      <FileText size={16} className="text-gray-500" />
    </div>
  );
}

export default FileTypeIcon;

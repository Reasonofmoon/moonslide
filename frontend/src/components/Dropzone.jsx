import { useState, useRef } from 'react';

export default function Dropzone({ onFileSelect, disabled }) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const accept = '.pdf,.png,.jpg,.jpeg,.webp';
  const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'];

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled) return;
    const f = e.dataTransfer.files[0];
    if (f && validTypes.includes(f.type)) onFileSelect(f);
  };

  const handleChange = (e) => {
    const f = e.target.files[0];
    if (f) onFileSelect(f);
  };

  return (
    <div
      className={`dropzone-premium p-10 md:p-14 text-center ${dragOver ? 'drag-over' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />

      {/* Upload icon */}
      <div className="flex justify-center mb-4">
        <div className="dropzone-icon w-14 h-14 rounded-xl bg-stone-100 flex items-center justify-center transition-all duration-300">
          <svg className="w-6 h-6 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
        </div>
      </div>

      <p className="text-base font-semibold text-stone-700 mb-1">
        PDF 또는 이미지를 여기에 놓으세요
      </p>
      <p className="text-sm text-stone-400">
        클릭하여 파일을 선택할 수도 있습니다 · PDF, PNG, JPG, WEBP 지원
      </p>
    </div>
  );
}

export default function EditorToolbar({ fileName, slideCount, mode, onModeChange, onExport, onNewFile }) {
  return (
    <div className="editor-toolbar flex items-center justify-between px-5 py-2.5">
      {/* Left: Logo + File info */}
      <div className="flex items-center gap-3">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-teal-600 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 9.563C9 9.252 9.252 9 9.563 9h4.874c.311 0 .563.252.563.563v4.874c0 .311-.252.563-.563.563H9.564A.562.562 0 019 14.437V9.564z" />
            </svg>
          </div>
          <span className="font-semibold text-stone-800 text-sm">MoonSlide</span>
        </div>

        <div className="w-px h-5 bg-stone-200" />

        <span className="text-xs text-stone-400 font-medium">{fileName || '파일 없음'} · {slideCount}장</span>

        <button className="btn-secondary px-2.5 py-1.5 text-xs flex items-center gap-1">
          <span>+</span> 텍스트 추가
        </button>

        <button
          onClick={onNewFile}
          className="btn-secondary px-2.5 py-1.5 text-xs flex items-center gap-1"
          title="새 파일"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
        </button>
      </div>

      {/* Right: Mode toggle + Export */}
      <div className="flex items-center gap-2.5">
        {/* Mode toggle */}
        <div className="flex rounded-lg overflow-hidden border border-stone-200">
          <button
            onClick={() => onModeChange('design')}
            className={`px-3.5 py-2 text-xs font-semibold transition-colors ${
              mode === 'design'
                ? 'bg-teal-600 text-white'
                : 'bg-white text-stone-500 hover:bg-stone-50'
            }`}
          >
            🎨 디자인 유지
          </button>
          <button
            onClick={() => onModeChange('edit')}
            className={`px-3.5 py-2 text-xs font-semibold transition-colors ${
              mode === 'edit'
                ? 'bg-teal-600 text-white'
                : 'bg-white text-stone-500 hover:bg-stone-50'
            }`}
          >
            ✏️ 텍스트 편집
          </button>
        </div>

        <button
          onClick={onExport}
          className="btn-primary px-4 py-2 text-sm flex items-center gap-1.5"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          내보내기
        </button>
      </div>
    </div>
  );
}

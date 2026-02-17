export default function SlideSelector({ slides, selectedIndices, onSelectionChange, onAnalyze }) {
  const allSelected = selectedIndices.length === slides.length;

  const toggleSlide = (idx) => {
    if (selectedIndices.includes(idx)) {
      onSelectionChange(selectedIndices.filter((i) => i !== idx));
    } else {
      onSelectionChange([...selectedIndices, idx]);
    }
  };

  const selectAll = () => onSelectionChange(slides.map((_, i) => i));
  const selectNone = () => onSelectionChange([]);

  return (
    <div className="max-w-4xl mx-auto py-8 px-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">변환할 슬라이드 선택</h2>
          <p className="text-sm text-slate-500 mt-1">
            총 {slides.length}개의 슬라이드가 감지되었습니다. 변환이 필요한 슬라이드만 선택하세요.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Select controls */}
          <div className="flex rounded-xl overflow-hidden border border-slate-200">
            <button
              onClick={selectAll}
              className={`px-4 py-2 text-xs font-bold transition-colors ${
                allSelected ? 'bg-teal-50 text-teal-600' : 'bg-white text-slate-500 hover:bg-slate-50'
              }`}
            >
              전체 선택
            </button>
            <button
              onClick={selectNone}
              className={`px-4 py-2 text-xs font-bold transition-colors ${
                selectedIndices.length === 0 ? 'bg-teal-50 text-teal-600' : 'bg-white text-slate-500 hover:bg-slate-50'
              }`}
            >
              선택 해제
            </button>
          </div>

          {/* Analyze CTA */}
          <button
            onClick={onAnalyze}
            disabled={selectedIndices.length === 0}
            className={`btn-primary px-6 py-2.5 text-sm flex items-center gap-2 ${
              selectedIndices.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {selectedIndices.length}개 슬라이드 분석 시작
            <span>✓</span>
          </button>
        </div>
      </div>

      {/* Thumbnail grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {slides.map((slide, idx) => (
          <div
            key={idx}
            className={`slide-thumb ${selectedIndices.includes(idx) ? 'selected' : ''}`}
            onClick={() => toggleSlide(idx)}
          >
            <img
              src={slide.dataUrl}
              alt={`Slide ${idx + 1}`}
              className="w-full h-auto block rounded-lg"
              draggable={false}
            />
            <div className="check-badge">✓</div>
            {/* Slide number */}
            <div className="absolute bottom-2 left-2 bg-black/50 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
              {idx + 1}
            </div>
          </div>
        ))}
      </div>

      {/* Cost tip */}
      <div className="mt-6 flex items-start gap-3 bg-blue-50 rounded-xl px-4 py-3">
        <span className="text-blue-500 text-sm mt-0.5">ℹ️</span>
        <p className="text-xs text-blue-600">
          <strong>비용 절약 팁</strong> — 필요한 슬라이드만 선택하여 변환하면 AI 토큰 소모를 줄일 수 있습니다.
          (전체 슬라이드를 변환하려면 우측 상단의 "전체 선택" 버튼을 누르세요.)
        </p>
      </div>
    </div>
  );
}

export default function ProcessingStatus({ stage, progress, total, onCancel }) {
  const percent = total > 0 ? Math.round((progress / total) * 100) : 0;

  // Overall percent across 3 stages
  let overallPercent = 0;
  if (stage === 'rendering') overallPercent = Math.round((percent / 3));
  else if (stage === 'analyzing') overallPercent = 33 + Math.round((percent / 3));
  else if (stage === 'generating') overallPercent = 66 + Math.round((percent / 3));

  const steps = [
    { id: 'rendering',  label: 'PDF 구조 해석', sub: '이미지 고해상도 렌더링 중', icon: '✅' },
    { id: 'analyzing',  label: 'AI 레이아웃 분석', sub: `분석 중: ${progress} / ${total} 슬라이드`, icon: '⚙️' },
    { id: 'generating', label: 'PPTX 파일 생성', sub: '최종 결과물 구성 중', icon: '✨' },
  ];

  const getStepState = (stepId) => {
    const order = ['rendering', 'analyzing', 'generating'];
    const current = order.indexOf(stage);
    const stepIdx = order.indexOf(stepId);
    if (stepIdx < current) return 'completed';
    if (stepIdx === current) return 'active';
    return 'pending';
  };

  // SVG circle params
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (overallPercent / 100) * circumference;

  return (
    <div className="max-w-md mx-auto py-8 animate-slide-up">
      {/* Header with circle */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">처리 중...</h2>
          <p className="text-xs font-semibold tracking-[0.2em] text-teal-600 mt-1 uppercase">
            Progressive AI Engine Active
          </p>
        </div>

        {/* Circular progress */}
        <div className="relative w-20 h-20">
          <svg className="w-20 h-20" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="6" />
            <circle
              className="progress-ring-circle"
              cx="50" cy="50" r={radius}
              fill="none"
              stroke="#4f46e5"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-black text-teal-600">{overallPercent}%</span>
            <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase">Loading</span>
          </div>
        </div>
      </div>

      {/* Step list */}
      <div className="space-y-2">
        {steps.map((s) => {
          const state = getStepState(s.id);
          return (
            <div key={s.id} className={`step-item ${state}`}>
              <div className={`step-icon`}>
                {state === 'completed' ? '✅' :
                 state === 'active' ? s.icon : '⏳'}
              </div>
              <div>
                <p className={`font-bold text-sm ${state === 'pending' ? 'text-slate-400' : 'text-slate-800'}`}>
                  {s.label}
                </p>
                <p className="text-xs text-slate-400">{s.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cancel button */}
      {onCancel && (
        <button
          onClick={onCancel}
          className="mt-6 mx-auto flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-red-500 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          작업 중단
        </button>
      )}
    </div>
  );
}

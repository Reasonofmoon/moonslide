export default function ExportOptions({ onExportPptx, onExportZip, onExportLongImage, fileName, slideCount }) {
  const exports = [
    {
      id: 'zip',
      icon: '🖼️',
      title: '고화질 이미지 (ZIP)',
      desc: '모든 슬라이드를 개별 PNG로 압축',
      badge: '추천',
      onClick: onExportZip,
    },
    {
      id: 'pptx',
      icon: '📊',
      title: 'PPTX 파워포인트',
      desc: '편집 가능한 텍스트 박스로 변환',
      badge: null,
      onClick: onExportPptx,
    },
    {
      id: 'long',
      icon: '📜',
      title: '긴 이미지',
      desc: '슬라이드를 하나의 세로 PNG로',
      badge: null,
      onClick: onExportLongImage,
    },
  ];

  return (
    <div className="p-5 animate-slide-up">
      {/* File status */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
          <span className="text-base">✅</span>
        </div>
        <div>
          <p className="font-semibold text-sm text-stone-800 truncate max-w-[240px]">{fileName}</p>
          <p className="text-xs text-stone-400">{slideCount}장 렌더링 완료</p>
        </div>
      </div>

      {/* Export grid */}
      <div className="grid grid-cols-3 gap-3">
        {exports.map((exp) => (
          <button
            key={exp.id}
            onClick={exp.onClick}
            className={`export-card text-left relative ${exp.id === 'zip' ? 'recommended' : ''} hover:shadow-sm transition-all`}
          >
            {exp.badge && (
              <span className="absolute -top-2 right-3 bg-teal-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                {exp.badge}
              </span>
            )}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{exp.icon}</span>
            </div>
            <p className="font-semibold text-sm text-stone-800 mb-1">{exp.title}</p>
            <p className="text-xs text-stone-400 leading-relaxed">{exp.desc}</p>
            <div className="mt-3 flex items-center gap-1 text-xs font-medium text-teal-600">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              다운로드
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function SlidePreview({ slideData, showElements = true }) {
  if (!slideData) return null;

  return (
    <div className="relative w-full rounded-xl overflow-hidden shadow-lg border border-slate-200 bg-white">
      {/* Slide image */}
      <img
        src={slideData.imageDataUrl}
        alt={`Slide ${slideData.pageNum}`}
        className="w-full h-auto block"
      />

      {/* Overlay text elements */}
      {showElements && slideData.elements?.length > 0 && (
        <div className="absolute inset-0">
          {slideData.elements.map((el, idx) => (
            <div
              key={idx}
              className="absolute border border-teal-400/40 bg-teal-50/20 hover:bg-teal-100/40 hover:border-teal-500/60 transition-colors cursor-default group"
              style={{
                left: `${el.x}%`,
                top: `${el.y}%`,
                width: `${el.w}%`,
                height: `${el.h}%`,
              }}
              title={el.content}
            >
              {/* Tooltip on hover */}
              <div className="hidden group-hover:block absolute -top-8 left-0 z-10 px-2 py-1 bg-slate-800 text-white text-xs rounded whitespace-nowrap max-w-[200px] truncate">
                {el.type} · {el.fontSize}pt
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

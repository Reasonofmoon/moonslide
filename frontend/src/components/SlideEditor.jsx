import { useState, useRef, useEffect } from 'react';

export default function SlideEditor({
  slides,
  activeIndex,
  onActiveChange,
  onSelectElement,
  selectedElement,
  mode,
  onUpdateElement,
  onAddElement,
}) {
  const slide = slides[activeIndex];
  const canvasRef = useRef(null);
  const [editingIdx, setEditingIdx] = useState(null);
  const [editText, setEditText] = useState('');
  const [dragState, setDragState] = useState(null);
  const [resizeState, setResizeState] = useState(null);
  const [imageSize, setImageSize] = useState({ w: 0, h: 0 });

  // Drag effect
  useEffect(() => {
    if (!dragState) return;
    const handleMove = (e) => {
      const dx = ((e.clientX - dragState.startMouseX) / dragState.canvasW) * 100;
      const dy = ((e.clientY - dragState.startMouseY) / dragState.canvasH) * 100;
      const newX = Math.max(0, Math.min(100, dragState.startX + dx));
      const newY = Math.max(0, Math.min(100, dragState.startY + dy));
      if (onUpdateElement) {
        onUpdateElement(activeIndex, dragState.idx, { x: newX, y: newY });
      }
    };
    const handleUp = () => setDragState(null);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [dragState, activeIndex, onUpdateElement]);

  // Resize effect
  useEffect(() => {
    if (!resizeState) return;
    const handleMove = (e) => {
      const dx = ((e.clientX - resizeState.startMouseX) / resizeState.canvasW) * 100;
      const dy = ((e.clientY - resizeState.startMouseY) / resizeState.canvasH) * 100;
      const corner = resizeState.corner;
      let { x, y, w, h } = resizeState;

      if (corner === 'se') {
        w = Math.max(3, resizeState.startW + dx);
        h = Math.max(3, resizeState.startH + dy);
      } else if (corner === 'sw') {
        x = Math.max(0, resizeState.startX + dx);
        w = Math.max(3, resizeState.startW - dx);
        h = Math.max(3, resizeState.startH + dy);
      } else if (corner === 'ne') {
        y = Math.max(0, resizeState.startY + dy);
        w = Math.max(3, resizeState.startW + dx);
        h = Math.max(3, resizeState.startH - dy);
      } else if (corner === 'nw') {
        x = Math.max(0, resizeState.startX + dx);
        y = Math.max(0, resizeState.startY + dy);
        w = Math.max(3, resizeState.startW - dx);
        h = Math.max(3, resizeState.startH - dy);
      }

      if (onUpdateElement) {
        onUpdateElement(activeIndex, resizeState.idx, { x, y, w, h });
      }
    };
    const handleUp = () => setResizeState(null);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [resizeState, activeIndex, onUpdateElement]);

  if (!slide) return null;

  const elements = slide.elements || [];
  const showOverlays = mode === 'edit';

  const handleImageLoad = (e) => {
    setImageSize({ w: e.target.offsetWidth, h: e.target.offsetHeight });
  };

  const handleDoubleClick = (idx) => {
    if (mode !== 'edit') return;
    setEditingIdx(idx);
    setEditText(elements[idx]?.content || '');
  };

  const commitEdit = () => {
    if (editingIdx !== null && onUpdateElement) {
      onUpdateElement(activeIndex, editingIdx, { content: editText });
    }
    setEditingIdx(null);
    setEditText('');
  };

  const cancelEdit = () => {
    setEditingIdx(null);
    setEditText('');
  };

  const handleEditKeyDown = (e) => {
    if (e.key === 'Escape') cancelEdit();
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      commitEdit();
    }
  };

  const handleDragStart = (e, idx) => {
    if (mode !== 'edit' || editingIdx !== null) return;
    e.stopPropagation();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    setDragState({
      idx,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startX: elements[idx].x,
      startY: elements[idx].y,
      canvasW: rect.width,
      canvasH: rect.height,
    });
    onSelectElement(idx);
  };

  const handleResizeStart = (e, idx, corner) => {
    e.stopPropagation();
    e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const el = elements[idx];
    setResizeState({
      idx,
      corner,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startX: el.x,
      startY: el.y,
      startW: el.w,
      startH: el.h,
      x: el.x,
      y: el.y,
      canvasW: rect.width,
      canvasH: rect.height,
    });
  };

  const handleCanvasClick = () => {
    if (editingIdx !== null) commitEdit();
    onSelectElement(null);
  };

  const handleAddText = () => {
    if (onAddElement) {
      onAddElement(activeIndex, {
        type: 'text',
        content: '텍스트를 입력하세요',
        x: 35, y: 45, w: 30, h: 10,
        fontSize: 18, color: '#333333', bold: false, align: 'left',
      });
    }
  };

  const resizeCorners = [
    { key: 'nw', cls: '-top-1 -left-1', cursor: 'nw-resize' },
    { key: 'ne', cls: '-top-1 -right-1', cursor: 'ne-resize' },
    { key: 'sw', cls: '-bottom-1 -left-1', cursor: 'sw-resize' },
    { key: 'se', cls: '-bottom-1 -right-1', cursor: 'se-resize' },
  ];

  return (
    <div className="editor-canvas p-8" onClick={handleCanvasClick}>
      {/* Navigation arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); onActiveChange(Math.max(0, activeIndex - 1)); }}
            disabled={activeIndex === 0}
            className="absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg border border-slate-100 flex items-center justify-center disabled:opacity-30 hover:bg-slate-50 transition-all z-10"
          >
            <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onActiveChange(Math.min(slides.length - 1, activeIndex + 1)); }}
            disabled={activeIndex === slides.length - 1}
            className="absolute right-[380px] top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg border border-slate-100 flex items-center justify-center disabled:opacity-30 hover:bg-slate-50 transition-all z-10"
          >
            <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </>
      )}

      {/* Slide canvas */}
      <div
        ref={canvasRef}
        className="relative bg-white rounded-2xl shadow-xl overflow-hidden max-w-3xl w-full animate-fade-in"
        style={{ userSelect: 'none' }}
      >
        {/* Mode indicator */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-full px-4 py-1.5 text-xs font-semibold text-slate-500 pointer-events-none">
          {mode === 'design'
            ? '🎨 디자인 유지 모드 — 레이아웃 100% 보존'
            : '✏️ 편집 모드 — 클릭 선택, 더블클릭 편집, 드래그 이동'}
        </div>

        {/* Background image */}
        <img
          src={slide.dataUrl || slide.imageDataUrl}
          alt={`Slide ${activeIndex + 1}`}
          className="w-full h-auto block"
          draggable={false}
          onLoad={handleImageLoad}
        />

        {/* Text element overlays (edit mode only) */}
        {showOverlays && elements.map((el, i) => {
          const isSelected = selectedElement === i;
          const isEditing = editingIdx === i;

          return (
            <div
              key={i}
              className={`text-element-overlay ${isSelected ? 'active' : ''}`}
              style={{
                left: `${el.x}%`,
                top: `${el.y}%`,
                width: `${el.w}%`,
                height: `${el.h}%`,
                cursor: dragState?.idx === i ? 'grabbing' : (resizeState ? 'default' : 'grab'),
                zIndex: isSelected ? 20 : 10,
                background: el.bgColor || (slide.bgColor || '#ffffff'),
              }}
              onClick={(e) => { e.stopPropagation(); onSelectElement(i); }}
              onDoubleClick={(e) => { e.stopPropagation(); handleDoubleClick(i); }}
              onMouseDown={(e) => handleDragStart(e, i)}
            >
              {isEditing ? (
                <textarea
                  autoFocus
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={handleEditKeyDown}
                  onBlur={commitEdit}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full h-full p-1 bg-white/90 border-2 border-teal-500 rounded resize-none outline-none text-slate-900"
                  style={{
                    fontSize: `${Math.max(10, Math.min(el.fontSize || 14, 24))}px`,
                    fontWeight: el.bold ? 'bold' : 'normal',
                    textAlign: el.align || 'left',
                    color: el.color || '#333',
                    lineHeight: 1.4,
                  }}
                />
              ) : (
                <div
                  className="w-full h-full flex items-start overflow-hidden p-0.5 pointer-events-none"
                  style={{
                    fontSize: `${Math.max(8, Math.min((el.fontSize || 14) * (imageSize.w / 960 || 1), 28))}px`,
                    fontWeight: el.bold ? 'bold' : 'normal',
                    textAlign: el.align || 'left',
                    color: el.color || '#333333',
                    lineHeight: 1.3,
                  }}
                >
                  {el.content}
                </div>
              )}

              {/* Selection chrome with functional resize handles */}
              {isSelected && !isEditing && (
                <>
                  {resizeCorners.map(({ key, cls, cursor }) => (
                    <div
                      key={key}
                      className={`resize-handle ${cls}`}
                      style={{ cursor }}
                      onMouseDown={(e) => handleResizeStart(e, i, key)}
                    />
                  ))}
                  <div className="absolute -top-7 left-0 flex items-center gap-1">
                    <span className="bg-teal-600 text-white text-[10px] font-bold px-2 py-0.5 rounded whitespace-nowrap">
                      더블클릭으로 편집
                    </span>
                  </div>
                </>
              )}
            </div>
          );
        })}

        {/* Slide error/warning badge */}
        {slide.error && (
          <div className="absolute bottom-4 left-4 right-4 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-xs text-red-700 font-medium z-30">
            ⚠️ {slide.error}
          </div>
        )}
        {slide.warning && !slide.error && (
          <div className="absolute bottom-4 left-4 right-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 text-xs text-amber-700 font-medium z-30">
            💡 {slide.warning}
          </div>
        )}

        {/* Design mode cover */}
        {mode === 'design' && <div className="absolute inset-0 cursor-default" />}
      </div>

      {/* Bottom bar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3">
        <div className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-1.5 text-xs font-semibold text-slate-500 shadow-sm border border-slate-100">
          {activeIndex + 1} / {slides.length} 슬라이드
        </div>
        {mode === 'edit' && (
          <button
            onClick={(e) => { e.stopPropagation(); handleAddText(); }}
            className="bg-teal-600 text-white rounded-full px-4 py-1.5 text-xs font-bold shadow-md hover:bg-teal-700 transition-colors flex items-center gap-1"
          >
            + 텍스트 추가
          </button>
        )}
      </div>
    </div>
  );
}

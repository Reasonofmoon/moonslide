// PropertyInspector — right sidebar for element editing

export default function PropertyInspector({
  slide,
  selectedElement,
  onUpdateElement,
  onDeleteElement,
  activeSlideIdx,
}) {
  const elements = slide?.elements || [];
  const el = selectedElement !== null ? elements[selectedElement] : null;

  const update = (field, value) => {
    if (onUpdateElement && selectedElement !== null) {
      onUpdateElement(activeSlideIdx, selectedElement, { [field]: value });
    }
  };

  const handleContentChange = (e) => update('content', e.target.value);
  const handleFontSizeChange = (e) => update('fontSize', Number(e.target.value) || 14);
  const handleColorChange = (e) => update('color', e.target.value);
  const handleBoldToggle = () => update('bold', !el?.bold);
  const handleAlignChange = (align) => update('align', align);
  const handleDelete = () => {
    if (onDeleteElement && selectedElement !== null) {
      onDeleteElement(activeSlideIdx, selectedElement);
    }
  };

  return (
    <div className="editor-sidebar p-6 space-y-6 scrollbar-thin">
      <h3 className="font-black text-lg text-slate-900">속성 인스펙터</h3>

      {/* Recovery guide */}
      <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
        <h4 className="font-bold text-sm text-slate-700 flex items-center gap-2">
          🎯 복구 가이드
        </h4>
        <ul className="space-y-2 text-xs text-slate-500 leading-relaxed">
          <li className="flex gap-2">
            <span className="text-teal-600 font-bold shrink-0">1.</span>
            <span>편집 모드로 전환 후 텍스트 요소를 <strong>클릭</strong>하여 선택합니다.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-teal-600 font-bold shrink-0">2.</span>
            <span>텍스트 요소를 <strong>더블클릭</strong>하면 직접 내용을 수정할 수 있습니다.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-teal-600 font-bold shrink-0">3.</span>
            <span>선택된 요소를 <strong>드래그</strong>하여 위치를 변경합니다.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-teal-600 font-bold shrink-0">4.</span>
            <span>아래 속성 패널에서 글꼴 크기, 색상, 정렬 등을 조정합니다.</span>
          </li>
        </ul>
      </div>

      {/* Element count badge */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <span className="w-5 h-5 rounded-md bg-teal-100 text-teal-600 flex items-center justify-center font-bold text-[10px]">
          {elements.length}
        </span>
        <span>감지된 텍스트 요소</span>
      </div>

      {/* Selected element properties */}
      {el ? (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-teal-600 flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-teal-100 flex items-center justify-center text-xs font-black">T</span>
              텍스트 #{selectedElement + 1}
            </h4>
            <button
              onClick={handleDelete}
              className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors text-red-500 text-xs"
              title="요소 삭제"
            >
              🗑️
            </button>
          </div>

          {/* Content */}
          <div>
            <label className="text-[10px] font-semibold text-slate-400 tracking-wider mb-1.5 block">내용</label>
            <textarea
              value={el.content || ''}
              onChange={handleContentChange}
              rows={4}
              className="w-full bg-slate-50 rounded-xl p-3 text-sm text-slate-800 outline-none resize-none border-2 border-transparent focus:border-teal-200 transition-colors font-medium"
              placeholder="텍스트를 입력하세요..."
            />
          </div>

          {/* Position & Size */}
          <div>
            <label className="text-[10px] font-semibold text-slate-400 tracking-wider mb-1.5 block">위치 및 크기 (%)</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'X', field: 'x' },
                { label: 'Y', field: 'y' },
                { label: 'W', field: 'w' },
                { label: 'H', field: 'h' },
              ].map(({ label, field }) => (
                <div key={label} className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2">
                  <span className="text-xs font-bold text-slate-400 w-4">{label}</span>
                  <input
                    type="number"
                    value={Math.round((el[field] || 0) * 10) / 10}
                    onChange={(e) => update(field, Number(e.target.value))}
                    step="0.5"
                    min="0"
                    max="100"
                    className="bg-transparent text-sm font-semibold text-slate-800 w-full outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Font Size */}
          <div>
            <label className="text-[10px] font-semibold text-slate-400 tracking-wider mb-1.5 block">글꼴 크기 (pt)</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => update('fontSize', Math.max(6, (el.fontSize || 14) - 1))}
                className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-600 font-bold transition-colors"
              >−</button>
              <input
                type="number"
                value={el.fontSize || 14}
                onChange={handleFontSizeChange}
                className="flex-1 bg-slate-50 rounded-xl px-3 py-2 text-center text-sm font-bold text-slate-800 outline-none border-2 border-transparent focus:border-teal-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button
                onClick={() => update('fontSize', Math.min(120, (el.fontSize || 14) + 1))}
                className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-600 font-bold transition-colors"
              >+</button>
            </div>
          </div>

          {/* Bold + Alignment */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-semibold text-slate-400 tracking-wider mb-1.5 block">스타일</label>
              <div className="flex gap-1">
                <button
                  onClick={handleBoldToggle}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-black transition-colors ${
                    el.bold
                      ? 'bg-teal-600 text-white'
                      : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                  }`}
                >B</button>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-400 tracking-wider mb-1.5 block">정렬</label>
              <div className="flex gap-1">
                {['left', 'center', 'right'].map((a) => (
                  <button
                    key={a}
                    onClick={() => handleAlignChange(a)}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs transition-colors ${
                      (el.align || 'left') === a
                        ? 'bg-teal-600 text-white'
                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    {a === 'left' ? '◧' : a === 'center' ? '◫' : '◨'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="text-[10px] font-semibold text-slate-400 tracking-wider mb-1.5 block">텍스트 색상</label>
            <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2">
              <input
                type="color"
                value={el.color || '#333333'}
                onChange={handleColorChange}
                className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch-wrapper]:p-0"
              />
              <input
                type="text"
                value={el.color || '#333333'}
                onChange={handleColorChange}
                className="bg-transparent text-sm font-mono font-semibold text-slate-700 w-full outline-none"
              />
            </div>
          </div>

          {/* Element type badge */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="px-2 py-0.5 rounded bg-slate-100 font-semibold">{el.type || 'text'}</span>
              <span>슬라이드 {activeSlideIdx + 1}의 요소</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-slate-400">
          <div className="text-4xl mb-3">🖱️</div>
          <p className="text-sm font-bold mb-1">텍스트 요소를 선택하세요</p>
          <p className="text-xs text-slate-300 leading-relaxed">
            편집 모드로 전환한 후<br />텍스트 요소를 클릭하면<br />여기에 속성이 표시됩니다
          </p>
        </div>
      )}
    </div>
  );
}

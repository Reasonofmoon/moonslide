import { useState, useCallback, useEffect } from 'react';
import ApiKeyInput from './components/ApiKeyInput';
import Dropzone from './components/Dropzone';
import SlideSelector from './components/SlideSelector';
import ProcessingStatus from './components/ProcessingStatus';
import EditorToolbar from './components/EditorToolbar';
import SlideEditor from './components/SlideEditor';
import PropertyInspector from './components/PropertyInspector';
import ExportOptions from './components/ExportOptions';
import OnboardingGuide from './components/OnboardingGuide';
import { loadPdf, renderAllPages, readImageFile } from './services/pdfService';
import { analyzeSlides } from './services/geminiService';
import { generatePptx } from './services/pptxService';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const VIEW = {
  LANDING: 'landing',
  SELECT: 'select',
  PROCESSING: 'processing',
  EDITOR: 'editor',
};

function App() {
  // Core state
  const [apiKey, setApiKey] = useState(localStorage.getItem('gemini_api_key') || null);
  const [file, setFile] = useState(null);
  const [view, setView] = useState(VIEW.LANDING);

  // Slide data
  const [slideImages, setSlideImages] = useState([]);
  const [selectedIndices, setSelectedIndices] = useState([]);
  const [analyzedSlides, setAnalyzedSlides] = useState([]);
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);
  const [selectedElement, setSelectedElement] = useState(null);

  // Processing state
  const [processingStage, setProcessingStage] = useState('');
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingTotal, setProcessingTotal] = useState(0);

  // Editor mode & UI
  const [editorMode, setEditorMode] = useState('design');
  const [showExport, setShowExport] = useState(false);
  const [error, setError] = useState('');
  const [showGuide, setShowGuide] = useState(
    () => !localStorage.getItem('moonslide_guide_seen')
  );

  // Auto-dismiss errors after 6 seconds
  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(''), 6000);
    return () => clearTimeout(timer);
  }, [error]);

  // Handle file selection
  const handleFileSelect = useCallback(async (selectedFile) => {
    setFile(selectedFile);
    setError('');
    try {
      let images;
      if (selectedFile.type === 'application/pdf') {
        const pdf = await loadPdf(selectedFile);
        images = await renderAllPages(pdf, 2);
      } else {
        const imgData = await readImageFile(selectedFile);
        images = [{ pageNum: 1, ...imgData }];
      }
      setSlideImages(images);
      setSelectedIndices(images.map((_, i) => i));
      setActiveSlideIdx(0);
      setView(VIEW.SELECT);
    } catch (err) {
      setError(`파일을 로드할 수 없습니다: ${err.message}`);
    }
  }, []);

  // Handle AI analysis
  const handleAnalyze = useCallback(async () => {
    if (!apiKey || selectedIndices.length === 0) return;
    setView(VIEW.PROCESSING);
    setError('');

    try {
      const selectedSlides = selectedIndices.map((i) => slideImages[i]);

      setProcessingStage('rendering');
      setProcessingProgress(selectedSlides.length);
      setProcessingTotal(selectedSlides.length);
      await new Promise((r) => setTimeout(r, 400));

      setProcessingStage('analyzing');
      setProcessingProgress(0);
      setProcessingTotal(selectedSlides.length);

      const analyzed = await analyzeSlides(apiKey, selectedSlides, (done, total) => {
        setProcessingProgress(done);
        setProcessingTotal(total);
      });

      setAnalyzedSlides(analyzed);

      setProcessingStage('generating');
      setProcessingProgress(1);
      setProcessingTotal(1);
      await new Promise((r) => setTimeout(r, 500));

      setActiveSlideIdx(0);
      setSelectedElement(null);
      setView(VIEW.EDITOR);
    } catch (err) {
      setError(`분석에 실패했습니다: ${err.message}`);
      setView(VIEW.SELECT);
    }
  }, [apiKey, selectedIndices, slideImages]);

  // Export handlers
  const handleExportPptx = useCallback(async () => {
    if (analyzedSlides.length === 0) return;
    const baseName = file?.name?.replace(/\.\w+$/, '') || 'output';
    const mode = editorMode === 'design' ? 'image' : 'editable';
    try {
      await generatePptx(analyzedSlides, mode, `${baseName}_MoonSlide.pptx`);
    } catch (err) {
      setError(`PPTX 생성 실패: ${err.message}`);
    }
  }, [analyzedSlides, editorMode, file]);

  const handleExportZip = useCallback(async () => {
    if (analyzedSlides.length === 0) return;
    try {
      const zip = new JSZip();
      const baseName = file?.name?.replace(/\.\w+$/, '') || 'slides';
      analyzedSlides.forEach((slide, i) => {
        const imgSrc = slide.dataUrl || slide.imageDataUrl;
        const base64 = imgSrc.split(',')[1];
        zip.file(`${baseName}_slide_${String(i + 1).padStart(2, '0')}.png`, base64, { base64: true });
      });
      const blob = await zip.generateAsync({ type: 'blob' });
      saveAs(blob, `${baseName}_고화질이미지.zip`);
    } catch (err) {
      setError(`ZIP 생성 실패: ${err.message}`);
    }
  }, [analyzedSlides, file]);

  const handleExportLongImage = useCallback(async () => {
    if (analyzedSlides.length === 0) return;
    try {
      const images = await Promise.all(
        analyzedSlides.map((slide) => {
          return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.src = slide.dataUrl || slide.imageDataUrl;
          });
        })
      );
      const maxW = Math.max(...images.map((i) => i.width));
      const totalH = images.reduce((sum, i) => sum + (i.height * maxW / i.width), 0);

      const canvas = document.createElement('canvas');
      canvas.width = maxW;
      canvas.height = totalH;
      const ctx = canvas.getContext('2d');

      let y = 0;
      for (const img of images) {
        const h = img.height * maxW / img.width;
        ctx.drawImage(img, 0, y, maxW, h);
        y += h;
      }

      canvas.toBlob((blob) => {
        const baseName = file?.name?.replace(/\.\w+$/, '') || 'output';
        saveAs(blob, `${baseName}_긴이미지.png`);
      }, 'image/png');
    } catch (err) {
      setError(`이미지 생성 실패: ${err.message}`);
    }
  }, [analyzedSlides, file]);

  const handleReset = () => {
    setFile(null);
    setSlideImages([]);
    setSelectedIndices([]);
    setAnalyzedSlides([]);
    setActiveSlideIdx(0);
    setSelectedElement(null);
    setView(VIEW.LANDING);
    setError('');
  };

  // ═══ Element Mutation Handlers ═══
  const handleUpdateElement = useCallback((slideIdx, elIdx, updates) => {
    setAnalyzedSlides((prev) => {
      const copy = prev.map((s) => ({ ...s, elements: [...(s.elements || [])] }));
      if (copy[slideIdx] && copy[slideIdx].elements[elIdx]) {
        copy[slideIdx].elements[elIdx] = { ...copy[slideIdx].elements[elIdx], ...updates };
      }
      return copy;
    });
  }, []);

  const handleAddElement = useCallback((slideIdx, newElement) => {
    setAnalyzedSlides((prev) => {
      const copy = prev.map((s) => ({ ...s, elements: [...(s.elements || [])] }));
      if (copy[slideIdx]) {
        copy[slideIdx].elements.push(newElement);
        setSelectedElement(copy[slideIdx].elements.length - 1);
      }
      return copy;
    });
  }, []);

  const handleDeleteElement = useCallback((slideIdx, elIdx) => {
    setAnalyzedSlides((prev) => {
      const copy = prev.map((s) => ({ ...s, elements: [...(s.elements || [])] }));
      if (copy[slideIdx]) {
        copy[slideIdx].elements.splice(elIdx, 1);
      }
      return copy;
    });
    setSelectedElement(null);
  }, []);

  // ═══════════════════════════════════════
  // RENDER: Editor View
  // ═══════════════════════════════════════
  if (view === VIEW.EDITOR && analyzedSlides.length > 0) {
    return (
      <div className="editor-layout">
        <EditorToolbar
          fileName={file?.name}
          slideCount={analyzedSlides.length}
          mode={editorMode}
          onModeChange={setEditorMode}
          onExport={() => setShowExport((v) => !v)}
          onNewFile={handleReset}
        />

        {/* Floating error toast */}
        {error && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] bg-red-50 border border-red-200 rounded-xl px-5 py-3 shadow-md flex items-center gap-3 animate-slide-up max-w-xl">
            <span className="text-red-500 text-sm">⚠️</span>
            <p className="text-red-700 text-sm font-medium flex-1">{error}</p>
            <button onClick={() => setError('')} className="text-red-400 hover:text-red-600 text-base font-bold">✕</button>
          </div>
        )}

        <SlideEditor
          slides={analyzedSlides}
          activeIndex={activeSlideIdx}
          onActiveChange={setActiveSlideIdx}
          onSelectElement={setSelectedElement}
          selectedElement={selectedElement}
          mode={editorMode}
          onUpdateElement={handleUpdateElement}
          onAddElement={handleAddElement}
          onDeleteElement={handleDeleteElement}
        />
        <PropertyInspector
          slide={analyzedSlides[activeSlideIdx]}
          selectedElement={selectedElement}
          onUpdateElement={handleUpdateElement}
          onDeleteElement={handleDeleteElement}
          activeSlideIdx={activeSlideIdx}
        />

        {/* Export panel */}
        {showExport && (
          <div
            className="fixed inset-0 z-50"
            onClick={() => setShowExport(false)}
          >
            <div className="absolute inset-0 bg-stone-900/15 backdrop-blur-sm" />
            <div
              className="absolute bottom-0 left-0 right-0 bg-white border-t border-stone-200 shadow-2xl rounded-t-2xl animate-slide-up"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center px-6 pt-4 pb-2">
                <h3 className="font-bold text-stone-800 text-sm">내보내기 옵션</h3>
                <button
                  onClick={() => setShowExport(false)}
                  className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500 transition-colors"
                >✕</button>
              </div>
              <ExportOptions
                onExportPptx={() => { handleExportPptx(); setShowExport(false); }}
                onExportZip={() => { handleExportZip(); setShowExport(false); }}
                onExportLongImage={() => { handleExportLongImage(); setShowExport(false); }}
                fileName={file?.name || 'output'}
                slideCount={analyzedSlides.length}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  // ═══════════════════════════════════════
  // RENDER: Landing / Select / Processing
  // ═══════════════════════════════════════
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-3 border-b border-stone-200 bg-white sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-teal-600 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 9.563C9 9.252 9.252 9 9.563 9h4.874c.311 0 .563.252.563.563v4.874c0 .311-.252.563-.563.563H9.564A.562.562 0 019 14.437V9.564z" />
            </svg>
          </div>
          <span className="font-semibold text-stone-800 text-sm">MoonSlide</span>
          <span className="text-xs text-stone-400 hidden sm:inline">by moonlang.com</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowGuide(true)}
            className="flex items-center gap-1 text-xs text-stone-400 hover:text-teal-600 transition-colors font-medium"
          >
            <span>📋</span> 사용 가이드
          </button>
          {apiKey && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium bg-emerald-50 px-2.5 py-1 rounded-md">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              AI 연결됨
            </div>
          )}
        </div>
      </nav>

      <div className="flex-1">
        {/* ═══ LANDING VIEW ═══ */}
        {view === VIEW.LANDING && (
          <div className="max-w-2xl mx-auto py-12 px-6">
            {/* Hero */}
            <div className="text-center mb-10 animate-slide-up">
              <h1 className="text-2xl md:text-4xl font-bold text-stone-900 tracking-tight leading-tight break-keep">
                깨진 PDF 텍스트를 <span className="text-teal-600">복구</span>하세요
              </h1>
              <p className="text-sm text-stone-500 mt-3 max-w-md mx-auto leading-relaxed">
                AI가 슬라이드의 텍스트 위치와 내용을 자동 감지합니다.
                디자인을 유지하거나, 내용을 편집하세요.
              </p>
            </div>

            {/* Onboarding Guide */}
            {showGuide && (
              <div className="mb-6 animate-slide-up-d1">
                <OnboardingGuide onClose={() => setShowGuide(false)} />
              </div>
            )}

            {/* API Key */}
            {!apiKey && (
              <div className="mb-6 animate-slide-up-d2">
                <ApiKeyInput onApiKeySet={setApiKey} />
              </div>
            )}

            {/* Dropzone */}
            {apiKey && (
              <div className="animate-slide-up-d2">
                <Dropzone onFileSelect={handleFileSelect} disabled={!apiKey} />
              </div>
            )}

            {/* File card */}
            {file && view === VIEW.LANDING && (
              <div className="mt-5 bg-white rounded-xl border border-stone-200 px-5 py-4 flex items-center justify-between animate-slide-up-d3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center">
                    <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-stone-800">{file.name}</p>
                    <p className="text-xs text-stone-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <button className="btn-primary px-4 py-2 text-sm">분석 시작</button>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-center animate-slide-up">
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Footer line */}
            <div className="mt-10 text-center">
              <p className="text-xs text-stone-400">
                100% 브라우저 기반 · 파일이 외부로 전송되지 않습니다 · <a href="https://moonlang.com" target="_blank" rel="noreferrer" className="text-teal-600 hover:underline">moonlang.com</a>
              </p>
            </div>
          </div>
        )}

        {/* ═══ SELECT VIEW ═══ */}
        {view === VIEW.SELECT && (
          <SlideSelector
            slides={slideImages}
            selectedIndices={selectedIndices}
            onSelectionChange={setSelectedIndices}
            onAnalyze={handleAnalyze}
          />
        )}

        {/* ═══ PROCESSING VIEW ═══ */}
        {view === VIEW.PROCESSING && (
          <div className="max-w-lg mx-auto py-16 px-6">
            <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8">
              <ProcessingStatus
                stage={processingStage}
                progress={processingProgress}
                total={processingTotal}
                onCancel={() => setView(VIEW.SELECT)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

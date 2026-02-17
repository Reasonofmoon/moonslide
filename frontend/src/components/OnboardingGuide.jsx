import { useState, useEffect } from 'react';

const STEPS = [
  {
    num: 1,
    title: 'API 키 연결',
    desc: 'Google AI Studio에서 무료 Gemini API 키를 발급받아 입력하세요.',
    icon: '🔑',
  },
  {
    num: 2,
    title: 'PDF 업로드',
    desc: '깨진 텍스트가 있는 PDF 또는 슬라이드 이미지를 드래그 앤 드롭하세요.',
    icon: '📄',
  },
  {
    num: 3,
    title: 'AI 분석 & 편집',
    desc: 'AI가 텍스트 위치를 감지합니다. 클릭하여 내용을 수정할 수 있습니다.',
    icon: '✨',
  },
  {
    num: 4,
    title: '내보내기',
    desc: '편집 가능한 PPTX, 고화질 이미지 ZIP, 또는 긴 이미지로 다운로드하세요.',
    icon: '📥',
  },
];

export default function OnboardingGuide({ onClose }) {
  const [activeStep, setActiveStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % STEPS.length);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem('moonslide_guide_seen', 'true');
    setTimeout(onClose, 300);
  };

  return (
    <div className={`transition-all duration-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      <div className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-stone-100 bg-stone-50/50">
          <div className="flex items-center gap-2">
            <span className="text-stone-400 text-sm">📋</span>
            <span className="text-sm font-semibold text-stone-700">사용 가이드</span>
          </div>
          <button
            onClick={handleDismiss}
            className="text-xs text-stone-400 hover:text-stone-600 font-medium transition-colors"
          >
            닫기
          </button>
        </div>

        {/* Steps */}
        <div className="p-4 space-y-0">
          {STEPS.map((step, i) => (
            <div key={step.num}>
              <div
                className={`guide-step transition-all duration-300 cursor-pointer ${
                  i === activeStep ? 'border-teal-400 bg-teal-50/50 shadow-sm' : ''
                }`}
                onClick={() => setActiveStep(i)}
              >
                <div className={`guide-step-number transition-colors ${
                  i === activeStep ? 'bg-teal-600' : 'bg-stone-300'
                }`}>
                  {step.num}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold transition-colors ${
                    i === activeStep ? 'text-teal-700' : 'text-stone-700'
                  }`}>
                    {step.icon} {step.title}
                  </p>
                  <p className={`text-xs mt-0.5 leading-relaxed transition-all overflow-hidden ${
                    i === activeStep ? 'text-stone-500 max-h-20 opacity-100' : 'text-stone-400 max-h-0 opacity-0'
                  }`}>
                    {step.desc}
                  </p>
                </div>
              </div>
              {i < STEPS.length - 1 && <div className="guide-connector" />}
            </div>
          ))}
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 pb-4">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                i === activeStep ? 'w-4 bg-teal-500' : 'bg-stone-200'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

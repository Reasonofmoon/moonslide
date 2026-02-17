import { useState, useEffect } from 'react';
import { testApiKey } from '../services/geminiService';

export default function ApiKeyInput({ onApiKeySet }) {
  const [apiKey, setApiKey] = useState('');
  const [status, setStatus] = useState('idle');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('gemini_api_key');
    if (saved) {
      setApiKey(saved);
      setStatus('valid');
      onApiKeySet(saved);
    }
  }, []);

  const handleTest = async () => {
    if (!apiKey.trim()) return;
    setStatus('testing');
    const ok = await testApiKey(apiKey.trim());
    if (ok) {
      setStatus('valid');
      localStorage.setItem('gemini_api_key', apiKey.trim());
      onApiKeySet(apiKey.trim());
    } else {
      setStatus('invalid');
    }
  };

  const handleClear = () => {
    setApiKey('');
    setStatus('idle');
    localStorage.removeItem('gemini_api_key');
    onApiKeySet(null);
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-2.5">
        <div className={`w-2 h-2 rounded-full transition-colors ${
          status === 'valid' ? 'bg-emerald-500' :
          status === 'testing' ? 'bg-amber-400 animate-pulse' :
          status === 'invalid' ? 'bg-red-500' : 'bg-stone-300'
        }`} />
        <span className="text-sm font-medium text-stone-600">
          {status === 'valid' ? 'Gemini AI 연결됨' :
           status === 'testing' ? '확인 중...' :
           status === 'invalid' ? 'API 키가 유효하지 않습니다' :
           '1단계: Gemini API 키 입력'}
        </span>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type={isVisible ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => { setApiKey(e.target.value); setStatus('idle'); }}
            onKeyDown={(e) => e.key === 'Enter' && handleTest()}
            placeholder="AIzaSy..."
            className="w-full px-4 py-3 rounded-lg bg-white border border-stone-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 focus:outline-none text-sm font-mono transition-all placeholder:text-stone-300"
          />
          <button
            type="button"
            onClick={() => setIsVisible(!isVisible)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs"
          >
            {isVisible ? '숨기기' : '보기'}
          </button>
        </div>
        {status === 'valid' ? (
          <button
            onClick={handleClear}
            className="px-4 py-3 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-500 text-sm font-medium transition-colors"
          >
            변경
          </button>
        ) : (
          <button
            onClick={handleTest}
            disabled={!apiKey.trim() || status === 'testing'}
            className="px-5 py-3 rounded-lg bg-teal-600 hover:bg-teal-700 disabled:bg-stone-200 disabled:text-stone-400 text-white text-sm font-semibold transition-colors"
          >
            연결
          </button>
        )}
      </div>

      {status !== 'valid' && (
        <p className="text-xs text-stone-400 mt-2.5 leading-relaxed">
          <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer"
            className="text-teal-600 hover:underline font-medium">Google AI Studio</a>에서
          무료 API 키를 발급받을 수 있습니다. 키는 브라우저에만 저장됩니다.
        </p>
      )}
    </div>
  );
}

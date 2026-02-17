# SlideForge ⚒️

> PDF 슬라이드의 깨진 텍스트를 AI로 복구하고, 편집 가능한 PPTX로 변환합니다.

**100% 브라우저 기반** — 서버 불필요, 파일이 외부로 전송되지 않습니다.

## ✨ 주요 기능

| 기능 | 설명 |
|------|------|
| 🔍 AI 텍스트 감지 | Gemini Vision이 슬라이드 이미지에서 텍스트 위치·크기·스타일 자동 분석 |
| ✏️ 실시간 편집 | 클릭 선택, 더블클릭 편집, 드래그 이동, 리사이즈 |
| 📊 PPTX 내보내기 | 편집 가능한 텍스트 박스로 파워포인트 생성 |
| 🖼️ 이미지 내보내기 | 고화질 PNG (개별 ZIP / 세로 합치기) |
| 🎨 디자인 모드 | 원본 레이아웃 100% 보존 유지 |

## 🚀 빠른 시작

```bash
# 1. 클론
git clone https://github.com/your-repo/slideforge.git

# 2. 의존성 설치
cd slideforge/frontend
npm install

# 3. 개발 서버 실행
npm run dev
```

브라우저에서 `http://localhost:5173` 접속 → Gemini API 키 입력 → PDF 업로드!

### Gemini API 키 발급

1. [Google AI Studio](https://aistudio.google.com/apikey) 접속
2. "Create API Key" 클릭
3. 발급된 키를 SlideForge에 입력

> 💡 **무료 사용 가능** — Gemini API는 무료 티어를 제공합니다.

## 🛠 기술 스택

| 카테고리 | 기술 |
|---------|------|
| Frontend | React 19, Vite 7 |
| AI Engine | Google Gemini 2.0 Flash (Vision) |
| PDF 렌더링 | pdf.js |
| PPTX 생성 | PptxGenJS |
| 이미지 압축 | JSZip + FileSaver |
| 폰트 | Pretendard Variable |

## 📂 프로젝트 구조

```
slideforge/
└── frontend/
    ├── src/
    │   ├── App.jsx              # 메인 앱 + 상태 관리
    │   ├── components/
    │   │   ├── SlideEditor.jsx   # 인터랙티브 슬라이드 편집기
    │   │   ├── PropertyInspector.jsx  # 속성 패널
    │   │   ├── EditorToolbar.jsx # 도구 모음
    │   │   ├── ExportOptions.jsx # 내보내기 옵션
    │   │   └── ...
    │   └── services/
    │       ├── geminiService.js  # Gemini Vision API
    │       ├── pdfService.js     # PDF 로드 + 렌더링
    │       └── pptxService.js    # PPTX 생성
    └── index.html
```

## ☁️ 배포 (Vercel)

```bash
npm run build
npx vercel --prod
```

> 별도 서버나 환경 변수가 필요 없습니다. API 키는 사용자가 브라우저에서 직접 입력합니다.

## 📄 라이선스

MIT License

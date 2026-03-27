# 🎞 NotebookLM Slide Command Helper

NotebookLM의 **"Change Slide N"** 입력창에 상황별 슬라이드 수정 명령어를 
원클릭으로 삽입하는 Chrome 확장 프로그램입니다.

---

## 📦 설치 방법

1. 이 폴더(notebooklm-slide-helper)를 PC에 저장합니다.
2. Chrome 브라우저에서 주소창에 입력: `chrome://extensions`
3. 우측 상단 **"개발자 모드"** 토글 **ON**
4. **"압축해제된 확장 프로그램을 로드합니다"** 클릭
5. 이 폴더 선택 → 설치 완료 ✅

---

## 🚀 사용 방법

1. [NotebookLM](https://notebooklm.google.com)에서 슬라이드 프레젠테이션 열기
2. 수정할 슬라이드의 **"Change Slide N"** 입력창 열기
3. Chrome 툴바의 **🎞 아이콘** 클릭 → 헬퍼 팝업 열림
4. 원하는 명령어 카테고리에서 **칩(chip)** 클릭
5. **"✦ 슬라이드에 입력"** 버튼 클릭 → 자동 입력!

---

## 📋 명령어 카테고리

| 카테고리 | 예시 명령어 |
|--------|-----------|
| 📐 레이아웃 | Center the image, Move text to top... |
| ✍️ 텍스트 | Make the title shorter, Add bullet points... |
| 🖼️ 이미지 | Make the image larger, Rounded corners... |
| 🎨 색상 | Dark background, Gradient background... |
| 🏗️ 구조 | Two-column layout, Add header/footer... |
| 💎 스타일 | Minimal design, Professional look... |
| 📝 콘텐츠 | Keep key points only, Add CTA button... |

---

## ⭐ 즐겨찾기 기능

- 자주 쓰는 명령어를 **"⭐ 저장"**으로 저장
- **"저장됨"** 탭에서 바로 재사용
- 직접 입력 탭에서 커스텀 명령어 작성 및 저장 가능

---

## 🛠 기술 스택

- Chrome Extension Manifest V3
- Vanilla JS + CSS (no dependencies)
- Chrome Storage API for saved commands

---

*Made for NotebookLM power users 🚀*

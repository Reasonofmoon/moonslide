# Changelog

## 3.1.0 - 2026-02-25

### Production Release

- **Dark Mode**: Full dark theme with 40+ design tokens, system `prefers-color-scheme` auto-detection, and manual toggle (☀️/🌙). Theme persists across sessions.
- **Bilingual i18n**: Added `_locales/en` and `_locales/ko` for Chrome Web Store multilingual support.
- **Premium UI**: Inter font, CSS micro-animations (fadeSlideUp, pulse-glow), smooth hover transitions on all interactive elements, polished scrollbars.
- **Onboarding**: First-run welcome overlay with feature highlights for new users.
- **Keyboard Shortcut**: `Ctrl+Enter` to inject prompt directly.
- **Template Count Badge**: Live count display in hero section.
- **Footer**: Version number and privacy link in popup footer.
- **Packaging Fix**: `dna-templates.js` and `_locales/` now included in release ZIP (was missing in v3.0.0).
- Updated `manifest.json` with `default_locale` and `__MSG__` i18n tokens.
- Updated privacy policy and store listing for Chrome Web Store readiness.

## 3.0.0 - 2026-02-25

### DNA Integration (Darlkom × Slide Helper Synergy)

- Integrated Darlkom Banana's 208 Design DNA presets into the template library.
- Added `dna-templates.js` auto-generated from `templates.json` via `scripts/build-dna-templates.js`.
- New DNA-derived categories: 오프닝, 구조, 임팩트, 데이터, 비즈니스, 크리에이티브, 감성.
- Original 10 core templates preserved alongside 208 DNA templates (218 total).

### Gemini Vision Upgrade

- Upgraded Gemini model from `gemini-2.0-flash` to `gemini-2.5-flash`.
- Refactored AI prompt with **6-Gene MECE Design DNA Framework** for structured analysis:
  - `layout_rules`, `color_palette`, `materiality`, `line_shape`, `typography`, `emotional_profile`.
- Added DNA Fitness Score (Style Fidelity 0-5 + Role Fitness 0-5 = Total 0-10).
- Added recommended DNA style suggestions in AI preview.
- Increased `maxOutputTokens` from 1400 to 2400 for richer analysis.

### UI Improvements

- Expanded template list height (225px → 340px) for larger library.
- Expanded AI suggestion preview (82px → 140px) for DNA analysis output.

## 2.2.1 - 2026-02-19

- Added AI quality controls (slide type, improvement level, review language).
- Upgraded Gemini Vision prompt schema with strengths, detected slide type, and prompt rationale.
- Improved prompt post-processing for more stable NotebookLM-ready final prompts.
- Expanded AI preview panel to show strengths/type/rationale for better operator review.

## 2.2.0 - 2026-02-19

- Added Gemini Vision suggestion flow (user API key input + AI suggestion button).
- Added active tab screenshot capture for AI analysis on explicit user action.
- Added AI diagnosis preview panel and automatic prompt recommendation fill.
- Updated permissions and policy docs for Gemini API integration.

## 2.1.0 - 2026-02-18

- Switched to content-script messaging architecture for safer injection flow.
- Removed high-risk runtime injection permissions from popup flow.
- Added robust content-side prompt injection with ranked selector strategy.
- Added official icon set (`16/32/48/128`).
- Added submission documentation (`README`, `PRIVACY`, checklist).

## 2.0.0 - 2026-02-18

- Redesigned popup UI/UX with templates, builder, and saved/recent sections.
- Added improved selector scoring for NotebookLM edit input detection.

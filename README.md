# NotebookLM Slide Command Helper

Chrome Extension (Manifest V3) that helps users create, store, and inject high-quality slide editing prompts into NotebookLM.

## Core Features

- **218 templates**: 10 core + 208 Design DNA presets (from Darlkom Banana)
- Template-based prompt generation for slide edits
- Prompt builder (goal, target, tone, length, extra constraints)
- Saved prompts and recent history (local storage only)
- **Gemini 2.5 Flash Vision** slide analysis with 6-Gene DNA framework
- DNA Fitness Score (Style Fidelity + Role Fitness, 0-10 scale)
- Recommended DNA style suggestions per slide
- AI quality controls for suggestion generation:
  - Slide type mode (`auto/business/pitch/education/data`)
  - Improvement level (`conservative/balanced/aggressive`)
  - Review language (`ko/en/bilingual`)
- One-click injection into NotebookLM slide edit input
- Robust input detection (dialog, textarea, contenteditable, shadow DOM traversal)
- **Dark mode** with system preference detection and manual toggle
- **Bilingual i18n** support (English/Korean)
- **Onboarding** welcome screen for first-time users
- **Keyboard shortcut** (Ctrl+Enter) for quick injection
- **Template count badge** in hero section

## Project Structure

- `manifest.json`: extension metadata and permissions (i18n enabled)
- `popup.html`: popup UI with dark mode theme system
- `popup.js`: popup logic, theme, onboarding, and messaging bridge
- `dna-templates.js`: 208 DNA presets (auto-generated)
- `content.js`: NotebookLM page-side prompt injection logic
- `_locales/`: i18n message files (`en`, `ko`)
- `icons/`: extension icons (`16`, `32`, `48`, `128`)
- `scripts/build-dna-templates.js`: DNA bridge script
- `scripts/package-release.ps1`: release packaging script
- `PRIVACY.md`: privacy policy for Chrome Web Store submission
- `CHROME_WEBSTORE_CHECKLIST.md`: release checklist
- `STORE_LISTING_DRAFT.md`: bilingual store listing content
- `CHANGELOG.md`: version history

## Permissions (Why Minimal)

- `storage`: stores user-saved prompts, recent prompts, theme preference, and user Gemini API key locally
- `activeTab`: captures the current visible NotebookLM slide only when user clicks AI suggestion
- `host_permissions` (`https://generativelanguage.googleapis.com/*`): calls Gemini API directly from popup

No developer-operated backend, no analytics SDK, no tracking telemetry.

When user clicks `AI 제안`, the current tab screenshot and optional draft prompt are sent directly to Google Gemini API with the user's own API key.

## Local Development

1. Open Chrome extensions page: `chrome://extensions`
2. Enable Developer mode
3. Click "Load unpacked"
4. Select this folder:
   - `05 Projects/notebooklm-slide-helper`
5. Open `https://notebooklm.google.com/` and test the popup

## Release Packaging

Use PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\package-release.ps1
```

Output:

- `dist/notebooklm-slide-command-helper-v3.1.0/` (unzipped)
- `dist/notebooklm-slide-command-helper-v3.1.0.zip` (for Chrome Web Store upload)

## Chrome Web Store Notes

- Store listing assets (screenshots, 128x128 listing icon, descriptions) are handled in the Chrome Web Store dashboard.
- Privacy disclosure should match `PRIVACY.md`.
- See `STORE_LISTING_DRAFT.md` for bilingual listing content.
- See `CHROME_WEBSTORE_CHECKLIST.md` for the full submission checklist.

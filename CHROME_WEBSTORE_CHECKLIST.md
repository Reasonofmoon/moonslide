# Chrome Web Store Submission Checklist

## v3.1.0 Production Release (2026-02-25)

### Package Preparation

- [x] Manifest V3 compliant
- [x] Icon set included (`16/32/48/128`)
- [x] Version updated to `3.1.0`
- [x] i18n locales configured (`_locales/en`, `_locales/ko`)
- [x] `dna-templates.js` included in package
- [ ] Final zip package generated: `dist/notebooklm-slide-command-helper-v3.1.0.zip`

### Functional Testing

- [ ] Extension loads without warnings in `chrome://extensions`
- [ ] Popup opens and renders correctly (light mode)
- [ ] Dark mode toggle works and persists across sessions
- [ ] Onboarding overlay shows on first run only
- [ ] Prompt injection works on `https://notebooklm.google.com/*`
- [ ] AI suggestion works with valid Gemini API key
- [ ] Non-NotebookLM tabs show safe warning state
- [ ] Saved/recent prompt storage works
- [ ] Ctrl+Enter keyboard shortcut triggers inject
- [ ] Template count badge shows correct number (218)

### Security / Privacy

- [x] No remote code execution
- [x] No `eval` usage
- [x] No code obfuscation
- [x] Minimal permissions (`storage`, `activeTab`, Gemini API host permission only)
- [x] Privacy policy prepared (`PRIVACY.md`)
- [x] External transfer is user-triggered only and documented (Gemini API)

### Store Listing

- [x] Short description (under 45 chars)
- [x] Detailed description (bilingual Korean/English)
- [ ] Screenshots (minimum 1, recommended 3+)
- [ ] Category selection: Productivity
- [ ] Privacy policy URL configured
- [ ] Support contact configured

### Final Pre-Submit

- [ ] Re-test on clean Chrome profile
- [ ] Verify no console errors in popup/content script
- [ ] Upload zip package and complete listing fields
- [ ] Click `Submit for review`

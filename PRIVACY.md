# Privacy Policy

Last updated: February 25, 2026

## Overview

NotebookLM Slide Command Helper does not collect or sell personal data.

The extension has an optional AI suggestion feature. If the user explicitly triggers that feature, data is sent directly to Google Gemini API using the user's own API key.

## Data Processed

The extension stores only the following data in Chrome local extension storage:

- Saved prompts created by the user
- Recent prompts used by the user
- User-provided Gemini API key (if entered)
- Theme preference (light/dark)
- Onboarding completion flag

This data is stored locally in the user's browser profile (`chrome.storage.local`) and is used only to provide extension functionality.

## Data Not Collected

The extension does **not** collect:

- Personal identity information
- Browsing history outside target pages
- Authentication credentials
- Financial or health information

## Data Sharing

Data is sent to a third party only in this case:

- When the user clicks the AI suggestion button, the extension sends:
  - current visible tab screenshot,
  - optional draft prompt text,
  - to Google Gemini API (`generativelanguage.googleapis.com`)
  - using the user's own API key

No analytics, tracking pixels, or remote telemetry are included.

## Permissions Justification

- `storage`: required to save user prompt presets, recent history, theme preference, and user Gemini API key locally.
- `activeTab`: required to capture the visible NotebookLM slide only when user clicks AI suggestion.
- `host_permissions` (`https://generativelanguage.googleapis.com/*`): required to call Gemini API directly from the extension popup.

## Contact

For support or privacy-related requests, contact the extension publisher through the Chrome Web Store support channel.

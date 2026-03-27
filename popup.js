const STORAGE_KEYS = {
  saved: "slh_saved_v2",
  recent: "slh_recent_v2",
  geminiApiKey: "slh_gemini_api_key_v1",
  aiSlideType: "slh_ai_slide_type_v1",
  aiImprovementLevel: "slh_ai_improvement_level_v1",
  aiReviewLanguage: "slh_ai_review_language_v1",
  theme: "slh_theme_v1",
  onboardingDone: "slh_onboarding_done_v1",
};

const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_ENDPOINT =
  `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const CORE_TEMPLATES = [
  {
    id: "headline-refresh",
    category: "텍스트",
    title: "제목 임팩트 강화",
    description: "핵심 의미를 유지하면서 제목을 더 짧고 강하게 바꿉니다.",
    prompt:
      "Rewrite the slide title to be clearer and more impactful in under 8 words. Keep the original meaning, and improve readability for a business audience.",
  },
  {
    id: "body-to-bullets",
    category: "텍스트",
    title: "본문을 핵심 bullet로",
    description: "길어진 설명을 3~5개 포인트로 정리합니다.",
    prompt:
      "Condense the body text into 3 to 5 concise bullet points with strong action verbs. Remove repetition and keep only essential information.",
  },
  {
    id: "layout-balance",
    category: "레이아웃",
    title: "레이아웃 균형 재배치",
    description: "요소 간 거리와 시선 흐름을 개선합니다.",
    prompt:
      "Rearrange all elements to create balanced spacing and a clear visual hierarchy. Keep generous margins and avoid overlapping components.",
  },
  {
    id: "split-two-columns",
    category: "레이아웃",
    title: "2단 비교 구조",
    description: "비교/전후 설명에 맞는 양쪽 배치로 변환합니다.",
    prompt:
      "Transform the slide into a clean two-column layout: left for key idea, right for supporting evidence. Keep alignment consistent and readable.",
  },
  {
    id: "image-focus",
    category: "이미지",
    title: "이미지 중심 강조",
    description: "이미지를 주인공으로 두고 텍스트를 보조화합니다.",
    prompt:
      "Make the image the primary focal point by enlarging it and reducing visual clutter. Move supporting text to a compact area with clear contrast.",
  },
  {
    id: "style-modern",
    category: "스타일",
    title: "모던 스타일 적용",
    description: "명확한 타이포와 컬러 대비로 현대적인 느낌을 만듭니다.",
    prompt:
      "Apply a modern, minimal visual style with strong typography contrast and clean spacing. Use one accent color and keep the layout uncluttered.",
  },
  {
    id: "numbers-highlight",
    category: "강조",
    title: "숫자/성과 강조",
    description: "핵심 수치를 한눈에 보이게 부각합니다.",
    prompt:
      "Highlight the key metric with larger type and a high-contrast callout box. Ensure supporting text explains why this number matters.",
  },
  {
    id: "cta-final",
    category: "강조",
    title: "마무리 CTA 추가",
    description: "슬라이드 하단 행동 유도 문구를 넣습니다.",
    prompt:
      "Add a concise call-to-action at the bottom of the slide. Make it visually distinct from the body text and action-oriented.",
  },
  {
    id: "education-friendly",
    category: "스타일",
    title: "교육용 톤으로 전환",
    description: "친절한 설명 흐름과 학습 친화적 표현을 사용합니다.",
    prompt:
      "Adjust the slide to an educational tone with simple language, clear sectioning, and supportive visual cues for learners.",
  },
  {
    id: "executive-summary",
    category: "텍스트",
    title: "경영진 요약 포맷",
    description: "결론-근거-액션 3단 구조로 요약합니다.",
    prompt:
      "Convert this slide into an executive summary format with three sections: key conclusion, evidence, and next action. Keep each section concise.",
  },
];

// Merge core templates with DNA library (loaded from dna-templates.js)
const TEMPLATES = [
  ...CORE_TEMPLATES,
  ...(typeof DNA_TEMPLATES !== "undefined" ? DNA_TEMPLATES : []),
];

const GOAL_MAP = {
  clarify: "Clarify the core message and make the slide easier to scan quickly.",
  layout: "Reorganize layout for stronger visual hierarchy and better alignment.",
  style: "Improve visual style while keeping consistency and professional tone.",
  shorten: "Reduce text density and keep only the most important information.",
};

const AI_SLIDE_TYPE_HINTS = {
  auto: "Auto-detect slide intent from the screenshot.",
  business: "Treat as a business reporting slide with decision clarity focus.",
  pitch: "Treat as a pitch/deck slide with persuasion and narrative flow focus.",
  education: "Treat as an educational slide with instructional clarity focus.",
  data: "Treat as a metrics/data slide with number readability focus.",
};

const AI_IMPROVEMENT_HINTS = {
  conservative: "Preserve existing structure. Apply minimal, low-risk improvements.",
  balanced: "Keep core structure but improve clarity, hierarchy, and readability.",
  aggressive: "Restructure boldly for impact, while preserving factual meaning.",
};

const AI_REVIEW_LANGUAGE_HINTS = {
  ko: "Write diagnosis/issues/suggestions in Korean.",
  en: "Write diagnosis/issues/suggestions in English.",
  bilingual: "Write diagnosis/issues/suggestions in Korean + English.",
};

const state = {
  activeTab: "templates",
  activeCategory: "전체",
  search: "",
  saved: [],
  recent: [],
  isAiSuggesting: false,
};

const el = {};

document.addEventListener("DOMContentLoaded", init);

async function init() {
  cacheElements();
  bindEvents();
  await loadStorage();
  initTheme();
  await checkOnboarding();
  renderCategoryPills();
  renderTemplates();
  renderSavedAndRecent();
  updateTemplateCount();
  syncPromptButtonState();
  await refreshTabStatus();
}

function cacheElements() {
  el.tabButtons = [...document.querySelectorAll(".tab-btn")];
  el.panels = [...document.querySelectorAll(".panel")];
  el.statusBadge = document.getElementById("status-badge");
  el.btnRefreshStatus = document.getElementById("btn-refresh-status");
  el.searchInput = document.getElementById("search-input");
  el.categoryPills = document.getElementById("category-pills");
  el.templateList = document.getElementById("template-list");
  el.templateCount = document.getElementById("template-count");
  el.finalPrompt = document.getElementById("final-prompt");
  el.btnCopy = document.getElementById("btn-copy");
  el.btnSave = document.getElementById("btn-save");
  el.btnAiSuggest = document.getElementById("btn-ai-suggest");
  el.btnInject = document.getElementById("btn-inject");
  el.geminiApiKey = document.getElementById("gemini-api-key");
  el.btnToggleApiKey = document.getElementById("btn-toggle-api-key");
  el.aiSlideType = document.getElementById("ai-slide-type");
  el.aiImprovementLevel = document.getElementById("ai-improvement-level");
  el.aiReviewLanguage = document.getElementById("ai-review-language");
  el.aiSuggestionPreview = document.getElementById("ai-suggestion-preview");
  el.savedList = document.getElementById("saved-list");
  el.recentList = document.getElementById("recent-list");
  el.toast = document.getElementById("toast");
  el.builderGoal = document.getElementById("builder-goal");
  el.builderTarget = document.getElementById("builder-target");
  el.builderTone = document.getElementById("builder-tone");
  el.builderLimit = document.getElementById("builder-limit");
  el.builderDetails = document.getElementById("builder-details");
  el.btnBuilderApply = document.getElementById("btn-builder-apply");
  el.btnThemeToggle = document.getElementById("btn-theme-toggle");
  el.onboardingOverlay = document.getElementById("onboarding-overlay");
  el.btnOnboardingClose = document.getElementById("btn-onboarding-close");
}

function bindEvents() {
  el.tabButtons.forEach((button) => {
    button.addEventListener("click", () => switchTab(button.dataset.tab));
  });

  el.searchInput.addEventListener("input", () => {
    state.search = el.searchInput.value.trim().toLowerCase();
    renderTemplates();
  });

  el.finalPrompt.addEventListener("input", syncPromptButtonState);
  el.btnRefreshStatus.addEventListener("click", refreshTabStatus);
  el.btnBuilderApply.addEventListener("click", onApplyBuilder);
  el.btnCopy.addEventListener("click", onCopyPrompt);
  el.btnSave.addEventListener("click", onSavePrompt);
  el.btnAiSuggest.addEventListener("click", onSuggestWithAi);
  el.btnInject.addEventListener("click", onInjectPrompt);
  el.geminiApiKey.addEventListener("input", onGeminiApiKeyInput);
  el.btnToggleApiKey.addEventListener("click", onToggleGeminiApiKey);
  el.aiSlideType.addEventListener("change", onAiOptionChange);
  el.aiImprovementLevel.addEventListener("change", onAiOptionChange);
  el.aiReviewLanguage.addEventListener("change", onAiOptionChange);
  el.btnThemeToggle.addEventListener("click", toggleTheme);
  el.btnOnboardingClose.addEventListener("click", dismissOnboarding);

  // Ctrl+Enter keyboard shortcut for inject
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      if (!el.btnInject.disabled) onInjectPrompt();
    }
  });
}

function switchTab(tabName) {
  state.activeTab = tabName;
  el.tabButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === tabName);
  });
  el.panels.forEach((panel) => {
    panel.classList.toggle("active", panel.id === `panel-${tabName}`);
  });
}

function renderCategoryPills() {
  const categories = ["전체", ...new Set(TEMPLATES.map((item) => item.category))];
  el.categoryPills.innerHTML = "";

  categories.forEach((category) => {
    const pill = document.createElement("button");
    pill.className = `pill${category === state.activeCategory ? " active" : ""}`;
    pill.type = "button";
    pill.textContent = category;
    pill.addEventListener("click", () => {
      state.activeCategory = category;
      renderCategoryPills();
      renderTemplates();
    });
    el.categoryPills.appendChild(pill);
  });
}

function renderTemplates() {
  const filtered = TEMPLATES.filter((item) => {
    const matchesCategory =
      state.activeCategory === "전체" || item.category === state.activeCategory;
    const target = `${item.title} ${item.description} ${item.prompt}`.toLowerCase();
    const matchesSearch = !state.search || target.includes(state.search);
    return matchesCategory && matchesSearch;
  });

  el.templateList.innerHTML = "";

  if (filtered.length === 0) {
    el.templateList.appendChild(createEmpty("검색 조건에 맞는 템플릿이 없습니다."));
    return;
  }

  filtered.forEach((item) => {
    const card = document.createElement("article");
    card.className = "template-card";

    const head = document.createElement("div");
    head.className = "template-head";

    const title = document.createElement("h3");
    title.className = "template-title";
    title.textContent = item.title;

    const tag = document.createElement("span");
    tag.className = "template-tag";
    tag.textContent = item.category;

    head.appendChild(title);
    head.appendChild(tag);

    const desc = document.createElement("p");
    desc.className = "template-desc";
    desc.textContent = item.description;

    const actions = document.createElement("div");
    actions.className = "template-actions";

    const useButton = document.createElement("button");
    useButton.type = "button";
    useButton.className = "mini-btn";
    useButton.textContent = "사용";
    useButton.addEventListener("click", () => {
      setPrompt(item.prompt, true);
      showToast("템플릿이 반영되었습니다.");
    });

    actions.appendChild(useButton);
    card.appendChild(head);
    card.appendChild(desc);
    card.appendChild(actions);
    el.templateList.appendChild(card);
  });
}

function onApplyBuilder() {
  const goal = GOAL_MAP[el.builderGoal.value] || GOAL_MAP.clarify;
  const target = el.builderTarget.value;
  const tone = el.builderTone.value;
  const limitRaw = el.builderLimit.value.trim();
  const detailsRaw = el.builderDetails.value.trim();

  const lines = [
    `Please revise the ${target} of this slide.`,
    goal,
    `Tone: ${tone}.`,
  ];

  if (limitRaw) {
    lines.push(`Length limit: ${limitRaw}.`);
  }
  if (detailsRaw) {
    lines.push(`Additional requirements: ${detailsRaw}`);
  }

  lines.push("Return a polished version that can be used directly on the slide.");
  setPrompt(lines.join(" "), true);
  showToast("빌더 결과를 프롬프트에 반영했습니다.");
}

async function onGeminiApiKeyInput() {
  const apiKey = sanitizeApiKey(el.geminiApiKey.value);
  await chrome.storage.local.set({ [STORAGE_KEYS.geminiApiKey]: apiKey });
  syncPromptButtonState();
}

async function onAiOptionChange() {
  await chrome.storage.local.set({
    [STORAGE_KEYS.aiSlideType]: el.aiSlideType.value,
    [STORAGE_KEYS.aiImprovementLevel]: el.aiImprovementLevel.value,
    [STORAGE_KEYS.aiReviewLanguage]: el.aiReviewLanguage.value,
  });
}

function onToggleGeminiApiKey() {
  const isMasked = el.geminiApiKey.type === "password";
  el.geminiApiKey.type = isMasked ? "text" : "password";
  el.btnToggleApiKey.textContent = isMasked ? "숨김" : "표시";
}

function setPrompt(text, focus = false) {
  el.finalPrompt.value = text;
  syncPromptButtonState();
  if (focus) el.finalPrompt.focus();
}

function syncPromptButtonState() {
  const hasPrompt = !!el.finalPrompt.value.trim();
  const hasApiKey = !!sanitizeApiKey(el.geminiApiKey.value);
  el.btnInject.disabled = !hasPrompt;
  el.btnAiSuggest.disabled = !hasApiKey || state.isAiSuggesting;
}

async function onCopyPrompt() {
  const prompt = el.finalPrompt.value.trim();
  if (!prompt) {
    showToast("복사할 프롬프트가 없습니다.", true);
    return;
  }

  try {
    await navigator.clipboard.writeText(prompt);
    await addRecent(prompt);
    showToast("프롬프트를 복사했습니다.");
  } catch (error) {
    showToast("복사 권한이 없어 실패했습니다.", true);
  }
}

async function onSavePrompt() {
  const prompt = el.finalPrompt.value.trim();
  if (!prompt) {
    showToast("저장할 프롬프트가 없습니다.", true);
    return;
  }

  if (!state.saved.includes(prompt)) {
    state.saved.unshift(prompt);
    state.saved = state.saved.slice(0, 60);
    await chrome.storage.local.set({ [STORAGE_KEYS.saved]: state.saved });
  }

  await addRecent(prompt);
  renderSavedAndRecent();
  showToast("저장되었습니다.");
}

async function onInjectPrompt() {
  const prompt = el.finalPrompt.value.trim();
  if (!prompt) {
    showToast("입력할 프롬프트가 없습니다.", true);
    return;
  }

  const tab = await getCurrentTab();
  if (!tab || !tab.id) {
    showToast("활성 탭을 찾지 못했습니다.", true);
    return;
  }

  try {
    const response = await sendMessageToTab(tab.id, {
      type: "INJECT_PROMPT",
      prompt,
    });

    if (response?.ok) {
      await addRecent(prompt);
      renderSavedAndRecent();
      showToast("NotebookLM 입력창에 반영했습니다.");
      await refreshTabStatus();
      return;
    }

    const message = response?.message || "입력창을 찾지 못했습니다.";
    showToast(message, true);
  } catch (error) {
    showToast("NotebookLM 탭에서 실행해주세요.", true);
  }
}

async function onSuggestWithAi() {
  const apiKey = sanitizeApiKey(el.geminiApiKey.value);
  if (!apiKey) {
    showToast("Gemini API 키를 먼저 입력하세요.", true);
    return;
  }

  const tab = await getCurrentTab();
  if (!tab || !tab.id) {
    showToast("활성 탭을 찾지 못했습니다.", true);
    return;
  }

  try {
    const ping = await sendMessageToTab(tab.id, { type: "PING" });
    if (!ping?.ok) {
      throw new Error("NotebookLM 탭에서 실행해주세요.");
    }
  } catch (_error) {
    showToast("NotebookLM 탭에서 실행해주세요.", true);
    return;
  }

  setAiSuggesting(true);
  showToast("슬라이드 화면을 분석 중입니다...");

  try {
    const screenshotDataUrl = await captureVisibleTab(tab.windowId);
    const currentPrompt = el.finalPrompt.value.trim();
    const aiProfile = getAiProfileOptions();
    const suggestion = await requestGeminiVisionSuggestion({
      apiKey,
      screenshotDataUrl,
      currentPrompt,
      aiProfile,
    });

    const recommendedPrompt =
      suggestion.finalPrompt ||
      buildFallbackPromptFromSuggestion(suggestion, currentPrompt, aiProfile);

    if (!recommendedPrompt) {
      throw new Error("AI 응답에 실행 가능한 프롬프트가 없습니다.");
    }

    const polishedPrompt = normalizeRecommendedPrompt(recommendedPrompt, aiProfile);
    suggestion.finalPrompt = polishedPrompt;
    setPrompt(polishedPrompt, true);
    renderAiSuggestionPreview(suggestion);
    await addRecent(polishedPrompt);
    renderSavedAndRecent();
    showToast("AI 수정 제안을 생성했습니다.");
  } catch (error) {
    showToast(error.message || "AI 제안 생성에 실패했습니다.", true);
  } finally {
    setAiSuggesting(false);
  }
}

function setAiSuggesting(isBusy) {
  state.isAiSuggesting = isBusy;
  el.btnAiSuggest.textContent = isBusy ? "AI 분석중..." : "AI 제안";
  syncPromptButtonState();
}

function sanitizeApiKey(value) {
  return String(value || "").trim();
}

function getAiProfileOptions() {
  const slideType = String(el.aiSlideType.value || "auto");
  const improvementLevel = String(el.aiImprovementLevel.value || "balanced");
  const reviewLanguage = String(el.aiReviewLanguage.value || "ko");

  return {
    slideType,
    improvementLevel,
    reviewLanguage,
    slideTypeHint: AI_SLIDE_TYPE_HINTS[slideType] || AI_SLIDE_TYPE_HINTS.auto,
    improvementHint:
      AI_IMPROVEMENT_HINTS[improvementLevel] || AI_IMPROVEMENT_HINTS.balanced,
    reviewLanguageHint:
      AI_REVIEW_LANGUAGE_HINTS[reviewLanguage] || AI_REVIEW_LANGUAGE_HINTS.ko,
  };
}

function captureVisibleTab(windowId) {
  return new Promise((resolve, reject) => {
    const options = { format: "png" };
    const callback = (dataUrl) => {
      const err = chrome.runtime.lastError;
      if (err) {
        reject(new Error(`화면 캡처 실패: ${err.message}`));
        return;
      }
      if (!dataUrl || typeof dataUrl !== "string") {
        reject(new Error("화면 캡처 결과가 비어 있습니다."));
        return;
      }
      resolve(dataUrl);
    };

    if (typeof windowId === "number") {
      chrome.tabs.captureVisibleTab(windowId, options, callback);
    } else {
      chrome.tabs.captureVisibleTab(options, callback);
    }
  });
}

function buildVisionSuggestionPrompt(currentPrompt, aiProfile) {
  const promptContext = currentPrompt
    ? `\n현재 사용자가 작성한 초안 프롬프트:\n${currentPrompt}\n`
    : "\n현재 사용자가 작성한 초안 프롬프트는 없습니다.\n";

  return [
    "너는 6-Gene Design DNA 분석 전문가이자 프레젠테이션 슬라이드 개선 코치다.",
    "이미지를 보고 슬라이드를 MECE 6유전자 프레임워크로 진단하고 개선안을 제안하라.",
    "관찰 가능한 사실만 기반으로 진단하라. 반드시 JSON만 출력하라.",
    "",
    "=== 6-Gene Design DNA Framework ===",
    "1) layout_rules: 구성(grid/freeform/centralized), 여백비율(0~1), 시선흐름(z/f/radial)",
    "2) color_palette: primary/secondary/accent HEX + 전체 온도(warm/cool/neutral)",
    "3) materiality: 기반소재(paper/glass/metal/digital), 텍스처(grain/blur/gloss/matte)",
    "4) line_shape: 선스타일(geometric/organic/hand-drawn), 굵기변화(none/low/high)",
    "5) typography: 헤드라인형식(serif/sans/display), 본문형식, 가독성점수(1-5)",
    "6) emotional_profile: 무드키워드(3개), 템포(slow/moderate/fast), 무게감(light/balanced/heavy)",
    "",
    "추가 컨텍스트:",
    `- slide_type_mode: ${aiProfile.slideType}`,
    `- slide_type_hint: ${aiProfile.slideTypeHint}`,
    `- improvement_level: ${aiProfile.improvementLevel}`,
    `- improvement_hint: ${aiProfile.improvementHint}`,
    `- review_language: ${aiProfile.reviewLanguage}`,
    `- review_language_hint: ${aiProfile.reviewLanguageHint}`,
    "",
    "응답 스키마:",
    "{",
    '  "detectedSlideType": "detected type",',
    '  "dnaAnalysis": {',
    '    "layout_rules": { "composition": "...", "whitespace_ratio": 0.0, "reading_flow": "..." },',
    '    "color_palette": { "primary": "#...", "secondary": "#...", "accent": "#...", "temperature": "warm|cool|neutral" },',
    '    "materiality": { "base": "...", "texture": ["..."] },',
    '    "line_shape": { "line_style": "...", "stroke_variance": "..." },',
    '    "typography": { "headline": "...", "body": "...", "readability": 3 },',
    '    "emotional_profile": { "mood": ["..."], "tempo": "...", "weight": "..." }',
    '  },',
    '  "dnaFitnessScore": { "styleFidelity": 0, "roleFitness": 0, "total": 0 },',
    '  "recommendedDnaStyles": ["style name 1", "style name 2"],',
    '  "diagnosis": "한 줄 진단",',
    '  "strengths": ["강점1", "강점2"],',
    '  "issues": ["문제점1", "문제점2", "문제점3"],',
    '  "suggestions": ["수정안1", "수정안2", "수정안3"],',
    '  "promptRationale": "왜 이런 수정 프롬프트를 제안하는지 근거",',
    '  "finalPrompt": "NotebookLM 슬라이드 수정창에 바로 넣을 고품질 단일 프롬프트"',
    "}",
    "",
    "규칙:",
    "1) dnaAnalysis의 6유전자를 모두 관찰 기반으로 채워라.",
    "2) dnaFitnessScore: styleFidelity(0-5) + roleFitness(0-5) = total(0-10).",
    "3) recommendedDnaStyles: 이 슬라이드에 어울리는 디자인 스타일 이름 2개를 추천하라.",
    "4) diagnosis/strengths/issues/suggestions/promptRationale 는 review_language 규칙을 따른다.",
    "5) finalPrompt는 NotebookLM에 바로 붙여넣어 실행 가능한 품질로 작성한다.",
    "6) improvement_level에 맞는 수정 강도를 반영한다.",
    "7) 최종 프롬프트는 애매한 표현 없이 구체적 실행 지시를 포함한다.",
    promptContext,
  ].join("\n");
}

async function requestGeminiVisionSuggestion({
  apiKey,
  screenshotDataUrl,
  currentPrompt,
  aiProfile,
}) {
  const base64Data = getDataUrlBase64(screenshotDataUrl);
  const requestBody = {
    contents: [
      {
        role: "user",
        parts: [
          { text: buildVisionSuggestionPrompt(currentPrompt, aiProfile) },
          {
            inlineData: {
              mimeType: "image/png",
              data: base64Data,
            },
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.3,
      topP: 0.9,
      maxOutputTokens: 2400,
      responseMimeType: "application/json",
    },
  };

  let response;
  try {
    response = await fetch(
      `${GEMINI_ENDPOINT}?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      },
    );
  } catch (error) {
    throw new Error(`Gemini 요청 실패: ${error.message}`);
  }

  let payload = {};
  try {
    payload = await response.json();
  } catch (_error) {
    payload = {};
  }

  if (!response.ok) {
    throw new Error(getGeminiErrorMessage(response.status, payload));
  }

  const modelText = extractGeminiText(payload);
  if (!modelText) {
    throw new Error("Gemini 응답이 비어 있습니다.");
  }

  return parseSuggestionPayload(modelText);
}

function getDataUrlBase64(dataUrl) {
  const index = String(dataUrl || "").indexOf(",");
  if (index === -1) {
    throw new Error("이미지 데이터 형식이 올바르지 않습니다.");
  }
  return dataUrl.slice(index + 1);
}

function extractGeminiText(payload) {
  const parts = payload?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return "";
  return parts
    .map((part) => (typeof part?.text === "string" ? part.text : ""))
    .join("\n")
    .trim();
}

function parseSuggestionPayload(modelText) {
  const fenceMatch = modelText.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const jsonText = (fenceMatch ? fenceMatch[1] : modelText).trim();

  let parsed;
  try {
    parsed = JSON.parse(jsonText);
  } catch (_error) {
    return {
      detectedSlideType: "",
      dnaAnalysis: null,
      dnaFitnessScore: null,
      recommendedDnaStyles: [],
      diagnosis: "",
      strengths: [],
      issues: [],
      suggestions: [],
      promptRationale: "",
      finalPrompt: modelText.trim(),
    };
  }

  const diagnosis = String(parsed?.diagnosis || "").trim();
  const detectedSlideType = String(parsed?.detectedSlideType || "").trim();
  const dnaAnalysis = parsed?.dnaAnalysis || null;
  const dnaFitnessScore = parsed?.dnaFitnessScore || null;
  const recommendedDnaStyles = Array.isArray(parsed?.recommendedDnaStyles)
    ? parsed.recommendedDnaStyles
        .map((item) => String(item || "").trim())
        .filter(Boolean)
        .slice(0, 3)
    : [];
  const strengths = Array.isArray(parsed?.strengths)
    ? parsed.strengths
        .map((item) => String(item || "").trim())
        .filter(Boolean)
        .filter((item, idx, arr) => arr.indexOf(item) === idx)
        .slice(0, 4)
    : [];
  const issues = Array.isArray(parsed?.issues)
    ? parsed.issues
        .map((item) => String(item || "").trim())
        .filter(Boolean)
        .filter((item, idx, arr) => arr.indexOf(item) === idx)
        .slice(0, 5)
    : [];
  const suggestions = Array.isArray(parsed?.suggestions)
    ? parsed.suggestions
        .map((item) => String(item || "").trim())
        .filter(Boolean)
        .filter((item, idx, arr) => arr.indexOf(item) === idx)
        .slice(0, 5)
    : [];
  const promptRationale = String(parsed?.promptRationale || "").trim();
  const finalPrompt = String(parsed?.finalPrompt || "").trim();

  return {
    detectedSlideType,
    dnaAnalysis,
    dnaFitnessScore,
    recommendedDnaStyles,
    diagnosis,
    strengths,
    issues,
    suggestions,
    promptRationale,
    finalPrompt,
  };
}

function buildFallbackPromptFromSuggestion(suggestion, currentPrompt, aiProfile) {
  if (currentPrompt) {
    return currentPrompt;
  }

  const bullets = [...suggestion.suggestions, ...suggestion.issues, ...suggestion.strengths]
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 3);

  if (bullets.length === 0) return "";

  const levelLine =
    aiProfile.improvementLevel === "aggressive"
      ? "Apply bold structural changes for stronger impact."
      : aiProfile.improvementLevel === "conservative"
      ? "Preserve the current structure and apply minimal changes."
      : "Keep the core structure while improving clarity and emphasis.";

  return [
    "Revise this slide with these priorities.",
    levelLine,
    ...bullets.map((item, idx) => `${idx + 1}) ${item}`),
    "Keep visual hierarchy clear, reduce clutter, and preserve the original meaning.",
  ].join(" ");
}

function normalizeRecommendedPrompt(prompt, aiProfile) {
  const compact = String(prompt || "").replace(/\s+/g, " ").trim();
  if (!compact) return "";

  const prefix =
    aiProfile.improvementLevel === "aggressive"
      ? "Apply significant redesign while preserving factual content. "
      : aiProfile.improvementLevel === "conservative"
      ? "Apply minimal edits while preserving structure and wording style. "
      : "";

  const withPrefix = compact.toLowerCase().includes("preserv")
    ? compact
    : `${prefix}${compact}`.trim();

  // Keep prompt compact to avoid overlong instructions in NotebookLM input.
  return withPrefix.length > 900 ? `${withPrefix.slice(0, 897)}...` : withPrefix;
}

function getGeminiErrorMessage(status, payload) {
  const raw = String(payload?.error?.message || "").trim();
  const lower = raw.toLowerCase();

  if (status === 400 && (lower.includes("api key") || lower.includes("api_key_invalid"))) {
    return "Gemini API 키가 유효하지 않습니다.";
  }
  if (status === 403) {
    return "Gemini API 권한이 없습니다. API 키/프로젝트 설정을 확인하세요.";
  }
  if (status === 429) {
    return "Gemini API 사용량 한도를 초과했습니다. 잠시 후 다시 시도해주세요.";
  }
  if (status >= 500) {
    return "Gemini 서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
  }
  return raw
    ? `Gemini 요청 실패 (${status}): ${raw}`
    : `Gemini 요청 실패 (${status})`;
}

function renderAiSuggestionPreview(suggestion) {
  const blocks = [];
  if (suggestion.detectedSlideType) {
    blocks.push(`[감지된 타입]\n${suggestion.detectedSlideType}`);
  }

  // DNA Fitness Score
  if (suggestion.dnaFitnessScore) {
    const fs = suggestion.dnaFitnessScore;
    const action = fs.total >= 9 ? "🔒 LOCK" : fs.total >= 7 ? "🔧 MINOR TUNE" : "⚠️ RESTRUCTURE";
    blocks.push(
      `[DNA Fitness Score]\nStyle Fidelity: ${fs.styleFidelity}/5 | Role Fitness: ${fs.roleFitness}/5 | Total: ${fs.total}/10\nAction: ${action}`,
    );
  }

  // DNA Analysis summary
  if (suggestion.dnaAnalysis) {
    const dna = suggestion.dnaAnalysis;
    const parts = [];
    if (dna.layout_rules) {
      parts.push(`Layout: ${dna.layout_rules.composition || "-"} (ws ${Math.round((dna.layout_rules.whitespace_ratio || 0) * 100)}%)`);
    }
    if (dna.color_palette) {
      parts.push(`Color: ${dna.color_palette.primary || ""} ${dna.color_palette.accent || ""} (${dna.color_palette.temperature || "-"})`);
    }
    if (dna.materiality) {
      parts.push(`Material: ${dna.materiality.base || "-"}`);
    }
    if (dna.emotional_profile) {
      parts.push(`Mood: ${(dna.emotional_profile.mood || []).join(", ")}`);
    }
    if (parts.length > 0) {
      blocks.push(`[DNA 분석]\n${parts.join("\n")}`);
    }
  }

  // Recommended DNA styles
  if (suggestion.recommendedDnaStyles && suggestion.recommendedDnaStyles.length > 0) {
    blocks.push(
      `[추천 DNA 스타일]\n${suggestion.recommendedDnaStyles.map((s, i) => `${i + 1}. ${s}`).join("\n")}`,
    );
  }

  if (suggestion.diagnosis) {
    blocks.push(`[AI 진단]\n${suggestion.diagnosis}`);
  }
  if (Array.isArray(suggestion.strengths) && suggestion.strengths.length > 0) {
    blocks.push(
      `[강점]\n${suggestion.strengths.map((item, idx) => `${idx + 1}. ${item}`).join("\n")}`,
    );
  }
  if (suggestion.issues.length > 0) {
    blocks.push(
      `[발견 이슈]\n${suggestion.issues.map((item, idx) => `${idx + 1}. ${item}`).join("\n")}`,
    );
  }
  if (suggestion.suggestions.length > 0) {
    blocks.push(
      `[수정 제안]\n${suggestion.suggestions.map((item, idx) => `${idx + 1}. ${item}`).join("\n")}`,
    );
  }
  if (suggestion.promptRationale) {
    blocks.push(`[프롬프트 근거]\n${suggestion.promptRationale}`);
  }

  el.aiSuggestionPreview.value =
    blocks.join("\n\n") || "AI 제안 결과가 없습니다. 다시 시도해주세요.";
}

async function loadStorage() {
  const storage = await chrome.storage.local.get([
    STORAGE_KEYS.saved,
    STORAGE_KEYS.recent,
    STORAGE_KEYS.geminiApiKey,
    STORAGE_KEYS.aiSlideType,
    STORAGE_KEYS.aiImprovementLevel,
    STORAGE_KEYS.aiReviewLanguage,
    STORAGE_KEYS.theme,
  ]);
  state.saved = Array.isArray(storage[STORAGE_KEYS.saved])
    ? storage[STORAGE_KEYS.saved]
    : [];
  state.recent = Array.isArray(storage[STORAGE_KEYS.recent])
    ? storage[STORAGE_KEYS.recent]
    : [];
  state.theme = typeof storage[STORAGE_KEYS.theme] === "string"
    ? storage[STORAGE_KEYS.theme]
    : "";
  el.geminiApiKey.value =
    typeof storage[STORAGE_KEYS.geminiApiKey] === "string"
      ? storage[STORAGE_KEYS.geminiApiKey]
      : "";
  el.aiSlideType.value =
    typeof storage[STORAGE_KEYS.aiSlideType] === "string"
      ? storage[STORAGE_KEYS.aiSlideType]
      : "auto";
  el.aiImprovementLevel.value =
    typeof storage[STORAGE_KEYS.aiImprovementLevel] === "string"
      ? storage[STORAGE_KEYS.aiImprovementLevel]
      : "balanced";
  el.aiReviewLanguage.value =
    typeof storage[STORAGE_KEYS.aiReviewLanguage] === "string"
      ? storage[STORAGE_KEYS.aiReviewLanguage]
      : "ko";
}

async function addRecent(prompt) {
  state.recent = [prompt, ...state.recent.filter((item) => item !== prompt)].slice(0, 25);
  await chrome.storage.local.set({ [STORAGE_KEYS.recent]: state.recent });
}

function renderSavedAndRecent() {
  renderPromptList({
    container: el.savedList,
    items: state.saved,
    emptyText: "저장된 프롬프트가 없습니다.",
    onUse: (text) => {
      setPrompt(text, true);
      switchTab("templates");
    },
    onDelete: async (index) => {
      state.saved.splice(index, 1);
      await chrome.storage.local.set({ [STORAGE_KEYS.saved]: state.saved });
      renderSavedAndRecent();
    },
  });

  renderPromptList({
    container: el.recentList,
    items: state.recent,
    emptyText: "최근 기록이 없습니다.",
    onUse: (text) => setPrompt(text, true),
    onDelete: null,
  });
}

function renderPromptList({ container, items, emptyText, onUse, onDelete }) {
  container.innerHTML = "";

  if (items.length === 0) {
    container.appendChild(createEmpty(emptyText));
    return;
  }

  items.forEach((text, index) => {
    const item = document.createElement("article");
    item.className = "saved-item";

    const paragraph = document.createElement("p");
    paragraph.textContent = text;

    const actions = document.createElement("div");
    actions.className = "saved-actions";

    const useButton = document.createElement("button");
    useButton.type = "button";
    useButton.className = "icon-mini";
    useButton.title = "불러오기";
    useButton.textContent = "↺";
    useButton.addEventListener("click", () => onUse(text));

    const copyButton = document.createElement("button");
    copyButton.type = "button";
    copyButton.className = "icon-mini";
    copyButton.title = "복사";
    copyButton.textContent = "⧉";
    copyButton.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(text);
        showToast("복사했습니다.");
      } catch (error) {
        showToast("복사 실패", true);
      }
    });

    actions.appendChild(useButton);
    actions.appendChild(copyButton);

    if (onDelete) {
      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.className = "icon-mini";
      deleteButton.title = "삭제";
      deleteButton.textContent = "✕";
      deleteButton.addEventListener("click", () => onDelete(index));
      actions.appendChild(deleteButton);
    }

    item.appendChild(paragraph);
    item.appendChild(actions);
    container.appendChild(item);
  });
}

function createEmpty(text) {
  const empty = document.createElement("div");
  empty.className = "empty";
  empty.textContent = text;
  return empty;
}

async function refreshTabStatus() {
  const tab = await getCurrentTab();
  if (!tab || !tab.id) {
    setStatus("warn", "탭 정보 없음");
    return;
  }

  try {
    const response = await sendMessageToTab(tab.id, { type: "PING" });
    if (response?.ok) {
      setStatus("ok", "NotebookLM 연결됨");
      return;
    }
  } catch (error) {
    // no-op: handled below
  }
  setStatus("warn", "NotebookLM 탭 아님");
}

function setStatus(type, text) {
  el.statusBadge.className = `status-badge ${type}`;
  el.statusBadge.textContent = text;
}

async function getCurrentTab() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return tabs[0];
}

function sendMessageToTab(tabId, payload) {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, payload, (response) => {
      const err = chrome.runtime.lastError;
      if (err) {
        reject(new Error(err.message));
        return;
      }
      resolve(response);
    });
  });
}

function showToast(message, warn = false) {
  el.toast.textContent = message;
  el.toast.className = `toast show ${warn ? "warn" : "ok"}`;
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    el.toast.classList.remove("show");
  }, 1800);
}

// ── Theme System ──

function initTheme() {
  const stored = state.theme;
  if (stored === "dark" || stored === "light") {
    applyTheme(stored);
    return;
  }
  // Default: follow system preference
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(prefersDark ? "dark" : "light");
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  el.btnThemeToggle.textContent = theme === "dark" ? "☀️" : "🌙";
  state.theme = theme;
}

async function toggleTheme() {
  const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
  applyTheme(next);
  await chrome.storage.local.set({ [STORAGE_KEYS.theme]: next });
}

// ── Onboarding (First Run) ──

async function checkOnboarding() {
  const storage = await chrome.storage.local.get([STORAGE_KEYS.onboardingDone]);
  if (!storage[STORAGE_KEYS.onboardingDone]) {
    el.onboardingOverlay.classList.add("show");
  }
}

async function dismissOnboarding() {
  el.onboardingOverlay.classList.remove("show");
  await chrome.storage.local.set({ [STORAGE_KEYS.onboardingDone]: true });
}

// ── Template Count Badge ──

function updateTemplateCount() {
  if (el.templateCount) {
    el.templateCount.textContent = String(TEMPLATES.length);
  }
}

(function initContentBridge() {
  if (window.__SLH_CONTENT_BRIDGE__) return;
  window.__SLH_CONTENT_BRIDGE__ = true;

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (!message || typeof message !== "object") return;

    if (message.type === "PING") {
      sendResponse({ ok: true, source: "notebooklm-content-script" });
      return;
    }

    if (message.type === "INJECT_PROMPT") {
      const prompt = typeof message.prompt === "string" ? message.prompt : "";
      if (!prompt.trim()) {
        sendResponse({ ok: false, message: "입력할 프롬프트가 비어 있습니다." });
        return;
      }

      const result = injectPromptIntoPage(prompt);
      sendResponse(result);
    }
  });
})();

function injectPromptIntoPage(prompt) {
  const POSITIVE_KEYWORDS =
    /slide|deck|instruction|prompt|edit|revise|update|describe|layout|style|title|bullet|image|apply|generate|수정|변경|슬라이드|지시|명령|적용|생성/i;
  const NEGATIVE_KEYWORDS =
    /search|filter|find|url|link|chat|ask|query|source|notebook|검색|찾기|질문/i;

  const selectorWeights = [
    { selector: 'div[role="dialog"] textarea[aria-label*="instruction" i]', weight: 200 },
    { selector: 'div[role="dialog"] textarea[placeholder*="instruction" i]', weight: 195 },
    { selector: 'div[role="dialog"] textarea[placeholder*="slide" i]', weight: 192 },
    { selector: 'div[role="dialog"] textarea[aria-label*="slide" i]', weight: 190 },
    { selector: 'div[role="dialog"] [contenteditable="true"][role="textbox"]', weight: 188 },
    { selector: 'textarea[aria-label*="instruction" i]', weight: 180 },
    { selector: 'textarea[placeholder*="instruction" i]', weight: 178 },
    { selector: 'textarea[aria-label*="slide" i]', weight: 176 },
    { selector: 'textarea[placeholder*="slide" i]', weight: 174 },
    { selector: 'textarea[placeholder*="describe" i]', weight: 172 },
    { selector: 'textarea[aria-label*="edit" i]', weight: 170 },
    { selector: 'textarea[placeholder*="edit" i]', weight: 168 },
    { selector: '[aria-modal="true"] textarea', weight: 160 },
    { selector: '[aria-modal="true"] [contenteditable="true"]', weight: 158 },
    { selector: 'div[role="dialog"] textarea', weight: 152 },
    { selector: 'div[role="dialog"] [contenteditable="true"]', weight: 148 },
    { selector: '[contenteditable="true"][role="textbox"]', weight: 132 },
    { selector: "textarea", weight: 124 },
    { selector: '[contenteditable="true"]', weight: 104 },
    { selector: 'input[type="text"]', weight: 76 },
  ];

  const isVisible = (node) => {
    if (!node) return false;
    const rect = node.getBoundingClientRect();
    if (rect.width < 120 || rect.height < 24) return false;
    const style = window.getComputedStyle(node);
    if (
      style.visibility === "hidden" ||
      style.display === "none" ||
      style.opacity === "0"
    ) {
      return false;
    }
    if (rect.bottom <= 0 || rect.right <= 0) return false;
    if (rect.top >= window.innerHeight || rect.left >= window.innerWidth) return false;
    return true;
  };

  const isEditable = (node) => {
    if (!node) return false;
    if (node.isContentEditable) return true;
    const tag = node.tagName;
    if (tag === "TEXTAREA") return !node.disabled && !node.readOnly;
    if (tag === "INPUT") {
      const type = (node.type || "text").toLowerCase();
      return type === "text" && !node.disabled && !node.readOnly;
    }
    return false;
  };

  const getAllRoots = () => {
    const roots = [document];
    const queue = [document];
    const visited = new Set([document]);

    while (queue.length > 0) {
      const root = queue.shift();
      const nodes = root.querySelectorAll("*");
      for (const node of nodes) {
        if (node.shadowRoot && !visited.has(node.shadowRoot)) {
          visited.add(node.shadowRoot);
          roots.push(node.shadowRoot);
          queue.push(node.shadowRoot);
        }
      }
    }
    return roots;
  };

  const queryAllDeep = (selector, roots) => {
    const collected = [];
    for (const root of roots) {
      const found = root.querySelectorAll(selector);
      for (const node of found) collected.push(node);
    }
    return collected;
  };

  const getContextText = (node) => {
    const parts = [
      node.getAttribute("placeholder") || "",
      node.getAttribute("aria-label") || "",
      node.getAttribute("name") || "",
      node.id || "",
      node.className || "",
      node.getAttribute("data-testid") || "",
      node.getAttribute("data-placeholder") || "",
    ];

    const region = node.closest(
      '[role="dialog"], [aria-modal="true"], form, section, article, main, aside'
    );
    if (region) {
      parts.push(region.getAttribute("aria-label") || "");
      parts.push(region.className || "");
      const heading = region.querySelector("h1, h2, h3, [role='heading']");
      if (heading) parts.push(heading.textContent || "");
      parts.push((region.textContent || "").slice(0, 1400));
    }

    if (node.id && typeof CSS !== "undefined" && typeof CSS.escape === "function") {
      const label = document.querySelector(`label[for="${CSS.escape(node.id)}"]`);
      if (label) parts.push(label.textContent || "");
    }

    return parts.join(" ").replace(/\s+/g, " ").trim();
  };

  const applyPromptToNode = (target) => {
    target.focus();

    if (target.isContentEditable) {
      target.textContent = prompt;
      try {
        target.dispatchEvent(new InputEvent("input", { bubbles: true, data: prompt }));
      } catch (error) {
        target.dispatchEvent(new Event("input", { bubbles: true }));
      }
      target.dispatchEvent(new Event("change", { bubbles: true }));
    } else {
      const proto =
        target.tagName === "TEXTAREA"
          ? window.HTMLTextAreaElement.prototype
          : window.HTMLInputElement.prototype;
      const descriptor = Object.getOwnPropertyDescriptor(proto, "value");
      if (descriptor && descriptor.set) {
        descriptor.set.call(target, prompt);
      } else {
        target.value = prompt;
      }
      target.dispatchEvent(new Event("input", { bubbles: true }));
      target.dispatchEvent(new Event("change", { bubbles: true }));
    }

    target.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const scoreCandidate = (node, baseWeight) => {
    let score = baseWeight;
    const rect = node.getBoundingClientRect();
    const contextText = getContextText(node);
    const context = contextText.toLowerCase();

    if (node.closest('[role="dialog"], [aria-modal="true"]')) score += 30;
    if (node === document.activeElement) score += 30;
    if (node.tagName === "TEXTAREA") score += 22;
    if (node.isContentEditable) score += 10;

    if (rect.left > window.innerWidth * 0.45) score += 8;
    if (rect.top > window.innerHeight * 0.15 && rect.top < window.innerHeight * 0.85) {
      score += 6;
    }

    const areaBonus = Math.min(28, (rect.width * rect.height) / 18000);
    score += areaBonus;

    if (POSITIVE_KEYWORDS.test(contextText)) score += 30;
    if (NEGATIVE_KEYWORDS.test(contextText)) score -= 42;

    if (/ask notebooklm|chat/i.test(context)) score -= 56;
    if (/prompt|instruction|revise|update|apply|슬라이드|수정|적용|지시/.test(context)) {
      score += 20;
    }
    if (/search|query|filter|url|link|source|notebook/.test(context)) score -= 24;

    return score;
  };

  const roots = getAllRoots();
  const candidateMap = new Map();
  for (const { selector, weight } of selectorWeights) {
    const nodes = queryAllDeep(selector, roots);
    for (const node of nodes) {
      if (!isVisible(node) || !isEditable(node)) continue;
      const prev = candidateMap.get(node);
      if (!prev || weight > prev.weight) {
        candidateMap.set(node, { node, weight, selector });
      }
    }
  }

  const ranked = [...candidateMap.values()]
    .map((entry) => ({
      ...entry,
      score: scoreCandidate(entry.node, entry.weight),
    }))
    .sort((a, b) => b.score - a.score);

  const best = ranked[0];
  if (best && best.score >= 95) {
    applyPromptToNode(best.node);
    return { ok: true, selector: best.selector, score: Math.round(best.score) };
  }

  const focused = document.activeElement;
  if (isEditable(focused) && isVisible(focused)) {
    applyPromptToNode(focused);
    return { ok: true, selector: "focused-element-fallback", score: 0 };
  }

  return {
    ok: false,
    message:
      "NotebookLM 편집 입력창을 찾지 못했습니다. 슬라이드 편집 패널의 입력칸을 한 번 클릭한 뒤 다시 시도해주세요.",
  };
}

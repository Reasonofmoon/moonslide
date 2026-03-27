// ── Command Template Data ──────────────────────────────────────────────────
const CATEGORIES = [
  {
    id: "layout",
    icon: "📐",
    name: "레이아웃 / Layout",
    open: true,
    commands: [
      { label: "이미지 중앙 배치", text: "Center the image on the page" },
      { label: "이미지 우측 배치", text: "Move the image to the right side" },
      { label: "이미지 좌측 배치", text: "Move the image to the left side" },
      { label: "텍스트 상단 배치", text: "Move the text to the top of the slide" },
      { label: "텍스트 하단 배치", text: "Move the text to the bottom of the slide" },
      { label: "요소 균등 배치", text: "Distribute all elements evenly across the slide" },
      { label: "여백 추가", text: "Add more white space around the content" },
      { label: "전체 재배치", text: "Rearrange all elements for better visual balance" },
    ],
  },
  {
    id: "text",
    icon: "✍️",
    name: "텍스트 / Text",
    open: true,
    commands: [
      { label: "제목 짧게", text: "Make the title shorter" },
      { label: "제목 크게", text: "Make the title font larger" },
      { label: "본문 간결하게", text: "Shorten the body text to key points only" },
      { label: "글머리 기호 추가", text: "Format the body text as bullet points" },
      { label: "폰트 키우기", text: "Increase the font size for all text" },
      { label: "폰트 줄이기", text: "Decrease the font size for all text" },
      { label: "강조 텍스트 추가", text: "Add a bold highlight to the most important phrase" },
      { label: "부제목 추가", text: "Add a subtitle below the main title" },
      { label: "텍스트 중앙 정렬", text: "Center-align all text on the slide" },
    ],
  },
  {
    id: "image",
    icon: "🖼️",
    name: "이미지 / Image",
    open: false,
    commands: [
      { label: "이미지 크게", text: "Make the image larger" },
      { label: "이미지 작게", text: "Make the image smaller" },
      { label: "이미지 둥글게", text: "Apply rounded corners to the image" },
      { label: "이미지 배경 제거", text: "Remove the background from the image area" },
      { label: "이미지 상단 이동", text: "Move the image to the top of the slide" },
      { label: "이미지 전체 배경", text: "Use the image as a full-slide background" },
      { label: "이미지 반투명", text: "Make the image semi-transparent" },
    ],
  },
  {
    id: "color",
    icon: "🎨",
    name: "색상 / Color",
    open: false,
    commands: [
      { label: "배경 어둡게", text: "Change the background to a dark color" },
      { label: "배경 밝게", text: "Change the background to a light color" },
      { label: "배경 그라디언트", text: "Apply a gradient background to the slide" },
      { label: "텍스트 흰색", text: "Change all text color to white" },
      { label: "텍스트 강조색", text: "Highlight the title text with an accent color" },
      { label: "브랜드 컬러 적용", text: "Apply a professional blue color scheme" },
      { label: "배경 투명하게", text: "Make the slide background transparent" },
    ],
  },
  {
    id: "structure",
    icon: "🏗️",
    name: "구조 / Structure",
    open: false,
    commands: [
      { label: "2단 레이아웃", text: "Split the content into a two-column layout" },
      { label: "헤더 추가", text: "Add a header bar at the top of the slide" },
      { label: "푸터 추가", text: "Add a footer with page number at the bottom" },
      { label: "구분선 추가", text: "Add a horizontal divider line between sections" },
      { label: "아이콘 박스 추가", text: "Add icon boxes for each key point" },
      { label: "번호 목록 추가", text: "Convert content to a numbered list" },
      { label: "표 추가", text: "Arrange the content in a table format" },
    ],
  },
  {
    id: "style",
    icon: "💎",
    name: "스타일 / Style",
    open: false,
    commands: [
      { label: "미니멀 스타일", text: "Apply a minimal, clean design style" },
      { label: "모던 스타일", text: "Apply a modern, bold design style" },
      { label: "전문적 스타일", text: "Make the slide look more professional and corporate" },
      { label: "교육용 스타일", text: "Apply a friendly, educational design style" },
      { label: "강조 박스 추가", text: "Add a highlighted callout box for the key message" },
      { label: "그림자 효과", text: "Add drop shadows to the main elements" },
      { label: "테두리 추가", text: "Add a decorative border around the slide content" },
    ],
  },
  {
    id: "content",
    icon: "📝",
    name: "콘텐츠 / Content",
    open: false,
    commands: [
      { label: "핵심만 남기기", text: "Remove less important text and keep only the key message" },
      { label: "숫자/통계 강조", text: "Make the statistics or numbers more visually prominent" },
      { label: "CTA 버튼 추가", text: "Add a call-to-action button at the bottom" },
      { label: "로고 공간 확보", text: "Add a placeholder for a logo in the top left corner" },
      { label: "인용구 스타일", text: "Format the main text as a large pull quote" },
      { label: "단계 표시 추가", text: "Add step numbers (1, 2, 3...) to each content block" },
    ],
  },
];

// ── State ───────────────────────────────────────────────────────────────────
let selectedText = "";
let savedCommands = [];

// ── Init ────────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", async () => {
  await loadSaved();
  renderCategories(CATEGORIES);
  bindTabs();
  bindSearch();
  bindActions();
  bindCustom();
});

// ── Tabs ────────────────────────────────────────────────────────────────────
function bindTabs() {
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
      document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));
      btn.classList.add("active");
      const panelId = "tab-" + btn.dataset.tab;
      document.getElementById(panelId).classList.add("active");

      const isCommandTab = btn.dataset.tab === "commands";
      document.getElementById("preview").classList.toggle("visible", isCommandTab && !!selectedText);
      document.getElementById("main-actions").style.display = isCommandTab ? "flex" : "none";

      if (btn.dataset.tab === "saved") renderSaved();
    });
  });
}

// ── Render categories ───────────────────────────────────────────────────────
function renderCategories(cats, filter = "") {
  const container = document.getElementById("categories");
  container.innerHTML = "";

  cats.forEach((cat) => {
    const chips = cat.commands.filter(
      (c) => !filter || c.label.includes(filter) || c.text.toLowerCase().includes(filter.toLowerCase())
    );
    if (chips.length === 0) return;

    const catEl = document.createElement("div");
    catEl.className = "category";

    const header = document.createElement("div");
    header.className = "category-header";
    header.innerHTML = `
      <span class="category-icon">${cat.icon}</span>
      <span class="category-name">${cat.name}</span>
      <span class="category-toggle">${cat.open || filter ? "▲" : "▼"}</span>
    `;
    catEl.appendChild(header);

    const body = document.createElement("div");
    body.className = "category-body" + (cat.open || filter ? "" : " collapsed");
    catEl.appendChild(body);

    header.addEventListener("click", () => {
      body.classList.toggle("collapsed");
      header.querySelector(".category-toggle").textContent = body.classList.contains("collapsed") ? "▼" : "▲";
    });

    chips.forEach((cmd) => {
      const chip = document.createElement("div");
      chip.className = "chip";
      chip.dataset.text = cmd.text;
      chip.innerHTML = `<span>${cmd.label}</span>`;
      chip.addEventListener("click", () => {
        document.querySelectorAll(".chip.selected").forEach((c) => c.classList.remove("selected"));
        chip.classList.add("selected");
        selectedText = cmd.text;
        document.getElementById("preview-text").textContent = cmd.text;
        document.getElementById("preview").classList.add("visible");
        document.getElementById("btn-inject").disabled = false;
      });
      body.appendChild(chip);
    });

    container.appendChild(catEl);
  });
}

// ── Search ──────────────────────────────────────────────────────────────────
function bindSearch() {
  document.getElementById("search").addEventListener("input", (e) => {
    renderCategories(CATEGORIES, e.target.value.trim());
  });
}

// ── Actions ─────────────────────────────────────────────────────────────────
function bindActions() {
  document.getElementById("btn-inject").addEventListener("click", () => {
    if (selectedText) injectToPage(selectedText);
  });

  document.getElementById("btn-save").addEventListener("click", () => {
    if (selectedText) saveCommand(selectedText);
  });
}

function bindCustom() {
  document.getElementById("btn-inject-custom").addEventListener("click", () => {
    const text = document.getElementById("custom-text").value.trim();
    if (text) injectToPage(text);
  });

  document.getElementById("btn-save-custom").addEventListener("click", () => {
    const text = document.getElementById("custom-text").value.trim();
    if (text) saveCommand(text);
  });
}

// ── Inject to NotebookLM ────────────────────────────────────────────────────
function injectToPage(text) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: fillSlideInput,
      args: [text],
    }, (results) => {
      if (results && results[0] && results[0].result === true) {
        showToast("✅ 명령어 입력 완료!");
      } else {
        showToast("⚠️ 슬라이드 편집 창을 먼저 열어주세요", true);
      }
    });
  });
}

// Injected into page context
function fillSlideInput(text) {
  const selectors = [
    'textarea[placeholder*="Center the image"]',
    'textarea[placeholder*="Make the title"]',
    'textarea[placeholder*="page"]',
    'input[placeholder*="Center the image"]',
    'input[placeholder*="Make the title"]',
    '.slide-edit-input textarea',
    '.slide-edit-input input',
    'textarea',
  ];

  let el = null;
  for (const sel of selectors) {
    const found = document.querySelector(sel);
    if (found && found.offsetParent !== null) { // visible check
      el = found;
      break;
    }
  }

  // Fallback: find visible textarea in a dialog/modal
  if (!el) {
    const all = Array.from(document.querySelectorAll("textarea, input[type=text]"));
    el = all.find((e) => e.offsetParent !== null && e.getBoundingClientRect().width > 100);
  }

  if (!el) return false;

  el.focus();
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    el.tagName === "TEXTAREA" ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype,
    "value"
  ).set;
  nativeInputValueSetter.call(el, text);
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  return true;
}

// ── Saved commands ───────────────────────────────────────────────────────────
async function loadSaved() {
  const result = await chrome.storage.local.get("savedCommands");
  savedCommands = result.savedCommands || [];
}

async function saveCommand(text) {
  await loadSaved();
  if (savedCommands.includes(text)) {
    showToast("이미 저장된 명령어입니다");
    return;
  }
  savedCommands.unshift(text);
  if (savedCommands.length > 50) savedCommands = savedCommands.slice(0, 50);
  await chrome.storage.local.set({ savedCommands });
  showToast("⭐ 저장 완료!");
}

function renderSaved() {
  const list = document.getElementById("saved-list");
  list.innerHTML = "";

  if (savedCommands.length === 0) {
    list.innerHTML = '<div class="empty-state">저장된 명령어가 없습니다.<br>명령어 선택 후 ⭐ 저장을 눌러보세요.</div>';
    return;
  }

  savedCommands.forEach((cmd, idx) => {
    const item = document.createElement("div");
    item.className = "saved-item";
    item.innerHTML = `
      <span class="saved-text">${cmd}</span>
      <div class="saved-actions">
        <button class="icon-btn" title="슬라이드에 입력" data-inject="${idx}">✦</button>
        <button class="icon-btn" title="삭제" data-delete="${idx}">✕</button>
      </div>
    `;
    item.querySelector("[data-inject]").addEventListener("click", () => injectToPage(cmd));
    item.querySelector("[data-delete]").addEventListener("click", async () => {
      savedCommands.splice(idx, 1);
      await chrome.storage.local.set({ savedCommands });
      renderSaved();
    });
    list.appendChild(item);
  });
}

// ── Toast ───────────────────────────────────────────────────────────────────
function showToast(msg, isWarn = false) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.style.background = isWarn ? "#3a1a1a" : "#1a4a2e";
  t.style.borderColor = isWarn ? "#7a2a2a" : "#2a7a4e";
  t.style.color = isWarn ? "#ff8080" : "#5dca8a";
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2200);
}

// content.js — NotebookLM Slide Command Helper
// Watches for the "Change Slide N" input and adds a quick-access button

(function () {
  "use strict";

  let overlayBtn = null;
  let targetInput = null;
  let observer = null;

  function createOverlayButton(inputEl) {
    if (overlayBtn) overlayBtn.remove();

    overlayBtn = document.createElement("div");
    overlayBtn.id = "slm-overlay-btn";
    overlayBtn.title = "Slide Command Helper 열기";
    overlayBtn.textContent = "🎞";

    overlayBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      // Highlight the input briefly
      if (targetInput) {
        targetInput.style.outline = "2px solid #4a9eff";
        setTimeout(() => (targetInput.style.outline = ""), 1200);
      }
    });

    document.body.appendChild(overlayBtn);
    positionButton(inputEl);
  }

  function positionButton(inputEl) {
    if (!overlayBtn || !inputEl) return;
    const rect = inputEl.getBoundingClientRect();
    overlayBtn.style.top = `${rect.top + window.scrollY + 6}px`;
    overlayBtn.style.right = `${window.innerWidth - rect.right + 8}px`;
  }

  function findSlideInput() {
    // Match the placeholder text shown in the screenshot
    const all = Array.from(document.querySelectorAll("textarea, input[type=text]"));
    return all.find(
      (el) =>
        el.placeholder &&
        (el.placeholder.includes("Center the image") ||
          el.placeholder.includes("Make the title") ||
          el.placeholder.includes("shorter") ||
          el.placeholder.includes("page"))
    );
  }

  function watchDOM() {
    observer = new MutationObserver(() => {
      const input = findSlideInput();
      if (input && input !== targetInput) {
        targetInput = input;
        createOverlayButton(input);
      } else if (!input && overlayBtn) {
        overlayBtn.remove();
        overlayBtn = null;
        targetInput = null;
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  window.addEventListener("scroll", () => {
    if (targetInput) positionButton(targetInput);
  });

  window.addEventListener("resize", () => {
    if (targetInput) positionButton(targetInput);
  });

  watchDOM();
})();

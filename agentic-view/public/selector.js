// Client-side script for element selection and highlighting
(function () {
  'use strict';

  let highlightOverlay = null;
  let selectedElement = null;

  function createHighlightOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'agentic-view-highlight';
    overlay.style.cssText = `
      position: absolute;
      pointer-events: none;
      border: 2px solid #3b82f6;
      background: rgba(59, 130, 246, 0.1);
      z-index: 999999;
      transition: all 0.15s ease;
      display: none;
    `;
    document.body.appendChild(overlay);
    return overlay;
  }

  function getElementSelector(element) {
    if (element.id) {
      return `#${element.id}`;
    }

    if (element.className && typeof element.className === 'string') {
      const classes = element.className.trim().split(/\s+/).join('.');
      if (classes) {
        const selector = `${element.tagName.toLowerCase()}.${classes}`;
        if (document.querySelectorAll(selector).length === 1) {
          return selector;
        }
      }
    }

    let path = [];
    let current = element;

    while (current && current !== document.body) {
      let selector = current.tagName.toLowerCase();

      if (current.id) {
        selector = `#${current.id}`;
        path.unshift(selector);
        break;
      }

      const siblings = Array.from(current.parentNode?.children || []);
      const sameTag = siblings.filter(s => s.tagName === current.tagName);

      if (sameTag.length > 1) {
        const index = sameTag.indexOf(current) + 1;
        selector += `:nth-of-type(${index})`;
      }

      path.unshift(selector);
      current = current.parentNode;
    }

    return path.join(' > ');
  }

  function updateHighlight(element) {
    if (!highlightOverlay) {
      highlightOverlay = createHighlightOverlay();
    }

    const rect = element.getBoundingClientRect();
    highlightOverlay.style.display = 'block';
    highlightOverlay.style.top = `${rect.top + window.scrollY}px`;
    highlightOverlay.style.left = `${rect.left + window.scrollX}px`;
    highlightOverlay.style.width = `${rect.width}px`;
    highlightOverlay.style.height = `${rect.height}px`;
  }

  function hideHighlight() {
    if (highlightOverlay) {
      highlightOverlay.style.display = 'none';
    }
  }

  document.addEventListener('mouseover', function (e) {
    if (e.target === highlightOverlay) return;
    updateHighlight(e.target);
  });

  document.addEventListener('mouseout', function (e) {
    if (e.target === highlightOverlay) return;
    hideHighlight();
  });

  document.addEventListener('click', function (e) {
    e.preventDefault();
    e.stopPropagation();

    selectedElement = e.target;
    const selector = getElementSelector(selectedElement);
    const text = selectedElement.textContent?.trim() || '';
    const html = selectedElement.outerHTML;

    window.parent.postMessage({
      type: 'ELEMENT_SELECTED',
      data: {
        selector,
        text,
        html,
        tagName: selectedElement.tagName.toLowerCase(),
      }
    }, '*');
  }, true);

  window.addEventListener('message', function (e) {
    if (e.data.type === 'HIGHLIGHT_SELECTOR') {
      const element = document.querySelector(e.data.selector);
      if (element) {
        updateHighlight(element);
      }
    } else if (e.data.type === 'CLEAR_HIGHLIGHT') {
      hideHighlight();
    }
  });
})();

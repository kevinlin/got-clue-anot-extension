// Content script for Got Clue Anot extension

// Initialize the selection system
(function() {
  'use strict';
  
  // Selection state
  let isActive = false;
  let currentElement = null;
  let selectedElement = null;
  let hoverOverlay = null;
  let selectionOverlay = null;
  
  // Overlay styles
  const OVERLAY_STYLE = {
    position: 'absolute',
    pointerEvents: 'none',
    zIndex: '999999',
    transition: 'all 0.2s ease'
  };
  
  const HOVER_OVERLAY_STYLE = {
    ...OVERLAY_STYLE,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    border: '2px dashed #8b5cf6'
  };
  
  const SELECTED_OVERLAY_STYLE = {
    ...OVERLAY_STYLE,
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
    border: '3px solid #8b5cf6'
  };
  

  
  // Helper function to check if extension context is valid
  function isExtensionContextValid() {
    try {
      return !!(chrome?.runtime?.id);
    } catch (error) {
      return false;
    }
  }
  
  // Helper function to safely send messages to background script
  function safeSendMessage(message, callback) {
    if (!isExtensionContextValid()) {
      console.warn('Got Clue Anot: Extension context invalidated, message not sent:', message);
      return;
    }
    
    try {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          console.warn('Got Clue Anot: Message sending failed:', chrome.runtime.lastError.message);
        } else if (callback) {
          callback(response);
        }
      });
    } catch (error) {
      console.warn('Got Clue Anot: Failed to send message:', error.message);
    }
  }
  
  // Create selection manager
  window.gotClueSelection = {
    start: startSelection,
    stop: stopSelection
  };
  
  // Initialize modal system
  initializeModal();
  
  // Initialize OCR system
  initializeOCR();
  
  function startSelection() {
    if (isActive) return;
    
    isActive = true;
    document.addEventListener('mouseover', handleMouseOver, true);
    document.addEventListener('mouseout', handleMouseOut, true);
    document.addEventListener('click', handleClick, true);
    window.addEventListener('scroll', updateOverlayPositions, true);
    window.addEventListener('resize', updateOverlayPositions, true);
    
    // Change cursor to indicate selection mode
    document.body.style.cursor = 'crosshair';
    
    // Clear any previous selection
    clearSelection();
  }
  
  function stopSelection() {
    if (!isActive) return;
    
    isActive = false;
    document.removeEventListener('mouseover', handleMouseOver, true);
    document.removeEventListener('mouseout', handleMouseOut, true);
    document.removeEventListener('click', handleClick, true);
    window.removeEventListener('scroll', updateOverlayPositions, true);
    window.removeEventListener('resize', updateOverlayPositions, true);
    
    // Restore cursor
    document.body.style.cursor = '';
    
    // Clear hover highlight
    clearHover();
    
    // Clean up overlays
    cleanupOverlays();
    
    // Notify background script (with error handling)
    safeSendMessage({ type: 'SELECTION_STOPPED' }, (response) => {
      if (response && response.success) {
        console.log('Got Clue Anot: Selection stopped successfully');
      }
    });
  }
  
  function handleMouseOver(event) {
    if (!isActive) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    clearHover();
    currentElement = event.target;
    showHoverOverlay(currentElement);
  }
  
  function handleMouseOut(event) {
    if (!isActive) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    clearHover();
  }
  
  async function handleClick(event) {
    if (!isActive) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    // Select the element
    clearSelection();
    selectedElement = event.target;
    showSelectionOverlay(selectedElement);
    
    // Stop selection mode first
    stopSelection();
    
    try {
      // Check if element is image or video
      if (window.gotClueOCR && (window.gotClueOCR.isImageElement(selectedElement) || window.gotClueOCR.isVideoElement(selectedElement))) {
        // Show loading indicator
        showLoadingModal();
        
        // Extract text using OCR
        const extractedText = await window.gotClueOCR.extractText(selectedElement);
        
        // Hide loading indicator
        hideLoadingModal();
        
        // Send extracted text to background script
        safeSendMessage({
          type: 'ELEMENT_SELECTED',
          html: null,
          extractedText: extractedText,
          elementType: selectedElement.tagName.toLowerCase()
        }, (response) => {
          if (response && response.success) {
            console.log('Got Clue Anot: OCR text extraction processed successfully');
          }
        });
      } else {
        // Regular HTML element - extract HTML content
        const html = selectedElement.outerHTML;
        
        // Send to background script (with error handling)
        safeSendMessage({
          type: 'ELEMENT_SELECTED',
          html: html,
          extractedText: null,
          elementType: 'html'
        }, (response) => {
          if (response && response.success) {
            console.log('Got Clue Anot: Element selection processed successfully');
          }
        });
      }
    } catch (error) {
      console.error('Got Clue Anot: Error processing selected element:', error);
      hideLoadingModal();
      
      // Show error and fallback to HTML extraction
      safeSendMessage({
        type: 'ELEMENT_SELECTED',
        html: selectedElement.outerHTML,
        extractedText: null,
        elementType: 'html',
        error: error.message
      }, (response) => {
        if (response && response.success) {
          console.log('Got Clue Anot: Fallback to HTML processing');
        }
      });
    }
  }
  
  function createOverlay(styles) {
    const overlay = document.createElement('div');
    Object.assign(overlay.style, styles);
    return overlay;
  }
  
  function positionOverlay(overlay, element) {
    const rect = element.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    
    overlay.style.top = (rect.top + scrollTop) + 'px';
    overlay.style.left = (rect.left + scrollLeft) + 'px';
    overlay.style.width = rect.width + 'px';
    overlay.style.height = rect.height + 'px';
  }
  
  function showHoverOverlay(element) {
    if (!hoverOverlay) {
      hoverOverlay = createOverlay(HOVER_OVERLAY_STYLE);
      document.body.appendChild(hoverOverlay);
    }
    positionOverlay(hoverOverlay, element);
    hoverOverlay.style.display = 'block';
  }
  
  function showSelectionOverlay(element) {
    if (!selectionOverlay) {
      selectionOverlay = createOverlay(SELECTED_OVERLAY_STYLE);
      document.body.appendChild(selectionOverlay);
    }
    positionOverlay(selectionOverlay, element);
    selectionOverlay.style.display = 'block';
  }
  
  function updateOverlayPositions() {
    if (currentElement && hoverOverlay && hoverOverlay.style.display !== 'none') {
      positionOverlay(hoverOverlay, currentElement);
    }
    if (selectedElement && selectionOverlay && selectionOverlay.style.display !== 'none') {
      positionOverlay(selectionOverlay, selectedElement);
    }
  }
  
  function clearHover() {
    if (hoverOverlay) {
      hoverOverlay.style.display = 'none';
    }
    currentElement = null;
  }
  
  function clearSelection() {
    if (selectionOverlay) {
      selectionOverlay.style.display = 'none';
    }
    selectedElement = null;
  }
  
  // Clean up overlays when selection stops
  function cleanupOverlays() {
    if (hoverOverlay) {
      hoverOverlay.remove();
      hoverOverlay = null;
    }
    if (selectionOverlay) {
      selectionOverlay.remove();
      selectionOverlay = null;
    }
  }
  
  function initializeModal() {
    // Check if extension context is valid before trying to load modal
    if (!isExtensionContextValid()) {
      console.warn('Got Clue Anot: Extension context invalidated, cannot initialize modal');
      return;
    }
    
    // Modal system will be initialized by modal.js
    if (!window.gotClueModal) {
      try {
        // Load modal system
        const script = document.createElement('script');
        script.src = chrome.runtime.getURL('modal.js');
        script.onload = function() {
          console.log('Modal system loaded');
        };
        script.onerror = function() {
          console.warn('Got Clue Anot: Failed to load modal system - extension context may be invalidated');
        };
        (document.head || document.documentElement).appendChild(script);
      } catch (error) {
        console.warn('Got Clue Anot: Failed to initialize modal:', error.message);
      }
    }
  }
  
  function initializeOCR() {
    // Check if extension context is valid before trying to load OCR
    if (!isExtensionContextValid()) {
      console.warn('Got Clue Anot: Extension context invalidated, cannot initialize OCR');
      return;
    }
    
    // OCR system will be initialized by ocr.js
    if (!window.gotClueOCR) {
      try {
        // Load OCR system
        const script = document.createElement('script');
        script.src = chrome.runtime.getURL('utils/ocr.js');
        script.onload = function() {
          console.log('OCR system loaded');
        };
        script.onerror = function() {
          console.warn('Got Clue Anot: Failed to load OCR system - extension context may be invalidated');
        };
        (document.head || document.documentElement).appendChild(script);
      } catch (error) {
        console.warn('Got Clue Anot: Failed to initialize OCR:', error.message);
      }
    }
  }
  
  // Loading modal functions
  let loadingModal = null;
  
  function showLoadingModal() {
    if (loadingModal) return;
    
    loadingModal = document.createElement('div');
    loadingModal.style.cssText = `
      position: fixed !important;
      top: 50% !important;
      left: 50% !important;
      transform: translate(-50%, -50%) !important;
      background: rgba(0, 0, 0, 0.8) !important;
      color: white !important;
      padding: 20px !important;
      border-radius: 8px !important;
      z-index: 1000000 !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      font-size: 16px !important;
      text-align: center !important;
      min-width: 200px !important;
    `;
    
    loadingModal.innerHTML = `
      <div style="margin-bottom: 10px;">🔍 Extracting text...</div>
      <div style="font-size: 12px; opacity: 0.7;">This may take a few seconds</div>
    `;
    
    document.body.appendChild(loadingModal);
  }
  
  function hideLoadingModal() {
    if (loadingModal) {
      loadingModal.remove();
      loadingModal = null;
    }
  }
})(); 
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
      console.warn('Got Clue Anot: Extension context invalidated');
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
  
  // Helper function to check if OCR is ready
  function isOCRReady() {
    return window.gotClueOCR && window.gotClueOCR.ready === true || window.gotClueOCRReady === true;
  }
  
  // Helper function to get OCR status for debugging
  function getOCRStatus() {
    if (window.gotClueOCRReady) {
      return 'OCR ready via main world communication';
    }
    if (!window.gotClueOCR) {
      return 'OCR object not found';
    }
    return {
      ready: window.gotClueOCR.ready,
      error: window.gotClueOCR.error || 'none',
      hasExtractText: typeof window.gotClueOCR.extractText === 'function'
    };
  }
  
  // Helper function to extract text using message passing
  function extractTextViaMessage(element) {
    return new Promise((resolve, reject) => {
      // Create a unique selector for the element
      const selector = createUniqueSelector(element);
      
      // Set up callback for result
      window.gotClueOCRCallback = (result, error) => {
        window.gotClueOCRCallback = null;
        if (error) {
          reject(new Error(error));
        } else if (result && result.trim()) {
          resolve(result);
        } else {
          reject(new Error('No text extracted from element'));
        }
      };
      
      // Send extraction request
      window.postMessage({
        type: 'GOT_CLUE_OCR_EXTRACT',
        selector: selector
      }, '*');
      
      // Timeout after 30 seconds
      setTimeout(() => {
        if (window.gotClueOCRCallback) {
          window.gotClueOCRCallback = null;
          reject(new Error('OCR extraction timeout - process took too long'));
        }
      }, 30000);
    });
  }
  
  // Helper function to create a unique selector for an element
  function createUniqueSelector(element) {
    // Simple approach: use element's position and tag
    const rect = element.getBoundingClientRect();
    const tagName = element.tagName.toLowerCase();
    
    // Try to find a unique selector
    if (element.id) {
      return `#${element.id}`;
    }
    
    if (element.className) {
      const className = element.className.split(' ')[0];
      return `${tagName}.${className}`;
    }
    
    // Fallback: use position-based approach
    const parent = element.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children);
      const index = siblings.indexOf(element);
      const parentSelector = parent.tagName.toLowerCase();
      return `${parentSelector} > ${tagName}:nth-child(${index + 1})`;
    }
    
    return tagName;
  }
  
  // Create selection manager
  window.gotClueSelection = {
    start: startSelection,
    stop: stopSelection
  };
  
  // Initialize modal system
  initializeModal();
  
  // OCR system should be pre-loaded by background script into main world
  // Check if it's accessible and wait if needed
  checkOCRAvailability();
  
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
      // Selection stopped successfully (no need to log)
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
      // Check if element is image or video and OCR is ready
      const isImageOrVideo = selectedElement.tagName === 'IMG' || selectedElement.tagName === 'VIDEO';
      if (isOCRReady() && isImageOrVideo) {
        // Show loading indicator
        showLoadingModal();
        
        try {
          // Extract text using OCR via message passing
          let extractedText;
          if (window.gotClueOCR && window.gotClueOCR.extractText) {
            // Direct access available
            extractedText = await window.gotClueOCR.extractText(selectedElement);
          } else {
            // Use message passing
            extractedText = await extractTextViaMessage(selectedElement);
          }
          
          // Hide loading indicator
          hideLoadingModal();
          
          // Validate extracted text
          if (!extractedText || extractedText.trim().length === 0) {
            throw new Error('No text could be extracted from the image');
          }
          
          // Send extracted text to background script
          safeSendMessage({
            type: 'ELEMENT_SELECTED',
            html: null,
            extractedText: extractedText,
            elementType: selectedElement.tagName.toLowerCase()
          }, (response) => {
            // OCR text extraction processed successfully (no need to log)
          });
        } catch (ocrError) {
          // Hide loading indicator
          hideLoadingModal();
          
          console.error('Got Clue Anot: OCR extraction failed:', ocrError);
          
          // Fall back to HTML processing for images/videos that failed OCR
          const html = selectedElement.outerHTML;
          
          safeSendMessage({
            type: 'ELEMENT_SELECTED',
            html: html,
            extractedText: null,
            elementType: selectedElement.tagName.toLowerCase(),
            error: `OCR failed: ${ocrError.message}`
          }, (response) => {
            // Fallback HTML extraction processed (no need to log)
          });
        }
      } else {
        // Regular HTML element - extract HTML content
        const html = selectedElement.outerHTML;
        
        // Check if this was an image/video that couldn't be processed due to OCR not being ready
        if (isImageOrVideo && !isOCRReady()) {
          console.warn('Got Clue Anot: OCR not ready for image/video element, falling back to HTML extraction');
        }
        
        // Send to background script (with error handling)
        safeSendMessage({
          type: 'ELEMENT_SELECTED',
          html: html,
          extractedText: null,
          elementType: 'html'
        }, (response) => {
          // Element selection processed successfully (no need to log)
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
        // Fallback to HTML processing (no need to log)
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
          // Modal system loaded (no need to log)
        };
        script.onerror = function() {
          console.warn('Got Clue Anot: Failed to load modal system');
        };
        (document.head || document.documentElement).appendChild(script);
      } catch (error) {
        console.warn('Got Clue Anot: Failed to initialize modal:', error.message);
      }
    }
  }
  
  function checkOCRAvailability() {
    // OCR should be pre-loaded by background script into main world
    // Use a different approach to access it
    
    // Try to access OCR from main world using postMessage
    let attempts = 0;
    const maxAttempts = 30; // 3 seconds max
    window.gotClueOCRPolling = true;
    
    const checkOCR = () => {
      // Stop polling if OCR is ready or polling was stopped
      if (window.gotClueOCRReady || !window.gotClueOCRPolling) {
        window.gotClueOCRPolling = false;
        return;
      }
      
      attempts++;
      
      // Try direct access first
      if (window.gotClueOCR) {
        window.gotClueOCRPolling = false;
        return;
      }
      
      // Try accessing via postMessage to main world
      if (attempts === 1) {
        setupMainWorldCommunication();
      }
      
      if (attempts < maxAttempts && window.gotClueOCRPolling) {
        setTimeout(checkOCR, 100);
      } else {
        if (!window.gotClueOCRReady) {
          console.warn('Got Clue Anot: OCR system not accessible after', maxAttempts * 100, 'ms');
        }
        window.gotClueOCRPolling = false;
      }
    };
    
    checkOCR();
  }
  
  function setupMainWorldCommunication() {
    // Set up communication with main world to access OCR
    
    // Listen for messages from main world
    window.addEventListener('message', (event) => {
      if (event.source !== window || !event.data.type) return;
      
             if (event.data.type === 'GOT_CLUE_OCR_READY') {
         window.gotClueOCRReady = true;
         // Stop any ongoing polling
         if (window.gotClueOCRPolling) {
           window.gotClueOCRPolling = false;
         }
       } else if (event.data.type === 'GOT_CLUE_OCR_RESULT') {
        if (window.gotClueOCRCallback) {
          window.gotClueOCRCallback(event.data.result, event.data.error);
        }
      }
    });
    
    // Request OCR status from main world
    window.postMessage({ type: 'GOT_CLUE_CHECK_OCR' }, '*');
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
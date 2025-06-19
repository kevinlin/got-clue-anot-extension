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
  
  function handleClick(event) {
    if (!isActive) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    // Select the element
    clearSelection();
    selectedElement = event.target;
    showSelectionOverlay(selectedElement);
    
    // Extract element content
    const html = selectedElement.outerHTML;
    
    // Stop selection mode
    stopSelection();
    
    // Send to background script (with error handling)
    safeSendMessage({
      type: 'ELEMENT_SELECTED',
      html: html
    }, (response) => {
      if (response && response.success) {
        console.log('Got Clue Anot: Element selection processed successfully');
      }
    });
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
})(); 
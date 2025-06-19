// Content script for Got Clue Anot extension

// Initialize the selection system
(function() {
  'use strict';
  
  // Selection state
  let isActive = false;
  let currentElement = null;
  let selectedElement = null;
  
  // Style constants
  const HOVER_STYLE = 'outline: 2px dashed #8b5cf6 !important; outline-offset: 2px !important;';
  const SELECTED_STYLE = 'outline: 3px solid #8b5cf6 !important; outline-offset: 2px !important;';
  
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
    
    // Restore cursor
    document.body.style.cursor = '';
    
    // Clear hover highlight
    clearHover();
    
    // Notify background script
    chrome.runtime.sendMessage({ type: 'SELECTION_STOPPED' });
  }
  
  function handleMouseOver(event) {
    if (!isActive) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    clearHover();
    currentElement = event.target;
    currentElement.style.cssText += HOVER_STYLE;
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
    selectedElement.style.cssText += SELECTED_STYLE;
    
    // Extract element content
    const html = selectedElement.outerHTML;
    
    // Stop selection mode
    stopSelection();
    
    // Send to background script
    chrome.runtime.sendMessage({
      type: 'ELEMENT_SELECTED',
      html: html
    });
  }
  
  function clearHover() {
    if (currentElement) {
      // Remove hover style
      const currentStyle = currentElement.style.cssText;
      currentElement.style.cssText = currentStyle.replace(/outline:[^;]+!important;/g, '');
      currentElement = null;
    }
  }
  
  function clearSelection() {
    if (selectedElement) {
      // Remove selection style
      const currentStyle = selectedElement.style.cssText;
      selectedElement.style.cssText = currentStyle.replace(/outline:[^;]+!important;/g, '');
      selectedElement = null;
    }
  }
  
  function initializeModal() {
    // Modal system will be initialized by modal.js
    if (!window.gotClueModal) {
      // Load modal system
      const script = document.createElement('script');
      script.src = chrome.runtime.getURL('modal.js');
      script.onload = function() {
        console.log('Modal system loaded');
      };
      (document.head || document.documentElement).appendChild(script);
    }
  }
})(); 
// Modal system for Got Clue Anot extension

(function() {
  'use strict';
  
  let currentModal = null;
  let autoCloseTimer = null;
  
  // Initialize modal system
  window.gotClueModal = {
    showResponse: showResponse,
    showError: showError,
    close: closeModal
  };
  
  function showResponse(response) {
    showModal('Got Clue Anot - Response', response, false);
  }
  
  function showError(error) {
    showModal('Got Clue Anot - Error', error, true);
  }
  
  function showModal(title, content, isError) {
    // Close existing modal
    closeModal();
    
    // Create modal structure
    const modal = createModalElement(title, content, isError);
    document.body.appendChild(modal);
    currentModal = modal;
    
    // Auto-dismiss after 5 seconds if not an error
    if (!isError) {
      autoCloseTimer = setTimeout(() => {
        closeModal();
      }, 5000);
    }
    
    // Animate in
    requestAnimationFrame(() => {
      modal.style.opacity = '1';
      modal.style.transform = 'translate(-50%, -50%) scale(1)';
    });
  }
  
  function createModalElement(title, content, isError) {
    const modal = document.createElement('div');
    modal.className = 'got-clue-modal';
    
    // Apply styles
    const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    modal.style.cssText = `
      position: fixed !important;
      top: 50% !important;
      left: 50% !important;
      transform: translate(-50%, -50%) scale(0.9) !important;
      background: ${isDarkMode ? '#1f2937' : '#ffffff'} !important;
      color: ${isDarkMode ? '#f9fafb' : '#111827'} !important;
      border: 1px solid ${isDarkMode ? '#374151' : '#e5e7eb'} !important;
      border-radius: 8px !important;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
      padding: 24px !important;
      min-width: 320px !important;
      max-width: 500px !important;
      z-index: 999999 !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      font-size: 14px !important;
      line-height: 1.5 !important;
      opacity: 0 !important;
      transition: all 0.2s ease-out !important;
      cursor: default !important;
    `;
    
    // Create header
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex !important;
      justify-content: space-between !important;
      align-items: center !important;
      margin-bottom: 16px !important;
      border-bottom: 1px solid ${isDarkMode ? '#374151' : '#e5e7eb'} !important;
      padding-bottom: 12px !important;
    `;
    
    const titleElement = document.createElement('h3');
    titleElement.textContent = title;
    titleElement.style.cssText = `
      margin: 0 !important;
      font-size: 16px !important;
      font-weight: 600 !important;
      color: ${isError ? '#ef4444' : (isDarkMode ? '#f9fafb' : '#111827')} !important;
    `;
    
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '×';
    closeButton.style.cssText = `
      background: none !important;
      border: none !important;
      font-size: 24px !important;
      cursor: pointer !important;
      color: ${isDarkMode ? '#9ca3af' : '#6b7280'} !important;
      padding: 0 !important;
      width: 24px !important;
      height: 24px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
    `;
    
    closeButton.addEventListener('click', closeModal);
    
    header.appendChild(titleElement);
    header.appendChild(closeButton);
    
    // Create content
    const contentElement = document.createElement('div');
    contentElement.style.cssText = `
      white-space: pre-wrap !important;
      word-wrap: break-word !important;
    `;
    
    // Simple markdown-like formatting
    const formattedContent = formatContent(content);
    contentElement.innerHTML = formattedContent;
    
    modal.appendChild(header);
    modal.appendChild(contentElement);
    
    // Close on escape key
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeModal();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    modal._handleKeyDown = handleKeyDown;
    
    return modal;
  }
  
  function formatContent(content) {
    // Simple markdown-like formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code style="background: rgba(0,0,0,0.1); padding: 2px 4px; border-radius: 3px; font-family: monospace;">$1</code>')
      .replace(/\n/g, '<br>');
  }
  
  function closeModal() {
    if (currentModal) {
      // Remove event listeners
      if (currentModal._handleKeyDown) {
        document.removeEventListener('keydown', currentModal._handleKeyDown);
      }
      
      // Animate out
      currentModal.style.opacity = '0';
      currentModal.style.transform = 'translate(-50%, -50%) scale(0.9)';
      
      setTimeout(() => {
        if (currentModal && currentModal.parentNode) {
          currentModal.parentNode.removeChild(currentModal);
        }
        currentModal = null;
      }, 200);
    }
    
    if (autoCloseTimer) {
      clearTimeout(autoCloseTimer);
      autoCloseTimer = null;
    }
  }
})(); 
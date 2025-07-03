// OCR utility for Got Clue Anot extension
// Uses Tesseract.js for text extraction from images and video frames

(function() {
  'use strict';
  
  // Tesseract.js configuration
  const TESSERACT_CDN = 'https://cdn.jsdelivr.net/npm/tesseract.js@4/dist/tesseract.min.js';
  let tesseractLoaded = false;
  let tesseractWorker = null;
  
  // Initialize Tesseract.js
  async function initializeTesseract() {
    if (tesseractLoaded && tesseractWorker) {
      return tesseractWorker;
    }
    
    try {
      // Load Tesseract.js from CDN
      if (typeof Tesseract === 'undefined') {
        await loadScript(TESSERACT_CDN);
      }
      
      // Create worker
      tesseractWorker = await Tesseract.createWorker('eng');
      tesseractLoaded = true;
      
      console.log('Got Clue Anot: Tesseract.js initialized successfully');
      return tesseractWorker;
    } catch (error) {
      console.error('Got Clue Anot: Failed to initialize Tesseract.js:', error);
      throw new Error('OCR initialization failed: ' + error.message);
    }
  }
  
  // Load external script
  function loadScript(url) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
  
  // Extract text from image element
  async function extractTextFromImage(imageElement) {
    try {
      const worker = await initializeTesseract();
      
      // Create canvas to capture image data
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Set canvas dimensions to match image
      canvas.width = imageElement.naturalWidth || imageElement.width;
      canvas.height = imageElement.naturalHeight || imageElement.height;
      
      // Draw image to canvas
      ctx.drawImage(imageElement, 0, 0);
      
      // Convert canvas to blob
      const blob = await new Promise(resolve => canvas.toBlob(resolve));
      
      // Run OCR
      const { data: { text } } = await worker.recognize(blob);
      
      return text.trim();
    } catch (error) {
      console.error('Got Clue Anot: OCR extraction failed:', error);
      throw new Error('Text extraction failed: ' + error.message);
    }
  }
  
  // Extract text from video element (current frame)
  async function extractTextFromVideo(videoElement) {
    try {
      const worker = await initializeTesseract();
      
      // Create canvas to capture video frame
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Set canvas dimensions to match video
      canvas.width = videoElement.videoWidth || videoElement.width;
      canvas.height = videoElement.videoHeight || videoElement.height;
      
      // Draw current video frame to canvas
      ctx.drawImage(videoElement, 0, 0);
      
      // Convert canvas to blob
      const blob = await new Promise(resolve => canvas.toBlob(resolve));
      
      // Run OCR
      const { data: { text } } = await worker.recognize(blob);
      
      return text.trim();
    } catch (error) {
      console.error('Got Clue Anot: Video OCR extraction failed:', error);
      throw new Error('Video text extraction failed: ' + error.message);
    }
  }
  
  // Check if element is an image
  function isImageElement(element) {
    return element.tagName === 'IMG' || 
           (element.tagName === 'CANVAS') ||
           (element.style && element.style.backgroundImage && element.style.backgroundImage !== 'none');
  }
  
  // Check if element is a video
  function isVideoElement(element) {
    return element.tagName === 'VIDEO';
  }
  
  // Main extraction function
  async function extractText(element) {
    if (isImageElement(element)) {
      return await extractTextFromImage(element);
    } else if (isVideoElement(element)) {
      return await extractTextFromVideo(element);
    } else {
      throw new Error('Element is not an image or video');
    }
  }
  
  // Cleanup function
  function cleanup() {
    if (tesseractWorker) {
      tesseractWorker.terminate();
      tesseractWorker = null;
      tesseractLoaded = false;
    }
  }
  
  // Export functions
  window.gotClueOCR = {
    extractText,
    isImageElement,
    isVideoElement,
    cleanup
  };
  
  // Cleanup on page unload
  window.addEventListener('beforeunload', cleanup);
  
})(); 
// OCR utility for Got Clue Anot extension
// Uses Tesseract.js for text extraction from images and video frames

(function () {
  'use strict';

  // Tesseract.js configuration - using a stable version
  const TESSERACT_CDN = 'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js';
  let tesseractLoaded = false;
  let tesseractWorker = null;
  let isInitializing = false;

  // Initialize Tesseract.js with better error handling
  async function initializeTesseract() {
    if (tesseractLoaded && tesseractWorker) {
      return tesseractWorker;
    }

    if (isInitializing) {
      // Wait for existing initialization to complete
      let retries = 0;
      while (isInitializing && retries < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        retries++;
      }
      if (tesseractWorker) {
        return tesseractWorker;
      }
    }

    isInitializing = true;

    try {
      // Load Tesseract.js from CDN if not already loaded
      if (typeof Tesseract === 'undefined') {
        await loadScript(TESSERACT_CDN);
        
        // Wait a bit for the script to fully initialize
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Verify Tesseract is available
      if (typeof Tesseract === 'undefined') {
        throw new Error('Tesseract.js failed to load');
      }

      // Create worker with explicit configuration
      tesseractWorker = await Tesseract.createWorker('eng', 1, {
        logger: (m) => {
          // Only log progress for longer operations
          if (m.status === 'recognizing text' && m.progress > 0.1) {
            console.log(`Got Clue Anot: OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        },
        errorHandler: (err) => {
          console.error('Got Clue Anot: Tesseract worker error:', err);
        }
      });

      // Verify worker was created successfully
      if (!tesseractWorker) {
        throw new Error('Failed to create Tesseract worker - worker is null');
      }

      tesseractLoaded = true;
      return tesseractWorker;
    } catch (error) {
      console.error('Got Clue Anot: Failed to initialize Tesseract.js:', error);
      tesseractWorker = null;
      tesseractLoaded = false;
      throw new Error('OCR initialization failed: ' + error.message);
    } finally {
      isInitializing = false;
    }
  }

  // Load external script with better error handling
  function loadScript(url) {
    return new Promise((resolve, reject) => {
      // Check if script is already loaded
      const existingScript = document.querySelector(`script[src="${url}"]`);
      if (existingScript) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = url;
      script.async = true;
      script.crossOrigin = 'anonymous';
      
      script.onload = () => {
        resolve();
      };
      
      script.onerror = (error) => {
        console.error('Got Clue Anot: Script failed to load:', url, error);
        reject(new Error(`Failed to load script: ${url}`));
      };
      
      document.head.appendChild(script);
    });
  }

  // Extract text from image element with improved error handling
  async function extractTextFromImage(imageElement) {
    let worker = null;
    
    try {
      worker = await initializeTesseract();
      
      if (!worker) {
        throw new Error('OCR worker not available');
      }
      
      // Try different approaches based on image type and source
      let imageSource = null;
      
      // Method 1: Try using the image element directly
      if (imageElement.complete && imageElement.naturalWidth > 0) {
        try {
          const result = await worker.recognize(imageElement);
          return result.data.text.trim();
        } catch (directError) {
          // Continue to next method
        }
      }

      // Method 2: Convert to canvas and extract as blob
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // Set canvas dimensions
      const width = imageElement.naturalWidth || imageElement.width || 300;
      const height = imageElement.naturalHeight || imageElement.height || 200;
      canvas.width = width;
      canvas.height = height;

      // Handle potential CORS issues
      try {
        ctx.drawImage(imageElement, 0, 0, width, height);
        
        // Convert canvas to blob
        const blob = await new Promise((resolve, reject) => {
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create blob from canvas'));
            }
          }, 'image/png');
        });

        const result = await worker.recognize(blob);
        return result.data.text.trim();
        
      } catch (canvasError) {
        // Method 3: Try with image URL if available
        if (imageElement.src && !imageElement.src.startsWith('data:')) {
          const result = await worker.recognize(imageElement.src);
          return result.data.text.trim();
        }
        
        throw canvasError;
      }

    } catch (error) {
      console.error('Got Clue Anot: OCR extraction failed:', error);
      throw new Error('Text extraction failed: ' + error.message);
    }
  }

  // Extract text from video element (current frame)
  async function extractTextFromVideo(videoElement) {
    let worker = null;
    
    try {
      worker = await initializeTesseract();
      
      if (!worker) {
        throw new Error('OCR worker not available');
      }
      
      // Create canvas to capture video frame
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // Set canvas dimensions to match video
      canvas.width = videoElement.videoWidth || videoElement.width || 640;
      canvas.height = videoElement.videoHeight || videoElement.height || 480;

      // Draw current video frame to canvas
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

      // Convert canvas to blob
      const blob = await new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob from video frame'));
          }
        }, 'image/png');
      });

      // Run OCR
      const result = await worker.recognize(blob);
      return result.data.text.trim();

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
    if (!element) {
      throw new Error('No element provided for OCR');
    }

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
      try {
        tesseractWorker.terminate();
      } catch (error) {
        console.warn('Got Clue Anot: Error terminating worker:', error);
      }
      tesseractWorker = null;
      tesseractLoaded = false;
    }
  }

  // Set up communication with content script
  function setupContentScriptCommunication() {
    // Listen for messages from content script
    window.addEventListener('message', async (event) => {
      if (event.source !== window || !event.data.type) return;

      if (event.data.type === 'GOT_CLUE_CHECK_OCR') {
        // Respond with OCR ready status
        window.postMessage({
          type: 'GOT_CLUE_OCR_READY',
          ready: window.gotClueOCR?.ready || false
        }, '*');
      } else if (event.data.type === 'GOT_CLUE_OCR_EXTRACT') {
        try {
          const element = document.querySelector(event.data.selector);
          if (element) {
            const result = await extractText(element);
            window.postMessage({
              type: 'GOT_CLUE_OCR_RESULT',
              result: result,
              error: null
            }, '*');
          } else {
            window.postMessage({
              type: 'GOT_CLUE_OCR_RESULT',
              result: null,
              error: 'Element not found'
            }, '*');
          }
        } catch (error) {
          console.error('Got Clue Anot: OCR extraction error:', error);
          window.postMessage({
            type: 'GOT_CLUE_OCR_RESULT',
            result: null,
            error: error.message
          }, '*');
        }
      }
    });

    // Announce OCR availability
    window.postMessage({
      type: 'GOT_CLUE_OCR_READY',
      ready: true
    }, '*');
  }

  // Export functions and initialize
  try {
    window.gotClueOCR = {
      extractText,
      isImageElement,
      isVideoElement,
      cleanup,
      ready: true
    };

    // Set up communication with content script
    setupContentScriptCommunication();

    // Cleanup on page unload
    window.addEventListener('beforeunload', cleanup);
  } catch (error) {
    console.error('Got Clue Anot: Failed to create OCR object:', error);
  }

})();
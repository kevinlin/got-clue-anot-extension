# Got Clue Anot? - Chrome Extension

A Chrome extension that helps users answer multiple-choice questions from online exams/quizzes by selecting a section of the page and querying OpenAI's LLM for hints/answers.

## Features

- **Manual Element Selection**: Click the toolbar button to activate selection mode, then click any element on the page
- **OCR Text Extraction**: Automatically extracts text from images and videos using Tesseract.js OCR engine
- **Smart Content Detection**: Automatically detects image, video, and HTML elements and processes them appropriately
- **Video Frame Capture**: Captures the current frame from videos for text extraction
- **Keyboard Shortcuts**: Use keyboard shortcuts to quickly trigger content capture (default: `Alt+Shift+Q`)
- **Visual Feedback**: Hovered elements show a dashed purple border, selected elements show a solid purple border
- **AI-Powered Answers**: Uses OpenAI's API to analyze questions and provide answers in the format "Answer: X" with explanations
- **Configurable Settings**: Set your API key, choose OpenAI model, and customize prompts
- **Auto-Dismissing Modal**: Responses appear in a modal that auto-closes after 10 seconds
- **Dark Mode Support**: Automatically adapts to your system's dark/light mode preference

## Installation

### From Source (Developer Mode)

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extension directory
5. The extension icon (bulb) should appear in your toolbar

### Icons Note
The extension includes bulb icons in multiple sizes (16x16, 32x32, 48x48, 128x128 pixels) for different display contexts.

## Setup

1. **Get an OpenAI API Key**:
   - Visit [OpenAI Platform](https://platform.openai.com/api-keys)
   - Create a new API key
   - Copy the key (starts with `sk-`)

2. **Configure the Extension**:
   - The options page will open automatically on first install
   - Or right-click the extension icon and select "Options"
   - Or go to `chrome://extensions/`, find "Got Clue Anot?", and click "Options"
   - Enter your OpenAI API key
   - Select your preferred model (GPT-4o recommended)
   - Customize the user prompt if desired
   - Click "Save Settings"

## Usage

1. **Navigate to a Quiz/Exam Page**: Open any webpage with multiple-choice questions

2. **Activate Selection Mode** (choose one method):
   - **Method 1**: Click the bulb icon in the toolbar
   - **Method 2**: Use the keyboard shortcut (default: `Alt+Shift+Q`)

3. **Select an Element**: 
   - Hover over elements to see them highlighted with a dashed border
   - Click on the question or section you want to analyze
   - The selected element will show a solid purple border briefly
   - **For images/videos**: A loading indicator will appear while OCR extracts text
   - **For regular HTML**: Content is processed immediately

4. **View the Answer**: A modal will appear with the AI's response after processing

5. **Continue**: The selection mode automatically deactivates after each selection

### Keyboard Shortcuts

- **Default Shortcut**: `Alt+Shift+Q` (Option+Shift+Q on Mac)
- **Customization**: Visit `chrome://extensions/shortcuts` in Chrome to customize the keyboard shortcut
- **Note**: The shortcut is managed by Chrome's built-in commands system for reliability

## Supported Content Types

The extension can analyze different types of content:

### HTML Elements
- Regular text content (paragraphs, divs, spans, etc.)
- Lists and tables
- Form elements with questions
- Any HTML element containing text

### Images
- **IMG tags**: Standard image elements with embedded text
- **Canvas elements**: Graphics with rendered text content
- **Background images**: Elements with CSS background images containing text
- **Supported formats**: Any image format supported by the browser

### Videos
- **Video elements**: HTML5 video tags
- **Frame capture**: Automatically captures the current video frame
- **Text extraction**: Extracts text from the captured frame using OCR
- **Supported formats**: Any video format supported by the browser

### OCR Processing
- **Engine**: Uses Tesseract.js for optical character recognition
- **Languages**: Currently supports English text recognition
- **Processing time**: 5-10 seconds depending on image complexity
- **Fallback**: If OCR fails, falls back to HTML content processing
- **Quality**: Works best with clear, high-contrast text

## Privacy & Security

- Your API key is stored locally in your browser using `chrome.storage.local`
- No data is sent to external servers except OpenAI's API
- No analytics, logging, or telemetry
- All communication goes directly from your browser to OpenAI
- Extension context validation prevents data leaks after extension updates

## Troubleshooting

### Extension Not Working
- Ensure you have a valid OpenAI API key configured
- Check that your API key starts with `sk-`
- Verify you have sufficient OpenAI credits
- Try refreshing the page and activating selection mode again
- Check the browser console for any error messages

### OCR Issues
- OCR processing may take 5-10 seconds for complex images
- Ensure images have clear, readable text for best results
- For videos, make sure the video is loaded and displaying content
- If OCR fails, the extension will fallback to processing the HTML element
- Check browser console for OCR-specific error messages

### Modal Not Appearing
- Check browser console for errors
- Ensure the page allows content injection
- Try on a different website
- Refresh the page and try again

### API Errors
- Verify your API key is correct and active
- Check your OpenAI account has available credits
- Ensure the selected model is accessible with your API key
- Check the browser console for specific error messages

### Selection Mode Issues
- Make sure you click the bulb icon or use the keyboard shortcut to activate selection mode
- The cursor should change to a crosshair when selection mode is active
- Try clicking the icon again or pressing the keyboard shortcut to toggle selection mode
- Check that the page allows script injection

### Keyboard Shortcut Issues
- Try using the default shortcut (`Alt+Shift+Q`)
- Visit `chrome://extensions/shortcuts` to verify and customize the extension's keyboard shortcuts
- Ensure your custom shortcut doesn't conflict with browser or system shortcuts
- Restart your browser after changing keyboard shortcuts

## Development

### File Structure
```
got-clue-anot-extension/
├── manifest.json          # Extension manifest (v3)
├── background.js          # Service worker for API calls and coordination
├── content.js             # DOM interaction and element selection
├── modal.js               # Modal display system
├── options.html           # Settings page
├── options.js             # Settings page logic
├── test-ocr.html          # Test page for OCR functionality
├── icons/                 # Extension icons
│   ├── bulb-16.png        # 16x16 toolbar icon
│   ├── bulb-32.png        # 32x32 icon
│   ├── bulb-48.png        # 48x48 icon
│   └── bulb-128.png       # 128x128 icon
└── utils/
    ├── markdown.js        # HTML to markdown conversion utilities
    └── ocr.js             # OCR text extraction using Tesseract.js
```

### Key Components

- **Manifest v3**: Uses service workers and modern Chrome extension APIs
- **Content Script**: 
  - Handles element selection with visual feedback overlays
  - Provides crosshair cursor during selection mode
  - Robust event handling with context validation
  - Smart detection of image, video, and HTML elements
  - Loading indicators for OCR processing
- **Background Script**: 
  - Manages OpenAI API calls with proper error handling
  - Handles configuration management
  - Chrome commands API integration for keyboard shortcuts
  - Coordinates between content script and options
  - Processes both OCR-extracted text and HTML content
- **Modal System**: 
  - Non-blocking overlay for displaying responses
  - Auto-dismiss functionality (10 seconds)
  - Dark/light mode support
  - Markdown formatting for better readability
- **Options Page**: 
  - Clean, modern UI with dark mode support
  - Form validation and user feedback
  - Keyboard shortcut information with direct Chrome link
  - Welcome message for new users

### Technical Features

- **OCR Text Extraction**: Tesseract.js integration for extracting text from images and videos
- **Smart Content Processing**: Automatically detects element types and applies appropriate processing
- **Video Frame Capture**: Canvas-based frame capture from video elements for OCR analysis
- **HTML to Text Conversion**: Simplified conversion that extracts clean text from selected HTML
- **System Prompt**: Built-in prompt engineering for consistent answer formatting
- **User Prompt Integration**: Optional custom prompts that integrate with system instructions
- **Keyboard Shortcut System**: Chrome Commands API integration for reliable shortcut handling
- **Extension Context Validation**: Prevents errors during extension updates/reloads
- **Graceful Error Handling**: User-friendly error messages and recovery
- **Auto-Configuration Flow**: Guides users through setup process

### Testing

The extension includes a test page (`test-ocr.html`) for verifying OCR functionality:

- **Canvas elements**: With programmatically drawn text for OCR testing
- **Sample quiz questions**: Rendered as images to test real-world scenarios
- **Video elements**: For testing video frame capture
- **Regular HTML content**: For comparison with standard processing
- **Instructions**: Step-by-step guide for testing different content types

### API Integration

- Uses OpenAI Chat Completions API
- Configurable model selection
- Temperature set to 0.7 for balanced creativity
- Max tokens limited to 1000 for cost efficiency
- Proper error handling for API failures

## License

This project is licensed under the MIT License - see the LICENSE file for details.
It also bundles [Tesseract.js](https://github.com/naptha/tesseract.js) which is
licensed under the Apache 2.0 License (see `libs/TESSERACT_LICENSE.md`).

## Disclaimer
This extension is for educational purposes. Please ensure you comply with your institution's academic integrity policies when using this tool. 
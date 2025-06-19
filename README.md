# Got Clue Anot? - Chrome Extension

A Chrome extension that helps users answer multiple-choice questions from online exams/quizzes by selecting a section of the page and querying OpenAI's LLM for hints/answers.

## Features

- **Manual Element Selection**: Click the toolbar button to activate selection mode, then click any element on the page
- **Visual Feedback**: Selected elements are highlighted with a purple border
- **AI-Powered Answers**: Uses OpenAI's API to analyze questions and provide answers in the format "Answer: X" with explanations
- **Configurable Settings**: Set your API key, choose OpenAI model, and customize prompts
- **Auto-Dismissing Modal**: Responses appear in a modal that auto-closes after 5 seconds
- **Dark Mode Support**: Automatically adapts to your system's dark/light mode preference

## Installation

### From Source (Developer Mode)

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extension directory
5. The extension icon (bulb) should appear in your toolbar

### Icons Note
The extension includes placeholder icon files. For a better experience, replace the PNG files in the `icons/` directory with actual bulb icons of the appropriate sizes (16x16, 32x32, 48x48, 128x128 pixels).

## Setup

1. **Get an OpenAI API Key**:
   - Visit [OpenAI Platform](https://platform.openai.com/api-keys)
   - Create a new API key
   - Copy the key (starts with `sk-`)

2. **Configure the Extension**:
   - Right-click the extension icon and select "Options"
   - Or go to `chrome://extensions/`, find "Got Clue Anot?", and click "Options"
   - Enter your OpenAI API key
   - Select your preferred model (GPT-4o recommended)
   - Customize the user prompt if desired
   - Click "Save Settings"

## Usage

1. **Navigate to a Quiz/Exam Page**: Open any webpage with multiple-choice questions
2. **Activate Selection Mode**: Click the bulb icon in the toolbar (it will change color)
3. **Select an Element**: Click on the question or section you want to analyze
4. **View the Answer**: A modal will appear with the AI's response
5. **Continue**: The selection mode automatically deactivates after each selection

## Supported Models

- GPT-4o (recommended)
- GPT-4.1
- GPT-4.1 Mini
- O3 Pro
- O3
- O4 Mini

## Privacy & Security

- Your API key is stored locally in your browser
- No data is sent to external servers except OpenAI's API
- No analytics, logging, or telemetry
- All communication goes directly from your browser to OpenAI

## Troubleshooting

### Extension Not Working
- Ensure you have a valid OpenAI API key configured
- Check that your API key starts with `sk-`
- Verify you have sufficient OpenAI credits
- Try refreshing the page and activating selection mode again

### Modal Not Appearing
- Check browser console for errors
- Ensure the page allows content injection
- Try on a different website

### API Errors
- Verify your API key is correct and active
- Check your OpenAI account has available credits
- Ensure the selected model is accessible with your API key

## Development

### File Structure
```
got-clue-anot-extension/
├── manifest.json          # Extension manifest
├── background.js          # Service worker for API calls
├── content.js             # DOM interaction and selection
├── modal.js               # Modal display system
├── options.html           # Settings page
├── options.js             # Settings page logic
├── icons/                 # Extension icons
│   ├── bulb-16.png
│   ├── bulb-32.png
│   ├── bulb-48.png
│   ├── bulb-128.png
│   ├── bulb-active-16.png
│   ├── bulb-active-32.png
│   ├── bulb-active-48.png
│   └── bulb-active-128.png
└── utils/
    └── markdown.js        # HTML to markdown conversion
```

### Key Components

- **Manifest v3**: Uses service workers and modern Chrome extension APIs
- **Content Script**: Handles element selection with visual feedback
- **Background Script**: Manages OpenAI API calls and configuration
- **Modal System**: Non-blocking overlay for displaying responses
- **Options Page**: User-friendly configuration interface

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Disclaimer

This extension is for educational purposes. Please ensure you comply with your institution's academic integrity policies when using this tool. 
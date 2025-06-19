# Chrome Web Store submission guide

This guide walks you through submitting the Got Clue Anot extension to the Chrome Web Store.

## Step 1: Prepare your extension package

### Ensure required files are included

- `manifest.json`
- All referenced JS/HTML/CSS files
- Icon files from `icons/` directory (especially `bulb-128.png` for Web Store listing)
- Optional: `README.md`, `LICENSE`

### Confirm manifest version

Use **Manifest V3** (`"manifest_version": 3`) — required by Chrome Web Store.

### Test locally

1. Go to `chrome://extensions`
2. Enable **Developer Mode**
3. Click **"Load unpacked"** and select your extension folder
4. Verify the following functionality:

   - Toolbar icon appears
   - Config UI works
   - Selection and LLM interaction work
   - No errors in DevTools console

### Create extension package

From the extension root folder, select all contents (not the folder itself) and create a zip file:

- **GUI method**: Right-click > **Compress**
- **Terminal method**:

  ```bash
  zip -r got-clue-anot.zip . -x "*.DS_Store" -x ".history/*" -x ".git/*"
  ```

## Step 2: Set up developer account

1. Visit the [Chrome Web Store](https://chromewebstore.google.com/)
2. Click **"Publish in Chrome Web Store"**
3. Sign in with your Google account
4. Pay the **one-time $5 developer registration fee**
5. Accept the developer agreement

## Step 3: Upload and submit

1. Go to the [Chrome Web Store Developer Dashboard](https://chromewebstore.google.com/u/0/developer/dashboard)
2. Click **"Add New Item"**
3. Upload your `.zip` file
4. Fill in required metadata:

   - **Extension Name**: `Got Clue Anot?`
   - **Short Description**: "Quickly get hints for MCQ-style quizzes using OpenAI."
   - **Detailed Description**: Include functionality, privacy statement, and usage examples
   - **Category**: Productivity or Developer Tools
   - **Language**: English

5. Add **screenshots** (minimum 1280x800 or 640x400):

   Use the provided screenshots in the `submission/` folder:
   - `Screenshot-01.png` - Shows the quiz interface with extension functionality
   - `Screenshot-02.png` - Shows the extension's response modal with answer and explanation

6. Add **promotional tile icons**:

   Use the provided icons from the project:
   - **128x128 icon (required)**: Use `icons/bulb-128.png`
   - **440x280 tile (recommended)**: Use `submission/promotional-tile_440x280.png`

## Step 4: Set permissions

In the listing form, explain why these permissions are used:

| Permission  | Reason                                               |
| ----------- | ---------------------------------------------------- |
| `activeTab` | Needed to read selected content on the current page |
| `scripting` | Inject content and modal dynamically                |
| `storage`   | Save API key and prompt config locally              |

## Step 5: Privacy and distribution

### Privacy policy

If you're not collecting data, write a simple privacy statement or include this in your description:

> This extension does not collect or transmit any personal data.

### Distribution settings

Choose your distribution method:

- **Public** (default) - Available to all Chrome Web Store users
- **Private/unlisted** - For internal testing only

## Step 6: Publish

1. Click **Submit for Review**
2. Chrome Web Store team will review your submission (can take several days)
3. You'll be notified via email once approved or if changes are needed

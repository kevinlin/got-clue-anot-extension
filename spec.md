## ✅ Project Overview

**Name:** Got Clue Anot?
**Type:** Chrome Extension
**Purpose:** Help users answer MCQ-type questions from online exams/quizzes by selecting a section of the page and querying OpenAI’s LLM for hints/answers.

---

## 🧩 Key Features

1. **Manual Activation via Toolbar Button**

   * Button uses a **bulb icon**.
   * Color changes to indicate active selection mode.

2. **Element Selection Flow**

   * After clicking the toolbar button, the user selects a **single DOM element**.
   * The selected element is highlighted with a **persistent purple border**, similar to Stagewise behavior.
   * Selection is **one-time**: user must click the toolbar icon again to reinitiate selection.

3. **Content Extraction**

   * Extracts **visible text** and **HTML structure** of the selected element.
   * Uses **Turndown.js** or equivalent to convert to **markdown**.
   * Appends markdown text to the **user-defined prompt**.

4. **LLM Interaction**

   * Sends the final prompt (system prompt + user prompt + markdown content) to **OpenAI API**.
   * Uses the **user’s API key and selected model** (from config).
   * Supported models (via dropdown):

     * `gpt-4.1`
     * `gpt-4.1-mini`
     * `gpt-4o`
     * `o3-pro`
     * `o3`
     * `o4-mini`

5. **User Configurable Settings**
   Accessible via extension options page. Stored in `chrome.storage.local`:

   * OpenAI API Key (plain text)
   * OpenAI Model (dropdown)
   * Custom User Prompt (plain text)

6. **Response Display**

   * Opens a **modal dialog** once the OpenAI response is ready.
   * Format:

     * First line: `Answer: A`
     * Followed by short explanation (as returned by LLM)
   * Rendered using **markdown support**
   * Auto-dismisses after **5 seconds**
   * Can be dismissed manually
   * **No backdrop** — page remains interactive
   * Modal title: `Got Clue Anot - Response`

7. **Error Handling**

   * If the OpenAI call fails, show a modal with a clear error message.
   * Plugin allows overlapping requests.
   * No validation on save for the API key.

---

## ⚙️ Architecture / Components

### 1. **Manifest (v3)**

* Permissions:

  * `activeTab`
  * `storage`
  * `scripting`
* Background script: handles OpenAI requests and config storage
* Content script: injected for DOM interaction and element selection

### 2. **Toolbar Button**

* `action.default_icon`: bulb icon (two states: inactive and active)
* `action.default_popup`: none
* `action.onClicked`: triggers content script to start selection

### 3. **Content Script**

* Attaches mouse event listeners for DOM selection
* Highlights hovered elements with border
* On click, finalizes selection and sends element HTML to background

### 4. **Background Script**

* Receives selected content
* Converts to markdown
* Constructs final prompt: system prompt + user prompt + markdown
* Calls OpenAI API
* Sends back result or error

### 5. **Options Page**

* HTML form with:

  * API Key (password field)
  * Model dropdown
  * User Prompt textarea
* Saved using `chrome.storage.local`

### 6. **Modal Display**

* Injected into DOM as floating overlay (non-blocking)
* Styled for light and **dark mode**
* Auto-closes after 5 seconds

---

## 🔒 Data Handling

* **API Key** is stored locally using `chrome.storage.local`.
* No external servers or proxies.
* No analytics, logging, or telemetry.
* All communication to OpenAI goes directly from user’s browser.

---

## 🚫 Scope (v1 Limitations)

* No keyboard shortcuts
* No support for multi-element selection
* No localization
* No accessibility features
* No usage history or log
* No prompt placeholders
* No LLM response parsing — depends fully on LLM formatting
* No validation or rate-limiting on API key usage

---

## ✅ Ready for Implementation

This spec supports direct implementation in a modular and maintainable way. A suggested folder structure might be:

```
got-clue-anot-extension/
├── manifest.json
├── icons/
│   └── bulb.png
├── background.js
├── content.js
├── modal.js
├── options.html
├── options.js
├── utils/
│   └── markdown.js (Turndown wrapper)
```
// Options page script for Got Clue Anot extension

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('optionsForm');
    const resetButton = document.getElementById('resetButton');
    const status = document.getElementById('status');
    const welcomeMessage = document.getElementById('welcomeMessage');
    
    // Load saved options
    loadOptions();
    
    // Save options on form submit
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        saveOptions();
    });
    
    // Reset to defaults
    resetButton.addEventListener('click', function() {
        resetToDefaults();
    });
    
    async function loadOptions() {
        try {
            const result = await chrome.storage.local.get(['apiKey', 'model', 'userPrompt', 'keyboardShortcut']);
            
            document.getElementById('apiKey').value = result.apiKey || '';
            document.getElementById('model').value = result.model || 'gpt-4o';
            document.getElementById('userPrompt').value = result.userPrompt || '';
            document.getElementById('keyboardShortcut').value = result.keyboardShortcut || 'Ctrl+Shift+Q';
            
            // Show welcome message if no API key is configured
            if (!result.apiKey) {
                welcomeMessage.style.display = 'block';
            }
        } catch (error) {
            console.error('Error loading options:', error);
            showStatus('Error loading settings', 'error');
        }
    }
    
    async function saveOptions() {
        try {
            const apiKey = document.getElementById('apiKey').value.trim();
            const model = document.getElementById('model').value;
            const userPrompt = document.getElementById('userPrompt').value.trim();
            const keyboardShortcut = document.getElementById('keyboardShortcut').value;
            
            // Basic validation
            if (!apiKey) {
                showStatus('Please enter an OpenAI API key', 'error');
                return;
            }
            
            if (!apiKey.startsWith('sk-')) {
                showStatus('API key should start with "sk-"', 'error');
                return;
            }
            
            // Save to storage
            await chrome.storage.local.set({
                apiKey: apiKey,
                model: model,
                userPrompt: userPrompt,
                keyboardShortcut: keyboardShortcut
            });
            
            // Try to update the keyboard shortcut
            await updateKeyboardShortcut(keyboardShortcut);
            
            showStatus('Settings saved successfully! You may need to restart your browser for keyboard shortcut changes to take effect.', 'success');
            
            // Hide welcome message after successful save
            welcomeMessage.style.display = 'none';
        } catch (error) {
            console.error('Error saving options:', error);
            showStatus('Error saving settings', 'error');
        }
    }
    
    function resetToDefaults() {
        document.getElementById('apiKey').value = '';
        document.getElementById('model').value = 'gpt-4o';
        document.getElementById('userPrompt').value = '';
        document.getElementById('keyboardShortcut').value = 'Ctrl+Shift+Q';
        
        showStatus('Reset to default values. Click "Save Settings" to apply.', 'success');
    }
    
    // Function to update keyboard shortcut (note: Chrome extensions have limitations here)
    async function updateKeyboardShortcut(shortcut) {
        try {
            // Note: Chrome extensions cannot programmatically update keyboard shortcuts
            // The user would need to manually update them in chrome://extensions/shortcuts
            // We'll store the preference and show a helpful message
            console.log('Keyboard shortcut preference saved:', shortcut);
        } catch (error) {
            console.error('Error updating keyboard shortcut:', error);
        }
    }
    
    function showStatus(message, type) {
        status.textContent = message;
        status.className = `status ${type}`;
        status.style.display = 'block';
        
        // Auto-hide after 3 seconds for success messages
        if (type === 'success') {
            setTimeout(() => {
                status.style.display = 'none';
            }, 3000);
        }
    }
}); 
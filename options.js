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
            const result = await chrome.storage.local.get(['apiKey', 'model', 'userPrompt']);
            
            document.getElementById('apiKey').value = result.apiKey || '';
            document.getElementById('model').value = result.model || 'gpt-4o';
            document.getElementById('userPrompt').value = result.userPrompt || 'Please help me answer this question:';
            
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
            
            // Basic validation
            if (!apiKey) {
                showStatus('Please enter an OpenAI API key', 'error');
                return;
            }
            
            if (!apiKey.startsWith('sk-')) {
                showStatus('API key should start with "sk-"', 'error');
                return;
            }
            
            if (!userPrompt) {
                showStatus('Please enter a user prompt', 'error');
                return;
            }
            
            // Save to storage
            await chrome.storage.local.set({
                apiKey: apiKey,
                model: model,
                userPrompt: userPrompt
            });
            
            showStatus('Settings saved successfully!', 'success');
            
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
        document.getElementById('userPrompt').value = 'Please help me answer this question:';
        
        showStatus('Reset to default values. Click "Save Settings" to apply.', 'success');
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
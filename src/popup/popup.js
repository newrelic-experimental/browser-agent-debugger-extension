document.addEventListener('DOMContentLoaded', function() {
    const button = document.getElementById('inject-button');
    if (!button){ return }
    button.addEventListener('click', function() {
        // Handle button click
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { message: 'Hello from popup!' });
          });
    });
});
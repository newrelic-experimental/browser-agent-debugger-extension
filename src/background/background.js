// This file contains the background script for the Chrome extension. It handles events such as browser actions and manages the extension's lifecycle.

let devPanel

chrome.runtime.onInstalled.addListener(() => {
    console.log('NRBA Injector Extension installed');
});

chrome.runtime.onConnect.addListener(function(devToolsConnection) {
    devPanel = devToolsConnection
})

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    switch(request.message){
        case 'newrelic_event':
            if (!!devPanel){
                const uniqueId = generateUniqueId(request)
                request.uniqueId = uniqueId
                devPanel.postMessage(request)
            }
            break;
        case 'content_ready':
            if (!!devPanel) devPanel.postMessage(request)
            break;
        case 'devtools_ready':
        case 'clear_data':
            chrome.tabs.query({active: true, lastFocusedWindow: true}, function(tabs){
                if (tabs.length) chrome.tabs.sendMessage(tabs[0].id, {message: request.message});
            });
            break;
    }
    sendResponse({ message: 'got your message in background.js!' });
});

function generateUniqueId(obj) {
    try{
        const jsonString = JSON.stringify(obj);
        let hash = 0;
        for (let i = 0; i < jsonString.length; i++) {
        hash = (hash << 5) - hash + jsonString.charCodeAt(i);
        hash |= 0; // Convert to 32bit integer
        }
        return hash.toString(36); // Convert to base36 string
    } catch(err){
        return Math.random().toString()
    }
  }

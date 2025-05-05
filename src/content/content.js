// This file is what is running in the document of the active page.  To talk to popup, it must communicate through background.js with the sendMessage API
class NREvent {
    constructor({timeStamp, agentIdentifier, loaded, type, name, feature, data}){
        this.timeStamp = timeStamp
        this.detail = {
            agentIdentifier,
            loaded,
            type,
            name,
            feature,
            data
        }
    }
}

let events = [
    new NREvent({timeStamp: 0, loaded: false, type: 'window', name: 'origin', data: window.location + ''})
]
let eventLimit = 1000


window.addEventListener('load', (evt) => {
    const event = new NREvent({
        timeStamp: evt.timeStamp,
        loaded: true,
        type: 'window',
        name: 'window-load',
        data: window.location + ''
    })
    if (events.length > eventLimit){
        events.shift()
    }
    events.push(event)
    reportEvent(event)

    const sessionEvent = new NREvent({
        timeStamp: evt.timeStamp,
        loaded: true,
        type: 'session',
        name: 'session',
        data: window.location + ''
    })
})

document.addEventListener('DOMContentLoaded', (evt) => {
    const event = new NREvent({
        timeStamp: evt.timeStamp,
        loaded: false,
        type: 'window',
        name: 'dom-content-loaded',
        data: window.location + ''
    })
    if (events.length > eventLimit){
        events.shift()
    }
    events.push(event)
    reportEvent(event)
})

window.addEventListener('popstate', function(evt) {
    const event = new NREvent({
        timeStamp: evt.timeStamp,
        loaded: evt.target.document.readyState === 'complete',
        type: 'window',
        name: 'navigate',
        data: evt.target.location + ''
    })
    if (events.length > eventLimit){
        events.shift()
    }
    events.push(event)
    reportEvent(event)
  });
  
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch(request.message){
        case 'devtools_ready':
            events.forEach(evt => {
                reportEvent(evt)
            })
            break;
        case 'clear_data':
            events = []
            break;
        case 'limit':
            eventLimit = request.limit
            break;

    }
    sendResponse({ message: 'got your message in content.js!' });
})

chrome.runtime.sendMessage({ message: 'content_ready' })
.catch(err => {
    // do nothing
})

window.addEventListener('newrelic', (event) => {
    if (events.length > eventLimit){
        events.shift()
    }
    events.push(event)
    reportEvent(event)
})

function reportEvent(event){
    chrome.runtime.sendMessage({ message: 'newrelic_event', timeStamp: event.timeStamp.toFixed(1), event: event.detail })
    .catch(err => {
        // do nothing
    })
}
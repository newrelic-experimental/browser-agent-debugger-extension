let data = new Set()
let uniqueIds = new Set()

const filters = {
    undefined: true,
    initialize: true,
    load: true,
    buffer: true,
    harvest: true,
    api: true,
    drain: true,
    ['long-task']: true,
    window: true,
    origin: true,
    ['window-load']: true,
    ['dom-content-loaded']: true,
    navigate: true,
    lifecycle: true,
    data: true,
    ajax: true,
    generic_events: true,
    jserrors: true,
    logging: true,
    metrics: true,
    page_view_event: true,
    page_view_timing: true,
    session_replay: true,
    session_trace: true,
    soft_navigations: true,
    spa: true,
    shared_aggregator: true,
    session: true
}

let autoScroll = false
let captureData = true
let textSearch = ''

chrome.devtools.panels.create(
    "NR Browser Agent DevTools",
    "assets/icon_32.png", // Path to an icon (optional)
    "src/devtools/devtools.html", // Path to the HTML file for the panel content
    function(panel) {
      console.log("NRBA Injector panel created", panel);
      panel.onShown.addListener(function(window) {
        console.log("panel shown", window);
        chrome.runtime.sendMessage({ message: 'devtools_ready' }, (response) => {
            console.log('Response from background.js:', response);
        })
      });
    }
  );

var backgroundPageConnection = chrome.runtime.connect({
    name: "devtools-page"
});

backgroundPageConnection.onMessage.addListener(function (message) {
    if (message.message === 'content_ready'){
        chrome.runtime.sendMessage({ message: 'devtools_ready' })
        return
    }
    if (!captureData || !message.event || uniqueIds.has(message.uniqueId)) return
    uniqueIds.add(message.uniqueId)
    data.add(message)
    document.querySelector('#event-count').innerText = data.size
    appendMessage(message)
});

/**
 * this re-renders the full list.  Should only be done ad-hoc for toolbar changes
 */
function reRenderData(){
    document.querySelector('#content>table>#table-body').innerHTML = ''
    data.forEach(appendMessage)
}

/**
 * append a message to the end of the already rendered list
 * @param {*} message 
 */
function appendMessage(message){
    document.querySelector('#no-content').classList.toggle('hidden', !!data.size)
    if (!message.event || !filters[message.event.name] || !filters[message.event.type] || !filters[message.event.feature]) return
    if (!!textSearch && JSON.stringify(message).indexOf(textSearch) === -1) return
    const eventData = message.event.data ? JSON.stringify(message.event.data) : ''
    const timestamp = `<td class="small-cell">${message.timeStamp}</td>`
    const name = `<td class="small-cell">${message.event.name}</td>`
    const feature = `<td class="small-cell">${message.event.feature}</td>`
    
    let prettyJson
    try{
        prettyJson = document.createElement('pretty-json')
        prettyJson.title = eventData
        prettyJson.innerText = eventData
    } catch (e){
        console.error('CAUGHT ERROR!', e)
    }
    const dataContents = document.createElement('td')
    dataContents.classList.add('large-cell')
    dataContents.appendChild(prettyJson)

    const row = document.createElement('tr')
    row.innerHTML = `
    ${timestamp}
    ${name}
    ${feature}
    `
    row.appendChild(dataContents)
    row.classList.add(message.event.name)

    document.querySelector('#content>table>#table-body').appendChild(row)
    if (autoScroll) row.scrollIntoView({ block: 'end',  behavior: 'smooth' })
    document.querySelector('#event-count').innerText = data.size
}


document.querySelectorAll('input').forEach(input => {
    input.addEventListener('change', (event) => {
        if (event.target.type === 'checkbox') {
            if (event.target.value === 'capture-data') {
                captureData = event.target.checked
                return // dont affect the filters with this one
            }

            if (event.target.value === 'auto-scroll') {
                autoScroll = event.target.checked
                return // dont affect the filters with this one
            }

            filters[event.target.value] = event.target.checked
            reRenderData()
        } 
        if (event.target.type === 'text') {
            textSearch = event.target.value
            reRenderData()
        }
    })
})

document.querySelector('#clear-data').addEventListener('click', () => {
    chrome.runtime.sendMessage({ message: 'clear_data' }, (response) => {
        data = new Set()
        uniqueIds = new Set()
        document.querySelector('#event-count').innerText = data.size
        reRenderData()
    })
})

document.querySelector('#toggle-all').addEventListener('click', () => {
    let checked 
    document.querySelectorAll('input').forEach((input, idx) => {
        if (idx === 0) checked = !input.checked
        input.checked = checked
        filters[input.value] = checked
    })
    reRenderData()
})

document.querySelector('#collapse').addEventListener('click', (evt) => {
    document.querySelectorAll('[data-hideable]').forEach(elem => elem.classList.toggle('hidden'))
})

/** disable auto-scroll if we scroll upward */
let scrollTop = 0
document.addEventListener('scrollend', evt => {
    const newScrollTop = document.documentElement.scrollTop
    if (newScrollTop < scrollTop) {
        document.querySelector('#auto-scroll').checked = false
        autoScroll = false
    }
    scrollTop = newScrollTop
})
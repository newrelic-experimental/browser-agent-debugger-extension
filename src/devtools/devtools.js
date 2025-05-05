let data = []
let uniqueIds = new Map()

let rowContent = ''

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
    session: true,
    // attributes
    timestamp: true,
    name: true,
    type: false,
    feature: true,
    "raw-data": true,
}

let autoScroll = false
let captureData = true
let textSearch = ''
let dataFilter = ''

chrome.devtools.panels.create(
    "NR Browser Agent DevTools",
    "assets/icon_32.png", // Path to an icon (optional)
    "src/devtools/devtools.html", // Path to the HTML file for the panel content
    function (panel) {
        console.log("NRBA Injector panel created", panel);
        panel.onShown.addListener(function (window) {
            console.log("panel shown", window);

            chrome.runtime.sendMessage({ message: 'devtools_ready' }, (response) => {
                console.log('Response from background.js:', response);
            })
        });
    }
);


window.addEventListener('DOMContentLoaded', () => {

    const img = document.querySelector('#loading>img')
    img.src = chrome.runtime.getURL('assets/spinner.gif')
    img.alt = '... Receiving Data From Web Page ...'
    img.title = '... Receiving Data From Web Page ...'

    setupDocumentListeners()
})

var backgroundPageConnection = chrome.runtime.connect({
    name: "devtools-page"
});

backgroundPageConnection.onDisconnect.addListener(function () {
    const loadingBlock = document.querySelector('#loading')
    loadingBlock.innerHTML = '❌ D I S C O N N E C T E D ❌ Please close dev tools, refresh the page and re-open'
})

backgroundPageConnection.onMessage.addListener(function (message) {
    if (message.message === 'content_ready') {
        chrome.runtime.sendMessage({ message: 'devtools_ready' })
        return
    }
    if (!captureData || !message.event || uniqueIds.has(message.uniqueId)) return
    uniqueIds.set(message.uniqueId, message)

    data.push(message)

    appendMessage(message)
    debouncedRender()
});

function debounce(func, timeout = 500, options = {}) {
    const leading = options?.leading || true
    let timer
    return (...args) => {
        if (leading && timer === undefined) {
            func.apply(this, args)
            timer = setTimeout(() => { timer = clearTimeout(timer) }, timeout)
        }

        if (!leading) {
            clearTimeout(timer)
            timer = setTimeout(() => { func.apply(this, args) }, timeout)
        }
    }
}

/**
 * this re-renders the full list.  Should only be done ad-hoc for toolbar changes
 */
function reRenderData() {
    rowContent = ''
    data.forEach(appendMessage)
    render()
}

function render() {
    const tableBody = document.querySelector('#content>table>#table-body')
    tableBody.innerHTML = rowContent
    if (autoScroll) tableBody.scrollIntoView({ block: 'end', behavior: 'smooth' })
    document.querySelector('#event-count').innerText = data.length

    tableBody.childNodes.forEach((row, idx) => {
        row.addEventListener('click', (evt) => {
            const dataset = uniqueIds.get(evt.target.dataset.uniqueId)
            const dataString = JSON.stringify(dataset.event.data)

            const expandContents = document.querySelector('#expand-contents')
            expandContents.innerHTML = ''
            let textContent = document.createElement('span')
            try {
                textContent = document.createElement('pretty-json')
                textContent.title = dataString
                textContent.innerText = dataString
            } catch (e) {
                console.error('CAUGHT ERROR!', e)
            }
            expandContents.appendChild(textContent)

            document.querySelector('#expand-title').innerText = dataset.event.feature

            document.querySelector('#expand').classList.remove('hidden')
            document.querySelector('table').classList.add('hidden')

        })
    })
}

const debouncedReRender = debounce(reRenderData, 1000)
const debouncedRender = debounce(render, 1000)

/**
 * append a message to the end of the already rendered list
 * @param {*} message 
 */
function appendMessage(message) {
    document.querySelector('#no-content').classList.toggle('hidden', !!data.length)
    document.querySelector('#loading').classList.toggle('hidden', !data.length)
    if (!message.event || !filters[message.event.name] || !filters[message.event.type] || !filters[message.event.feature]) return
    if (!!textSearch && JSON.stringify(message).indexOf(textSearch) === -1) return
    const timestamp = filters.timestamp ? `<td class="x-small-cell">${message.timeStamp}</td>` : '</td><td>'
    const name = filters.name ? `<td class="small-cell">${message.event.name}</td>` : '</td><td>'
    const feature = filters.feature ? `<td class="small-cell">${message.event.feature}</td>` : '</td><td>'

    const attributeSearchResult = findAttribute(message.event.data, dataFilter)
    const attributeSearch = !!dataFilter ? `<td class="small-cell">${!!attributeSearchResult ? JSON.stringify({ [dataFilter]: attributeSearchResult }) : '---'}</td>` : '' // only have this value occupy a column if we have something to show

    document.querySelector('#attribute-search-header').classList.toggle('hidden', !attributeSearch) // only show this header if we have something to show

    function findAttribute(obj, attr) {
        if (obj === null || obj === undefined || typeof obj !== 'object') return null
        if (obj.hasOwnProperty(attr)) return obj[attr]
        for (const key in obj) {
            if (typeof obj[key] === 'object') {
                const result = findAttribute(obj[key], attr);
                if (result) return result;
            }
        }
        return null;
    }

    const msgData = message.event.data
    const dataString = JSON.stringify(msgData || '')
    let trunctatedData = dataString ? dataString.substring(0, 400) : ''
    if (trunctatedData.length === 400) trunctatedData += ' ...'
    const dataContents = filters['raw-data'] ? `<td title="Click to expand" data-unique-id=${message.uniqueId} class="large-cell clickable" style="padding-right: 25px;">${trunctatedData}</td>` : ''

    // TODO: chrome ext. wont let you use inline functions.  gotta figure out a way to allow a click on the TD to get the raw event from the background worker.

    const row = `<tr class="${message.event.name}">
    ${timestamp}
    ${name}
    ${feature}
    ${attributeSearch}
    ${dataContents}
    </tr>
    `

    rowContent += row
}


function setupDocumentListeners() {
    document.querySelector('#expand-header>#close').addEventListener('click', (evt) => {
        document.querySelector('#expand').classList.add('hidden')
        document.querySelector('table').classList.remove('hidden')
    })


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
                debouncedReRender()
            }

            console.log("event...", event.target)

            if (event.target.id === 'search') {
                textSearch = event.target.value
                debouncedReRender()
            }
            if (event.target.id === 'data-filter') {
                console.log("SETTING DATA FILTER", event.target.value)
                dataFilter = event.target.value
                debouncedReRender()
            }
        })
    })

    document.querySelector('#clear-data').addEventListener('click', () => {
        chrome.runtime.sendMessage({ message: 'clear_data' }, (response) => {
            data = []
            rowContent = ''
            uniqueIds = new Map()
            document.querySelector('#event-count').innerText = data.length
            debouncedReRender()
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
}
# New Relic Browser Agent Debugger Extension

## Overview
The New Relic Browser Agent Debugger Extension is a Chrome extension designed to display debugging events emitted by the browser agent in real time.  The project is currently *under development* but is in a state that can be used and experimented with.  See #installation to get started with debugging browser agent events.

## Project Structure
```
nrba-injector-extension-v3
├── src
│   ├── background
│   │   └── background.js
│   ├── content
│   │   └── content.js
│   ├── popup
│   │   ├── popup.html
│   │   ├── popup.js
│   │   └── popup.css
│   ├── devtools
│   │   ├── devtools.html
│   │   ├── devtools.js
│   │   └── devtools.css
├── manifest.json
└── README.md
```

## Installation
1. Clone the repository or download the source code.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable "Developer mode" using the toggle in the top right corner.
4. Click on "Load unpacked" and select the `browser-agent-debugger-extension` directory.
5. Ensure the extension shows in the open `extensions` page, and that it is enabled.

## Usage
1. Access the NR Browser Agent DevTools panel by pressing `command + option + i` or right-clicking on a web page and selecting "Inspect" 
2. then navigate to the "NRBA" tab.
3. Open the filters and toggle the settings to find, show, or hide certain event types.

## Disclaimer 
This project is under development and probably full of more bugs than a summer camp bunkbed. Use with that expectation in mind until a more stable product is developed.  Contributions and issues are welcome to improve development speed.

## Contributing
Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for details.
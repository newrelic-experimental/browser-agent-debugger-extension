# NRBA Injector Extension v3

## Overview
The NRBA Injector Extension is a Chrome extension designed to enhance web browsing by allowing users to inject custom scripts and styles into web pages. This extension provides a user-friendly popup interface and integrates with Chrome DevTools for advanced functionality.

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
4. Click on "Load unpacked" and select the `nrba-injector-extension-v3` directory.

## Usage
- Click on the extension icon in the Chrome toolbar to open the popup.
- Use the popup to interact with the extension's features.
- Access the DevTools panel by right-clicking on a web page and selecting "Inspect", then navigating to the "NRBA" tab.

## Contributing
Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for details.
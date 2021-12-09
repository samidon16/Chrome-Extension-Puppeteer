# Chrome-Extension-Puppeteer

This Google Chrome extension automates collecting IPO information from the NASDAQ website.

## Overview:

Uses version 3 of the Google Chrome Extension manifest and API.

### Running the extension

This extension automates collecting data from the NASDAQ exchange website regarding initial public offerings (IPOs). The extension is activated by clicking on the extension icon to initiate an action on the NASDAQ IPO web page:

https://www.nasdaq.com/market-activity/ipos

The action triggers an event listener in the background script (background.js), which then injects contentScript1.js into the page. All other content scripts are run automatically on their respective web pages and are declared in the manifest.

### Getting Started:

The file contentScript2.js contains an API call to the Google Maps Geocoding API. The response from that API call is used to determine the country of the company being looked at. To make the API calls you will need to add your own key to the url variable, in the key query string. If you do not add your own API key, every company will have their country set to United States. Any API keys that are added should be restricted to your IP address and the geocoding API.

Before gathering information on any given company, the company symbol is compared to the symbols saved in stockData.json. Any company that is already saved in stockData.json is skipped. There are some example companies already in the stockData.json file.

Version 3 of the Google Chrome Extension API prevents writing to files. When the extension finishes looking through all the companies on a page, it outputs all the data it has gathered in json to the services worker's (background.js) console. The output can then be copy and pasted into the stockData.json file.

## Existing Issues:

### Retrieving data

Version 3 of the Google Chrome Extension API prevents writing to files. Currently, this means that data must be extracted through the console. A more automated way must be found to move the output into the stockData.json file. This is the only obstacle preventing the extension from going through multiple NASDAQ IPO pages in one run.

### Stalling Out

There are abnormallities when loading web pages that can cause the extension to stall out. The extension stalling out is relatively rare, but there are many seemingly unconnected causes. Rather than accounting for each abnormallity separately, a system needs to be implemented in background.js to detect the page stalling out. Then, the page should either be reloaded or skipped.

### Missing companies

Some companies have been delisted from their exchange or changed their exchange symbol. The result is that the extension will not be able to find stock price information for that company. When price information is unavailable, the company is skipped and no information is saved. This leads to a survivorship bias in the dataset.

Stock prices for delisted companies are not on public websites, and can only be found through paid database subscriptions. A financial database should be chosen and added to the extension for data collection.

### Net Income

Net income is currently found on the NASDAQ website under a company's IPO page in financials and fillings. The net income listed there is always positive, regardless of if the company had a let loss. A process must be added to the extension to open the SEC documents listed on that page and determine whether the net income was positive or negative.

### Run Time

Currently, each web page is opened by the extension one after another, which costs a considerable amount of time for every company. As many pages as possible should be opened and mined for data simultaneously.

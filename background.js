function injectScript(file, tabId) {
    chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ["jQuery.js"]
    },
        () => chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: [file]
        }, () => { })
    );
}

function checkInclusion(message, sendResponse) {
    let i = message.i;
    let company = message.company;
    let inclusion = false;
    const url = chrome.runtime.getURL('JSON/stockData.json');
    fetch(url)
        .then((response) => response.json())
        .then((companyObject) => {
            for (const currComp in companyObject) {
                if (company == currComp) {
                    inclusion = true;
                }
            }
            if (!inclusion) {
                chrome.storage.sync.set({ [company]: {}, company: company, i: i }, () => {
                    //chrome.storage.sync.get(null, (result) => { console.log(result); });
                });
            }
            sendResponse({ inclusion: inclusion })
        });
}

function store(data) {
    chrome.storage.sync.get(['company'], (result) => {
        let company = result.company;
        chrome.storage.sync.get([company], (result1) => {
            let mergedObject = {
                ...result1[company],
                ...data
            }
            chrome.storage.sync.set({ [company]: mergedObject }, () => {
                /*//This function call is just for testing
                chrome.storage.sync.get([company], (result2) => {
                    console.log(result2);
                });*/
            });
        });
    });
}

function goToUrl(url) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.update(tabs[0].id, { url: url });
    });
}

function next(skipFlag, message) {
    if (skipFlag) {
        chrome.storage.sync.get(["company"], (result) => {
            let company = result.company;
            console.log(company + ": " + message.reason);
            chrome.storage.sync.remove([company], (result) => { });
        });
    }
    chrome.tabs.query({}, function (tabs) {
        let urlFrag;
        if (message.page == "prices") urlFrag = "https://www.nasdaq.com/market-activity/stocks/";
        else if (message.page == "unknownSymbol") urlFrag = "https://www.nasdaq.com/market-activity#msymbol=";
        for (let i = 0; i < tabs.length; i++) {
            if (tabs[i].url.includes(urlFrag)) {
                removeTab(tabs[i].id);
                break;
            }
        }
    });
}

function removeTab(tabId) {
    chrome.tabs.remove(tabId, function () {
        chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
            if (tabs[0].url == "https://www.nasdaq.com/market-activity/ipos") {
                chrome.storage.sync.get(["i"], (result) => {
                    let i = ++result.i;
                    chrome.storage.sync.set({ i: i }, () => {
                        chrome.scripting.executeScript({
                            target: { tabId: tabs[0].id },
                            files: ["contentScripts/contentScript1.js"]
                        });
                    });
                });
            }
            else console.error("Failure to return to IPO Calendar");
        });
    });
}

function saveResults() {
    chrome.storage.sync.get(null, (result) => {
        delete result["i"];
        delete result["company"];

        console.log(JSON.stringify(result));
        console.log("Done");
    });
}

chrome.runtime.onInstalled.addListener(() => {

    chrome.action.onClicked.addListener(tab => {
        chrome.storage.sync.clear(() => {
            chrome.storage.sync.set({ i: 0 }, (result) => { });
        });
        injectScript('contentScripts/contentScript1.js', tab.id);
    });

    chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
        if (tab.url.includes("https://www.nasdaq.com/market-activity#msymbol=") && changeInfo.status === 'complete') next(true, {page: "unknownSymbol", reason: "Skipped for redirect to unknown symbol"});
    });

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.status == "checkInclusion") {
            checkInclusion(message, sendResponse);
            return true;
        }
        else if (message.status == "store") {
            store(message.data);
            return false;
        }
        else if (message.status == "nasdaqPrices") {
            chrome.storage.sync.get(["company"], (result) => {
                let url = "https://www.nasdaq.com/market-activity/stocks/" + result["company"] + "/historical";
                goToUrl(url);
            });
            return false;
        }
        else if (message.status == "next") {
            next(false, message);
        }
        else if (message.status == "skip") {
            next(true, message);
        }
        else if (message.status == "saveResults") {
            saveResults();
        }
    });
})
var options = {
    childList: true
}

$(window).on("load", function () {
    try {
        var pageBox = $("div.pagination__pages")[0];
    } catch (error) {
        //Proceed to next company when no price data available
        chrome.runtime.sendMessage({ status: "skip", page: "prices", reason: "Skipped for error selecting table on prices page" }, function (response) { });
    }

    let errorDivs = $("div.error-state");
    for (let i = 0; i < errorDivs.length; i++) {
        if (errorDivs.slice(i).css("display") != "none") {
            console.log("failed on prices page");
            chrome.runtime.sendMessage({ status: "skip", page: "prices", reason: "Skipped for error displayed on prices page" }, function (response) { });
        }
    }
    let pageObserver = new MutationObserver(loadPages);
    pageObserver.observe(pageBox, options);

    let maxButton = $("button.table-tabs__tab")[5];
    maxButton.click();
});

function loadPages(mutation) {
    this.disconnect();
    setTimeout(function () {
        let dataBox = $("tbody.historical-data__table-body")[0];
        let dataObserver = new MutationObserver(loadData);

        let buttons = $("button.pagination__page");
        if (buttons.length == 1) getData();
        else {
            let lastPage = buttons[buttons.length - 1];
            lastPage.click();

            dataObserver.observe(dataBox, options);
        }
    }, 3000);
}

function loadData(mutation) {
    this.disconnect();
    getData();
}

function getData() {
    let rows = $("tr.historical-data__row");
    let IPODate = rows[rows.length - 1].childNodes[0].innerHTML;
    chrome.storage.sync.get(['company'], (result) => {
        let company = result["company"];
        chrome.storage.sync.get([company], (result) => {
            if (result[company]["date"] != IPODate) {
                chrome.runtime.sendMessage({ status: "skip", page: "prices", reason: "Skipped for date mismatch on prices page" }, (response) => { });
            }
            else {
                let dataArray = [parseFloat(rows[rows.length - 1].childNodes[3].innerHTML.slice(1))];
                let position = rows.length - 1;
                let loopFlag = true;
                for (let i = 0; i < 5; i++) {
                    if (position >= 0) {
                        dataArray.push(parseFloat(rows[position].childNodes[1].innerHTML.slice(1)));
                        position--;
                    }
                    else {
                        loopFlag = false;
                        let buttons = $("button.pagination__page");
                        let lastPage = buttons[buttons.length - 2];
                        lastPage.click();
                        setTimeout(function () {
                            rows = $("tr.historical-data__row");
                            position = rows.length - 1;
                            for (; i < 5; i++) {
                                dataArray.push(parseFloat(rows[position].childNodes[1].innerHTML.slice(1)));
                                position--;
                            }
                            storeData(dataArray);
                        }, 1000);
                        break;
                    }
                }
                if (loopFlag) {
                    storeData(dataArray);
                }
            }
        });
    });
}

function storeData(dataArray) {
    let data = { "prices": dataArray }
    chrome.runtime.sendMessage({ data: data, status: "store" }, (response) => {
        chrome.runtime.sendMessage({ status: "next", page: "prices" }, (response) => { });
    });
}
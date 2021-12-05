function run() {
    let rows = $("div.insert-data").find("tr");
    let leadUnderwriters = [];
    let underwriters = [];
    for (let row of rows) {
        if (row.childNodes[1].innerHTML == "LeadUnderwriter" && row.childNodes[0].innerHTML != "Not Specified") {
            leadUnderwriters.push(row.childNodes[0].innerHTML);
        }
        if (row.childNodes[1].innerHTML == "Underwriter" && row.childNodes[0].innerHTML != "Not Specified") {
            underwriters.push(row.childNodes[0].innerHTML);
        }
    }
    let data = {
        "leadUnderwriters": leadUnderwriters,
        "underwriters": underwriters
    }

    chrome.runtime.sendMessage({ data: data, status: "store" }, (response) => {
        chrome.runtime.sendMessage({ status: "nasdaqPrices" }, (response) => { });
    });
}

$(window).on("load", function () {
    try {
        setTimeout(run, 500);
    }
    catch (error) {
        setTimeout(run, 500);
    }
});
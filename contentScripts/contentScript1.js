function run(i) {
    let table = $("h3.market-calendar-table__title:contains('Priced')");
    let row = table.parent().find("tr.market-calendar-table__row")[i];

    if (row.childNodes.length < 8) {
        chrome.runtime.sendMessage({ status: "saveResults" }, function () {});
        return;
    }
    else {
        if (typeof (row.childNodes[0].childNodes[1].childNodes[0]) == "undefined") {
            run(++i);
            return;
        }

        let link = row.childNodes[0].childNodes[1].childNodes[0];
        let symbol = link.innerHTML;
        let companyName = row.childNodes[1].childNodes[1].innerHTML;
        if (companyName.includes("Acquisition") || companyName.includes("Investment Corp") || companyName.includes("Capital Partners") || companyName.includes("Trust") || companyName.includes("Holdings") || symbol.includes("'") || symbol.length > 4) {
            run(++i);
            return;
        }
        let inclusion = null;
        chrome.runtime.sendMessage({
            status: "checkInclusion",
            company: symbol,
            i: i
        }, function (response) {
            inclusion = response.inclusion;
            if (!inclusion) {
                let date = row.childNodes[5].childNodes[1].childNodes[0].innerHTML;
                let data = { "date": date };
                chrome.runtime.sendMessage({ data: data, status: "store" }, (response) => { });

                link.setAttribute("target", "_blank");
                link.click();
            }
            else {
                run(++i);
                console.log(row);
            }
        });
    }
}

chrome.storage.sync.get(['i'], (result) => {
    run(result['i']);
});
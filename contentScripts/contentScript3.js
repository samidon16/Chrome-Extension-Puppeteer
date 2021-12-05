function run() {
    let rows = $("div.insert-data-financials").find("tr");

    let revenue = rows[0].childNodes[1].innerHTML;
    revenue = parseInt(revenue.slice(1).replace(/,/g, ''));
    if (isNaN(revenue)) revenue = 0;

    let netIncome = rows[1].childNodes[1].innerHTML;
    netIncome = parseInt(netIncome.slice(1).replace(/,/g, ''));
    if (isNaN(netIncome)) netIncome = 0;

    let totalAssets = rows[2].childNodes[1].innerHTML;
    totalAssets = parseInt(totalAssets.slice(1).replace(/,/g, ''));
    if (isNaN(totalAssets)) totalAssets = 0;

    let totalLiabilities = rows[3].childNodes[1].innerHTML;
    totalLiabilities = parseInt(totalLiabilities.slice(1).replace(/,/g, ''));
    if (isNaN(totalLiabilities)) totalLiabilities = 0;

    let stockholdersEquity = rows[4].childNodes[1].innerHTML;
    stockholdersEquity = parseInt(stockholdersEquity.slice(2, -1).replace(/,/g, ''));
    if (isNaN(stockholdersEquity)) stockholdersEquity = 0;

    let data = {
        "revenue": revenue,
        "netIncome": netIncome,
        "totalAssets": totalAssets,
        "totalLiabilities": totalLiabilities,
        "stockholdersEquity": stockholdersEquity
    };
    chrome.runtime.sendMessage({ data: data, status: "store" }, (response) => { });

    let experts = $("a[data-ref='experts']")[0];
    experts.click();
}

$(window).on("load", function () {
    /*let CompanyFilings = $("tbody")[1];
    for (let i = CompanyFilings.childNodes.length - 1; i >= 0; i--) {
        let row = CompanyFilings.childNodes[i];
        if (row.childNodes[1].innerHTML == "S-1/A" || row.childNodes[1].innerHTML == "F-1/A") {
            let link = row.childNodes[3].childNodes[0];
            link.click();
            break;
        }
    }*/

    try {
        run();
    }
    catch (error) {
        setTimeout(run, 500);
    }
});
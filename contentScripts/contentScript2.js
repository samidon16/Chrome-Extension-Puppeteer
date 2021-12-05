function run() {
    let rows = $("div.insert-data").find("tr");

    let exchange = rows[2].childNodes[1].innerHTML;

    let IPOPrice = rows[3].childNodes[1].innerHTML;
    IPOPrice = parseFloat(IPOPrice.slice(1));

    let employees = rows[4].childNodes[1].innerHTML;
    employees = parseFloat(employees.split(" ")[0]);

    let sharesOffered = rows[6].childNodes[1].innerHTML;
    sharesOffered = parseInt(sharesOffered);

    let offerAmount = rows[7].childNodes[1].innerHTML;
    offerAmount = parseInt(offerAmount.slice(1).replace(/,/g, ''));

    let address = encodeURIComponent(rows[9].childNodes[1].innerHTML);
    let url = "https://maps.googleapis.com/maps/api/geocode/json?address=" + address + "&key=AIzaSyCIohLqP3N8xREN9V3K3kLSzi8fHy3XMz4&language=en";
    let country = null;
    $.ajax({
        url: url,
        type: "GET",
        success: function (result) {
            try {
                //let formatted_address = result.results[0].formatted_address.split(" ");
                //country = formatted_address[formatted_address.length - 1];
                let address_components = result.results[0].address_components;
                for (let component of address_components) {
                    if (component["types"].includes("country")) {
                        var country = component["long_name"];
                        break;
                    }
                }
            } catch (error) {
                country = "United States";
            }

            let shareholderSharesOffered = parseInt(rows[16].childNodes[1].innerHTML);
            if (isNaN(shareholderSharesOffered)) shareholderSharesOffered = 0;

            let sharesOutstanding = parseInt(rows[17].childNodes[1].innerHTML.replace(/,/g, ''));
            if (isNaN(sharesOutstanding)) sharesOutstanding = 0;

            let data = {
                "exchange": exchange,
                "IPOPrice": IPOPrice,
                "employees": employees,
                "sharesOffered": sharesOffered,
                "offerAmount": offerAmount,
                "country": country,
                "shareholderSharesOffered": shareholderSharesOffered,
                "sharesOutstanding": sharesOutstanding
            }
            chrome.runtime.sendMessage({ data: data, status: "store" }, (response) => { });

            let financials = $("a[data-ref='financials-filings']")[0];
            financials.click();
        },
        error: function (error) {
            console.log(error);
        }
    });
}

$(window).on("load", function () {
    try {
        run();
    }
    catch (error) {
        setTimeout(run, 500);
    }
});
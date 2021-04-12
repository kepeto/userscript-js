// ==UserScript==
// @name         Tokenfomo.io add some additional data
// @namespace    http://tampermonkey.net/
// @version      0.14
// @description  add some additional data to tokenfomo
// @author       kepeto & billyriantono
// @match        https://*.tokenfomo.io
// @icon         https://www.google.com/s2/favicons?domain=tokenfomo.io
// @require      http://code.jquery.com/jquery-latest.js
// @grant        GM_xmlhttpRequest
// @grant        GM_registerMenuCommand
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

//warning adding price in this version will make tokenfomo little bit slower
(function() {
    'use strict';

    GM_registerMenuCommand("Set requestor", setRequestor);
    const bitqueryHeaders = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:87.0) Gecko/20100101 Firefox/87.0",
        "Content-Type": "application/json",
        "Accept": "application/json",
        "X-API-KEY": "BQYvhnv04csZHaprIBZNwtpRiDIwEIW9",
        "Origin": "https://graphql.bitquery.io",
        "Referer": "https://graphql.bitquery.io"
    };
    //0x55d398326f99059ff775485246999027b3197955
    //0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c
    const getBNBUSDQuery = JSON.stringify({
            "query": "{  ethereum(network: bsc) {    dexTrades(     baseCurrency: {is: \"0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c\" } quoteCurrency: {is: \"0x55d398326f99059ff775485246999027b3197955\"}  options: {desc: [\"block.height\", \"transaction.index\"], limit: 1} ) { block {       height      timestamp {          time(format: \"%Y-%m-%d %H:%M:%S\")      }      }     transaction {        index    }     baseCurrency {        symbol      }    quoteCurrency {       symbol     }     quotePrice   } }}",
            "variables": {}
        });

    function getPriceQuery(address) {
        var requestData = JSON.stringify({
            "query": "{  ethereum(network: bsc) {    dexTrades(     baseCurrency: {is: \"" + address + "\" } quoteCurrency: {is: \"0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c\"}  options: {desc: [\"block.height\", \"transaction.index\"], limit: 1} ) { block {       height      timestamp {          time(format: \"%Y-%m-%d %H:%M:%S\")      }      }     transaction {        index    }     baseCurrency {        symbol      }    quoteCurrency {       symbol     }     quotePrice   } }}",
            "variables": {}
        });
        return requestData;
    };

    function setRequestor() {
        var req = prompt("Who are you??");
        GM_setValue("requestor", req);
    }

    GM_xmlhttpRequest ( {
                   method:     "POST",
                   url:        "https://graphql.bitquery.io/",
                   headers:    bitqueryHeaders,
                   data:       getBNBUSDQuery,
                   onload:     function (response) { parseBNBUSDResponse(response)},
                   onerror:    function (e) { console.error ('**** error ', e); },
                   onabort:    function (e) { console.error ('**** abort ', e); },
                   ontimeout:  function (e) { console.error ('**** timeout ', e); }
               });
    
    var mutationObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            var newRow = mutation.addedNodes[0];
            var scanLink = newRow.childNodes[3].childNodes[0].getAttribute('href');

            mutationObserver.disconnect();
            if(scanLink.includes("etherscan")) {
               newRow.style.display = "none";
           } else {
               var addressInfo = scanLink.split("/");
               var address = addressInfo[addressInfo.length - 1];
               var lastCell = newRow.cells[newRow.cells.length - 4];
               var pooCoinUrl = "http://poocoin.app/tokens/" + address;
               lastCell.innerHTML = "<a href='" + pooCoinUrl + "' target='_blank'>📊</a>";
               GM_xmlhttpRequest ( {
                   method:     "GET",
                   url:        "https://api.p-codes.com/bridge/redirector.php?url=" + scanLink + "&requestor=" + GM_getValue("requestor",""),
                   onload:     function (response) { parseResponse(response, newRow, address)},
                   onerror:    function (e) { console.error ('**** error ', e); },
                   onabort:    function (e) { console.error ('**** abort ', e); },
                   ontimeout:  function (e) { console.error ('**** timeout ', e); }
               });
           }
            //sleep avoid failed load bsscan
            //window.setTimeout(console.log("Wait"), 5000);
        });
    });

    $(document).ready(function() {
       parseBody();
        var footer = document.querySelector("body > div > div > main > div > table > tfoot > tr > td");
        if(footer !== null) {
            footer.addEventListener("click", function() {
                // Starts listening for changes in the root HTML element of the page.
                mutationObserver.observe(document.querySelector("body > div > div > main > div > table > tbody"), {
                    attributes: false,
                    characterData: false,
                    childList: true,
                    subtree: false,
                    attributeOldValue: false,
                    characterDataOldValue: false
                });
            } , false);
        }
    });

    function wait(ms){
       var start = new Date().getTime();
       var end = start;
       while(end < start + ms) {
         end = new Date().getTime();
       }
    }

    function parseBody() {
       var table = document.querySelector("body > div > div > main > div > table");
       var rows = document.querySelectorAll("body > div > div > main > div > table > tbody > tr");
       var index = 0;
       rows.forEach(row => {
           var scanLink = row.childNodes[3].childNodes[0].getAttribute('href');
           if(scanLink.includes("etherscan")) {
               row.style.display = "none";
           } else {
               var addressInfo = scanLink.split("/");
               var address = addressInfo[addressInfo.length - 1];
               var lastCell = row.cells[row.cells.length - 4];
               var pooCoinUrl = "http://poocoin.app/tokens/" + address;
               lastCell.innerHTML = "<a href='" + pooCoinUrl + "' target='_blank'>📊</a>";
               GM_xmlhttpRequest ( {
                   method:     "GET",
                   url:        "https://api.p-codes.com/bridge/redirector.php?url=" + scanLink + "&requestor=" + GM_getValue("requestor",""),
                   onload:     function (response) { parseResponse(response, row, address)},
                   onerror:    function (e) { console.error ('**** error ', e); },
                   onabort:    function (e) { console.error ('**** abort ', e); },
                   ontimeout:  function (e) { console.error ('**** timeout ', e); }
               });
           }
           index++;
    });
    }


    function parseResponse (response, row, address) {
        var parser = new DOMParser ();
        if(response.responseText == null) {
          return;
        }
        var ajaxDoc = parser.parseFromString (response.responseText, "text/html");
        var tokenInfo = ajaxDoc.querySelectorAll("body > div > main > #ContentPlaceHolder1_divSummary > div > div.col-md-6 > div.card.h-100 > div.card-body > div");
        if(tokenInfo[1]) {
            var tokenSupplyCell = row.insertCell(-1);
            var totalSupply = "<span style='font-family: monospace,monospace;color: #696969;font-size:80%;'>" + (tokenInfo[1].children[1].children[0].getAttribute('title') !== null ? tokenInfo[1].children[1].children[0].getAttribute('title').replaceAll(/\s/g,'') : 0) + "</span>";
            tokenSupplyCell.innerHTML = totalSupply;
            var holders = "<span style='font-family: monospace,monospace;color: #696969;font-size:80%;'>" + ((tokenInfo[2].children[1].children[1].children[0].children[0]) ? tokenInfo[2].children[1].children[1].children[0].children[0].innerText.trim() : "0") + "</span>";
            var holdersCell = row.insertCell(-1);
            holdersCell.innerHTML = holders;
        //    var totalTrx = "<span style='font-family: monospace,monospace;color: #696969;font-size:80%;'>" + ((tokenInfo[3].children[1].children[1]) ? tokenInfo[3].children[1].children[1].innerText.trim() : "0 address") + "</span>";
          //  var totalTrxCell = row.insertCell(-1);
           // totalTrxCell.innerHTML = totalTrx;
            GM_xmlhttpRequest ( {
                   method:     "POST",
                   url:        "https://graphql.bitquery.io/",
                   headers:    bitqueryHeaders,
                   data:       getPriceQuery(address),
                   onload:     function (response) { parseQueryResponse(response, row, tokenInfo[1].children[1].children[0].getAttribute('title'))},
                   onerror:    function (e) { console.error ('**** error ', e); },
                   onabort:    function (e) { console.error ('**** abort ', e); },
                   ontimeout:  function (e) { console.error ('**** timeout ', e); }
               });
        } else {
            var errorCell = row.insertCell(-1);
            if(response.responseText.includes("unusual")) {
                errorCell.innerHTML = "<span style='font-family: monospace,monospace;color: #696969;font-size:80%;'>Failed load BSCScan Data, Seems we got blocked</span>";
            } else if(response.responseText.includes("captcha")) {
                errorCell.innerHTML = "<span style='font-family: monospace,monospace;color: #696969;font-size:80%;'>Failed load BSCScan Data, Seems we got captcha.</span>";   
            } else if(response.responseText.includes("1010")) {
                errorCell.innerHTML = "<span style='font-family: monospace,monospace;color: #696969;font-size:80%;'>Failed load BSCScan Data, Seems the ip got banned by cloudflare.</span>";   
            } else {
                errorCell.innerHTML = "<span style='font-family: monospace,monospace;color: #696969;font-size:80%;'>Failed load BSCScan Data, with Unknown Error.</span>";   
            }
        }

    }

    function parseBNBUSDResponse (response) {
        if(response.responseText == null) {
          return;
        }
        var jsonDoc = JSON.parse(response.responseText);
        var tokenData = jsonDoc.data;
        GM_setValue("BNB_USD", ((tokenData.ethereum.dexTrades[0].quotePrice) ? tokenData.ethereum.dexTrades[0].quotePrice : 0));
    }

    function parseQueryResponse (response, row, totalSupply) {
        if(response.responseText == null) {
          return;
        }
        var jsonDoc = JSON.parse(response.responseText);
        var tokenData = jsonDoc.data;
        if(tokenData.ethereum.dexTrades != null && tokenData.ethereum.dexTrades[0]) {
            var priceData = tokenData.ethereum.dexTrades[0].quotePrice * GM_getValue("BNB_USD", 0);
            var priceCell = row.insertCell(-1);
            priceCell.innerHTML = "<span style='font-family: monospace,monospace;color: #696969;font-size:80%;'>Price : $" + priceData + ", Market Cap : " + (Number(totalSupply.replaceAll(/\s/g,'').replaceAll(",","")) * priceData) + "</span>";
        } else {
            var errorCell = row.insertCell(-1);
            errorCell.innerHTML = "<span style='font-family: monospace,monospace;color: #696969;font-size:80%;'>Price : $ 0, Market cap : $ 0</span>";
        }
    }

    function parsePooResponse (response, row) {
        var parser = new DOMParser ();
        if(response.responseText == null) {
          return;
        }
        var ajaxDoc = parser.parseFromString (response.responseText, "text/html");
        var tokenInfo = ajaxDoc.querySelector("body > #root > div");
        console.dir(tokenInfo);
        if(tokenInfo.length > 0) {

        } else {
            var errorCell = row.insertCell(-1);
            errorCell.innerHTML = "<span style='font-family: monospace,monospace;color: #696969;font-size:80%;'>Failed load PooCoin Data, Seems we got blocked</span>";
        }
    }
})();

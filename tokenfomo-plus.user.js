// ==UserScript==
// @name         Tokenfomo.io add some additional data
// @namespace    http://tampermonkey.net/
// @version      0.7
// @description  add some additional data to tokenfomo
// @author       kepeto & billyriantono
// @match        https://*.tokenfomo.io
// @icon         https://www.google.com/s2/favicons?domain=tokenfomo.io
// @require      http://code.jquery.com/jquery-latest.js
// @grant       GM_xmlhttpRequest
// ==/UserScript==

(function() {
    'use strict';

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
               lastCell.innerHTML = "<a href='http://poocoin.app/tokens/" + address + "' target='_blank'>📊</a>";
               GM_xmlhttpRequest ( {
                   method:     "GET",
                   url:        scanLink,
                   onload:     function (response) { parseResponse(response, newRow)},
                   onerror:    function (e) { console.error ('**** error ', e); },
                   onabort:    function (e) { console.error ('**** abort ', e); },
                   ontimeout:  function (e) { console.error ('**** timeout ', e); }
               });
           }
            //sleep avoid failed load bsscan
            window.setTimeout(console.log("Wait"), 5000);
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
               lastCell.innerHTML = "<a href='http://poocoin.app/tokens/" + address + "' target='_blank'>📊</a>";
               GM_xmlhttpRequest ( {
                   method:     "GET",
                   url:        "https://api.p-codes.com/bridge/redirector.php?url=" + scanLink,
                   onload:     function (response) { parseResponse(response, row)},
                   onerror:    function (e) { console.error ('**** error ', e); },
                   onabort:    function (e) { console.error ('**** abort ', e); },
                   ontimeout:  function (e) { console.error ('**** timeout ', e); }
               });
           }
           index++;
    });
    }


    function parseResponse (response, row) {
        var parser = new DOMParser ();
        if(response.responseText == null) {
          return;
        }
        var ajaxDoc = parser.parseFromString (response.responseText, "text/html");
        var tokenInfo = ajaxDoc.querySelectorAll("body > div > main > #ContentPlaceHolder1_divSummary > div > div.col-md-6 > div.card.h-100 > div.card-body > div");
        if(tokenInfo[1]) {
            var tokenSupplyCell = row.insertCell(-1);
            var totalSupply = "<span style='font-family: monospace,monospace;color: #696969;font-size:80%;'>" + (tokenInfo[1].children[1].children[0].getAttribute('title') !== null ? tokenInfo[1].children[1].children[0].getAttribute('title') : 0) + "</span>";
            tokenSupplyCell.innerHTML = totalSupply;
            var holders = "<span style='font-family: monospace,monospace;color: #696969;font-size:80%;'>" + tokenInfo[2].children[1].children[1].children[0].children[0].innerText.trim() + "</span>";
            var holdersCell = row.insertCell(-1);
            holdersCell.innerHTML = holders;
            var totalTrx = "<span style='font-family: monospace,monospace;color: #696969;font-size:80%;'>" + tokenInfo[3].children[1].children[1].innerText.trim() + "</span>";
            var totalTrxCell = row.insertCell(-1);
            totalTrxCell.innerHTML = totalTrx;
        } else {
            var errorCell = row.insertCell(-1);
            errorCell.innerHTML = "<span style='font-family: monospace,monospace;color: #696969;font-size:80%;'>Failed load BSCScan Data, Seems we got blocked. Response : " + response.responseText + "</span>";
        }
    }
})();

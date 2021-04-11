// ==UserScript==
// @name         Tokenfomo.io add some additional data
// @namespace    http://tampermonkey.net/
// @version      0.4
// @description  add some additional data to tokenfomo
// @author       kepeto & billyriantono
// @match        https://*.tokenfomo.io
// @icon         https://www.google.com/s2/favicons?domain=tokenfomo.io
// @require      http://code.jquery.com/jquery-latest.js
// @grant       GM_xmlhttpRequest
// ==/UserScript==

(function() {
    'use strict';

    $(document).ready(function() {
       var table = document.querySelector("body > div > div > main > div > table");
       var rows = document.querySelectorAll("body > div > div > main > div > table > tbody > tr");
       var index = 0;
       rows.forEach(row => {
           var scanLink = row.childNodes[3].childNodes[0].getAttribute('href');
           if(scanLink.includes("etherscan")) {
               row.style.display = "none";
           } else {
               var lastCell = row.cells[row.cells.length - 1];
               GM_xmlhttpRequest ( {
                   method:     "GET",
                   url:        scanLink,
                   onload:     function (response) { parseResponse(response, row)},
                   onerror:    function (e) { console.error ('**** error ', e); },
                   onabort:    function (e) { console.error ('**** abort ', e); },
                   ontimeout:  function (e) { console.error ('**** timeout ', e); }
               });
           }
           index++;
    });
    });

    function parseResponse (response, row) {
        var parser = new DOMParser ();
        /* IMPORTANT!
        1) For older browsers, see
        https://developer.mozilla.org/en-US/docs/Web/API/DOMParser
        for a work-around.

        2) jQuery.parseHTML() and similar is bad because it causes images, etc., to be loaded.
    */
        var ajaxDoc = parser.parseFromString (response.responseText, "text/html");
        var tokenInfo = ajaxDoc.querySelectorAll("body > div > main > #ContentPlaceHolder1_divSummary > div > div.col-md-6 > div.card.h-100 > div.card-body > div");
        var totalSupply = "<span style='font-family: monospace,monospace;color: #696969;font-size:80%;'>" + (tokenInfo[1].children[1].children[0].getAttribute('title') !== null ? tokenInfo[1].children[1].children[0].getAttribute('title') : 0) + "</span>";
        var tokenSupplyCell = row.insertCell(-1);
        tokenSupplyCell.innerHTML = totalSupply;
        var holders = "<span style='font-family: monospace,monospace;color: #696969;font-size:80%;'>" + tokenInfo[2].children[1].children[1].children[0].children[0].innerText.trim() + "</span>";
        var holdersCell = row.insertCell(-1);
        holdersCell.innerHTML = holders;
        var totalTrx = "<span style='font-family: monospace,monospace;color: #696969;font-size:80%;'>" + tokenInfo[3].children[1].children[1].innerText.trim() + "</span>";
        var totalTrxCell = row.insertCell(-1);
        totalTrxCell.innerHTML = totalTrx;
    }
})();

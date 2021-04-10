// ==UserScript==
// @name         Tokenfomo.io add some additional data
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  add some additional data to tokenfomo
// @author       kepeto & billyriantono
// @match        https://*.tokenfomo.io
// @icon         https://www.google.com/s2/favicons?domain=tokenfomo.io
// @require      http://code.jquery.com/jquery-latest.js
// ==/UserScript==

(function() {
    'use strict';

    $(document).ready(function() {

    });

    var rows = document.querySelectorAll("body > div > div > main > div > table > tbody > tr");
    console.dir(rows);
})();

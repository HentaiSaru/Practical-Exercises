// ==UserScript==
// @name         Eye Protection
// @version      0.0.1
// @author       HentaiSaru
// @description  透過簡易的設置, 在畫面上層添加護眼濾鏡

// @match        *://*/*
// @icon         https://cdn-icons-png.flaticon.com/512/9498/9498674.png

// @license      MIT
// @namespace    https://greasyfork.org/users/989635

// @run-at       document-body
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand

// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.0/jquery.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/jscolor/2.5.1/jscolor.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.13.2/jquery-ui.min.js
// ==/UserScript==

(function() {
    /* ========== API ========== */
    async function addstyle(Rule, ID="New-Add-Style") {
        let new_style = document.getElementById(ID);
        if (!new_style) {
            new_style = document.createElement("style");
            new_style.id = ID;
            document.head.appendChild(new_style);
        }
        new_style.appendChild(document.createTextNode(Rule));
    }

    async function addscript(Rule, ID="New-Add-script") {
        let new_script = document.getElementById(ID);
        if (!new_script) {
            new_script = document.createElement("script");
            new_script.id = ID;
            document.head.appendChild(new_script);
        }
        new_script.appendChild(document.createTextNode(Rule));
    }

    function GetSettings() {
        let Settings = GM_getValue("Set", null) || [{
            "BC": "rgba(0,0,0,0.3)",
        }];
        return Settings[0];
    }

    /* ========== 使用濾淨 ========== */
    let use = GM_getValue("Use", null) || false, rule;

    if (use) {
        let set = GetSettings();
        addstyle(`
            protection {
                top: 0;
                left: 0;
                margin: 0;
                padding: 0;
                width: 100%;
                height: 100%;
                display: flex;
                z-index: 10000;
                overflow: auto;
                position: fixed;
                pointer-events: none;
                background-color: ${set.BC};
            }
        `, "protection");

        const Mask = `
            <protection></protection>
        `

        $(document.body).append(Mask);
    }

    /* ========== 註冊菜單 ========== */
    const Rules = {
        BC: value => rule[0].style.backgroundColor = value
    };

    GM_registerMenuCommand("設置菜單", function() {
        rule = document.getElementById("New-Add-Style").sheet.cssRules;
        const Menu = ``
    });
})();
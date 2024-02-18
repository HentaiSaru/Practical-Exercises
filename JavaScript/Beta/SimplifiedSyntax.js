// ==UserScript==
// @name         SimplifiedSyntax
// @version      0.0.2
// @author       HentaiSaru
// @description  Simple syntax simplification function

// @connect      *
// @match        *://*/*

// @license      MIT
// @namespace    https://greasyfork.org/users/989635
// ==/UserScript==

class API {
    constructor() {
        this.parser = new DOMParser();
        this.ListenerRecord = new Map();
        this.GM = {
            __verify: val => val !== undefined ? val : null,
            set: function(val, put) {GM_setValue(val, put)},
            get: function(val, call) {return this.__verify(GM_getValue(val, call))},
            setjs: function(val, put) {GM_setValue(val, JSON.stringify(put, null, 4))},
            getjs: function(val, call) {return JSON.parse(this.__verify(GM_getValue(val, call)))},
        };
    }

    $$(Selector, All=false, Source=document) {
        const slice = Selector.slice(1), analyze = [" ", ".", "#", "="].some(m => {return slice.includes(m)}) ? " " : Selector[0];
        switch (analyze) {
            case "#": return Source.getElementById(slice);
            case " ": return All ? Source.querySelectorAll(Selector) : Source.querySelector(Selector);
            case ".": Selector = Source.getElementsByClassName(slice);break;
            default: Selector = Source.getElementsByTagName(Selector);
        }
        return All ? Array.from(Selector) : Selector[0];
    }

    DomParse(html) {
        return this.parser.parseFromString(html, "text/html");
    }

    IllegalCharacters(name) {
        return name.replace(/[\/\?<>\\:\*\|":]/g, "");
    }

    ExtensionName(link) {
        try {
            const match = link.match(/\.([^.]+)$/);
            return match[1].toLowerCase() || "png";
        } catch {return "png"}
    }

    WorkerCreation(code) {
        let blob = new Blob([code], {type: "application/javascript"});
        return new Worker(URL.createObjectURL(blob));
    }

    async AddStyle(Rule, ID="New-Style") {
        let new_style = document.getElementById(ID);
        if (!new_style) {
            new_style = document.createElement("style");
            new_style.id = ID;
            document.head.appendChild(new_style);
        }
        new_style.appendChild(document.createTextNode(Rule));
    }

    async AddScript(Rule, ID="New-Script") {
        let new_script = document.getElementById(ID);
        if (!new_script) {
            new_script = document.createElement("script");
            new_script.id = ID;
            document.head.appendChild(new_script);
        }
        new_script.appendChild(document.createTextNode(Rule));
    }

    async AddListener(element, type, listener, add={}) {
        if (!this.ListenerRecord.has(element) || !this.ListenerRecord.get(element).has(type)) {
            element.addEventListener(type, listener, add);
            if (!this.ListenerRecord.has(element)) {
                this.ListenerRecord.set(element, new Map());
            }
            this.ListenerRecord.get(element).set(type, listener);
        }
    }
    async RemovListener(element, type) {
        if (this.ListenerRecord.has(element) && this.ListenerRecord.get(element).has(type)) {
            const listen = this.ListenerRecord.get(element).get(type);
            element.removeEventListener(type, listen);
            this.ListenerRecord.get(element).delete(type);
        }
    }

    async WaitElem(selector, all, timeout, callback) {
        let timer, element, result;
        const observer = new MutationObserver(() => {
            element = all ? document.querySelectorAll(selector) : document.querySelector(selector);
            result = all ? element.length > 0 : element;
            if (result) {
                observer.disconnect();
                clearTimeout(timer);
                callback(element);
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
        timer = setTimeout(() => {
            observer.disconnect();
        }, (1000 * timeout));
    }
    async WaitMap(selectors, timeout, callback) {
        let timer, elements;
        const observer = new MutationObserver(() => {
            elements = selectors.map(selector => document.querySelector(selector))
            if (elements.every(element => element)) {
                observer.disconnect();
                clearTimeout(timer);
                callback(elements);
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
        timer = setTimeout(() => {
            observer.disconnect();
        }, (1000 * timeout));
    }

    async log(group=null, label="print", type="log") {
        const template = {
            log: label=> console.log(label),
            warn: label=> console.warn(label),
            error: label=> console.error(label),
            count: label=> console.count(label),
        }
        type = typeof type === "string" && template[type] ? type : type = "log";
        if (group == null) {
            template[type](label);
        } else {
            console.groupCollapsed(group);
            template[type](label);
            console.groupEnd();
        }
    }

    store(operate, key, orig=null){
        switch (operate[0]) {
            case "g": return this.GM[operate](key, orig);
            case "s": return orig !== null ? this.GM[operate](key, orig) : null;
            default: return new Error("wrong type of operation");
        }
    }

    async Menu(item) {
        for (const [name, call] of Object.entries(item)) {
            GM_registerMenuCommand(name, ()=> {call()});
        }
    }
}
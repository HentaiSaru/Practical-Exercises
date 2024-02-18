// ==UserScript==
// @name         GrammarSimplified
// @version      2024/02/18
// @author       HentaiSaru
// @description  Simple syntax simplification function

// @connect      *
// @match        *://*/*

// @license      MIT
// @namespace    https://greasyfork.org/users/989635
// ==/UserScript==
class API{constructor(){this.parser=new DOMParser;this.ListenerRecord=new Map;this.GM={__verify:a=>void 0!==a?a:null,set:function(a,c){GM_setValue(a,c)},get:function(a,c){return this.__verify(GM_getValue(a,c))},setjs:function(a,c){GM_setValue(a,JSON.stringify(c,null,4))},getjs:function(a,c){return JSON.parse(this.__verify(GM_getValue(a,c)))}}}$$(a,c=!1,b=document){const e=a.slice(1);switch([" ",".","#","="].some(d=>e.includes(d))?" ":a[0]){case "#":return b.getElementById(e);case " ":return c?b.querySelectorAll(a):
b.querySelector(a);case ".":a=b.getElementsByClassName(e);break;default:a=b.getElementsByTagName(a)}return c?Array.from(a):a[0]}DomParse(a){return this.parser.parseFromString(a,"text/html")}IllegalCharacters(a){return a.replace(/[\/\?<>\\:\*\|":]/g,"")}ExtensionName(a){try{return a.match(/\.([^.]+)$/)[1].toLowerCase()||"png"}catch{return"png"}}WorkerCreation(a){a=new Blob([a],{type:"application/javascript"});return new Worker(URL.createObjectURL(a))}async AddStyle(a,c="New-Style"){let b=document.getElementById(c);
b||(b=document.createElement("style"),b.id=c,document.head.appendChild(b));b.appendChild(document.createTextNode(a))}async AddScript(a,c="New-Script"){let b=document.getElementById(c);b||(b=document.createElement("script"),b.id=c,document.head.appendChild(b));b.appendChild(document.createTextNode(a))}async AddListener(a,c,b,e={}){this.ListenerRecord.has(a)&&this.ListenerRecord.get(a).has(c)||(a.addEventListener(c,b,e),this.ListenerRecord.has(a)||this.ListenerRecord.set(a,new Map),this.ListenerRecord.get(a).set(c,
b))}async RemovListener(a,c){if(this.ListenerRecord.has(a)&&this.ListenerRecord.get(a).has(c)){const b=this.ListenerRecord.get(a).get(c);a.removeEventListener(c,b);this.ListenerRecord.get(a).delete(c)}}async WaitElem(a,c,b,e){let d,f,g;const h=new MutationObserver(()=>{f=c?document.querySelectorAll(a):document.querySelector(a);if(g=c?0<f.length:f)h.disconnect(),clearTimeout(d),e(f)});h.observe(document.body,{childList:!0,subtree:!0});d=setTimeout(()=>{h.disconnect()},1E3*b)}async WaitMap(a,c,b){let e,
d;const f=new MutationObserver(()=>{d=a.map(g=>document.querySelector(g));d.every(g=>g)&&(f.disconnect(),clearTimeout(e),b(d))});f.observe(document.body,{childList:!0,subtree:!0});e=setTimeout(()=>{f.disconnect()},1E3*c)}async log(a=null,c="print",b="log"){const e={log:d=>console.log(d),warn:d=>console.warn(d),error:d=>console.error(d),count:d=>console.count(d)};b="string"===typeof b&&e[b]?b:b="log";if(null==a)e[b](c);else console.groupCollapsed(a),e[b](c),console.groupEnd()}store(a,c,b=null){switch(a[0]){case "g":return this.GM[a](c,
b);case "s":return null!==b?this.GM[a](c,b):null;default:return Error("wrong type of operation")}}async Menu(a){for(const [c,b]of Object.entries(a))GM_registerMenuCommand(c,()=>{b()})}};
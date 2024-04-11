// ==UserScript==
// @name         SyntaxSimplified
// @version      2024/04/11
// @author       Canaan HS
// @description  Library for simplifying code logic and syntax
// @namespace    https://greasyfork.org/users/989635
// @match        *://*/*
// ==/UserScript==
class Syntax{constructor(){this.obMark={};this.ListenerRecord={};this.Parser=new DOMParser;this.Buffer=document.createDocumentFragment();this.print={log:a=>console.log(a),warn:a=>console.warn(a),error:a=>console.error(a),count:a=>console.count(a)};this.query={Match:/[ .#=:]/,"#":(a,b)=>a.getElementById(b.slice(1)),".":(a,b,c)=>{a=a.getElementsByClassName(b.slice(1));return c?Array.from(a):a[0]},tag:(a,b,c)=>{a=a.getElementsByTagName(b);return c?Array.from(a):a[0]},"default":(a,b,c)=>c?a.querySelectorAll(b):a.querySelector(b)};this.StorageMatch={Type:a=>Object.prototype.toString.call(a).slice(8,-1),String:(a,b,c)=>null!=c?(a.setItem(b,JSON.stringify(c)),!0):JSON.parse(b),Number:(a,b,c)=>null!=c?(a.setItem(b,JSON.stringify(c)),!0):Number(b),Array:(a,b,c)=>null!=c?(a.setItem(b,JSON.stringify(c)),!0):(b=JSON.parse(b),Array.isArray(b[0])?new Map(b):b),Object:(a,b,c)=>null!=c?(a.setItem(b,JSON.stringify(c)),!0):JSON.parse(b),Boolean:(a,b,c)=>null!=c?(a.setItem(b,JSON.stringify(c)),!0):JSON.parse(b),Date:(a,b,c)=>null!=c?(a.setItem(b,JSON.stringify(c)),!0):new Date(b),Map:(a,b,c)=>(a.setItem(b,JSON.stringify([...c])),!0)}}$$(a,{all:b=!1,root:c=document}={}){const e=this.query.Match.test(a)?this.query.Match.test(a.slice(1))?"default":a[0]:"tag";return this.query[e](c,a,b)}DomParse(a){return this.Parser.parseFromString(a,"text/html")}NameFilter(a){return a.replace(/[\/\?<>\\:\*\|":]/g,"")}GetFill(a){return Math.max(2,`${a}`.length)}ExtensionName(a){try{return a.match(/\.([^.]+)$/)[1].toLowerCase()||"png"}catch{return"png"}}Mantissa(a,b,c="0",e=null){return e?`${++a}.${this.ExtensionName(e)}`.padStart(b,c):`${++a}`.padStart(b,c)}WorkerCreation(a){a=new Blob([a],{type:"application/javascript"});return new Worker(URL.createObjectURL(a))}sleep(a){return new Promise(b=>setTimeout(b,a))}async AddStyle(a,b="New-Style"){let c=document.getElementById(b);c||(c=document.createElement("style"),c.id=b,document.head.appendChild(c));c.appendChild(document.createTextNode(a))}async AddScript(a,b="New-Script"){let c=document.getElementById(b);c||(c=document.createElement("script"),c.id=b,document.head.appendChild(c));c.appendChild(document.createTextNode(a))}async AddListener(a,b,c,e={}){this.ListenerRecord[a]?.[b]||(a.addEventListener(b,c,e),this.ListenerRecord[a]||(this.ListenerRecord[a]={}),this.ListenerRecord[a][b]=c)}async RemovListener(a,b){const c=this.ListenerRecord[a]?.[b];c&&(a.removeEventListener(b,c),delete this.ListenerRecord[a][b])}async Listen(a,b,c,e={},f=null){try{a.addEventListener(b,c,e),f&&f(!0)}catch{f&&f(!1)}}async Observer(a,b,{mark:c=!1,subtree:e=!0,childList:f=!0,characterData:d=!1}={}){if(c){if(this.obMark[c])return;this.obMark[c]=!0}(new MutationObserver(()=>{b()})).observe(a,{subtree:e,childList:f,characterData:d})}async WaitElem(a,b,c,e,{object:f=document.body,throttle:d=0}={}){let g,h,k;const l=new MutationObserver(this.Throttle(()=>{h=b?document.querySelectorAll(a):document.querySelector(a);if(k=b?0<h.length&&Array.from(h).every(m=>null!==m&&"undefined"!==typeof m):h)l.disconnect(),clearTimeout(g),e(h)},d));l.observe(f,{childList:!0,subtree:!0});g=setTimeout(()=>{l.disconnect();e(h)},1E3*c)}async WaitMap(a,b,c,{object:e=document.body,throttle:f=0}={}){let d,g;const h=new MutationObserver(this.Throttle(()=>{g=a.map(k=>document.querySelector(k));g.every(k=>null!==k&&"undefined"!==typeof k)&&(h.disconnect(),clearTimeout(d),c(g))},f));h.observe(e,{childList:!0,subtree:!0});d=setTimeout(()=>{h.disconnect();c(g)},1E3*b)}async log(a=null,b="print",c="log"){c="string"===typeof c&&this.print[c]?c:c="log";if(null==a)this.print[c](b);else console.groupCollapsed(a),this.print[c](b),console.groupEnd()}Runtime(a=null,b="Elapsed Time:",{style:c="\u001b[1m\u001b[36m%s\u001b[0m",log:e=!0}={}){return a?e?console.log(c,`${b} ${(Date.now()-a)/1E3}s`):Date.now()-a:Date.now()}Debounce(a,b=500){let c=null;return(...e)=>{clearTimeout(c);c=setTimeout(function(){a(...e)},b)}}Throttle(a,b){let c=0;return(...e)=>{const f=Date.now();f-c>=b&&(c=f,a(...e))}}ScopeParsing(a,b){const c=new Set,e=new Set,f=b.length;for(const d of a.split(/\s*,\s*/))if(/^\d+$/.test(d))c.add(Number(d)-1);else if(/^\d+(?:~\d+|-\d+)$/.test(d)){b=d.split(/-|~/);a=Number(b[0]-1);b=Number(b[1]-1);const g=a<=b;for(;g?a<=b:a>=b;g?a++:a--)c.add(a)}else/(!|-)+\d+/.test(d)&&e.add(Number(d.slice(1)-1));return[...c].filter(d=>!e.has(d)&&d<f&&0<=d).sort((d,g)=>d-g).map(d=>obj[d])}Storage(a,{type:b=sessionStorage,value:c=null,error:e}={}){let f;return null!=c?this.StorageMatch[this.StorageMatch.Type(c)](b,a,c):(f=b.getItem(a),void 0!=f?this.StorageMatch[this.StorageMatch.Type(JSON.parse(f))](b,f):e)}store(a,b=null,c=null,e=null){const f={verify:d=>void 0!==d?d:e,de:d=>GM_deleteValue(d),al:()=>f.verify(GM_listValues()),s:(d,g)=>GM_setValue(d,g),g:d=>f.verify(GM_getValue(d)),sj:(d,g)=>GM_setValue(d,JSON.stringify(g,null,4)),gj:d=>JSON.parse(f.verify(GM_getValue(d)))};return f[a](b,c)}async storeListen(a,b){a.forEach(c=>{GM_addValueChangeListener(c,function(e,f,d,g){b({key:e,ov:f,nv:d,far:g})})})}async Menu(a,b="Menu",c=1){for(const [e,f]of Object.entries(a))GM_registerMenuCommand(e,()=>{f.func()},{title:f.desc,id:`${b}-${c++}`,autoClose:f.close,accessKey:f.hotkey})}};
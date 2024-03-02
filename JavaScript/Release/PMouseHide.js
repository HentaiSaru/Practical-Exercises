// ==UserScript==
// @name         Pornhub 滑鼠隱藏
// @name:zh-TW   Pornhub 滑鼠隱藏
// @name:zh-CN   Pornhub 鼠标隐藏
// @name:en      Pornhub Mouse Hide
// @name:ja      Pornhub マウス非表示
// @name:ko      Pornhub 마우스 숨기기
// @version      0.0.2
// @author       HentaiSaru

// @description         在觀看影片時，如果滑鼠停留在影片區域內一段時間，則隱藏滑鼠遊標和進度條，當滑鼠再次移動時將重新顯示。隱藏功能僅在滑鼠位於影片區域內時觸發。
// @description:zh-TW   在觀看影片時，如果滑鼠停留在影片區域內一段時間，則隱藏滑鼠遊標和進度條，當滑鼠再次移動時將重新顯示。隱藏功能僅在滑鼠位於影片區域內時觸發。
// @description:zh-CN   在观看视频时，如果鼠标停留在视频区域内一段时间，将隐藏鼠标游标和进度条，当鼠标再次移动时将重新显示。隐藏功能仅在鼠标位于视频区域内时触发。
// @description:en      When watching a video, if the mouse stays in the video area for a period of time, the mouse cursor and progress bar will be hidden. They will reappear when the mouse moves again. The hiding function is triggered only when the mouse is in the video area.
// @description:ja      ビデオを视听中、マウスが一定时间ビデオ领域内に留まると、マウスカーソルと进行バーが非表示になります。マウスが再度移动すると、再び表示されます。非表示机能は、マウスがビデオ领域内にある场合にのみトリガーされます。
// @description:ko      동영상을 시청하는 동안 마우스가 일정 시간 동안 비디오 영역에 머무르면 마우스 커서와 진행 막대가 숨겨집니다. 마우스가 다시 이동하면 다시 표시됩니다. 숨기기 기능은 마우스가 비디오 영역에 있는 경우에만 트리거됩니다.

// @match        *://*.pornhub.com/view_video.php?viewkey=*
// @match        *://*.pornhubpremium.com/view_video.php?viewkey=*
// @icon         https://ei.phncdn.com/www-static/favicon.ico

// @run-at       document-body

// @license      MIT
// @namespace    https://greasyfork.org/users/989635
// ==/UserScript==
(class a{constructor(){this.ListenerRecord=new Map,this.StyalRules=null,this.Find={video_box:".video-wrapper div",progress_bar:".mgp_seekBar"},this.set={mouse:e=>requestAnimationFrame(()=>{this.StyalRules[0].style.cursor=e}),progress:e=>requestAnimationFrame(()=>{this.StyalRules[1].style.display=e})}}async AddListener(e,t,s,n={}){this.ListenerRecord.has(e)&&this.ListenerRecord.get(e).has(t)||(e.addEventListener(t,s,n),this.ListenerRecord.has(e)||this.ListenerRecord.set(e,new Map),this.ListenerRecord.get(e).set(t,s))}async RemovListener(e,t){var s;this.ListenerRecord.has(e)&&this.ListenerRecord.get(e).has(t)&&(s=this.ListenerRecord.get(e).get(t),e.removeEventListener(t,s),this.ListenerRecord.get(e).delete(t))}async WaitMap(e,t,s){let n,o;const r=new MutationObserver(()=>{(o=e.map(e=>document.querySelector(e))).every(e=>null!==e&&"string")&&(r.disconnect(),clearTimeout(n),s(o))});r.observe(document.body,{childList:!0,subtree:!0}),n=setTimeout(()=>{r.disconnect()},1e3*t)}async AddStyle(e,t="New-Style"){let s=document.getElementById(t);s||((s=document.createElement("style")).id=t,document.head.appendChild(s)),s.appendChild(document.createTextNode(e))}static async HiddenInjection(){const n=new a;let o=!1,r=!1,i;n.AddStyle("body {cursor: default;}.Hidden {display: block;}","Mouse-Hide"),n.WaitMap([n.Find.video_box,n.Find.progress_bar],30,e=>{n.StyalRules=document.getElementById("Mouse-Hide").sheet.cssRules;const[s,t]=e;t.classList.add("Hidden"),n.AddListener(s,"mouseover",()=>{o||async function(e){async function t(){r=!1,clearTimeout(i),n.set.mouse("default"),n.set.progress("block"),i=setTimeout(()=>{r=!0,n.set.mouse("none"),n.set.progress("none")},2200)}o=!0,n.AddListener(s,"pointermove",()=>{200<performance.now()-e&&(t(),e=performance.now())}),n.AddListener(s,"pointerdown",()=>{t()})}(performance.now())},{passive:!0}),n.AddListener(s,"pointerleave",()=>{o&&(o=!1,clearTimeout(i),n.RemovListener(s,"pointerdown"),n.RemovListener(s,"pointermove"))},{passive:!0}),n.AddListener(document,"keydown",e=>{"h"!=(e=e.key.toLowerCase())||r?"h"==e&&r&&(r=!1,n.set.mouse("default"),n.set.progress("block"),i=setTimeout(()=>{r=!0,n.set.mouse("none"),n.set.progress("none")},2200)):(r=!0,n.set.mouse("none"),n.set.progress("none"),clearTimeout(i))},{capture:!0,passive:!0})})}}).HiddenInjection();
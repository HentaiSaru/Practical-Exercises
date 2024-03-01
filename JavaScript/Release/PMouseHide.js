// ==UserScript==
// @name         Pornhub 滑鼠隱藏
// @name:zh-TW   Pornhub 滑鼠隱藏
// @name:zh-CN   Pornhub 鼠标隐藏
// @name:en      Pornhub Mouse Hide
// @name:ja      Pornhub マウス非表示
// @name:ko      Pornhub 마우스 숨기기
// @version      0.0.1
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
(function(){class h{constructor(){this.ListenerRecord=new Map;this.MouseMove=null;this.Find={video_box:".video-wrapper div",progress_bar:".mgp_progressOverflow"}}async AddListener(a,b,d,c={}){this.ListenerRecord.has(a)&&this.ListenerRecord.get(a).has(b)||(a.addEventListener(b,d,c),this.ListenerRecord.has(a)||this.ListenerRecord.set(a,new Map),this.ListenerRecord.get(a).set(b,d))}async RemovListener(a,b){if(this.ListenerRecord.has(a)&&this.ListenerRecord.get(a).has(b)){const d=this.ListenerRecord.get(a).get(b);a.removeEventListener(b,d);this.ListenerRecord.get(a).delete(b)}}async WaitMap(a,b,d){let c,f;const e=new MutationObserver(()=>{f=a.map(g=>document.querySelector(g));f.every(g=>null!==g&&"string")&&(e.disconnect(),clearTimeout(c),d(f))});e.observe(document.body,{childList:!0,subtree:!0});c=setTimeout(()=>{e.disconnect()},1E3*b)}static async HiddenInjection(){const a=new h;a.WaitMap([a.Find.video_box,a.Find.progress_bar],30,b=>{function d(k){function l(){clearTimeout(a.MouseMove);requestAnimationFrame(()=>{f.style.cursor="default";g.style.display="block";a.MouseMove=setTimeout(()=>{f.style.cursor="none";g.style.display="none"},2200)})}c=!0;a.AddListener(e,"mousemove",()=>{100<performance.now()-k&&(k=performance.now(),l())},{passive:!0});a.AddListener(e,"click",()=>{l()},{passive:!0})}let c=!1,f=document.body;const [e,g]=b;a.AddListener(e,"mouseover",()=>{!c&&d(performance.now())},{passive:!0});a.AddListener(e,"mouseleave",()=>{c&&(c=!1,clearTimeout(a.MouseMove),a.RemovListener(document,"mousemove"))},{passive:!0})})}}h.HiddenInjection()})();
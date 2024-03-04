// ==UserScript==
// @name         Pornhub 滑鼠隱藏
// @name:zh-TW   Pornhub 滑鼠隱藏
// @name:zh-CN   Pornhub 鼠标隐藏
// @name:en      Pornhub Mouse Hide
// @name:ja      Pornhub マウス非表示
// @name:ko      Pornhub 마우스 숨기기
// @version      0.0.3
// @author       HentaiSaru

// @description         電腦端滑鼠於影片區塊上停留一段時間，會隱藏滑鼠遊標和進度條，滑鼠再次移動時將重新顯示，收機端在影片區塊向右滑，會觸發影片加速，滑越多加越多最高16倍，放開後恢復正常速度。
// @description:zh-TW   電腦端滑鼠於影片區塊上停留一段時間，會隱藏滑鼠遊標和進度條，滑鼠再次移動時將重新顯示，收機端在影片區塊向右滑，會觸發影片加速，滑越多加越多最高16倍，放開後恢復正常速度。
// @description:zh-CN   电脑端在观看视频时，鼠标停留在视频区域一段时间后，鼠标指针和进度条会被隐藏。当鼠标再次移动时，它们将重新显示。手机端观看视频时，在视频区域向右滑动手指会触发视频加速，滑动越多，加速效果越明显，最高可达16倍。释放手指后，视频将恢复正常速度。
// @description:en      On desktop, when the mouse hovers over the video for a while, the mouse cursor and progress bar will disappear. They will reappear when the mouse moves again. On mobile, swiping right in the video area triggers video acceleration, with more swipes resulting in faster acceleration, up to 16 times. Releasing the finger restores normal playback speed.
// @description:ja      デスクトップでは、マウスが動畫上にしばらく停止すると、マウスカーソルと進行バーが非表示になります。マウスが再度移動すると再表示されます。モバイル端末では、動畫エリアで右にスワイプすると、動畫の加速がトリガーされます。より多くスワイプすると、最大16倍までの加速が得られます。指を離すと、通常の再生速度に戻ります。
// @description:ko      데스크톱에서 비디오를 시청할 때 마우스가 비디오 위에 일정 시간 머물면 마우스 커서와 진행 막대가 숨겨집니다. 마우스가 다시 움직일 때 다시 나타납니다. 휴대폰에서 비디오 영역에서 오른쪽으로 스와이프하면 비디오가 가속됩니다. 스와이프할수록 더 빠른 가속이 발생하며 최대 16 배까지 가능합니다. 손가락을 놓으면 일반 재생 속도로 돌아갑니다.

// @match        *://*.pornhub.com/view_video.php?viewkey=*
// @match        *://*.pornhubpremium.com/view_video.php?viewkey=*
// @icon         https://ei.phncdn.com/www-static/favicon.ico

// @run-at       document-start

// @license      MIT
// @namespace    https://greasyfork.org/users/989635
// ==/UserScript==
(new class{constructor(){this.StyalRules=null,this.ListenerRecord=new Map,this.display=async(e,t)=>{requestAnimationFrame(()=>{this.StyalRules[0].style.cursor=e,this.StyalRules[1].style.display=t})},this.Device={Width:window.innerWidth,Height:window.innerHeight,Agent:navigator.userAgent,_Type:void 0,Type:function(){return this._Type||(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(this.Agent)||this.Width<768?this._Type="Mobile":this._Type="Desktop"),this._Type}},this.throttle=(i,s)=>{let n=0;return function(){var e=arguments,t=Date.now();t-n>=s&&(i.apply(this,e),n=t)}}}async AddListener(e,t,i,s={}){this.ListenerRecord.has(e)&&this.ListenerRecord.get(e).has(t)||(e.addEventListener(t,i,s),this.ListenerRecord.has(e)||this.ListenerRecord.set(e,new Map),this.ListenerRecord.get(e).set(t,i))}async RemovListener(e,t){var i;this.ListenerRecord.has(e)&&this.ListenerRecord.get(e).has(t)&&(i=this.ListenerRecord.get(e).get(t),e.removeEventListener(t,i),this.ListenerRecord.get(e).delete(t))}async WaitMap(e,t,i){let s,n;const o=new MutationObserver(()=>{(n=e.map(e=>document.querySelector(e))).every(e=>null!==e&&"string")&&(o.disconnect(),clearTimeout(s),i(n))});o.observe(document,{childList:!0,subtree:!0}),s=setTimeout(()=>{o.disconnect()},1e3*t)}async AddStyle(e,t="New-Style"){var i=document.createElement("style");i.id=t,document.head.appendChild(i),i.appendChild(document.createTextNode(e))}async Injection(){let r=this,n=r.Device.Type(),o;var e="Desktop"==n?".video-wrapper div":"Mobile"==n?".mgp_videoWrapper":"";r.AddStyle("body {cursor: default;}.Hidden {display: block;}","Mouse-Hide"),r.WaitMap([e,"video.mgp_videoElement",".mgp_seekBar"],30,e=>{const[t,d,i]=e;if("Desktop"==n){async function s(){clearTimeout(o),r.display("default","block"),o=setTimeout(()=>{r.display("none","none")},2100)}r.StyalRules=document.getElementById("Mouse-Hide").sheet.cssRules,i.classList.add("Hidden"),r.AddListener(t,"pointerleave",()=>{r.display("default","block"),clearTimeout(o)},{passive:!0}),r.AddListener(t,"pointermove",r.throttle(()=>{s()},200),{passive:!0}),r.AddListener(t,"pointerdown",()=>{s()},{passive:!0})}else if("Mobile"==n){let i,s,n,o=d.playbackRate;r.AddListener(t,"touchstart",e=>{i=.2*r.Device.Width,s=e.touches[0].clientX},{passive:!0}),r.AddListener(t,"touchmove",r.throttle(t=>{requestAnimationFrame(()=>{var e;(n=t.touches[0].clientX-s)>i&&(e=(n-i)/3,e=(o+.3*e).toPrecision(2),d.playbackRate=Math.min(e,16))})},100),{passive:!0}),r.AddListener(t,"touchend",()=>{d.playbackRate=o},{passive:!0})}})}}).Injection();
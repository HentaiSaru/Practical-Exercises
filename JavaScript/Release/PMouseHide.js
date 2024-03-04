// ==UserScript==
// @name         Pornhub 滑鼠隱藏
// @name:zh-TW   Pornhub 滑鼠隱藏
// @name:zh-CN   Pornhub 鼠标隐藏
// @name:en      Pornhub Mouse Hide
// @name:ja      Pornhub マウス非表示
// @name:ko      Pornhub 마우스 숨기기
// @version      0.0.3
// @author       HentaiSaru

// @description         電腦觀看影片時，如果滑鼠停留在影片區域內一段時間，則隱藏滑鼠遊標和進度條，當滑鼠再次移動時將重新顯示。隱藏功能僅在滑鼠位於影片區域內時觸發。 手機觀看影片時，向右滑動手指可加速影片播放，滑動距離越長，加速效果越明顯，最高可達16倍速。釋放手指後，影片將恢復到原始播放速度。此加速功能僅在觸碰影片區域時生效。
// @description:zh-TW   電腦觀看影片時，如果滑鼠停留在影片區域內一段時間，則隱藏滑鼠遊標和進度條，當滑鼠再次移動時將重新顯示。隱藏功能僅在滑鼠位於影片區域內時觸發。 手機觀看影片時，向右滑動手指可加速影片播放，滑動距離越長，加速效果越明顯，最高可達16倍速。釋放手指後，影片將恢復到原始播放速度。此加速功能僅在觸碰影片區域時生效。
// @description:zh-CN   电脑观看视频时，鼠标停留在视频区域一段时间后，会隐藏鼠标指针和进度条，当鼠标再次移动时会重新显示。隐藏功能仅在鼠标位于视频区域内时触发。手机观看视频时，向右滑动手指可加速视频播放，滑动距离越长，加速效果越明显，最高可达16倍速。松开手指后，视频将恢复到原始播放速度。此加速功能仅在触摸视频区域时生效。
// @description:en      When watching videos on a computer, if the mouse stays within the video area for a while, the mouse cursor and progress bar will be hidden. They will reappear when the mouse moves again. The hiding function is triggered only when the mouse is within the video area. When watching videos on a mobile phone, swiping the finger to the right accelerates video playback. The longer the swipe, the more noticeable the acceleration effect, up to 16 times speed. Upon releasing the finger, the video will return to the original playback speed. This acceleration function only works when touching the video area.
// @description:ja      コンピュータで動畫を視聽している場合、マウスが一定時間動畫領域內に滯在すると、マウスカーソルと進行バーが非表示になります。マウスが再度移動すると再表示されます。非表示機能は、マウスが動畫領域內にある場合にのみトリガーされます。攜帯電話で動畫を視聽している場合、指を右にスワイプすると動畫の再生が加速します。スワイプの長さが長いほど、加速効果がより顕著になり、最大16倍速までです。指を離すと、動畫は元の再生速度に戻ります。この加速機能は、動畫領域に觸れている場合のみ機能します。
// @description:ko      컴퓨터에서 비디오를 시청하는 경우, 마우스가 비디오 영역에 일정 시간 머무를 경우 마우스 커서와 진행 막대가 숨겨집니다. 마우스가 다시 움직이면 다시 표시됩니다. 숨기기 기능은 비디오 영역 내에 마우스가 있을 때만 트리거됩니다. 핸드폰에서 비디오를 시청하는 경우, 손가락을 오른쪽으로 스와이프하면 비디오 재생이 가속화됩니다. 스와이프가 길면 가속 효과가 더욱 뚜렷해지며 최대 16배 속도까지 가능합니다. 손가락을 놓으면 비디오는 원래의 재생 속도로 돌아갑니다. 이 가속 기능은 비디오 영역을 터치할 때만 작동합니다.

// @match        *://*.pornhub.com/view_video.php?viewkey=*
// @match        *://*.pornhubpremium.com/view_video.php?viewkey=*
// @icon         https://ei.phncdn.com/www-static/favicon.ico

// @run-at       document-start

// @license      MIT
// @namespace    https://greasyfork.org/users/989635
// ==/UserScript==
(new class{constructor(){this.StyalRules=null,this.ListenerRecord=new Map,this.display=async(e,t)=>{requestAnimationFrame(()=>{this.StyalRules[0].style.cursor=e,this.StyalRules[1].style.display=t})},this.Device={Width:window.innerWidth,Height:window.innerHeight,Agent:navigator.userAgent,_Type:void 0,Type:function(){return this._Type||(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(this.Agent)||this.Width<768?this._Type="Mobile":this._Type="Desktop"),this._Type}},this.throttle=(i,s)=>{let n=0;return function(){var e=arguments,t=Date.now();t-n>=s&&(i.apply(this,e),n=t)}}}async AddListener(e,t,i,s={}){this.ListenerRecord.has(e)&&this.ListenerRecord.get(e).has(t)||(e.addEventListener(t,i,s),this.ListenerRecord.has(e)||this.ListenerRecord.set(e,new Map),this.ListenerRecord.get(e).set(t,i))}async RemovListener(e,t){var i;this.ListenerRecord.has(e)&&this.ListenerRecord.get(e).has(t)&&(i=this.ListenerRecord.get(e).get(t),e.removeEventListener(t,i),this.ListenerRecord.get(e).delete(t))}async WaitMap(e,t,i){let s,n;const o=new MutationObserver(()=>{(n=e.map(e=>document.querySelector(e))).every(e=>null!==e&&"string")&&(o.disconnect(),clearTimeout(s),i(n))});o.observe(document,{childList:!0,subtree:!0}),s=setTimeout(()=>{o.disconnect()},1e3*t)}async AddStyle(e,t="New-Style"){var i=document.createElement("style");i.id=t,document.head.appendChild(i),i.appendChild(document.createTextNode(e))}async Injection(){let r=this,n=r.Device.Type(),o;var e="Desktop"==n?".video-wrapper div":"Mobile"==n?".mgp_videoWrapper":"";r.AddStyle("body {cursor: default;}.Hidden {display: block;}","Mouse-Hide"),r.WaitMap([e,"video.mgp_videoElement",".mgp_seekBar"],30,e=>{const[t,d,i]=e;if("Desktop"==n){async function s(){clearTimeout(o),r.display("default","block"),o=setTimeout(()=>{r.display("none","none")},2100)}r.StyalRules=document.getElementById("Mouse-Hide").sheet.cssRules,i.classList.add("Hidden"),r.AddListener(t,"pointerleave",()=>{r.display("default","block"),clearTimeout(o)},{passive:!0}),r.AddListener(t,"pointermove",r.throttle(()=>{s()},200),{passive:!0}),r.AddListener(t,"pointerdown",()=>{s()},{passive:!0})}else if("Mobile"==n){let i,s,n,o=d.playbackRate;r.AddListener(t,"touchstart",e=>{i=.2*r.Device.Width,s=e.touches[0].clientX},{passive:!0}),r.AddListener(t,"touchmove",r.throttle(t=>{requestAnimationFrame(()=>{var e;(n=t.touches[0].clientX-s)>i&&(e=(n-i)/3,e=(o+.3*e).toPrecision(2),d.playbackRate=Math.min(e,16))})},100),{passive:!0}),r.AddListener(t,"touchend",()=>{d.playbackRate=o},{passive:!0})}})}}).Injection();
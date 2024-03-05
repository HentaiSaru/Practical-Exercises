// ==UserScript==
// @name         ColaManga 瀏覽增強
// @name:zh-TW   ColaManga 瀏覽增強
// @name:zh-CN   ColaManga 浏览增强
// @name:en      ColaManga Browsing Enhancement
// @version      0.0.7
// @author       HentaiSaru
// @description       隱藏廣告內容，阻止廣告點擊，提昇瀏覽體驗。自訂背景顏色，圖片大小調整。當圖片載入失敗時，自動重新載入圖片。提供熱鍵功能：[← 上一頁]、[下一頁 →]、[↑ 自動上滾動]、[↓ 自動下滾動]。當用戶滾動到頁面底部時，自動跳轉到下一頁。
// @description:zh-TW 隱藏廣告內容，阻止廣告點擊，提昇瀏覽體驗。自訂背景顏色，圖片大小調整。當圖片載入失敗時，自動重新載入圖片。提供熱鍵功能：[← 上一頁]、[下一頁 →]、[↑ 自動上滾動]、[↓ 自動下滾動]。當用戶滾動到頁面底部時，自動跳轉到下一頁。
// @description:zh-CN 隐藏广告内容，阻止广告点击，提昇浏览体验。自定义背景颜色，调整图片大小。当图片载入失败时，自动重新载入图片。提供快捷键功能：[← 上一页]、[下一页 →]、[↑ 自动上滚动]、[↓ 自动下滚动]。当用户滚动到页面底部时，自动跳转到下一页。
// @description:en    Hide advertisement content, block ad clicks, enhance browsing experience. Customize background color, adjust image size. Automatically reload images when they fail to load. Provide shortcut key functionalities: [← Previous Page], [Next Page →], [↑ Auto Scroll Up], [↓ Auto Scroll Down]. Automatically jump to the next page when users scroll to the bottom of the page.

// @match        *://www.colamanga.com/manga-*/*/*.html
// @icon         https://www.colamanga.com/favicon.png

// @license      MIT
// @namespace    https://greasyfork.org/users/989635

// @run-at       document-start
// @grant        GM_setValue
// @grant        GM_getValue
// @require      https://update.greasyfork.org/scripts/487608/1337297/GrammarSimplified.js
// ==/UserScript==

(function() {
/*  只有設置是否使用該功能, 沒有設定參數, 這只是臨時的寫法, 之後會刪除掉
    (0=不使用 | 1=使用 | mode=有些有不同模式 2..3..n)
*/
const Config={
    BlockAd: 1, // 阻擋廣告點擊
    BGColor: 1, // 背景換色 [目前還沒有自訂]
    RegisterHotkey: 3, // 快捷功能 mode: 1=翻頁, 2=翻頁+滾動, 3 翻頁+滾動+換頁繼續滾動
    AutoTurnPage: 2, // 自動換頁 mode: 1=快速, 2=普通, 3=緩慢 [1~3 數字越大需要滾動越下面, 也就是越慢觸發], 4=特殊 (實驗中的酷東西)
};
(new class extends API{constructor(){super();this.ScrollSpeed=2;this.JumpTrigger=!1;this.MangaList=this.BottomStrip=this.PreviousPage=this.NextPage=this.ContentsPage=this.HomePage=this.AdCleanup=this.Body=null;this.Up_scroll=this.Down_scroll=!1;this.Observer_Next=null;this.RecordName=location.pathname.split("/")[1];this.RecordURL=this.store("get",this.RecordName)||document.URL;this.Device={sY:()=>window.scrollY,sX:()=>window.scrollX,Width:()=>window.innerWidth,Height:()=>window.innerHeight,Agent:()=>navigator.userAgent,_Type:void 0,Type:function(){return this._Type||(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(this.Agent())||768>this.Width()?this._Type="Mobile":this._Type="Desktop"),this._Type}};this.Get_Data=async a=>{this.WaitMap(["body","div.mh_readtitle","div.mh_headpager","div.mh_readend a","#mangalist"],20,b=>{var [b,c,d,f,h]=b;this.Body=b;c=this.$$("a",!0,c);this.ContentsPage=c[0].href;this.HomePage=c[1].href;d=this.$$("a.mh_btn:not(.mh_bgcolor)",!0,d);this.PreviousPage=d[0].href;this.NextPage=d[1].href;this.MangaList=h;this.BottomStrip=f;[this.Body,this.ContentsPage,this.HomePage,this.PreviousPage,this.NextPage,this.MangaList,this.BottomStrip].every(g=>g)?a(!0):a(!1)},document)};this.DetectionJumpLink=a=>!a.startsWith("javascript");this.throttle=(a,b)=>{let c=null;return function(){let d=this,f=arguments;null==c&&(c=setTimeout(function(){a.apply(d,f);c=null},b))}};this.throttle_discard=(a,b)=>{let c=0;return function(){var d=arguments,f=Date.now();f-c>=b&&(a.apply(this,d),c=f)}};this.TopDetected=this.throttle_discard(()=>{this.Up_scroll=0!=this.Device.sY()||(this.store("set","scroll",!1),!1)},1E3);this.BottomDetected=this.throttle_discard(()=>{this.Down_scroll=!(this.Device.sY()+this.Device.Height()>=document.documentElement.scrollHeight&&(this.store("set","scroll",!1),1))},1E3);this.scroll=a=>{this.Up_scroll&&0>a?(this.TopDetected(),requestAnimationFrame(()=>{window.scrollBy(0,a);this.scroll(a)})):this.Down_scroll&&0<a&&(this.BottomDetected(),requestAnimationFrame(()=>{window.scrollBy(0,a);this.scroll(a)}))};this.Get_Style=()=>(this.store("get","Style")||[{BG_Color:"#595959",Img_Bw:"auto",Img_Mw:"100%"}])[0];this.ImgStyle=this.Get_Style()}async BlockAds(){let a;this.AdCleanup=setInterval(()=>{(a=this.$$("iframe:not(#Iframe-Comics)"))&&a.remove()},600);"Desktop"==this.Device.Type()?this.AddStyle("body {pointer-events: none;}body iframe, .mh_wrap, .modal-background {pointer-events: auto;}","Inject-Blocking-Ads"):"Mobile"==this.Device.Type()&&(this.AddListener(window,"pointerup",b=>{b.stopImmediatePropagation()},{capture:!0,passive:!0}),this.AddListener(document,"pointerup",b=>{b.stopImmediatePropagation()},{capture:!0,passive:!0}),this.AddListener(window,"click",b=>{b.stopImmediatePropagation()},{capture:!0,passive:!0}),this.AddListener(document,"click",b=>{b.stopImmediatePropagation()},{capture:!0,passive:!0}))}async BackgroundStyle(){this.Body.style.backgroundColor=this.ImgStyle.BG_Color}async PictureStyle(){"Desktop"==this.Device.Type()&&this.AddStyle(`.mh_comicpic img {vertical-align: top;cursor: pointer;display: block;margin: auto;width: ${this.ImgStyle.Img_Bw};max-width: ${this.ImgStyle.Img_Mw};}`,"Inject-Image-Style");this.AutoReload()}async AutoReload(){try{let a=new MouseEvent("click",{bubbles:!0,cancelable:!0});const b=new IntersectionObserver(c=>{c.forEach(d=>{d.isIntersecting&&d.target.dispatchEvent(a)})},{threshold:.3});this.$$("span.mh_btn:not(.contact)",!0,this.MangaList).forEach(c=>{b.observe(c)})}catch{}}async Hotkey_Switch(a){if("Desktop"==this.Device.Type()){3==a&&(this.Down_scroll=this.store("get","scroll"),this.scroll(this.ScrollSpeed));const b=-1*this.ScrollSpeed;this.AddListener(document,"keydown",c=>{var d=c.key;"ArrowLeft"!=d||this.JumpTrigger?"ArrowRight"!=d||this.JumpTrigger?"ArrowUp"==d&&2<=a?(c.preventDefault(),this.Up_scroll?this.Up_scroll=!1:this.Up_scroll&&!this.Down_scroll||(this.Down_scroll=!1,this.Up_scroll=!0,this.scroll(b))):"ArrowDown"==d&&2<=a&&(c.preventDefault(),this.Down_scroll?(this.Down_scroll=!1,this.store("set","scroll",!1)):!this.Up_scroll&&this.Down_scroll||(this.Up_scroll=!1,this.Down_scroll=!0,this.store("set","scroll",!0),this.scroll(this.ScrollSpeed))):(this.JumpTrigger=!!this.DetectionJumpLink(this.NextPage),location.assign(this.NextPage)):(this.JumpTrigger=!!this.DetectionJumpLink(this.PreviousPage),location.assign(this.PreviousPage))},{capture:!0})}else if("Mobile"==this.Device.Type()){const b=.35*this.Device.Width(),c=this.Device.Height()/4*.2;let d,f,h,g;this.AddListener(this.MangaList,"touchstart",e=>{d=e.touches[0].clientX;f=e.touches[0].clientY},{passive:!0});this.AddListener(this.MangaList,"touchmove",this.throttle(e=>{requestAnimationFrame(()=>{h=e.touches[0].clientX-d;g=e.touches[0].clientY-f;Math.abs(g)<c&&(h>b&&!this.JumpTrigger?(this.JumpTrigger=!!this.DetectionJumpLink(this.PreviousPage),location.assign(this.PreviousPage)):h<-b&&!this.JumpTrigger&&(this.JumpTrigger=!!this.DetectionJumpLink(this.NextPage),location.assign(this.NextPage)))})},200),{passive:!0})}}async Automatic_Next(a){const b=this,c=b.$$("img",!0,b.MangaList),d=c.length,[f,h]=[c[Math.floor(.95*d)],c[Math.floor(.75*d)]];let g,e;switch(b.Observer_Next=new IntersectionObserver(k=>{k.forEach(l=>{l.isIntersecting&&(f.src||h.src)&&(b.Observer_Next.disconnect(),b.DetectionJumpLink(b.NextPage))&&location.assign(b.NextPage)})},{threshold:g}),a){case 2:g=.5;e=b.$$("li:nth-child(3) a.read_page_link");break;case 3:g=1;e=b.$$("div.endtip2.clear");break;case 4:b.$$(".mh_wrap.tc").style.display="none";this.SpecialPageTurning();break;default:g=.1,e=b.BottomStrip}4!=a&&b.Observer_Next.observe(e)}async SpecialPageTurning(){const a=this,b=a.$$("img",!0,a.MangaList),c=b.length,[d,f]=[b[Math.floor(.95*c)],b[Math.floor(.75*c)]];a.Observer_Next=new IntersectionObserver(h=>{h.forEach(g=>{g.isIntersecting&&(d.src||f.src)&&(a.Observer_Next.disconnect(),a.DetectionJumpLink(a.NextPage))&&async function(){a.AddStyle("#Iframe-Comics {border: none;width: 100%;}");a.$$(".mh_readend").style.display="none";a.$$(".mh_footpager").style.display="none";a.$$(".fed-foot-info.fed-part-layout.fed-back-whits").style.display="none";let e=document.createElement("iframe");requestAnimationFrame(()=>{e.id="Iframe-Comics";e.src=a.NextPage;document.body.appendChild(e)});let k;e.onload=function(){(k=e.contentWindow.document).body.style.overflow="hidden";e.style.height="10000px"};GM_setValue(a.RecordName,a.NextPage);setInterval(()=>{requestAnimationFrame(()=>{e.style.height=k.body.scrollHeight+"px"})},3E3)}()})},{threshold:.5});a.Observer_Next.observe(d)}async Injection(){try{this.RecordURL!=document.URL&&(GM_setValue(this.RecordName,""),location.assign(this.RecordURL)),0<Config.BlockAd&&this.BlockAds(),this.Get_Data(a=>{a&&(0<Config.BGColor&&this.BackgroundStyle(),this.PictureStyle(),0<Config.RegisterHotkey&&this.Hotkey_Switch(Config.RegisterHotkey),0<Config.AutoTurnPage)&&this.Automatic_Next(Config.AutoTurnPage)})}catch(a){this.log(null,a)}}}).Injection();
})();
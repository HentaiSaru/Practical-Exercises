// ==UserScript==
// @name         ColaManga 瀏覽增強
// @name:zh-TW   ColaManga 瀏覽增強
// @name:zh-CN   ColaManga 浏览增强
// @name:en      ColaManga Browsing Enhancement
// @version      0.0.1
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
// @grant        GM_getValue
// @require      https://update.greasyfork.org/scripts/487608/1333587/GrammarSimplified.js
// ==/UserScript==
(function(){class e extends API{constructor(){super();this.Observer_Next=this.Rotation_Down=this.Rotation_Up=this.Interval=this.BottomStrip=this.NextPage=this.PreviousPage=this.HomePage=this.ContentsPage=null;this.Get_Data=()=>{const a=this.$$("a",!0,this.$$("div.mh_readtitle")),b=this.$$("a.mh_prevbook",!0,this.$$("div.mh_headpager"));this.BottomStrip=this.$$("div.mh_readend");this.ContentsPage=a[0].href;this.HomePage=a[1].href;this.PreviousPage=b[0].href;this.NextPage=b[1].href;return[this.ContentsPage,this.HomePage,this.PreviousPage,this.NextPage].every(c=>c)};this.RegisterRotation=(a,b,c)=>a=setInterval(()=>{window.scrollBy(0,b)},c);this.CleanRotation=a=>{clearInterval(a);return null};this.Get_Style=()=>(this.store("get","Style")||[{BG_Color:"#595959",Img_Bw:"auto",Img_Mw:"100%"}])[0];this.ImgStyle=this.Get_Style()}async BlockAds(){this.Interval=setInterval(()=>{const a=this.$$("iframe");a&&a.remove()},1E3);this.AddStyle("body {pointer-events: none;}body .mh_wrap,.modal-background {pointer-events: auto;}","Inject-Blocking-Ads")}async BackgroundStyle(){document.body.style.backgroundColor=this.ImgStyle.BG_Color}async PictureStyle(){this.WaitElem("#mangalist",!1,10,a=>{this.AddStyle(`.mh_comicpic img {vertical-align: top;cursor: pointer;display: block;margin: auto;width: ${this.ImgStyle.Img_Bw};max-width: ${this.ImgStyle.Img_Mw};}`,"Inject-Image-Style");this.AutoReload(a)})}async AutoReload(a){try{let b,c=new MouseEvent("click",{bubbles:!0,cancelable:!0});(new MutationObserver(()=>{(b=this.$$("span.mh_btn:not(.contact)",!1,a))&&b.dispatchEvent(c)})).observe(a,{childList:!0,subtree:!0})}catch{}}async Hotkey_Switch(a){a&&this.AddListener(document,"keydown",b=>{b=b.key;"ArrowLeft"==b?location.assign(this.PreviousPage):"ArrowRight"==b?location.assign(this.NextPage):"ArrowUp"==b?(this.Rotation_Down=this.Rotation_Down&&this.CleanRotation(this.Rotation_Down),this.Rotation_Up=this.Rotation_Up?this.CleanRotation(this.Rotation_Up):this.RegisterRotation(this.Rotation_Up,-3,6)):"ArrowDown"==b&&(this.Rotation_Up=this.Rotation_Up&&this.CleanRotation(this.Rotation_Up),this.Rotation_Down=this.Rotation_Down?this.CleanRotation(this.Rotation_Down):this.RegisterRotation(this.Rotation_Down,3,6))},{capture:!0,passive:!0})}async Automatic_Next(a){if(a){const b=this;b.Observer_Next=new IntersectionObserver(c=>{c.forEach(d=>{d.isIntersecting&&(d=b.$$("#mangalist img",!0),d[d.length-8].src&&location.assign(b.NextPage))})},{threshold:.4});b.Observer_Next.observe(b.BottomStrip)}}async Injection(){try{this.BlockAds();this.BackgroundStyle();this.PictureStyle();const a=this.Get_Data();this.Hotkey_Switch(a);setTimeout(()=>{this.Automatic_Next(a)},1E4)}catch{location.reload()}}}(new e).Injection()})();
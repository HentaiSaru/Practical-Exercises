// ==UserScript==
// @name         YouTube Hide Tool
// @name:zh-TW   YouTube 隱藏工具
// @name:zh-CN   YouTube 隐藏工具
// @name:ja      YouTube 非表示ツール
// @name:ko      유튜브 숨기기 도구
// @name:en      Youtube Hide Tool
// @version      0.0.30
// @author       HentaiSaru
// @description         該腳本能夠自動隱藏 YouTube 影片結尾的推薦卡，當滑鼠懸浮於影片上方時，推薦卡會恢復顯示。並額外提供快捷鍵切換功能，可隱藏留言區、影片推薦、功能列表，及切換至極簡模式。設置會自動保存，並在下次開啟影片時自動套用。
// @description:zh-TW   該腳本能夠自動隱藏 YouTube 影片結尾的推薦卡，當滑鼠懸浮於影片上方時，推薦卡會恢復顯示。並額外提供快捷鍵切換功能，可隱藏留言區、影片推薦、功能列表，及切換至極簡模式。設置會自動保存，並在下次開啟影片時自動套用。
// @description:zh-CN   该脚本能够自动隐藏 YouTube 视频结尾的推荐卡，在鼠标悬停于视频上方时，推荐卡会恢复显示。并额外提供快捷键切换功能，可隐藏评论区、视频推荐、功能列表，并切换至极简模式。设置会自动保存，并在下次打开视频时自动应用。
// @description:ja      このスクリプトは、YouTube动画の终わりに表示される推奨カードを自动的に非表示にし、マウスがビデオ上にホバーされると、推奨カードが再表示されます。さらに、ショートカットキーでコメントセクション、动画の推奨、机能リストを非表示に切り替える机能が追加されており、シンプルモードに切り替えることもできます。设定は自动的に保存され、次回ビデオを开くと自动的に适用されます。
// @description:ko      이 스크립트는 YouTube 동영상 끝에 나오는 추천 카드를 자동으로 숨기고, 마우스가 비디오 위에 머무를 때 추천 카드가 다시 나타납니다. 또한, 댓글 섹션, 비디오 추천, 기능 목록을 숨기고 최소 모드로 전환하는 단축키를 제공합니다. 설정은 자동으로 저장되며, 다음 비디오를 열 때 자동으로 적용됩니다.
// @description:en      This script automatically hides the recommended cards at the end of YouTube videos. When the mouse hovers over the video, the recommended cards will reappear. Additionally, it provides shortcut keys to toggle the comment section, video recommendations, feature list, and switch to a minimalist mode. Settings are automatically saved and applied the next time the video is opened.

// @match        *://www.youtube.com/*
// @icon         https://cdn-icons-png.flaticon.com/512/1383/1383260.png

// @license      MIT
// @namespace    https://greasyfork.org/users/989635

// @run-at       document-start
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @grant        GM_addValueChangeListener

// @require      https://update.greasyfork.org/scripts/487608/1358741/SyntaxSimplified.js
// ==/UserScript==
(function(){function q(a){let h={"zh-TW":["\ud83d\udcdc \u9810\u8a2d\u71b1\u9375","@ \u529f\u80fd\u5931\u6548\u6642 [\u8acb\u91cd\u65b0\u6574\u7406] =>\n\n(Alt + 1)\uff1a\u96b1\u85cf\u63a8\u85a6\u64ad\u653e\n(Alt + 2)\uff1a\u96b1\u85cf\u7559\u8a00\u5340\n(Alt + 3)\uff1a\u96b1\u85cf\u529f\u80fd\u5217\u8868\n(Alt + 4)\uff1a\u96b1\u85cf\u64ad\u653e\u6e05\u55ae\u8cc7\u8a0a\n(Alt + T)\uff1a\u96b1\u85cf\u6a19\u984c\u6587\u5b57\n(Ctrl + Z)\uff1a\u4f7f\u7528\u6975\u7c21\u5316"],"zh-CN":["\ud83d\udcdc \u9884\u8bbe\u70ed\u952e","@ \u529f\u80fd\u5931\u6548\u65f6 [\u8bf7\u91cd\u65b0\u6574\u7406] =>\n\n(Alt + 1)\uff1a\u9690\u85cf\u63a8\u8350\u64ad\u653e\n(Alt + 2)\uff1a\u9690\u85cf\u8bc4\u8bba\u533a\n(Alt + 3)\uff1a\u9690\u85cf\u529f\u80fd\u5217\u8868\n(Alt + 4)\uff1a\u9690\u85cf\u64ad\u653e\u6e05\u5355\u8d44\u8baf\n(Alt + T)\uff1a\u9690\u85cf\u6807\u9898\u6587\u5b57\n(Ctrl + Z)\uff1a\u4f7f\u7528\u6781\u7b80\u5316"],ja:["\ud83d\udcdc \u30c7\u30d5\u30a9\u30eb\u30c8\u30db\u30c3\u30c8\u30ad\u30fc","@ \u673a\u80fd\u304c\u65e0\u52b9\u306b\u306a\u3063\u305f\u573a\u5408 [\u30da\u30fc\u30b8\u3092\u66f4\u65b0\u3057\u3066\u304f\u3060\u3055\u3044] =>\n\n(Alt + 1)\uff1a\u304a\u3059\u3059\u3081\u518d\u751f\u3092\u975e\u8868\u793a\u306b\u3059\u308b\n(Alt + 2)\uff1a\u30b3\u30e1\u30f3\u30c8\u30a8\u30ea\u30a2\u3092\u975e\u8868\u793a\u306b\u3059\u308b\n(Alt + 3)\uff1a\u673a\u80fd\u30ea\u30b9\u30c8\u3092\u975e\u8868\u793a\u306b\u3059\u308b\n(Alt + 4)\uff1a\u30d7\u30ec\u30a4\u30ea\u30b9\u30c8\u60c5\u62a5\u3092\u975e\u8868\u793a\u306b\u3059\u308b\n(Alt + T)\uff1a\u30bf\u30a4\u30c8\u30eb\u6587\u5b57\u3092\u96a0\u3059\n(Ctrl + Z)\uff1a\u30b7\u30f3\u30d7\u30eb\u5316\u3092\u4f7f\u7528\u3059\u308b"],"en-US":["\ud83d\udcdc Default Hotkeys","@ If functionalities fail [Please refresh] =>\n\n(Alt + 1)\uff1aHide recommended playback\n(Alt + 2)\uff1aHide comments section\n(Alt + 3)\uff1aHide feature list\n(Alt + 4)\uff1aHide playlist info\n(Alt + T)\uff1aHide Title Text\n(Ctrl + Z)\uff1aUse Simplification"],ko:["\ud83d\udcdc \uae30\ubcf8 \ub2e8\ucd95\ud0a4","@ \uae30\ub2a5\uc774 \uc791\ub3d9\ud558\uc9c0 \uc54a\uc744 \ub54c [\uc0c8\ub85c \uace0\uce68\ud558\uc138\uc694] =>\n\n(Alt + 1)\uff1a\ucd94\ucc9c \uc7ac\uc0dd \uc228\uae30\uae30\n(Alt + 2)\uff1a\ub313\uae00 \uc601\uc5ed \uc228\uae30\uae30\n(Alt + 3)\uff1a\uae30\ub2a5 \ubaa9\ub85d \uc228\uae30\uae30\n(Alt + 4)\uff1a\uc7ac\uc0dd \ubaa9\ub85d \uc815\ubcf4 \uc228\uae30\uae30\n(Alt + T)\uff1a\uc81c\ubaa9 \ud14d\uc2a4\ud2b8 \uc228\uae30\uae30\n(Ctrl + Z)\uff1a\uac04\uc18c\ud654 \uc0ac\uc6a9"]};return h[a]||h["en-US"]}class r extends Syntax{constructor(a,h){super();this.HK=a;this.Con=h;this.Dev=!1;this.Language=q(navigator.language);this.Video=/^(https?:\/\/)www\.youtube\.com\/watch\?v=.+$/;this.Playlist=/^(https?:\/\/)www\.youtube\.com\/playlist\?list=.+$/;this.StartTime=this.Register=null;this.Transform=!1;this.HideJudgment=async(d,c=null)=>{"none"==d.style.display||this.Transform?(d.style.display="block",c&&this.store("s",c,!1)):(d.style.display="none",c&&this.store("s",c,!0))};this.StyleConverter=async(d,c,g,k=null)=>{d.forEach(e=>{e.style[c]=g});if(k)return new Promise(e=>{e(d.every(m=>m.style[c]==g))})};this.SetAttri=async(d,c)=>{document.body.setAttribute(d,c)}}async Injection(){const a=new MutationObserver(this.Throttle(()=>{const h=document.URL;this.Video.test(h)&&!document.body.hasAttribute("Video-Tool-Injection")&&this.$$("div#columns")?(this.Dev&&(this.StartTime=this.Runtime()),this.SetAttri("Video-Tool-Injection",!0),null==this.Register&&(this.Register=GM_registerMenuCommand(this.Language[0],()=>{alert(this.Language[1])})),this.$$("#Video-Tool-Hide")||this.AddStyle(".ytp-ce-element {display: none !important;}#player.ytd-watch-flexy:hover .ytp-ce-element {display: block !important;}.ytp-show-tiles .ytp-videowall-still {cursor: pointer;}\n","Video-Tool-Hide"),this.WaitMap("title #end #below #secondary.style-scope.ytd-watch-flexy #secondary-inner #related #comments #actions".split(" "),20,d=>{let [c,g,k,e,m,f,n,p]=d;const l=new MutationObserver(()=>{"..."!=document.title&&(document.title="...")});this.store("g","Minimalist")?(this.StyleConverter([document.body],"overflow","hidden"),this.StyleConverter([g,k,e,f],"display","none",this.Dev).then(b=>{b&&this.log("\u6975\u7c21\u5316",this.Runtime(this.StartTime))})):(this.store("g","Title")&&(l.observe(c,{childList:!0,subtree:!1}),this.Dev&&this.log("\u96b1\u85cf\u6a19\u984c",this.Runtime(this.StartTime)),document.title="..."),this.store("g","RecomViewing")&&this.StyleConverter([e,f],"display","none",this.Dev).then(b=>{b&&this.log("\u96b1\u85cf\u63a8\u85a6\u89c0\u770b",this.Runtime(this.StartTime))}),this.store("g","Comment")&&this.StyleConverter([n],"display","none",this.Dev).then(b=>{b&&this.log("\u96b1\u85cf\u7559\u8a00\u5340",this.Runtime(this.StartTime))}),this.store("g","FunctionBar")&&this.StyleConverter([p],"display","none",this.Dev).then(b=>{b&&this.log("\u96b1\u85cf\u529f\u80fd\u9078\u9805",this.Runtime(this.StartTime))}));this.RemovListener(document,"keydown");this.AddListener(document,"keydown",b=>{this.HK.MinimaList(b)?(b.preventDefault(),this.store("g","Minimalist")?(this.store("s","Minimalist",!1),this.StyleConverter([document.body],"overflow","auto"),this.StyleConverter([g,k,e,f],"display","block")):(this.store("s","Minimalist",!0),this.StyleConverter([document.body],"overflow","hidden"),this.StyleConverter([g,k,e,f],"display","none"))):this.HK.Title(b)?(b.preventDefault(),document.title="..."==document.title?(l.disconnect(),this.store("s","Title",!1),this.$$("h1 [dir='auto']").textContent):(l.observe(c,{childList:!0,subtree:!1}),this.store("s","Title",!0),"...")):this.HK.RecomViewing(b)?(b.preventDefault(),1<m.childElementCount?(this.HideJudgment(e),this.HideJudgment(f,"RecomViewing"),this.Transform=!1):(this.HideJudgment(f,"RecomViewing"),this.Transform=!0)):this.HK.Comment(b)?(b.preventDefault(),this.HideJudgment(n,"Comment")):this.HK.FunctionBar(b)&&(b.preventDefault(),this.HideJudgment(p,"FunctionBar"))},{capture:!0});this.Con.GlobalChange&&this.storeListen(["Minimalist","Title","RecomViewing","Comment","FunctionBar"],b=>{if(b.far)switch(b.Key){case "Minimalist":b.nv?(this.StyleConverter([document.body],"overflow","hidden"),this.StyleConverter([g,k,e,f],"display","none")):(this.StyleConverter([document.body],"overflow","auto"),this.StyleConverter([g,k,e,f],"display","block"));break;case "Title":document.title=b.nv?(l.observe(c,{childList:!0,subtree:!1}),"..."):(l.disconnect(),this.$$("h1 [dir='auto']").textContent);break;case "RecomViewing":1<m.childElementCount?(this.HideJudgment(e),this.HideJudgment(f),this.Transform=!1):(this.HideJudgment(f),this.Transform=!0);break;case "Comment":this.HideJudgment(n);break;case "FunctionBar":this.HideJudgment(p)}})},{throttle:200})):this.Playlist.test(h)&&!document.body.hasAttribute("Playlist-Tool-Injection")&&this.$$("div#contents")&&(this.Dev&&(this.StartTime=this.Runtime()),this.SetAttri("Playlist-Tool-Injection",!0),null==this.Register&&(this.Register=GM_registerMenuCommand(this.Language[0],()=>{alert(this.Language[1])})),this.WaitElem("ytd-playlist-header-renderer.style-scope.ytd-browse",!1,20,d=>{this.store("g","ListDesc")&&this.StyleConverter([d],"display","none",this.Dev).then(c=>{c&&this.log("\u96b1\u85cf\u64ad\u653e\u6e05\u55ae\u8cc7\u8a0a",this.Runtime(this.StartTime))});this.RemovListener(document,"keydown");this.AddListener(document,"keydown",c=>{this.HK.ListDesc(c)&&(c.preventDefault(),this.HideJudgment(d,"ListDesc"))})},{throttle:200}))},600));this.AddListener(document,"DOMContentLoaded",()=>{a.observe(document,{childList:!0,characterData:!0,subtree:!0})},{once:!0})}}
(new r({
    Title: k => k.altKey && k.key == "t", // 標題
    MinimaList: k => k.ctrlKey && k.key == "z", // 極簡化
    RecomViewing: k => k.altKey && k.key == "1", // 推薦觀看
    Comment: k => k.altKey && k.key == "2", // 留言區
    FunctionBar: k => k.altKey && k.key == "3", // 功能區
    ListDesc: k => k.altKey && k.key == "4" // 播放清單資訊
},{
    GlobalChange: true, // 全局同時修改

})).Injection()})();
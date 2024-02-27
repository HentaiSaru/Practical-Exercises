// ==UserScript==
// @name         Youtube Hide Tool
// @name:zh-TW   Youtube 隱藏工具
// @name:zh-CN   Youtube 隐藏工具
// @name:ja      Youtube 非表示ツール
// @name:ko      유튜브 숨기기 도구
// @name:en      Youtube Hide Tool
// @name:de      Youtube Versteckwerkzeug
// @name:pt      Ferramenta de Ocultação do Youtube
// @name:es      Herramienta de Ocultación de Youtube
// @name:fr      Outil de Masquage de Youtube
// @name:hi      यूट्यूब छुपाने का उपकरण
// @name:id      Alat Sembunyikan Youtube
// @version      0.0.25
// @author       HentaiSaru
// @description         快捷隱藏 YouTube 留言區、相關推薦、影片結尾推薦和設置選單
// @description:zh-TW   快捷隱藏 YouTube 留言區、相關推薦、影片結尾推薦和設置選單
// @description:zh-CN   快捷隐藏 YouTube 评论区、相关推荐、视频结尾推荐和设置菜单
// @description:ja      YouTubeのコメント欄、関連おすすめ、動画の最後のおすすめ、設定メニューを素早く非表示にする
// @description:ko      빠른 YouTube 댓글 영역, 관련 추천, 비디오 끝 추천 및 설정 메뉴 숨기기
// @description:en      Quickly hide YouTube comments, related recommendations, video end recommendations, and settings menu
// @description:de      Schnell verstecken YouTube Kommentare, verwandte Empfehlungen, Video-Ende-Empfehlungen und Einstellungsmenü
// @description:pt      Ocultar rapidamente comentários do YouTube, recomendações relacionadas, recomendações de final de vídeo e menu de configurações
// @description:es      Ocultar rápidamente comentarios de YouTube, recomendaciones relacionadas, recomendaciones de final de video y menú de configuración
// @description:fr      Masquer rapidement les commentaires de YouTube, les recommandations connexes, les recommandations de fin de vidéo et le menu des paramètres
// @description:hi      यूट्यूब टिप्पणियाँ, संबंधित सिफारिशें, वीडियो के अंत की सिफारिशें और सेटिंग्स मेनू को त्वरित रूप से छुपाएं
// @description:id      Sembunyikan cepat komentar YouTube, rekomendasi terkait, rekomendasi akhir video, dan menu pengaturan

// @match        *://www.youtube.com/*
// @icon         https://cdn-icons-png.flaticon.com/512/1383/1383260.png

// @license      MIT
// @namespace    https://greasyfork.org/users/989635

// @run-at       document-start
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @grant        GM_registerMenuCommand

// @require      https://update.greasyfork.org/scripts/487608/1333587/GrammarSimplified.js
// ==/UserScript==
(function(){function n(a){let b={"zh-TW":["\ud83d\udcdc \u8a2d\u7f6e\u5feb\u6377","@ \u529f\u80fd\u5931\u6548\u6642 [\u8acb\u91cd\u65b0\u6574\u7406] =>\n\n    (Shift) : \u5b8c\u5168\u96b1\u85cf\u5f71\u7247\u5c3e\u90e8\u63a8\u85a6\n    (Alt + 1) : \u96b1\u85cf\u53f3\u5074\u5f71\u7247\u63a8\u85a6\n    (Alt + 2) : \u96b1\u85cf\u7559\u8a00\u5340\n    (Alt + 3) : \u96b1\u85cf\u529f\u80fd\u9078\u9805\n    (Alt + 4) : \u96b1\u85cf\u64ad\u653e\u6e05\u55ae\u8cc7\u8a0a\n    (Ctrl + Z) : \u4f7f\u7528\u6975\u7c21\u5316"],"zh-CN":["\ud83d\udcdc \u8bbe\u7f6e\u5feb\u6377","@ \u529f\u80fd\u5931\u6548\u65f6 [\u8bf7\u91cd\u65b0\u5237\u65b0] =>\n    (Shift) : \u5168\u90e8\u9690\u85cf\u89c6\u9891\u5c3e\u90e8\u63a8\u8350\n    (Alt + 1) : \u9690\u85cf\u53f3\u4fa7\u89c6\u9891\u63a8\u8350\n    (Alt + 2) : \u9690\u85cf\u8bc4\u8bba\u533a\n    (Alt + 3) : \u9690\u85cf\u529f\u80fd\u9009\u9879\n    (Alt + 4) : \u9690\u85cf\u64ad\u653e\u5217\u8868\u4fe1\u606f\n    (Ctrl + Z) : \u4f7f\u7528\u6781\u7b80\u5316"],ja:["\ud83d\udcdc \u8a2d\u5b9a\u30b7\u30e7\u30fc\u30c8\u30ab\u30c3\u30c8","@ \u6a5f\u80fd\u304c\u7121\u52b9\u306b\u306a\u3063\u305f\u5834\u5408 [\u518d\u8aad\u307f\u8fbc\u307f\u3057\u3066\u304f\u3060\u3055\u3044] =>\n    (Shift) : \u52d5\u753b\u306e\u6700\u5f8c\u306e\u304a\u3059\u3059\u3081\u3092\u5b8c\u5168\u306b\u975e\u8868\u793a\u306b\u3059\u308b\n    (Alt + 1) : \u53f3\u5074\u306e\u52d5\u753b\u304a\u3059\u3059\u3081\u3092\u975e\u8868\u793a\u306b\u3059\u308b\n    (Alt + 2) : \u30b3\u30e1\u30f3\u30c8\u6b04\u3092\u975e\u8868\u793a\u306b\u3059\u308b\n    (Alt + 3) : \u6a5f\u80fd\u30aa\u30d7\u30b7\u30e7\u30f3\u3092\u975e\u8868\u793a\u306b\u3059\u308b\n    (Alt + 4) : \u30d7\u30ec\u30a4\u30ea\u30b9\u30c8\u60c5\u5831\u3092\u975e\u8868\u793a\u306b\u3059\u308b\n    (Ctrl + Z) : \u7c21\u7d20\u5316\u3092\u4f7f\u7528\u3059\u308b"],"en-US":["\ud83d\udcdc Settings Shortcut","@ When function fails [Please refresh] =>\n    (Shift) : Fully hide video end recommendations\n    (Alt + 1) : Hide right side video recommendations\n    (Alt + 2) : Hide comments section\n    (Alt + 3) : Hide function options\n    (Alt + 4) : Hide playlist information\n    (Ctrl + Z) : Use minimalism"],ko:["\ud83d\udcdc \uc124\uc815 \ubc14\ub85c \uac00\uae30","@ \uae30\ub2a5\uc774 \uc2e4\ud328\ud558\uba74 [\uc0c8\ub85c \uace0\uce68\ud558\uc138\uc694] =>\n    (Shift) : \ube44\ub514\uc624 \ub05d \ucd94\ucc9c\uc744 \uc644\uc804\ud788 \uc228\uae30\uae30\n    (Alt + 1) : \uc624\ub978\ucabd \ube44\ub514\uc624 \ucd94\ucc9c \uc228\uae30\uae30\n    (Alt + 2) : \ub313\uae00 \uc139\uc158 \uc228\uae30\uae30\n    (Alt + 3) : \uae30\ub2a5 \uc635\uc158 \uc228\uae30\uae30\n    (Alt + 4) : \uc7ac\uc0dd \ubaa9\ub85d \uc815\ubcf4 \uc228\uae30\uae30\n    (Ctrl + Z) : \ubbf8\ub2c8\uba40\ub9ac\uc998 \uc0ac\uc6a9\ud558\uae30"]};return b[a]||b["en-US"]}class p extends API{constructor(a){super();this.HK=a;this.Dev=!1;this.Language=n(navigator.language);this.Video=/^(https?:\/\/)www\.youtube\.com\/watch\?v=.+$/;this.Playlist=/^(https?:\/\/)www\.youtube\.com\/playlist\?list=.+$/;this.Register=null;this.Transform=!1;this.SetTrigger=async b=>{b.style.display="none";return new Promise(c=>{"none"==b.style.display?c(!0):c(!1)})};this.HideJudgment=async(b,c=null)=>{"none"===b.style.display||this.Transform?(b.style.display="block",null!=c?GM_setValue(c,!1):null):(b.style.display="none",null!=c?GM_setValue(c,!0):null)};this.SetAttri=async(b,c)=>{document.body.setAttribute(b,c)}}async Injection(){(new MutationObserver(()=>{const a=document.URL;this.Video.test(a)&&!document.body.hasAttribute("Video-Tool-Injection")?(this.SetAttri("Video-Tool-Injection",!0),null==this.Register&&(this.Register=GM_registerMenuCommand(this.Language[0],()=>{alert(this.Language[1])})),this.$$("#Video-Tool-Hide")||this.AddStyle(".ytp-ce-element{opacity: 0.1 !important;}.ytp-ce-element:hover{opacity:1 !important;transition: opacity 0.3s ease;}","Video-Tool-Hide"),this.WaitMap("#end #below #secondary #secondary-inner #related #chat-container #comments #actions".split(" "),10,b=>{const [c,h,f,q,e,k,l,m]=b;this.store("get","Minimalist")?Promise.all([this.SetTrigger(c),this.SetTrigger(h),this.SetTrigger(f),this.SetTrigger(e)]).then(d=>{d.every(g=>g)&&this.Dev?this.log("\u6975\u7c21\u5316",!0):null}):(this.store("get","RecomViewing")&&Promise.all([this.SetTrigger(k),this.SetTrigger(f),this.SetTrigger(e)]).then(d=>{d.every(g=>g)&&this.Dev?this.log("\u96b1\u85cf\u63a8\u85a6\u89c0\u770b",!0):null}),this.store("get","Comment")&&this.SetTrigger(l).then(()=>{this.Dev?this.log("\u96b1\u85cf\u7559\u8a00\u5340",!0):null}),this.store("get","FunctionBar")&&this.SetTrigger(m).then(()=>{this.Dev?this.log("\u96b1\u85cf\u529f\u80fd\u9078\u9805",!0):null}));this.RemovListener(document,"keydown");this.AddListener(document,"keydown",d=>{this.HK.MinimaList(d)?(d.preventDefault(),this.store("get","Minimalist")?(c.style.display="block",h.style.display="block",f.style.display="block",e.style.display="block",GM_setValue("Minimalist",!1)):(c.style.display="none",h.style.display="none",f.style.display="none",e.style.display="none",GM_setValue("Minimalist",!0))):this.HK.RecomCard(d)?(d.preventDefault(),this.$$(".ytp-ce-element, .ytp-ce-covering",!0).forEach(g=>{this.HideJudgment(g)})):this.HK.RecomViewing(d)?(d.preventDefault(),1<q.childElementCount?(this.HideJudgment(k),this.HideJudgment(f),this.HideJudgment(e,"RecomViewing"),this.Transform=!1):(this.HideJudgment(k),this.HideJudgment(e,"RecomViewing"),this.Transform=!0)):this.HK.Comment(d)?(d.preventDefault(),this.HideJudgment(l,"Comment")):this.HK.FunctionBar(d)&&(d.preventDefault(),this.HideJudgment(m,"FunctionBar"))})})):this.Playlist.test(a)&&!document.body.hasAttribute("Playlist-Tool-Injection")&&(this.SetAttri("Playlist-Tool-Injection",!0),null==this.Register&&(this.Register=GM_registerMenuCommand(this.Language[0],()=>{alert(this.Language[1])})),this.WaitElem("ytd-playlist-header-renderer.style-scope.ytd-browse",!1,8,b=>{this.store("get","ListDesc")&&this.SetTrigger(b).then(()=>{this.Dev?this.log("\u96b1\u85cf\u64ad\u653e\u6e05\u55ae\u8cc7\u8a0a",!0):null});this.RemovListener(document,"keydown");this.AddListener(document,"keydown",c=>{this.HK.ListDesc(c)&&(c.preventDefault(),this.HideJudgment(b,"ListDesc"))})}))})).observe(document.head,{childList:!0,subtree:!0})}}
(new p({
    /* 快捷鍵設置 */
    RecomCard:a=> a.shiftKey, // 影片結尾推薦卡
    MinimaList:a=> a.ctrlKey && a.key == "z" , // 極簡化
    RecomViewing:a=>a.altKey && a.key == "1" , // 推薦觀看
    Comment:a=>a.altKey && a.key == "2" , // 留言區
    FunctionBar:a=>a.altKey && a.key == "3" , // 功能區
    ListDesc:a=>a.altKey && a.key == "4" // 播放清單資訊
})).Injection()})();
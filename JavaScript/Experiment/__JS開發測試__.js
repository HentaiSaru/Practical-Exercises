// ==UserScript==
// @name         Kemer 增強
// @name:zh-TW   Kemer 增強
// @name:zh-CN   Kemer 增强
// @name:ja      Kemer 強化
// @name:en      Kemer Enhancement
// @version      0.0.44
// @author       HentaiSaru
// @description        側邊欄收縮美化界面 , 自動加載原圖 , 簡易隱藏廣告 , 瀏覽翻頁優化 , 自動開新分頁 , 影片區塊優化 , 底部添加下一頁與回到頂部按鈕
// @description:zh-TW  側邊欄收縮美化界面 , 自動加載原圖 , 簡易隱藏廣告 , 瀏覽翻頁優化 , 自動開新分頁 , 影片區塊優化 , 底部添加下一頁與回到頂部按鈕
// @description:zh-CN  侧边栏收缩美化界面 , 自动加载原图 , 简易隐藏广告 , 浏览翻页优化 , 自动开新分页 , 影片区块优化 , 底部添加下一页与回到顶部按钮
// @description:ja     サイドバーを縮小してインターフェースを美しくし、オリジナル画像を自動的に読み込み、広告を簡単に非表示にし、ページの閲覧とページめくりを最適化し、新しいページを自動的に開き、ビデオセクションを最適化し、下部に「次のページ」と「トップに戻る」ボタンを追加し。
// @description:en     Collapse the sidebar to beautify the interface, automatically load original images, easily hide ads, optimize page browsing and flipping, automatically open new pages, optimize the video section, add next page and back to top buttons at the bottom.

// @match        *://kemono.su/*
// @match        *://coomer.su/*
// @match        *://*.kemono.su/*
// @match        *://*.coomer.su/*

// @icon         https://cdn-icons-png.flaticon.com/512/2566/2566449.png

// @license      MIT
// @namespace    https://greasyfork.org/users/989635

// @run-at       document-start
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_openInTab
// @grant        GM_addElement
// @grant        GM_xmlhttpRequest
// @grant        GM_getResourceText
// @grant        GM_registerMenuCommand

// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.13.2/jquery-ui.min.js
// @require      https://update.greasyfork.org/scripts/487608/1331914/GrammarSimplified.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js
// @resource     font-awesome https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/svg-with-js.min.css
// ==/UserScript==

(function () {
    /* (0 = false | 1 = true) */
    const Global={ /* 全域功能 */
        SidebarCollapse: 1, // 側邊攔摺疊
        DeleteNotice: 1,    // 刪除上方公告
        BlockAds: 1         // 封鎖廣告
    }, Preview={ /* 預覽帖子頁面 */
        QuickPostToggle: 1, // 快速切換帖子
        NewTabOpens: 1,     // 以新分頁開啟
        CardText: 1,        // 預覽卡文字效果 [1 = 隱藏文字 , 2 = 淡化文字]
        CardZoom: 1,        // 縮放預覽卡大小
    }, Content={ /* 帖子內容頁面 */
        TextToLink: 1,      // 將內容文字的, 連結文本轉換成超連結
        LinkSimplified: 1,  // 將下載連結簡化
        OriginalImage: 1,   // 自動原圖 [1 = 快速自動 , 2 = 慢速自動 , 3 = 觀察後觸發]
        VideoBeautify: 1,   // 影片美化 [1 = 複製節點 , 2 = 移動節點]
        CommentFormat: 1,   // 評論區樣式
        ExtraButton: 1,     // 額外的下方按鈕

    }, api = new API();

    class Global_Function {
        /* 收縮側邊攔 */
        async SidebarCollapse() {
            api.AddStyle(`
                .global-sidebar {
                    opacity: 0;
                    height: 100%;
                    width: 10rem;
                    display: flex;
                    position: fixed;
                    padding: 0.5em 0;
                    transition: 0.8s;
                    background: #282a2e;
                    flex-direction: column;
                    transform: translateX(-9rem);
                }
                .global-sidebar:hover {
                    opacity: 1;
                    transform: translateX(0rem);
                }
                .content-wrapper.shifted {
                    transition: 0.7s;
                    margin-left: 0rem;
                }
                .global-sidebar:hover + .content-wrapper.shifted {
                    margin-left: 10rem;
                }
            `, "Effects");
        }

        /* 刪除公告通知 */
        async DeleteNotice() {
            const Notice = api.$$("body > div.content-wrapper.shifted > a");
            Notice ? Notice.remove() : null;
        }

        /* (阻止/封鎖)廣告 */
        async BlockAds() {
            api.AddStyle(`.ad-container, .root--ujvuu {display: none}`, "Ad-blocking-style");
            api.AddScript(`
                const Ad_observer = new MutationObserver(() => {
                    try {
                        document.querySelectorAll(".ad-container").forEach(ad => {ad.remove()});
                        document.querySelector(".root--ujvuu button").click();
                    } catch {}
                    let XMLRequest = XMLHttpRequest.prototype.open;
                    XMLHttpRequest.prototype.open = function(method, url) {
                        if (url.endsWith(".m3u8") || url === "https://s.magsrv.com/v1/api.php") {
                            return;
                        }
                        XMLRequest.apply(this, arguments);
                    };
                });
    
                try {
                    Ad_observer.observe(document.body, {childList: true, subtree: true});
                } catch {}
            `, "Ad-blocking-script");
        }
    }

    class Preview_Function {
        /* 帖子預覽卡縮放 */
        async CardZoom() {
            api.AddStyle(`
                * { --card-size: 12vw; }
            `, "Effects");
        }
    }

    class Content_Function {

    }

    class Enhance {
        constructor(url) {
            this.url = url;
            this.GF = new Global_Function();
            this.PF = new Preview_Function();
            this.CF = new Content_Function();
            this.DmsPage = /^(https?:\/\/)?(www\.)?.+\/dms\/?(\?.*)?$/;
            this.PostsPage = /^(https?:\/\/)?(www\.)?.+\/posts\/?(\?.*)?$/;
            this.UserPage = /^(https?:\/\/)?(www\.)?.+\/.+\/user\/[^\/]+(\?.*)?$/;
            this.ContentPage = /^(https?:\/\/)?(www\.)?.+\/.+\/user\/.+\/post\/.+$/;
            this.M1 = () => {return this.ContentPage.test(this.url)}
            this.M3 = () => {return this.PostsPage.test(this.url) || this.UserPage.test(this.url) || this.DmsPage.test(this.url)}
            this.USE = (Select, FuncName) => {Select > 0 ? FuncName(Select) : null}
        }

        async Run() {
            const Call = {
                SidebarCollapse: s=> this.USE(s, this.GF.SidebarCollapse),
                DeleteNotice: s=> this.USE(s, this.GF.DeleteNotice),
                BlockAds: s=> this.USE(s, this.GF.BlockAds),

                QuickPostToggle: s=> this.USE(s, this.PF.QuickPostToggle),
                NewTabOpens: s=> this.USE(s, this.PF.NewTabOpens),
                CardText: s=> this.USE(s, this.PF.CardText),
                CardZoom: s=> this.USE(s, this.PF.CardZoom),

                TextToLink: s=> this.USE(s, this.CF.TextToLink),
                LinkSimplified: s=> this.USE(s, this.CF.LinkSimplified),
                OriginalImage: s=> this.USE(s, this.CF.OriginalImage),
                VideoBeautify: s=> this.USE(s, this.CF.VideoBeautify),
                CommentFormat: s=> this.USE(s, this.CF.CommentFormat),
                ExtraButton: s=> this.USE(s, this.CF.ExtraButton)
            }

            Object.entries(Global).forEach(([func, set]) => Call[func](set));
            if (this.M3()) {Object.entries(Preview).forEach(([func, set]) => Call[func](set))}
            else if (this.M1()) {
                Object.entries(Content).forEach(([func, set]) => Call[func](set))
            }
        }
    }

    const enhance = new Enhance(document.URL);
    enhance.Run();
})();
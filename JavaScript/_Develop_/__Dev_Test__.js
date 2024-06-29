// ==UserScript==
// @name         Kemer 增強
// @name:zh-TW   Kemer 增強
// @name:zh-CN   Kemer 增强
// @name:ja      Kemer 強化
// @name:en      Kemer Enhancement
// @version      0.0.48
// @author       Canaan HS
// @description        美化介面和重新排版，包括移除廣告和多餘的橫幅，修正繪師名稱和編輯相關的資訊保存，自動載入原始圖像，菜單設置圖像大小間距，快捷鍵觸發自動滾動，解析文本中的連結並轉換為可點擊的連結，快速的頁面切換和跳轉功能，並重新定向到新分頁
// @description:zh-TW  美化介面和重新排版，包括移除廣告和多餘的橫幅，修正繪師名稱和編輯相關的資訊保存，自動載入原始圖像，菜單設置圖像大小間距，快捷鍵觸發自動滾動，解析文本中的連結並轉換為可點擊的連結，快速的頁面切換和跳轉功能，並重新定向到新分頁
// @description:zh-CN  美化界面和重新排版，包括移除广告和多余的横幅，修正画师名称和编辑相关的资讯保存，自动载入原始图像，菜单设置图像大小间距，快捷键触发自动滚动，解析文本中的链接并转换为可点击的链接，快速的页面切换和跳转功能，并重新定向到新分頁
// @description:ja     インターフェイスの美化と再配置、広告や余分なバナーの削除、イラストレーター名の修正と関連情報の保存の編集、オリジナル画像の自動読み込み、メニューでの画像のサイズと間隔の設定、ショートカットキーによる自動スクロールのトリガー、テキスト内のリンクの解析とクリック可能なリンクへの変換、高速なページ切り替えとジャンプ機能、新しいタブへのリダイレクト
// @description:en     Beautify the interface and re-layout, including removing ads and redundant banners, correcting artist names and editing related information retention, automatically loading original images, setting image size and spacing in the menu, triggering automatic scrolling with hotkeys, parsing links in the text and converting them to clickable links, fast page switching and jumping functions, and redirecting to a new tab

// @match        *://kemono.su/*
// @match        *://coomer.su/*
// @match        *://*.kemono.su/*
// @match        *://*.coomer.su/*

// @icon         https://cdn-icons-png.flaticon.com/512/2566/2566449.png

// @license      MIT
// @namespace    https://greasyfork.org/users/989635

// @run-at       document-end
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_openInTab
// @grant        GM_addElement
// @grant        GM_getResourceURL
// @grant        GM_xmlhttpRequest
// @grant        GM_getResourceText
// @grant        GM_registerMenuCommand
// @grant        GM_addValueChangeListener

// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.13.3/jquery-ui.min.js
// @require      https://update.greasyfork.org/scripts/495339/1382008/ObjectSyntax_min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js

// @resource     loading https://cdnjs.cloudflare.com/ajax/libs/lightbox2/2.11.3/images/loading.gif
// @resource     font-awesome https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/svg-with-js.min.css
// ==/UserScript==

(function () {
    const User_Config = {
        Global_Page: {
            BlockAds: {mode: 0, enable: true}, // 阻擋廣告
            FixArtist: {mode: 0, enable: true}, // 修復作者名稱
            BackToTop: {mode: 0, enable: true}, // 翻頁後回到頂部
            KeyScroll: {mode: 1, enable: true}, // 上下鍵觸發自動滾動 [mode: 1 = 動畫偵滾動, mode: 2 = 間隔滾動] (選擇對於自己較順暢的, coomer 無效他被阻止了)
            TextToLink: {mode: 0, enable: true}, // 連結的 (文本 -> 超連結)
            DeleteNotice: {mode: 0, enable: true}, // 刪除上方公告
            SidebarCollapse: {mode: 0, enable: true}, // 側邊攔摺疊
        },
        Preview_Page: {
            CardZoom: {mode: 2, enable: true}, // 縮放預覽卡大小 [mode: 1 = 卡片放大 , 2 = 卡片放大 + 懸浮縮放]
            CardText: {mode: 2, enable: true}, // 預覽卡文字效果 [mode: 1 = 隱藏文字 , 2 = 淡化文字]
            NewTabOpens: {mode: 0, enable: true}, // 預覽頁面的帖子都以新分頁開啟
            QuickPostToggle: {mode: 0, enable: true} // 快速切換帖子
        },
        Content_Page: {
            ExtraButton: {mode: 0, enable: true}, // 額外的下方按鈕
            LinkBeautify: {mode: 0, enable: true}, // 下載連結美化, 當出現 (browse »), 滑鼠懸浮會直接顯示內容
            CommentFormat: {mode: 0, enable: true}, // 評論區重新排版
            VideoBeautify: {mode: 1, enable: true}, // 影片美化 [mode: 1 = 複製節點 , 2 = 移動節點]
            OriginalImage: {mode: 1, enable: true}, // 自動原圖 [mode: 1 = 快速自動 , 2 = 慢速自動 , 3 = 觀察後觸發]
        }
    };

    /* ==================== 依賴項目 ==================== */
    const Url = Syn.Device.Url;
    const DLL = (() => {
        // 頁面正則
        const Posts = /^(https?:\/\/)?(www\.)?.+\/posts\/?.*$/;
        const Search = /^(https?:\/\/)?(www\.)?.+\/artists\/?.*$/;
        const User = /^(https?:\/\/)?(www\.)?.+\/.+\/user\/[^\/]+(\?.*)?$/;
        const Content = /^(https?:\/\/)?(www\.)?.+\/.+\/user\/.+\/post\/.+$/;
        const Favor = /^(https?:\/\/)?(www\.)?.+\/favorites\?type=post\/?.*$/;
        const Link = /^(https?:\/\/)?(www\.)?.+\/.+\/user\/[^\/]+\/links\/?.*$/;
        const FavorArtist = /^(https?:\/\/)?(www\.)?.+\/favorites(?:\?(?!type=post).*)?$/;
        const Announcement = /^(https?:\/\/)?(www\.)?.+\/(dms|(?:.+\/user\/[^\/]+\/announcements))(\?.*)?$/;

        // 展示語言
        const Display_Lang = {
            Traditional: {
                RM_01: "📝 設置選單",
                MT_01: "設置菜單", MO_01: "圖像設置",
                MB_01: "讀取設定", MB_02: "關閉離開", MB_03: "保存應用",
                ML_01: "語言", ML_02: "英文", ML_03: "繁體", ML_04: "簡體", ML_05: "日文",
                MIS_01: "圖片高度", MIS_02: "圖片寬度", MIS_03: "圖片最大寬度", MIS_04: "圖片間隔高度"
            },
            Simplified: {
                RM_01:"📝 设置菜单",
                MT_01:"设置菜单", MO_01:"图像设置",
                MB_01:"读取设置", MB_02:"关闭退出", MB_03:"保存应用",
                ML_01:"语言", ML_02:"英文", ML_03:"繁体", ML_04:"简体", ML_05:"日文",
                MIS_01:"图片高度", MIS_02:"图片宽度", MIS_03:"图片最大宽度", MIS_04:"图片间隔高度"
            },
            Japan: {
                RM_01:"📝 設定メニュー",
                MT_01:"設定メニュー", MO_01:"画像設定",
                MB_01:"設定の読み込み", MB_02:"閉じて終了する", MB_03:"保存して適用する",
                ML_01:"言語", ML_02:"英語", ML_03:"繁体字", ML_04:"簡体字", ML_05:"日本語",
                MIS_01:"画像の高さ", MIS_02:"画像の幅", MIS_03:"画像の最大幅", MIS_04:"画像の間隔の高さ"
            },
            English: {
                RM_01:"📝 Settings Menu",
                MT_01:"Settings Menu", MO_01:"Image Settings",
                MB_01:"Load Settings", MB_02:"Close and Exit", MB_03:"Save and Apply",
                ML_01:"Language", ML_02:"English", ML_03:"Traditional Chinese", ML_04:"Simplified Chinese", ML_05:"Japanese",
                MIS_01:"Image Height", MIS_02:"Image Width", MIS_03:"Maximum Image Width", MIS_04:"Image Spacing Height"
            }
        }, Match = {
            "zh-TW": Display_Lang.Traditional, "zh-HK": Display_Lang.Traditional, "zh-MO": Display_Lang.Traditional,
            "zh-CN": Display_Lang.Simplified, "zh-SG": Display_Lang.Simplified,
            "en-US": Display_Lang.English, "ja": Display_Lang.Japan,
        };

        // 所需樣式 (需要傳入顏色的, 就是需要動態適應顏色變化)
        let Style_Pointer;
        const Style = {
            Global: async (Color) => { // 全域 修復所需
                Syn.AddStyle(`
                    /* 搜尋頁面的樣式 */
                    fix_tag:hover { color: ${Color}; }
                    .fancy-image__image, fix_name, fix_tag, fix_edit {
                        cursor: pointer;
                    }
                    .user-card__info {
                        display: flex;
                        flex-direction: column;
                        align-items: flex-start;
                    }
                    fix_name {
                        color: #fff;
                        font-size: 28px;
                        font-weight: 500;
                        max-width: 320px;
                        overflow: hidden;
                        padding: .25rem .1rem;
                        border-radius: .25rem;
                        white-space: nowrap;
                        text-overflow: ellipsis;
                    }
                    .edit_artist {
                        position: absolute;
                        top: 36%;
                        right: 8%;
                        color: #fff;
                        display: none;
                        font-size: 14px;
                        font-weight: 700;
                        background: #666;
                        white-space: nowrap;
                        padding: .25rem .5rem;
                        border-radius: .25rem;
                        transform: translateY(-100%);
                    }
                    .edit_textarea {
                        color: #fff;
                        display: block;
                        font-size: 30px;
                        padding: 6px 1px;
                        line-height: 5vh;
                        text-align: center;
                    }
                    .user-card:hover .edit_artist {
                        display: block;
                    }
                    .user-card:hover fix_name {
                        background-color: ${Color};
                    }
                    .edit_textarea ~ fix_name,
                    .edit_textarea ~ .edit_artist {
                        display: none !important;
                    }

                    /* 預覽頁面的樣式 */
                    fix_view {
                        display: flex;
                        flex-flow: wrap;
                        align-items: center;
                    }
                    fix_view fix_name {
                        font-size: 2rem;
                        font-weight: 700;
                        padding: .25rem 3rem;
                        border-radius: .25rem;
                        transition: background-color 0.3s ease;
                    }
                    fix_view .edit_artist {
                        top: 40%;
                        right: 5%;
                        transform: translateY(-80%);
                    }
                    fix_view:hover fix_name {
                        background-color: ${Color};
                    }
                    fix_view:hover .edit_artist {
                        display: block;
                    }

                    /* 內容頁面的樣式 */
                    fix_cont {
                        display: flex;
                        justify-content: space-around;
                    }
                    fix_cont fix_name {
                        color: ${Color};
                        font-size: 1.25em;
                        display: inline-block;
                    }
                    fix_cont .edit_artist {
                        top: 95%;
                        right: -10%;
                    }
                    fix_cont:hover fix_name {
                        background-color: #fff;
                    }
                    fix_cont:hover .edit_artist {
                        display: block;
                    }
                `, "Global-Effects");
            },
            Preview: async () => { // 帖子預覽頁所需
                Syn.AddStyle(`
                    .gif-overlay {
                        top: 45%;
                        left: 50%;
                        width: 60%;
                        height: 60%;
                        opacity: 0.5;
                        z-index: 9999;
                        position: absolute;
                        border-radius: 50%;
                        background-size: contain;
                        background-position: center;
                        background-repeat: no-repeat;
                        transform: translate(-50%, -50%);
                        background-image: url("${GM_getResourceURL('loading')}");
                    }
                    .card-list__items {
                        gap: 0.5em;
                        display: flex;
                        grid-gap: 0.5em;
                        position: relative;
                        align-items: var(--local-align);
                        flex-flow: var(--local-flex-flow);
                        justify-content: var(--local-justify);
                    }
                `, "Preview-Effects");
            },
            Postview: () => { // 觀看帖子頁所需
                const settings = {
                    MenuSet: () => {
                        const data = Syn.Store("g", "MenuSet") ?? [{
                            MT: "2vh",
                            ML: "50vw"
                        }];
                        return data[0];
                    },
                    ImgSet: () => {
                        const data = Syn.Store("g", "ImgSet") ?? [{
                            img_h: "auto",
                            img_w: "auto",
                            img_mw: "100%",
                            img_gap: "0px"
                        }];
                        return data[0];
                    }
                };

                // 讀取圖像設置
                const cache = settings.ImgSet();
                const width = Syn.Device.iW() / 2;
                Syn.AddStyle(`
                    .Image-style {
                        display: block;
                        width: ${cache.img_w};
                        height: ${cache.img_h};
                        margin: ${cache.img_gap} auto;
                        max-width: ${cache.img_mw};
                    }
                    .Image-loading-indicator {
                        min-width: 50vW;
                        min-height: 50vh;
                        max-width: ${width}px;
                        max-height: ${width * 9 / 16}px;
                        border: 1px solid #fafafa;
                    }
                    .Image-loading-indicator:hover {
                        cursor: pointer;
                    }
                `, "Custom-style");

                return settings;
            },
            Awesome: async (Color) => { // 觀看帖子頁圖示
                Syn.AddStyle(`
                    ${GM_getResourceText("font-awesome")}
                    #next_box a {
                        cursor: pointer;
                    }
                    #next_box a:hover {
                        background-color: ${Color};
                    }
            `, "font-awesome");
            }
        };

        return {
            IsContent: Content.test(Url),
            IsAnnouncement: Announcement.test(Url),
            IsSearch: Search.test(Url) || Link.test(Url) || FavorArtist.test(Url),
            IsAllPreview: Posts.test(Url) || User.test(Url) || Favor.test(Url),

            Language: (lang) => Match[lang] || Match["en-US"],
            Color: Syn.Device.Host.startsWith("coomer") ? "#99ddff !important" : "#e8a17d !important",
            Style, Posts, Search, User, Content, Favor, FavorArtist, Link, Announcement,
        };
    })();

    /* ==================== 全域功能 ==================== */
    function Global_Function() {
        return {
            SidebarCollapse: async (Mode) => { /* 收縮側邊攔 */
                if (Syn.Device.Type() === "Mobile") return;

                Syn.AddStyle(`
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
                    .global-sidebar:hover {opacity: 1; transform: translateX(0rem);}
                    .content-wrapper.shifted {transition: 0.7s; margin-left: 0rem;}
                    .global-sidebar:hover + .content-wrapper.shifted {margin-left: 10rem;}
                `, "Effects");
            },
            DeleteNotice: async (Mode) => { /* 刪除公告通知 */
                Syn.$$("body > div.content-wrapper.shifted > a")?.remove();
            },
            BlockAds: async (Mode) => { /* (阻止/封鎖)廣告 */
                Syn.AddStyle(`
                    .ipprtcnt, .root--ujvuu, .ad-container {display: none !important}
                `, "Ad-blocking-style");
                Syn.AddScript(`
                    const XMLRequest = XMLHttpRequest.prototype.open;
                    const Ad_observer = new MutationObserver(() => {
                        XMLHttpRequest.prototype.open = function(method, Url) {
                            if (Url.endsWith(".m3u8") || Url === "https://s.magsrv.com/v1/Syn.php") {return}
                            XMLRequest.apply(this, arguments);
                        };
                        document.querySelector("div.ex-over-btn")?.click();
                        document.querySelector(".root--ujvuu button")?.click();
                        document.querySelectorAll(".ad-container").forEach(ad => {ad.remove()});
                    });
                    Ad_observer.observe(document.head, {childList: true, subtree: true});
                `, "Ad-blocking-script");
            },
            TextToLink: async (Mode) => { /* 連結文本轉連結 */
                if (!DLL.IsContent && !DLL.IsAnnouncement) return;

                const Protocol_F = /^(?!https?:\/\/)/;
                const Exclusion_F = /onfanbokkusuokibalab\.net/;
                const URL_F = /(?:https?:\/\/[^\s]+)|(?:[a-zA-Z0-9]+\.)?(?:[a-zA-Z0-9]+)\.[^\s]+\/[^\s]+/g;
                let Text;

                if (DLL.IsContent) {
                    Syn.WaitElem("div.post__body", body => {
                        JumpTrigger(body);

                        const article = Syn.$$("article", {root: body});
                        const content = Syn.$$("div.post__content", {root: body});

                        if (article) {
                            Syn.$$("span.choice-text", {all: true, root: article}).forEach(span => {
                                Analysis(span, span.textContent)
                            });
                        } else if (content) {
                            const pre = Syn.$$("pre", {root: content});

                            if (pre) { // 單一個 Pre 標籤的狀態
                                Text = pre.textContent;
                                URL_F.test(Text) && Analysis(pre, Text);
                            } else {
                                Syn.$$("p", {all: true, root: content}).forEach(p=> {
                                    Text = p.textContent;
                                    URL_F.test(Text) && Analysis(p, Text);
                                })

                                Syn.$$("a", {all: true, root: content}).forEach(a=> {
                                    !a.href && Analysis(a, a.textContent);
                                })
                            }
                        }
                    }, {throttle: 600});

                } else if (DLL.IsAnnouncement) {
                    Syn.WaitElem("div.card-list__items pre", content => {
                        JumpTrigger(Syn.$$("div.card-list__items"));

                        content.forEach(pre=> {
                            if (pre.childNodes.length > 1) {
                                Syn.$$("p", {all: true, root: pre}).forEach(p=> {
                                    Text = p.textContent;
                                    URL_F.test(Text) && Analysis(p, Text);
                                })

                                Syn.$$("a", {all: true, root: pre}).forEach(a=> {
                                    !a.href && Analysis(a, a.textContent);
                                })

                            } else {
                                Text = pre.textContent;
                                URL_F.test(Text) && Analysis(pre, Text);
                            }
                        })
                    }, {raf: true, all: true});
                }

                async function JumpTrigger(root) { // 將該區塊的所有 a 觸發跳轉, 改成開新分頁
                    Syn.AddListener(root, "click", event => {
                        const target = event.target.closest("a:not(.fileThumb)");
                        target && (event.preventDefault(), GM_openInTab(target.href, { active: false }));
                    }, {capture: true});
                }

                async function Analysis(father, text) { // 解析後轉換網址
                    if (!Exclusion_F.test(text)) {
                        father.innerHTML = text.replace(URL_F, url => {
                            const decode = decodeURIComponent(url).trim();
                            return `<a href="${decode.replace(Protocol_F, "https://")}">${decode}</a>`;
                        })
                    }
                }
            },
            FixArtist: async (Mode) => { /* 修復藝術家名稱 */
                DLL.Style.Global(DLL.Color); // 載入依賴樣式

                const Fix_Requ = { // 宣告修復需要的函數
                    Get_Record: () => Syn.Storage("fix_record_v2", { type: localStorage, error: new Map() }),
                    Save_Record: async function (save) {
                        await Syn.Storage("fix_record_v2",
                            {
                                type: localStorage,
                                value: new Map([...this.Get_Record(), ...save]) // 取得完整數據並合併
                            }
                        );
                        Fix_Cache.clear();
                    },
                    Save_Work: Syn.Debounce(() => { // 保存工作
                        Fix_Requ.Save_Record(Fix_Cache);
                    }, 1000),
                    Fix_Name_Support: new Set(["pixiv", "fanbox"]),
                    Fix_Tag_Support: {
                        ID: /Patreon|Fantia|Pixiv|Fanbox/gi,
                        Patreon: "https://www.patreon.com/user?u={id}",
                        Fantia: "https://fantia.jp/fanclubs/{id}/posts",
                        Pixiv: "https://www.pixiv.net/users/{id}/artworks",
                        Fanbox: "https://www.pixiv.net/fanbox/creator/{id}",
                    
                        NAME: /Fansly|OnlyFans/gi,
                        OnlyFans: "https://onlyfans.com/{name}",
                        Fansly: "https://fansly.com/{name}/posts",
                    },
                    Fix_Request: async function (url, headers={}) { // 請求修復數據
                        return new Promise(resolve => {
                            GM_xmlhttpRequest({
                                method: "GET",
                                url: url,
                                headers: headers,
                                onload: response => resolve(response),
                                onerror: () => resolve(),
                                ontimeout: () => resolve()
                            })
                        });
                    },
                    Get_Pixiv_Name: async function (id) { // 取得 Pixiv 名稱
                        const response = await this.Fix_Request(
                            `https://www.pixiv.net/ajax/user/${id}?full=1&lang=ja`, {referer: "https://www.pixiv.net/"}
                        );
                        if (response.status === 200) {
                            const user = JSON.parse(response.responseText);
                            let user_name = user.body.name;
                            user_name = user_name.replace(/(c\d+)?([日月火水木金土]曜日?|[123１２３一二三]日目?)[東南西北]..?\d+\w?/i, '');
                            user_name = user_name.replace(/[@＠]?(fanbox|fantia|skeb|ファンボ|リクエスト|お?仕事|新刊|単行本|同人誌)+(.*(更新|募集|公開|開設|開始|発売|販売|委託|休止|停止)+中?[!！]?$|$)/gi, '');
                            user_name = user_name.replace(/\(\)|（）|「」|【】|[@＠_＿]+$/g, '').trim();
                            return user_name;
                        } else return unSynined;
                    },
                    Fix_Url: function (url) { // 連結網址修復
                        url = url.match(/\/([^\/]+)\/([^\/]+)\/([^\/]+)$/) || url.match(/\/([^\/]+)\/([^\/]+)$/); // 匹配出三段類型, 或兩段類型的格式
                        url = url.splice(1).map(url => url.replace(/\/?(www\.|\.com|\.jp|\.net|\.adult|user\?u=)/g, "")); // 排除不必要字串
                        return url.length >= 3 ? [url[0], url[2]] : url;
                    },
                    Fix_Update_Ui: async function (href, id, name_onj, tag_obj, text) { // 修復後更新 UI
                        /* 創建編輯按鈕 */
                        const edit = GM_addElement("fix_edit", { id: id, class: "edit_artist", textContent: "Edit" });
                        name_onj.parentNode.insertBefore(edit, name_onj);
                        name_onj.outerHTML = `<fix_name jump="${href}">${text.trim()}</fix_name>`;

                        /* 取得支援修復的正則 */
                        const tag_text = tag_obj.textContent;
                        const support_id = this.Fix_Tag_Support.ID;
                        const support_name = this.Fix_Tag_Support.NAME;

                        if (support_id.test(tag_text)) {
                            tag_obj.innerHTML = tag_text.replace(support_id, tag => {
                                return `<fix_tag jump="${this.Fix_Tag_Support[tag].replace("{id}", id)}">${tag}</fix_tag>`;
                            });
                        } else if (support_name.test(tag_text)) {
                            tag_obj.innerHTML = tag_text.replace(support_name, tag => {
                                return `<fix_tag jump="${this.Fix_Tag_Support[tag].replace("{name}", id)}">${tag}</fix_tag>`;
                            });
                        }
                    },
                    Fix_Trigger: async function (object) { // 觸發修復
                        const {Url, TailId, Website, NameObject, TagObject} = object;

                        let Record = Record_Cache.get(TailId); // 從緩存 使用尾部 ID 取出對應紀錄

                        if (Record) {
                            this.Fix_Update_Ui(Url, TailId, NameObject, TagObject, Record);
                        } else {
                            if (this.Fix_Name_Support.has(Website)) {
                                Record = await this.Get_Pixiv_Name(TailId) || NameObject.textContent;
                                this.Fix_Update_Ui(Url, TailId, NameObject, TagObject, Record);
                                Fix_Cache.set(TailId, Record); // 添加數據
                                this.Save_Work; // 呼叫保存工作
                            } else {
                                Record = NameObject.textContent;
                                this.Fix_Update_Ui(Url, TailId, NameObject, TagObject, Record);
                            }
                        }
                    },
                    /* ===== 前置處理觸發 ===== */
                    Search_Fix: async function (items) { // 針對 搜尋頁, 那種有許多用戶卡的
                        items.setAttribute("fix", true); // 添加修復標籤

                        const url = items.href;
                        const img = Syn.$$("img", {root: items});
                        const parse = this.Fix_Url(url);

                        img.setAttribute("jump", url); // 圖片設置跳轉連結
                        items.removeAttribute("href"); // 刪除原始跳轉連結
                        img.removeAttribute("src"); // 刪除圖片跳轉連結

                        this.Fix_Trigger({
                            Url: url, // 跳轉連結
                            TailId: parse[1], // 尾部 id 標號
                            Website: parse[0], // 網站
                            NameObject: Syn.$$(".user-card__name", {root: items}), // 名稱物件
                            TagObject: Syn.$$(".user-card__service", {root: items}) // 標籤物件
                        });
                    },
                    Other_Fix: async function (artist, tag="", href=null, reTag="<fix_view>") { // 針對其餘頁面的修復
                        try {
                            const parent = artist.parentNode;
                            const url = href || parent.href;
                            const parse = this.Fix_Url(url);
    
                            await this.Fix_Trigger({
                                Url: url,
                                TailId: parse[1],
                                Website: parse[0],
                                NameObject: artist,
                                TagObject: tag
                            });

                            $(parent).replaceWith(function() {
                                return $(reTag, { html: $(this).html()})
                            });
                        } catch {/* 防止動態監聽進行二次操作時的錯誤 (因為 DOM 已經被修改) */}
                    },
                    Dynamic_Fix: async function (Listen, Operat,  Mode=null) {
                        let observer, options;
                        Syn.Observer(Listen, ()=> {
                            Record_Cache = this.Get_Record(); // 觸發時重新抓取
                            const wait = setInterval(()=> { // 為了確保找到 Operat 元素
                                const operat = typeof Operat === "string" ? Syn.$$(Operat) : Operat;
                                if (operat) {
                                    clearInterval(wait);
                                    switch (Mode) {
                                        case 1: // 針對 QuickPostToggle 的動態監聽 (也可以直接在 QuickPost 寫初始化呼叫)
                                            this.Other_Fix(operat);
                                            setTimeout(()=> { // 修復後延遲一下, 斷開原先觀察對象, 設置為子元素, 原因是因為 react 渲染造成 dom 的修改, 需重新設置
                                                observer.disconnect();
                                                observer.observe(Listen.children[0], options);
                                            }, 300);
                                            break;
                                        default: // 針對搜尋頁的動態監聽
                                            Syn.$$("a", {all: true, root: operat}).forEach(items=> { // 沒有修復標籤的才修復
                                                !items.getAttribute("fix") && this.Search_Fix(items);
                                            });
                                    }
                                }
                            })
                        }, {subtree: false}, back => {
                            observer = back.ob;
                            options = back.op;
                        });
                    }
                }

                const Fix_Cache = new Map(); // 修復後 用於緩存
                let Record_Cache = null; // 讀取修復紀錄 用於緩存
                Record_Cache = Fix_Requ.Get_Record(); // 讀取修復 數據到緩存

                // 搜尋頁面, 與一些特殊預覽頁
                if (DLL.IsSearch) {
                    const card_items = Syn.$$(".card-list__items");

                    if (DLL.Link.test(Url)) {
                        const artist = Syn.$$("span[itemprop='name']");
                        artist && Fix_Requ.Other_Fix(artist); // 預覽頁的 名稱修復

                        Syn.$$("a", {all: true, root: card_items}).forEach(items=> { Fix_Requ.Search_Fix(items) }); // 針對 links 頁面的 card
                        Url.endsWith("new") && Fix_Requ.Dynamic_Fix(card_items, card_items); // 針對 links/new 頁面的 card
                    } else { //! 還需要測試
                        Fix_Requ.Dynamic_Fix(card_items, card_items);
                        GM_addElement(card_items, "fix-trigger", {style: "display: none;"});
                    }

                } else if (DLL.IsContent) { // 是內容頁面
                    const artist = Syn.$$(".post__user-name");
                    const title = Syn.$$("h1 span:nth-child(2)");
                    Fix_Requ.Other_Fix(artist, title, artist.href, "<fix_cont>");

                } else { // 預覽頁面
                    const artist = Syn.$$("span[itemprop='name']");
                    if(artist) {
                        Fix_Requ.Other_Fix(artist);

                        if (User_Config.Preview_Page.QuickPostToggle.enable) { // 啟用該功能才需要動態監聽
                            setTimeout(()=> {
                                Fix_Requ.Dynamic_Fix(Syn.$$("section"), "span[itemprop='name']", 1);
                            }, 300);
                        }
                    }
                }

                // 監聽點擊事件
                const Device = Syn.Device.Type();
                Syn.AddListener(document.body, "click", event=> {
                    const target = event.target;

                    if (target.matches("fix_edit")) {
                        const display = target.nextElementSibling; // 取得下方的 name 元素
                        const text = GM_addElement("textarea", { 
                            class: "edit_textarea",
                            style: `height: ${display.scrollHeight + 10}px;`,
                        });

                        const original_name = display.textContent;
                        text.value = original_name.trim();
                        display.parentNode.insertBefore(text, target);

                        text.scrollTop = 0; // 滾動到最上方
                        setTimeout(() => {
                            text.focus() // 設置焦點
                            setTimeout(() => { // 避免還沒設置好焦點就觸發
                                Syn.Listen(text, "blur", ()=> {
                                    const change_name = text.value.trim();
                                    if (change_name != original_name) {
                                        display.textContent = change_name; // 修改顯示名
                                        Fix_Requ.Save_Record(new Map([[target.id, change_name]])); // 保存修改名
                                    }
                                    text.remove();
                                }, { once: true, passive: true });
                            }, 50);
                        }, 300);
                    } else if (target.matches("fix_name") || target.matches("fix_tag") || target.matches("img")) {
                        const jump = target.getAttribute("jump");
                        if (!target.parentNode.matches("fix_cont") && jump) {
                            DLL.IsSearch && Device == "Mobile"
                                ? location.assign(jump)
                                : GM_openInTab(jump, { active: false, insert: false });
                        } else if (jump) { // 內容頁面
                            location.assign(jump);
                        }
                    }
                }, { capture: true, passive: true });
            },
            BackToTop: async (Mode) => { /* 翻頁後回到頂部 */
                Syn.AddListener(document.body, "pointerup", event=> {
                    event.target.closest("#paginator-bottom") && Syn.$$("#paginator-top").scrollIntoView();
                }, { capture: true, passive: true });
            },
            KeyScroll: async (Mode) => { /* 快捷自動滾動 */
                if (Syn.Device.Type() === "Mobile") return;

                // 滾動配置
                const Config = {
                    Scroll_Pixels: 2,
                    Scroll_Interval: 800,
                };

                const UP_ScrollSpeed = Config.Scroll_Pixels * -1;
                let Scroll, Up_scroll  = false, Down_scroll = false;

                const TopDetected = Syn.Throttle(()=>{ // 檢測到頂停止
                    Up_scroll = Syn.Device.sY() == 0 ? false : true;
                }, 600);
                const BottomDetected = Syn.Throttle(()=>{ // 檢測到底停止
                    Down_scroll =
                    Syn.Device.sY() + Syn.Device.iH() >= document.documentElement.scrollHeight ? false : true;
                }, 600);

                switch (Mode) {
                    case 2:
                        Scroll = (Move) => {
                            const Interval = setInterval(()=> {
                                if (!Up_scroll && !Down_scroll) {
                                    clearInterval(Interval);
                                }

                                if (Up_scroll && Move < 0) {
                                    window.scrollBy(0, Move);
                                    TopDetected();
                                } else if (Down_scroll && Move > 0) {
                                    window.scrollBy(0, Move);
                                    BottomDetected();
                                }
                            }, Config.Scroll_Interval);
                        }
                    default:
                        Scroll = (Move) => {
                            if (Up_scroll && Move < 0) {
                                window.scrollBy(0, Move);
                                TopDetected();
                                requestAnimationFrame(() => Scroll(Move));
                            } else if (Down_scroll && Move > 0) {
                                window.scrollBy(0, Move);
                                BottomDetected();
                                requestAnimationFrame(() => Scroll(Move));
                            }
                        }
                }

                Syn.AddListener(window, "keydown", Syn.Throttle(event => {
                    const key = event.key;
                    if (key == "ArrowUp") {
                        event.stopImmediatePropagation();
                        event.preventDefault();
                        if (Up_scroll) {
                            Up_scroll = false;
                        } else if (!Up_scroll || Down_scroll) {
                            Down_scroll = false;
                            Up_scroll = true;
                            Scroll(UP_ScrollSpeed);
                        }
                    } else if (key == "ArrowDown") {
                        event.stopImmediatePropagation();
                        event.preventDefault();
                        if (Down_scroll) {
                            Down_scroll = false;
                        } else if (Up_scroll || !Down_scroll) {
                            Up_scroll = false;
                            Down_scroll = true;
                            Scroll(Config.Scroll_Pixels);
                        }
                    }
                }, 100), { capture: true });
            }
        }
    }

    /* ==================== 配置解析調用 ==================== */
    (()=> {
        // 類型判斷
        const Type = (obj) => Object.prototype.toString.call(obj).slice(8, -1);
        // 配置參數驗證
        const Validate = (Num, Bool) => Type(Num) === "Number" && Type(Bool) === "Boolean";
        // 呼叫順序
        const Order = {
            Global: [
                "SidebarCollapse",
                "DeleteNotice",
                "BlockAds",
                "TextToLink",
                "FixArtist",
                "BackToTop",
                "KeyScroll"
            ],
            Preview: [
                "NewTabOpens",
                "QuickPostToggle",
                "CardZoom",
                "CardText"
            ],
            Content: [
                "LinkBeautify",
                "VideoBeautify",
                "OriginalImage",
                "ExtraButton",
                "CommentFormat",
            ],
        };

        // 解析配置調用對應功能
        async function Call(root, config, page) {
            if (Type(config) !== "Object") { // 不是物件立即終止
                Syn.Log("配置類型錯誤", config, { type: "error" });
                return;
            }

            Order[page].forEach(ord => {
                const data = config[ord];
                const mode = data.mode; // 模式
                const enable = data.enable; // 啟用狀態

                if (Validate(mode, enable)) {
                    enable && root[ord]?.(mode);
                } else {
                    Syn.Log( // 參數錯誤會跳過, 並且打印錯誤
                        "配置參數錯誤",
                        [ord, mode, enable],
                        { type: "error", collapsed: false }
                    );
                }
            });
        }

        Call(Global_Function(), User_Config.Global_Page, "Global");

    })();

})();
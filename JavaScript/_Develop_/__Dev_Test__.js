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

    /* ==================== 頁面匹配 ==================== */
    const Url = Syn.Device.Url;
    const Page = (() => {
        // 定義頁面的正則
        const Posts = /^(https?:\/\/)?(www\.)?.+\/posts\/?.*$/;
        const Search = /^(https?:\/\/)?(www\.)?.+\/artists\/?.*$/;
        const User = /^(https?:\/\/)?(www\.)?.+\/.+\/user\/[^\/]+(\?.*)?$/;
        const Content = /^(https?:\/\/)?(www\.)?.+\/.+\/user\/.+\/post\/.+$/;
        const Favor = /^(https?:\/\/)?(www\.)?.+\/favorites\?type=post\/?.*$/;
        const Link = /^(https?:\/\/)?(www\.)?.+\/.+\/user\/[^\/]+\/links\/?.*$/;
        const FavorArtist = /^(https?:\/\/)?(www\.)?.+\/favorites(?:\?(?!type=post).*)?$/;
        const Announcement = /^(https?:\/\/)?(www\.)?.+\/(dms|(?:.+\/user\/[^\/]+\/announcements))(\?.*)?$/;

        return {
            Posts, Search, User, Content, Favor, FavorArtist, Link, Announcement,
            Content: Content.test(Url),
            Announcement: Announcement.test(Url),
            Search: Search.test(Url) || Link.test(Url) || FavorArtist.test(Url),
            AllPreview: Posts.test(Url) || User.test(Url) || Favor.test(Url),
            Color: Syn.Device.Host.startsWith("coomer") ? "#99ddff !important" : "#e8a17d !important"
        };
    })();

    /* ==================== 全域功能 ==================== */
    function Global_Function() {
        // 按鍵滾動配置
        const
            ScrollPixels = 2,
            ScrollInterval = 800;

        // 藝術家修復
        const record_data = () => Syn.Storage("fix_record_v2", { type: localStorage, error: new Map() });
        const record_cache = null; // 讀取修復紀錄的緩存
        const fix_cache = new Map(); // 修復後的緩存

        // 支援修復的類型
        const fix_name_support = { pixiv: undefined, fanbox: undefined };
        const fix_tag_support = {
            ID: /Patreon|Fantia|Pixiv|Fanbox/gi,
            Patreon: "https://www.patreon.com/user?u={id}",
            Fantia: "https://fantia.jp/fanclubs/{id}/posts",
            Pixiv: "https://www.pixiv.net/users/{id}/artworks",
            Fanbox: "https://www.pixiv.net/fanbox/creator/{id}",

            NAME: /Fansly|OnlyFans/gi,
            OnlyFans: "https://onlyfans.com/{name}",
            Fansly: "https://fansly.com/{name}/posts",
        };

        // 保存紀錄
        const save_record = async(save) => {
            await Syn.Storage("fix_record_v2",
                {
                    type: localStorage,
                    value: new Map([...record_data(), ...save]) // 取得完整數據並合併
                }
            );
            fix_cache.clear();
        };
        const save_work = Syn.Debounce(() => {
            save_record(fix_cache);
        }, 1000);

        // 請求獲取數據
        const Get = async(url, headers={}) => {
            return new Promise(resolve => {
                GM_xmlhttpRequest({
                    method: "GET",
                    url: url,
                    headers: headers,
                    onload: response => resolve(response),
                    onerror: () => resolve(),
                    ontimeout: () => resolve()
                })
            })
        };
        const get_pixiv_name = async(id) => {
            const response = await Get(
                `https://www.pixiv.net/ajax/user/${id}?full=1&lang=ja`, {referer: "https://www.pixiv.net/"}
            );
            if (response.status === 200) {
                const user = JSON.parse(response.responseText);
                let user_name = user.body.name;
                user_name = user_name.replace(/(c\d+)?([日月火水木金土]曜日?|[123１２３一二三]日目?)[東南西北]..?\d+\w?/i, '');
                user_name = user_name.replace(/[@＠]?(fanbox|fantia|skeb|ファンボ|リクエスト|お?仕事|新刊|単行本|同人誌)+(.*(更新|募集|公開|開設|開始|発売|販売|委託|休止|停止)+中?[!！]?$|$)/gi, '');
                user_name = user_name.replace(/\(\)|（）|「」|【】|[@＠_＿]+$/g, '').trim();
                return user_name;
            } else {
                return undefined;
            }
        };

        // 修復
        const fix_url = (url) => { // 連結修復
            url = url.match(/\/([^\/]+)\/([^\/]+)\/([^\/]+)$/) || url.match(/\/([^\/]+)\/([^\/]+)$/); // 匹配出三段類型, 或兩段類型的格式
            url = url.splice(1).map(url => url.replace(/\/?(www\.|\.com|\.jp|\.net|\.adult|user\?u=)/g, "")); // 排除不必要字串
            return url.length >= 3 ? [url[0], url[2]] : url;
        };
        const fix_update_ui = async(href, id, name_onj, tag_obj, text) => { // 更新頁面
            const edit = GM_addElement("fix_edit", { id: id, class: "edit_artist", textContent: "Edit" });
            name_onj.parentNode.insertBefore(edit, name_onj);
            name_onj.outerHTML = `<fix_name jump="${href}">${text.trim()}</fix_name>`;

            const tag_text = tag_obj.textContent;
            const support_id = fix_tag_support.ID;
            const support_name = fix_tag_support.NAME;

            if (support_id.test(tag_text)) {
                tag_obj.innerHTML = tag_text.replace(support_id, tag => {
                    return `<fix_tag jump="${fix_tag_support[tag].replace("{id}", id)}">${tag}</fix_tag>`;
                });
            } else if (support_name.test(tag_text)) {
                tag_obj.innerHTML = tag_text.replace(support_name, tag => {
                    return `<fix_tag jump="${fix_tag_support[tag].replace("{name}", id)}">${tag}</fix_tag>`;
                });
            }
        };
        const fix_trigger = async (object) => { // 修復觸發
                const {Url, TailId, Website, NameObject, TagObject} = object;

                let Record = record_cache.get(TailId);

                if (Record) {
                    fix_update_ui(Url, TailId, NameObject, TagObject, Record);
                } else {
                    if (fix_name_support.hasOwnProperty(Website)) {
                        Record = await get_pixiv_name(TailId) || NameObject.textContent;
                        fix_update_ui(Url, TailId, NameObject, TagObject, Record);
                        fix_cache.set(TailId, Record); // 添加數據
                        save_work(); // 呼叫保存工作
                    } else {
                        Record = NameObject.textContent;
                        fix_update_ui(Url, TailId, NameObject, TagObject, Record);
                    }
                }
        };

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
                Syn.AddStyle(`.ad-container, .root--ujvuu {display: none !important}`, "Ad-blocking-style");
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
            FixArtist: async (Mode) => { /* 修復藝術家名稱 */

            },
            BackToTop: async (Mode) => { /* 翻頁後回到頂部 */
                Syn.AddListener(document.body, "pointerup", event=> {
                    event.target.closest("#paginator-bottom") && Syn.$$("#paginator-top").scrollIntoView();
                }, { capture: true, passive: true });
            },
            KeyScroll: async (Mode) => { /* 快捷自動滾動 */
                if (Syn.Device.Type() === "Mobile") return;

                let Scroll, Up_scroll  = false, Down_scroll = false;
                const TopDetected = Syn.Throttle(()=>{
                    Up_scroll = Syn.Device.sY() == 0 ? false : true;
                }, 600);
    
                const BottomDetected = Syn.Throttle(()=>{
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
                            }, ScrollInterval);
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
    
                const UP_ScrollSpeed = ScrollPixels * -1;
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
                            Scroll(ScrollPixels);
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
                    // 參數錯誤會跳過, 並且打印錯誤
                    Syn.Log(
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
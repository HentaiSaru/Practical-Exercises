// ==UserScript==
// @name            wnacg 優化
// @name:zh-TW      wnacg 優化
// @name:zh-CN      wnacg 优化
// @name:ja         wnacg 最適化
// @name:en         wnacg Optimization
// @version         0.0.13
// @author          HentaiSaru
// @description         漫畫觀看頁面自訂, 圖像大小, 背景顏色, 自動翻頁, 觀看模式
// @description:zh-TW   漫畫觀看頁面自訂, 圖像大小, 背景顏色, 自動翻頁, 觀看模式
// @description:zh-CN   漫画观看页面自定义, 图像大小, 背景颜色, 自动翻页, 观看模式
// @description:ja      漫画観覧ページのカスタマイズ、画像サイズ、背景色、自動ページ送り、観覧モード
// @description:en      Customizing the manga viewing page, image size, background color, automatic page turning, viewing mode

// @match           *://*.wnacg.com/photos-view-id-*.html
// @match           *://*.wnacg01.ru/photos-view-id-*.html
// @match           *://*.wnacg02.ru/photos-view-id-*.html
// @match           *://*.wnacg03.ru/photos-view-id-*.html

// @match           *://*.wnacg.com/photos-slist-aid-*.html
// @match           *://*.wnacg01.ru/photos-slist-aid-*.html
// @match           *://*.wnacg02.ru/photos-slist-aid-*.html
// @match           *://*.wnacg03.ru/photos-slist-aid-*.html

// @icon            https://www.wnacg.com/favicon.ico

// @license         MIT
// @namespace       https://greasyfork.org/users/989635

// @run-at          document-body
// @grant           GM_setValue
// @grant           GM_getValue

// @require         https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js
// @require         https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.13.2/jquery-ui.min.js
// @require         https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js
// @require         https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js
// ==/UserScript==

(function () {
    var modal, style_rule, set, Mode_V2 = GM_getValue("Mode_V2", null) || "Auto", language = display_language(navigator.language);

    /* ==================== 主程式觸發 ==================== */

    ImportStyle(); // 導入樣式

    const select = [
        ".png.bread", // 廣告
        "#photo_body", // 圖片區塊
        "span.newpagelabel b", // 當前頁數
        "#bodywrap", // 底部樣式 1
        ".newpagewrap", // 底部樣式 2
        ".footer.wrap" // 底部樣式 3
    ];
    WaitElem(select, 10, element => { // 查找元素觸發翻頁
        const [ad, photo_box, current_page, body_wrap, page_wrap, footer_wrap] = element,
        total_page = $_(document, "select option", true).length;
        AdReplace(ad);
        ImageGeneration(photo_box, current_page, total_page);
        WrapRemove([body_wrap, page_wrap, footer_wrap]);
    });

    HotKey(); // 註冊熱鍵
    
    /* ==================== API ==================== */

    /* 取得設置 */
    function GetSettings() {
        let Settings = GM_getValue("Settings", null) || [{
            /* 這邊是預設值 */
            "BC": "#000",
            "ULS": "0rem",
            "BW": "100%",
            "MW": "60%",
            "BH": "auto",
            "MH": "auto",
            "MT": "auto",
            "ML": "auto"
        }];
        return Settings[0];
    }

    /* 添加樣式 */
    async function addstyle(Rule, ID="Add-Style") {
        let new_style = document.getElementById(ID);
        if (!new_style) {
            new_style = document.createElement("style");
            new_style.id = ID;
            document.head.appendChild(new_style);
        }
        new_style.appendChild(document.createTextNode(Rule));
    }

    /* 添加監聽器 */
    async function $on(element, type, listener) {
        $(element).on(type, listener);
    }

    /* 仿 jquery 查找元素 (改版) */
    function $_(document, element, all=false) {
        if (!all) {
            const slice = element.slice(1),
            analyze = (slice.includes(" ") || slice.includes(".") || slice.includes("#")) ? " " : element[0];
            return analyze == " " ? document.querySelector(element)
            : analyze == "#" ? document.getElementById(element.slice(1))
            : analyze == "." ? document.getElementsByClassName(element.slice(1))[0]
            : document.getElementsByTagName(element)[0];
        } else {return document.querySelectorAll(element)}
    }

    /* 等待元素 */
    async function WaitElem(selectors, timeout, callback) {
        let timer, elements;

        const observer = new MutationObserver(() => {
            elements = selectors.map(selector => $_(document, selector));
            if (elements.every(element => element)) {
                observer.disconnect();
                clearTimeout(timer);
                callback(elements);
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
        timer = setTimeout(() => {
            observer.disconnect();
        }, (1000 * timeout));
    }

    /* 數據解析 */
    function Analyze(value) {
        if (value === "auto") {
            return [9, "auto"];
        } else if (value.endsWith("rem") || value.endsWith("%")) {
            return [parseInt(value), value];
        } else {
            return [value, "color"];
        }
    }

    /* 註冊菜單熱鍵 */
    async function HotKey() {
        $on(document, "keydown", event => {
            event.stopPropagation();
            const key = event.key;
            key === "Escape" ? $(".modal-background").remove()
            : key === "Shift" && !$(".modal-background")[0] ? SettingInterface()
            : null;
        });
    }

    /* 變更樣式 */
    const styleRules = {
        ULS: value => style_rule[0].style.margin = `${value} auto`,
        BW: value => style_rule[0].style.width = value,
        BH: value => style_rule[0].style.height = value,
        MW: value => {style_rule[0].style.maxWidth = value; style_rule[2].style.maxWidth = value},
        MH: value => style_rule[0].style.maxHeight = value,
        BC: value => style_rule[1].style.background = value,
        MT: value => style_rule[9].style.top = value,
        ML: value => style_rule[9].style.left = value
    };

    /* ==================== 圖片創建 ==================== */

    async function ImageGeneration(box, current_page, total_page) {
        // 總頁數 = 總共頁數 - 當前頁數
        let total_pages = total_page - +current_page.textContent, RecordBox = new Map(), RecorNumber = 0,
        NLink, img, dom, parser = new DOMParser(), CurrentURL = document.URL;
        box.classList.remove("photo_body");

        /* ========== 自動滾動翻頁 ========== */
        const observer = new IntersectionObserver(function (observed) {
            observed.forEach(function (entry) {
                if (entry.isIntersecting) { 
                    history.pushState(null, null, entry.target.alt) 
                }
            });
        }, { threshold: 0.3 });
        function Auto_ReactRender({ OLink, src }) {
            return React.createElement("img", {
                className: "ImageOptimization",
                src: src,
                alt: OLink,
                loading: "lazy",
                ref: function (img) {
                    if (img) { observer.observe(img) }
                }
            });
        }
        async function Auto_NextPage(link) {
            if (total_pages > 0) {
                fetch(link)
                    .then(response => response.text())
                    .then(async html => {
                        dom = $_(parser.parseFromString(html, "text/html"), "#photo_body");
                        NLink = $_(dom, "a").href;
                        img = $_(dom, "img").src;
                        await ReactDOM.render(React.createElement(Auto_ReactRender, { OLink: link, src: img }), box.appendChild(document.createElement("div")));
                        total_pages--;
                        await Auto_NextPage(NLink);
                    })
            }
        }/* ========== 自動滾動翻頁 ========== */

        /* ========== 手動按鍵翻頁 (手動沒特別維護, 可能有些問題) ========== */
        function Manually_ReactRender({ number, NLink, src }) {
            return React.createElement("img", {
                className: "ImageOptimization",
                src: src,
                "data-number": number,
                "data-next": NLink,
            });
        }
        async function Manually_NextPage(Link) {
            fetch(Link)
                .then(response => response.text())
                .then(html => {
                    history.pushState(null, null, Link);
                    RecordBox.set(RecorNumber, Link);
                    dom = $_(parser.parseFromString(html, "text/html"), "#photo_body");
                    NLink = $_(dom, "a").href;
                    img = $_(dom, "img").src;
                    ReactDOM.render(React.createElement(Manually_ReactRender, { number: RecorNumber, NLink: NLink, src: img }), box);
                    window.scrollTo(0, 0);
            })
        }/* ========== 手動按鍵翻頁 ========== */

        /* ========== 首次觸發邏輯 ========== */
        document.title = document.title.split(" - ")[1]; // 變換 title 格式
        NLink = $_(box, "a").href; // 獲取下一頁連結
        img = $_(box, "img").src; // 獲取圖像連結

        /* ========== 後續觸發邏輯 ========== */
        if (Mode_V2 === "Auto") { // 自動翻頁觸發
            ReactDOM.render(React.createElement(Auto_ReactRender, { OLink: CurrentURL, src: img }), box);
            $_(document, "#header").scrollIntoView(); // 回到最上方
            Auto_NextPage(NLink); // 請求下一頁

        } else if (Mode_V2 === "Manual") { // 手動翻頁觸發
            RecorNumber++;
            RecordBox.set(RecorNumber, CurrentURL); // 紀錄連結
            ReactDOM.render(React.createElement(Manually_ReactRender, { number: RecorNumber, NLink: NLink, src: img }), box);

            $on(document, "keydown", event => {
                const key = event.key;
                img = $_(box, "img");
                if (key === "4") {
                    event.preventDefault();
                    Manually_NextPage(RecordBox.get(img.getAttribute("data-number") - 1));
                    RecorNumber--;
                } else if (key === "6") {
                    event.preventDefault();
                    Manually_NextPage(img.getAttribute("data-next"));
                    RecorNumber++;
                }
            });
        }
    }

    /* 廣告隱藏 */
    async function AdReplace(ad) {
        const breadHTML = { __html: ad.innerHTML };
        ReactDOM.render(
            React.createElement("div", { dangerouslySetInnerHTML: breadHTML }
            ), $_(document, "#bread")
        );
    }

    /* 調整排版 */
    async function WrapRemove(wrap) {
        wrap.map(w=> w.remove());
    }

    /* 設定介面 */
    async function SettingInterface() {
        let array = [], save = {}, showElement, id, value, check;
        set = GetSettings(); // 用這種笨方式避免順序出錯
        for (const result of [set.BC, set.ULS, set.BW, set.MW, set.BH, set.MH]) {
            value = Analyze(result);
            array.push({ "key": value[0], "value": value[1] });
        }

        /* 讓每次啟動菜單都是獲取最新狀態 */
        style_rule = document.getElementById("Add-Style").sheet.cssRules;
        Mode_V2 = GM_getValue("Mode_V2", null) || "Auto";
        check = Mode_V2 === "Auto" ? "checked" : "";

        modal = `
            <div class="modal-background">
                <div class="modal-interface">
                    <div style="display: flex; justify-content: space-between;">
                        <h1 style="margin-bottom: 1rem; font-size: 1.3rem;">${language[0]}</h1>
                        <div class="DMS">
                            <input type="checkbox" class="DMS-checkbox" id="DMS" ${check}>
                            <label class="DMS-label" for="DMS">
                                <span class="DMS-inner"></span>
                                <span class="DMS-switch"></span>
                            </label>
                        </div>
                    </div>
                    <p>
                        <Cins>${language[1]}</Cins><input type="range" id="ULS" class="slider" min="0" max="100" value="${array[1].key}" step="1">
                        <span class="Cshow">${array[1].value}</span>
                    </p>
                    <br>
                    <p>
                        <Cins>${language[2]}</Cins><input type="range" id="BW" class="slider" min="9" max="100" value="${array[2].key}" step="1">
                        <span class="Cshow">${array[2].value}</span>
                    </p>
                    <br>
                    <p>
                        <Cins>${language[3]}</Cins><input type="range" id="MW" class="slider" min="9" max="100" value="${array[3].key}" step="1">
                        <span class="Cshow">${array[3].value}</span>
                    </p>
                    <br>
                    <p>
                        <Cins>${language[4]}</Cins><input type="range" id="BH" class="slider" min="9" max="100" value="${array[4].key}" step="1">
                        <span class="Cshow">${array[4].value}</span>
                    </p>
                    <br>
                    <p>
                        <Cins>${language[5]}</Cins><input type="range" id="MH" class="slider" min="9" max="100" value="${array[5].key}" step="1">
                        <span class="Cshow">${array[5].value}</span>
                    </p>
                    <br>
                    <p>
                        <Cins>${language[6]}</Cins><input type="color" id="BC" class="color" value="${array[0].key}">
                        <span style="margin-right: 17.9rem;"></span><button id="save_set" class="button-sty">${language[7]}</button>
                    </p>
                </div>
            </div>
        `
        $(document.body).append(modal);
        $(".modal-interface").draggable({
            scroll: true,
            opacity: 0.8,
            cursor: "grabbing",
        });
        $on("#BC", "input", event => {
            value = $(event.target).val();
            id = event.target.id;
            styleRules[id](value);
        })
        $on("#ULS", "input", event => {
            showElement = $(event.target).next(".Cshow");
            value = $(event.target).val();
            id = event.target.id;
            styleRules[id](`${value}rem`);
            showElement.text(`${value}rem`);
        });
        $on("#BW, #MW", "input", event => {
            showElement = $(event.target).next(".Cshow");
            value = $(event.target).val();
            id = event.target.id;

            if (value === "9") {
                styleRules[id]("auto");
                showElement.text("auto");
            } else {
                styleRules[id](`${value}%`);
                showElement.text(`${value}%`);
            }
        });
        $on("#BH, #MH", "input", event => {
            showElement = $(event.target).next(".Cshow");
            value = $(event.target).val();
            id = event.target.id;

            if (value === "9") {
                styleRules[id]("auto");
                showElement.text("auto");
            } else {
                styleRules[id](`${value}rem`);
                showElement.text(`${value}rem`);
            }
        });
        $on("#save_set", "click", function () {
            $(".modal-interface").find("input").each(function () {
                id = $(this).attr('id');
                value = $(this).val();
                if (id === "ULS") {
                    save[id] = `${value}rem`;
                } else if (id === "BW" || id === "MW") {
                    if (value === "9") { save[id] = "auto" } else { save[id] = `${value}%` }
                } else if (id === "BH" || id === "MH") {
                    if (value === "9") { save[id] = "auto" } else { save[id] = `${value}rem` }
                } else { save[id] = value }
            });
            const menu_location = $(".modal-interface");
            const top = menu_location.css("top");
            const left = menu_location.css("left");
            save["MT"] = top;
            save["ML"] = left;
            // 判斷顯示狀態
            $("#DMS").prop("checked") ? GM_setValue("Mode_V2", "Auto") : GM_setValue("Mode_V2", "Manual");
            GM_setValue("Settings", [save]);
            styleRules["MT"](top);
            styleRules["ML"](left);
            $(".modal-background").remove();
        });
    }

    /* css 樣式導入 */
    async function ImportStyle() {
        set = GetSettings();
        addstyle(`
            .ImageOptimization {
                display: block;
                margin: ${set.ULS} auto;
                width: ${set.BW};
                height: ${set.BH};
                max-width: ${set.MW};
                max-height: ${set.MH};
            }
            body {
                overflow-x: visible !important;
                background-color: ${set.BC};
            }
            .tocaowrap {
                width: 100%;
                margin: 0 auto;
                padding: 0.1rem;
                max-width: ${set.MW};
            }
            .btntuzao {
                margin: 0 5px;
                background-color: #5F5F5F;
            }
            a, em {
                color: #fff;
            }
            #header {
                background: #5F5F5F;
                border-bottom: 1px solid #dfe1e1;
                transform: translateY(-1.6rem);
                opacity: 0;
                transition: 0.8s;
            }
            #header:hover {
                opacity: 1;
                transform: translateY(0rem);
            }
            .nav li a {
                float: left;
                line-height: 40px;
                height: 40px;
                width: 85px;
                font-size: 14px;
                color: #fff;
                text-decoration: none;
                text-align: center;
                font-weight: bold;
                text-align: center;
                background: #5F5F5F;
            }
            .modal-background {
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                display: flex;
                z-index: 9999;
                position: fixed;
                overflow: auto;
                pointer-events: none;
            }
            .modal-interface {
                top: ${set.MT};
                left: ${set.ML};
                margin: auto;
                color: #3d8fe7;
                padding: 1% 2%;
                border-radius: 5px;
                background-color: #f3f3f3;
                border: 2px solid #c0d8fc;
                pointer-events: auto;
            }
            .slider {
                width: 21rem;
                cursor: pointer;
            }
            .color {
                width: 4rem;
                cursor: pointer;
            }
            .Cshow {
                font-size: 1.25rem;
                margin: auto 1rem;
                font-weight: bold;
            }
            .button-sty {
                color: #ffffff;
                font-size: 1rem;
                padding: 0.3rem;
                font-weight: bold;
                border-radius: 5px;
                background-color: #3d8fe7;
                border: 2px solid #f3f3f3;
            }
            .button-sty:hover,
            .button-sty:focus {
                color: #c0d8fc;
                cursor: pointer;
                text-decoration: none;
            }
            p {
                display: flex;
                align-items: center;
                white-space: nowrap;
            }
            Cins {
                font-size: 1.2rem;
                font-weight: bold;
                padding: 1rem;
                margin-right: 1rem;
            }
            /*--------------------*/
            .DMS {
                position: absolute;
                width: 8.2rem;
                margin-left: 27rem;
            }
            .DMS-checkbox {
                display: none;
            }
            .DMS-label {
                display: block;
                overflow: hidden;
                cursor: pointer;
                border: 2px solid #c0d8fc;
                border-radius: 20px;
            }
            .DMS-inner {
                display: block;
                width: 200%;
                margin-left: -100%;
                transition: margin 0.3s ease-in 0s;
            }
            .DMS-inner:before,
            .DMS-inner:after {
                display: block;
                float: left;
                width: 50%;
                height: 30px;
                padding: 0;
                line-height: 30px;
                font-size: 14px;
                font-family: Trebuchet, Arial, sans-serif;
                font-weight: bold;
                box-sizing: border-box;
            }
            .DMS-inner:before {
                content: "${language[8]}";
                padding-left: 1.7rem;
                background-color: #3d8fe7;
                color: #FFFFFF;
            }
            .DMS-inner:after {
                content: "${language[9]}";
                padding-right: 1.5rem;
                background-color: #FFFFFF;
                color: #3d8fe7;
                text-align: right;
            }
            .DMS-switch {
                display: block;
                width: 18px;
                margin: 6px;
                background: #FFFFFF;
                position: absolute;
                top: 0;
                bottom: 0;
                right: 104px;
                border: 2px solid #999999;
                border-radius: 20px;
                transition: all 0.3s ease-in 0s;
            }
            .DMS-checkbox:checked+.DMS-label .DMS-inner {
                margin-left: 0;
            }
            .DMS-checkbox:checked+.DMS-label .DMS-switch {
                right: 0px;
            }
        `);
    }

    function display_language(language) {
        let display = {
            "zh-TW": [
                "圖像設置", "上下間距", "基本寬度", "最大寬度", "基本高度", "最大高度", "背景顏色", "保存設置", "滾動閱讀", "翻頁閱讀"
            ],
            "zh-CN": [
                "图像设置", "上下间距", "基本宽度", "最大宽度", "基本高度", "最大高度", "背景颜色", "保存设置", "滚动阅读", "翻页阅读"
            ],
            "ja": [
                "画像設定", "上下の余白", "基本幅", "最大幅", "基本高さ", "最大高さ", "背景色", "設定の保存", "スクロール読み取り", "ページ読み取り"
            ],
            "en-US": [
                "Image settings", "Margin", "Base width", "Maximum width", "Base height", "Maximum height", "Background color", "Save settings", "Scroll reading", "Page reading"
            ]
        };
        return display[language] || display["en-US"];
    }
})();
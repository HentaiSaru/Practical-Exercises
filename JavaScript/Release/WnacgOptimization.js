// ==UserScript==
// @name            wnacg 觀看優化
// @version         0.0.4
// @author          HentiSaru
// @description     只設置匹配 https://www.wnacg.com/  漫畫自動載入所有頁面至同一頁, 純黑背景色, 圖像最大寬度縮小

// @match           *://*.wnacg.com/photos-view-id-*.html
// @icon            https://www.wnacg.com/favicon.ico

// @license         MIT
// @namespace       https://greasyfork.org/users/989635

// @run-at          document-start
// @grant           GM_setValue
// @grant           GM_getValue
// @grant           GM_addStyle

// @require         https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.0/jquery.min.js
// @require         https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js
// @require         https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js
// ==/UserScript==

var modal, set_value;
function GetSettings() {
    let Settings = GM_getValue("Settings", null);
    if (Settings === null) {
        Settings = [{"BC":"#000000", "ULS":"0rem", "BW":"100%", "MW":"60%", "BH":"auto", "MH":"auto"}];
    }
    return Settings[0];
}

(function () {
    ImportStyle();
    let photo_box, current, total, interval = setInterval(() => {
        photo_box = document.getElementById("photo_body");
        current = document.querySelector("span.newpagelabel b");
        total = document.querySelectorAll("select option");
        if (photo_box && current && total.length > 0) {
            document.body.classList.add("CustomBody");
            photo_box.classList.remove("photo_body");
            ImageGeneration(photo_box, current, total);
            AdReplace();
            clearInterval(interval);
        }
    }, 500);
    HotKey();
})();

async function ImageGeneration(box, current, total) {
    // 總頁數 = 總共頁數 - 當前頁數
    var total_pages = total.length - parseInt(current.textContent, 10);
    let NLink, img, dom, parser = new DOMParser();
    /* -------------------------------------------------------------- */
    /* 觀察者 */
    var observer = new IntersectionObserver(function (observed) {
        observed.forEach(function (entry) {
            if (entry.isIntersecting) {history.pushState(null, null, entry.target.alt)}
        });
    }, {threshold: 0.4});
    /* 圖像渲染 */
    function ReactRender({ OLink, src }) {
        return React.createElement("img", {
            className: "ImageOptimization",
            src: src,
            alt: OLink,
            ref: function (img) {
                if (img) {observer.observe(img)}
            }
        });
    }
    /* 獲取下一頁資訊 */
    async function NextPage(link) {
        if (total_pages > 1) {
            fetch(link)
                .then(response => response.text())
                .then(html => {
                    dom = parser.parseFromString(html, "text/html").getElementById("photo_body");
                    NLink = dom.querySelector("a").href;
                    img = dom.querySelector("img").src;
                    ReactDOM.render(React.createElement(ReactRender, { OLink: link, src: img }), box.appendChild(document.createElement("div")));
                    setTimeout(()=>{
                        NextPage(NLink);
                        total_pages--;
                    }, 600)
                })
        }
    }/* -------------------------------------------------------------- */
    document.title = document.title.split(" - ")[1]; // 變換 title 格式
    NLink = box.querySelector("a").href; // 獲取下一頁連結
    img = box.querySelector("img").src; // 獲取圖像連結
    /* 重新渲染第一章圖 */
    ReactDOM.render(React.createElement(ReactRender, { OLink: window.location.href, src: img }), box);
    document.querySelector("p.result").scrollIntoView(); // 回到最上方
    HeavyTypography(); // 調整排版樣式
    NextPage(NLink); // 請求下一頁
}

/* 廣告隱藏 */
async function AdReplace() {
    const breadHTML = { __html: document.querySelector(".png.bread").innerHTML };
    ReactDOM.render(
        React.createElement("div", { dangerouslySetInnerHTML: breadHTML }
        ),
        document.getElementById("bread")
    );
}

/* 重新調整排版 */
async function HeavyTypography() {
    // box.replaceChildren(); 刪除子節點方法
    try {
        document.getElementById("bodywrap").remove();
        document.querySelector("div.tocaowrap").classList.add("TailStyle");
        document.querySelector(".newpagewrap").remove();
        document.querySelector(".footer.wrap").remove();
    } catch { }
}

/* 熱鍵開啟菜單 */
async function HotKey() {
    document.addEventListener("keydown", function(event) {
        if (event.shiftKey) {
            event.preventDefault();
            SettingInterface();
        }
    })
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
/* 設定介面 */
async function SettingInterface() {
    let array = [], save = {}, showElement, id, value;
    set = GetSettings(); // 用這種笨方式避免順序出錯
    for (const result of [set.BC, set.ULS, set.BW, set.MW, set.BH, set.MH]) {
        value = Analyze(result);
        array.push({"key":value[0], "value":value[1]});
    }
    modal = `
        <div class="modal-background">
            <div class="modal-interface">
                <h1 style="margin-bottom: 1rem; font-size: 1.3rem;">圖像設置</h1>
                <p>
                    <Cins>上下間距</Cins><input type="range" id="ULS" class="slider" min="0" max="100" value="${array[1].key}" step="1">
                    <span class="Cshow">${array[1].value}</span>
                </p>
                <br>
                <p>
                    <Cins>基本寬度</Cins><input type="range" id="BW" class="slider" min="9" max="100" value="${array[2].key}" step="1">
                    <span class="Cshow">${array[2].value}</span>
                </p>
                <br>
                <p>
                    <Cins>最大寬度</Cins><input type="range" id="MW" class="slider" min="9" max="100" value="${array[3].key}" step="1">
                    <span class="Cshow">${array[3].value}</span>
                </p>
                <br>
                <p>
                    <Cins>基本高度</Cins><input type="range" id="BH" class="slider" min="9" max="100" value="${array[4].key}" step="1">
                    <span class="Cshow">${array[4].value}</span>
                </p>
                <br>
                <p>
                    <Cins>最大高度</Cins><input type="range" id="MH" class="slider" min="9" max="100" value="${array[5].key}" step="1">
                    <span class="Cshow">${array[5].value}</span>
                </p>
                <br>
                <p>
                    <Cins>背景顏色</Cins><input type="color" id="BC" class="color" value="${array[0].key}">
                    <span style="margin-right: 17.9rem;"></span><button id="save_set" class="button-sty">保存設置</button>
                </p>
            </div>
        </div>
    `
    $(document.body).append(modal);
    $("#BC").on("input", event => {
        value = $(event.target).val();
        id = event.target.id;
        StyleChange(id, value);
    });
    $("#ULS").on("input", event => {
        showElement = $(event.target).next(".Cshow");
        value = $(event.target).val();
        id = event.target.id;
        StyleChange(id, `${value}rem`);
        showElement.text(`${value}rem`);
    });
    $("#BW, #MW").on("input", event => {
        showElement = $(event.target).next(".Cshow");
        value = $(event.target).val();
        id = event.target.id;

        if (value === "9") {
            StyleChange(id, "auto");
            showElement.text("auto");
        } else {
            StyleChange(id, `${value}%`);
            showElement.text(`${value}%`);
        }
    });
    $("#BH, #MH").on("input", event => {
        showElement = $(event.target).next(".Cshow");
        value = $(event.target).val();
        id = event.target.id;

        if (value === "9") {
            StyleChange(id, "auto");
            showElement.text("auto");
        }  else {
            StyleChange(id, `${value}rem`);
            showElement.text(`${value}rem`);
        }
    });
    $('#save_set').on("click", function() {
        $(".modal-interface").find("input").each(function() {
            id = $(this).attr('id');
            value = $(this).val();
            if (id === "ULS") {
                save[id] = `${value}rem`;
            } else if (id === "BW" || id === "MW") {
                if (value === "9") {save[id] = "auto"} else {save[id] = `${value}%`}
            } else if (id === "BH" || id === "MH") {
                if (value === "9") {save[id] = "auto"} else {save[id] = `${value}rem`}
            } else {save[id] = value}
        });
        array = [save]
        GM_setValue("Settings", array);
        $('.modal-background').remove();
    });
}

/* css 樣式導入 */
async function ImportStyle() {
    set = GetSettings();
    GM_addStyle(`
        .ImageOptimization {
            display: block;
            margin: ${set.ULS} auto;
            width: ${set.BW};
            height: ${set.BH};
            max-width: ${set.MW};
            max-height: ${set.MH};
        }
        .CustomBody {
            overflow-x: visible !important;
            background: ${set.BC};
        }
        .TailStyle {
            width: auto;
            max-width: ${set.MW};
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
            background-color: rgba(0, 0, 0, 0.1);
        }
        .modal-interface {
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
    `);
}

/* 變更樣式 (這是個爛方式) */
const styleRules = {
    ULS: value => `.ImageOptimization {margin: ${value} auto;}`,
    BW: value => `.ImageOptimization {width: ${value}}`,
    BH: value => `.ImageOptimization {height: ${value}}`,
    MW: value => `.ImageOptimization {max-width: ${value}}`,
    MH: value => `.ImageOptimization {max-height: ${value}}`,
    BC: value => `.CustomBody {background: ${value}}`
};
async function StyleChange(id, value) {
    GM_addStyle(styleRules[id](value));
}
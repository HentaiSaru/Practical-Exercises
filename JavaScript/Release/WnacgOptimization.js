// ==UserScript==
// @name            wnacg 漫畫一頁化
// @version         0.0.3
// @author          HentiSaru
// @description     只設置匹配 https://www.wnacg.com/  漫畫自動載入所有頁面至同一頁, 純黑背景色, 圖像最大寬度縮小

// @match           *://*.wnacg.com/photos-view-id-*.html
// @icon            https://www.wnacg.com/favicon.ico

// @license         MIT
// @namespace       https://greasyfork.org/users/989635

// @run-at          document-start
// @grant           GM_addStyle

// @require         https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js
// @require         https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js
// ==/UserScript==

var observer = new IntersectionObserver(function(observed) {
    observed.forEach(function(entry) {
        if (entry.isIntersecting) { // 變換URL將看過的圖片, 確實加入歷史紀錄
            history.pushState(null, null, entry.target.alt);
        }
    });
}, {threshold: 0.5});

(function() {
    GM_addStyle(`
        .ImageOptimization {
            display: block;
            margin: 0 auto;
            width: 100%;
            max-width: 60%;
        }
        .ImageBorder {
            border-top: 1rem solid white;
            border-bottom: 1rem solid white;
        }
        .CustomBody {
            overflow-x: visible !important;
            background: #000000;
        }
    `);
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
})();

/* 渲染 */
function ReactRender({link, src}) {
    return React.createElement("img", {
        className: "ImageOptimization",
        src: src,
        alt: link,
        ref: function(img) {if (img) {observer.observe(img)}}
    });
}
async function ImageGeneration(box, current, total) {
    // 總頁數 = 總共頁數 - 當前頁數
    var total_pages = total.length - parseInt(current.textContent, 10);
    let link, img, dom, parser = new DOMParser();
    document.title = document.title.split(" - ")[1];
    link = box.querySelector("a").href;
    img = box.querySelector("img").src;
    ReactDOM.render(React.createElement(ReactRender, { link:link, src: img }), box);
    document.querySelector("p.result").scrollIntoView(); // 回到最上方
    NextPage(link, box);
    TailDeletion();
    async function NextPage(link, box) {
        if (total_pages > 1) {
            fetch(link)
                .then(response => response.text())
                .then(html => {
                    dom = parser.parseFromString(html, "text/html").getElementById("photo_body");
                    link = dom.querySelector("a").href;
                    img = dom.querySelector("img").src;
                    ReactDOM.render(React.createElement(ReactRender, { link:link, src: img }), box.appendChild(document.createElement("div")));
                    setTimeout(()=>{
                        NextPage(link, box);
                        total_pages--;
                    }, 700)
                })
        }
    }
}

/* 廣告隱藏 */
async function AdReplace() {
    const breadHTML = { __html: document.querySelector(".png.bread").innerHTML };
    ReactDOM.render(
        React.createElement("div", { dangerouslySetInnerHTML: breadHTML}
        ),
        document.getElementById("bread")
    );
}

/* 刪除底部不需要物件 */
async function TailDeletion() {
    // box.replaceChildren(); 刪除子節點方法
    try {
        document.getElementById("bodywrap").remove();
        document.querySelector("div.tocaowrap").setAttribute("style", "width: 100%; max-width: 60%;");
        document.querySelector(".newpagewrap").remove();
        document.querySelector(".footer.wrap").remove();
    } catch {}
}
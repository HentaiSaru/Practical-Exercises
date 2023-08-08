// ==UserScript==
// @name            wnacg 漫畫一頁化
// @version         0.0.1
// @author          HentiSaru
// @description     只設置匹配 https://www.wnacg.com/  漫畫自動載入所有頁面至同一頁, 純黑背景色, 圖像最大寬度縮小

// @match           *://*.wnacg.com/photos-view-id-*.html
// @icon            https://www.wnacg.com/favicon.ico

// @license         MIT
// @namespace       https://greasyfork.org/users/989635

// @run-at          document-start

// @require         https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js
// @require         https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js
// ==/UserScript==

(function() {
    document.body.style.cssText = "overflow-x: visible !important; background: #000000;";
    let photo_box, interval = setInterval(() => {
        photo_box = document.getElementById("photo_body");
        if (photo_box) {
            ImageGeneration(photo_box);
            clearInterval(interval);
        }
    }, 500);
})();

function ReactRender({link, src}) {
    return React.createElement("img", {
        className: "photo",
        style: { display: "block", margin: "0 auto", maxWidth: "60%" },
        src: src,
        alt: link
    });
}
async function ImageGeneration(box) {
    var total_pages = document.querySelectorAll("select option").length - 1;
    let link, img, dom, parser = new DOMParser();
    link = box.querySelector("a").href;
    img = box.querySelector("img").src;
    TailDeletion();
    ReactDOM.render(React.createElement(ReactRender, { link:link, src: img }), box);
    document.querySelector("p.result").scrollIntoView(); // 回到最上方
    NextPage(link, box);
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
                    }, 800)
                })
        }
    }
}

async function TailDeletion() {
    // box.replaceChildren(); 刪除子節點方法
    document.getElementById("bodywrap").remove();
    document.querySelector(".newpagewrap").remove();
    document.querySelector(".footer.wrap").remove();
}
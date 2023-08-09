// ==UserScript==
// @name            wnacg 漫畫一頁化
// @version         0.0.2
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
    let photo_box, interval = setInterval(() => {
        photo_box = document.getElementById("photo_body");
        if (photo_box) {
            document.body.style.cssText = "overflow-x: visible !important; background: #000000;";
            ImageGeneration(photo_box);
            clearInterval(interval);
        }
    }, 300);
})();

var observer = new IntersectionObserver(function(observed) {
    observed.forEach(function(entry) {
        if (entry.isIntersecting) { // 變換URL將看過的圖片, 確實加入歷史紀錄
            history.pushState(null, null, entry.target.alt);
        }
    });
});

function ReactRender({link, src}) {
    return React.createElement("img", {
        className: "photo",
        style: { display: "block", margin: "0px auto", width: "100%", maxWidth: "60%" },
        src: src,
        alt: link,
        ref: function(img) {if (img) {observer.observe(img)}}
    });
}
async function ImageGeneration(box) {
    var total_pages = document.querySelectorAll("select option").length - 1;
    let link, img, dom, parser = new DOMParser();
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

async function TailDeletion() {
    // box.replaceChildren(); 刪除子節點方法
    try {
        document.getElementById("bodywrap").remove();
        document.querySelector("div.tocaowrap").setAttribute("style", "width: 100%; max-width: 60%;");
        document.querySelector(".newpagewrap").remove();
        document.querySelector(".footer.wrap").remove();
    } catch {}
}
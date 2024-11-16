// ==UserScript==
// @name            wnacg 優化
// @name:zh-TW      wnacg 優化
// @name:zh-CN      wnacg 优化
// @name:ja         wnacg 最適化
// @name:en         wnacg Optimization
// @version         0.0.14
// @author          Canaan HS
// @description         電腦版頁面支持切換自動翻頁或手動按鍵翻頁，並可自定背景顏色及圖像大小。電腦開啟的手機頁面 (移動端不適用)，則可自定背景顏色及圖像大小。
// @description:zh-TW   電腦版頁面支持切換自動翻頁或手動按鍵翻頁，並可自定背景顏色及圖像大小。電腦開啟的手機頁面 (移動端不適用)，則可自定背景顏色及圖像大小。
// @description:zh-CN   电脑版页面支持切换自动翻页或手动按键翻页，并可自定背景颜色及图像大小。电脑开启的手机页面（移动端不适用），则可自定背景颜色及图像大小。
// @description:ja      デスクトップ版ページでは、自動ページ送りと手動キー操作によるページ送りの切り替えができ、背景色と画像サイズをカスタマイズできます。デスクトップで開いたモバイルページ（モバイル端末では適用されません）では、背景色と画像サイズをカスタマイズできます。
// @description:en      The desktop version supports switching between automatic page turning and manual key press page turning, with customizable background color and image size. The mobile version opened on a desktop (not applicable on mobile devices) allows for customizing the background color and image size.

// @match       *://*.wnacg.com/photos-view-id-*.html
// @match       *://*.wnacg01.ru/photos-view-id-*.html
// @match       *://*.wnacg02.ru/photos-view-id-*.html
// @match       *://*.wnacg03.ru/photos-view-id-*.html

// @match       *://*.wnacg.com/photos-slist-aid-*.html
// @match       *://*.wnacg01.ru/photos-slist-aid-*.html
// @match       *://*.wnacg02.ru/photos-slist-aid-*.html
// @match       *://*.wnacg03.ru/photos-slist-aid-*.html

// @icon        https://www.wnacg.com/favicon.ico

// @license     MIT
// @namespace   https://greasyfork.org/users/989635

// @run-at      document-start
// @grant       GM_setValue
// @grant       GM_getValue
// @grant       GM_deleteValue
// @grant       GM_registerMenuCommand

// @require     https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js
// @require     https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.14.0/jquery-ui.min.js
// @require     https://update.greasyfork.org/scripts/495339/1456526/ObjectSyntax_min.js
// @require     https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js
// @require     https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js
// ==/UserScript==

(async () => {
    async function w(b, e) {
      document.title = document.title.split(" - ")[1];
      const f = Syn.$$("a", { root: b }).href,
        q = Syn.$$("img", { root: b }).src;
      if (h.SwitchStatus) {
        let p = Syn.$$("select option", { all: !0 }).length - e;
        const n = new IntersectionObserver(
          (c) => {
            c.forEach((a) => {
              a.isIntersecting &&
                (history.pushState(null, null, a.target.alt),
                n.unobserve(a.target));
            });
          },
          { threshold: 0.3 }
        );
        function l({ OLink: c, src: a }) {
          return React.createElement("img", {
            src: a,
            alt: c,
            loading: "lazy",
            className: "ImageOptimization",
            ref: function (d) {
              d && n.observe(d);
            },
          });
        }
        async function m(c) {
          0 < p &&
            fetch(c)
              .then((a) => a.text())
              .then((a) => {
                a = Syn.$$("#photo_body", { root: Syn.DomParse(a) });
                const d = Syn.$$("a", { root: a }).href;
                a = Syn.$$("img", { root: a }).src;
                ReactDOM.render(
                  React.createElement(l, { OLink: c, src: a }),
                  b.appendChild(document.createElement("div"))
                );
                setTimeout(() => {
                  p--;
                  m(d);
                }, 500);
              })
              .catch((a) => {
                m(c);
              });
        }
        ReactDOM.render(
          React.createElement(l, { OLink: Syn.Device.Url, src: q }),
          b
        );
        Syn.$$("#header").scrollIntoView();
        m(f);
      } else {
        function p({ number: c, src: a }) {
          return React.createElement("img", {
            src: a,
            "data-number": c,
            className: "ImageOptimization",
          });
        }
        async function n(c) {
          fetch(c)
            .then((a) => a.text())
            .then((a) => {
              a = Syn.DomParse(a);
              var d = Syn.$$("#photo_body", { root: a });
              d = Syn.$$("img", { root: d }).src;
              ReactDOM.render(React.createElement(p, { number: l, src: d }), b);
              a = Syn.$$(".newpage .btntuzao", { all: !0, root: a });
              m.set(l, { PrevLink: a[0].href, NextLink: a[1].href });
              history.pushState(null, null, c);
              window.scrollTo(0, 0);
            });
        }
        let l = e;
        const m = new Map();
        e = Syn.$$(".newpage .btntuzao", { all: !0 });
        m.set(l, { PrevLink: e[0].href, NextLink: e[1].href });
        ReactDOM.render(
          React.createElement(p, { number: l, NLink: f, src: q }),
          b
        );
        document.onkeydown = void 0;
        u(window, "keydown", (c) => {
          var a = c.key;
          if ("ArrowLeft" == a || "4" == a)
            c.stopImmediatePropagation(),
              --l,
              (c = +Syn.$$("img", { root: b }).getAttribute("data-number")),
              (a = m.get(c - 1)) ? n(a.PrevLink) : n(m.get(c).PrevLink);
          else if ("ArrowRight" == a || "6" == a)
            c.stopImmediatePropagation(),
              ++l,
              (c = +Syn.$$("img", { root: b }).getAttribute("data-number")),
              (c = m.get(c).NextLink),
              n(c);
        });
      }
    }
    async function u(b, e, f) {
      $(b).on(e, f);
    }
    async function v(b = !1) {
      if (Syn.$$(".modal-background")) b && Syn.$$(".modal-background").remove();
      else {
        var {
          SwitchStatus: e,
          ImageBasicWidth: f,
          ImageMaxWidth: q,
          ImageBasicHight: p,
          ImageMaxHight: n,
          ImageSpacing: l,
          BackgroundColor: m,
        } = h.LoadingConfig();
        b = [];
        for (var c of [l, f, q, p, n, m]) b.push(h.ConfigAnalyze(c));
        c = h.IsMobile
          ? ""
          : `
      <div class="DMS">
          <input type="checkbox" class="DMS-checkbox" id="SwitchMode" ${
            e ? "checked" : ""
          }>
          <label class="DMS-label" for="SwitchMode">
              <span class="DMS-inner"></span>
              <span class="DMS-switch"></span>
          </label>
      </div>
  `;
        b = `
      <div class="modal-background">
          <div class="modal-interface">
              <div style="display: flex; justify-content: space-between;">
                  <h1 style="margin-bottom: 1rem; font-size: 1.3rem;">${h.Transl(
                    "\u5716\u50cf\u8a2d\u7f6e"
                  )}</h1>${c}
              </div>
              <p>
                  <Cins>${h.Transl(
                    "\u5716\u50cf\u9593\u8ddd"
                  )}</Cins><input type="range" id="ImageSpacing" class="slider" min="0" max="100" step="1" value="${
          b[0].RangeValue
        }">
                  <span class="Cshow">${b[0].DisplayText}</span>
              </p>
              <br>
              <p>
                  <Cins>${h.Transl(
                    "\u57fa\u672c\u5bec\u5ea6"
                  )}</Cins><input type="range" id="ImageBasicWidth" class="slider" min="9" max="100" step="1" value="${
          b[1].RangeValue
        }">
                  <span class="Cshow">${b[1].DisplayText}</span>
              </p>
              <br>
              <p>
                  <Cins>${h.Transl(
                    "\u6700\u5927\u5bec\u5ea6"
                  )}</Cins><input type="range" id="ImageMaxWidth" class="slider" min="9" max="100" step="1" value="${
          b[2].RangeValue
        }">
                  <span class="Cshow">${b[2].DisplayText}</span>
              </p>
              <br>
              <p>
                  <Cins>${h.Transl(
                    "\u57fa\u672c\u9ad8\u5ea6"
                  )}</Cins><input type="range" id="ImageBasicHight" class="slider" min="9" max="100" step="1" value="${
          b[3].RangeValue
        }">
                  <span class="Cshow">${b[3].DisplayText}</span>
              </p>
              <br>
              <p>
                  <Cins>${h.Transl(
                    "\u6700\u5927\u9ad8\u5ea6"
                  )}</Cins><input type="range" id="ImageMaxHight" class="slider" min="9" max="100" step="1" value="${
          b[4].RangeValue
        }">
                  <span class="Cshow">${b[4].DisplayText}</span>
              </p>
              <br>
              <p>
                  <Cins>${h.Transl(
                    "\u80cc\u666f\u984f\u8272"
                  )}</Cins><input type="color" id="BackgroundColor" class="color" value="${
          b[5].RangeValue
        }">
                  <span style="margin-right: 17.9rem;"></span><button id="SaveConfig" class="button-sty">${h.Transl(
                    "\u4fdd\u5b58\u8a2d\u7f6e"
                  )}</button>
              </p>
          </div>
      </div>
  `;
        $(document.body).append(b);
        $(".modal-interface").draggable({
          scroll: !0,
          opacity: 0.8,
          cursor: "grabbing",
        });
        var a, d, r;
        u("#BackgroundColor", "input", (k) => {
          a = k.target.id;
          d = $(k.target).val();
          h.StylePointer[a](d);
        });
        u("#ImageSpacing", "input", (k) => {
          r = $(k.target).next(".Cshow");
          a = k.target.id;
          d = $(k.target).val();
          h.StylePointer[a](`${d}rem`);
          r.text(`${d}rem`);
        });
        u("#ImageBasicWidth, #ImageMaxWidth", "input", (k) => {
          r = $(k.target).next(".Cshow");
          a = k.target.id;
          d = $(k.target).val();
          "9" === d
            ? (h.StylePointer[a]("auto"), r.text("auto"))
            : (h.StylePointer[a](`${d}%`), r.text(`${d}%`));
        });
        u("#ImageBasicHight, #ImageMaxHight", "input", (k) => {
          r = $(k.target).next(".Cshow");
          a = k.target.id;
          d = $(k.target).val();
          "9" === d
            ? (h.StylePointer[a]("auto"), r.text("auto"))
            : (h.StylePointer[a](`${d}rem`), r.text(`${d}rem`));
        });
        u("#SaveConfig", "click", function () {
          const k = {};
          k.SwitchStatus = $("#SwitchMode").prop("checked") ? !0 : !1;
          var t = $(".modal-interface");
          const g = t.css("top");
          t = t.css("left");
          k.MenuTop = g;
          k.MenuLeft = t;
          h.StylePointer.MenuTop(g);
          h.StylePointer.MenuLeft(t);
          $(".modal-interface")
            .find("input")
            .not("#SwitchMode")
            .each(function () {
              a = $(this).attr("id");
              d = $(this).val();
              k[a] =
                "ImageSpacing" === a
                  ? `${d}rem`
                  : "ImageBasicWidth" === a || "ImageMaxWidth" === a
                  ? "9" === d
                    ? "auto"
                    : `${d}%`
                  : "ImageBasicHight" === a || "ImageMaxHight" === a
                  ? "9" === d
                    ? "auto"
                    : `${d}rem`
                  : d;
            });
          Syn.Store("s", "Config", k);
          $(".modal-background").remove();
        });
      }
    }
    (async () => {
      Syn.Store("g", "Mode_V2", !1) && Syn.Store("d", "Mode_V2");
      const b = Syn.Store("g", "Settings");
      if (b) {
        Syn.Store("d", "Settings");
        const { ULS: e, BW: f, MW: q, BH: p, MH: n, BC: l, MT: m, ML: c } = b[0];
        Syn.Store("s", "Config", {
          SwitchStatus: !0,
          MenuTop: m,
          MenuLeft: c,
          ImageBasicWidth: f,
          ImageMaxWidth: q,
          ImageBasicHight: p,
          ImageMaxHight: n,
          ImageSpacing: e,
          BackgroundColor: l,
        });
      }
    })();
    const h = (() => {
      const b = () =>
        Syn.Store("g", "Config", null) ?? {
          SwitchStatus: !0,
          MenuTop: "auto",
          MenuLeft: "auto",
          ImageSpacing: "0rem",
          ImageBasicWidth: "100%",
          ImageMaxWidth: "60%",
          ImageBasicHight: "auto",
          ImageMaxHight: "auto",
          BackgroundColor: "#000",
        };
      let e;
      var f = {},
        q = {
          "\u5716\u50cf\u8a2d\u7f6e": "\u56fe\u50cf\u8bbe\u7f6e",
          "\u5716\u50cf\u9593\u8ddd": "\u56fe\u50cf\u95f4\u8ddd",
          "\u57fa\u672c\u5bec\u5ea6": "\u57fa\u672c\u5bbd\u5ea6",
          "\u6700\u5927\u5bec\u5ea6": "\u6700\u5927\u5bbd\u5ea6",
          "\u57fa\u672c\u9ad8\u5ea6": "\u57fa\u672c\u9ad8\u5ea6",
          "\u6700\u5927\u9ad8\u5ea6": "\u6700\u5927\u9ad8\u5ea6",
          "\u80cc\u666f\u984f\u8272": "\u80cc\u666f\u989c\u8272",
          "\u4fdd\u5b58\u8a2d\u7f6e": "\u4fdd\u5b58\u8bbe\u7f6e",
          "\u6efe\u52d5\u95b1\u8b80": "\u6eda\u52a8\u9605\u8bfb",
          "\u7ffb\u9801\u95b1\u8b80": "\u7ffb\u9875\u9605\u8bfb",
          "\ud83d\udd32 \u958b\u95dc\u83dc\u55ae": "\u5f00\u5173\u83dc\u5355",
        };
      f = {
        "zh-TW": f,
        "zh-HK": f,
        "zh-MO": f,
        "zh-CN": q,
        "zh-SG": q,
        "en-US": {
          "\u5716\u50cf\u8a2d\u7f6e": "Image Settings",
          "\u5716\u50cf\u9593\u8ddd": "Image ImageSpacing",
          "\u57fa\u672c\u5bec\u5ea6": "Base Width",
          "\u6700\u5927\u5bec\u5ea6": "Max Width",
          "\u57fa\u672c\u9ad8\u5ea6": "Base Height",
          "\u6700\u5927\u9ad8\u5ea6": "Max Height",
          "\u80cc\u666f\u984f\u8272": "BackgroundColor Color",
          "\u4fdd\u5b58\u8a2d\u7f6e": "Save Settings",
          "\u6efe\u52d5\u95b1\u8b80": "Scroll Read",
          "\u7ffb\u9801\u95b1\u8b80": "TurnPage Read",
          "\ud83d\udd32 \u958b\u95dc\u83dc\u55ae": "Toggle Menu",
        },
        ja: {
          "\u5716\u50cf\u8a2d\u7f6e": "\u753b\u50cf\u8a2d\u5b9a",
          "\u5716\u50cf\u9593\u8ddd": "\u753b\u50cf\u9593\u9694",
          "\u57fa\u672c\u5bec\u5ea6": "\u57fa\u672c\u5e45",
          "\u6700\u5927\u5bec\u5ea6": "\u6700\u5927\u5e45",
          "\u57fa\u672c\u9ad8\u5ea6": "\u57fa\u672c\u9ad8\u3055",
          "\u6700\u5927\u9ad8\u5ea6": "\u6700\u5927\u9ad8\u3055",
          "\u80cc\u666f\u984f\u8272": "\u80cc\u666f\u8272",
          "\u4fdd\u5b58\u8a2d\u7f6e": "\u8a2d\u5b9a\u306e\u4fdd\u5b58",
          "\u6efe\u52d5\u95b1\u8b80":
            "\u30b9\u30af\u30ed\u30fc\u30eb\u8aad\u307f\u53d6\u308a",
          "\u7ffb\u9801\u95b1\u8b80":
            "\u30da\u30fc\u30b8\u8aad\u307f\u53d6\u308a",
          "\ud83d\udd32 \u958b\u95dc\u83dc\u55ae":
            "\u30e1\u30cb\u30e5\u30fc\u306e\u5207\u308a\u66ff\u3048",
        },
      };
      const p = f[Syn.Device.Lang] ?? f["en-US"];
      f = (g) => p[g] ?? g;
      const {
        SwitchStatus: n,
        MenuTop: l,
        MenuLeft: m,
        ImageBasicWidth: c,
        ImageMaxWidth: a,
        ImageBasicHight: d,
        ImageMaxHight: r,
        ImageSpacing: k,
        BackgroundColor: t,
      } = b();
      Syn.AddStyle(`
              .ImageOptimization {
                  display: block;
                  margin: ${k} auto;
                  width: ${c};
                  height: ${d};
                  max-width: ${a};
                  max-height: ${r};
              }
              body {
                  overflow-x: visible !important;
                  background-color: ${t};
              }
              .tocaowrap {
                  width: 100%;
                  margin: 0 auto;
                  padding: 0.1rem;
                  max-width: ${a};
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
                  top: ${l};
                  left: ${m};
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
                  content: "${f("\u6efe\u52d5\u95b1\u8b80")}";
                  padding-left: 1.7rem;
                  background-color: #3d8fe7;
                  color: #FFFFFF;
              }
              .DMS-inner:after {
                  content: "${f("\u7ffb\u9801\u95b1\u8b80")}";
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
                  right: 96px;
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
      setTimeout(() => {
        e = Syn.$$("#New-Style").sheet.cssRules;
      }, 1300);
      return {
        IsMobile: Syn.Device.Url.includes("photos-slist-aid"),
        LoadingConfig: b,
        SwitchStatus: n,
        ConfigAnalyze: (g) =>
          "auto" === g
            ? { RangeValue: 9, DisplayText: "auto" }
            : g.endsWith("rem") || g.endsWith("%")
            ? { RangeValue: parseInt(g), DisplayText: g }
            : { RangeValue: g, DisplayText: "color" },
        StylePointer: {
          MenuTop: (g) => (e[9].style.top = g),
          MenuLeft: (g) => (e[9].style.left = g),
          ImageSpacing: (g) => (e[0].style.margin = `${g} auto`),
          ImageBasicWidth: (g) => (e[0].style.width = g),
          ImageMaxWidth: (g) => {
            e[0].style.maxWidth = g;
            e[2].style.maxWidth = g;
          },
          ImageBasicHight: (g) => (e[0].style.height = g),
          ImageMaxHight: (g) => (e[0].style.maxHeight = g),
          BackgroundColor: (g) => (e[1].style.background = g),
        },
        Transl: f,
      };
    })();
    (async () => {
      if ("Mobile" != Syn.Device.Type())
        if (
          (GM_registerMenuCommand(
            h.Transl("\ud83d\udd32 \u958b\u95dc\u83dc\u55ae"),
            () => v(!0)
          ),
          Syn.AddListener(
            window,
            "keydown",
            (b) => {
              const e = b.key;
              "Shift" === e
                ? (b.preventDefault(), v())
                : "Escape" === e &&
                  (b.preventDefault(), Syn.$$(".modal-background")?.remove());
            },
            { capture: !0 }
          ),
          h.IsMobile)
        ) {
          const b = new Map();
          Syn.WaitElem(
            "#img_list",
            (e) => {
              Syn.Observer(
                e,
                () => {
                  Syn.$$("div", { root: e, all: !0 }).forEach((f) => {
                    b.has(f) ||
                      (b.set(f, !0),
                      (f.style.cssText = "text-align: center"),
                      (f = Syn.$$("img", { root: f })),
                      f.removeAttribute("width"),
                      f.classList.add("ImageOptimization"));
                  });
                },
                { throttle: 1500 }
              );
            },
            { raf: !0, timeout: 10 }
          );
        } else
          Syn.WaitMap(
            ".png.bread;#bread;#photo_body;span.newpagelabel b;#bodywrap;.newpagewrap;.footer.wrap".split(
              ";"
            ),
            (b) => {
              const [e, f, q, p, n, l, m] = b;
              ReactDOM.render(
                React.createElement("div", {
                  dangerouslySetInnerHTML: { __html: e.innerHTML },
                }),
                f
              );
              q.classList.remove("photo_body");
              [n, l, m].forEach((c) => {
                c.style.display = "none";
              });
              w(q, +p.textContent);
            },
            { raf: !0, timeout: 10 }
          );
    })();
  })();
// ==UserScript==
// @name         [E/Ex-Hentai] AutoLogin
// @name:zh-TW   [E/Ex-Hentai] 自動登入
// @name:zh-CN   [E/Ex-Hentai] 自动登入
// @name:ja      [E/Ex-Hentai] 自動ログイン
// @name:ko      [E/Ex-Hentai] 자동 로그인
// @name:en      [E/Ex-Hentai] AutoLogin
// @version      0.0.32
// @author       Canaan HS
// @description         E/Ex - 共享帳號登入、自動獲取 Cookies、手動輸入 Cookies、本地備份以及查看備份，自動檢測登入
// @description:zh-TW   E/Ex - 共享帳號登入、自動獲取 Cookies、手動輸入 Cookies、本地備份以及查看備份，自動檢測登入
// @description:zh-CN   E/Ex - 共享帐号登录、自动获取 Cookies、手动输入 Cookies、本地备份以及查看备份，自动检测登录
// @description:ja      E/Ex - 共有アカウントでのログイン、クッキーの自动取得、クッキーの手动入力、ローカルバックアップおよびバックアップの表示、自动ログインの検出
// @description:ko      E/Ex - 공유 계정 로그인, 자동으로 쿠키 가져오기, 쿠키 수동 입력, 로컬 백업 및 백업 보기, 자동 로그인 감지
// @description:en      E/Ex - Shared account login, automatic cookie retrieval, manual cookie input, local backup, and backup viewing, automatic login detection

// @connect      *
// @match        *://e-hentai.org/*
// @match        *://exhentai.org/*
// @icon         https://e-hentai.org/favicon.ico

// @license      MIT
// @namespace    https://greasyfork.org/users/989635

// @run-at       document-start
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_notification
// @grant        GM_xmlhttpRequest
// @grant        GM_getResourceText
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @grant        GM_addValueChangeListener

// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/blueimp-md5/2.19.0/js/md5.min.js
// @require      https://update.greasyfork.org/scripts/495339/1496879/ObjectSyntax_min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery-jgrowl/1.4.9/jquery.jgrowl.min.js
// @resource     jgrowl-css https://cdnjs.cloudflare.com/ajax/libs/jquery-jgrowl/1.4.9/jquery.jgrowl.min.css
// ==/UserScript==
(async () => {
    const domain = Syn.Device.Host;
    (async function ImportStyle() {
        let show_style, button_style, button_hover, jGrowl_style, acc_style;
        if (domain == "e-hentai.org") {
            button_hover = "color: #8f4701;";
            jGrowl_style = "background-color: #5C0D12; color: #fefefe;";
            show_style = "background-color: #fefefe; border: 3px ridge #34353b;";
            acc_style = "color: #5C0D12; background-color: #fefefe; border: 2px solid #B5A4A4;";
            button_style = "color: #5C0D12; border: 2px solid #B5A4A4; background-color: #fefefe;";
        } else if (domain == "exhentai.org") {
            button_hover = "color: #989898;";
            jGrowl_style = "background-color: #fefefe; color: #5C0D12;";
            show_style = "background-color: #34353b; border: 2px ridge #5C0D12;";
            acc_style = "color: #f1f1f1; background-color: #34353b; border: 2px solid #8d8d8d;";
            button_style = "color: #fefefe; border: 2px solid #8d8d8d; background-color: #34353b;";
            Syn.AddStyle(`
                body {
                    padding: 2px;
                    color: #f1f1f1;
                    text-align: center;
                    background: #34353b;
                }
            `);
        }
        Syn.AddStyle(`
            ${GM_getResourceText("jgrowl-css")}
            .jGrowl {
                ${jGrowl_style}
                top: 2rem;
                left: 50%;
                width: auto;
                z-index: 9999;
                font-size: 1.3rem;
                border-radius: 2px;
                text-align: center;
                white-space: nowrap;
                transform: translateX(-50%);
            }
            .modal-background {
                top: 50%;
                left: 50%;
                opacity: 0;
                width: 100%;
                height: 100%;
                z-index: 8888;
                overflow: auto;
                position: fixed;
                transition: 0.6s ease;
                background-color: rgba(0,0,0,0);
                transform: translate(-50%, -50%) scale(0.3);
            }
            .acc-modal {
                ${show_style}
                width: 18%;
                overflow: auto;
                margin: 11rem auto;
                border-radius: 10px;
            }
            .acc-select-flex {
                display: flex;
                align-items: center;
                flex-direction: initial;
                justify-content: space-around;
            }
            .acc-button-flex {
                display: flex;
                padding: 0 0 15px 0;
                justify-content: center;
            }
            .acc-select {
                ${acc_style}
                width: 10rem;
                padding: 4px;
                margin: 1.1rem 1.4rem 1.5rem 1.4rem;
                font-weight: bold;
                cursor: pointer;
                font-size: 1.2rem;
                text-align: center;
                border-radius: 5px;
            }
            .show-modal {
                ${show_style}
                width: 25%;
                padding: 1.5rem;
                overflow: auto;
                margin: 5rem auto;
                text-align: left;
                border-radius: 10px;
                border-collapse: collapse;
            }
            .modal-button {
                ${button_style}
                top: 0;
                margin: 3% 2%;
                font-size: 14px;
                font-weight: bold;
                border-radius: 3px;
            }
            .modal-button:hover, .modal-button:focus {
                ${button_hover}
                cursor: pointer;
                text-decoration: none;
            }
            .set-modal {
                ${show_style}
                width: 30%;
                padding: 0.3rem;
                overflow: auto;
                border-radius: 10px;
                text-align: center;
                border-collapse: collapse;
                margin: 2% auto 8px auto;
            }
            .set-box {
                display: flex;
                margin: 0.6rem;
                font-weight: bold;
                flex-direction: column;
                align-items: flex-start;
            }
            .set-list {
                width: 95%;
                font-weight: 550;
                font-size: 1.1rem;
                text-align: center;
            }
            hr {
                width: 98%;
                opacity: 0.2;
                border: 1px solid;
                margin-top: 1.3rem;
            }
            label {
                margin: 0.4rem;
                font-size: 0.9rem;
            }
        `);
    })();
    const Lang = (lang => {
        const Word = {
            Traditional: {},
            Simplified: {
                "🍪 共享登入": "🍪 共享登录",
                "🟢 啟用檢測": "🟢 启用检测",
                "🔴 禁用檢測": "🔴 禁用检测",
                "📂 展開菜單": "📂 展开菜单",
                "📁 摺疊菜單": "📁 折叠菜单",
                "📜 自動獲取": "📜 自动获取",
                "📝 手動輸入": "📝 手动输入",
                "🔍 查看保存": "🔍 查看保存",
                "🔃 手動注入": "🔃 手动注入",
                "🗑️ 清除登入": "🗑️ 清除登录",
                "帳戶": "账户",
                "更新": "更新",
                "登入": "登录",
                "確認選擇的 Cookies": "确认选择的 Cookies",
                "確認保存": "确认保存",
                "取消退出": "取消退出",
                "退出選單": "退出菜单",
                "保存成功!": "保存成功!",
                "更改保存": "更改保存",
                "變更通知": "变更通知",
                "已保存變更": "已保存变更",
                "設置 Cookies": "设置 Cookies",
                "要登入 Ex 才需要填寫": "要登录 Ex 才需要填写",
                "必填項目": "必填项目",
                "下方選填 也可不修改": "下方选填 也可不修改",
                "[確認輸入正確]按下退出選單保存": "[确认输入正确]按下退出菜单保存",
                "當前設置 Cookies": "当前设置 Cookies",
                "帳戶選擇": "账户选择",
                "未獲取到 Cookies !!\n\n請先登入帳戶": "未获取到 Cookies !!\n\n请先登录账户",
                "未檢測到可注入的 Cookies !!\n\n請從選單中進行設置": "未检测到可注入的 Cookies !!\n\n请从菜单中进行设置",
                "共享數據更新完成": "共享数据更新完成",
                "共享數據無需更新": "共享数据无需更新",
                "共享數據獲取失敗": "共享数据获取失败",
                "無保存的 Cookie, 無法啟用自動登入": "无保存的 Cookie，无法启用自动登录",
                "請求為空數據": "请求为空数据",
                "連線異常，更新地址可能是錯的": "连接异常，更新地址可能是错的",
                "請求錯誤: ": "请求错误: "
            },
            English: {
                "🍪 共享登入": "🍪 Shared Login",
                "🟢 啟用檢測": "🟢 Enable Detection",
                "🔴 禁用檢測": "🔴 Disable Detection",
                "📂 展開菜單": "📂 Expand Menu",
                "📁 摺疊菜單": "📁 Collapse Menu",
                "📜 自動獲取": "📜 Auto Retrieve",
                "📝 手動輸入": "📝 Manual Input",
                "🔍 查看保存": "🔍 View Saved",
                "🔃 手動注入": "🔃 Manual Injection",
                "🗑️ 清除登入": "🗑️ Clear Login",
                "帳戶": "Account",
                "更新": "Update",
                "登入": "Login",
                "確認選擇的 Cookies": "Confirm Selected Cookies",
                "確認保存": "Confirm Save",
                "取消退出": "Cancel Exit",
                "退出選單": "Exit Menu",
                "保存成功!": "Save Successful!",
                "更改保存": "Change Saved",
                "變更通知": "Change Notification",
                "已保存變更": "Changes Saved",
                "設置 Cookies": "Set Cookies",
                "要登入 Ex 才需要填寫": "Required for Ex Login",
                "必填項目": "Mandatory Field",
                "下方選填 也可不修改": "Optional Below, No Changes Needed",
                "[確認輸入正確]按下退出選單保存": "[Confirm Correct Input] Press Exit Menu to Save",
                "當前設置 Cookies": "Current Set Cookies",
                "帳戶選擇": "Account Selection",
                "未獲取到 Cookies !!\n\n請先登入帳戶": "No Cookies Retrieved !!\n\nPlease Login First",
                "未檢測到可注入的 Cookies !!\n\n請從選單中進行設置": "No Injectable Cookies Detected !!\n\nPlease Set in Menu",
                "共享數據更新完成": "Shared data update completed",
                "共享數據無需更新": "No need to update shared data",
                "共享數據獲取失敗": "Shared Data Retrieval Failed",
                "無保存的 Cookie, 無法啟用自動登入": "No saved cookies, unable to enable auto-login",
                "請求為空數據": "Request Contains No Data",
                "連線異常，更新地址可能是錯的": "Connection error, the update address may be incorrect",
                "請求錯誤: ": "Request Error: "
            },
            Korea: {
                "🍪 共享登入": "🍪 공유 로그인",
                "🟢 啟用檢測": "🟢 감지 활성화",
                "🔴 禁用檢測": "🔴 감지 비활성화",
                "📂 展開菜單": "📂 메뉴 확장",
                "📁 摺疊菜單": "📁 메뉴 축소",
                "📜 自動獲取": "📜 자동 가져오기",
                "📝 手動輸入": "📝 수동 입력",
                "🔍 查看保存": "🔍 저장 보기",
                "🔃 手動注入": "🔃 수동 주입",
                "🗑️ 清除登入": "🗑️ 로그인 지우기",
                "確認選擇的 Cookies": "선택한 쿠키 확인",
                "帳戶": "계정",
                "更新": "업데이트",
                "登入": "로그인",
                "確認保存": "저장 확인",
                "取消退出": "취소 종료",
                "退出選單": "메뉴 종료",
                "保存成功!": "저장 성공!",
                "更改保存": "변경 저장",
                "變更通知": "변경 알림",
                "已保存變更": "변경 사항 저장됨",
                "設置 Cookies": "쿠키 설정",
                "要登入 Ex 才需要填寫": "Ex 로그인에 필요",
                "必填項目": "필수 항목",
                "下方選填 也可不修改": "아래 선택 항목, 변경 필요 없음",
                "[確認輸入正確]按下退出選單保存": "[입력 정확성 확인] 메뉴 종료를 눌러 저장",
                "當前設置 Cookies": "현재 설정된 쿠키",
                "帳戶選擇": "계정 선택",
                "未獲取到 Cookies !!\n\n請先登入帳戶": "쿠키를 가져오지 못했습니다 !!\n\n먼저 로그인 해주세요",
                "未檢測到可注入的 Cookies !!\n\n請從選單中進行設置": "주입 가능한 쿠키를 감지하지 못했습니다 !!\n\n메뉴에서 설정해 주세요",
                "共享數據更新完成": "공유 데이터 업데이트 완료",
                "共享數據無需更新": "공유 데이터 업데이트 필요 없음",
                "共享數據獲取失敗": "공유 데이터 가져오기 실패",
                "無保存的 Cookie, 無法啟用自動登入": "저장된 쿠키가 없어 자동 로그인을 활성화할 수 없습니다",
                "請求為空數據": "요청 데이터가 비어 있습니다",
                "連線異常，更新地址可能是錯的": "연결 이상, 업데이트 주소가 잘못되었을 수 있습니다",
                "請求錯誤: ": "요청 오류: "
            },
            Japan: {
                "🍪 共享登入": "🍪 共有ログイン",
                "🟢 啟用檢測": "🟢 検出を有効化",
                "🔴 禁用檢測": "🔴 検出を無効化",
                "📂 展開菜單": "📂 メニュー展開",
                "📁 摺疊菜單": "📁 メニュー折りたたみ",
                "📜 自動獲取": "📜 自動取得",
                "📝 手動輸入": "📝 手動入力",
                "🔍 查看保存": "🔍 保存を表示",
                "🔃 手動注入": "🔃 手動注入",
                "🗑️ 清除登入": "🗑️ ログインクリア",
                "帳戶": "アカウント",
                "更新": "更新",
                "登入": "ログイン",
                "確認選擇的 Cookies": "選択したクッキーを確認",
                "確認保存": "保存を確認",
                "取消退出": "キャンセルして終了",
                "退出選單": "メニューを終了",
                "保存成功!": "保存成功!",
                "更改保存": "変更を保存",
                "變更通知": "変更通知",
                "已保存變更": "変更が保存されました",
                "設置 Cookies": "クッキーを設定",
                "要登入 Ex 才需要填寫": "Exログインに必要",
                "必填項目": "必須項目",
                "下方選填 也可不修改": "下の選択肢、変更の必要はありません",
                "[確認輸入正確]按下退出選單保存": "[入力が正しいことを確認] メニュー終了を押して保存",
                "當前設置 Cookies": "現在設定されているクッキー",
                "帳戶選擇": "アカウント選択",
                "未獲取到 Cookies !!\n\n請先登入帳戶": "クッキーを取得できませんでした!!\n\n先にログインしてください",
                "未檢測到可注入的 Cookies !!\n\n請從選單中進行設置": "注入可能なクッキーが検出されませんでした!!\n\nメニューから設定してください",
                "共享數據更新完成": "共有データの更新が完了しました",
                "共享數據無需更新": "共有データを更新する必要がありません",
                "共享數據獲取失敗": "共有データの取得に失敗しました",
                "無保存的 Cookie, 無法啟用自動登入": "保存された Cookie がないため、自動ログインを有効にできません",
                "請求為空數據": "リクエストが空データです",
                "連線異常，更新地址可能是錯的": "接続異常、更新されたアドレスが間違っている可能性があります",
                "請求錯誤: ": "リクエストエラー: "
            }
        }, Match = {
            ko: Word.Korea,
            ja: Word.Japan,
            "en-US": Word.English,
            "zh-CN": Word.Simplified,
            "zh-SG": Word.Simplified,
            "zh-TW": Word.Traditional,
            "zh-HK": Word.Traditional,
            "zh-MO": Word.Traditional
        }, ML = Match[lang] ?? Match["en-US"];
        return {
            Transl: Str => ML[Str] ?? Str
        };
    })(Syn.Device.Lang);
    const Ckop = (() => {
        let Cookie = undefined;
        const Today = new Date();
        Today.setFullYear(Today.getFullYear() + 1);
        const Expires = Today.toUTCString();
        const UnixUTC = new Date(0).toUTCString();
        let RequiredCookie = ["ipb_member_id", "ipb_pass_hash"];
        if (domain == "exhentai.org") RequiredCookie.unshift("igneous");
        return {
            Get: () => {
                return document.cookie.split("; ").reduce((acc, cookie) => {
                    const [name, value] = cookie.split("=");
                    acc[decodeURIComponent(name)] = decodeURIComponent(value);
                    return acc;
                }, {});
            },
            Add: function (CookieObject) {
                Syn.Storage("DetectionTime", {
                    type: localStorage,
                    value: new Date().getTime()
                });
                for (Cookie of CookieObject) {
                    document.cookie = `${encodeURIComponent(Cookie.name)}=${encodeURIComponent(Cookie.value)}; domain=.${domain}; path=/; expires=${Expires};`;
                }
                location.reload();
            },
            Delete: function () {
                Object.keys(this.Get()).forEach(Name => {
                    document.cookie = `${Name}=; expires=${UnixUTC}; path=/;`;
                    document.cookie = `${Name}=; expires=${UnixUTC}; path=/; domain=.${domain}`;
                });
            },
            ReAdd: function (Cookies) {
                this.Delete();
                this.Add(Cookies);
            },
            Verify: function (Cookies) {
                const Cookie = this.Get();
                const VCookie = new Set(Object.keys(Cookie));
                const Result = RequiredCookie.every(key => VCookie.has(key) && Cookie[key] !== "mystery");
                if (!Result) {
                    this.ReAdd(Cookies);
                } else {
                    Syn.Storage("DetectionTime", {
                        type: localStorage,
                        value: new Date().getTime()
                    });
                }
            }
        };
    })();
    new class AutoLogin {
        constructor() {
            this.modal = null;
            this.Share = Syn.Store("g", "Share") ?? this.UpdateShared();
            this.on = async (element, type, listener) => {
                $(element).on(type, listener);
            };
            this.Growl = async (message, theme, life) => {
                $.jGrowl(`&emsp;&emsp;${message}&emsp;&emsp;`, {
                    theme: theme,
                    life: life
                });
            };
            this.CreateDetection = () => {
                const detection = $(".modal-background");
                detection[0] && detection.remove();
            };
            this.CreateMenu = async () => {
                $(document.body).append(this.modal);
                requestAnimationFrame(() => {
                    $(".modal-background").css({
                        opacity: "1",
                        "background-color": "rgba(0,0,0,0.7)",
                        transform: "translate(-50%, -50%) scale(1)"
                    });
                });
            };
            this.DeleteMenu = async () => {
                const modal = $(".modal-background");
                modal.css({
                    opacity: "0",
                    "pointer-events": "none",
                    "background-color": "rgba(0,0,0,0)",
                    transform: "translate(-50%, -50%) scale(0)"
                });
                setTimeout(() => {
                    modal.remove();
                }, 1300);
            };
            this.GlobalMenuToggle = async () => {
                Syn.StoreListen(["Expand"], listen => {
                    listen.far && this.MenuToggle();
                });
            };
            this.LoginToggle = async () => {
                const cookie = Boolean(Syn.Store("gj", "E/Ex_Cookies"));
                const state = Syn.Store("g", "Login", cookie);
                const disp = state ? Lang.Transl("🟢 啟用檢測") : Lang.Transl("🔴 禁用檢測");
                Syn.Menu({
                    [disp]: {
                        func: () => {
                            if (state) Syn.Store("s", "Login", false); else if (cookie) Syn.Store("s", "Login", true); else {
                                alert(Lang.Transl("無保存的 Cookie, 無法啟用自動登入"));
                                return;
                            }
                            this.LoginToggle();
                        }
                    }
                }, "Switch1");
            };
            this.MenuToggle = async () => {
                const state = Syn.Store("g", "Expand", false), disp = state ? Lang.Transl("📁 摺疊菜單") : Lang.Transl("📂 展開菜單");
                Syn.Menu({
                    [disp]: {
                        func: () => {
                            state ? Syn.Store("s", "Expand", false) : Syn.Store("s", "Expand", true);
                            this.MenuToggle();
                        },
                        hotkey: "c"
                    }
                }, "Switch2");
                state ? this.Expand() : this.Collapse();
            };
            this.Expand = async () => {
                Syn.Menu({
                    [Lang.Transl("📜 自動獲取")]: {
                        func: () => this.GetCookieAutomatically()
                    },
                    [Lang.Transl("📝 手動輸入")]: {
                        func: () => this.ManualSetting()
                    },
                    [Lang.Transl("🔍 查看保存")]: {
                        func: () => this.ViewSaveCookie()
                    },
                    [Lang.Transl("🔃 手動注入")]: {
                        func: () => this.CookieInjection()
                    },
                    [Lang.Transl("🗑️ 清除登入")]: {
                        func: () => this.ClearLogin()
                    }
                }, "Expand");
            };
            this.Collapse = async () => {
                for (let i = 1; i <= 5; i++) {
                    GM_unregisterMenuCommand("Expand-" + i);
                }
            };
        }
        async Main() {
            const cookie = Syn.Store("gj", "E/Ex_Cookies");
            const login = Syn.Store("g", "Login", Boolean(cookie));
            if (login && cookie) {
                let CurrentTime = new Date(), DetectionTime = Syn.Storage("DetectionTime", {
                    type: localStorage
                });
                DetectionTime = DetectionTime ? new Date(DetectionTime) : new Date(CurrentTime.getTime() + 11 * 60 * 1e3);
                const Conversion = Math.abs(DetectionTime - CurrentTime) / (1e3 * 60);
                if (Conversion >= 10) Ckop.Verify(cookie);
            }
            this.LoginToggle();
            Syn.Menu({
                [Lang.Transl("🍪 共享登入")]: {
                    func: () => this.SharedLogin()
                }
            });
            this.MenuToggle();
            this.GlobalMenuToggle();
        }
        async GetSharedDict() {
            return new Promise((resolve, reject) => {
                GM_xmlhttpRequest({
                    method: "GET",
                    responseType: "json",
                    url: "https://raw.githubusercontent.com/Canaan-HS/Script-DataBase/main/Share/ExShare.json",
                    onload: response => {
                        if (response.status === 200) {
                            const data = response.response;
                            if (typeof data === "object" && Object.keys(data).length > 0) {
                                resolve(data);
                            } else {
                                console.error(Lang.Transl("請求為空數據"));
                                resolve({});
                            }
                        } else {
                            console.error(Lang.Transl("連線異常，更新地址可能是錯的"));
                            resolve({});
                        }
                    },
                    onerror: error => {
                        console.error(Lang.Transl("請求錯誤: "), error);
                        resolve({});
                    }
                });
            });
        }
        async UpdateShared() {
            const Shared = await this.GetSharedDict();
            if (Object.keys(Shared).length > 0) {
                const localHash = md5(JSON.stringify(Syn.Store("g", "Share", {})));
                const remoteHash = md5(JSON.stringify(Shared));
                if (localHash !== remoteHash) {
                    this.Share = Shared;
                    Syn.Store("s", "Share", Shared);
                    this.Growl(Lang.Transl("共享數據更新完成"), "jGrowl", 1500);
                    const modal = Syn.$$(".modal-background");
                    if (modal) {
                        setTimeout(() => {
                            modal.remove();
                            this.SharedLogin();
                        }, 600);
                    }
                } else {
                    this.Growl(Lang.Transl("共享數據無需更新"), "jGrowl", 1500);
                }
            } else {
                Syn.Store("s", "Share", {});
                this.Growl(Lang.Transl("共享數據獲取失敗"), "jGrowl", 1500);
            }
        }
        async SharedLogin() {
            this.CreateDetection();
            const Share = this.Share, AccountQuantity = Object.keys(Share).length, Igneous = Ckop.Get().igneous;
            let Select = $(`<select id="account-select" class="acc-select"></select>`), Value;
            for (let i = 1; i <= AccountQuantity; i++) {
                if (Share[i][0].value == Igneous) {
                    Value = i;
                }
                Select.append($("<option>").attr({
                    value: i
                }).text(`${Lang.Transl("帳戶")} ${i}`));
            }
            this.modal = $(`
                <div class="modal-background">
                    <div class="acc-modal">
                        <h1>${Lang.Transl("帳戶選擇")}</h1>
                        <div class="acc-select-flex">${Select.prop("outerHTML")}</div>
                        <div class="acc-button-flex">
                            <button class="modal-button" id="update">${Lang.Transl("更新")}</button>
                            <button class="modal-button" id="login">${Lang.Transl("登入")}</button>
                        </div>
                    </div>
                </div>
            `);
            this.CreateMenu();
            Value && $("#account-select").val(Value);
            const self = this;
            self.on(".modal-background", "click", function (click) {
                click.stopImmediatePropagation();
                const target = click.target;
                if (target.id == "login") {
                    Ckop.ReAdd(Share[+$("#account-select").val()]);
                } else if (target.id == "update") {
                    self.UpdateShared();
                } else if (target.className == "modal-background") {
                    self.DeleteMenu();
                }
            });
        }
        async GetCookieAutomatically() {
            let cookie_box = [];
            for (const [name, value] of Object.entries(Ckop.Get())) {
                cookie_box.push({
                    name: name,
                    value: value
                });
            }
            cookie_box.length > 1 ? this.Cookie_Show(JSON.stringify(cookie_box, null, 4)) : alert(Lang.Transl("未獲取到 Cookies !!\n\n請先登入帳戶"));
        }
        async Cookie_Show(cookies) {
            this.CreateDetection();
            this.modal = `
                <div class="modal-background">
                    <div class="show-modal">
                    <h1 style="text-align: center;">${Lang.Transl("確認選擇的 Cookies")}</h1>
                        <pre><b>${cookies}</b></pre>
                        <div style="text-align: right;">
                            <button class="modal-button" id="save">${Lang.Transl("確認保存")}</button>
                            <button class="modal-button" id="close">${Lang.Transl("取消退出")}</button>
                        </div>
                    </div>
                </div>
            `;
            this.CreateMenu();
            const self = this;
            self.on(".modal-background", "click", function (click) {
                click.stopImmediatePropagation();
                const target = click.target;
                if (target.id == "save") {
                    Syn.Store("s", "E/Ex_Cookies", cookies);
                    self.Growl(Lang.Transl("保存成功!"), "jGrowl", 1500);
                    self.DeleteMenu();
                } else if (target.className == "modal-background" || target.id == "close") {
                    self.DeleteMenu();
                }
            });
        }
        async ManualSetting() {
            this.CreateDetection();
            this.modal = `
                <div class="modal-background">
                    <div class="set-modal">
                    <h1>${Lang.Transl("設置 Cookies")}</h1>
                        <form id="set_cookies">
                            <div id="input_cookies" class="set-box">
                                <label>[igneous]：</label><input class="set-list" type="text" name="igneous" placeholder="${Lang.Transl("要登入 Ex 才需要填寫")}"><br>
                                <label>[ipb_member_id]：</label><input class="set-list" type="text" name="ipb_member_id" placeholder="${Lang.Transl("必填項目")}" required><br>
                                <label>[ipb_pass_hash]：</label><input class="set-list" type="text" name="ipb_pass_hash" placeholder="${Lang.Transl("必填項目")}" required><hr>
                                <h3>${Lang.Transl("下方選填 也可不修改")}</h3>
                                <label>[sl]：</label><input class="set-list" type="text" name="sl" value="dm_2"><br>
                                <label>[sk]：</label><input class="set-list" type="text" name="sk"><br>
                            </div>
                            <button type="submit" class="modal-button" id="save">${Lang.Transl("確認保存")}</button>
                            <button class="modal-button" id="close">${Lang.Transl("退出選單")}</button>
                        </form>
                    </div>
                </div>
            `;
            this.CreateMenu();
            let cookie;
            const textarea = $("<textarea>").attr({
                style: "margin: 1.15rem auto 0 auto",
                rows: 18,
                cols: 40,
                readonly: true
            }), self = this;
            self.on("#set_cookies", "submit", function (submit) {
                submit.preventDefault();
                submit.stopImmediatePropagation();
                const cookie_list = Array.from($("#set_cookies .set-list")).map(function (input) {
                    const value = $(input).val();
                    return value.trim() !== "" ? {
                        name: $(input).attr("name"),
                        value: value
                    } : null;
                }).filter(Boolean);
                cookie = JSON.stringify(cookie_list, null, 4);
                textarea.val(cookie);
                $("#set_cookies div").append(textarea);
                self.Growl(Lang.Transl("[確認輸入正確]按下退出選單保存"), "jGrowl", 3e3);
            });
            self.on(".modal-background", "click", function (click) {
                click.stopImmediatePropagation();
                const target = click.target;
                if (target.className == "modal-background" || target.id == "close") {
                    click.preventDefault();
                    cookie && Syn.Store("s", "E/Ex_Cookies", cookie);
                    self.DeleteMenu();
                }
            });
        }
        async ViewSaveCookie() {
            this.CreateDetection();
            this.modal = `
                <div class="modal-background">
                    <div class="set-modal">
                    <h1>${Lang.Transl("當前設置 Cookies")}</h1>
                        <div id="view_cookies" style="margin: 0.6rem"></div>
                        <button class="modal-button" id="save">${Lang.Transl("更改保存")}</button>
                        <button class="modal-button" id="close">${Lang.Transl("退出選單")}</button>
                    </div>
                </div>
            `;
            this.CreateMenu();
            const cookie = Syn.Store("gj", "E/Ex_Cookies");
            const textarea = $("<textarea>").attr({
                rows: 20,
                cols: 50,
                id: "view_SC",
                style: "margin-top: 1.25rem;"
            }), self = this;
            textarea.val(JSON.stringify(cookie, null, 4));
            $("#view_cookies").append(textarea);
            self.on(".modal-background", "click", function (click) {
                click.stopImmediatePropagation();
                const target = click.target;
                if (target.id == "save") {
                    GM_notification({
                        title: Lang.Transl("變更通知"),
                        text: Lang.Transl("已保存變更"),
                        image: "https://cdn-icons-png.flaticon.com/512/5234/5234222.png",
                        timeout: 3e3
                    });
                    Syn.Store("sj", "E/Ex_Cookies", JSON.parse($("#view_SC").val()));
                    self.DeleteMenu();
                } else if (target.className == "modal-background" || target.id == "close") {
                    self.DeleteMenu();
                }
            });
        }
        async CookieInjection() {
            try {
                Ckop.ReAdd(Syn.Store("gj", "E/Ex_Cookies"));
            } catch (error) {
                alert(Lang.Transl("未檢測到可注入的 Cookies !!\n\n請從選單中進行設置"));
            }
        }
        async ClearLogin() {
            Ckop.Delete();
            location.reload();
        }
    }().Main();
})();
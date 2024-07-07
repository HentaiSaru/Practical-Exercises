// ==UserScript==
// @name         本地文本翻譯器
// @version      0.0.1
// @author       Canaan HS
// @description  實驗練習

// @noframes
// @match        *://nhentai.net/*
// @match        *://danbooru.donmai.us/*

// @license      MIT
// @namespace    https://greasyfork.org/users/989635

// @run-at       document-start
// ==/UserScript==

(async function() {

    // 類型標籤
    const Tags1 = {
        "sex": "性愛",
        "big breasts": "大乳房",
        "kunoichi": "女忍者",
        "ponytail": "馬尾",
        "nakadashi": "中出",
        "doujinshi": "同人誌",
        "cosplay": "角色扮演",
        "sole male": "唯一男性",
        "sole female": "唯一女性",
        "completely nude": "完全裸體",
    };

    // 作品標籤
    const Tags2 = {
        "hololive": "Holo Live",
        "fate": "Fate",
        "bleach": "死神",
        "touhou": "東方",
        "star rail": "星鐵",
        "umamusume": "賽馬娘",
        "azurlane": "碧藍航線",
        "arknights": "明日方舟",
        "azur lane": "碧藍航線",
        "azur_lane": "碧藍航線",
        "eldenring": "艾爾登法環",
        "genshinimpact": "原神",
        "elden ring": "艾爾登法環",
        "elden_ring": "艾爾登法環",
        "bluearchive": "蔚藍檔案",
        "genshin impact": "原神",
        "genshin_impact": "原神",
        "wutheringwaves": "鳴潮",
        "blue archive": "蔚藍檔案",
        "blue_archive": "蔚藍檔案",
        "wuthering waves": "鳴潮",
        "wuthering_waves": "鳴潮",
        "kantaicollection": "艦隊收藏",
        "zenless zone zero": "絕區零",
        "zenless_zone_zero": "絕區零",
        "kantai collection": "艦隊收藏",
        "kantai_collection": "艦隊收藏",
        "honkai: star rail": "崩壞：星穹鐵道",
        "goddess of victory: nikke": "勝利女神：妮姬"
    };

    // 角色標籤
    const Tags3 = {
        "firefly": "流螢",
        "belle": "鈴",
        "lucy": "露西",
        "qingyi": "青衣",
        "soukaku": "蒼角",
        "zhu yuan": "朱鳶",
        "ellen joe": "艾蓮·喬",
        "soldier 11": "11號",
        "ben bigger": "本·比格",
        "billy kid": "比利·奇德",
        "von lycaon": "馮·萊卡恩",
        "piper wheel": "派派·韋爾",
        "alexandrina": "亞歷山德麗娜",
        "hoshimi miyabi": "星見雅",
        "nekomiya mana": "貓宮又奈",
        "anby demara": "安比·德瑪拉",
        "corin wickes": "可琳·威克斯",
        "grace howard": "格莉絲·霍華德",
        "anton ivanov": "安東·伊萬諾夫",
        "nicole demara": "妮可·德瑪拉",
        "koleda belobog": "珂蕾妲·貝洛伯格"
    };

    // 長句子
    const LongWords = {
        "sign in": "登入",
        "post tags": "發佈標籤",
        "find similar": "尋找類似",
        "post a comment": "發佈評論",
        "view original": "查看原圖",
        "more like this": "更多類似",
        "setting weights": "設定權重",
        "resize to window": "調整視窗大小",
        "there are no comments": "沒有評論",
        "artist's commentary": "藝術家的評論",
        "tags export settings": "標籤導出設定",
        "this post is pending approval.": "這篇文章正在等待審核",
    };

    // 單詞
    const SingleWords = {
        "second": "秒",
        "hour": "小時",
        "minutes": "分鐘",
        "day": "天",
        "year": "年",
        "month": "月",
        "translated": "已翻譯",
        "series": "系列",
        "or": "或",
        "ago": "前",
        "all": "全部",
        "hot": "熱門",
        "tag": "標籤",
        "new": "新的",
        "old": "舊的",
        "info": "資訊",
        "week": "星期",
        "name": "名稱",
        "size": "大小",
        "view": "查看",
        "wiki": "維基",
        "none": "沒有",
        "more": "更多",
        "date": "日期",
        "help": "幫助",
        "weeks": "周",
        "huge": "巨大",
        "page": "頁面",
        "tags": "標籤",
        "note": "筆記",
        "home": "首頁",
        "like": "喜歡",
        "save": "保存",
        "edit": "編輯",
        "post": "帖子",
        "send": "發送",
        "user": "用戶",
        "file": "文件",
        "pools": "泳池",
        "count": "數量",
        "terms": "條款",
        "months": "月",
        "using": "使用",
        "prev": "上一個",
        "next": "下一個",
        "posts": "貼文",
        "forum": "論壇",
        "login": "登錄",
        "score": "分數",
        "small": "小的",
        "large": "大的",
        "pages": "頁面",
        "notes": "筆記",
        "likes": "喜歡",
        "share": "分享",
        "reply": "回覆",
        "block": "封鎖",
        "sent": "已發送",
        "users": "用戶",
        "media": "媒體",
        "image": "圖片",
        "video": "影片",
        "audio": "音頻",
        "files": "文件",
        "guest": "訪客",
        "theme": "主題",
        "group": "群組",
        "status": "狀態",
        "active": "活躍",
        "groups": "群組",
        "random": "隨機",
        "invert": "反選",
        "search": "搜索",
        "export": "導出",
        "enable": "啟用",
        "medium": "中等",
        "absurd": "荒謬",
        "source": "來源",
        "rating": "評分",
        "option": "選項",
        "change": "改變",
        "uploads": "上傳",
        "upload": "上傳",
        "report": "舉報",
        "saved": "已保存",
        "delete": "刪除",
        "follow": "關注",
        "logout": "登出",
        "signup": "註冊",
        "images": "圖片",
        "videos": "影片",
        "audios": "音頻",
        "admin": "管理員",
        "member": "成員",
        "themes": "主題",
        "public": "公開",
        "create": "創建",
        "update": "更新",
        "remove": "移除",
        "liked": "已喜歡",
        "privacy": "隱私",
        "upgrade": "升級",
        "contact": "聯繫",
        "gallery": "畫廊",
        "chinese": "中文",
        "popular": "熱門",
        "disable": "停用",
        "history": "歷史",
        "listing": "清單",
        "options": "選項",
        "changes": "改變",
        "setting": "設定",
        "artist": "藝術家",
        "comment": "評論",
        "email": "電子郵件",
        "shared": "已分享",
        "replies": "回覆",
        "edited": "已編輯",
        "posted": "已發布",
        "message": "消息",
        "receive": "接收",
        "mention": "提到",
        "content": "內容",
        "viewed": "已查看",
        "recent": "最近的",
        "banned": "被禁止",
        "private": "私人",
        "related": "有關的",
        "register": "註冊",
        "deleted": "已刪除",
        "download": "下載",
        "gigantic": "超大",
        "parodies": "二創",
        "settings": "設置",
        "artists": "藝術家",
        "language": "語言",
        "category": "類別",
        "comments": "評論",
        "password": "密碼",
        "blocked": "已封鎖",
        "dislike": "不喜歡",
        "follower": "粉絲",
        "messages": "消息",
        "mentions": "提到",
        "trending": "趨勢",
        "created": "已創建",
        "updated": "已更新",
        "removed": "已移除",
        "replied": "已回覆",
        "sensitive": "敏感",
        "pending": "等待處理",
        "copyright": "版權",
        "original": "原始的",
        "resized": "調整大小",
        "uploader": "上傳者",
        "approver": "審核人",
        "uploaded": "已上傳",
        "languages": "語言",
        "favorite": "收藏夾",
        "profile": "個人資料",
        "username": "用戶名",
        "followers": "粉絲",
        "reported": "已舉報",
        "received": "已接收",
        "verified": "已驗證",
        "unblock": "解除封鎖",
        "searched": "已搜索",
        "moderator": "版主",
        "inactive": "不活躍",
        "characters": "人物",
        "categories": "類別",
        "favorites": "收藏夾",
        "commentary": "評論",
        "unfollow": "取消關注",
        "dashboard": "儀表板",
        "disliked": "已不喜歡",
        "commented": "已評論",
        "discussions": "討論",
        "description": "描述",
        "information": "資訊",
        "recommended": "推薦",
        "following": "正在關注",
        "downloaded": "已下載",
        "notification": "通知",
        "verification": "驗證",
        "questionable": "不確定",
        "notifications": "通知",
        "blacklisted": "列入黑名單"
    };      

    const WordsList = Object.assign({}, LongWords, SingleWords, Tags1, Tags2, Tags3);

    const Syntax = (()=> {
        function Debounce(func, delay=500) {
            let timer = null;
            return (...args) => {
                clearTimeout(timer);
                timer = setTimeout(function() {
                    func(...args);
                }, delay);
            }
        };

        async function WaitElem(selector, found) {
            const observer = new MutationObserver(Debounce(() => {
                const element = document.querySelector(selector);
                if (element) {
                    observer.disconnect();
                    found(element);
                }
            }, 300));

            observer.observe(document, {
                subtree: true,
                childList: true,
                attributes: true,
                characterData: true
            });
        };

        function getTextNodes(root) {
            const tree = document.createTreeWalker( // 過濾出所有可用 文字節點
                root,
                NodeFilter.SHOW_TEXT,
                {
                    acceptNode: (node) => {
                        const content = node.nodeValue.trim();
                        return content == '' || !/[\w\p{L}]/u.test(content)
                        ? NodeFilter.FILTER_REJECT
                        : NodeFilter.FILTER_ACCEPT;
                    }
                }
            );
    
            let node;
            const nodes = [];
            while (node = tree.nextNode()) {
                nodes.push(node);
            }
            return nodes;
        };

        function Transform(textNode) {
            textNode.textContent =
            textNode.textContent.replace(/[\p{L}]+(?:[^()\[\]{}\.\t])+[\p{L}]*/gu, content => {
                const low_content = content.toLowerCase();
                return WordsList[low_content] ?? content;
            });
            textNode.textContent = // 翻譯例外狀況
            textNode.textContent.replace(/[\p{L}]+/gu, content => {
                const low_content = content.toLowerCase();
                return WordsList[low_content] ?? content;
            });
        };

        return {
            WaitElem,
            Translator: (root) => {
                getTextNodes(root).forEach(textNode => Transform(textNode));
            },
        }
    })();

    Syntax.WaitElem("body", async(body) => {
        Syntax.Translator(body); // 開始立即觸發

        let mutation; // 監聽後續變化
        const observer = new MutationObserver((mutationsList, observer) => {
            for (mutation of mutationsList) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach(node => {
                        if (node.textContent != '') {
                            Syntax.Translator(node);
                        }
                    })
                }
            }
        });

        observer.observe(document.body, {
            subtree: true,
            childList: true,
        });
    });
})();
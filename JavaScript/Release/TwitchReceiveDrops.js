// ==UserScript==
// @name                Twitch 自動領取掉寶 / Auto Receive Drops
// @name:zh-TW          Twitch 自動領取掉寶
// @name:zh-CN          Twitch 自动领取掉宝
// @name:en             Twitch Auto Claim Drops
// @name:ja             Twitch 自動ドロップ受け取り
// @name:ko             Twitch 자동 드롭 수령
// @version             0.0.12
// @author              HentaiSaru
// @description         Twitch 自動領取 (掉寶/Drops) , 窗口標籤顯示進度 , 直播結束時還沒領完 , 會自動尋找任意掉寶直播 , 並開啟後繼續掛機 , 代碼自訂義設置
// @description:zh-TW   Twitch 自動領取 (掉寶/Drops) , 窗口標籤顯示進度 , 直播結束時還沒領完 , 會自動尋找任意掉寶直播 , 並開啟後繼續掛機 , 代碼自訂義設置
// @description:zh-CN   Twitch 自动领取 (掉宝/Drops) , 窗口标签显示进度 , 直播结束时还没领完 , 会自动寻找任意掉宝直播 , 并开启后继续挂机 , 代码自定义设置
// @description:en      Automatically claim Twitch Drops, display progress in the tab, and if not finished when the stream ends, it will automatically find another Drops-enabled stream and continue farming. Customizable settings in the code.
// @description:ja      Twitch のドロップを自動的に受け取り、タブに進捗狀況を表示し、ストリーム終了時にまだ受け取っていない場合、自動的に別のドロップ有効なストリームを検索し、収穫を続けます。コードでのカスタマイズ可能な設定
// @description:ko      Twitch 드롭을 자동으로 받아오고 탭에 진행 상황을 표시하며, 스트림이 종료되었을 때 아직 완료되지 않았다면 자동으로 다른 드롭 활성 스트림을 찾아 계속 수집합니다. 코드에서 사용자 정의 설정 가능합니다

// @match        https://www.twitch.tv/drops/inventory
// @icon         https://cdn-icons-png.flaticon.com/512/8214/8214044.png

// @license      MIT
// @namespace    https://greasyfork.org/users/989635

// @run-at       document-body
// @grant        window.close
// @grant        GM_notification
// ==/UserScript==

!function() {
    const Config = {
        RestartLive: true, // 使用重啟直播
        EndAutoClose: true, // 全部進度完成後自動關閉
        TryStayActive: true, // 嘗試讓頁面保持活躍
        RestartLiveMute: true, // 重啟的直播靜音
        ClearExpiration: true, // 清除過期的掉寶進度
        ProgressDisplay: true, // 於標題展示掉寶進度

        UpdateInterval: 90, // (seconds) 更新進度狀態的間隔
        JudgmentInterval: 5, // (Minute) 經過多長時間進度無增加, 就重啟直播 [設置太短會可能誤檢測]
        DetectionInterval: 0.3, // (seconds) 查找元素時的間隔 [提高間隔查找速度會下降, 過高會找不到]

        DropsButton: "button.caieTg", // 掉寶領取按鈕
        FindTag: ["drops", "启用掉宝", "드롭활성화됨"], // 查找直播標籤, 只要有包含該字串即可
    }
    const Restart = new class {
        constructor() {this.VideoMute = async window => {let video;const Interval = setInterval(() => {if (video = window.document.querySelector("video")) {clearInterval(Interval);const SilentInterval = setInterval(() => {video.muted = !0}, 500);setTimeout(() => {clearInterval(SilentInterval)}, 15e3);}}, 500);}, this.config = Object.assign(Config, {TagType: "span",Article: "article",OfflineTag: "p.fQYeyD",ViewersTag: "span.hERoTc",WatchLiveLink: "[data-a-target='preview-card-image-link']",ActivityLink1: "[data-test-selector='DropsCampaignInProgressDescription-hint-text-parent']",ActivityLink2: "[data-test-selector='DropsCampaignInProgressDescription-no-channels-hint-text']"});}
        async Ran() {window.open("", "LiveWindow", "top=0,left=0,width=1,height=1").close();let NewWindow, OpenLink, Channel, article, self = this.config, dir = this;async function DirectorySearch(NewWindow) {const Interval = setInterval(() => {var index, language;20 < (article = NewWindow.document.getElementsByTagName(self.Article)).length && (clearInterval(Interval),-1 != (index = Array.from(article).findIndex(element => {const tag = element.querySelector(self.TagType).textContent.toLowerCase();return self.FindTag.some(match => tag.includes(match.toLowerCase()));})) ? (article[index].querySelector(self.WatchLiveLink).click(),self.RestartLiveMute && dir.VideoMute(NewWindow), self.TryStayActive && StayActive(NewWindow.document)) : (index = navigator.language,index = ((language = {"zh-TW": [ {title: "搜尋失敗", text: "找不到啟用掉落的頻道"} ],"zh-CN": [ {title: "搜索失败", text: "找不到启用掉落的频道"} ],"en-US": [ {title: "Search failed", text: "Can't find a channel with drops enabled"} ],ja: [ {title: "検索失敗", text: "ドロップが有効なチャンネルが見つかりません"} ],ko: [ {title: "검색 실패", text: "드롭이 활성화된 채널을 찾을 수 없습니다"} ]}).hasOwnProperty(index) ? language[index] : language["en-US"])[0],GM_notification({title: index.title, text: index.text})));}, 800);}(Channel = document.querySelector(self.ActivityLink2)) ? DirectorySearch(NewWindow = window.open(Channel.href, "LiveWindow")) : (Channel = document.querySelector(self.ActivityLink1),OpenLink = [ ...Channel.querySelectorAll("a") ].reverse(), async function FindLive(index) {if (OpenLink.length - 1 < index) return !1;const href = OpenLink[index].href;NewWindow = NewWindow ? (NewWindow.location.assign(href), NewWindow) : window.open(href, "LiveWindow");if (href.includes("directory")) DirectorySearch(NewWindow); else {let Offline, Nowlive;const Interval = setInterval(() => {Offline = NewWindow.document.querySelector(self.OfflineTag),Nowlive = NewWindow.document.querySelector(self.ViewersTag),Offline ? (clearInterval(Interval), FindLive(index + 1)) : Nowlive && (clearInterval(Interval),self.RestartLiveMute && dir.VideoMute(NewWindow), self.TryStayActive) && StayActive(NewWindow.document);}, 800);}}(0));}
    }();
    (class Detection {
        constructor() {this.ProgressParse = progress => progress.sort((a, b) => b - a).find(number => number < 100),this.ShowTitle = async display => {this.config.ProgressDisplay = !1;const TitleDisplay = setInterval(() => {document.title = display}, 500);setTimeout(() => {clearInterval(TitleDisplay)}, 1e4);}, this.Throttle_discard = (func, delay) => {let lastTime = 0;return function() {var args = arguments, now = Date.now();now - lastTime >= delay && (func.apply(this, args), lastTime = now);};}, this.storage = (key, value = null) => {var data, Formula = {Type: parse => Object.prototype.toString.call(parse).slice(8, -1),Number: parse => parse ? Number(parse) : (sessionStorage.setItem(key, JSON.stringify(value)), !0),Array: parse => parse ? JSON.parse(parse) : (sessionStorage.setItem(key, JSON.stringify(value)), !0)};return null != value ? Formula[Formula.Type(value)]() : !!(data = sessionStorage.getItem(key)) && Formula[Formula.Type(JSON.parse(data))](data);}, this.TimeComparison = async (Object, Timestamp, Callback) => {var day, timeString, currentTime, month;(Timestamp = Timestamp.match(/(\d{1,2})\D+(\d{1,2})\D+\D+(\d{1,2}:\d{2}) \[GMT([+-]\d{1,2})\]/)) && (month = parseInt(Timestamp[1], 10),day = parseInt(Timestamp[2], 10), timeString = Timestamp[3], Timestamp = parseInt(Timestamp[4], 10),currentTime = new Date(), (month = new Date(currentTime.getFullYear(), month - 1, day)).setHours(parseInt(timeString.split(":")[0], 10) + 12),month.setMinutes(parseInt(timeString.split(":")[1], 10)), month.setHours(month.getHours() - Timestamp),month < currentTime ? this.config.ClearExpiration && Object.remove() : Callback(Object));}, this.config = Object.assign(Config, {EndLine: "div.gtpIYu", AllProgress: "div.ilRKfU", ProgressBar: "p.mLvNZ span", ActivityTime: "span.jSkguG"});}
        static async Ran() {let Allbox, state, title, data = [], deal = !0, dynamic = new Detection(), self = dynamic.config;const observer = new MutationObserver(dynamic.Throttle_discard(() => {var time, Progress, Timestamp;0 < (Allbox = deal && document.querySelectorAll(self.AllProgress)).length && deal && (deal = !1,Allbox.forEach(box => {dynamic.TimeComparison(box, box.querySelector(self.ActivityTime).textContent, NotExpired => {if (title) return !0;NotExpired.querySelectorAll(self.ProgressBar).forEach(progress => data.push(+progress.textContent)),title = 0 < data.length && dynamic.ProgressParse(data),state = !!title && (self.ProgressDisplay && dynamic.ShowTitle(title + "%"), !0);});})), self.RestartLive && state && (self.RestartLive = !1, time = new Date(),[ Progress, Timestamp ] = dynamic.storage("Record") || [ title, time.getTime() ],(Timestamp = (time - Timestamp) / 6e4) >= self.JudgmentInterval && title == Progress ? (Restart.Ran(),dynamic.storage("Record", [ title, time.getTime() ])) : 0 != Timestamp && title == Progress || dynamic.storage("Record", [ title, time.getTime() ])),document.querySelectorAll(self.DropsButton).forEach(draw => {draw.click();}), (document.querySelector(self.EndLine)) && (observer.disconnect(),Timestamp = dynamic.storage("NoProgressCount") || 0, title ? dynamic.storage("NoProgressCount", 0) : 2 < Timestamp ? (dynamic.storage("NoProgressCount", 0),self.EndAutoClose && (window.open("", "LiveWindow", "top=0,left=0,width=1,height=1").close(),window.close())) : dynamic.storage("NoProgressCount", Timestamp + 1));}, 1e3 * self.DetectionInterval));observer.observe(document, {childList: !0,subtree: !0}), self.TryStayActive && StayActive(document);}
    }).Ran(), setTimeout(() => {window.open(location.href, "_self")}, 1e3 * Config.UpdateInterval);
    async function StayActive(Target) {var script = document.createElement("script");script.id = "Stay-Active", script.appendChild(document.createTextNode(`function WorkerCreation(code) {const blob = new Blob([code], {type: "application/javascript"});return new Worker(URL.createObjectURL(blob));}const Active = WorkerCreation(\`onmessage = function(e) {setTimeout(()=> {const {url, visible} = e.data;visible == "hidden" && fetch(url);postMessage({url});}, 6e4);}\`);Active.postMessage({ url: location.href, visible: document.visibilityState});Active.onmessage = (e) => {const { url } = e.data;const video = document.querySelector("video");video && video.play();Active.postMessage({ url: url, visible: document.visibilityState });};`)), Target.head.appendChild(script);}
}();
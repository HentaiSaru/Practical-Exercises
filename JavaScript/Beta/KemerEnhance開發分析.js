// ==UserScript==
// @name         kemono.party - fix username
// @description  Get pixiv username automatically, and renameable by manually.
// @version      2.02
// @match        *://kemono.su/*
// @namespace    none
// @connect      www.pixiv.net
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// @grant        GM_registerMenuCommand
// ==/UserScript==
/* jshint esversion: 8 */

/* 我需要的功能

名稱的編輯
名稱的變換

可在搜尋頁直接點擊 標籤跳轉

*/

(async function() {
    update_css(options, true);

    // 用於找到用戶名稱, 第一個是找 user 也就是預覽頁面, 第二個是找 post 也就是 觀看頁面
    let name = document.querySelector("span[itemprop='name'], a.post__user-name");
    if (name) fix_header(name);

    // 用於搜尋頁面 https://kemono.su/artists
    let cards = document.querySelectorAll(".card-list__items a");
    for (let card of cards) await fix_card(card);
})();
  
  // 根據當前頁面的 URL 信息, 提取出用戶 ID 和所在網站,然後調用 fix_name() 函數來修復名稱
  function fix_header(name) {
    let site = location.href.split('/user/').shift().split('/').pop();
    let id = location.href.split('/user/').pop().split(/[/?]/).shift();
    fix_name(name, id, site);
  }
  
  // 修復用戶卡片上的其他信息,如服務網站鏈接和更新時間戳。它將服務網站名稱轉換為可點擊的鏈接,並根據更新時間計算出友好的時間顯示格式
  function fix_info(card, id) {
    let sites = {
      Gumroad: "https://subscribestar.adult/" + "取得連結網址的最後",
      Pixiv: 'https://www.pixiv.net/users/{id}/artworks',
      Fanbox: 'https://www.pixiv.net/fanbox/creator/{id}',
      Fantia: 'https://fantia.jp/fanclubs/{id}/posts',
      Patreon: 'https://www.patreon.com/user?u={id}'
    };
    let service = card.querySelector('.user-card__service');
    service.innerHTML = service.innerText.trim().replace(/Pixiv|Fanbox|Fantia|Patreon/gi, match => '<a href="' + sites[match].replace('{id}', id) + '" target="_blank">' + match + '</a>');
    let timestamp = card.querySelector('.user-card__updated .timestamp');
    if (timestamp) {
      let updated = new Date(timestamp.dateTime);
      let current = new Date();
      let datetime = timestamp.dateTime.replace(/:\d\d\.(\d{6}|\d{3}Z)/, '').replace('T', ' ');
      current = new Date(current.getTime() + (location.href.indexOf('/favorites') >= 0 ? current.getTimezoneOffset() * 60000 : 0));
      let mm = Math.floor((current - updated) / 1000 / 60);
      let hh = Math.floor(mm / 60);
      let dd = Math.floor(hh / 24);
      if (dd <= 6) {
        timestamp.innerText = mm <= 59 ? mm + ' minutes ago' : hh <= 23 ? hh + ' hours ago' : dd + ' days ago';
        timestamp.title = datetime;
      } else {
        timestamp.innerText = datetime;
        timestamp.title = dd + ' days ago';
      }
    }
  }

  //它的作用是根據用戶的設置,動態更新頁面的 CSS 樣式。它包含了一個長的 CSS 字符串,定義了各種樣式規則,用於美化用戶名稱、編輯按鈕、引用鏈接等元素的顯示
  const update_css = function(options, is_init) {
    const css = `
      .user-card {margin: .25em;}
      .user-card__icon img {width: 100%; height: 100%;}
      .user-card__info {flex-grow: 1;}
      .user-card__info .user-card__service {display: inline-block; text-transform: capitalize;}
      .user-card__info .user-card__name {display: block; color: #fff; border: unset; word-break: break-all;}
      .user-card__info .user-card__name.highlight {color: #cf3; font-weight: bold;}
      .user-card__info .name_edit {display: none; float: right;}
      .user-card:hover .name_edit {display: block;}
      .user-card__info textarea {display: block; color: #fff; font-size: 28px; min-height: unset; padding: 5px 2px;}
      .user-card__info textarea ~ .user-card__name {display: none;}

      .user-header__profile span[itemprop="name"] {flex-grow: 1;}
      .user-header__profile span[itemprop="name"].highlight {color: #cf3; font-weight: bold;}
      .user-header__profile .name_edit {display: none; order: 1; margin-right: .5em;}
      .user-header__profile:hover .name_edit {display: block;}
      .user-header__profile .refer_link {order: 2; margin-right: .5em;}
      .user-header__profile .name_org {flex-grow: 99; font-size: 11pt;}
      .user-header__name textarea {display: block; color: #fff; font-size: 28px; min-height: unset; padding: 5px 2px; margin: 3px;}
      .user-header__name textarea ~ .user-header__profile {display: none;}

      .post__user .post__user-name {display: block;}
      .post__user .post__user-name.highlight {color: #cf3; font-weight: bold;}
      .post__user .name_edit {display: none; position: absolute; right: .5em;}
      .post__user:hover .name_edit {display: block;}
      .post__user .refer_link {display: none;}
      .post__user textarea {display: block; color: #fff; font-size: 1.25em; min-height: unset; width: 100%; resize: none; overflow: hidden; text-align: center;}
      .post__user textarea ~ .post__user-name {display: none;}

      .name_org {color: #b3b3b3;}
      .name_edit {font-size: 14px; color: #fff; background: #666; border-radius: 6px; padding: 4px 8px;}
      textarea ~ .name_edit {display: none !important;}
      .refer_link {background-color: #000;}
      .refer_link .highlight {color: #cf3; font-weight: bold;}
    `;
  }
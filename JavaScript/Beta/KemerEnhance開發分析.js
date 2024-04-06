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

  // 作用是修復用戶卡片的內容。它提取出用戶 ID 和所在網站,然後調用 fix_name() 函數來修復名稱,並調用 fix_info() 函數來修復其他信息
  async function fix_card(card) {
    if (card && card.href) {
      let site = card.href.split('/user/').shift().split('/').pop();
      let id = card.href.split('/user/').pop();
      let name = card.querySelector('.user-card__name');
      name.insertAdjacentHTML('beforebegin', name.outerHTML.replace(/(?<=^<)div|div(?=>$)/g, 'a'));
      name.remove();
      name = card.querySelector('.user-card__name');
      name.href = card.getAttribute('href');
      name.target ='_blank';
      card.removeAttribute('href');
      await fix_name(name, id, site);
      fix_info(card, id);
    }
  }

  // 它首先從本地存儲中查找是否有之前保存的修改過的名稱,如果有就使用修改後的名稱,否則嘗試從 Pixiv 獲取用戶的真實名稱。它還添加了一個"編輯"按鈕,允許用戶手動編輯名稱,並將編輯結果保存到本地存儲中
  async function fix_name(name, id, site) {
    let name_org = name.innerText;
    let name_fix = (await GM_getValue(site, {}))[id];
    if (site == 'fanbox') {
      if (!name_fix) name_fix = await GM_getValue(id);
      if (!name_fix) {
        (async function() {
          name_fix = await get_pixiv_name(id) || name_org + ' (!)';
          save_name(id, name_fix, site);
          update_name(name, name_fix, name_org);
        })();
      }
    }
    if (name_fix && name_fix !== name_org) {
      update_name(name, name_fix, name_org);
    }

    let name_edit = document.createElement('label');
    name_edit.innerHTML = 'Edit';
    name_edit.classList.add('name_edit');
    name.parentNode.insertBefore(name_edit, name);
    name_edit.onclick = function(e) {
      e.preventDefault();
      let name_edit_input = document.createElement('textarea');
      name_edit_input.style.height = name.offsetHeight + 'px';
      name_edit_input.value = name_fix || name.innerText;
      let profile = name.closest('.user-header__name');
      if (profile) profile.insertBefore(name_edit_input, profile.firstChild);
      else name.parentNode.insertBefore(name_edit_input, name_edit);
      const update_size = () => {
        name_edit_input.style.height = '5px';
        name_edit_input.style.height = name_edit_input.scrollHeight + 'px';
      };
      name_edit_input.focus();
      name_edit_input.oninput = () => update_size();
      name_edit_input.onkeypress = function(e) {
        if (e.keyCode == 13) name_edit_input.blur();
        else update_size();
      };
      name_edit_input.onblur = async function() {
        if (!this.value) this.value = site == 'fanbox' ? await get_pixiv_name(id) || name_org + ' (!)' : name_org;
        if (this.value !== name_fix) {
          name_fix = this.value.trim();
          save_name(id, name_fix, site, site !== 'fanbox');
          update_name(name, name_fix, name_org);
        }
        this.remove();
      };
      update_size();
    };
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
  
  // 它的作用是更新用戶名稱的顯示。它根據修改後的名稱,加上一些特殊標記,並在原始名稱旁邊顯示一個小括號。它還會在名稱旁邊添加指向其他相關網站的鏈接。
  function update_name(name, fix, org) {
    if (fix.indexOf('* ') == 0) name.classList.add('highlight');
    else name.classList.remove('highlight');
    name.innerHTML = fix.replace(/^\*\s/, '').replace(/\(\*?[a-z]+_\d+\)/gi, '').trim();
    name.parentNode.querySelectorAll('.refer_link, .name_org').forEach(a => a.remove());
    if (fix.replace(/^\*|\((\*?[a-z]+_\d+|!)\)/gi, '').replace(/\s/g, '').toLowerCase() !== org.replace(/\s/g, '').toLowerCase()) {
      name.insertAdjacentHTML('afterend', '<span class="name_org">(' + org + ')</span>');
    }
    (fix.match(/\(\*?[a-z]+_\d+\)/gi) || []).forEach(m => m.replace(/([a-z]+)_(\d+)/i, (p0, p1, p2) => {
      (Array.from(name.parentNode.querySelectorAll('.user-card__service')).pop() || name).insertAdjacentHTML('afterend', ' <span class="user-card__service refer_link"><a' + (m[1] == '*' ? ' class="highlight"' : '') + ' href="/' + p1.toLowerCase() + '/user/' + p2 + '" target="_blank">' + p1 + '</a></span>');
    }));
  }
  
  // 它的作用是保存修改過的用戶名稱到本地存儲中。它根據傳入的參數,決定是在網站級別存儲還是在用戶級別存儲,並提供刪除存儲數據的功能
  async function save_name(id, name_fix, site, in_tag, is_remove) {
    if (in_tag) {
      let sites = await GM_getValue(site, {});
      if (is_remove) delete sites[id]; else sites[id] = name_fix;
      GM_setValue(site, sites);
    } else {
      if (is_remove) GM_deleteValue(id); else GM_setValue(id, name_fix);
    }
  }
  
  // 它的作用是從 Pixiv 網站獲取用戶的真實名稱。它使用 GM_fetch() 函數發送 AJAX 請求到 Pixiv 的 API 端點,並解析返回的 JSON 數據,提取出用戶的名稱
  async function get_pixiv_name(id) {
    let user_ajax = await GM_fetch('https://www.pixiv.net/ajax/user/' + id + '?full=1&lang=ja', {referer: "https://www.pixiv.net/"});
    if (user_ajax.status == 200) {
      let user_json = JSON.parse(user_ajax.responseText);
      let user_name = user_json.body.name;
      user_name = user_name.replace(/(c\d+)?([日月火水木金土]曜日?|[123１２３一二三]日目?)[東南西北]..?\d+\w?/i, '');
      user_name = user_name.replace(/[@＠]?(fanbox|fantia|skeb|ファンボ|リクエスト|お?仕事|新刊|単行本|同人誌)+(.*(更新|募集|公開|開設|開始|発売|販売|委託|休止|停止)+中?[!！]?$|$)/gi, '');
      user_name = user_name.replace(/\(\)|（）|「」|【】|[@＠_＿]+$/g, '').trim();
      return user_name;
    }
  }
  
  function GM_fetch(url, headers) {
    return new Promise(resolve => {
      GM_xmlhttpRequest({
        method: 'GET', url: url, headers: headers,
        onload: result => resolve(result),
        onerror: result => resolve(result),
        ontimeout: result => resolve(result)
      });
    });
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
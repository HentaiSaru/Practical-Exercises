(function() {

    class RuleParser {
        constructor() {
            this.hpRules = [];
            this.smartRules = [];
            this.customRules = [];
            this.rules = [];
            this.pageDoc = document;
            this.nextLinkHref = null;
            this.nextTitle = "";
            this.oldUrl = "";
            this.curUrl = location.href;
            this.curSiteRule = {};
        }

        addRules(rules, from) {
            if (rules && rules.length > 0) {
                let first = -1;
                this.rules = this.rules.filter((item, i) => {
                    if (item.from === from) {
                        if (first === -1) first = i;
                        return false;
                    } else return true;
                });
                if (first === -1) first = 0;
                rules.forEach(item => {
                    let rule = this.formatRule(item, from);
                    if (rule) {
                        this.rules.splice(first, 0, rule)
                    }
                });
            }
        }

        ruleMatchPre(r) {
            if (r.include) {
                let include;
                if (Array && Array.isArray && Array.isArray(r.include)) {
                    include = r.include.every((sel, i) => {
                        let ele = getElement(sel, document);
                        return !!ele;
                    });
                } else include = getElement(r.include, document);
                if (!include) return false;
            }
            if (r.exclude) {
                let exclude;
                if (Array && Array.isArray && Array.isArray(r.exclude)) {
                    exclude = !r.exclude.every((sel, i) => {
                        let ele = getElement(sel, document);
                        return !ele;
                    });
                } else exclude = getElement(r.exclude, document);
                if (exclude) return false;
            }
            return true;
        }

        ruleMatchReady(r) {
            let findIndex = 0;
            if (r.nextLink && r.nextLink !== 0) {
                let nextLinkSel = r.nextLink, nextLink;
                if (Array && Array.isArray && Array.isArray(nextLinkSel)) {
                    nextLink = !nextLinkSel.every((sel, i) => {
                        let ele = getElement(sel, document);
                        if (ele) findIndex = i;
                        return !ele;
                    });
                } else nextLink = getElement(nextLinkSel, document);
                if (!nextLink) return false;
            }
            if (r.pageElement) {
                let pageElementSel = r.pageElement, pageElement;
                if (Array && Array.isArray && Array.isArray(pageElementSel)) {
                    pageElementSel = pageElementSel[findIndex];
                }
                pageElement = getElement(pageElementSel, document);
                if (!pageElement) return false;
            }
            if (r.insert) {
                let insertSel = r.insert, insert;
                if (Array && Array.isArray && Array.isArray(insertSel)) {
                    insertSel = insertSel[findIndex];
                }
                insert = getElement(insertSel, document);
                if (!insert) return false;
            }
            //if (findIndex !== 0) nextIndex = findIndex;
            return true;
        }

        ruleMatch(r) {
            return this.ruleMatchPre(r) && this.ruleMatchReady(r);
        }

        scrollToShow(sel, doc) {
            let exclude = getElement(sel, doc);
            if (exclude) {
                var actualTop = exclude.offsetTop;
                var current = exclude.offsetParent;
                while (current !== null) {
                    actualTop += current.offsetTop;
                    current = current.offsetParent;
                }
                getBody(doc).scrollTop = 0;
                doc.documentElement.scrollTop = 0;
                let maxHeight = Math.max(getBody(doc).scrollHeight, doc.documentElement.scrollHeight);
                getBody(doc).scrollTop = actualTop - 10;
                doc.documentElement.scrollTop = actualTop - 10;
                setTimeout(() => {
                    while (actualTop < maxHeight) {
                        actualTop += 200;
                        getBody(doc).scrollTop = actualTop;
                        doc.documentElement.scrollTop = actualTop;
                    }
                }, 0);
                return false;
            }
            return true;
        }

        waitElement(doc, selArr) {
            if (!selArr) selArr = this.curSiteRule.waitElement;
            if (!Array.isArray(selArr)) {
                selArr = [selArr];
            }
            let includeSel = selArr[0].trim(), excludeSel;
            if (selArr.length === 2) {
                excludeSel = selArr[1].trim().replace(/^!/, '');
            } else if (includeSel.indexOf('!') === 0) {
                excludeSel = includeSel.replace(/^!/, '');
                includeSel = '';
            }
            if (includeSel) {
                let include = getElement(includeSel, doc);
                if (!include) {
                    return false;
                }
            }
            if (doc === document) return true;
            if (excludeSel) {
                if (!this.scrollToShow(excludeSel, doc)) {
                    if (!loadingDiv.offsetParent && this.insert.parentNode) {
                        this.insertElement(loadingDiv);
                    }
                    return false;
                }
            }
            return true;
        }

        runPageBar(pageBar) {
            if (this.curSiteRule.pageBar && this.curSiteRule.pageBar !== 0) {
                try {
                    ((typeof this.curSiteRule.pageBar === 'function') ? this.curSiteRule.pageBar : Function("pageBar",'"use strict";' + this.curSiteRule.pageBar))(pageBar);
                } catch(e) {
                    debug(e);
                }
            }
        }

        runWait(cb) {
            let checkEval = null, waitTime = 0;
            if (this.curSiteRule.waitElement) {
                checkEval = doc => {
                    return this.waitElement(doc);
                };
            } else if(this.curSiteRule.wait) {
                if (isNaN(this.curSiteRule.wait)) {
                    try {
                        checkEval = (typeof this.curSiteRule.wait === 'function') ? this.curSiteRule.wait : Function("doc", '"use strict";' + this.curSiteRule.wait);
                    } catch(e) {
                        debug(e);
                    }
                } else {
                    waitTime = this.curSiteRule.wait;
                }
            }
            cb(checkEval, waitTime);
        }

        findNoNext() {
            if (!this.curSiteRule || !this.curSiteRule.smart || this.curSiteRule.nextLink === 0 || this.possibleRule) return;
            let self = this;
            self.curSiteRule.nextLink = 0;
            self.smartRules = self.smartRules.filter(item => {return item && item.url !== self.curSiteRule.url;});
            self.smartRules.unshift(self.curSiteRule);
            storage.setItem("smartRules", self.smartRules);
        }

        async getRule(callback) {
            var href = location.href.slice(0, 500);
            if(noRuleTest) {
                this.curSiteRule = {};
                this.curSiteRule.url = href;
                this.curSiteRule.smart = true;
                callback();
                return;
            }
            if (_unsafeWindow.pagetualRule) {
                this.curSiteRule = _unsafeWindow.pagetualRule;
                if (!this.curSiteRule.url) this.curSiteRule.url = ".";
                this.curSiteRule.isScript = true;
            }
            if (this.curSiteRule && this.curSiteRule.url && !this.curSiteRule.smart) {
                let urlReg = new RegExp(this.curSiteRule.url, "i");
                if (urlReg.test(href) && this.ruleMatch(this.curSiteRule)) {
                    return callback();
                }
            }
            if (this.possibleRule) {
                let urlReg = new RegExp(this.possibleRule.url, "i");
                if (urlReg.test(href) && this.ruleMatch(this.possibleRule)) {
                    this.curSiteRule = this.possibleRule;
                    debug(this.curSiteRule, 'Match');
                    return callback();
                }
            }
            this.curSiteRule = {};
            var self = this;

            function setRule(r) {
                if (self.preSiteRule) {
                    href = location.href.slice(0, 500);
                    let urlReg = new RegExp(self.preSiteRule.url, "i");
                    if (urlReg.test(href) && self.ruleMatch(self.preSiteRule)) {
                        self.curSiteRule = self.preSiteRule;
                        return callback();
                    }
                }
                if (r.from === 2) {
                    delete r.autoLoadNum;
                    delete r.history;
                    delete r.sideController;
                    if (r.pageBar === 0) delete r.pageBar;
                }
                if (!r.smart) {
                    self.insert = null;
                    self.curSiteRule = r;
                    self.preSiteRule = r;
                    if (r.enable !== 0) debug(r, 'Match');
                } else if (!self.curSiteRule || !self.curSiteRule.smart) self.curSiteRule = r;
                callback();
            }

            function checkRule(r) {
                if (r.from === 1 && r.url.length <= 13) return false;
                let urlReg = new RegExp(r.url, "i");
                if (urlReg.test(href)) {
                    if (!self.ruleMatchPre(r)) return false;
                    if (r.url.length > 15 && r.from !== 1) {
                        self.possibleRule = r;
                    }
                    if (r.waitElement) {
                        let waitTime = 500;
                        let checkReady = () => {
                            setTimeout(() => {
                                if (!self.waitElement(document, r.waitElement) || !self.ruleMatchReady(r)) {
                                    checkReady();
                                } else {
                                    setRule(r);
                                }
                            }, parseInt(waitTime));
                        };
                        checkReady();
                        debug(r, 'Wait for');
                        return true;
                    } else if (r.wait) {
                        let waitTime = 500, checkEval, maxCheckTimes = 50;
                        if (isNaN(r.wait)) {
                            try {
                                checkEval = (typeof r.wait === 'function') ? r.wait : Function("doc",'"use strict";' + r.wait);
                            } catch(e) {
                                debug(e, 'Error when checkeval');
                            }
                        } else {
                            waitTime = r.wait;
                        }
                        let checkReady = () => {
                            if (maxCheckTimes-- <= 0) {
                                debug("Wait for rule ready but failed");
                                setRule(r);
                                return;
                            }
                            setTimeout(() => {
                                if (!self.ruleMatchReady(r) || (checkEval && !checkEval(document))) {
                                    checkReady();
                                } else {
                                    setRule(r);
                                }
                            }, parseInt(waitTime));
                        };
                        checkReady();
                        debug(r, 'Wait for');
                        return true;
                    }
                    if (r.pinUrl) {
                        setRule(r);
                        return true;
                    }
                    if (!self.ruleMatchReady(r)) {
                        return false;
                    }
                    setRule(r);
                    return true;
                }
                return false;
            }

            function checkHpRules() {
                for (let i in self.hpRules) {
                    let rule = self.hpRules[i];
                    if (!rule || !rule.url || rule.smart) continue;
                    if (checkRule(rule)) return true;
                }
                return false;
            }

            function checkCustomRules() {
                for (let i in self.customRules) {
                    let rule = self.customRules[i];
                    if (!rule || !rule.url) continue;
                    if (checkRule(rule)) return true;
                }
                return false;
            }

            if (rulesData.customFirst) {
                if (checkCustomRules()) return;
                await sleep(1);
                if (checkHpRules()) return;
            } else {
                if (checkHpRules()) return;
                await sleep(1);
                if (checkCustomRules()) return;
            }
            await sleep(1);

            for (let i in this.smartRules) {
                let rule = this.smartRules[i];
                if (!rule || !rule.url || !rule.smart) continue;
                if (href == rule.url) {
                    setRule(rule);
                    return;
                }
            }
            let r = 0;
            async function searchByTime() {
                while (document.hidden) {
                    await sleep(1000);
                }
                setTimeout(() => {
                    let end = r + 20;
                    end = end > self.rules.length ? self.rules.length : end;
                    for (; r < end; r++) {
                        let rule = self.rules[r];
                        if (checkRule(rule)) return;
                    }
                    if (end >= self.rules.length) {
                        setRule({url: href, smart: true});
                        return;
                    } else {
                        searchByTime();
                    }
                }, 1);
            }
            searchByTime();
        }

        addToHpRules(instead) {
            try {
                if (this.curSiteRule.isScript) return;
                if (!this.hpRules) this.hpRules = [];
                let url = this.curSiteRule && this.curSiteRule.url, self = this;
                let href = location.href.slice(0, 500);
                let matchedRules = this.hpRules.filter(rule => rule != self.curSiteRule && new RegExp(rule.url, "i").test(href) && self.ruleMatch(rule));
                if (url) matchedRules.unshift(this.curSiteRule);
                matchedRules.sort((a, b) => {
                    if ((a.include || a.exclude) && (!b.include && !b.exclude)) {
                        return -1;
                    } else if ((b.include || b.exclude) && (!a.include && !a.exclude)) {
                        return 1;
                    } else {
                        if ((a.nextLink || a.pageElement) && (!b.nextLink && !b.pageElement)) {
                            return -1;
                        } else if ((b.nextLink || b.pageElement) && (!a.nextLink && !a.pageElement)) {
                            return 1;
                        } else {
                            if (a.url.length > b.url.length) {
                                return -1;
                            } else if (a.url.length < b.url.length) {
                                return 1;
                            } else {
                                return 0;
                            }
                        }
                    }
                });
                this.hpRules = this.hpRules.filter(item => {
                    return item && !matchedRules.find(rule => item.url == rule.url && JSON.stringify(item) == JSON.stringify(rule));
                });
                if (instead) {
                    if (url) {
                        this.hpRules.unshift(this.curSiteRule);
                        matchedRules = [];
                    }
                } else {
                    this.hpRules = matchedRules.concat(this.hpRules);
                }
                if (matchedRules && matchedRules.length) this.curSiteRule = matchedRules[0];
                if (this.hpRules.length > 30) {
                    this.hpRules.pop();
                }
                if (!rulesData.sort) rulesData.sort = [1];
                this.hpRules.sort((a, b) => {
                    let aSort = -1, bSort = -1;
                    for (let s = 0; s < rulesData.sort.length; s++) {
                        if (a.from == rulesData.sort[s]) aSort = s;
                        if (b.from == rulesData.sort[s]) bSort = s;
                        if (aSort > -1 && bSort > -1) break;
                    }
                    return aSort - bSort;
                });
                storage.setItem("hpRules", this.hpRules);
            } catch (e) {
                debug(e);
            }
        }

        replaceElement(doc) {
            if (!doc || doc === document) return;
            let replaceElementSel = this.curSiteRule.replaceElement;
            if (replaceElementSel) {
                if (!Array.isArray(replaceElementSel)) {
                    replaceElementSel = [replaceElementSel];
                }
                replaceElementSel.forEach(sel => {
                    let pageEles = getAllElements(sel, document);
                    let replaceEles = getAllElements(sel, doc);
                    for (let i = 0; i < pageEles.length; i++) {
                        let replaceEle = replaceEles[i];
                        let pageEle = pageEles[i];
                        if (replaceEle) {
                            pageEle.parentNode.replaceChild(replaceEle.cloneNode(true), pageEle);
                        } else break;
                    }
                });
            }
        }

        refreshByClick() {
            let refreshByClickSel = this.curSiteRule.refreshByClick;
            if (refreshByClickSel) {
                let self = this;
                if (!this.refreshByClickHandler) {
                    this.refreshByClickHandler = e => {
                        if (!self.refreshing) {
                            self.refreshing = true;
                            setTimeout(() => {
                                self.refreshing = false;
                                let checkEles = getAllElements(refreshByClickSel, document);
                                for (let i = 0; i < checkEles.length; i++) {
                                    let curEle = checkEles[i];
                                    if (curEle === e.target || curEle.contains(e.target)) {
                                        urlChanged = true;
                                        isPause = true;
                                        if (!ruleParser.nextLinkHref) isLoading = false;
                                        break;
                                    }
                                }
                            }, 300);
                        }
                    }
                }
                document.removeEventListener("click", this.refreshByClickHandler);
                document.addEventListener("click", this.refreshByClickHandler);
            }
        }

        getValidSize(ele, win) {
            if (!win) return {h: 0, w: 0};
            let eleStyle = win.getComputedStyle(ele);
            if (!ele.offsetParent && (eleStyle.position !== "fixed" || eleStyle.opacity === 0)) {
                return {h: 0, w: 0};
            }
            let h = ele.scrollHeight;
            if (eleStyle.overflow === "hidden") {
                h = ele.offsetHeight;
            }
            if (h === 0 && ele.parentNode && ele.parentNode.children.length === 1) {
                h = ele.parentNode.scrollHeight;
            }
            while (h === 0 && ele.children && ele.children.length === 1) {
                ele = ele.children[0];
                h = ele.scrollHeight;
            }
            if (h === 0 && ele.children && ele.children.length) {
                let maxChildSize = {h: 0}, self = this;
                [].forEach.call(ele.children, el => {
                    let childSize = self.getValidSize(el, win);
                    if (childSize.h > maxChildSize.h) maxChildSize = childSize;
                });
                if (maxChildSize.h !== 0) return maxChildSize;
            }
            const maxNum = 2147483647;
            let moreChild = ele.children[0], minOffsetTop = maxNum;
            while (moreChild) {
                if ((moreChild.offsetParent === ele || moreChild.offsetParent === ele.offsetParent)) {
                    let curOffsetTop = moreChild.offsetParent === ele.offsetParent ? moreChild.offsetTop - ele.offsetTop : moreChild.offsetTop;
                    if (curOffsetTop < minOffsetTop) {
                        minOffsetTop = curOffsetTop;
                    }
                }
                moreChild = moreChild.nextElementSibling;
            }
            if (h && minOffsetTop !== maxNum && minOffsetTop > 0) {
                h -= minOffsetTop;
            }
            return {h: h, w: parseInt(ele.offsetWidth || ele.scrollWidth)};
        }

        checkTargetChildren(ele, curWin, articleNum, curHeight) {
            let pf = false;
            if (ele.parentNode) {
                let paStyle = curWin.getComputedStyle(ele.parentNode);
                let paDisplay = paStyle.display;
                let paOverflow = paStyle.overflow;
                pf = (paDisplay.indexOf('flex') !== -1 && paStyle.flexDirection === "row" && paStyle.flexWrap !== "wrap") || compareNodeName(ele.parentNode, ["ul"]) || paDisplay.indexOf('grid') !== -1 || paOverflow === "hidden";
            }
            let curStyle = curWin.getComputedStyle(ele);
            if (ele.children.length > 1) {
                if (articleNum > 1) {
                    return ">article";
                } else {
                    let hasText = false;
                    for (let i in ele.childNodes) {
                        let child = ele.childNodes[i];
                        if (child.nodeType === 3 && child.nodeValue.trim() !== '') {
                            return "";
                        }
                    }
                    if (!hasText) {
                        let gridArea = curStyle.gridArea;
                        if (gridArea && gridArea !== "auto" && gridArea !== "auto / auto / auto / auto") {
                            return ">*";
                        } else {
                            let middleChild = ele.children[parseInt(ele.children.length / 2)];
                            if ((curStyle.display === 'flex' && curStyle.flexDirection === "row" && curStyle.flexWrap !== "wrap") || (curStyle.float === "none" && rulesData.opacity !== 0 && !pf)) {
                                return "";
                            } else if ((middleChild.style && middleChild.style.position === "absolute" && middleChild.style.left && middleChild.style.top) || compareNodeName(ele, ["ul"]) || curHeight === 0) {
                                return "";
                            } else {
                                return ">*";
                            }
                        }
                    }
                }
            } else if (pf || curStyle.position === "absolute") {
                return ">*";
            }
            return "";
        }

        getPageElement(doc, curWin, dontFind) {
            if (doc === document && this.docPageElement && document.documentElement.contains(this.docPageElement[0])) {
                return this.docPageElement;
            }
            let pageElement = null;
            let self = this;
            let body = getBody(doc);
            if (this.curSiteRule.pageElement) {
                let pageElementSel = this.curSiteRule.pageElement;
                if (Array && Array.isArray && Array.isArray(pageElementSel)) {
                    pageElementSel = pageElementSel[nextIndex < pageElementSel.length ? nextIndex : 0];
                }
                pageElement = getAllElements(pageElementSel, doc);
                if (this.curSiteRule.smart && (!pageElement || pageElement.length === 0)) {
                    const childSelMatch = />\s*\*$/;
                    const targetChild = childSelMatch.test(pageElementSel);
                    if (targetChild) pageElementSel = pageElementSel.replace(childSelMatch, "");
                    let pageElementSelSplit = pageElementSel.split(">");
                    while(pageElementSelSplit && pageElementSelSplit.length > 5) {
                        pageElementSelSplit.shift();
                        let tempSel = pageElementSelSplit.join(">");
                        pageElement = getAllElements(tempSel, doc);
                        if (pageElement && pageElement.length === 1) {
                            if (targetChild) {
                                pageElement = pageElement.children;
                            }
                            this.curSiteRule.pageElement = tempSel + (targetChild ? ">*" : "");
                            break;
                        }
                    }
                    if (!pageElement || pageElement.length === 0) {
                        pageElementSel = pageElementSel.replace(/:nth-of-type\(\d+\)/g, "");
                        pageElement = getAllElements(pageElementSel, doc);
                        if (pageElement && pageElement.length === 1) {
                            if (targetChild) {
                                pageElement = pageElement.children;
                            }
                            this.curSiteRule.pageElement = pageElementSel + (targetChild ? ">*" : "");
                        }
                    }
                }
                if (this.curSiteRule.smart && pageElement && pageElement.length && curWin && curWin !== _unsafeWindow) {
                    let parent = pageElement[0].parentNode;
                    let loading = parent.querySelector('[class*=loading]');
                    if (loading && loading.offsetParent && loading.offsetHeight > parent.offsetHeight>>2) {
                        pageElement = null;
                    }
                }
            }
            if (pageElement && pageElement.length === 1 && pageElement[0].style.display === 'none') {
                pageElement = [body];
            }
            if (this.curSiteRule.smart && pageElement && pageElement.length > 0 && compareNodeName(pageElement[0], ["tr"])) {
                let mainTr = this.insert.parentNode.querySelectorAll('tr'), mainTdNum = 0, newTdNum = 0;
                mainTr = mainTr[mainTr.length - 1];
                [].forEach.call(mainTr.children, el => {
                    if (compareNodeName(el, ["td", "th"])) {
                        mainTdNum += el.colSpan || 1;
                    }
                });
                [].forEach.call(pageElement[0].children, el => {
                    if (compareNodeName(el, ["td", "th"])) {
                        newTdNum += el.colSpan || 1;
                    }
                });
                if (mainTdNum !== newTdNum) {
                    this.curSiteRule.pageElement = this.curSiteRule.pageElement.replace(/> *table.*/, ">table");
                    this.getInsert(true);
                    return this.getPageElement(doc, curWin, dontFind);
                }
            }
            if ((this.curSiteRule.smart || !this.curSiteRule.pageElement) && (!pageElement || pageElement.length == 0) && curWin && !dontFind) {
                if (!body) return null;
                let bodyHeight = parseInt(body.offsetHeight || body.scrollHeight);
                let curHeight = bodyHeight, curWidth = 0;
                let windowHeight = window.innerHeight || document.documentElement.clientHeight;
                let windowWidth = window.innerWidth || document.documentElement.clientWidth;
                let needCheckNext = (doc == document && this.initNext), nextLeftPos = 0;
                if (needCheckNext && this.initNext.getBoundingClientRect) {
                    nextLeftPos = this.initNext.getBoundingClientRect().left;
                }
                function checkElement(ele) {
                    if (compareNodeName(ele, ["pre", "code"])) {
                        self.curSiteRule.pageElement = geneSelector(ele.parentNode);
                        debug(self.curSiteRule.pageElement, 'Page element');
                        return [ele.parentNode];
                    }
                    if (ele.children && ele.children.length === 1) {
                        let hasText = false;
                        for (let i in ele.childNodes) {
                            let child = ele.childNodes[i];
                            if (child.nodeType === 3 && child.nodeValue.trim() !== '') {
                                hasText = true;
                                break;
                            }
                        }
                        if (!hasText) {
                            ele = ele.children[0];
                            let validSize = self.getValidSize(ele, curWin);
                            curHeight = validSize.h;
                            curWidth = validSize.w;
                        }
                    }
                    if (compareNodeName(ele, ["picture"]) || !ele.innerText || ele.innerText.trim() === '') {
                        self.curSiteRule.pageElement = geneSelector(ele.parentNode) + ">" + ele.nodeName.toLowerCase();
                        debug(self.curSiteRule.pageElement, 'Page element');
                        let eles = [];
                        for (let i = 0; i < ele.parentNode.children.length; i++) {
                            let curNode = ele.parentNode.children[i];
                            if (curNode.nodeName === ele.nodeName && curNode.id === ele.id && curNode.className === ele.className) {
                                eles.push(curNode);
                            }
                        }
                        return eles;
                    }
                    if (compareNodeName(ele, ["form"]) && ele.parentNode !== getBody(document)) {
                        self.curSiteRule.pageElement = geneSelector(ele) + ">*";
                        debug(self.curSiteRule.pageElement, 'Page element');
                        return ele.children;
                    }
                    if (ele.children.length === 0 && !self.curSiteRule.pageElement) {
                        if (compareNodeName(ele.parentNode, ["p"])) ele = ele.parentNode;
                        self.curSiteRule.pageElement = geneSelector(ele.parentNode) + ">" + ele.nodeName.toLowerCase();
                        debug(self.curSiteRule.pageElement, 'Page element');
                        return getAllElements(self.curSiteRule.pageElement, doc);
                    }
                    let i, minHeight = curHeight * 0.52, curMaxEle = null, curMaxArea = 0, minWidth = Math.min(curWidth * 0.38, 500);
                    let isHori, preOffsetTop = -1;
                    let articleNum = 0;
                    for (i = 0; i < ele.children.length; i++) {
                        let curNode = ele.children[i];
                        if (ele !== body && /^H\d$/i.test(curNode.nodeName) && curNode.offsetParent) {
                            curMaxEle = null;
                            break;
                        }
                        if (compareNodeName(curNode, ["canvas", "nav"])) continue;
                        let curStyle = curWin.getComputedStyle(curNode);
                        if (!curNode.offsetParent && (curStyle.position !== "fixed" || curStyle.opacity === 0)) {
                            continue;
                        }
                        if (!compareNodeName(curNode, ["img"]) && curNode.querySelector('img') === null && /^\s*$/.test(curNode.innerText)) continue;
                        if (needCheckNext && !curNode.contains(self.initNext) && getElementTop(curNode) > windowHeight) {
                            continue;
                        }
                        if (compareNodeName(curNode, ["article"])) articleNum++;
                        let validSize = self.getValidSize(curNode, curWin);
                        let h = validSize.h;
                        let w = validSize.w;
                        if (isNaN(h) || isNaN(w)) continue;
                        isHori = Math.abs(preOffsetTop - curNode.offsetTop) <= 20 ? true : (preOffsetTop === -1 && curNode.nextElementSibling && curNode.nextElementSibling.offsetTop === curNode.offsetTop);
                        if (isHori && h <= 50) continue;
                        /*if (isHori && nextLeftPos && curMaxEle && curWidth > 500 && curHeight > 500) {
                            let curRect = curNode.getBoundingClientRect();
                            if (curRect.left > windowWidth>>2 && curRect.left <= nextLeftPos && curRect.right > nextLeftPos) {
                                continue;
                            }
                        }*/
                        let a = h * w, moreChild = curNode.children[0];
                        while (moreChild) {
                            let validSize = self.getValidSize(moreChild, curWin);
                            let ch = validSize.h;
                            let cw = validSize.w;
                            if (h < ch) {
                                h = ch;
                            }
                            if (moreChild.innerText !== "" && ch && cw) {
                                a += ch * cw;
                            }
                            moreChild = moreChild.nextElementSibling;
                        }
                        let isMax = false;
                        if (isHori) {
                            if (curMaxEle) {
                                if (w > curWidth && (windowWidth>>1) > curWidth) {
                                    isMax = true;
                                } else if (w + 300 > curWidth && a > curMaxArea) {
                                    isMax = true;
                                }
                            }
                        } else {
                            if (curMaxEle && curMaxEle.offsetParent === curNode.offsetParent && curMaxEle.offsetTop === curNode.offsetTop) {
                                if (curMaxArea * 2 > a) continue;
                            }
                            isMax = curMaxArea < a;
                        }
                        if (curMaxEle === null || isMax) {
                            if (isHori) {
                                if (w < minWidth) {
                                    continue;
                                }
                            }
                            if (h < minHeight) {
                                if (!needCheckNext || h < (windowHeight>>1) || !ele.contains(self.initNext)) {
                                    continue;
                                }
                            }
                            curHeight = h;
                            curMaxArea = a;
                            curWidth = w;
                            curMaxEle = curNode;
                            preOffsetTop = curNode.offsetTop;
                        }
                    }
                    let curHeightPercent = curHeight / bodyHeight;
                    if (curMaxEle && curHeightPercent <= 0.18) {
                        let article;
                        for (let i = 0; i < mainSel.length; i++) {
                            article = doc.querySelectorAll(mainSel[i]);
                            if (article && article.length === 1) break;
                        }
                        if (article && article.length === 1) {
                            article = article[0];
                            let childrenEnd = self.checkTargetChildren(article, curWin, articleNum, curHeight);
                            self.curSiteRule.pageElement = article.nodeName.toLowerCase() + (article.id ? "#" + article.id : "") + (article.className ? "." + article.className.replace(/ /g, ".") : "") + childrenEnd;
                            debug(self.curSiteRule.pageElement, 'Page element');
                            return childrenEnd ? article.children : [article];
                        }
                        curMaxEle = null;
                    }
                    if (curMaxEle && (!compareNodeName(curMaxEle, ["ul"]) || curHeightPercent > 0.8)) {
                        let sameClassNum = 0, hasDifferent = false;
                        if (curMaxEle.className) {
                            for(i = 0; i < ele.children.length; i++) {
                                let curNode = ele.children[i];
                                if (curMaxEle !== curNode && curNode.style.display !== 'none' && curMaxEle.className === curNode.className && curMaxEle.nodeName === curNode.nodeName){
                                    sameClassNum++;
                                } else if (curMaxEle.className !== curNode.className) {
                                    hasDifferent = true;
                                }
                            }
                        }
                        if (sameClassNum < 2 || (sameClassNum < 5 && hasDifferent)) {
                            return checkElement(curMaxEle);
                        }
                    }
                    if (ele.nodeName === "APP-ROOT") {
                        isPause = true;
                        debug(ele, "Angular root");
                        return null;
                    }
                    while (compareNodeName(ele, ["p", "br", "td"])) {
                        ele = ele.parentNode;
                    }
                    if (compareNodeName(ele, ["tbody"])) {
                        self.curSiteRule.pageElement = geneSelector(ele) + ">*";
                        if (ele.children.length > 0 && ele.children[0].querySelector("th")) {
                            self.curSiteRule.pageElement += ":not(:first-child)";
                        }
                        debug(self.curSiteRule.pageElement, 'Page element');
                        return ele.children;
                    }
                    let imgs = ele.querySelectorAll('img');
                    if (imgs.length === 1) {
                        let img = imgs[0];
                        if (img.offsetWidth > ele.offsetWidth / 3 * 2 && img.offsetHeight > ele.offsetHeight / 2) {
                            ele = img;
                        }
                    }
                    self.curSiteRule.pageElement = geneSelector(ele);
                    let childrenEnd = self.checkTargetChildren(ele, curWin, articleNum, curHeight);
                    if (childrenEnd) {
                        self.curSiteRule.pageElement += childrenEnd;
                        ele = ele.children;
                    } else {
                        ele = [ele];
                    }
                    debug(self.curSiteRule.pageElement, 'Page element');
                    return ele;
                }
                pageElement = checkElement(body);
                if (pageElement && pageElement.length > 0 && self.initNext) {
                    let posEle = pageElement[pageElement.length - 1];
                    while (posEle && !posEle.offsetParent) {
                        posEle = posEle.previousElementSibling || posEle.parentNode;
                    }
                    let lastBottom = posEle && getElementBottom(posEle);
                    if (lastBottom && getElementTop(self.initNext) - lastBottom > 1000) {
                        debug("Stop as too long between next & page element");
                        isPause = true;
                        pageElement = [];
                        sideController.remove();
                    } else {
                        if (pageElement.length === 1 && compareNodeName(pageElement[0], ["img"])) {
                            self.curSiteRule.pageBar = 0;
                        }
                    }
                }
                //if(pageElement)this.saveCurSiteRule();
            }

            if (doc !== document) {
                this.setPageElementCss(pageElement);
                this.lazyImgAction(pageElement, doc);
                this.filterEles(doc, pageElement);
            } else if (!this.docPageElement) {
                this.setPageElementCss(pageElement, true);
                this.docPageElement = pageElement;
                this.filterEles(doc, pageElement);
                if (this.nextLinkHref) {
                    this.openInNewTab(pageElement);
                }
            }
            /*
            if (this.curSiteRule.smart && pageElement && pageElement.length > 0) {
                let targetEle = pageElement.length > 1 ? pageElement[0].parentNode : pageElement[0];
                let video = targetEle.querySelector("video,iframe[id*=play],[id*=play]>iframe,iframe[src*=player],iframe[src*=m3u8]");
                if (video && doc == document) {
                    if (video.offsetParent && video.name != 'pagetual-iframe') {
                        let scrollWidth = video.scrollWidth || video.offsetWidth;
                        let scrollHeight = video.scrollHeight || video.offsetHeight;
                        if (/IFRAME/i.test(video.nodeName)) {
                        } else if (scrollWidth > 100 && scrollHeight > 100) {
                            let winWidth = window.innerWidth || document.documentElement.clientWidth;
                            let winHeight = window.innerHeight || document.documentElement.clientHeight;
                            if (scrollWidth > winWidth>>1 && scrollHeight > winHeight>>1) {
                                debug("Disable when large media found");
                            } else {
                                video = null;
                            }
                        } else {
                            video = null;
                        }
                    } else {
                        video = null;
                    }
                }
                if (video) {
                    isPause = true;
                    this.clearAddedElements();
                    return null;
                }
            }
            */
            return pageElement;
        }

        showAddedElements() {
            if (!this.addedElementsIsHide) return;
            if (this.addedElePool && this.addedElePool.length) {
                this.addedElePool.forEach(ele => {
                    ele.classList && ele.classList.remove("pagetual-hide");
                });
            }
            this.addedElementsIsHide = false;
        }

        hideAddedElements() {
            if (this.addedElePool && this.addedElePool.length) {
                this.addedElePool.forEach(ele => {
                    ele.classList && ele.classList.add("pagetual-hide");
                });
            }
            this.addedElementsIsHide = true;
        }

        toggleAddedElements() {
            if (this.addedElementsIsHide) {
                this.showAddedElements();
            } else {
                this.hideAddedElements();
            }
        }

        changeVisibility() {
            let contentVisibility = this.curSiteRule.contentVisibility || rulesData.contentVisibility;
            if (!contentVisibility) return;
            if (!this.changingVisibility) {
                clearTimeout(this.changeVisibilityTimer);
                this.changeVisibilityTimer = setTimeout(() => {
                    this.changingVisibility = true;
                    this.changeVisibility();
                }, 300);
                return;
            }
            this.changingVisibility = false;
            if (!this.visibilityItems || !this.visibilityItems.length || this.visibleIndex < 0) return;
            let tempIndex = this.visibleIndex, findVisible = false, lastVisible = 0;
            let viewPortHeight = window.innerHeight || document.documentElement.clientHeight || getBody(document).clientHeight;
            let checkItem = this.visibilityItems[tempIndex];
            while(checkItem) {
                if (checkItem.offsetParent) {
                    if (!checkItem.style.containIntrinsicSize) return;
                    let clientRect = checkItem.getBoundingClientRect();
                    let top = clientRect && clientRect.top;
                    let bottom = clientRect && clientRect.bottom;
                    if (bottom > 0 && top < viewPortHeight) {
                        if (!findVisible) {
                            findVisible = true;
                            lastVisible = tempIndex;
                        }
                        checkItem.style.contentVisibility = "visible";
                    } else {
                        if (top < viewPortHeight && checkItem.style.contentVisibility === "auto") {
                            break;
                        } else checkItem.style.contentVisibility = "auto";
                    }
                }
                if (tempIndex === 0) break;
                tempIndex--;
                checkItem = this.visibilityItems[tempIndex];
            }
            tempIndex = this.visibleIndex + 1;
            if (findVisible) {
                this.visibleIndex = lastVisible;
            }
            checkItem = this.visibilityItems[tempIndex];
            while(checkItem) {
                if (checkItem.offsetParent) {
                    if (!checkItem.style.containIntrinsicSize) return;
                    let clientRect = checkItem.getBoundingClientRect();
                    let top = clientRect && clientRect.top;
                    let bottom = clientRect && clientRect.bottom;
                    if (bottom > 0 && top < viewPortHeight) {
                        findVisible = true;
                        lastVisible = tempIndex;
                        checkItem.style.contentVisibility = "visible";
                    } else {
                        if (findVisible && checkItem.style.contentVisibility === "auto") {
                            break;
                        } else checkItem.style.contentVisibility = "auto";
                    }
                }
                if (tempIndex === this.visibilityItems.length - 1) break;
                tempIndex++;
                checkItem = this.visibilityItems[tempIndex];
            }
            if (findVisible) {
                this.visibleIndex = lastVisible;
            }
        }

        setPageElementCss(pageElement, init) {
            let self = this;
            if (pageElement && pageElement.length > 0) {
                let pageElementCss = this.curSiteRule.pageElementCss || rulesData.pageElementCss;
                if (!pageElementCss && init && !this.nextLinkHref) return;
                let contentVisibility = this.curSiteRule.contentVisibility || rulesData.contentVisibility;
                if (!contentVisibility && !pageElementCss) return;
                [].forEach.call(pageElement, (ele, i) => {
                    if (!compareNodeName(ele, ["link", "meta", "style", "script"])) {
                        if (pageElementCss) {
                            if (pageElementCss !== '0' && !ele.dataset.pagetualPageElement) {
                                ele.style.cssText = (ele.style.cssText || '') + pageElementCss;
                                ele.dataset.pagetualPageElement = 1;
                            }
                        }
                        if (contentVisibility) {
                            ele.style.containIntrinsicSize = `auto ${ele.offsetHeight || self.preVisibleHeight || 100}px`;
                            if (ele.style.containIntrinsicSize) {
                                if (ele.offsetHeight) self.preVisibleHeight = ele.offsetHeight;
                                if (init) {
                                    ele.style.contentVisibility = "visible";
                                    self.visibilityItems.push(ele);
                                    self.visibleIndex++;
                                } else {
                                    ele.style.contentVisibility = emuIframe ? "visible" : "auto";
                                }
                            }
                        }
                    }
                });
            }
        }

        clearAddedElements() {
            if (this.addedElePool && this.addedElePool.length) {
                this.addedElePool.forEach(ele => {
                    if (ele.parentNode) ele.parentNode.removeChild(ele);
                });
            }
            this.addedElePool = [];
            sideController.remove();
        }

        linkHasHref(link) {
            return link.href && link.href.replace && !this.hrefIsJs(link.href);
        }

        hrefIsJs(href) {
            return /^(javascript|#|$)/.test(href.trim().replace("#p{", "").replace(location.href, ""));
        }

        async querySelectorList(source, list) {
            for (let i = 0; i < list.length; i++) {
                await sleep(1);
                let sel = list[i];
                let result = source.querySelectorAll(sel);
                if (result.length > 0) return result[result.length - 1];
            }
            return null;
        }

        verifyElement(ele) {
            let verifyHandler = e => {
                if (e.nodeType == 9) return true;
                if (e.style.display === "none" || e.getAttribute("aria-disabled") === "true") {
                    return false;
                }
                if (e.className) {
                    if (/slick|slide|gallery|disabled$/i.test(e.className)) {
                        return false;
                    } else if (e.classList) {
                        if (e.classList.contains('disabled') || e.classList.contains('active')) {
                            return false;
                        }
                    }
                }
                let ariaLabel = e.getAttribute("aria-label");
                if (ariaLabel && /slick|slide|gallery/i.test(ariaLabel)) return false;
                return true;
            };
            if (!ele) return false;
            let i = 0;
            while (ele && i++ < 6) {
                if (!verifyHandler(ele)) return false;
                ele = ele.parentNode;
            }
            return true;
        }

        async getPage(doc, exist) {
            if (document.documentElement.className.indexOf('discourse') !== -1) return {};
            let body = getBody(doc);
            let canSave = false;//發現頁碼選擇器在其他頁對不上，還是別保存了
            let url = this.curUrl.slice(0, 250).replace("index.php?", "?");
            let _url = url.replace(/\.s?html?$/i, "").toLowerCase();
            let pageNum = 1, preStr = "", afterStr = "";
            let pageTwoReg = /^[\/\?&]?[_-]?(p|page)?=?\/?2(\/[^\/]*$|\?|&|$)/i;
            let pageMatch1 = url.match(/(.*[\?&]p(?:age)?=)(\d+)($|[#&].*)/i);
            let doubtTextReg = /^\s*(»|>>)\s*$/;
            if (pageMatch1) {
                preStr = pageMatch1[1];
                pageNum = parseInt(pageMatch1[2]);
                afterStr = pageMatch1[3];
            } else {
                let pageMatch2 = url.match(/(.*[a-z\/\-_](?:p|page)?\/?)(\d+)(\.s?html?$|\/?$)/i);
                if (pageMatch2) {
                    preStr = pageMatch2[1];
                    pageNum = parseInt(pageMatch2[2]);
                    afterStr = pageMatch2[3];
                    if (/^\/?$/.test(afterStr) && !/(p(age)?|_|\-|\/)$/.test(preStr)) {
                        preStr = "";
                        afterStr = "";
                    }
                }
            }
            if (pageNum > 999) {
                pageNum = 1;
                preStr = "";
                afterStr = "";
            }
            let curPage = doc, i, cur, jsNext;
            let next1, next2, next3, next4, nextJs1, nextJs2;
            let selectorList = [
                ".page-next>a",
                "a.next_page",
                "#next_page",
                ".curPage+a",
                ".nextPage",
                ".pagination-next>a",
                "a[data-pagination=next]",
                ".pageButtonsCurrent+a",
                "a[class*=nextpage]",
                "li.page-current+li>a",
                "[class^=pag] a[rel=next]",
                "[class^=Pag] [aria-label=next]",
                "[aria-label='Next page']",
                "[aria-label='next page']",
                ".pagination-nav__item--next>a",
                "a.pageright",
                ".page-numbers.current+a",
                "a.page-numbers.next",
                "body [class*=pagination] li.active+li>a",
                "body [class^=pag] .current+a",
                ".page_current+a",
                "input[value='next']",
                "input[value='Next page']",
                "input[value='下一页']",
                "input[value='下一頁']",
                "a#pb_next",
                "a#rightFix",
                "a#btnPreGn",
                "a.page-next",
                "a.pages-next",
                "a.page.right",
                ".paging>.active+.item",
                "a#next",
                ".next>a",
                ".next>button",
                "a[alt=next]",
                ".pg_area>em+a",
                "button.next:not([disabled])",
                ".btn_next:not([disabled])",
                ".btn-next:not([disabled])",
                "a#linkNext",
                "a[class*=page__next]",
                "[class*=pager]>a.next",
                "[class*=pagination-next]>a"
            ];
            let next = await this.querySelectorList(body, selectorList);
            if (!next) {
                await sleep(1);
                let nexts = body.querySelectorAll("a.next");
                const prevReg = /^\s*([上前首尾]|previous)/i;
                for (i = 0; i < nexts.length; i++) {
                    let n = nexts[i];
                    if (this.verifyElement(n) && this.linkHasHref(n) && !prevReg.test(n.innerText.trim())) {
                        next = n;
                        break;
                    }
                }
            }
            if (next) {
                let innerText = next.innerText;
                let isJs = !this.linkHasHref(next);
                if (innerText && nextTextReg2.test(innerText.trim())) {
                    if (isJs) {
                        if (this.verifyElement(next)) {
                            nextJs2 = next;
                        }
                    } else {
                        next2 = next;
                    }
                    next = null;
                } else {
                    if (isJs) {
                        if (this.verifyElement(next)) {
                            jsNext = next;
                        }
                        next = null;
                    }
                }
            }
            if (!next) {
                await sleep(1);
                next = body.querySelector("a.curr+a") ||
                    body.querySelector("div.wp-pagenavi>span.current+a,div.page-nav>span.current+a,div.article-paging>span+a") ||
                    body.querySelector(".number>ul>li.active+li>a");
            }
            if (!next) {
                await sleep(1);
                let pageDiv = body.querySelector(".pages>ul,.page_no>ul");
                if (pageDiv) {
                    cur = pageDiv.querySelector("li>b,li>strong");
                    if (cur) next = cur.parentNode.nextElementSibling;
                    if (next) next = next.querySelector("a");
                }
            }
            if (!next) {
                await sleep(1);
                next = body.querySelector(".pages>a[href='javascript:;']+a");
                if (next && (next.href === "javascript:;" || next.getAttribute("href") === "#")) next = null;
            }
            if (!next) {
                await sleep(1);
                let pageDiv = body.querySelector(".pagination");
                if (pageDiv) {
                    cur = pageDiv.querySelector("[class*=current]");
                    if (cur) next = cur.parentNode.nextElementSibling;
                    if (next) next = next.querySelector("a");
                }
            }
            if (!next) {
                await sleep(1);
                let pageDivs = body.querySelectorAll("[class*=pagination],[class*=Pagination]");
                if (pageDivs && pageDivs.length) {
                    for (let i = pageDivs.length - 1; i >= 0; i--) {
                        let p = pageDivs[i];
                        if (/(next\s*(»|>>|>|›|→|❯)?|&gt;|▶|>|›|→|❯)/i.test(p.title || p.value || '')) {
                            next = p.querySelector('a') || p;
                            break;
                        } else if (/^(next\s*(»|>>|>|›|→|❯)?|&gt;|▶|>|›|→|❯)$/i.test((p.innerText || '').trim())) {
                            next = p.querySelector('a') || p;
                            break;
                        }
                    }
                    if (next && !this.linkHasHref(next)) {
                        if (!jsNext) jsNext = next;
                        next = null;
                    }
                }
            }
            if (!next) {
                let isApp = !!body.querySelector("main#app");
                let aTags = body.querySelectorAll("a,button,[type='button']");
                for (i = aTags.length - 1; i >= 0; i--) {
                    if (next1) break;
                    if (i % 100 === 0) {
                        await sleep(1);
                    }
                    let aTag = aTags[i];
                    let title = aTag.title || "";
                    let value = aTag.value || "";
                    let innerText = aTag.innerText || "";
                    if (innerText === "" || (title !== "" && title.length < innerText.length)) {
                        innerText = title;
                    }
                    if (innerText === "" || (value !== "" && value.length < innerText.length)) {
                        innerText = value;
                    }
                    if (innerText !== "") {
                        if (innerText === "§") continue;
                        innerText = innerText.trim();
                        if (innerText.length > 80) continue;
                    }
                    if (!this.verifyElement(aTag)) continue;
                    if (aTag.dataset && aTag.dataset.preview) continue;
                    let availableHref = aTag.href && aTag.href.length < 250 && /^http/.test(aTag.href);
                    if (availableHref && /next\-?(page)?$/i.test(aTag.href)) continue;
                    if (compareNodeName(aTag.parentNode, ["blockquote"])) continue;
                    if (aTag.previousElementSibling && /\b(play|volume)\b/.test(aTag.previousElementSibling.className)) continue;
                    if (aTag.nextElementSibling && /\b(play|volume)\b/.test(aTag.nextElementSibling.className)) continue;
                    let isJs = !this.linkHasHref(aTag);
                    if (exist && isJs && !aTag.offsetParent) continue;
                    if (innerText) {
                        innerText = innerText.split(/\n/)[0].replace(/ /g, '');
                        if (isJs && /^(»|>>|>|›|→|❯)$/.test(innerText)) continue;
                        if (innerText && innerText.length <= 25) {
                            if (!next1) {
                                if (nextTextReg1.test(innerText)) {
                                    if (isJs) {
                                        if (!nextJs1) nextJs1 = aTag;
                                    } else {
                                        next1 = aTag;
                                    }
                                }
                            }
                            if (!next4) {
                                if (!next2) {
                                    if (nextTextReg2.test(innerText) || /nextpage|pager\-older/i.test(aTag.className) || /^(»|>>)$/.test(innerText)) {
                                        if (isJs) {
                                            if (!nextJs2) nextJs2 = aTag;
                                        } else {
                                            next2 = aTag;
                                        }
                                    }
                                }
                                if (!isApp && !next3 && !isJs) {
                                    if (/^(next\s*(»|>>|>|›|→|❯)?|&gt;|▶|>|›|→|❯)$/i.test(aTag.textContent) && aTag.parentNode.hasAttribute && !aTag.parentNode.hasAttribute("jsaction")) {
                                        next3 = aTag;
                                    }
                                }
                            }
                        }
                    }
                    if (isJs) continue;
                    if (!next4) {
                        let prevEle = aTag.previousElementSibling;
                        if (prevEle && compareNodeName(prevEle, ["b", "span", "strong"])) {
                            if (/^\d+$/.test(aTag.innerText.trim()) && /^\d+$/.test(prevEle.innerText.trim()) && parseInt(aTag.innerText) === parseInt(prevEle.innerText) + 1) {
                                next4 = aTag;
                            }
                        }
                    }
                    if (urlWillChange) continue;
                    if (!next4 && availableHref) {
                        if (aTag.href.indexOf(location.hostname) === -1) continue;
                        let _aHref = aTag.href.replace("?&", "?").replace("index.php?", "?").toLowerCase();
                        if (preStr || afterStr) {
                            let _aHrefTrim = _aHref;
                            if (preStr) _aHrefTrim = _aHrefTrim.replace(preStr, "");
                            if (afterStr) _aHrefTrim = _aHrefTrim.replace(afterStr, "");
                            if (_aHrefTrim == pageNum + 1) {
                                next4 = aTag;
                            }
                        } else if (this.curUrl !== aTag.href) {
                            _aHref = _aHref.replace(/\.s?html?$/i, "");
                            if (_aHref.indexOf(_url) !== -1) {
                                let pageTwoMatch = _aHref.replace(_url, "").match(pageTwoReg);
                                if (pageTwoMatch) {
                                    afterStr = pageTwoMatch[2];
                                    next4 = aTag;
                                }
                            }
                        }
                        if (next4 && !/page/.test(next4.href)) {
                            let curHref = next4.getAttribute("href");
                            let curPageReg = new RegExp("(.*)" + (pageNum + 1) + afterStr.replace(/([\.\?])/g, '\\$1'));
                            let otherPageHref = curHref.replace(curPageReg, `$1${pageNum}${afterStr}`);
                            let otherPageEle = body.querySelector(`a[href='${otherPageHref}']`);
                            if (!otherPageEle) {
                                otherPageHref = curHref.replace(curPageReg, `$1${pageNum + 2}${afterStr}`);
                                otherPageEle = body.querySelector(`a[href='${otherPageHref}']`);
                            }
                            if (otherPageEle) {
                                let parent = otherPageEle.parentNode;
                                if (parent && parent.parentNode) {
                                    parent = parent.parentNode;
                                    if (parent.parentNode) {
                                        parent = parent.parentNode;
                                    }
                                }
                                if (parent && parent.contains(next4) && !/^\d+$/.test(otherPageEle.innerText.trim())) {
                                    next4 = null;
                                }
                            }
                        }
                    }
                }
                if (next2 && doubtTextReg.test(next2.innerText)) {
                    next2 = this.verifyNext(next2, doc);
                }
                if (nextJs2 && doubtTextReg.test(nextJs2.innerText)) {
                    nextJs2 = this.verifyNext(nextJs2, doc);
                }
                if (next3) {
                    next3 = this.verifyNext(next3, doc);
                }
            }
            if (!next) next = next1 || next4 || next3 || next2;
            if (!next && location.pathname !== "/") {
                next = jsNext || nextJs1 || nextJs2;
                if (next && next.parentNode.className && next.parentNode.className.indexOf && next.parentNode.className.indexOf('tab') !== -1) next = null;
            }
            if (next && next.classList && (next.classList.contains("results-more") || next.classList.contains("no"))) next = null;
            if (next && next.hasAttribute && next.hasAttribute("disabled")) next = null;
            if (next && next.parentNode.href && compareNodeName(next.parentNode, ["a"])) next = next.parentNode;
            return {next:next, canSave:canSave};
        }

        verifyNext(next, doc) {
            if (!next) return null;
            if (next.previousElementSibling && compareNodeName(next.previousElementSibling, ["br"])) return null;
            let eles = [];
            if (next.innerText && next.innerText.indexOf("\n") === -1) {
                eles = getAllElements(`//${next.nodeName}[text()='${next.innerText}']`, doc);
            }
            if (eles.length >= 2 && eles[0].href !== eles[1].href) {
                next = null;
            } else if (doc === document) {
                let left = getElementLeft(next);
                if (left < 20 || (document.documentElement.scrollWidth > 500 && left < 250)) {
                    next = null;
                } else {
                    let top = getElementTop(next);
                    if (top < 20 || (left < window.innerWidth / 3 && top < window.innerHeight / 3)) {
                        next = null;
                    } else {
                        let bottom = top + next.offsetHeight || 0;
                        let scrollH = Math.max(document.documentElement.scrollHeight, getBody(document).scrollHeight);
                        if (scrollH - bottom < 10) next = null;
                    }
                }
            }
            return next;
        }

        canonicalUri(src) {
            if (!src) {
                return "";
            }
            if (src.charAt(0) === "#") return this.curUrl + src;
            if (src.charAt(0) === "?") return this.curUrl.replace(/^([^\?#]+).*/, "$1" + src);
            let origin = location.protocol + '//' + location.host;
            let url = this.basePath || origin;
            url = url.replace(/(\?|#).*/, "");
            if (/https?:\/\/[^\/]+$/.test(url)) url = url + '/';
            if (url.indexOf("http") !== 0) url = origin + url;
            var root_page = /^[^\?#]*\//.exec(url)[0],
                root_domain = /^\w+\:\/\/\/?[^\/]+/.exec(root_page)[0],
                absolute_regex = /^\w+\:\/\//;
            this.updateUrl = false;
            while (src.indexOf("../") === 0) {
                src = src.substr(3);
                root_page = root_page.replace(/\/[^\/]+\/$/, "/");
                this.updateUrl = true;
            }
            src = src.replace(/\.\//, "");
            if (/^\/\/\/?/.test(src)) {
                src = location.protocol + src;
            }
            return (absolute_regex.test(src) ? src : ((src.charAt(0) === "/" ? root_domain : root_page) + src));
        }

        getLinkByPage(url, pageNum) {
            if (!url) return null;
            if (this.curSiteRule.pageNum) {
                let result = this.curSiteRule.pageNum;
                let strMatch = result.match(/\{.*?}/);
                if (!strMatch) return null;
                let urlReg = new RegExp("(" + result.replace(strMatch[0], ")\\d+(") + ")", "i");
                let code = strMatch[0].replace(/^{/, "").replace(/}$/, "").replace(/\$p/g, pageNum);
                if (code === pageNum) {
                    result = url.replace(urlReg, "$1" + code + "$2");
                } else {
                    try {
                        code = Function('"use strict";return ' + code)();
                        if (code && code % 1 == 0) {
                            result = url.replace(urlReg, "$1" + code + "$2");
                        } else return null;
                    } catch(e) {
                        debug(e);
                    }
                }
                if (result != url) {
                    return result;
                }
            }
            return url.replace(/([&\/\?](p=|page[=\/_-]?))\d+/i, "$1" + pageNum).replace(/([_-])\d+\./i, "$1" + pageNum + ".");
        }

        getPageNumFromUrl(url, defaultPage) {
            if (!url) return defaultPage;
            if (this.curSiteRule.pageNum) {
                let result = this.curSiteRule.pageNum;
                let strMatch = result.match(/\{.*?}/);
                if (!strMatch) return defaultPage;
                let urlReg = new RegExp(".*" + result.replace(strMatch[0], "(\\d+)") + ".*", "i");
                let curShowNum = url.replace(urlReg, "$1");
                if (curShowNum !== url) {
                    let code = strMatch[0].replace(/^{/, "").replace(/}$/, "");
                    if (code === "$p") {
                        return curShowNum;
                    } else {
                        try {
                            let page1 = parseInt(Function('"use strict";return ' + code.replace("$p", "0"))());
                            let page2 = parseInt(Function('"use strict";return ' + code.replace("$p", "1"))());
                            let numGap = page2 - page1;
                            let _page = (parseInt(curShowNum) - page1) / numGap;
                            if (_page && _page % 1 === 0) return _page;
                            else {
                                this.curSiteRule.pageNum = null;
                                return defaultPage;
                            }
                        } catch(e) {
                            debug(e);
                        }
                    }
                } else {
                    return defaultPage;
                }
            }
            let pageNum = url.replace(/.*[&\/\?](p=|page[=\/_-]?)(\d+).*/i, "$2");
            return pageNum === url ? defaultPage : (pageNum.length > 4 ? defaultPage : pageNum);
        }

        async getNextLink(doc, exist) {
            let nextLink = null, page, href;
            let getNextLinkByForm = (form, submitBtn, n) => {
                let params = [];
                let formData = new FormData(form);
                if (submitBtn && submitBtn.getAttribute) {
                    let btnValue, btnName;
                    btnName = submitBtn.getAttribute("name");
                    btnValue = submitBtn.getAttribute("value");
                    if (btnName && btnValue) params = [btnName + "=" + encodeURIComponent(btnValue)];
                }
                for (let [key, value] of formData) {
                    if (n && /^(p|page)$/i.test(key)) {
                        params.push(key + '=' + n);
                    } else {
                        params.push(key + '=' + encodeURIComponent(value));
                    }
                }
                params = params.join('&');
                return form.action + (form.action.indexOf('?') === -1 ? '?' : '&') + params + (form.method === 'post' ? '#p{' + params + '}' : '');
            };
            if (this.curSiteRule.pageElementByJs) {
                this.nextLinkHref = "#";
                return true;
            } else if (this.curSiteRule.nextLinkByJs) {
                try {
                    let over = _url => {};
                    let targetUrl = await ((typeof this.curSiteRule.nextLinkByJs === 'function') ? this.curSiteRule.nextLinkByJs : new AsyncFunction("doc", '"use strict";' + this.curSiteRule.nextLinkByJs))(doc);
                    if (targetUrl) nextLink = {href: targetUrl};
                } catch(e) {
                    debug(e);
                }
            } else if (this.curSiteRule.nextLinkByUrl) {
                let targetUrl = this.curUrl.replace(new RegExp(this.curSiteRule.nextLinkByUrl[0], "i"), this.curSiteRule.nextLinkByUrl[1]);
                if (targetUrl !== this.curUrl) {
                    let includeSel = this.curSiteRule.nextLinkByUrl[2];
                    let excludeSel = this.curSiteRule.nextLinkByUrl[3];
                    if (includeSel) {
                        includeSel = includeSel.trim();
                        if (!getElement(includeSel, doc)) {
                            this.nextLinkHref=false;
                            return null;
                        }
                    }
                    if (excludeSel) {
                        excludeSel = excludeSel.trim();
                        if (getElement(excludeSel, doc)) {
                            this.nextLinkHref=false;
                            return null;
                        }
                    }
                    let reps = targetUrl.match(/{.*?}/g);
                    if (reps) {
                        reps.forEach(rep => {
                            let code = rep.replace("{", "").replace("}", "").replace(/\(\)/g, "0");
                            let result = code.match(/^(\d*)\+1$/);
                            if (result) {
                                result = parseInt(result[1] || 1) + 1;
                            } else {
                                try {
                                    result = Function('"use strict";return ' + code)();
                                } catch(e) {
                                    debug(e);
                                }
                            }
                            targetUrl = targetUrl.replace(rep, result);
                        });
                    }
                }
                nextLink = {href: targetUrl};
            } else if (typeof this.curSiteRule.nextLink !== 'undefined') {
                let nextLinkSel = this.curSiteRule.nextLink;
                if (nextLinkSel != 0) {
                    if (Array && Array.isArray && Array.isArray(nextLinkSel)) {
                        nextLink = getElement(nextLinkSel[nextIndex], doc, null, true);
                        if (!nextLink && curPage === 1 && nextIndex !== 0) {
                            nextIndex = 0;
                            nextLink = getElement(nextLinkSel[nextIndex], doc, null, true);
                        }
                    } else nextLink = getElement(nextLinkSel, doc, null, true);
                }
                if (nextLink && (this.curSiteRule.action == 0 || this.curSiteRule.action == 1 || this.curSiteRule.action == 2)) {
                    let form = doc.querySelector('#search-form');
                    if (!nextLink.href && nextLink.hasAttribute && nextLink.hasAttribute("onclick") && form) {
                        if (/^\d+$/.test(nextLink.innerText)) {
                            nextLink.href = getNextLinkByForm(form, nextLink, nextLink.innerText);
                        }
                    } else if (compareNodeName(nextLink, ["input"]) || nextLink.type === "submit") {
                        form = nextLink.parentNode;
                        while (form) {
                            if (compareNodeName(form, ["form"])) break;
                            else form = form.parentNode;
                        }
                        if (form) {
                            nextLink.href = getNextLinkByForm(form, nextLink);
                        }
                    }
                    if (nextLink.href && this.curSiteRule.action != 0) {
                        nextLink.href = nextLink.href.replace(/#p{.*/, "");
                    }
                }
            } else {
                page = await this.getPage(doc, exist);
                nextLink = page.next;
                if (nextLink) {
                    if (compareNodeName(nextLink, ["input"]) || nextLink.type === "submit") {
                        if (!/next/i.test(nextLink.getAttribute("onclick"))) {
                            let form = nextLink.parentNode;
                            while (form) {
                                if (compareNodeName(form, ["form"])) break;
                                else form = form.parentNode;
                            }
                            if (form) {
                                nextLink.href = getNextLinkByForm(form, nextLink);
                            }
                        }
                    }
                    let parent = nextLink;
                    while (parent && !compareNodeName(parent, ["body"])) {
                        if (parent.hasAttribute && parent.hasAttribute("disabled")) {
                            this.nextLinkHref = false;
                            return null;
                        }
                        if (parent.className && parent.classList) {
                            if (parent.classList.contains("noClick") || parent.classList.contains("no-pages") || parent.classList.contains("disabled")) {
                                this.nextLinkHref = false;
                                return null;
                            }
                        }
                        if (parent.style && parent.style.display === "none") {
                            this.nextLinkHref = false;
                            return null;
                        }
                        parent = parent.parentNode;
                    }
                    if (doc === document) {
                        if (!this.linkHasHref(nextLink)) {
                            if ((clickedSth && this.curSiteRule.smart) || !isVisible(nextLink, _unsafeWindow)) {
                                this.nextLinkHref = false;
                                return null;
                            }
                            let video = document.querySelector("video,iframe[id*=play],[id*=play]>iframe,iframe[src*=player],iframe[src*=m3u8]");
                            if (video) {
                                if (video.offsetParent && video.name !== 'pagetual-iframe') {
                                    let scrollWidth = video.scrollWidth || video.offsetWidth;
                                    let scrollHeight = video.scrollHeight || video.offsetHeight;
                                    if (compareNodeName(video, ["iframe"])) {
                                    } else if (scrollWidth > 100 && scrollHeight > 100) {
                                        let winWidth = window.innerWidth || document.documentElement.clientWidth;
                                        let winHeight = window.innerHeight || document.documentElement.clientHeight;
                                        if (scrollWidth > winWidth>>1 && scrollHeight > winHeight>>1) {
                                            debug("Disable when large media found");
                                        } else {
                                            video = null;
                                        }
                                    } else {
                                        video = null;
                                    }
                                } else {
                                    video = null;
                                }
                            }
                            if (video) {
                                isPause = true;
                                this.clearAddedElements();
                                this.nextLinkHref = false;
                                return null;
                            }
                        }

                        let nextLinkCs = _unsafeWindow.getComputedStyle(nextLink);
                        if (nextLinkCs.cursor === "not-allowed") {
                            this.nextLinkHref = false;
                            return null;
                        }
                        this.initNext = nextLink;
                    }
                    let form = doc.querySelector('#search-form');
                    if (!nextLink.href && nextLink.hasAttribute("onclick") && form) {
                        if (form && /^\d+$/.test(nextLink.innerText)) {
                            href = getNextLinkByForm(form, nextLink, nextLink.innerText);
                        }
                    }
                }
            }
            if (nextLink) {
                if (!this.checkStopSign(nextLink, doc)) {
                    if (curPage > 1 && rulesData.lastPageTips) showTips(i18n("lastPage"), "", 800);
                    return null;
                }
                if (this.curSiteRule.action == 3) {
                    if (doc == document) debug(nextLink, 'Next link');
                    this.nextLinkHref = '#';
                } else {
                    let needUrl = (this.curSiteRule.action == 0 || this.curSiteRule.action == 1 || this.curSiteRule.action == 2);
                    if (!href) href = nextLink.href;
                    if (href && nextLink.getAttribute) {
                        let _href = nextLink.getAttribute("href");
                        if (_href) {
                            if (_href.charAt(0) === "#" || _href === "?"){
                                href = "#";
                            } else {
                                href = _href;
                            }
                        } else if (_href === "") {
                            href = _href;
                        }
                    }

                    if (needUrl && (href === "" || href === null)) {
                        this.nextLinkHref = false;
                    } else if (needUrl && /^(javascript:|#)/.test(href)) {
                        this.nextLinkHref = false;
                    } else {
                        this.nextLinkHref = (href && !/^(javascript:|#)/.test(href)) ? this.canonicalUri(href) : "#";
                        let tempUrl = this.nextLinkHref;
                        if (tempUrl !== "#" && (this.compareUrl(tempUrl, this.initUrl) || this.compareUrl(tempUrl, this.curUrl) || this.compareUrl(tempUrl, this.curUrl + "#") || this.compareUrl(tempUrl, this.oldUrl) || this.compareUrl(tempUrl, this.oldUrl + "#"))) {
                            this.nextLinkHref = false;
                        } else if (doc === document) {
                            debug(nextLink, 'Next link');
                        }
                    }
                }
            } else {
                this.nextLinkHref = false;
            }
            this.nextLinkEle = nextLink;
            this.preload();
            return nextLink;
        }

        compareUrl(url1, url2) {
            if (url1 === url2) return true;
            if (!url1 || !url2) return false;
            let url1Arr = url1.split("?");
            let url2Arr = url2.split("?");
            if (url1Arr[0] != url2Arr[0]) return false;
            if (!url1Arr[1] || !url2Arr[1]) return false;
            url1Arr = url1Arr[1].split("&").sort().join("&");
            url2Arr = url2Arr[1].split("&").sort().join("&");
            return url1Arr === url2Arr;
        }

        filterEles(doc, eles) {
            let filter = this.curSiteRule.filter;
            if (!filter || !eles || eles.length === 0) return;
            if (eles.length === 1) {
                eles = eles[0].children;
                if (eles.length === 1) {
                    eles = eles[0].children;
                }
            }
            if (typeof filter === "string") {
                if (/^\d+$/.test(filter)) {
                    filter = {count: parseInt(filter)};
                } else filter = {words: filter};
            }
            [].forEach.call(eles, ele => {
                if (!ele.parentNode) return;
                let canKeep = (() => {
                    let innerText = (ele.innerText && ele.innerText.trim()) || "";
                    if (filter.count) {
                        if (innerText.length < filter.count) return false;
                    }
                    if (filter.words) {
                        let wordsRegExp = new RegExp(filter.words, "i");
                        if (innerText && wordsRegExp.test(innerText)) return false;
                    }
                    if (filter.link) {
                        let linkRegExp = new RegExp(filter.link, "i");
                        if (compareNodeName(ele, ["a"]) && linkRegExp.test(ele.href)) return false;
                        let aChildren = ele.querySelectorAll("a");
                        for (let i = 0; i < aChildren.length; i++) {
                            let child = aChildren[i];
                            if (linkRegExp.test(child.href)) return false;
                        }
                    }
                    if (filter.selector) {
                        if (getElement(filter.selector, doc, ele)) return false;
                    }
                    return true;
                })();
                if (!canKeep) {
                    ele.parentNode.removeChild(ele);
                }
            });
        }

        checkStopSign(nextLink, doc) {
            if (this.curSiteRule.stopSign) {
                let typeArray = Array && Array.isArray && Array.isArray(this.curSiteRule.stopSign);
                let typeObject = !typeArray && (this.curSiteRule.stopSign.include || this.curSiteRule.stopSign.exclude || this.curSiteRule.stopSign.pageNum);
                if (typeArray || typeObject) {
                    let includeSel, excludeSel, curSign, maxSign;
                    if (typeArray) {
                        includeSel = this.curSiteRule.stopSign[0];
                        excludeSel = this.curSiteRule.stopSign[1];
                        curSign = this.curSiteRule.stopSign[2];
                        maxSign = this.curSiteRule.stopSign[3];
                        if (Array && Array.isArray && Array.isArray(includeSel) && !curSign) {
                            curSign = includeSel;
                            includeSel = false;
                        }
                        if (excludeSel && Array && Array.isArray && Array.isArray(excludeSel) && !maxSign) {
                            maxSign = excludeSel;
                            excludeSel = false;
                        }
                    } else {
                        includeSel = this.curSiteRule.stopSign.include;
                        excludeSel = this.curSiteRule.stopSign.exclude;
                        curSign = this.curSiteRule.stopSign.pageNum;
                    }
                    if (includeSel) {
                        includeSel = includeSel.trim();
                        if (!getElement(includeSel, doc)) {
                            isPause = true;
                            this.nextLinkHref = false;
                            return false;
                        }
                    }
                    if (excludeSel) {
                        excludeSel = excludeSel.trim();
                        if (getElement(excludeSel, doc)) {
                            isPause = true;
                            this.nextLinkHref = false;
                            return false;
                        }
                    }
                    if (curSign) {
                        if (!maxSign) maxSign = curSign.slice(2);
                        let currentEle = getElement(curSign[0], doc);
                        let maxEle = getElement(maxSign[0], doc);
                        if (currentEle && maxEle) {
                            let currentSignNum, maxSignNum;
                            if (/\(.*\)/.test(curSign[1])) {
                                currentSignNum = currentEle.innerText.match(new RegExp(curSign[1]));
                                if (currentSignNum) currentSignNum = currentSignNum[1];
                            } else if (currentEle.getAttribute) {
                                currentSignNum = currentEle.getAttribute(curSign[1]);
                            }
                            if (/\(.*\)/.test(maxSign[1])) {
                                maxSignNum = maxEle.innerText.match(new RegExp(maxSign[1]));
                                if (maxSignNum) maxSignNum = maxSignNum[1];
                            } else if (maxEle.getAttribute) {
                                maxSignNum = maxEle.getAttribute(maxSign[1]);
                            }
                            if (currentSignNum && maxSignNum && currentSignNum == maxSignNum) {
                                isPause = true;
                                this.nextLinkHref = false;
                                return false;
                            }
                        }
                    }
                } else {
                    try {
                        let stopSign = ((typeof this.curSiteRule.stopSign === 'function') ? this.curSiteRule.stopSign : Function("doc", "nextLink", '"use strict";' + this.curSiteRule.stopSign))(doc, nextLink);
                        if (stopSign) {
                            isPause = true;
                            this.nextLinkHref = false;
                            return false;
                        }
                    } catch(e) {
                        debug(e);
                    }
                }
            }
            return true;
        }

        preloadImageHandler() {
            if (this.preloadingImage || !this.unCheckedImgs.length) return;
            this.preloadingImage = true;
            setTimeout(() => {
                this.preloadingImage = false;
                this.preloadImageHandler();
            }, 10);
            let iSrc = this.unCheckedImgs.shift();
            let img = document.createElement('img');
            img.src = iSrc;
            this.preloadDiv.appendChild(img);
        }

        preload() {
            if (!rulesData.preload) return;
            if (this.curSiteRule.preload === 0) return;
            if (!this.nextLinkHref || this.nextLinkHref == "#") return;
            let self = this, url = this.nextLinkHref;
            let postParams = url.match(/#p{(.*)}$/);
            if (postParams) {
                postParams = postParams[1];
                url = url.replace(/#p{.*/, "");
            }
            _GM_xmlhttpRequest({
                url: url,
                method: postParams ? 'POST' : 'GET',
                data: postParams,
                overrideMimeType: 'text/html;charset=' + charset,
                headers: {
                    'Referer': location.href,
                    'User-Agent': navigator.userAgent,
                    "Content-Type": (postParams ? "application/x-www-form-urlencoded" : "text/html") + ";charset=" + charset,
                },
                timeout: 10000,
                onload: function(res) {
                    var doc = null;
                    try {
                        doc = document.implementation.createHTMLDocument('');
                        doc.documentElement.innerHTML = createHTML(res.response);
                        var body = getBody(doc);
                        if (!self.preloadDiv) {
                            self.preloadDiv = document.createElement('div');
                            self.preloadDiv.id = "pagetual-preload";
                            self.preloadDiv.style.cssText = 'display:none!important;';
                            getBody(document).appendChild(self.preloadDiv);
                            self.checkedImgs = {};
                            self.unCheckedImgs = [];
                        }
                        let code = self.curSiteRule.preloadImages;
                        if (code) {
                            let imgSrcArr = new Function("doc", '"use strict";' + code)(doc);
                            if (imgSrcArr && imgSrcArr.length) {
                                imgSrcArr.forEach(imgSrc => {
                                    if (imgSrc && !self.checkedImgs[imgSrc]) {
                                        self.checkedImgs[imgSrc] = true;
                                        self.unCheckedImgs.push(imgSrc);
                                    }
                                });
                            }
                            self.preloadImageHandler();
                        } else if (code !== 0 && code !== false) {
                            if (body && body.firstChild) {
                                self.lazyImgAction(body.children, doc);
                            }
                            [].forEach.call(doc.images, i => {
                                let iSrc = i.src;
                                if (iSrc && !self.checkedImgs[iSrc]) {
                                    self.checkedImgs[iSrc] = true;
                                    self.unCheckedImgs.push(iSrc);
                                }
                            });
                            self.preloadImageHandler();
                        }
                    }
                    catch(e) {
                        debug(e);
                        return;
                    }
                }
            });
        }

        getInsert(refresh) {
            if (refresh) {
                this.insert = null;
            }
            if (this.insert && this.insert.parentNode && document.documentElement.contains(this.insert)) {
                return this.insert;
            }
            if (this.curSiteRule.insert) {
                let insertSel = this.curSiteRule.insert;
                if (Array && Array.isArray && Array.isArray(insertSel)) {
                    insertSel = insertSel[nextIndex < insertSel.length ? nextIndex : 0];
                }
                this.insert = getElement(insertSel, document, null, true);
            } else {
                this.docPageElement = null;
                let pageElement = this.getPageElement(document, _unsafeWindow);
                if (this.curSiteRule.smart && this.nextLinkHref == "#" && this.curSiteRule.pageElement === 'body') {
                    debug("Stop as jsNext & whole body");
                    isPause = true;
                    return null;
                }
                if (pageElement && pageElement.length > 0) {
                    let pEIndex = pageElement.length - 1;
                    let pELast = pageElement[pEIndex];
                    while(pELast && compareNodeName(pELast, ["link", "meta", "style", "script"])) {
                        pEIndex--;
                        pELast = pageElement[pEIndex];
                    }
                    this.insert = pELast.nextSibling ? pELast.nextSibling : pELast.parentNode.appendChild(document.createTextNode(' '));
                }
            }
            return this.insert;
        }

        pageInit(doc, eles) {
            let code = this.curSiteRule.pageInit;
            if (code) {
                let initFunc = ((typeof code == 'function') ? code : Function("doc", "eles", '"use strict";' + code));
                let checkInit = (resolve) => {
                    try {
                        if (initFunc(doc, eles) === false) {
                            setTimeout(() => {
                                checkInit(resolve);
                            }, 100);
                        } else {
                            resolve(true);
                        }
                    } catch(e) {
                        resolve(false);
                        debug(e);
                    }
                };
                return new Promise((resolve) => {
                    checkInit(function(e) {
                        resolve(e)
                    });
                })
            }
        }

        pageAction(doc, eles) {
            let code = this.curSiteRule.pageAction;
            if (code) {
                try {
                    ((typeof code == 'function') ? code : Function("doc", "eles", '"use strict";' + code))(doc, eles);
                } catch(e) {
                    debug(e);
                }
            }
            this.openInNewTab(eles);
            this.replaceElement(doc);
        }

        openInNewTab(eles) {
            if (openInNewTab) {
                [].forEach.call(eles, ele => {
                    if (compareNodeName(ele, ["a"]) && ele.href && !/^(mailto:|javascript:)|#/.test(ele.href)) {
                        ele.setAttribute('target', openInNewTab == 1 ? '_blank' : '_self');
                    } else {
                        [].forEach.call(ele.querySelectorAll('a[href]:not([href^="mailto:"]):not([href^="javascript:"]):not([href^="#"])'), a => {
                            if (openInNewTab == 1) {
                                a.setAttribute('target', '_blank');
                                if (a.getAttribute('onclick') == 'atarget(this)') {
                                    a.removeAttribute('onclick');
                                }
                            } else a.setAttribute('target', '_self');
                        });
                    }
                });
            }
        }

        lazyImgAction(eles, doc) {
            if (!eles || eles.length == 0) return;
            let lazyImgSrc = this.curSiteRule.lazyImgSrc;
            if (lazyImgSrc === 0 || lazyImgSrc === '0') return;
            let imgLazyAttrs = [];
            let lazyAttrs = ["div[data-thumb]|data-src", "div.img|data-src", "div.lazy|data-src", "div.lazy|data-original", "a.lazy|data-bg", "a.lazyload|data-original"];
            let removeProps = [];
            let setLazyImg = img => {
                let realSrc;
                imgLazyAttrs.forEach(attr => {
                    realSrc = img.getAttribute(lazyImgSrc[0]);
                    if (realSrc) {
                        removeProps.forEach(prop => {
                            img.removeAttribute(prop.trim());
                        });
                        img.src = realSrc;
                        return;
                    }
                })
                if (!realSrc) {
                    let lazyAttr = "";
                    if (img.getAttribute("_src") && !img.src) {
                        lazyAttr = "_src";
                        realSrc = img.getAttribute(lazyAttr);
                    } else {
                        for (let i in lazyImgAttr) {
                            lazyAttr = lazyImgAttr[i];
                            let attrValue = img.getAttribute(lazyAttr);
                            if (attrValue) {
                                realSrc = attrValue;
                                break;
                            }
                        }
                    }
                    if (!realSrc && img._lazyrias && img._lazyrias.srcset) {
                        realSrc = img._lazyrias.srcset[img._lazyrias.srcset.length - 1];
                        lazyAttr = "_lazyrias";
                    }
                    if (!realSrc && img.srcset) {
                        lazyAttr = "srcset";
                        var srcs = img.srcset.split(/[xw],/i), largeSize = 0;
                        srcs.forEach(srci => {
                            let srcInfo = srci.trim().split(" "), curSize = parseInt(srcInfo[1]);
                            if (srcInfo[1] && curSize > largeSize) {
                                largeSize = curSize;
                                realSrc = srcInfo[0];
                            }
                        });
                    }
                    if (realSrc) {
                        img.src = realSrc;
                        img.removeAttribute("srcset");
                        img.removeAttribute(lazyAttr);
                        if (img.classList && img.classList.contains && img.classList.contains("lazy")) {
                            img.classList.remove("lazy");
                        }
                        if (img.style.display == "none") {
                            img.style.display = "";
                        }
                        if (img.style.visibility == "hidden") {
                            img.style.visibility = "";
                        }
                        if (img.style.opacity == 0) {
                            img.style.opacity = "";
                        }
                    }
                }
            };
            if (lazyImgSrc) {
                if (!Array.isArray(lazyImgSrc)) {
                    lazyAttrs = lazyImgSrc.split(",");
                } else {
                    lazyAttrs = lazyImgSrc[0].split(",");
                    removeProps = lazyImgSrc[1].split(",");
                }
            }
            lazyAttrs.forEach(attr => {
                let attrArr = attr.split("|");
                if (attrArr.length !== 2) {
                    imgLazyAttrs.push(attr.trim());
                } else {
                    let selector = attrArr[0].trim();
                    let lazyAttr = attrArr[1].trim();
                    if (selector == "img") {
                        imgLazyAttrs.push(lazyAttr);
                    } else {
                        selector += "[" + lazyAttr + "]";
                        [].forEach.call(doc.querySelectorAll(selector), ele => {
                            ele.style.setProperty("background-image", "url(" + ele.getAttribute(lazyAttr) + ")", "important");
                            removeProps.forEach(prop => {
                                ele.removeAttribute(prop.trim());
                            });
                        });
                    }
                }
            });
            [].forEach.call(doc.querySelectorAll("img,picture>source"), img => {
                setLazyImg(img);
            });
        }

        initPage(callback) {
            let self = this;
            if (self.initing) return;
            self.initing = true;
            setTimeout(() => {
                self.initing = false;
            }, 100);
            curPage = 1;
            urlChanged = false;
            tryTimes = 0;
            this.clearAddedElements();
            this.insert = null;
            this.visibilityItems = [];
            this.visibleIndex = -1;
            this.pageDoc = document;
            this.nextLinkHref = null;
            this.curUrl = location.href;
            this.oldUrl = "";
            this.initUrl = location.href;
            this.historyUrl = "";
            this.possibleCheck = 0;
            let base = document.querySelector("base");
            this.basePath = base ? base.href : location.href;
            this.getRule(async () => {
                if (self.curSiteRule.sideController === true || (self.curSiteRule.sideController !== false && rulesData.sideController)) {
                    isPause = manualPause;
                }
                if (typeof(self.curSiteRule.rate) !== "undefined") {
                    rate = self.curSiteRule.rate;
                }
                if (self.curSiteRule.enable == 0) {
                    debug("Stop as rule disable");
                    isPause = true;
                    _GM_registerMenuCommand(i18n("enable"), () => {
                        showTips(i18n("enableSiteTips"));
                        if(!self.customRules) {
                            self.customRules = [];
                        }
                        for (let i in self.customRules) {
                            if (self.customRules[i].url == self.curSiteRule.url) {
                                self.customRules.splice(i, 1);
                                break;
                            }
                        }
                        self.curSiteRule.enable = 1;
                        self.customRules.unshift(self.curSiteRule);
                        storage.setItem("customRules", self.customRules);
                        location.reload();
                    });
                    return;
                }
                if (rulesData.sideControllerAlways) {
                    sideController.setup();
                }
                //若是再亂匹配就不緩存wedata，或者只在找完本地規則之後再考慮wedata的緩存
                if (self.curSiteRule.smart) {
                    delete self.curSiteRule.pageElement;
                    if (!self.possibleRule) {
                        self.smartRules = self.smartRules.filter(item => {return item && item.url != self.curSiteRule.url});
                        self.smartRules.unshift(self.curSiteRule);
                        if (self.smartRules.length > 100) {
                            self.smartRules.pop();
                        }
                        storage.setItem("smartRules", self.smartRules);
                    }
                } else if (self.curSiteRule && self.curSiteRule.url.length > 13) {
                    self.addToHpRules();
                }
                let css = self.curSiteRule.css || rulesData.customCss;
                if (css) {
                    let cssArr = css.split("inIframe:");
                    if (cssArr && cssArr.length) {
                        _GM_addStyle(cssArr[0]);
                    }
                }
                if (/sidesearch=(1|true)$/.test(self.curUrl)) {
                    openInNewTab = 0;
                } else if (typeof self.curSiteRule.openInNewTab !== 'undefined') {
                    openInNewTab = self.curSiteRule.openInNewTab ? 1 : 2;
                }
                let autoClick = self.curSiteRule.autoClick;
                if (autoClick) {
                    let autoClickBtn;
                    autoClickBtn = getElement(autoClick, document, null, true);
                    if (autoClickBtn) {
                        emuClick(autoClickBtn);
                    }
                }
                let code = self.curSiteRule.init;
                if (code) {
                    try {
                        await ((typeof code == 'function') ? code : new AsyncFunction('doc', 'win', 'iframe', 'click', 'enter', 'input', 'sleep', '"use strict";' + code))(null, null, null, async sel => {await clickAction(sel, document)}, async sel => {await enterAction(sel, document)}, async (sel, v) =>{await inputAction(sel, v, document)}, async time => {await sleep(time)});
                    } catch(e) {
                        debug(e);
                    }
                }
                await self.getNextLink(document, true);
                if (self.curSiteRule.pageNum && self.nextLinkHref && self.nextLinkHref != "#") {
                    let num1st = self.getPageNumFromUrl(location.href, 1);
                    let num2nd = self.getPageNumFromUrl(self.nextLinkHref, 1);
                    if (num2nd != num1st + 1) {
                        self.curSiteRule.pageNum = null;
                    }
                }
                if (self.curSiteRule.smart && self.nextLinkHref == false && self.possibleRule) {
                    let urlReg = new RegExp(self.possibleRule.url, "i");
                    function checkPossible () {
                        if (self.possibleCheck++ < 3) {
                            setTimeout(() => {
                                if (self.curSiteRule.smart) {
                                    var href = location.href.slice(0, 500);
                                    if (urlReg.test(href) && self.ruleMatch(self.possibleRule)) {
                                        self.initPage(() => {});
                                    } else checkPossible();
                                }
                            }, 3000);
                        }
                    }
                    checkPossible();
                }
                self.refreshByClick();
                if (emuIframe && emuIframe.parentNode) {
                    emuIframe.parentNode.removeChild(emuIframe);
                    emuIframe = null;
                }

                let pageElementCss = self.curSiteRule.pageElementCss || rulesData.pageElementCss;
                if (pageElementCss && pageElementCss !== '0') {
                    self.getPageElement(document, _unsafeWindow);
                }
                callback();
                let initRun = typeof self.curSiteRule.initRun == 'undefined' ? rulesData.initRun : self.curSiteRule.initRun;
                if (self.nextLinkHref) {
                    sideController.setup();
                    if (initRun && initRun != false) {
                        setTimeout(() => {
                            nextPage();
                        }, 300);
                    }
                }
            });
        }

        async hookUrlSetEle(ele, doc) {
            let self = this;
            return new Promise((resolve) => {
                let catchUrl = e => {
                    ele.dataset.url = self.catchedUrl;
                    ele.setAttribute('onclick', 'window.open(this.dataset.url)');
                    window.removeEventListener('pagetual_openUrl', catchUrl);
                    resolve();
                };
                window.addEventListener('pagetual_openUrl', catchUrl);
                emuClick(ele, doc);
            });
        }

        async hookUrl(doc) {
            let sel = this.curSiteRule.hookUrl;
            if (!sel) return;
            let self = this;
            if (!this.initHook) {
                this.initHook = true;
                Object.defineProperty(doc.defaultView, 'open', {
                    get: function () {
                        return (s) => {
                            self.catchedUrl = s;
                            var e = new CustomEvent('pagetual_openUrl');
                            window.dispatchEvent(e);
                        }
                    }
                });
            }
            let eles = getAllElements(sel, doc);
            for (let i = 0; i < eles.length; i++) {
                await sleep(1);
                let ele = eles[i];
                if (!ele.dataset.url) {
                    await this.hookUrlSetEle(ele, doc);
                }
            }
        }

        beginLoading() {
            isLoading = true;
            if (targetY >= 0) {
                window.scrollTo({ top: targetY, behavior: 'instant'});
                targetY = -1;
            }
            let lastScrollTop = getBody(document).scrollTop || document.documentElement.scrollTop;
            ruleParser.insertElement(loadingDiv);
            if (forceState == 2) {
                getBody(document).appendChild(loadingDiv);
            } else {
                let parent = loadingDiv.parentNode;
                if (compareNodeName(parent, ["tbody"])) {
                    parent = parent.parentNode;
                }
                if (compareNodeName(parent, ["table"])) {
                    parent.parentNode.appendChild(loadingDiv);
                }
            }
            getBody(document).scrollTop = lastScrollTop;
            document.documentElement.scrollTop = lastScrollTop;
        }

        insertElement(ele) {
            if (!this.insert || !this.insert.parentNode) {
                this.getInsert();
            }
            if (this.insert && this.insert.parentNode) {
                let self = this;
                if (ele.nodeName == "#document-fragment") {
                    [].forEach.call(ele.children, el => {
                        self.addedElePool.push(el);
                    });
                } else {
                    this.addedElePool.push(ele);
                }
                if (this.curSiteRule.insertPos == 2 || this.curSiteRule.insertPos == "in") {
                    this.insert.appendChild(ele);
                } else {
                    this.insert.parentNode.insertBefore(ele, this.insert);
                }
            }
        }

        noValidContent(url) {
            if (!this.curSiteRule.nextLinkByUrl) showTips(i18n("noValidContent"), url);
        }

        async insertPage(doc, eles, url, callback, tried) {
            this.oldUrl = this.curUrl;
            let oldTitle = document.title;
            try {
                let oldTitle = this.pageDoc.title;
            } catch (e) {}
            this.pageDoc = doc;
            this.curUrl = url;
            isLoading = true;
            let nextLink = await this.getNextLink(doc);
            this.nextTitle = "";
            if (this.curSiteRule.pageBarText) {
                if (this.curSiteRule.pageBarText == 1 || this.curSiteRule.pageBarText == true) {
                    this.nextTitle = doc.title;
                } else {
                    try {
                        this.nextTitle = ((typeof this.curSiteRule.pageBarText == 'function') ? this.curSiteRule.pageBarText : Function("doc",'"use strict";' + this.curSiteRule.pageBarText))(doc);
                    } catch(e) {
                        debug(e);
                    }
                }
            }
            if (curPage == 1 && !tried && !nextLink && this.curSiteRule.smart && this.curSiteRule.pageElement && this.curSiteRule.action != 0) {
                this.curSiteRule.action = 1;
                this.curUrl = location.href;
                isLoading = false;
                return false;
            }

            if (targetY >= 0) {
                window.scrollTo({ top: targetY, behavior: 'instant'});
                targetY = -1;
            }
            let lastScrollTop = getBody(document).scrollTop || document.documentElement.scrollTop;
            this.getInsert();
            await this.pageInit(doc, eles);
            var self = this, newEles = [];
            if (!eles || eles.length == 0 || !self.insert || !self.insert.parentNode) {
                if (callback) callback(eles);
                loadPageOver();
            } else {
                if (callback) callback(eles);
                loadPageOver();
                const collection = document.createDocumentFragment();
                [].forEach.call(eles, ele => {
                    let newEle = ele.cloneNode(true);
                    let oldCanvass = ele.querySelectorAll("canvas");
                    let newCanvass = newEle.querySelectorAll("canvas");
                    if (self.updateUrl) {
                        [].forEach.call(newEle.querySelectorAll("img"), img => {
                            if (img.getAttribute("src")) img.src = self.canonicalUri(img.getAttribute("src"));
                        });
                        [].forEach.call(newEle.querySelectorAll("a"), a => {
                            if (a.getAttribute("href")) a.href = self.canonicalUri(a.getAttribute("href"));
                        });
                    }
                    for (let i = 0; i < oldCanvass.length; i++) {
                        let oldCanvas = oldCanvass[i];
                        let newCanvas = newCanvass[i];
                        newCanvas.getContext('2d').drawImage(oldCanvas, 0, 0);
                    }
                    if (!compareNodeName(newEle, ["style", "script"])) self.visibilityItems.push(newEle);
                    collection.appendChild(newEle)
                    newEles.push(newEle);
                });
                self.insertElement(collection);
            }
            getBody(document).scrollTop = lastScrollTop;
            document.documentElement.scrollTop = lastScrollTop;
            this.pageAction(doc, newEles);
            let enableHistory = this.curSiteRule.history;
            let enableHistoryAfterInsert = false;
            if (enableHistory == 1) {
                enableHistory = true;
            } else if (enableHistory == 2) {
                enableHistory = true;
                enableHistoryAfterInsert = true;
            } else if (enableHistory == 0) {
                enableHistory = false;
            } else {
                enableHistory = rulesData.enableHistory;
                enableHistoryAfterInsert = rulesData.enableHistoryAfterInsert;
            }
            if (enableHistory) {
                this.historyUrl = enableHistoryAfterInsert ? this.curUrl : this.oldUrl;
                if(this.historyUrl != location.href) {
                    let isJs = this.hrefIsJs(this.historyUrl);
                    if (!isJs) {
                        let historyTitle = enableHistoryAfterInsert ? doc.title : oldTitle;
                        _unsafeWindow.history.replaceState(undefined, historyTitle, this.historyUrl);
                        document.title = historyTitle;
                    }
                }
            }
            isLoading = false;
            return true;
        }
    }
    var ruleParser = new RuleParser();

    class NextSwitch {
        //static nextSwitch;
        constructor() {
            this.inited = false;
        }

        /*static getInstance() {
            if (!NextSwitch.nextSwitch) {
                NextSwitch.nextSwitch = new NextSwitch();
            }
            return NextSwitch.nextSwitch;
        }*/

        init() {
            if (this.inited) return;
            this.inited = true;
            let self = this;
            this.cssText = `
             #pagetual-nextSwitch {
              position: fixed;
              top: 10px;
              left: calc(50% - 160px);
              background: aliceblue;
              padding: 10px;
              border-radius: 5px;
              text-align: center;
              opacity: 0.95;
              color: #161616;
              z-index: 2147483647;
              font-size: 16px;
              box-shadow: rgb(0 0 0) 0px 0px 10px;
             }
             #pagetual-nextSwitch>.title {
              margin: -5px 45px 10px 45px;
              font-size: 20px;
              font-weight: bold;
              border-bottom: 1px solid black;
              user-select: none;
              color: orangered;
             }
             #pagetual-nextSwitch>.group {
              display: flex;
              flex-direction: column;
             }
             #pagetual-nextSwitch>.group>span {
              color: #161616;
              cursor: pointer;
              margin: 3px;
              font-size: larger;
             }
             #pagetual-nextSwitch>.group>span:hover {
              color: red;
             }
             #pagetual-nextSwitch>.group>span.current {
              border: 2px dotted red;
              border-radius: 10px;
             }
             #pagetual-nextSwitch>.closeSwitch {
              position: absolute;
              top: 3px;
              right: 10px;
              background: none;
              border: none;
              vertical-align: top;
              transition: transform .15s ease-in-out;
              float: right;
              cursor: pointer;
             }
             #pagetual-nextSwitch svg {
              width: 30px;
              height: 30px;
              vertical-align: middle;
              fill: #161616;
              overflow: hidden;
             }
             #pagetual-nextSwitch button:hover {
              transform: scale(1.2);
             }
            `;
            let frame = document.createElement("div");
            frame.id = "pagetual-nextSwitch";
            frame.innerHTML = createHTML(`
                <div class="title">${i18n("nextSwitch")}</div>
                <button type="button" class="closeSwitch">
                  <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2754">
                    <path d="M512 128c212 0 384 172 384 384s-172 384-384 384-384-172-384-384 172-384 384-384m0-64C264.8 64 64 264.8 64 512s200.8 448 448 448 448-200.8 448-448S759.2 64 512 64z m238.4 254.4l-45.6-45.6L512 467.2 318.4 273.6l-45.6 45.6L467.2 512 273.6 705.6l45.6 45.6L512 557.6l193.6 193.6 45.6-45.6L557.6 512l192.8-193.6z" p-id="2755">
                    </path>
                  </svg>
                </button>
                <div class="group"></div>
            `);
            let group = frame.querySelector(".group");
            let closeBtn = frame.querySelector(".closeSwitch");
            closeBtn.addEventListener("click", e => {
                self.close();
            }, true);
            this.frame = frame;
            let currentSpan;
            ruleParser.curSiteRule.nextLink.forEach((link, i) => {
                let span = document.createElement("span");
                let target = getElement(link, document);
                let index = "<b>" + (i + 1) + "</b>: ";
                if (target) {
                    let targetInner = target.innerText.trim();
                    span.innerHTML = index + (targetInner || link);
                } else {
                    span.innerHTML = index + "Not Found";
                }
                span.title = link;
                span.addEventListener("click", e => {
                    if (currentSpan) currentSpan.classList.remove("current");
                    span.classList.add("current");
                    currentSpan = span;
                    nextIndex = i;
                    setListData("nextSwitch", location.host, nextIndex === 0 ? "" : nextIndex);
                    ruleParser.curUrl += "#pagetual";
                    ruleParser.oldUrl = ruleParser.curUrl;
                    autoLoadNum = -1;
                    if (!ruleParser.nextLinkHref) {
                        isLoading = false;
                    }
                    ruleParser.getNextLink(ruleParser.pageDoc || document);
                    self.close();
                }, true);
                if (i == nextIndex) {
                    span.classList.add("current");
                    currentSpan = span;
                }
                group.appendChild(span);
            });
        }

        start() {
            this.init();
            if (!this.styleEle || !this.styleEle.parentNode) {
                this.styleEle = _GM_addStyle(this.cssText);
            }
            document.documentElement.appendChild(this.frame);
        }

        close() {
            if (this.frame.parentNode) this.frame.parentNode.removeChild(this.frame);
        }
    }
    const nextSwitch = new NextSwitch();

    class Picker {
        //static picker;
        constructor() {
            this.inited = false;
        }

        /*static getInstance() {
            if (!Picker.picker) {
                Picker.picker = new Picker();
            }
            return Picker.picker;
        }*/

        init() {
            if (this.inited) return;
            this.inited = true;
            let self = this;
            this.signList = [];
            this.cssText = `
             body.pagetual-picker,
             body.pagetual-picker *:hover,
             body.pagetual-picker a:hover {
              cursor: crosshair !important;
             }
             #pagetual-picker {
              position: fixed;
              top: 10px;
              left: calc(50% - 178px);
              background: aliceblue;
              padding: 10px;
              border-radius: 5px;
              text-align: center;
              opacity: 0.95;
              color: #161616;
              z-index: 2147483646;
              font-size: 16px;
              overflow: hidden;
              box-shadow: rgb(0 0 0) 0px 0px 10px;
             }
             #pagetual-picker * {
              margin: 0;
              padding: 0;
              font-family: Times New Roman;
              overflow: initial;
              user-select: none;
              line-height: unset;
              min-width: unset;
              min-height: unset;
             }
             #pagetual-picker>.title {
              margin: -5px 45px 10px 45px;
              font-size: 20px;
              font-weight: bold;
              cursor: pointer;
              border-bottom: 1px solid black;
              user-select: none;
              color: orangered;
              height: initial;
              width: initial;
              position: initial;
              transition: transform .3s ease;
             }
             #pagetual-picker>.title:hover {
              transform: scale(1.1);
             }
             #pagetual-picker button {
              background: none;
              border: none;
              vertical-align: top;
              transition: transform .15s ease-in-out;
              float: right;
              cursor: pointer;
              overflow: hidden;
              background-color: unset!important;
             }
             #pagetual-picker button:hover {
              transform: scale(1.2);
             }
             #pagetual-picker>.closePicker {
              position: absolute;
              top: 3px;
              right: 10px;
             }
             #pagetual-picker>.logoIcon {
              position: absolute;
              top: 3px;
              left: 10px;
             }
             #pagetual-picker>.logoIcon.showSign>svg>path {
              fill: gray!important;
             }
             #pagetual-picker textarea{
              display: inline-block;
              width: calc(100% - 65px);
              height: 20px;
              min-width: 250px;
              max-width: calc(65vw - 50px);
              min-height: unset;
              max-height: unset;
              padding: 6px 12px;
              font-size: 16px;
              font-weight: 400;
              line-height: 1.5;
              color: #495057;
              background-color: #fff;
              background-clip: padding-box;
              border: 1px solid #ced4da;
              border-radius: 4px;
              transition: border-color .15s ease-in-out,box-shadow .15s ease-in-out;
              box-sizing: content-box;
              margin-right: 5px;
              resize: both;
              box-shadow: 0 1px 5px 1px #ddd;
              overflow-wrap: anywhere;
             }
             #pagetual-picker textarea:focus {
              color: black;
              background-color: #fff;
              border-color: #80bdff;
              outline: 0;
              box-shadow: 0 0 0 3.2px rgb(0 123 255 / 25%);
             }
             #pagetual-picker [type=checkbox],
             #pagetual-picker [type=radio] {
              line-height: 20px;
              height: 25px;
              width: 25px;
              margin-left: 5px;
              vertical-align: middle;
              appearance: auto;
              display: inline-block;
              position: initial;
             }
             #pagetual-picker [type=checkbox]:after,
             #pagetual-picker [type=radio]:after,
             #pagetual-picker [type=checkbox]:before,
             #pagetual-picker [type=radio]:before {
              border: none;
              background: none;
             }
             #pagetual-picker label {
              font-size: 18px;
              line-height: 25px;
              vertical-align: middle;
              display: inline-block;
              color: black;
              position: initial;
              cursor: pointer;
             }
             #pagetual-picker .bottom {
              text-align: left;
              margin: 10px 0;
              width: 100%;
             }
             #pagetual-picker .bottom>button {
              float: right;
             }
             #pagetual-picker svg {
              width: 30px;
              height: 30px;
              vertical-align: middle;
              fill: #161616;
              overflow: hidden;
             }
             #pagetual-picker svg * {
              pointer-events: none;
             }
             #pagetual-picker .allpath {
              font-size: 18px;
              margin: 10px auto;
              max-width: 330px;
              word-break: break-all;
              cursor: context-menu;
              overflow: hidden;
              max-height: 42px;
              -moz-transition:max-height 1s ease-in;
              -webkit-transition:max-height 1s ease-in;
              transition:max-height 1s ease-in;
              color: black;
             }
             #pagetual-picker .allpath:hover {
              max-height: calc(100vh - 130px);
              overflow: auto;
             }
             #pagetual-picker .allpath>span.path {
              cursor: pointer;
             }
             #pagetual-picker .allpath>span.path:hover {
              opacity: 0.6;
             }
             #pagetual-picker .allpath>span.path:hover,
             #pagetual-picker .allpath>span.path.checked {
              color: orangered;
             }
             #pagetual-picker .moreConfig {
              display: flex;
              justify-content: space-between;
              border-top: 1px solid;
              padding-top: 10px;
              width: 100%;
             }
             #pagetual-picker .command {
              width: 100%;
              color: black!important;
              text-align: center;
              font-size: large;
              margin-top: 10px;
              box-shadow: 0 1px 6px 0 rgba(0, 0, 0, 0.12);
              border-radius: 5px;
             }
             #pagetual-picker .command:hover {
              color: orangered;
             }
             #pagetual-picker #showDetail {
              float: initial;
              margin-top: 10px;
             }
             #pagetual-picker.showDetail #showDetail {
              float: right;
             }
             #pagetual-picker #showDetail>svg {
              -moz-transition:transform 0.3s ease;
              -webkit-transition:transform 0.3s ease;
              transition:transform 0.3 ease;
             }
             #pagetual-picker.showDetail #showDetail>svg {
              transform: rotate(180deg);
             }
             #pagetual-picker .tempRule {
              display: none;
              margin-top: 10px;
              height: 300px;
              min-height: 150px;
             }
             #pagetual-picker.showDetail .tempRule {
              display: inline-block;
             }
             #pagetual-picker #saveDetail {
              display: none;
              position: absolute;
              bottom: 10px;
              right: 8px;
             }
             #pagetual-picker.showDetail #saveDetail {
              display: inline-block;
             }
             #pagetual-picker #saveDetail svg {
              width: 35px;
              height: 35px;
             }
             #pagetual-picker .addProp {
              display: none;
              flex-direction: column;
              position: absolute;
              bottom: 45px;
              right: 12px;
             }
             #pagetual-picker.showDetail .addProp {
              display: flex;
             }
             #pagetual-picker .addProp>button {
              font-size: 30px;
              font-family: Arial,sans-serif;
              line-height: 35px;
              color: #161616;
             }
             #pagetual-picker #edit{
              -webkit-animation: jumpAnimation .6s 5;
              animation: jumpAnimation .6s 5;
             }
             @keyframes jumpAnimation {
              0% {
                transform: scale(1) translateY(0);
                animation-timing-function: ease-out;
              }
              50% {
                transform: scale(1.2) translateY(-5px);
                animation-timing-function: ease-in;
              }
              100% {
                transform: scale(1) translateY(0);
                animation-timing-function: ease-out;
              }
             }
             @-webkit-keyframes jumpAnimation {
              0% {
                -webkit-transform: scale(1) translateY(0);
                animation-timing-function: ease-out;
              }
              50% {
                -webkit-transform: scale(1.2) translateY(-5px);
                animation-timing-function: ease-in;
              }
              100% {
                -webkit-transform: scale(1) translateY(0);
                animation-timing-function: ease-out;
              }
             }
            `;
            this.mainSignDiv = this.createSignDiv();
            this.allSignDiv = [];
            let frame = document.createElement("div");
            frame.id = "pagetual-picker";
            frame.innerHTML = createHTML(`
                <button title="Pagetual" type="button" class="logoIcon">
                  <svg width="30" height="30" class="upSvg pagetual" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M296 440c-44.1 0-80 35.9-80 80s35.9 80 80 80 80-35.9 80-80-35.9-80-80-80z" style="fill: #604b4a;" fill="#604b4a"></path><path d="M960 512c0-247-201-448-448-448S64 265 64 512c0 1.8 0.1 3.5 0.1 5.3 0 0.9-0.1 1.8-0.1 2.7h0.2C68.5 763.3 267.7 960 512 960c236.2 0 430.1-183.7 446.7-415.7 0.1-0.8 0.1-1.6 0.2-2.3 0.4-4.6 0.5-9.3 0.7-13.9 0.1-2.7 0.4-5.3 0.4-8h-0.2c0-2.8 0.2-5.4 0.2-8.1z m-152 8c0 44.1-35.9 80-80 80s-80-35.9-80-80 35.9-80 80-80 80 35.9 80 80zM512 928C284.4 928 99 744.3 96.1 517.3 97.6 408.3 186.6 320 296 320c110.3 0 200 89.7 200 200 0 127.9 104.1 232 232 232 62.9 0 119.9-25.2 161.7-66-66 142.7-210.4 242-377.7 242z" style="fill: #604b4a;" fill="#604b4a"></path></svg>
                </button>
                <div class="title" title="${i18n("configure")}">${i18n("picker")}</div>
                <button title="${i18n("closePicker")}" type="button" class="closePicker">
                  <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M512 128c212 0 384 172 384 384s-172 384-384 384-384-172-384-384 172-384 384-384m0-64C264.8 64 64 264.8 64 512s200.8 448 448 448 448-200.8 448-448S759.2 64 512 64z m238.4 254.4l-45.6-45.6L512 467.2 318.4 273.6l-45.6 45.6L467.2 512 273.6 705.6l45.6 45.6L512 557.6l193.6 193.6 45.6-45.6L557.6 512l192.8-193.6z" style="fill: #604b4a;" fill="#604b4a"></path></svg>
                </button>
                <div class="allpath" title="${i18n("switchSelector")}"></div>
                <div>
                  <textarea class="selector" spellcheck="false" name="selector" placeholder="${i18n("pickerPlaceholder")}"></textarea>
                  <button id="check" title="${i18n("pickerCheck")}" type="button">
                    <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M512 128a384 384 0 1 0 0 768 384 384 0 0 0 0-768z m0-85.333333c259.2 0 469.333333 210.133333 469.333333 469.333333s-210.133333 469.333333-469.333333 469.333333S42.666667 771.2 42.666667 512 252.8 42.666667 512 42.666667zM696.149333 298.666667L768 349.866667 471.594667 725.333333 256 571.733333l53.888-68.266666 143.744 102.4z" style="fill: #604b4a;" fill="#604b4a"></path></svg>
                  </button>
                </div>
                <div class="bottom">
                  <input name="xpath" id="checkbox_id" type="checkbox" />
                  <label for="checkbox_id">XPath</label>
                  <button id="edit" title="${i18n("gotoEdit")}" type="button">
                    <svg viewBox="0 0 1024 1024" style="color: orangered;fill: orangered;" version="1.1" xmlns="http://www.w3.org/2000/svg">
                      <path d="M775.84 392.768l-155.2-172.352L160.768 643.264l-38.368 187.936 190.56-12.832zM929.952 229.952l-131.2-150.944-0.288-0.32a16 16 0 0 0-22.592-0.96l-131.168 120.576 155.168 172.352 128.832-118.464a15.936 15.936 0 0 0 1.248-22.24zM96 896h832v64H96z">
                      </path>
                    </svg>
                  </button>
                </div>
                <div class="moreConfig">
                  <div title="${i18n('forceStateIframe')}">
                    <input name="forceState" id="forceStateIframe" type="radio" />
                    <label for="forceStateIframe">${i18n('iframe')}</label>
                  </div>
                  <div title="${i18n('forceStateDynamic')}">
                    <input name="forceState" id="forceStateDynamic" type="radio" />
                    <label for="forceStateDynamic">${i18n('dynamic')}</label>
                  </div>
                  <div title="${i18n('forceStateDisable')}">
                    <input name="forceState" id="forceStateDisable" type="radio" />
                    <label for="forceStateDisable">${i18n('disable')}</label>
                  </div>
                </div>
                <button id="nextSwitch" class="command" title="${i18n("nextSwitch")}" type="button">${i18n("nextSwitch")}</button>
                <button id="loadNow" class="command" title="${i18n("loadNow")}" type="button">${i18n("loadNow")}</button>
                <button id="autoScroll" class="command" title="${i18n("toggleAutoScroll")}" type="button"></button>
                <div>
                  <textarea class="tempRule" spellcheck="false" placeholder="{Rule object}" title="Rule for current site"></textarea>
                  <button id="showDetail" title="" type="button">
                    <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M511.1 63.7c-247.4 0-448 200.6-448 448s200.6 448 448 448 448-200.6 448-448-200.6-448-448-448z m281.2 374.5L535.6 694.9c-12.5 12.5-32.8 12.5-45.3 0l-255.8-256c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l210.7 210.7c12.5 12.5 32.8 12.5 45.3 0l211.4-211.4c12.5-12.5 32.8-12.5 45.3 0 12.3 12.5 12.3 32.8-0.2 45.3z" style="fill: orangered;" fill="orangered"></path></svg>
                  </button>
                  <div class="addProp">
                    <button id="addOtherProp" title="${i18n("addOtherProp")}" type="button">+</button>
                    <button id="addNextSelector" title="${i18n("addNextSelector")}" type="button">></button>
                    <button id="addPageSelector" title="${i18n("addPageSelector")}" type="button">❏</button>
                  </div>
                  <button id="saveDetail" title="${i18n("save")}" type="button">
                    <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M704 128H192c-35.2 0-64 28.8-64 64v640c0 35.2 28.8 64 64 64h640c35.2 0 64-28.8 64-64V320L704 128zM256 256h320v128H256V256z m256 512c-70.4 0-128-57.6-128-128s57.6-128 128-128 128 57.6 128 128-57.6 128-128 128z" style="fill: orangered;" fill="orangered"></path></svg>
                  </button>
                </div>
            `);
            let forceStateIframe = frame.querySelector("#forceStateIframe");//forceState 1 禁用 2 强嵌 3 动态
            let forceStateDynamic = frame.querySelector("#forceStateDynamic");
            let forceStateDisable = frame.querySelector("#forceStateDisable");
            let clickRadio = e => {
                let radio = e.currentTarget.querySelector('input');
                if (radio.checked) {
                    forceState = "";
                } else {
                    switch (radio.id) {
                        case "forceStateIframe":
                            forceState = 2;
                            break;
                        case "forceStateDynamic":
                            forceState = 3;
                            break;
                        case "forceStateDisable":
                            forceState = 1;
                            break;
                        default:
                            return;
                    }
                }
                setListData("forceState", location.host, forceState);
                self.close();
                setTimeout(() => {
                    location.reload();
                }, 500);
            };
            forceStateIframe.parentNode.addEventListener("mousedown", clickRadio);
            forceStateDynamic.parentNode.addEventListener("mousedown", clickRadio);
            forceStateDisable.parentNode.addEventListener("mousedown", clickRadio);
            if (forceState == 1) forceStateDisable.checked = true;
            else if (forceState == 2) forceStateIframe.checked = true;
            else if (forceState == 3) forceStateDynamic.checked = true;
            let closeBtn = frame.querySelector(".closePicker");
            let logoBtn = frame.querySelector(".logoIcon");
            let title = frame.querySelector(".title");
            let allpath = frame.querySelector(".allpath");
            let selectorInput = frame.querySelector(".selector");
            let xpath = frame.querySelector("#checkbox_id");
            let checkBtn = frame.querySelector("#check");
            let editBtn = frame.querySelector("#edit");
            let nextSwitchBtn = frame.querySelector("#nextSwitch");
            let autoScrollBtn = frame.querySelector("#autoScroll");
            let loadNow = frame.querySelector("#loadNow");
            let tempRule = frame.querySelector(".tempRule");
            let showDetailBtn = frame.querySelector("#showDetail");
            let saveDetailBtn = frame.querySelector("#saveDetail");
            let addOtherProp = frame.querySelector("#addOtherProp");
            let addNextSelector = frame.querySelector("#addNextSelector");
            let addPageSelector = frame.querySelector("#addPageSelector");
            autoScrollBtn.addEventListener("click", e => {
                self.close();
                autoScroll = (autoScroll ? 0 : prompt(i18n("autoScrollRate"), autoScrollRate)) || 0;
                autoScroll = parseInt(autoScroll) || 0;
                if (autoScroll < 0) autoScroll = 0;
                if (autoScroll && autoScroll != autoScrollRate) {
                    autoScrollRate = autoScroll;
                    storage.setItem("autoScrollRate", autoScrollRate);
                }
                setListData("autoScroll", location.host + location.pathname, autoScroll);
                startAutoScroll();
            }, true);
            addOtherProp.addEventListener("click", e => {
                let propName = prompt(i18n("propName"), "author");
                if (!propName) return;
                let propValue = prompt(i18n("propValue"));
                if (!propValue) return;
                if (propValue === "true") propValue = true;
                else if (propValue === "false") propValue = false;
                else if (/^\d+$/.test(propValue)) propValue = parseInt(propValue);
                if (propName === "author" && propValue) {
                    author = propValue;
                    storage.setItem("author", propValue);
                }
                let editTemp = self.getTempRule();
                if (!editTemp) return;
                editTemp[propName] = propValue;
                self.tempRule.value = JSON.stringify(editTemp, null, 4);
            }, true);
            addNextSelector.addEventListener("click", e => {
                let editTemp = self.getTempRule();
                if (!editTemp) return;
                let selector = self.selectorInput.value;
                if (selector) {
                    editTemp.nextLink = selector;
                }
                self.tempRule.value = JSON.stringify(editTemp, null, 4);
            }, true);
            addPageSelector.addEventListener("click", e => {
                let editTemp = self.getTempRule();
                if (!editTemp) return;
                let selector = self.selectorInput.value;
                if (selector) {
                    editTemp.pageElement = selector;
                }
                self.tempRule.value = JSON.stringify(editTemp, null, 4);
            }, true);
            showDetailBtn.addEventListener("click", e => {
                frame.classList.toggle("showDetail");
            }, true);
            saveDetailBtn.addEventListener("click", e => {
                let editTemp = self.getTempRule(true);
                if (tempRule.value && !editTemp) {
                    return;
                }
                if(!ruleParser.customRules) {
                    ruleParser.customRules = [];
                }
                ruleParser.customRules = ruleParser.customRules.filter(item => {return item.url != editTemp.url || item.name != editTemp.name});
                if (tempRule.value) {
                    ruleParser.customRules.unshift(editTemp);
                    ruleParser.curSiteRule = editTemp;
                } else {
                    ruleParser.curSiteRule = {};
                    isPause = true;
                }
                storage.setItem("customRules", ruleParser.customRules);
                if (ruleParser.hpRules && ruleParser.curSiteRule && !ruleParser.curSiteRule.smart) {
                    ruleParser.addToHpRules(true);
                }
                if (window.confirm(i18n("reloadPage"))) {
                    setTimeout(() => {location.reload()}, 100);
                }
            }, true);
            nextSwitchBtn.addEventListener("click", e => {
                self.close();
                nextSwitch.start();
            }, true);
            loadNow.addEventListener("click", e => {
                self.close();
                let loadNum = window.prompt(i18n("loadConfirm"), "1");
                if (loadNum === "" || loadNum === null) return;
                autoLoadNum = Math.abs(parseInt(loadNum));
                nextPage();
            }, true);
            closeBtn.addEventListener("click", e => {
                self.close();
            }, true);
            this.showSign = true;
            logoBtn.addEventListener("click", e => {
                logoBtn.classList.toggle("showSign");
                self.showSign = !self.showSign;
                getBody(document).classList.toggle("pagetual-picker");
            }, true);
            let moving = false;
            let initX = 0, initY = 0, initPos = {x: 0, y: 0};
            let moveHanlder = e => {
                if (moving) {
                    frame.style.left = e.clientX - initX + "px";
                    frame.style.top = e.clientY - initY + "px";
                    e.stopPropagation();
                    e.preventDefault();
                } else if(Math.abs(e.clientX - initPos.x) + Math.abs(e.clientY - initPos.y) > 20) {
                    moving = true;
                }
            };
            let upHanlder = e => {
                if (moving) {
                    moving = false;
                } else {
                    _GM_openInTab(rulesData.configPage || configPage[0], {active: true});
                }
                document.removeEventListener("mousemove", moveHanlder, true);
                title.removeEventListener("mouseup", upHanlder, true);
                e.stopPropagation();
                e.preventDefault();
            };
            title.addEventListener("mousedown", e => {
                initPos = {x: e.clientX, y: e.clientY};
                initX = e.clientX - parseInt(getComputedStyle(frame).left);
                initY = e.clientY - parseInt(getComputedStyle(frame).top);
                document.addEventListener("mousemove", moveHanlder, true);
                title.addEventListener("mouseup", upHanlder, true);
            });
            frame.addEventListener("mouseenter", e => {
                if (!self.showSign || moving) return;
                if (self.mainSignDiv.parentNode) self.mainSignDiv.parentNode.removeChild(self.mainSignDiv);
                self.checkInputSelector();
            });
            frame.addEventListener("mouseleave", e => {
                if (!self.showSign) {
                    if (self.mainSignDiv.parentNode) self.mainSignDiv.parentNode.removeChild(self.mainSignDiv);
                    self.clearSigns();
                    return;
                }
                if (moving) return;
                getBody(document).appendChild(self.mainSignDiv);
                self.clearSigns();
            });
            checkBtn.addEventListener("click", e => {
                self.checkInputSelector();
                if (this.selectorInput.value) _GM_setClipboard(this.selectorInput.value);
                showTips(i18n("copied"));
            });
            xpath.addEventListener("click", e => {
                if (!selectorInput.value) {
                    self.setSelectorDiv("");
                    return;
                }
                let element = getElement(selectorInput.value, document);
                let selector = self.getSelectorFromEle(element);
                self.setSelectorDiv(selector);
                selectorInput.value = selector;
            });
            editBtn.addEventListener("click", e => {
                rulesData.editTemp = self.getTempRule();
                storage.setItem("rulesData", rulesData);
                _GM_openInTab(rulesData.configPage || configPage[0], {active: true});
            });
            editBtn.oncontextmenu = e => {
                e.preventDefault();
                _GM_openInTab(rulesData.configPage || configPage[0], {active: true});
            };
            this.frame = frame;
            this.xpath = xpath;
            this.allpath = allpath;
            this.selectorInput = selectorInput;
            this.nextSwitchBtn = nextSwitchBtn;
            this.autoScrollBtn = autoScrollBtn;
            this.loadNow = loadNow;
            this.tempRule = tempRule;
            this.logoBtn = logoBtn;
            let setTitleTimer;
            this.moveHandler = e => {
                if (!self.showSign || e.target === document) return;
                let target = self.getTarget(e.target);
                self.adjustSignDiv(self.mainSignDiv, target);
                clearTimeout(setTitleTimer);
                setTitleTimer = setTimeout(() => {
                    if (self.inPicker && target.hasAttributes()) {
                        let title = target.nodeName.toLowerCase() + "\n";
                        for (const attr of target.attributes) {
                            title += `【${attr.name}】${attr.value ? " ➡️ " + attr.value : ""}\n`;
                        }
                        getBody(document).title = title;
                    }
                }, 100);
            };
            this.clickHandler = e => {
                if (!self.showSign) return;
                if (self.inPicker) {
                    e.stopPropagation();
                    e.preventDefault();
                }
                let target = self.getTarget(e.target);
                let selector = self.getSelectorFromEle(target);
                selectorInput.value = selector;
                self.setSelectorDiv(selector);
            };
        }

        getTempRule(detail) {
            if (this.tempRule.value) {
                try {
                    this.editTemp = JSON.parse(this.tempRule.value);
                } catch (e) {
                    this.editTemp = null;
                    if (detail) {
                        let pos = e && e.message && e.message.match(/position (\d+)/);
                        if (pos) {
                            pos = parseInt(pos[1]);
                            this.tempRule.value = this.tempRule.value.slice(0, pos) + "➡️" + this.tempRule.value.slice(pos);
                        }
                        showTips(i18n("errorJson"));
                        return null;
                    }
                }
            }
            if (!this.editTemp) {
                if (ruleParser.curSiteRule.url && !ruleParser.curSiteRule.smart) {
                    this.editTemp = ruleParser.curSiteRule;
                } else {
                    this.editTemp = {
                        name: document.title,
                        url: "^" + (location.origin + location.pathname).replace(/[^\/]*$/, "").replace(/^https?/, "https?").replace(/\./g, "\\."),
                        example: location.href
                    };
                    if (author) this.editTemp.author = author;
                }
                delete this.editTemp.from;
                delete this.editTemp.type;
                delete this.editTemp.updatedAt;
            }
            if (this.selectorInput.value && !this.frame.classList.contains("showDetail")) {
                this.editTemp.pageElement = this.selectorInput.value;
            }
            return this.editTemp;
        }

        getTarget(ele) {
            while (ele.parentNode && (ele.offsetWidth === 0 || ele.offsetHeight === 0)) {
                ele = ele.parentNode;
            }
            return ele;
        }

        close() {
            this.clearSigns();
            if (this.frame.parentNode) this.frame.parentNode.removeChild(this.frame);
            if (this.mainSignDiv.parentNode) this.mainSignDiv.parentNode.removeChild(this.mainSignDiv);
            getBody(document).classList.remove("pagetual-picker");
            getBody(document).removeEventListener("mousemove", this.moveHandler, true);
            getBody(document).removeEventListener("click", this.clickHandler, true);
            getBody(document).title = "";
            this.inPicker = false;
        }

        setImportant(ele, prop, value) {
            ele.style.setProperty(prop, value, "important");
        }

        createSignDiv() {
            let signDiv = document.createElement("div");
            this.setImportant(signDiv, "position", "absolute");
            this.setImportant(signDiv, "pointer-events", "none");
            this.setImportant(signDiv, "z-index", "2147483646");
            this.setImportant(signDiv, "background", "rgba(120, 170, 210, 0.6)");
            this.setImportant(signDiv, "transition", "all 0.15s ease-out");
            this.setImportant(signDiv, "box-shadow", "rgb(0 0 0) 0px 0px 3px 0px");
            return signDiv;
        }

        adjustSignDiv(div, target) {
            let rect = target.getBoundingClientRect();
            this.setImportant(div, "width", rect.width + "px");
            this.setImportant(div, "height", rect.height + "px");
            this.setImportant(div, "left", rect.left + window.scrollX + "px");
            this.setImportant(div, "top", rect.top + window.scrollY + "px");
        }

        getSelectorFromEle(ele) {
            return this.xpath.checked ? createXPathFromElement(ele) : geneSelector(ele, true);
        }

        fillTempRuleTextarea() {
            if (!this.frame.classList.contains("showDetail")) this.tempRule.value = JSON.stringify(this.getTempRule(), null, 4);
        }

        setSelectorDiv(selector) {
            this.fillTempRuleTextarea();
            let self = this;
            this.allpath.innerHTML = createHTML("");
            if (!selector) return;
            if (this.xpath.checked) {
                let span = document.createElement("span");
                span.innerText = selector;
                span.addEventListener("click", e => {
                    self.selectorInput.value = selector;
                    self.checkInputSelector();
                }, true);
                this.allpath.appendChild(span);
            } else {
                selector.split(">").forEach((item, index) => self.geneSelectorItem(item, index));
            }
        }

        geneSelectorItem(item, index) {
            let self = this;
            item = item.trim();
            if (!item) return;
            if (index !== 0) {
                let span = document.createElement("span");
                span.innerText = " > ";
                this.allpath.appendChild(span);
            }
            let span = document.createElement("span");
            span.className = "path";
            span.innerText = item;
            span.addEventListener("click", e => {
                let selector = "";
                let target = e.target;
                while (target) {
                    selector = target.innerText + selector;
                    target = target.previousElementSibling;
                }
                self.selectorInput.value = selector;
                self.checkInputSelector();
                if (self.checkedPath) {
                    self.checkedPath.classList.remove("checked");
                }
                span.classList.add("checked");
                self.checkedPath = span;
            }, true);
            this.allpath.appendChild(span);
        }

        checkInputSelector() {
            let self = this;
            this.clearSigns();
            if (!this.selectorInput.value) return;
            let eles = getAllElements(this.selectorInput.value, document);
            if (eles && eles.length > 0) {
                eles.forEach(ele => {
                    let sign = self.createSignDiv();
                    getBody(document).appendChild(sign);
                    self.adjustSignDiv(sign, ele);
                    self.signList.push(sign);
                });
                this.fillTempRuleTextarea();
            }
        }

        clearSigns() {
            this.signList.forEach(sign => {
                if (sign.parentNode) sign.parentNode.removeChild(sign);
            });
            this.signList = [];
        }

        start() {
            this.init();
            if (this.inPicker) return;
            this.inPicker = true;
            if (!this.styleEle || !this.styleEle.parentNode) {
                this.styleEle = _GM_addStyle(this.cssText);
            }
            document.documentElement.appendChild(this.frame);
            getBody(document).appendChild(this.mainSignDiv);
            getBody(document).classList.add("pagetual-picker");

            this.logoBtn.classList.remove("showSign");
            this.showSign = true;

            getBody(document).addEventListener("mousemove", this.moveHandler, true);
            getBody(document).addEventListener("click", this.clickHandler, true);
            this.xpath.checked = isXPath(ruleParser.curSiteRule.pageElement);
            this.tempRule.value = "";
            this.editTemp = null;
            this.frame.classList.remove("showDetail");

            this.loadNow.style.display = ruleParser.nextLinkHref ? "block" : "none";
            if (ruleParser.curSiteRule.nextLink && Array && Array.isArray && Array.isArray(ruleParser.curSiteRule.nextLink)) {
                this.nextSwitchBtn.style.display = "block";
            } else {
                this.nextSwitchBtn.style.display = "none";
            }
            this.autoScrollBtn.innerText = i18n(autoScroll ? "disableAutoScroll" : "enableAutoScroll");

            let pageElementSel = ruleParser.curSiteRule.pageElement || "";
            if (Array && Array.isArray && Array.isArray(pageElementSel)) {
                pageElementSel = pageElementSel[nextIndex < pageElementSel.length ? nextIndex : 0];
            }
            this.setSelectorDiv(pageElementSel);
        }
    }
    const picker = new Picker();

    var editor, editorChanged = false, customRulesInput;

    function startAutoScroll() {
        clearInterval(autoScrollInterval);
        if (autoScroll <= 0) return;
        let scrollRange = 1;
        if (autoScroll > 1000) {
            scrollRange = parseInt(autoScroll / 1000)
        }
        autoScrollInterval = setInterval(() => {
            if (isPause) return;
            window.scroll(window.scrollX, window.scrollY + scrollRange);
        }, parseInt(1000 / autoScroll));
    }

    function getElementTop(ele) {
        if (!ele) return 0;
        if (ele.getBoundingClientRect) {
            return ele.getBoundingClientRect().top + document.documentElement.scrollTop;
        }
        var actualTop = ele.offsetTop;
        var current = ele.offsetParent;
        while (current) {
            actualTop += current.offsetTop;
            current = current.offsetParent;
        }
        return actualTop;
    }

    function getElementLeft(ele) {
        if (!ele) return 0;
        if (ele.getBoundingClientRect) {
            return ele.getBoundingClientRect().left + document.documentElement.scrollLeft;
        }
        var actualLeft = ele.offsetLeft;
        var current = ele.offsetParent;
        while (current) {
            actualLeft += current.offsetLeft;
            current = current.offsetParent;
        }
        return actualLeft;
    }

    function getElementBottom(ele) {
        return getElementTop(ele) + (ele.offsetHeight || ele.scrollHeight);
    }

    let pageReady = false;
    function initRules(callback) {
        charset = (document.characterSet || document.charset || document.inputEncoding);
        let equiv = document.querySelector('[http-equiv="Content-Type"]');
        if (equiv && equiv.content) {
            let innerCharSet = equiv.content.match(/charset\=([^;]+)/);
            if (!innerCharSet) {
                charsetValid = false;
            } else if (innerCharSet[1].replace("-", "").toLowerCase() != charset.replace("-", "").toLowerCase()) {
                charsetValid = false;
            }
        } else charsetValid = false;
        storage.getItem("rulesData", data => {
            /*0 wedata格式，1 pagetual格式*/
            ruleUrls = [{
                id: 1,
                url: data && data.wedata2github ? 'https://hoothin.github.io/UserScripts/Pagetual/items_all.json' : 'http://wedata.net/databases/AutoPagerize/items_all.json',
                type: 0,
            }];
            if (data) {
                rulesData = data;
                if (data.urls) ruleUrls = ruleUrls.concat(data.urls);
                if (data.sort) {
                    let urls = [];
                    data.sort.forEach(id => {
                        for (let s = 0; s < ruleUrls.length; s++) {
                            if (id == ruleUrls[s].id) {
                                urls.push(ruleUrls[s]);
                                break;
                            }
                        }
                    });
                    ruleUrls = urls;
                }
            }
            if (rulesData.lang) {
                setLang(rulesData.lang);
            }
            if (rulesData.firstRun) {
                rulesData.firstRun = false;
                storage.setItem("rulesData", rulesData);
                setTimeout(() => {
                    storage.getItem("rulesData", data => {
                        if (data.firstRun === false) {
                            _GM_openInTab(firstRunPage, {active: true});
                        }
                    });
                }, 100);
            }
            _GM_registerMenuCommand(i18n("configure"), () => {
                _GM_openInTab(rulesData.configPage || configPage[0], {active: true});
            });
            if (rulesData.blacklist && rulesData.blacklist.length > 0) {
                let href = location.href.slice(0, 500);
                let commentStart = false;
                for (let i = 0; i < rulesData.blacklist.length; i++) {
                    let curGlob = rulesData.blacklist[i];
                    if (!curGlob) continue;
                    if (curGlob.indexOf("//") == 0) continue;
                    if (commentStart) {
                        if (/\*\/$/.test(curGlob)) {
                            commentStart = false;
                        }
                        continue;
                    }
                    if (curGlob.indexOf("/*") == 0) {
                        commentStart = true;
                        continue;
                    }
                    if (curGlob.indexOf("/") == 0) {
                        let regMatch = curGlob.match(/^\/(.*)\/(\w*)$/);
                        if (regMatch && new RegExp(regMatch[1], regMatch[2]).test(href)) {
                            forceState == 1;
                            return;
                        }
                    } else if (globMatch(curGlob, href)) {
                        forceState == 1;
                        return;
                    }
                }
            }
            _GM_registerMenuCommand(i18n("editCurrent"), () => {
                picker.start();
            });
            ruleParser.initSavedRules(async () => {
                let upBtnImg = rulesData.upBtnImg, downBtnImg = rulesData.downBtnImg, _sideControllerIcon = rulesData.sideControllerIcon;
                if (upBtnImg && downBtnImg) {
                    downSvgCSS = downSvgCSS.replace("transform: rotate(180deg);", "");
                } else if (upBtnImg && !downBtnImg) {
                    downBtnImg = upBtnImg;
                } else if(downBtnImg && !upBtnImg) {
                    upBtnImg = downBtnImg;
                }
                if (upBtnImg) {
                    upSvg = /https?:|data/.test(upBtnImg) ? `<img class="pagetual" src="${upBtnImg}"/>` : `<span>${upBtnImg}</span>`;
                }
                if (downBtnImg) {
                    downSvg = /https?:|data/.test(downBtnImg) ? `<img class="pagetual" src="${downBtnImg}"/>` : `<span>${downBtnImg}</span>`;
                }
                if (_sideControllerIcon) {
                    sideControllerIcon = /https?:|data/.test(_sideControllerIcon) ? `<img class="pagetual" src="${_sideControllerIcon}"/>` : `<span>${_sideControllerIcon}</span>`;
                }
                setLoadingDiv(rulesData.loadingText || i18n("loadingText"));
                if (typeof(rulesData.opacity) == "undefined") {
                    rulesData.opacity = 1;
                }
                if (typeof(rulesData.hideBar) == "undefined") {
                    rulesData.hideBar = false;
                }
                if (typeof(rulesData.dbClick2Stop) == "undefined") {
                    rulesData.dbClick2Stop = true;
                }
                if (typeof(rulesData.enableWhiteList) == "undefined") {
                    rulesData.enableWhiteList = false;
                }
                if (typeof(rulesData.enableHistory) == "undefined") {
                    rulesData.enableHistory = false;
                }
                if (typeof(rulesData.openInNewTab) == "undefined") {
                    rulesData.openInNewTab = false;
                }
                if (typeof(rulesData.enableDebug) == "undefined") {
                    rulesData.enableDebug = true;
                }
                if (typeof(rulesData.updateNotification) == "undefined") {
                    rulesData.updateNotification = true;
                }
                if (typeof(rulesData.initRun) == "undefined") {
                    rulesData.initRun = true;
                }
                if (typeof(rulesData.preload) == "undefined") {
                    rulesData.preload = true;
                }
                if (typeof(rulesData.customFirst) == "undefined") {
                    rulesData.customFirst = false;
                }
                if (typeof(rulesData.manualMode) == "undefined") {
                    rulesData.manualMode = false;
                }
                if (typeof(rulesData.clickMode) == "undefined") {
                    rulesData.clickMode = false;
                }
                if (typeof(rulesData.pageBarMenu) == "undefined") {
                    rulesData.pageBarMenu = true;
                }
                if (typeof(rulesData.arrowToScroll) == "undefined") {
                    rulesData.arrowToScroll = false;
                }
                if (typeof(rulesData.hideLoadingIcon) == "undefined") {
                    rulesData.hideLoadingIcon = false;
                }
                if (typeof(rulesData.hideBarArrow) == "undefined") {
                    rulesData.hideBarArrow = false;
                }
                if (typeof(rulesData.lastPageTips) == "undefined") {
                    rulesData.lastPageTips = true;
                }
                if (typeof(rulesData.rate) == "undefined") {
                    rulesData.rate = 1;
                }
                rate = rulesData.rate;
                if (rulesData.autoLoadNum && rulesData.initRun) {
                    autoLoadNum = parseInt(rulesData.autoLoadNum);
                }
                openInNewTab = rulesData.openInNewTab ? 1 : 0;
                enableDebug = rulesData.enableDebug;

                let _nextSwitch = await getListData("nextSwitch", location.host);
                if (typeof(_nextSwitch) !== "undefined") {
                    nextIndex = _nextSwitch || 0;
                }

                let _forceState = await getListData("forceState", location.host);
                if (typeof(_forceState) == "undefined") {
                    _forceState = await getData("forceState_" + location.host);
                }
                if (typeof(_forceState) == "undefined") {
                    _forceState = (rulesData.enableWhiteList ? 1 : 0);
                }
                forceState = _forceState;

                autoScroll = await getListData("autoScroll", location.host + location.pathname) || 0;

                updateDate = await getData("ruleLastUpdate");

                let _loadNowNum = await getData("loadNowNum");
                if (typeof(_loadNowNum) != "undefined") {
                    loadNowNum = _loadNowNum;
                }
                let _autoScrollRate = await getData("autoScrollRate");
                if (_autoScrollRate) {
                    autoScrollRate = _autoScrollRate;
                }

                author = await getData("author") || "";

                manualPause = !!await getListData("pauseState", location.host);

                let href = location.href.slice(0, 100);
                try {
                    if (_unsafeWindow.initedPagetual) {
                        if (ruleImportUrlReg.test(href)) {
                            showTips(i18n('duplicate'));
                        }
                        return;
                    }
                    _unsafeWindow.initedPagetual = true;
                } catch(e) {showTips(e)}
                listenUrl();
                _GM_registerMenuCommand(i18n("update"), () => {
                    showTips(i18n("beginUpdate"), "", 60000);
                    updateRules(() => {
                        showTips(i18n("updateSucc"));
                        location.reload();
                    },(rule, err) => {
                        showTips(`Failed to update ${rule.url} rules!`);
                        debug(err);
                    });
                });
                _GM_registerMenuCommand(i18n(forceState == 1 ? "enable" : "disableSite"), () => {
                    if (forceState == 1) {
                        forceState = 0;
                        showTips(i18n("enableSiteTips"));
                        changeStop(false);
                    } else {
                        forceState = 1;
                        showTips(i18n("disableSiteTips"));
                        changeStop(true);
                        sideController.remove();
                    }
                    setListData("forceState", location.host, forceState);
                    if (!ruleParser.curSiteRule.url) {
                        setTimeout(() => {
                            location.reload();
                        }, 500);
                    }
                });
                _GM_registerMenuCommand(i18n("toggleAutoScroll"), () => {
                    autoScroll = (autoScroll ? 0 : prompt(i18n("autoScrollRate"), autoScrollRate)) || 0;
                    autoScroll = parseInt(autoScroll) || 0;
                    if (autoScroll < 0) autoScroll = 0;
                    if (autoScroll && autoScroll != autoScrollRate) {
                        autoScrollRate = autoScroll;
                        storage.setItem("autoScrollRate", autoScrollRate);
                    }
                    setListData("autoScroll", location.host + location.pathname, autoScroll);
                    startAutoScroll();
                });
                startAutoScroll();


                if (initConfig(href)) return;
                pageReady = true;
                if (forceState == 1) return;
                let now = new Date().getTime();
                if (!updateDate || now - updateDate > 2 * 24 * 60 * 60 * 1000) {
                    updateRules(() => {
                    }, (rule, err) => {}, true);
                    storage.setItem("ruleLastUpdate", now);
                }
                callback();
            });
        });
    }

    function requestDoc(url, callback) {
        let postParams = url.match(/#p{(.*)}$/);
        if (postParams) {
            postParams = postParams[1];
            url = url.replace(/#p{.*/, "");
        }
        let ruleHeaders = ruleParser.curSiteRule.headers;
        let headers = {
            'Referer': location.href,
            'User-Agent': navigator.userAgent,
            'accept': 'text/html,application/xhtml+xml,application/xml',
            "Content-Type": (postParams ? "application/x-www-form-urlencoded" : "text/html") + ";charset=" + charset,
        };
        if (ruleHeaders) {
            if (ruleHeaders.referer) {
                headers.referer = ruleHeaders.referer;
            }
            if (ruleHeaders.userAgent) {
                headers.userAgent = ruleHeaders.userAgent;
            }
            if (ruleHeaders.accept) {
                headers.accept = ruleHeaders.accept;
            }
            if (ruleHeaders.contentType) {
                headers.contentType = ruleHeaders.contentType;
                let ruleCharset = ruleHeaders.contentType.match(/charset\=([^;]+)/);
                if (ruleCharset) charset = ruleCharset[1];
            }
            if (ruleHeaders.cookie) {
                headers.cookie = ruleHeaders.cookie;
            }
        }
        _GM_xmlhttpRequest({
            url: url,
            method: postParams ? 'POST' : 'GET',
            data: postParams,
            overrideMimeType: 'text/html;charset=' + charset,
            headers: headers,
            timeout: 20000,
            onload: async function(res) {
                if (isPause) return callback(false);
                var doc = null, response = res.response;
                let preCode = ruleParser.curSiteRule.pageElementPre || ruleParser.curSiteRule.pagePre;
                if (preCode) {
                    try {
                        if (typeof preCode == 'function') {
                            response = preCode(response);
                        } else if (preCode.length == 2) {
                            response = response.replace(new RegExp(preCode[0], "gi"), preCode[1]);
                        } else {
                            response = Function("response",'"use strict";' + preCode)(response);
                        }
                    } catch(e) {
                        debug(e);
                    }
                }
                try {
                    doc = document.implementation.createHTMLDocument('');
                    doc.documentElement.innerHTML = response;
                    let base = doc.querySelector("base");
                    ruleParser.basePath = base ? base.href : url;
                } catch (e) {
                    debug('parse error:' + e.toString());
                }
                if (charsetValid && !ruleHeaders) {
                    let equiv = doc.querySelector('[http-equiv="Content-Type"]');
                    if (equiv && equiv.content) {
                        let innerCharSet = equiv.content.match(/charset\=([^;]+)/);
                        if (innerCharSet && innerCharSet[1].replace("-", "").toLowerCase() != charset.replace("-", "").toLowerCase()) {
                            charset = innerCharSet[1];
                            return requestDoc(url, callback);
                        }
                    }
                }
                let pageElement = ruleParser.getPageElement(doc);
                if ((!pageElement || pageElement.length == 0) && res.status >= 400) {
                    debug(res.status + " " + url, "Error status");
                    return callback(false);
                }
                if (inCors && (!pageElement || pageElement.length == 0) && ruleParser.curSiteRule.smart) {
                    let article;
                    for (let i = 0; i < mainSel.length; i++) {
                        article = doc.querySelectorAll(mainSel[i]);
                        if (article && article.length === 1) break;
                    }
                    if (article && article.length == 1) {
                        article = article[0];
                        ruleParser.curSiteRule.pageElement = article.nodeName.toLowerCase() + (article.id ? "#" + article.id : "") + (article.className ? "." + article.className.replace(/ /g, ".") : "") + ">*";
                        pageElement = article.children;
                    } else {
                        ruleParser.curSiteRule.pageElement = allOfBody;
                        pageElement = ruleParser.getPageElement(doc);
                    }
                    ruleParser.getInsert(true);
                }
                //只有1的話怕不是圖片哦
                if (pageElement && (pageElement.length > 1 || (pageElement.length == 1 && !compareNodeName(pageElement[0], ["img"])))) {
                    await ruleParser.insertPage(doc, pageElement, url, callback, false);
                    if (ruleParser.curSiteRule.action == 1) {
                        isLoading = true;
                        requestFromIframe(url, (doc, eles) => {
                            if (eles) {
                                ruleParser.insertPage(doc, eles, url, callback, true);
                            } else isLoading = false;
                        });
                    } else ruleParser.curSiteRule.action = 0;
                } else if ((ruleParser.curSiteRule.smart || curPage == 1) && !inCors) {
                    ruleParser.curSiteRule.action = 1;
                    requestFromIframe(url, (doc, eles) => {
                        if (eles) {
                            ruleParser.insertPage(doc, eles, url, callback, true);
                        } else isLoading = false;
                    });
                } else {
                    debug("Stop as no page element");
                    ruleParser.noValidContent(url);
                    changeStop(true);
                    callback(false);
                }
            },
            onerror: function(e) {
                debug(e, "NetError");
                callback(false);
            },
            ontimeout: function(e) {
                debug(e, "NetTimeout");
                callback(false);
            }
        });
    }

    function initPage() {
        ruleParser.initPage(() => {
            if (ruleParser.curSiteRule.autoLoadNum) {
                autoLoadNum = ruleParser.curSiteRule.autoLoadNum;
            }
            if (ruleParser.curSiteRule.nextLink && Array && Array.isArray && Array.isArray(ruleParser.curSiteRule.nextLink)) {
                _GM_registerMenuCommand(i18n("nextSwitch"), () => {
                    nextSwitch.start();
                });
            }
            if (ruleParser.nextLinkHref) {
                let isJs = ruleParser.hrefIsJs(ruleParser.nextLinkHref);
                if (!isJs) {
                    let inForce = (forceState == 2 || forceState == 3);
                    _GM_registerMenuCommand(i18n(inForce ? "cancelForceIframe" : "forceIframe"), () => {
                        if (inForce) {
                            setListData("forceState", location.host, "");
                        } else {
                            let _state = ruleParser.curSiteRule.action > 0 || confirm(i18n("forceAllBody")) ? 2 : 3;
                            setListData("forceState", location.host, _state);
                        }
                        setTimeout(() => {
                            location.reload();
                        }, 500);
                    });
                }
                _GM_registerMenuCommand(i18n("loadNow"), () => {
                    if (autoLoadNum != -1) {
                        autoLoadNum = -1;
                        return;
                    }
                    let loadNum = window.prompt(i18n("loadConfirm"), loadNowNum);
                    if (loadNum === "" || loadNum === null) return;
                    loadNum = Math.abs(parseInt(loadNum)) || 0;
                    if (loadNowNum != loadNum) {
                        loadNowNum = loadNum;
                        storage.setItem("loadNowNum", loadNowNum);
                    }
                    autoLoadNum = loadNum;
                    nextPage();
                });
            }
            initListener();
        });
    }

    var pageBarStyle, mainStyleEle, mainStyleStyle;
    function initView() {
        if (!mainStyleStyle) {
            mainStyleStyle = `
         .pagetual_pageBar{
           -moz-transition:all 0.3s ease-in-out 0s;
           -webkit-transition:all 0.3s ease-in-out 0s;
           transition:all 0.3s ease-in-out 0s;
           font-family: Arial,sans-serif !important;
           text-align: center !important;
         }
         .pagetual_pageBar.stop {
           -webkit-filter: invert(100%);
           filter: invert(100%);
           opacity: 1!important;
         }
         .pagetual_pageBar.hide {
           display: none!important;
         }
         .pagetual-hide {
           display: none!important;
         }
         .pagetual_pageBar:hover {
           opacity: 1!important;
           box-shadow: 0px 0px 10px 0px #000000aa;
           border-radius: 20px;
           background-color: rgb(240 240 240 / 80%);
           border-color: transparent!important;
         }
         .pagetual_pageBar span {
           vertical-align: super;
         }
         .pagetual_pageBar a::before,
         .pagetual_pageBar a::after {
           content: none;
         }
         .pagetual_pageBar a>span {
           margin-top: 0!important;
           pointer-events: none;
           padding: unset;
           opacity: 0;
           -moz-transition:margin-top 0.3s ease-in-out 0s, opacity .3s;
           -webkit-transition:margin-top 0.3s ease-in-out 0s, opacity .3s;
           transition:margin-top 0.3s ease-in-out 0s, opacity .3s;
           transform: none;
           left: 0;
           margin-left: calc(50% - 20px);
         }
         .pagetual_pageBar a>span:hover {
           color: red;
         }
         .pagetual_pageBar a:hover>span {
           opacity: 1;
         }
         .pagetual_pageBar span.prevScreen,
         .pagetual_pageBar span.nextScreen {
           display: block!important;
         }
         .pagetual_pageBar a:hover>span.prevScreen {
           margin-top: -${rulesData.opacity == 1 ? 31 : 30}px!important;
           pointer-events: all;
         }
         .pagetual_pageBar span.refreshRing {
           position: absolute;
           top: 0;
           opacity: 0;
           height: 30px;
           margin-left: calc(50% - 23px);
           display: block!important;
         }
         .pagetual_pageBar a:hover>span.refreshRing {
           opacity: 0.3;
           -webkit-animation: pagetual_ring 2.0s infinite linear;
           animation: pagetual_ring 2.0s infinite linear;
         }
         @-webkit-keyframes pagetual_ring {
           0% { -webkit-transform: rotate(0deg) }
           100% {
             -webkit-transform: rotate(360deg);
           }
         }
         @keyframes pagetual_ring {
           0% {
             transform: rotate(0deg);
             -webkit-transform: rotate(0deg);
           } 100% {
             transform: rotate(360deg);
             -webkit-transform: rotate(360deg);
           }
         }
         .pagetual_pageBar a:hover>span.nextScreen {
           margin-top: 30px!important;
           pointer-events: all;
         }
         .pagetual_pageBar span>svg {
           -moz-transition:transform 0.5s ease, opacity 0.3s ease;
           -webkit-transition:transform 0.5s ease, opacity 0.3s ease;
           transition:transform 0.5 ease, opacity 0.3s ease;
           opacity: 0;
         }
         .pagetual_pageBar.stop span>svg{
           opacity: 1;
         }
         .pagetual_pageBar.stop span>svg>path{
           transform: scale(.8);
           transform-origin: center;
           -moz-transition:transform 0.3s ease;
           -webkit-transition:transform 0.3s ease;
           transition:transform 0.3 ease;
         }
         .pagetual_pageBar.stop:hover span>svg>path{
           transform: unset;
         }
         .pagetual_pageBar:hover span>svg {
           opacity: 1;
         }
         .pagetual_pageBar span>svg.upSvg:hover {
           transform: rotate(360deg) scale3d(1.2, 1.2, 1.2);
         }
         .pagetual_pageBar span>svg.downSvg:hover {
           transform: rotate(540deg) scale3d(1.2, 1.2, 1.2)!important;
         }
         .pagetual_pageBar .pagetual_pageNum{
           color: #55555f;
         }
         .pagetual_pageBar .pagetual_pageNum:hover{
           color: #ff6464;
         }
         .pagetual_tipsWords {
           font-size: 3em;
           font-weight: bold;
           font-family: "黑体", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto",
             "Oxygen", "Ubuntu", "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji",
             "Segoe UI Emoji", "Segoe UI Symbol";
           color: #ffffff;
           min-height: 70px;
           max-width: 80%;
           line-height: 1.5;
           position: fixed;
           left: 50%;
           top: 10%;
           margin-left: -99999px;
           padding: 0 15px;
           z-index: 2147483647;
           background-color: #000;
           border: 1px solid #303030;
           border-radius: 10px;
           opacity: 0;
           filter: alpha(opacity=65);
           box-shadow: 5px 5px 20px 0px #000;
           -moz-transition:opacity 0.3s ease-in-out 0s;
           -webkit-transition:opacity 0.3s ease-in-out 0s;
           transition:opacity 0.3s ease-in-out 0s;
           pointer-events: none;
           word-break: break-all;
         }
         .pagetual_tipsWords>a {
           color: #ffffff;
         }
         .pagetual_loading {
           width: 50px;
           height: 50px;
           margin: 10px auto;
           border-radius: 100%;
           display: flex;
           -webkit-animation: pagetual_loading_scaleout 1.0s infinite ease-in-out;
           animation: pagetual_loading_scaleout 1.0s infinite ease-in-out;
         }
         @-webkit-keyframes pagetual_loading_scaleout {
           0% { -webkit-transform: scale(0.0) }
           100% {
             -webkit-transform: scale(1.0);
             opacity: 0;
           }
         }
         @keyframes pagetual_loading_scaleout {
           0% {
             transform: scale(0.0);
             -webkit-transform: scale(0.0);
           } 100% {
             transform: scale(1.0);
             -webkit-transform: scale(1.0);
             opacity: 0;
           }
         }
         .pagetual_loading_text {
           white-space: nowrap;
           -webkit-animation: pagetual_loading_opacity 2.6s infinite ease-in-out;
           animation: pagetual_loading_opacity 2.6s infinite ease-in-out;
         }
         @-webkit-keyframes pagetual_loading_opacity {
           0% { opacity: 1 }
           50% { opacity: 0.2 }
           100% { opacity: 1 }
         }
         @keyframes pagetual_loading_opacity {
           0% { opacity: 1 }
           50% { opacity: 0.2 }
           100% { opacity: 1 }
         }
        `;
            pageBarStyle = `overflow: visible;text-indent: initial;vertical-align: super;line-height:1;opacity:${rulesData.opacity};display:${rulesData.opacity == 0 ? "none" : "inline-flex"};padding:0;font-size: 30px;visibility: visible; position: relative; width: auto; max-width: 100vw; height: 30px; float: none; clear: both; margin: 5px auto; text-align: center;justify-content: center;box-sizing: content-box;${rulesData.opacity == 1 ? "border-top: 1px solid rgb(80, 80, 80);" : "box-shadow: 0px 0px 10px 0px #000000aa;border-radius: 20px;background-color: rgb(240 240 240 / 80%);"}`;
        }
        if (!mainStyleEle || !mainStyleEle.parentNode) {
            mainStyleEle = _GM_addStyle(mainStyleStyle);
        }
    }
    var loadingDiv = document.createElement("div");
    if (loadingDiv.style) loadingDiv.style.cssText = "text-indent: initial;cy: initial;d: initial;dominant-baseline: initial;empty-cells: initial;fill: initial;fill-opacity: initial;fill-rule: initial;filter: initial;flex: initial;flex-flow: initial;float: initial;flood-color: initial;flood-opacity: initial;grid: initial;grid-area: initial;height: initial;hyphens: initial;image-orientation: initial;image-rendering: initial;inline-size: initial;inset-block: initial;inset-inline: initial;isolation: initial;letter-spacing: initial;lighting-color: initial;line-break: initial;list-style: initial;margin-block: initial;margin: 0px auto;margin-inline: initial;marker: initial;mask: initial;mask-type: initial;max-block-size: initial;max-height: initial;max-inline-size: initial;max-width: initial;min-block-size: initial;min-height: initial;min-inline-size: initial;min-width: initial;mix-blend-mode: initial;object-fit: initial;object-position: initial;offset: initial;opacity: initial;order: initial;origin-trial-test-property: initial;orphans: initial;outline: initial;outline-offset: initial;overflow-anchor: initial;overflow-clip-margin: initial;overflow-wrap: initial;overflow: initial;overscroll-behavior-block: initial;overscroll-behavior-inline: initial;overscroll-behavior: initial;padding-block: initial;padding: initial;padding-inline: initial;page: initial;page-orientation: initial;paint-order: initial;perspective: initial;perspective-origin: initial;pointer-events: initial;position: initial;quotes: initial;r: initial;resize: initial;ruby-position: initial;rx: initial;ry: initial;scroll-behavior: initial;scroll-margin-block: initial;scroll-margin: initial;scroll-margin-inline: initial;scroll-padding-block: initial;scroll-padding: initial;scroll-padding-inline: initial;scroll-snap-align: initial;scroll-snap-stop: initial;scroll-snap-type: initial;scrollbar-gutter: initial;shape-image-threshold: initial;shape-margin: initial;shape-outside: initial;shape-rendering: initial;size: initial;speak: initial;stop-color: initial;stop-opacity: initial;stroke: initial;stroke-dasharray: initial;stroke-dashoffset: initial;stroke-linecap: initial;stroke-linejoin: initial;stroke-miterlimit: initial;stroke-opacity: initial;stroke-width: initial;tab-size: initial;table-layout: initial;text-align: initial;text-align-last: initial;text-anchor: initial;text-combine-upright: initial;text-decoration: initial;text-decoration-skip-ink: initial;text-indent: initial;text-overflow: initial;text-shadow: initial;text-size-adjust: initial;text-transform: initial;text-underline-offset: initial;text-underline-position: initial;touch-action: initial;transform: initial;transform-box: initial;transform-origin: initial;transform-style: initial;transition: initial;user-select: initial;vector-effect: initial;vertical-align: initial;visibility: initial;border-spacing: initial;-webkit-border-image: initial;-webkit-box-align: initial;-webkit-box-decoration-break: initial;-webkit-box-direction: initial;-webkit-box-flex: initial;-webkit-box-ordinal-group: initial;-webkit-box-orient: initial;-webkit-box-pack: initial;-webkit-box-reflect: initial;-webkit-highlight: initial;-webkit-hyphenate-character: initial;-webkit-line-break: initial;-webkit-line-clamp: initial;-webkit-mask-box-image: initial;-webkit-mask: initial;-webkit-mask-composite: initial;-webkit-perspective-origin-x: initial;-webkit-perspective-origin-y: initial;-webkit-print-color-adjust: initial;-webkit-rtl-ordering: initial;-webkit-ruby-position: initial;-webkit-tap-highlight-color: initial;-webkit-text-combine: initial;-webkit-text-decorations-in-effect: initial;-webkit-text-emphasis: initial;-webkit-text-emphasis-position: initial;-webkit-text-fill-color: initial;-webkit-text-security: initial;-webkit-text-stroke: initial;-webkit-transform-origin-x: initial;-webkit-transform-origin-y: initial;-webkit-transform-origin-z: initial;-webkit-user-drag: initial;-webkit-user-modify: initial;white-space: initial;widows: initial;width: initial;will-change: initial;word-break: initial;word-spacing: initial;x: initial;y: initial;z-index: 2147483647;";

    const loadingCSS = `font-size: initial; text-indent: unset; display: block; position: initial; margin: auto auto 5px auto; shape-rendering: auto; vertical-align: middle; visibility: visible; width: initial; height: initial; text-align: center; color: #6e6e6e; flex: 0;`;
    function setLoadingDiv(loadingText) {
        loadingDiv.innerHTML = createHTML(`<p class="pagetual_loading_text" style="${loadingCSS}display: inline-block;width: 100%;">${loadingText}</p>${rulesData.hideLoadingIcon ? "" : `<div class="pagetual_loading"><svg width="50" height="50" style="position:relative;cursor: pointer;width: 50px;height: 50px;vertical-align: middle;fill: currentColor;overflow: hidden;" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M296 440c-44.1 0-80 35.9-80 80s35.9 80 80 80 80-35.9 80-80-35.9-80-80-80z" style="fill: #6e6e6e;" fill="#6e6e6e"></path><path d="M960 512c0-247-201-448-448-448S64 265 64 512c0 1.8 0.1 3.5 0.1 5.3 0 0.9-0.1 1.8-0.1 2.7h0.2C68.5 763.3 267.7 960 512 960c236.2 0 430.1-183.7 446.7-415.7 0.1-0.8 0.1-1.6 0.2-2.3 0.4-4.6 0.5-9.3 0.7-13.9 0.1-2.7 0.4-5.3 0.4-8h-0.2c0-2.8 0.2-5.4 0.2-8.1z m-152 8c0 44.1-35.9 80-80 80s-80-35.9-80-80 35.9-80 80-80 80 35.9 80 80zM512 928C284.4 928 99 744.3 96.1 517.3 97.6 408.3 186.6 320 296 320c110.3 0 200 89.7 200 200 0 127.9 104.1 232 232 232 62.9 0 119.9-25.2 161.7-66-66 142.7-210.4 242-377.7 242z" style="fill: #6e6e6e;" fill="#6e6e6e"></path></svg></div>`}`);
    }

    var upSvg = `<svg width="30" height="30" class="upSvg pagetual" style="display:initial;position:relative;cursor: pointer;margin: 0 8px;width: 30px;height: 30px;vertical-align: baseline;fill: currentColor;overflow: hidden;" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M296 440c-44.1 0-80 35.9-80 80s35.9 80 80 80 80-35.9 80-80-35.9-80-80-80z" style="fill: #604b4a;" fill="#604b4a"></path><path d="M960 512c0-247-201-448-448-448S64 265 64 512c0 1.8 0.1 3.5 0.1 5.3 0 0.9-0.1 1.8-0.1 2.7h0.2C68.5 763.3 267.7 960 512 960c236.2 0 430.1-183.7 446.7-415.7 0.1-0.8 0.1-1.6 0.2-2.3 0.4-4.6 0.5-9.3 0.7-13.9 0.1-2.7 0.4-5.3 0.4-8h-0.2c0-2.8 0.2-5.4 0.2-8.1z m-152 8c0 44.1-35.9 80-80 80s-80-35.9-80-80 35.9-80 80-80 80 35.9 80 80zM512 928C284.4 928 99 744.3 96.1 517.3 97.6 408.3 186.6 320 296 320c110.3 0 200 89.7 200 200 0 127.9 104.1 232 232 232 62.9 0 119.9-25.2 161.7-66-66 142.7-210.4 242-377.7 242z" style="fill: #604b4a;" fill="#604b4a"></path></svg>`;
    var upSvgCSS = `text-align: center;display: initial;position: relative;cursor: pointer;margin: 0 8px;width: 30px;height: 30px;vertical-align: baseline;fill: currentColor;overflow: hidden;`;
    var downSvg = `<svg width="30" height="30" class="downSvg pagetual" style="display:initial;position:relative;cursor: pointer;margin: 0 8px;width: 30px;height: 30px;vertical-align: baseline;fill: currentColor;overflow: hidden;transform: rotate(180deg);" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M296 440c-44.1 0-80 35.9-80 80s35.9 80 80 80 80-35.9 80-80-35.9-80-80-80z" style="fill: #604b4a;" fill="#604b4a"></path><path d="M960 512c0-247-201-448-448-448S64 265 64 512c0 1.8 0.1 3.5 0.1 5.3 0 0.9-0.1 1.8-0.1 2.7h0.2C68.5 763.3 267.7 960 512 960c236.2 0 430.1-183.7 446.7-415.7 0.1-0.8 0.1-1.6 0.2-2.3 0.4-4.6 0.5-9.3 0.7-13.9 0.1-2.7 0.4-5.3 0.4-8h-0.2c0-2.8 0.2-5.4 0.2-8.1z m-152 8c0 44.1-35.9 80-80 80s-80-35.9-80-80 35.9-80 80-80 80 35.9 80 80zM512 928C284.4 928 99 744.3 96.1 517.3 97.6 408.3 186.6 320 296 320c110.3 0 200 89.7 200 200 0 127.9 104.1 232 232 232 62.9 0 119.9-25.2 161.7-66-66 142.7-210.4 242-377.7 242z" style="fill: #604b4a;" fill="#604b4a"></path></svg>`;
    var downSvgCSS = `text-align: center;display: initial;position: relative;cursor: pointer;margin: 0 8px;width: 30px;height: 30px;vertical-align: baseline;fill: currentColor;overflow: hidden;transform: rotate(180deg);`;

    const initStyle = `text-indent: initial;display: contents;right: unset;left: unset;top: unset;bottom: unset;inset: unset;clear: both;cy: initial;d: initial;dominant-baseline: initial;empty-cells: initial;fill: initial;fill-opacity: initial;fill-rule: initial;filter: initial;flex: initial;flex-flow: initial;float: initial;flood-color: initial;flood-opacity: initial;grid: initial;grid-area: initial;height: initial;hyphens: initial;image-orientation: initial;image-rendering: initial;inline-size: initial;inset-block: initial;inset-inline: initial;isolation: initial;letter-spacing: initial;lighting-color: initial;line-break: initial;list-style: initial;margin-block: initial;margin: 0px 5px;margin-inline: initial;marker: initial;mask: initial;mask-type: initial;max-block-size: initial;max-height: initial;max-inline-size: initial;max-width: initial;min-block-size: initial;min-height: initial;min-inline-size: initial;min-width: initial;mix-blend-mode: initial;object-fit: initial;object-position: initial;offset: initial;opacity: initial;order: initial;orphans: initial;outline: initial;outline-offset: initial;overflow-anchor: initial;overflow-clip-margin: initial;overflow-wrap: initial;overflow: initial;overscroll-behavior-block: initial;overscroll-behavior-inline: initial;overscroll-behavior: initial;padding-block: initial;padding: initial;padding-inline: initial;page: initial;page-orientation: initial;paint-order: initial;perspective: initial;perspective-origin: initial;pointer-events: initial;position: relative;quotes: initial;r: initial;resize: initial;ruby-position: initial;rx: initial;ry: initial;scroll-behavior: initial;scroll-margin-block: initial;scroll-margin: initial;scroll-margin-inline: initial;scroll-padding-block: initial;scroll-padding: initial;scroll-padding-inline: initial;scroll-snap-align: initial;scroll-snap-stop: initial;scroll-snap-type: initial;scrollbar-gutter: initial;shape-image-threshold: initial;shape-margin: initial;shape-outside: initial;shape-rendering: initial;size: initial;speak: initial;stop-color: initial;stop-opacity: initial;stroke: initial;stroke-dasharray: initial;stroke-dashoffset: initial;stroke-linecap: initial;stroke-linejoin: initial;stroke-miterlimit: initial;stroke-opacity: initial;stroke-width: initial;tab-size: initial;table-layout: initial;text-align: initial;text-align-last: initial;text-anchor: initial;text-combine-upright: initial;text-decoration: initial;text-decoration-skip-ink: initial;text-indent: initial;text-overflow: initial;text-shadow: initial;text-size-adjust: initial;text-transform: initial;text-underline-offset: initial;text-underline-position: initial;touch-action: initial;transform: initial;transform-box: initial;transform-origin: initial;transform-style: initial;transition: initial;user-select: initial;vector-effect: initial;vertical-align: initial;visibility: initial;border-spacing: initial;-webkit-border-image: initial;-webkit-box-align: initial;-webkit-box-decoration-break: initial;-webkit-box-direction: initial;-webkit-box-flex: initial;-webkit-box-ordinal-group: initial;-webkit-box-orient: initial;-webkit-box-pack: initial;-webkit-box-reflect: initial;-webkit-highlight: initial;-webkit-hyphenate-character: initial;-webkit-line-break: initial;-webkit-line-clamp: initial;-webkit-mask-box-image: initial;-webkit-mask: initial;-webkit-mask-composite: initial;-webkit-perspective-origin-x: initial;-webkit-perspective-origin-y: initial;-webkit-print-color-adjust: initial;-webkit-rtl-ordering: initial;-webkit-ruby-position: initial;-webkit-tap-highlight-color: initial;-webkit-text-combine: initial;-webkit-text-decorations-in-effect: initial;-webkit-text-emphasis: initial;-webkit-text-emphasis-position: initial;-webkit-text-fill-color: initial;-webkit-text-security: initial;-webkit-text-stroke: initial;-webkit-transform-origin-x: initial;-webkit-transform-origin-y: initial;-webkit-transform-origin-z: initial;-webkit-user-drag: initial;-webkit-user-modify: initial;white-space: initial;widows: initial;width: initial;will-change: initial;word-break: initial;word-spacing: initial;x: initial;y: initial;`;
    const pageTextStyle = `opacity: 1!important;text-indent: initial;padding: unset;border: none;background: unset!important;line-height: 30px;text-decoration: none;user-select: none;visibility: visible;position: initial;width: auto;max-width: 80%; white-space: nowrap; text-overflow: ellipsis;overflow: hidden;height: auto;float: none;clear: both;margin: 0px;text-align: center;display: inline-block;font-weight: bold;font-style: normal;font-size: 16px;letter-spacing: initial;vertical-align: top;color: rgb(85, 85, 95)!important;`;
    var sideControllerIcon = '';

    var tipsWords = document.createElement("div");
    tipsWords.className = "pagetual_tipsWords";

    function changeStop(stop) {
        isPause = stop;
        [].forEach.call(getBody(document).querySelectorAll(".pagetual_pageBar,#pagetual-sideController"), bar => {
            if (isPause) {
                bar.classList.add("stop");
            } else {
                bar.classList.remove("stop");
            }
        });
        if (!isPause) ruleParser.showAddedElements();
        manualPause = isPause;
        if (sideController.inited) setListData("pauseState", location.host, isPause ? true : "");
    }

    function changeHideBar(hide) {
        isHideBar = hide;
        [].forEach.call(getBody(document).querySelectorAll(".pagetual_pageBar"), bar => {
            if (isHideBar) {
                bar.classList.add("hide");
            } else {
                bar.classList.remove("hide");
            }
        });
    }

    function isInViewPort(element) {
        if (!getBody(document).contains(element)) return false;
        const viewWidth = window.innerWidth || document.documentElement.clientWidth;
        const viewHeight = window.innerHeight || document.documentElement.clientHeight;
        const {
            top,
            right,
            bottom,
            left,
        } = element.getBoundingClientRect();

        return (
            top >= 0 &&
            left >= 0 &&
            right <= viewWidth + 1 &&
            top <= viewHeight * rate &&
            isVisible(element, _unsafeWindow)
        );
    }

    function getPageBar() {
        let preBar = null, nextBar = null;
        let pageBars = [].slice.call(document.querySelectorAll(".pagetual_pageBar"));
        for (let i = 0; i < pageBars.length; i++) {
            let pageBar = pageBars[i];
            if (!pageBar || !getBody(document).contains(pageBar)) continue;
            let {
                top,
                right,
                bottom,
                left,
            } = pageBar.getBoundingClientRect();
            if (top > 500) {
                nextBar = pageBar;
                preBar = (i - 1 >= 0 ? pageBars[i - 1] : null);
                if (pageBar && getBody(document).contains(pageBar)) {
                    let {
                        top,
                        right,
                        bottom,
                        left,
                    } = pageBar.getBoundingClientRect();
                    if (top < -500) {
                        preBar = pageBar;
                    } else preBar = (i - 2 >= 0 ? pageBars[i - 2] : null);
                }
                break;
            }
        }
        if (!nextBar) preBar = pageBars[pageBars.length - 2];
        return {preBar: preBar, nextBar: nextBar};
    }

    var urlChanged = false;
    var urlChanging = false;
    var urlchangeHandler = e => {
        if (ruleParser && ruleParser.curSiteRule && ruleParser.curSiteRule.listenUrlChange == false) return;
        isPause = true;
        setTimeout(() => {
            lastActiveUrl = location.href;
            if (urlChanging) return;
            urlChanging = true;
            let href = location.href.slice(0, 60);
            if (href == configPage[1]) {
                setTimeout(() => {
                    initConfig(href);
                    urlChanging = false;
                }, 1000);
            } else {
                setTimeout(() => {
                    if (guidePage.test(href)) {
                        setTimeout(() => {
                            initConfig(href);
                            urlChanging = false;
                        }, 1000);
                    } else {
                        urlChanged = true;
                        if (!ruleParser.nextLinkHref) {
                            isLoading = false;
                        }
                        urlChanging = false;
                        //if (!pageReady && !ruleImportUrlReg.test(href)) location.reload();
                    }
                }, 500);
            }
        }, 1);
    };
    window.addEventListener('pagetual_pushState', urlchangeHandler);
    /*var _wr = function(type) {
        var orig = history[type];
        return function() {
            var rv = orig.apply(this, arguments);
            var e = new Event('pagetual_' + type);
            e.arguments = arguments;
            window.dispatchEvent(e);
            return rv;
        };
    };
    history.pushState = _wr('pushState');*/

    function listenUrl() {
        var prevPathname = window.location.pathname;
        var prevSearch = window.location.search;
        var checkUrlTime = 100;
        var checkUrlTimer;
        var checkClickedEle = null;
        var checkFunc = () => {
            if (forceState == 1) return;
            if (checkClickedEle) {
                if (!clickedSth && checkClickedEle && checkClickedEle.nodeName) {
                    if (compareNodeName(checkClickedEle, ["a", "button"])) {
                        clickedSth = true;
                    } else {
                        let targetStyle = _unsafeWindow.getComputedStyle(checkClickedEle);
                        if (targetStyle.cursor == "pointer") clickedSth = true;
                    }
                }
                checkClickedEle = null;
            }
            if (checkUrlTime < 5000) {
                checkUrlTime += checkUrlTime>>1;
            }
            clearTimeout(checkUrlTimer);
            checkUrlTimer = setTimeout(checkFunc, checkUrlTime);
            if (document.hidden) return;
            if ((prevPathname !== window.location.pathname || prevSearch !== window.location.search) && window.location.href != ruleParser.historyUrl) {
                checkUrlTime = 2000;
                urlWillChange = true;
                var e = new Event('pagetual_pushState');
                e.arguments = arguments;
                window.dispatchEvent(e);
                clickedSth = false;
            }
            prevPathname = window.location.pathname;
            prevSearch = window.location.search;
        };
        checkUrlTimer = setTimeout(checkFunc, checkUrlTime);

        document.addEventListener("click", e => {
            if (!checkClickedEle) {
                checkClickedEle = e.target;
                checkUrlTime = 300;
                clearTimeout(checkUrlTimer);
                checkUrlTimer = setTimeout(checkFunc, checkUrlTime);
            }
        });
    }

    let scrollContainer;
    function distToBottom () {
        let scrolly = window.scrollY;
        let windowHeight = window.innerHeight || document.documentElement.clientHeight;
        if (!scrollContainer || !document.documentElement.contains(scrollContainer)) {
            if (curPage > 1 || ruleParser.nextLinkHref) {
                let pageEle = ruleParser.getPageElement(document);
                if (pageEle && pageEle.length) {
                    let parent = pageEle[0].parentNode, pageScrollY = parent.scrollTop;
                    while (parent && pageScrollY == 0) {
                        parent = parent.parentNode;
                        pageScrollY = parent.scrollTop;
                    }
                    if (pageScrollY) {
                        scrollContainer = parent;
                        return scrollContainer.scrollHeight - pageScrollY - windowHeight;
                    }
                }
            }
        }
        if (scrollContainer) {
            return scrollContainer.scrollHeight - scrollContainer.scrollTop - windowHeight;
        }

        let scrollH = Math.max(document.documentElement.scrollHeight, getBody(document).scrollHeight);
        return scrollH - scrolly - windowHeight;
    }

    let scrollHandler, clickToResetHandler, dblclickHandler, keydownHandler, hashchangeHandler, manualModeKeyHandler, pagetualNextHandler, keyupHandler;
    function initListener () {
        document.removeEventListener('scroll', scrollHandler, true);
        document.removeEventListener('wheel', scrollHandler, true);
        document.removeEventListener('dblclick', dblclickHandler);
        document.removeEventListener('keydown', keydownHandler);
        window.removeEventListener('hashchange', hashchangeHandler, false);
        document.removeEventListener('keydown', manualModeKeyHandler);
        document.removeEventListener('pagetual.next', pagetualNextHandler, false);
        document.removeEventListener('keyup', keyupHandler);
        let loadmoreBtn, loadingMore = true, lastScroll = 0, checkLoadMoreTimes = 0;
        if (ruleParser.curSiteRule.smart) {
            loadingMore = false;
        } else if (ruleParser.curSiteRule.loadMore) {
            loadingMore = false;
        }
        clickMode = typeof ruleParser.curSiteRule.clickMode == 'undefined' ? rulesData.clickMode : ruleParser.curSiteRule.clickMode;
        let clickingNext = false;
        let clickNext = async () => {
            if (clickingNext) return;
            clickingNext = true;
            setTimeout(() => {
                clickingNext = false;
            }, 1500);
            let nextLink = ruleParser.nextLinkHref;
            if (!nextLink) return;
            let isJs = ruleParser.hrefIsJs(nextLink);
            if (isJs) {
                let nextBtn = ruleParser.nextLinkEle;
                if (!nextBtn || !nextBtn.offsetParent) nextBtn = await ruleParser.getNextLink(document, true);
                if (nextBtn) emuClick(nextBtn);
            } else {
                window.location.href = nextLink;
            }
        };
        let checkScrollReach = () => {
            let dist = distToBottom();
            if (clickMode) {
                if (dist < 10) {
                    clickNext();
                }
            } else if (dist < bottomGap) {
                nextPage();
            }
        };
        scrollHandler = e => {
            if (urlChanged && !isLoading) {
                ruleParser.initPage(() => {});
                urlChanged = false;
                loadingMore = false;
                return;
            }
            if (isPause) return;
            if (!loadingMore) {
                loadmoreBtn = getLoadMore(document, loadmoreBtn);
                if (loadmoreBtn) {
                    if (isInViewPort(loadmoreBtn)) {
                        emuClick(loadmoreBtn);
                        loadingMore = true;
                        setTimeout(() => {loadingMore = false}, 200);
                    }
                } else {
                    loadingMore = true;
                    if (!ruleParser.curSiteRule.smart || checkLoadMoreTimes++ < 3) {
                        setTimeout(() => {loadingMore = false}, 200);
                    }
                }
            }
            if (!isLoading && !stopScroll) {
                checkScrollReach();
            }
            ruleParser.changeVisibility();
            let curScroll = getBody(document).scrollTop || document.documentElement.scrollTop;
            if (ruleParser.curSiteRule.lockScroll) {
                if (isLoading && Math.abs(lastScroll - curScroll) > 350) {
                    getBody(document).scrollTop = lastScroll;
                    document.documentElement.scrollTop = lastScroll;
                } else {
                    lastScroll = curScroll;
                }
            }
            if (targetY >= 0) {
                if (Math.abs(targetY - curScroll) < 100) {
                    targetY = -1;
                }
            }
        };
        dblclickHandler = e => {
            if (forceState == 1 || compareNodeName(e.target, ["input", "textarea", "select", "a", "button", "svg", "use", "img", "path"])) return;
            if (!rulesData.dbClick2StopKey) {
                if ((rulesData.dbClick2StopCtrl && !e.ctrlKey) ||
                   (rulesData.dbClick2StopAlt && !e.altKey) ||
                   (rulesData.dbClick2StopShift && !e.shiftKey) ||
                   (rulesData.dbClick2StopMeta && !e.metaKey)) {
                    return;
                }
            }
            if (!compareNodeName(e.target, ["body"]) && !e.target.classList.contains('pagetual_pageBar')) {
                try {
                    let selection = window.getSelection();
                    let selStr = selection.toString().trim();
                    if (!selStr) {
                        selection = selection.getRangeAt(0);
                        selStr = selection && selection.cloneContents().children[0];
                        if (selStr && !compareNodeName(selStr, ["img"])) selStr = false;
                    }
                    if (selStr) {
                        return;
                    }
                } catch (e) {}
            }
            if (rulesData.dbClick2Stop && (ruleParser.nextLinkHref || loadmoreBtn)) {
                setTimeout(() => {
                    if (rulesData.hideBarButNoStop || rulesData.hideBar) {
                        changeHideBar(!isHideBar);
                    }
                    if (!rulesData.hideBarButNoStop) {
                        changeStop(!isPause);
                        showTips(i18n(isPause ? "disable" : "enable"));
                    }
                    if (!isPause) {
                        checkScrollReach();
                    }
                }, 10);
            }
        };
        document.addEventListener('dblclick', dblclickHandler);
        clickToResetHandler = e => {
            if (!ruleParser.nextLinkHref) isLoading = false;
        };
        document.addEventListener('click', clickToResetHandler);
        if (rulesData.dbClick2StopKey) {
            keydownHandler = e => {
                if ((rulesData.dbClick2StopCtrl && !e.ctrlKey) ||
                   (rulesData.dbClick2StopAlt && !e.altKey) ||
                   (rulesData.dbClick2StopShift && !e.shiftKey) ||
                   (rulesData.dbClick2StopMeta && !e.metaKey)) {
                    return;
                }
                if (document.activeElement &&
                    (compareNodeName(document.activeElement, ["input", "textarea"]) ||
                     document.activeElement.contentEditable == 'true')) {
                    return;
                }
                var key = e.key.toLowerCase();
                if (rulesData.dbClick2StopKey.toLowerCase() == key) {
                    if (forceState == 1) {
                        forceState = 0;
                        showTips(i18n("enableSiteTips"));
                        changeStop(false);
                    } else {
                        forceState = 1;
                        showTips(i18n("disableSiteTips"));
                        changeStop(true);
                        sideController.remove();
                    }
                    if (!ruleParser.curSiteRule.url) {
                        setListData("forceState", location.host, forceState);
                        setTimeout(() => {
                            location.reload();
                        }, 500);
                    }
                }
            };
            document.addEventListener('keydown', keydownHandler);
        }
        if (ruleParser.curSiteRule.listenHashChange) {
            hashchangeHandler = () => {
                isPause = true;
                urlChanged = true;
                if (!ruleParser.nextLinkHref) isLoading = false;
            };
            window.addEventListener('hashchange', hashchangeHandler, false);
        }
        let manualMode = typeof ruleParser.curSiteRule.manualMode == 'undefined' ? rulesData.manualMode : ruleParser.curSiteRule.manualMode;
        if (manualMode) {
            manualModeKeyHandler = e => {
                if (document.activeElement &&
                    (compareNodeName(document.activeElement, ["input", "textarea"]) ||
                     document.activeElement.contentEditable == 'true')) {
                    return;
                }
                if (e.keyCode == 39) {
                    clickNext();
                } else if (e.keyCode == 37) {
                    history.back();
                }
            };
            document.addEventListener('keydown', manualModeKeyHandler);
            pagetualNextHandler = () => {
                clickNext();
            };
            document.addEventListener('pagetual.next', pagetualNextHandler, false);
            return;
        }
        if (rulesData.arrowToScroll) {
            keyupHandler = e => {
                if (document.activeElement &&
                    (compareNodeName(document.activeElement, ["input", "textarea"]) ||
                     document.activeElement.contentEditable == 'true')) {
                    return;
                }
                if (e.keyCode == 39) {
                    let nextPageBar=getPageBar().nextBar;
                    if (nextPageBar) {
                        scrollToPageBar(nextPageBar);
                    } else {
                        let scrollTop = getBody(document).scrollTop || document.documentElement.scrollTop;
                        window.scrollTo({ top: scrollTop + (window.innerHeight || document.documentElement.clientHeight), behavior: 'instant'});
                    }
                } else if (e.keyCode == 37) {
                    let prePageBar = getPageBar().preBar;
                    if (prePageBar) {
                        scrollToPageBar(prePageBar);
                    } else {
                        let scrollTop = getBody(document).scrollTop || document.documentElement.scrollTop;
                        window.scrollTo({ top: scrollTop - (window.innerHeight || document.documentElement.clientHeight), behavior: 'instant'});
                    }
                }
            };
            document.addEventListener('keyup', keyupHandler);
        }
        if (!ruleParser.curSiteRule.wheel) {
            document.addEventListener('scroll', scrollHandler, true);
        }
        document.addEventListener('wheel', scrollHandler, true);
    }

    let hideTipsTimeout;
    function showTips(content, href, time, wordColor, backColor) {
        initView();
        getBody(document).appendChild(tipsWords);
        tipsWords.style.color = wordColor || 0xFFFFFF;
        tipsWords.style.backgroundColor = backColor || 0x000;
        let _time = 1500;
        if (href) {
            _time = 3500;
            tipsWords.innerHTML = createHTML(`<a href='${href}' target='_blank'>${content}</a>`);
            tipsWords.style.pointerEvents = 'all';
        } else {
            tipsWords.innerHTML = createHTML(content);
        }
        tipsWords.style.marginLeft = -tipsWords.offsetWidth / 2 + "px";
        setTimeout(() => {
            tipsWords.style.marginLeft = -tipsWords.offsetWidth / 2 + "px";
        }, 0);
        setTimeout(() => {
            tipsWords.style.opacity = 0.8;
            clearTimeout(hideTipsTimeout);
            hideTipsTimeout = setTimeout(() => {
                tipsWords.style.opacity = 0;
                tipsWords.style.pointerEvents = '';
            }, time || _time);
        }, 1);
    }

    const loadmoreReg = /^\s*((点击)?加载更多|(點擊)?加載更多|load\s*more|もっと読み込む)[.…]*\s*$/i;
    const defaultLoadmoreSel = ".loadMore,.LoadMore,[class*='load-more'],button.show_more,.button-show-more,button[data-testid='more-results-button'],#btn_preview_remain,.view-more-btn";
    function getLoadMore(doc, loadmoreBtn) {
        if (!loadmoreBtn || !getBody(doc).contains(loadmoreBtn) || /less/.test(loadmoreBtn.innerText)) loadmoreBtn = null;
        if (!ruleParser.curSiteRule.smart && !ruleParser.curSiteRule.loadMore) return null;
        if (loadmoreBtn) return loadmoreBtn;
        let btnSel = ruleParser.curSiteRule.loadMore || defaultLoadmoreSel;
        if (btnSel) {
            loadmoreBtn = getElement(btnSel, doc, null, true);
        }
        if (!loadmoreBtn) {
            let buttons = doc.querySelectorAll("input,button,a,div[onclick]");
            for (let i = 0; i < buttons.length; i++) {
                let button = buttons[i];
                if (!button.innerText || button.innerText.length > 20) continue;
                if (button && loadmoreReg.test(button.innerText)) {
                    loadmoreBtn = button;
                    break;
                }
            }
        }
        if (loadmoreBtn && !ruleParser.curSiteRule.loadMore && loadmoreBtn.dataset.ajax !== "true") {
            let href = loadmoreBtn.getAttribute("href");
            if (href && href != "/" && !ruleParser.hrefIsJs(href)) {
                loadmoreBtn = null;
            }
        }
        if (loadmoreBtn && /less/.test(loadmoreBtn.innerText)) loadmoreBtn = null;
        if (loadmoreBtn) debug(loadmoreBtn, 'Load more button');
        return loadmoreBtn;
    }

    var targetY = -1;
    function scrollToPageBar(bar){
        let yOffset = -20;
        if (typeof ruleParser.curSiteRule.pageBarTop !== 'undefined') {
            yOffset = -ruleParser.curSiteRule.pageBarTop;
        }
        targetY = bar.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: targetY, behavior: 'smooth'});
    }

    const pageNumReg=/[&\/\?](p=|page[=\/_-]?)\d+|[_-]\d+\./;
    function createPageBar(url) {
        curPage++;
        sideController.setup();
        let posEle = null;
        let scrollH = Math.max(document.documentElement.scrollHeight, getBody(document).scrollHeight);
        let insert = ruleParser.getInsert();
        if (!insert || !insert.parentNode) return;
        if (forceState == 2) {
            posEle = getBody(document);
            posEle = posEle.children[posEle.children.length - 1];
        } else {
            posEle = insert;
        }
        while (posEle && !posEle.offsetParent) {
            posEle = posEle.previousElementSibling || posEle.parentNode;
        }
        if (posEle) {
            let actualBottom = getElementBottom(posEle);
            bottomGap = scrollH - actualBottom + (window.innerHeight || document.documentElement.clientHeight) * rate;
            if (bottomGap < 100) bottomGap = 100;
        } else {
            bottomGap = 1000;
        }
        if (rulesData.opacity == 0 || ruleParser.curSiteRule.pageBar === 0) return null;
        url = url.replace(/#p{.*/, "");
        let example = (ruleParser.curSiteRule.insertPos == 2 || ruleParser.curSiteRule.insertPos == "in") ? insert.children[0] : (insert.parentNode.children[0] || insert);
        while (example && (compareNodeName(example, ["script", "style"]) || example.className == "pagetual_pageBar")) {
            example = example.nextElementSibling;
        }
        if (!example || !example.parentNode) example = insert;
        if (example.nodeType != 1) {
            example = example.previousElementSibling || example.parentNode;
            if (!example || example.nodeType != 1) return;
        }
        let exampleStyle = _unsafeWindow.getComputedStyle(example);
        let inTable, inLi;
        if (forceState == 2) {
            inTable = inLi = false;
        } else {
            inTable = compareNodeName(example.parentNode, ["table", "tbody"]) ||
            compareNodeName(example, ["tr", "tbody"]) ||
            exampleStyle.display == "table-row" ||
            (example.nextElementSibling && compareNodeName(example.nextElementSibling, ["tr", "tbody"]));
            inLi = compareNodeName(example, ["li"]) || (example.nextElementSibling && compareNodeName(example.nextElementSibling, ["li"]));
        }
        let pageBar = document.createElement(inTable ? "tr" : (inLi ? "li" : "div"));
        let upSpan = document.createElement("span");
        let downSpan = document.createElement("span");
        let pageText = document.createElement("a");
        let pageNum;
        pageBar.className = isHideBar ? "pagetual_pageBar hide" : "pagetual_pageBar";
        pageBar.id = "pagetual_pageBar" + curPage;
        pageBar.setAttribute("translate", "no");
        if (isPause) {
            pageBar.classList.add("stop");
        }
        pageBar.style.cssText = pageBarStyle;
        pageBar.title = i18n(isPause ? "enable" : "disable");
        upSpan.innerHTML = createHTML(upSvg);
        upSpan.children[0].style.cssText = upSvgCSS;
        upSpan.title = i18n("toTop");
        downSpan.innerHTML = createHTML(downSvg);
        downSpan.children[0].style.cssText = downSvgCSS;
        downSpan.title = i18n("toBottom");
        upSpan.style.cssText = initStyle;
        downSpan.style.cssText = initStyle;
        pageText.href = url;
        pageText.style.cssText = pageTextStyle;
        pageText.title = i18n("current");
        if (openInNewTab == 1) pageText.target = "_blank";
        pageBar.appendChild(upSpan);
        pageBar.appendChild(pageText);
        let touched = false;
        let touchBodyHandler = e => {
            touched = false;
            getBody(document).removeEventListener('touchstart', touchBodyHandler, { passive: false, capture: false });
        };
        pageText.addEventListener("touchstart", e => {
            if (touched) return;
            touched = true;
            pageText.style.pointerEvents = 'none';
            setTimeout(() => {
                pageText.style.pointerEvents = 'all';
            }, 250);
            getBody(document).addEventListener("touchstart", touchBodyHandler, { passive: false, capture: false });
        }, { passive: false, capture: false });
        if (ruleParser.nextTitle) {
            pageText.innerHTML = createHTML(ruleParser.nextTitle + " ");
            pageText.title = ruleParser.nextTitle;
        }
        if (ruleParser.curSiteRule.pageNum || pageNumReg.test(url)) {
            pageText.innerHTML = createHTML(pageText.innerHTML + i18n("page"));
            pageNum = document.createElement("span");
            let num = ruleParser.getPageNumFromUrl(url, curPage);
            pageNum.innerHTML = createHTML(num + "<i style='font-size: 0;'>&nbsp;</i>");
            pageNum.className = "pagetual_pageNum";
            pageNum.title = i18n("inputPageNum");
            pageNum.style.cssText = pageTextStyle;
            pageNum.style.cursor = "pointer";
            pageNum.style.color = "";
            pageNum.style.marginLeft = "5px";
            pageNum.addEventListener("click", e => {
                let pageInput = prompt(i18n("inputPageNum"), num || "1");
                if (pageInput) {
                    let localPageBar = document.querySelector("#pagetual_pageBar" + pageInput);
                    if (localPageBar) {
                        scrollToPageBar(localPageBar);
                    } else {
                        let pageLink = ruleParser.getLinkByPage(url, pageInput);
                        if (pageLink) {
                            _GM_openInTab(pageLink, {active:true});
                        }
                    }
                }
                e.preventDefault();
                e.stopPropagation();
            });
            pageBar.appendChild(pageNum);
        } else {
            pageText.innerHTML = createHTML(pageText.innerHTML + i18n("page") + curPage + "<i style='font-size: 0;'>&nbsp;</i>");
        }
        let preBtn = document.createElement("span");
        preBtn.innerHTML = createHTML("∧");
        preBtn.title = i18n("prevPage");
        preBtn.className = "prevScreen";
        preBtn.style.cssText = "display: none;text-align: center;right: unset; float: left; width: 40px; background: rgba(240, 240, 240, 0.8); position: absolute; z-index: 9999999; box-shadow: rgb(0 0 0 / 50%) 0px -5px 5px; border-radius: 20px 20px 0 0; margin-top: -30px; ";
        let nextBtn = document.createElement("span");
        nextBtn.innerHTML = createHTML("∨");
        nextBtn.title = i18n("nextPage");
        nextBtn.className = "nextScreen";
        nextBtn.style.cssText = "display: none;text-align: center;right: unset; float: left; width: 40px; background: rgba(240, 240, 240, 0.8); position: absolute; z-index: 9999999; box-shadow: rgb(0 0 0 / 50%) 0px 5px 5px; border-radius: 0 0 20px 20px; margin-top: 30px; ";
        let localPage = curPage;
        preBtn.addEventListener("click", e => {
            e.stopPropagation();
            e.preventDefault();
            let prePageBar = document.querySelector("#pagetual_pageBar" + (localPage - 1));
            if (prePageBar) {
                scrollToPageBar(prePageBar);
            } else {
                let scrollTop = getBody(document).scrollTop || document.documentElement.scrollTop;
                targetY = scrollTop - (window.innerHeight || document.documentElement.clientHeight);
                window.scrollTo({ top: targetY, behavior: 'smooth'});
            }
        });
        nextBtn.addEventListener("click", e => {
            e.stopPropagation();
            e.preventDefault();
            let nextPageBar = document.querySelector("#pagetual_pageBar" + (localPage + 1));
            if (nextPageBar) {
                scrollToPageBar(nextPageBar);
            } else {
                scrollH = Math.max(document.documentElement.scrollHeight, getBody(document).scrollHeight);
                targetY = scrollH || 9999999;
                window.scrollTo({ top: targetY, behavior: 'smooth'});
            }
        });
        if (!rulesData.hideBarArrow) {
            pageText.insertBefore(preBtn, pageText.firstChild);
            pageText.insertBefore(nextBtn, pageText.firstChild);
        }
        if (curForceIframe) {
            let bgRing = document.createElement("span");
            bgRing.className = "refreshRing";
            bgRing.style.display = "none";
            bgRing.innerHTML = createHTML(upSvg);
            pageText.title = "Refresh";
            pageText.appendChild(bgRing);
            pageText.addEventListener("click", e => {
                e.stopPropagation();
                if (e.ctrlKey || e.altKey || e.shiftKey || e.metaKey) return;
                e.preventDefault();
                let nextEle = pageBar && pageBar.nextElementSibling;
                if (nextEle && nextEle.name == 'pagetual-iframe') {
                    if (curForceIframe == nextEle) {
                        nextEle.setAttribute("loaded", "refresh");
                    }
                    nextEle.src = nextEle.src;
                }
            });
        } else if (rulesData.pageBarMenu) {
            pageText.addEventListener("click", e => {
                e.stopPropagation();
                if (e.ctrlKey || e.altKey || e.shiftKey || e.metaKey) return;
                e.preventDefault();
                picker.start();
            });
        }
        pageBar.appendChild(downSpan);
        if (forceState == 2) {
            pageBar.style.width = "99%";
        } else {
            let parentStyle = _unsafeWindow.getComputedStyle(example.parentNode);
            let parentWidth = example.parentNode.offsetWidth || parseInt(parentStyle.width);
            pageBar.style.width = parentWidth - parseInt(parentStyle.paddingLeft) - parseInt(parentStyle.paddingRight) - 10 + "px";
            pageBar.style.margin = '10px 5px';
            if (parentStyle.display == "grid" || parentStyle.display == "inline-grid") {
                pageBar.style.gridColumn = "1/-1";
            }
            if (inTable) {
                example = compareNodeName(example, ["tr", "tbody"]) ? example : example.nextElementSibling || example;
                if (compareNodeName(example, ["tbody"])) example = example.querySelector("tr");
                let nextTr = example;
                while (nextTr && nextTr.children.length == 0) nextTr = nextTr.nextElementSibling;
                if (nextTr) example = nextTr;
                let tdNum = 0;
                if (exampleStyle.display == "table-row") {
                    [].forEach.call(example.children, el => {
                        tdNum += el.colSpan || 1;
                    });
                } else {
                    [].forEach.call(example.children, el => {
                        if (compareNodeName(el, ["td", "th"])) {
                            tdNum += el.colSpan || 1;
                        }
                    });
                }
                pageBar.style.cssText = "";
                pageBar.style.display = "table-row";
                pageBar.style.backgroundColor = "unset";
                pageBar.style.lineHeight = "20px";
                pageBar.style.boxShadow = "";
                let td = document.createElement("td");
                td.colSpan = tdNum || 1;
                let inTd = document.createElement("div");
                inTd.style.cssText = pageBarStyle;
                inTd.style.display = "";
                inTd.className = pageBar.className;
                pageBar.className = "";
                inTd.appendChild(upSpan);
                inTd.appendChild(pageText);
                if (pageNum) inTd.appendChild(pageNum);
                inTd.appendChild(downSpan);
                td.appendChild(inTd);
                pageBar.appendChild(td);
            } else if (inLi) {
                example = compareNodeName(example, ["li"]) ? example : example.nextElementSibling || example;
                pageBar.style.opacity = 1;
                pageBar.style.display = getComputedStyle(example).display;
                pageBar.style.backgroundColor = "unset";
                pageBar.style.lineHeight = "20px";
                pageBar.style.boxShadow = "";
                pageBar.style.border = "";
                pageBar.style.maxWidth = "unset";
                pageBar.style.flex = "auto";
                let inTd = document.createElement("div");
                inTd.style.cssText = pageBarStyle;
                inTd.style.display = "";
                inTd.style.margin = "0"
                inTd.style.padding = "0 0";
                inTd.style.textAlign = "center";
                inTd.style.minWidth = "150px";
                inTd.style.width = 'calc(100% - 20px)';
                inTd.className = pageBar.className;
                pageBar.className = "";
                inTd.appendChild(upSpan);
                inTd.appendChild(pageText);
                if (pageNum) inTd.appendChild(pageNum);
                inTd.appendChild(downSpan);
                if (pageBar.style.display === 'table-row') {
                    let td = document.createElement("td");
                    td.colSpan = example.children.length;
                    td.style.width = '100%';
                    td.appendChild(inTd);
                    pageBar.appendChild(td);
                } else {
                    inTd.style.width = '100%';
                    pageBar.appendChild(inTd);
                }
            }
        }

        upSpan.addEventListener("click", e => {
            getBody(document).scrollTop = 0;
            document.documentElement.scrollTop = 0;
            e.preventDefault();
            e.stopPropagation();
        });
        downSpan.addEventListener("click", e => {
            if (!e.altKey && !e.ctrlKey && !e.shiftKey && !e.metaKey) {
                changeStop(true);
            }
            pageBar.title = i18n(isPause ? "enable" : "disable");
            scrollH=Math.max(document.documentElement.scrollHeight, getBody(document).scrollHeight);
            getBody(document).scrollTop = scrollH || 9999999;
            document.documentElement.scrollTop = scrollH || 9999999;
            e.preventDefault();
            e.stopPropagation();
        });
        pageBar.addEventListener("click", e => {
            changeStop(!isPause);
            pageBar.title = i18n(isPause ? "enable" : "disable");
        });
        ruleParser.insertElement(pageBar);
        ruleParser.runPageBar(pageBar);

        return pageBar;
    }

    async function waitForElement(sel, doc) {
        if (!sel) return null;
        return new Promise((resolve) => {
            let checkInv = setInterval(() => {
                let result = getElement(sel, doc, null, true);
                if (result) {
                    clearInterval(checkInv);
                    resolve(result);
                }
            }, 100);
        });
    }

    async function clickAction(sel, doc) {
        let btn = await waitForElement(sel, doc);
        emuClick(btn, doc);
    }

    async function enterAction(sel, doc) {
        let btn = await waitForElement(sel, doc);
        let eventParam = { key: "Enter", keyCode: 13, bubbles: true };
        let event = new KeyboardEvent('keydown', eventParam);
        btn.dispatchEvent(event);
        event = new KeyboardEvent('keyup', eventParam);
        btn.dispatchEvent(event);
        event = new KeyboardEvent('keypress', eventParam);
        btn.dispatchEvent(event);
    }

    async function inputAction(sel, v, doc) {
        let input = await waitForElement(sel, doc);
        let event = new Event('focus', { bubbles: true });
        input.dispatchEvent(event);
        let lastValue = input.value;
        if (input.nodeName.toUpperCase() == "INPUT") {
            var nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
            nativeInputValueSetter.call(input, v);
        } else if (input.nodeName.toUpperCase() == "TEXTAREA") {
            var nativeTextareaValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
            nativeTextareaValueSetter.call(input, v);
        } else {
            input.innerHTML = createHTML(v);
        }
        event = new Event('input', { bubbles: true });
        let tracker = input._valueTracker;
        if (tracker) {
            tracker.setValue(lastValue);
        }
        input.dispatchEvent(event);
        event = new Event('change', { bubbles: true });
        input.dispatchEvent(event);
        debug(input, `input ${sel}`);
    }

    function emuClick(btn, doc) {
        if (!doc) doc = document;
        let curScroll = getBody(doc).scrollTop || doc.documentElement.scrollTop;
        let orgHref = btn.getAttribute('href');
        if (orgHref && orgHref.replace(location.origin + location.pathname, "").indexOf("#") === 0) {
            let hashAction = e => {
                e.preventDefault();
                getBody(doc).scrollTop = curScroll;
                doc.documentElement.scrollTop = curScroll;
                btn.removeEventListener('click', hashAction, false);
            };
            btn.addEventListener('click', hashAction, false);
        }
        if (!PointerEvent) return btn.click();
        let eventParam = {
            isTrusted: true,
            altKey: false,
            azimuthAngle: 0,
            bubbles: true,
            button: 0,
            buttons: 0,
            clientX: 1,
            clientY: 1,
            cancelBubble: false,
            cancelable: true,
            composed: true,
            ctrlKey: false,
            defaultPrevented: false,
            detail: 1,
            eventPhase: 2,
            fromElement: null,
            height: 1,
            isPrimary: false,
            metaKey: false,
            pointerId: 1,
            pointerType: "mouse",
            pressure: 0,
            relatedTarget: null,
            returnValue: true,
            shiftKey: false,
            toElement: null,
            twist: 0,
            which: 1
        };
        let mouseEvent = new PointerEvent("mousedown", eventParam);
        btn.dispatchEvent(mouseEvent);
        mouseEvent = new PointerEvent("mouseup", eventParam);
        btn.dispatchEvent(mouseEvent);
        let dispatchTouchEvent = (ele, type) => {
            let touchEvent;
            try {
                touchEvent = document.createEvent('TouchEvent')
                touchEvent.initTouchEvent(type, true, true)
            } catch (err) {
                try {
                    touchEvent = document.createEvent('UIEvent')
                    touchEvent.initUIEvent(type, true, true)
                } catch (err) {
                    touchEvent = document.createEvent('Event')
                    touchEvent.initEvent(type, true, true)
                }
            }
            if (touchEvent) {
                try {
                    touchEvent.targetTouches = [{
                        pageX: 1,
                        pageY: 1,
                        clientX: 1,
                        clientY: 1,
                        target: btn
                    }];
                    touchEvent.touches = [{
                        pageX: 1,
                        pageY: 1,
                        clientX: 1,
                        clientY: 1,
                        target: btn
                    }];
                    touchEvent.changedTouches = [{
                        pageX: 1,
                        pageY: 1,
                        clientX: 1,
                        clientY: 1,
                        target: btn
                    }];
                } catch (err) {}
                ele.dispatchEvent(touchEvent);
            }
        }
        dispatchTouchEvent(btn, "touchstart");
        dispatchTouchEvent(btn, "touchend");

        btn.click();
    }

    function emuInput(input, v) {
        let result = false;
        if (!input) return true;
        let event = new Event('focus', { bubbles: true });
        input.dispatchEvent(event);
        let lastValue = input.value;
        if (input.type == 'file') {
            let file = v;
            let blob = new Blob([file], {
                type: 'text/plain'
            });
            file = new File([blob], 'noname.txt', { type: blob.type });
            let dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            input.files = dataTransfer.files;
            v = "c:/fakepath/fakefile";
        } else if (/INPUT/i.test(input.nodeName)) {
            var nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
            nativeInputValueSetter.call(input, v);
        } else if (/SELECT/i.test(input.nodeName)) {
            var nativeSelectValueSetter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, "value").set;
            nativeSelectValueSetter.call(input, v);
        } else if (input.nodeName.toUpperCase() == "TEXTAREA") {
            var nativeTextareaValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
            nativeTextareaValueSetter.call(input, v);
        } else {
            input.innerHTML = createHTML(v);
        }
        event = new Event('input', { bubbles: true });
        let tracker = input._valueTracker;
        if (tracker) {
            tracker.setValue(lastValue);
        }
        input.dispatchEvent(event);
        event = new Event('change', { bubbles: true });
        input.dispatchEvent(event);
        return result;
    }

    var failFromIframe = 0;
    var inCors = false;
    var checkRemoveIntv;
    function requestFromIframe(url, callback){
        if (location.protocol === 'https:' && !/^https:/.test(url)) {
            ruleParser.noValidContent(url);
        }
        url = url.indexOf('=') == -1 ? url.replace(/#[^#]*/,"") : url;
        let iframe = document.createElement('iframe');
        iframe.name = 'pagetual-iframe';
        iframe.width = '100%';
        iframe.height = '1000';
        iframe.frameBorder = '0';
        if (ruleParser.curSiteRule.sandbox != false) {
            iframe.sandbox = "allow-same-origin allow-scripts allow-popups allow-forms";
        }
        iframe.style.cssText = 'margin:0!important;padding:0!important;visibility:hidden!important;flex:0;opacity:0!important;pointer-events:none!important;position:fixed;top:0px;left:0px;z-index:-2147483647;';
        let waitTime = 100, checkEval;
        ruleParser.runWait((_checkEval, _waitTime) => {
            if (_checkEval) {
                checkEval = _checkEval;
            }
            if (_waitTime) {
                waitTime = _waitTime;
            }
        });
        if (checkRemoveIntv) clearInterval(checkRemoveIntv);
        checkRemoveIntv = setInterval(() => {
            if (!iframe || !getBody(document).contains(iframe)) {
                clearInterval(checkRemoveIntv);
                loadPageOver();
            }
        }, 500);
        let loadedHandler = async e => {
            if (e.data != 'pagetual-iframe:DOMLoaded' && e.type != 'load') return;
            clearInterval(checkRemoveIntv);
            window.removeEventListener('message', loadedHandler, false);
            iframe.removeEventListener('load', loadedHandler, false);
            let pageEleTryTimes = 0;
            async function checkIframe() {
                if (urlChanged || isPause) {
                    return callback(false, false);
                }
                try {
                    let doc = iframe.contentDocument || iframe.contentWindow.document;
                    let base = doc.querySelector("base");
                    ruleParser.basePath = base ? base.href : url;
                    let eles = ruleParser.getPageElement(doc, iframe.contentWindow, pageEleTryTimes < 25);
                    if (checkEval && !checkEval(doc)) {
                        setTimeout(() => {
                            checkIframe();
                        }, waitTime);
                        return;
                    } else if (eles && eles.length > 0) {
                        await ruleParser.hookUrl(doc);
                        callback(doc, eles);
                    } else if (pageEleTryTimes++ < 100) {
                        getBody(doc).scrollTop = 9999999;
                        doc.documentElement.scrollTop = 9999999;
                        setTimeout(() => {
                            checkIframe();
                        }, waitTime);
                        return;
                    } else {
                        if (failFromIframe++ > 2) {
                            failFromIframe = 0;
                            debug("Stop as failFromIframe");
                            changeStop(true);
                            callback(false, false);
                        } else {
                            ruleParser.noValidContent(url);
                            callback(false, false);
                        }
                    }
                } catch(e) {
                    inCors = true;
                    if (forceState === 3) {
                        debug("Stop as cors");
                        isPause = true;
                    }
                    if (!ruleParser.curSiteRule.pageElement) {
                        ruleParser.curSiteRule.pageElement = allOfBody;
                        ruleParser.getInsert(true);
                    }
                    ruleParser.curSiteRule.action = 0;
                    ruleParser.nextLinkHref = url;
                    callback(false, false);
                    nextPage();
                }
                if (iframe && iframe.parentNode) iframe.parentNode.removeChild(iframe);
            }
            setTimeout(() => {
                checkIframe();
            }, waitTime);
        };
        let code = ruleParser.curSiteRule.iframeInit;
        if (code) {
            let checkReady = setInterval(() => {
                let doc;
                try {
                    doc = iframe.contentDocument || (iframe.contentWindow && iframe.contentWindow.document);
                } catch(e) {
                    clearInterval(checkReady);
                    return;
                }
                if (doc) {
                    clearInterval(checkReady);
                    try {
                        Function('win', 'iframe', '"use strict";' + code)(iframe.contentWindow, iframe);
                    } catch(e) {
                        debug(e);
                    }
                }
            }, 50);
        }
        window.addEventListener('message', loadedHandler, false);
        iframe.addEventListener('load', loadedHandler, false);
        iframe.src = url;
        try {
            getBody(document).appendChild(iframe);
        } catch (e) {
            return callback(false, false);
        }
    }

    var emuIframe, lastActiveUrl, orgContent, meetCors = false;
    function emuPage(callback) {
        let orgPage = null, preContent = null, iframeDoc, checkTimes = 0, loadmoreBtn, pageEle, nextLink, loadmoreEnd = false, waitTimes = 80, changed = false;
        function returnFalse(log) {
            if (curPage > 1) {
                if (rulesData.lastPageTips) showTips(i18n("lastPage"), "", 800);
            } else {
                sideController.remove();
            }
            debug(log);
            isPause = true;
            callback(false, false);
            if (emuIframe && emuIframe.parentNode) {
                emuIframe.parentNode.removeChild(emuIframe);
                emuIframe = null;
            }
        }
        function cloneStatus() {
            if (!iframeDoc) return;
            let inputs = document.querySelectorAll("input:not([type=button],[type=image],[type=reset],[type=submit])");
            let selectOptions = document.querySelectorAll("select>option");
            [...inputs].forEach(input => {
                let sel = geneSelector(input, true, true);
                let mirrorEle = iframeDoc.querySelector(sel);
                if (!mirrorEle) return;
                emuInput(mirrorEle, input.value);
            });
            [...selectOptions].forEach(option => {
                let sel = geneSelector(option, true, true);
                let mirrorEle = iframeDoc.querySelector(sel);
                if (!mirrorEle) return;
                let selected = option.selected;
                mirrorEle.selected = !!selected;
                mirrorEle.parentNode.dispatchEvent(new Event('change'));
            });
        }
        async function checkPage() {
            if (isPause) return loadPageOver();
            try {
                iframeDoc = emuIframe.contentDocument || emuIframe.contentWindow.document;
            } catch(e) {
                returnFalse("Stop as cors");
                return;
            }

            let waitTime = 200, checkEval;
            ruleParser.runWait((_checkEval, _waitTime) => {
                if (_checkEval) {
                    checkEval = _checkEval;
                }
                if (_waitTime) {
                    waitTime = _waitTime;
                }
            });

            if (!orgPage) {
                if (!loadmoreEnd) {
                    loadmoreBtn = getLoadMore(iframeDoc);
                    if (loadmoreBtn && isVisible(loadmoreBtn, emuIframe.contentWindow)) {
                        emuClick(loadmoreBtn, iframeDoc);
                        let intv = setInterval(() => {
                            loadmoreBtn = getLoadMore(iframeDoc);
                            if (!loadmoreBtn || !getBody(document).contains(loadmoreBtn) || !isVisible(loadmoreBtn, emuIframe.contentWindow)) {
                                clearInterval(intv);
                                loadmoreEnd = true;
                                setTimeout(() => {
                                    checkPage();
                                }, 500);
                            } else if (isInViewPort(loadmoreBtn)) {
                                emuClick(loadmoreBtn, iframeDoc);
                            }
                        }, 200);
                        return;
                    } else {
                        loadmoreEnd = true;
                    }
                }
                if (checkEval && !checkEval(iframeDoc)) {
                    waitTimes = 50;
                    setTimeout(() => {
                        checkPage();
                    }, waitTime);
                    return;
                } else {
                    if (!nextLink || !nextLink.offsetParent) nextLink = await ruleParser.getNextLink(iframeDoc, true);
                    if (nextLink) pageEle = ruleParser.getPageElement(iframeDoc, emuIframe.contentWindow, true);
                    if (!pageEle || pageEle.length == 0 || !nextLink) {
                        getBody(iframeDoc).scrollTop = 9999999;
                        iframeDoc.documentElement.scrollTop = 9999999;
                        if (waitTimes-- > 0) {
                            setTimeout(() => {
                                checkPage();
                            }, waitTime);
                            return;
                        }
                    }
                }
                if (!pageEle || pageEle.length == 0) {
                    returnFalse("Stop as no page when emu");
                    return;
                }
                pageEle = [].filter.call(pageEle, ele => {return ele && !compareNodeName(ele, ["style", "script", "meta"])});
                if (compareNodeName(pageEle[0], ["ul"]) || pageEle.length == 1) pageEle = pageEle[0];
                else if (pageEle[0].parentNode == pageEle[1].parentNode) {
                    pageEle = pageEle[0].parentNode;
                } else {
                    pageEle = pageEle[0];
                }
                if (ruleParser.curSiteRule.smart && orgContent != pageEle.innerHTML) {
                    orgContent = pageEle.innerHTML;
                    if (waitTimes-- > 0) {
                        setTimeout(() => {
                            checkPage();
                        }, 500);
                        return;
                    }
                }
                orgPage = pageEle;
                if (nextLink) {
                    if (compareNodeName(orgPage, ["img"])) {
                        if (!ruleParser.curSiteRule.lazyImgSrc) ruleParser.curSiteRule.lazyImgSrc = "0";
                        if (orgPage.src) {
                            orgContent = orgPage.src;
                        } else {
                            setTimeout(() => {
                                checkPage();
                            }, 500);
                            return;
                        }
                    } else {
                        orgContent = orgPage.innerHTML;
                    }
                    preContent = orgContent;
                    if (!isVisible(nextLink, emuIframe.contentWindow)) {
                        returnFalse("Stop as next hide when emu");
                    } else {
                        emuClick(nextLink, iframeDoc);
                        setTimeout(() => {
                            checkPage();
                        }, 500);
                    }
                } else {
                    returnFalse("Stop as no next when emu");
                }
                return;
            }
            if (!ruleParser.checkStopSign(nextLink, iframeDoc)) {
                return returnFalse("Stop as stopSign");
            }
            if (checkTimes++ > 200) {
                returnFalse("Stop as timeout when emu");
                return;
            }
            let eles = ruleParser.getPageElement(iframeDoc, emuIframe.contentWindow, true), checkItem;
            if (eles && eles.length > 0) {
                eles = [].filter.call(eles, ele => {return ele && !compareNodeName(ele, ["style", "script", "meta"])});
                if (compareNodeName(eles[0], ["ul"]) || eles.length == 1) checkItem = eles[0];
                else if (eles[0].parentNode == eles[1].parentNode) {
                    checkItem = eles[0].parentNode;
                } else {
                    checkItem = eles[0];
                }
            }
            if (!checkItem || (checkEval && !checkEval(iframeDoc))) {
                if (checkEval) checkTimes = 0;
                setTimeout(() => {
                    checkPage();
                }, waitTime);
            } else {
                let checkInner;
                if (compareNodeName(checkItem, ["img"])) {
                    if (checkItem.src) {
                        checkInner = checkItem.src;
                    } else {
                        setTimeout(() => {
                            checkPage();
                        }, waitTime);
                        return;
                    }
                } else {
                    checkInner = checkItem.innerHTML;
                }
                if (orgPage != checkItem || checkInner != preContent) {
                    changed = true;
                    orgPage = checkItem;
                    preContent = checkInner;
                    setTimeout(() => {
                        checkPage();
                    }, 500);
                } else if (changed) {
                    checkTimes = 0;
                    if (orgContent == preContent && (ruleParser.curSiteRule.smart || ruleParser.curSiteRule.stopSame)) {
                        returnFalse("Stop as same content");
                    } else {
                        orgContent = preContent;
                        await ruleParser.hookUrl(iframeDoc);
                        callback(iframeDoc, eles);
                    }
                } else {
                    if (checkTimes % 10 === 5) {
                        if (!nextLink || !nextLink.offsetParent) {
                            nextLink = await ruleParser.getNextLink(iframeDoc, true);
                        }
                        if (nextLink) {
                            emuClick(nextLink, iframeDoc);
                        }
                    }
                    setTimeout(() => {
                        checkPage();
                    }, waitTime);
                }
            }
        }
        if (!emuIframe) {
            let loaded = false;
            emuIframe = document.createElement('iframe');
            emuIframe.name = 'pagetual-iframe';
            let notSetSandbox = typeof ruleParser.curSiteRule.sandbox == 'undefined';
            if (notSetSandbox || ruleParser.curSiteRule.sandbox == true) {
                emuIframe.sandbox = "allow-same-origin allow-scripts allow-popups allow-forms";
            } else if (ruleParser.curSiteRule.sandbox) {
                emuIframe.sandbox = ruleParser.curSiteRule.sandbox;
            }
            emuIframe.width = '100%';
            emuIframe.height = '100%';
            emuIframe.frameBorder = '0';
            emuIframe.style.cssText = 'margin:0!important;padding:0!important;flex:0;opacity:0!important;pointer-events:none!important;position:fixed;top:0px;left:0px;z-index:-2147483647;';
            emuIframe.addEventListener("load", e => {
                try {
                    iframeDoc = emuIframe.contentDocument || emuIframe.contentWindow.document;
                } catch(e) {
                    if (e.message && e.message.indexOf("cross-origin") != -1 && notSetSandbox && emuIframe.hasAttribute("sandbox")) {
                        emuIframe.removeAttribute("sandbox");
                        meetCors = true;
                        callback(false, false);
                        if (ruleParser.curSiteRule.smart) {
                            ruleParser.findNoNext();
                        }
                    } else {
                        returnFalse("Stop as cors");
                    }
                    return;
                }
                setTimeout(async () => {
                    if (meetCors && ruleParser.curSiteRule.smart) {
                        ruleParser.smartRules = ruleParser.smartRules.filter(item => {return item && item.url !== ruleParser.curSiteRule.url;});
                        storage.setItem("smartRules", ruleParser.smartRules);
                    }
                    meetCors = false;
                    let code = ruleParser.curSiteRule.init;
                    if (code) {
                        try {
                            await new AsyncFunction('doc','win','iframe','click', 'enter', 'input', 'sleep', '"use strict";' + code)(iframeDoc, emuIframe.contentWindow, emuIframe, async sel => {await clickAction(sel, iframeDoc)}, async sel => {await enterAction(sel, iframeDoc)}, async (sel, v) =>{await inputAction(sel, v, iframeDoc)}, async time => {await sleep(time)});
                        } catch(e) {
                            debug(e);
                        }
                    } else {
                        let refreshByClickSel = ruleParser.curSiteRule.refreshByClick;
                        if (iframeDoc && refreshByClickSel) {
                            let clickBtn = await waitForElement(refreshByClickSel, iframeDoc);
                            await sleep(500);
                            cloneStatus();
                            emuClick(clickBtn, iframeDoc);
                            await sleep(500);
                        }
                    }
                    if (loaded) return;
                    loaded = true;
                    checkPage();
                }, 500);
            });
            let code = ruleParser.curSiteRule.iframeInit;
            if (code) {
                let checkReady = setInterval(() => {
                    try {
                        iframeDoc = emuIframe.contentDocument || (emuIframe.contentWindow && emuIframe.contentWindow.document);
                    } catch(e) {
                        clearInterval(checkReady);
                        return;
                    }
                    if (iframeDoc) {
                        clearInterval(checkReady);
                        try {
                            Function('win', 'iframe', '"use strict";' + code)(emuIframe.contentWindow, emuIframe);
                        } catch(e) {
                            debug(e);
                        }
                    }
                }, 50);
            }
            if (!lastActiveUrl) lastActiveUrl = location.href;
            emuIframe.src = lastActiveUrl;
            getBody(document).appendChild(emuIframe);
        } else {
            if (emuIframe.src != lastActiveUrl || meetCors) {
                emuIframe.src = lastActiveUrl;
                return;
            }
            checkPage();
        }
    }

    var scrollToResizeInited = false;
    var resizePool = [];
    var scrollingToResize = false;

    function isTouchViewPort(element) {
        const viewWidth = window.innerWidth || document.documentElement.clientWidth;
        const viewHeight = window.innerHeight || document.documentElement.clientHeight;
        const {
            top,
            right,
            bottom,
            left,
        } = element.getBoundingClientRect();

        return (
            top < viewHeight &&
            left < viewWidth &&
            right > 0 &&
            bottom > 0
        );
    }

    function resizeIframe(iframe, frameDoc, pageEle) {
        if (targetY >= 0) {
            window.scrollTo({ top: targetY, behavior: 'instant'});
            targetY = -1;
        }
        let curScroll = getBody(document).scrollTop || document.documentElement.scrollTop;
        if (ruleParser.curSiteRule.smart || forceState === 2) {
            let height = (getBody(frameDoc).scrollHeight || getBody(frameDoc).offsetHeight || 500);
            if (!iframe.style.height || height - parseInt(iframe.style.height) > window.innerHeight) {
                iframe.style.height = height + "px";
                iframe.style.minHeight = iframe.style.height;
            }
            iframe.style.width = "100%";
            frameDoc.documentElement.scrollTop = 0;
            frameDoc.documentElement.scrollLeft = 0;
        } else {
            if (pageEle) {
                if (document.body.scrollWidth) frameDoc.documentElement.style.width = document.body.scrollWidth + "px";
                let fitWidth = ruleParser.curSiteRule.fitWidth !== false;
                let targetElement = pageEle[0];
                if (!targetElement) return;
                if (pageEle.length > 1) {
                    targetElement = targetElement.parentNode;
                }
                let scrollHeight = targetElement.scrollHeight || targetElement.offsetHeight || 500;
                iframe.style.height = scrollHeight + "px";
                let scrollTop = 0, scrollLeft = 0;
                getBody(frameDoc).scrollTop = 0;
                getBody(frameDoc).scrollLeft = 0;
                while (targetElement && targetElement.offsetParent) {
                    targetElement.offsetParent.scrollTop = targetElement.offsetTop;
                    if (targetElement.offsetParent.scrollTop == 0) {
                        scrollTop += targetElement.offsetTop;
                    }
                    if (fitWidth) {
                        targetElement.offsetParent.scrollLeft = targetElement.offsetLeft;
                        if (targetElement.offsetParent.scrollLeft == 0) {
                            scrollLeft += targetElement.offsetLeft;
                        }
                    }
                    targetElement = targetElement.offsetParent;
                }
                frameDoc.documentElement.scrollTop = scrollTop;
                frameDoc.documentElement.scrollLeft = scrollLeft;
                if (frameDoc.documentElement.scrollTop == 0 && frameDoc.documentElement.scrollLeft == 0) {
                    getBody(frameDoc).scrollTop += scrollTop;
                    getBody(frameDoc).scrollLeft += scrollLeft;
                }
                if (!fitWidth && iframe.style.marginLeft == '0px') {
                    iframe.style.width = "100vw";
                    iframe.style.maxWidth = "100vw";
                    iframe.style.minWidth = "100vw";
                    var cWidth = document.body.clientWidth || document.documentElement.clientWidth;
                    var iWidth = window.innerWidth;
                    iframe.style.marginLeft = -iframe.getBoundingClientRect().left - (iWidth - cWidth) / 2 + "px";
                }
            }
        }
        let newScroll = getBody(document).scrollTop || document.documentElement.scrollTop;
        if (newScroll != curScroll) {
            getBody(document).scrollTop = curScroll;
            document.documentElement.scrollTop = curScroll;
        }
    }

    function scrollToResize(e) {
        if (scrollingToResize) return;
        else {
            scrollingToResize = true;
            let resizeHandler = () => {
                let touched = 0;
                for (let i = 0; i < resizePool.length; i++) {
                    let resizeArr = resizePool[i];
                    let iframe = resizeArr[1]();
                    if (isTouchViewPort(iframe)) {
                        touched++;
                        let pageEle = resizeArr[0]();
                        let frameDoc = resizeArr[2]();
                        resizeIframe(iframe, frameDoc, pageEle);
                    } else if (touched) {
                        if (touched == 1) {
                            let pageEle = resizeArr[0]();
                            let frameDoc = resizeArr[2]();
                            resizeIframe(iframe, frameDoc, pageEle);
                        }
                        break;
                    } else if (!iframe.parentNode) {
                        resizePool.splice(i, 1);
                        break;
                    }
                }
            };
            setTimeout(() => {
                scrollingToResize = false;
            }, 300);
            resizeHandler();
        }
    }

    var curForceIframe;
    function forceIframe(url, callback) {
        url = url.indexOf('=') == -1 ? url.replace(/#[^#]*/,"") : url;
        let curIframe = document.createElement('iframe'), iframeDoc, pageElement = null, inAction = true;
        let loadedHandler = () => {
            let getPageEle = () => {
                if (ruleParser.curSiteRule.smart) {
                    return null;
                } else {
                    if (!pageElement || pageElement.length === 0 || !pageElement[0].offsetParent) {
                        pageElement = ruleParser.getPageElement(iframeDoc, curIframe.contentWindow);
                    }
                    return pageElement;
                }
            };
            resizeIframe(curIframe, iframeDoc, getPageEle());
            let loaded = curIframe.getAttribute("loaded");
            if (loaded == "true") {
                return;
            }
            curIframe.setAttribute("loaded", "true");
            let getIframe = () => {
                return curIframe;
            };
            let getFrameDoc = () => {
                return iframeDoc;
            };
            ruleParser.insertPage(iframeDoc, [], url, ele => {
                callback(curIframe, loaded == "refresh");
                inAction = false;
            }, true);
            if (!loaded) {
                resizePool.push([getPageEle, getIframe, getFrameDoc]);
            }
        };
        let checkIframeTimer = setInterval(() => {
            if (!curIframe.parentNode) {
                clearInterval(checkIframeTimer);
                return curIframe.getAttribute("loaded") == "true" || callback(false);
            }
        }, 500);
        let code = ruleParser.curSiteRule.iframeInit;
        if (code) {
            let checkReady = setInterval(() => {
                try {
                    iframeDoc = curIframe.contentDocument || (curIframe.contentWindow && curIframe.contentWindow.document);
                } catch(e) {
                    clearInterval(checkReady);
                    return;
                }
                if (iframeDoc) {
                    clearInterval(checkReady);
                    try {
                        Function('win', 'iframe', '"use strict";' + code)(curIframe.contentWindow, curIframe);
                    } catch(e) {
                        debug(e);
                    }
                }
            }, 50);
        }
        curIframe.name = 'pagetual-iframe';
        curIframe.sandbox = "allow-same-origin allow-scripts allow-popups allow-forms";
        curIframe.frameBorder = '0';
        curIframe.scrolling = "no";
        curIframe.style.cssText = 'display: block; visibility: visible; float: none; clear: both; width: 100%; height: 0; background: initial; border: 0px; border-radius: 0px; margin: 0px; padding: 0px; z-index: 2147483645;content-visibility: auto;contain-intrinsic-size: auto 300px;';
        curIframe.addEventListener("load", async e => {
            clearInterval(checkIframeTimer);
            if (isPause) return callback(false);
            try {
                iframeDoc = curIframe.contentDocument || curIframe.contentWindow.document;
            } catch(e) {
                debug("Stop as cors");
                isPause = true;
                callback(false);
                return;
            }
            let css = ruleParser.curSiteRule.css || rulesData.customCss;
            if (css) {
                let cssArr = css.split("inIframe:");
                if (cssArr && cssArr.length > 1) {
                    let styleEle = iframeDoc.createElement("style");
                    styleEle.innerHTML = cssArr[1];
                    iframeDoc.head.appendChild(styleEle);
                }
            }
            loadedHandler();
            iframeDoc.addEventListener('wheel', e => {
                document.dispatchEvent(new Event('wheel'));
            }, true);
        });
        let checkTimes = 0, findPageEle = false;
        let forceRefresh = e => {
            if (inAction || !iframeDoc) return;
            inAction = true;
            let foundNext = () => {
                document.removeEventListener("scroll", forceRefresh);
            }
            setTimeout(async () => {
                inAction = false;
                if (!ruleParser.nextLinkHref && !isPause) {
                    checkTimes++;
                    await ruleParser.getNextLink(iframeDoc, true);
                    if (ruleParser.nextLinkHref) {
                        foundNext();
                        if (isLoading) isLoading = false;
                    } else if (checkTimes >= 10) {
                        foundNext();
                    } else if (checkTimes >= 3 && !findPageEle) {
                        if (!pageElement) pageElement = ruleParser.getPageElement(iframeDoc, curIframe.contentWindow);
                        if (!pageElement) {
                            inAction = true;
                            curIframe.contentWindow.location.reload();
                        } else {
                            findPageEle = true;
                        }
                    }
                } else {
                    foundNext();
                }
            }, 100);
        };
        document.addEventListener("scroll", forceRefresh);
        curIframe.src = url;
        curForceIframe = curIframe;
        let insert = ruleParser.getInsert();
        let body = getBody(document);
        let curScroll = body.scrollTop || document.documentElement.scrollTop;
        if (forceState == 2) {
            document.documentElement.appendChild(loadingDiv);
            body.appendChild(curIframe);
            let bodyStyle = getComputedStyle(body);
            if (bodyStyle.display == "flex" || bodyStyle.display == "inline-flex") {
                body.style.flexDirection = "column";
            }
        } else {
            ruleParser.insertElement(curIframe);
        }
        body.scrollTop = curScroll;
        document.documentElement.scrollTop = curScroll;

        if (!scrollToResizeInited) {
            scrollToResizeInited = true;
            document.addEventListener("scroll", scrollToResize);
        }
        return curIframe;
    }

    function loadPageOver() {
        isLoading = false;
        stopScroll = true;
        setTimeout(() => {stopScroll = false;}, 300);
        if (loadingDiv.parentNode) {
            loadingDiv.parentNode.removeChild(loadingDiv);
        }
        if (rate !== 1 && !clickMode) {
            setTimeout(() => {
                if (distToBottom() < bottomGap) {
                    nextPage();
                }
            }, 1);
        }
    }

    function checkAutoLoadNum() {
        if (autoLoadNum >= 0) {
            if (autoLoadNum !== 0 && --autoLoadNum === 0) {
                autoLoadNum = -1;
            } else {
                setTimeout(() => nextPage(), 1);
            }
        }
    }

    async function nextPage() {
        if (isPause || isLoading || forceState === 1) return;
        if (ruleParser.curSiteRule.delay) {
            try {
                let checkDelay = ((typeof ruleParser.curSiteRule.delay === 'function') ? ruleParser.curSiteRule.delay : Function('"use strict";' + ruleParser.curSiteRule.delay))();
                if (!checkDelay) return;
            } catch(e) {
                debug(e);
            }
        }
        let nextLink = ruleParser.nextLinkHref;
        if (!nextLink) {
            isLoading = true;
            if (curPage === 1) {
                await ruleParser.getNextLink(document, true);
                nextLink = ruleParser.nextLinkHref;
            }
            if (!nextLink) {
                if (curPage === 1) {
                    if (ruleParser.curSiteRule.pinUrl) {
                        setTimeout(() => {isLoading = false;}, 500);
                    } else if (tryTimes++ < 3) {
                        setTimeout(() => {isLoading = false;}, 1000);
                    } else {
                        ruleParser.findNoNext();
                    }
                } else if (rulesData.lastPageTips && !showedLastPageTips) {
                    showTips(i18n("lastPage"), "", 800);
                    showedLastPageTips = true;
                }
                return;
            }
            isLoading = false;
        }
        showedLastPageTips = false;
        let pvGallery = document.querySelector("span.pv-gallery-container");
        if (pvGallery && pvGallery.style.display !== "none") return;
        let insert = ruleParser.getInsert();
        if (insert) {
            if (curPage === 1) initView();
            /*if (curPage == 1) {
                window.postMessage({
                    command: 'pagetual.insert'
                }, '*');
            }*/
            let isJs = ruleParser.curSiteRule.action == 3 || ruleParser.hrefIsJs(nextLink);
            if (!isJs) {
                emuIframe = null;
                lastActiveUrl = nextLink;
                if (location.protocol === "https:" && /^http:/.test(nextLink)) {
                    nextLink = nextLink.replace(/^http/, "https");
                }
            }
            isLoading = true;
            if (curPage !== 1 || !isJs || !ruleParser.curSiteRule.smart) {
                ruleParser.beginLoading(loadingDiv);
            }
            let sleep = ruleParser.curSiteRule.sleep || 0;
            setTimeout(() => {
                if (ruleParser.curSiteRule.pageElementByJs) {
                    var over = eles => {
                        if (urlChanged || isPause) {
                            loadPageOver();
                            return;
                        }
                        if (eles) {
                            ruleParser.insertPage(document, eles, nextLink, () => {
                                createPageBar(nextLink);
                                checkAutoLoadNum();
                            }, true);
                        } else {
                            debug("Stop as no page when get by js");
                            isPause = true;
                            loadPageOver();
                        }
                    };
                    try {
                        ((typeof ruleParser.curSiteRule.pageElementByJs === 'function') ? ruleParser.curSiteRule.pageElementByJs : Function("over", "pageNum",'"use strict";' + ruleParser.curSiteRule.pageElementByJs))(over, curPage);
                    } catch(e) {
                        debug(e);
                    }
                } else if ((forceState === 2 || ruleParser.curSiteRule.action == 2) && !isJs) {
                    forceIframe(nextLink, (iframe, refresh) => {
                        if (urlChanged || isPause) {
                            loadPageOver();
                            return;
                        }
                        if (!refresh) {
                            let pageBar = createPageBar(nextLink);
                            if (pageBar && iframe && iframe.parentNode) iframe.parentNode.insertBefore(pageBar, iframe);
                        }
                        loadPageOver();
                        checkAutoLoadNum();
                    });
                } else if ((forceState === 3 || ruleParser.curSiteRule.action == 1) && !isJs) {
                    requestFromIframe(nextLink, (doc, eles) => {
                        if (urlChanged || isPause) {
                            loadPageOver();
                            return;
                        }
                        if (eles) {
                            ruleParser.insertPage(doc, eles, nextLink, () => {
                                createPageBar(nextLink);
                                checkAutoLoadNum();
                            }, true);
                        } else loadPageOver();
                    });
                } else {
                    if (!isJs) {
                        requestDoc(nextLink, (eles) => {
                            if (urlChanged || isPause) {
                                loadPageOver();
                                return;
                            }
                            if (eles) {
                                createPageBar(nextLink);
                                checkAutoLoadNum();
                            } else loadPageOver();
                        });
                    } else {
                        emuPage((doc, eles) => {
                            if (urlChanged || isPause) {
                                loadPageOver();
                                return;
                            }
                            if (eles) {
                                ruleParser.insertPage(doc, eles, "", () => {
                                    createPageBar(nextLink);
                                    checkAutoLoadNum();
                                }, true);
                            } else loadPageOver();
                        });
                    }
                }
            }, sleep);
        }
    }

    function init() {
        if (document.readyState === 'loading' || document.readyState === 'uninitialized') {
            let domReady = e => {
                initRules(() => {
                    initPage();
                });
                document.removeEventListener("DOMContentLoaded", domReady, false);
            };
            document.addEventListener("DOMContentLoaded", domReady, false);
        } else {
            initRules(() => {
                initPage();
            });
        }
    }

    function visibilitychangeHandler() {
        document.removeEventListener('visibilitychange', visibilitychangeHandler);
        init();
    }

    setTimeout(() => {
        if (document.hidden) {
            document.addEventListener('visibilitychange', visibilitychangeHandler);
        } else {
            init();
        }
    }, 300);
})();
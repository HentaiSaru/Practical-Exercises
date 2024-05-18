// https://greasyfork.org/zh-TW/scripts/462234-message
// https://greasyfork.org/zh-TW/scripts/449512-xtiper
(function() {

    //! 學習
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

    //! 學習
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

    //! 學習
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

    //! 學習
    function getElementBottom(ele) {
        return getElementTop(ele) + (ele.offsetHeight || ele.scrollHeight);
    }

    //! 學習
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

    //! 學習
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

    //! 學習
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
})();
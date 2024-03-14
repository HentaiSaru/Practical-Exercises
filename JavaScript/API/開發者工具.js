async function Listen(element, type, listener, add={}, callback=null) {
    try {
        element.addEventListener(type, listener, add);
        if (callback) {callback(true)}
    } catch {if (callback) {callback(false)}}
}

function Throttle_discard(func, delay) {
    let lastTime = 0;
    return function() {
        const context = this, args = arguments, now = Date.now();
        if ((now - lastTime) >= delay) {
            func.apply(context, args);
            lastTime = now;
        }
    };
}

Listen(document, "pointerover", Throttle_discard((event)=> {
    const target = event.target;
    target.style.cursor = "default";
    target.style.outline = "2px solid green";

    Listen(target, "pointerout", ()=> {
        target.style.outline = "";
    }, { capture: true, once: true });

}, 50), { capture: true, passive: true });

Listen(document, "click", (event)=> {
    event.stopImmediatePropagation();
    event.preventDefault();
    const target = event.target;

    target.style.cursor = "pointer";
    target.style.outline = "2px solid red";

    console.log(DOM_Parsing(target, "XPath"));
    console.log(target);
}, { capture: true });

function DOM_Parsing(element, format) {
    if (!element) {
        return undefined;
    } else if (element.id) {
        return `"#${element.id}"`;
    } else if (element.className) {
        return `".${element.className}"`.replaceAll(" ", ".");
    }

    switch (format) {
        case "selector":
            const path = [];
            while (element.parentElement) {
                let selector = element.localName;
                if (element.parentElement.children.length > 1) {
                    let index = Array.from(element.parentElement.children).indexOf(element) + 1;
                    selector += `:nth-child(${index})`;
                }
                path.unshift(selector);
                element = element.parentElement;
            }
            return path.join(" > ");

        case "XPath":
            const segs = [];
            let index, name, sib = element;
            while (sib && sib.nodeType === 1) {
                name = sib.localName.toLowerCase();
                if (sib.id) {
                    segs.unshift(`[@id="${sib.id}"]`);
                    break;
                } else {
                    let count = 1, sibling = sib.previousSibling;
                    while (sibling) {
                        if (sibling.nodeType == 1 && sibling.localName == name) {
                            count++;
                        }
                        sibling = sibling.previousSibling;
                    }
                    index = count == 1 ? name : `${name}[${count}]`;
                    segs.unshift(index);
                }
                sib = sib.parentNode;
            }
            return segs.length ? `//*${segs.join("/")}` : null;
    }
}

function XpathSelect(xpathExpression) {
    const result = document.evaluate(xpathExpression, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    if (result) {
        console.log(node);
    } else {
        console.log("No matching element found for the given XPath expression.");
    }
}
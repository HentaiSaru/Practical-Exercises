/* 滑鼠隱藏 */
async function MouseHide() {
    this.AddListener(document, "mousemove", ()=> {
        document.body.style.cursor = "default";

        this.MouseMove && clearTimeout(this.MouseMove);

        this.MouseMove = setTimeout(()=> {
            document.body.style.cursor = "none";
        }, 3000);
    }, {passive: true});

    this.DEV && this.log("滑鼠隱藏注入", true);
}
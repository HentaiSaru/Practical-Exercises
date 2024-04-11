storeListen([], call=> {
    console.log(call.Key);

})

// 觀察油猴 保存值的變化
async function storeListen(object, callback) {
    object.forEach(label => {
        GM_addValueChangeListener(label, function(Key, old_value, new_value, remote) {
            callback({key: Key, ov: old_value, nv: new_value, far: remote});
        })
    })
}

// 觀察某對象變化 (持續不刪除)

const obMark = new Map();
async function Observer(object, trigger, {
    mark=false,
    subtree=true,
    childList=true,
    characterData=false
}={}) {
    if (mark) {
        if (obMark.has(mark)) {return}
        else {obMark.set(mark, true)}
    }
    (new MutationObserver(() => {trigger()})).observe(object, {
        subtree: subtree,
        childList: childList,
        characterData: characterData,
    });
}

Observer(
    document.querySelector(".card-list__items"),
    ()=> {
        console.log("換頁");
    },
    {subtree: false}
)
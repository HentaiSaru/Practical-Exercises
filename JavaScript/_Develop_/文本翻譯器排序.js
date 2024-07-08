const TT = {}

// 傳入要打印排序的物件
Object_sorting(TT);

// Array_to_Object();

function Array_to_Object(array) {
    for (const data of array) {
        console.log(`"${data['k']}": "${data['v']}",`);
    }
}

function Object_sorting(...obj) {
    const sort = [];
    const sortedComp = {};
    const comp = Object.assign({}, ...obj);

    // 計算長度並收集數據
    Object.entries(comp).forEach(function ([key, value]) {
        const merge = key + value;
        sort.push({
            "length": merge.length,
            "data": { [key.toLowerCase()]: value }
        });
    });

    // 按長度排序
    sort.sort((a, b) => a.length - b.length);

    // 列印排序後的結果
    sort.forEach(item => {
        const key = Object.keys(item.data)[0];
        const value = item.data[key];
        sortedComp[key] = value;
    });

    // 打印格式
    const formattedOutput = JSON.stringify(sortedComp, null, 2).replace(/"([^"]+)":/g, '"$1":');

    console.log(formattedOutput);
};
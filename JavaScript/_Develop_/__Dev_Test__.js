const FileName = {
    FillValue: {
        Filler: "0",
        Amount: "Auto",
    },
    CompressName: "({Artist}) {Title}",
    FolderName: "{Title}",
    FillName: "{Title} {Fill}",
}

const Named_Data = {
    fill: ()=> "測試填充",
    title: ()=> "測試標題",
    artist: ()=> "測試藝術家",
    source: ()=> "測試來源",
    time: ()=> "測試時間"
}

// 等待修改為通用性函數
function FormatAnaly(template, format) {
    if (typeof format == "string") {
        return format.split(/{([^}]+)}/g).filter(Boolean).map(data => {
            const LowerData = data.toLowerCase();
            const isWord = /^[a-zA-Z]+$/.test(LowerData);
            return isWord ? template[LowerData]?.() || "None" : data;
        }).join("");

    } else if (typeof format == "object") {
        const filler = String(format.Filler) || "0";
        const amount = parseInt(format.Amount) || "auto";
        return [amount, filler];

    }
}

console.log(FormatAnaly(Named_Data, FileName.FillValue));
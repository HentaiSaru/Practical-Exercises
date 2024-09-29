import open from "fs";

function Out(Path, Data) {
    open.writeFile(Path, Data, err => {
        err ? console.log(`輸出失敗: ${err}`) : console.log("輸出成功");
    });
}

function Read(Path) {
    return new Promise((resolve, reject) => {
        let Cache = "";
        open.readFile(Path, "utf-8", (err, data) => {
            if (err) return reject(err);

            for (const value of Object.values(JSON.parse(data))) {
                try {
                    for (const [name, link] of Object.entries(value["下載連結"])) {
                        Cache += `${link}?f=${name}\n`;
                    }
                } catch (error) {}
            }

            if (Cache.endsWith('\n')) Cache = Cache.slice(0, -1); // 如果最後一行是 \n 就排除掉這行
            resolve(Cache);
        });
    });
};

Read("").then(read=> {
    Out("R:/Kemer.txt", read);
})
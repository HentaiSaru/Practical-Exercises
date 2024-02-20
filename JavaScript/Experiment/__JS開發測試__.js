const test = new Map();
test.set("1", "A")
test.set("2", "B")
test.set("3", "C")
test.set("4", "D")
test.set("5", "E")

async function StartDownload() {
    for (const [index, link] of test.entries()) {
        console.log(index, link);
        await new Promise(resolve => setTimeout(resolve, 200));
    }
}

async function run() {
    for(let i = 0; i < 5; i++) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        await StartDownload();
    }
}
//run()
import { readFile } from "fs";

const json_path = ""

readFile(json_path, "utf-8", (err, data)=> {
    for (const value of Object.values(JSON.parse(data))) {
        try {
            for (const [name, link] of Object.entries(value["下載連結"])) {
                console.log(`${link}?f=${name}`);
            }
        } catch {}
    }
});
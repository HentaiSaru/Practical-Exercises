import open from "fs";

class LoadData {
    constructor(path) {
      this.path = path;
      this.data = [];
    }
  
    Read_data() {
      open.readFile(this.path, "utf-8", (err, data) => {
        for (const value of Object.values(JSON.parse(data))) {
          try {
              for (const [name, link] of Object.entries(value["下載連結"])) {
                  this.data.push(`${link}?f=${name}`);
              }
          } catch {}
        }
        console.log(this.data);
      });
    }
}
const Load = new LoadData("E:/(新)下載點/toone.json");
Load.Read_data();
import path from "path";
import open from "fs";
import { log } from "console";

class LoadData {
    constructor(input, output) {
      this.input = input;
      this.output = output;

      this.s_advanced = false;
      this.e_advanced = true;

      this.space = /^\r$/;
      this.comment = /^\s*(\/\/|#).+\r$/;
      this.ms_comment = /^\s*(\/\*|""")/;
      this.me_comment = /^\s*("""|\*\/\r)\s*$/;

      this.output_box = [];
      this.processed_box = [];
    }

    Advanced_analysis(data, n) {
      if (this.ms_comment.test(data)) {
        this.s_advanced = true;
        this.e_advanced = true;

        if (this.me_comment.test(data)) {
          this.s_advanced = false;
          this.e_advanced = false;
        }

        if (this.s_advanced && this.e_advanced) {
          console.log(data);
        } else if(this.s_advanced && !this.e_advanced) {
          console.log(data);
        }
      } else if (this.s_advanced) {
        console.log(data);
      } else {
        //console.log(data);
      }

      /*
      1. 開頭 / 結尾 都是 true (刪除)
      2. 開頭 是 結為 否 (刪除)
      3. 開頭否 結尾 是 (不刪除)
      */

      //console.log(`[${n}] ${this.ms_comment.test(data)}/${this.me_comment.test(data)} : ${data}`);

      /*if (this.s_advanced) {
        if (this.me_comment.test(data)) {
          this.advanced = false;
        }
      } else if (this.ms_comment.test(data)) {
        this.advanced = true;
      } else {
        this.output_box.push(data);
      }*/
    }
  
    Read_data() {
      let test_number = 0;
      open.readFile(this.input, "utf-8", (err, data) => {
        if (err) {console.error(err);return;}

        for (const line of data.split("\n")) {
          this.processed_box.push(line);
        }

        for (const line of this.processed_box) {
          if (this.comment.test(line) || this.space.test(line)) {
            continue;
          } else {
            this.Advanced_analysis(line, ++test_number);
          }
        }
        //console.log(this.output_box.join("\n"));
        //this.Output_Data(this.output_box.join("\n"));
      });
    }

    Output_Data(data) {
      try {
        if (open.existsSync(path.dirname(this.output))) {
          open.writeFile(this.output, data, err => {
            err ? console.log("輸出失敗") : console.log("輸出成功");
          });
        } else {
          throw error;
        }
      } catch {console.log("請設置正確輸出路徑")}
    }
}

const Load = new LoadData(
  "E:/(新)下載點/TextEncryption.pyw",
  "E:/(新)下載點/TE.pyw"
);
Load.Read_data();
import path from "path";
import open from "fs";

class LoadData {
    constructor(input, output) {
      this.input = input;
      this.output = output;

      this.s_advanced = false;
      this.e_advanced = true;

      this.space = /^\s*\r$/;
      this.comment = /^\s*(\/\/|#).+\r$/;
      this.ms_comment = /^\s*(\/\*|""")/;
      this.me_comment = /^.*("""|\*\/\r)\s*$/;

      this.output_box = [];
      this.processed_box = [];
    }

    Advanced_analysis(data, n) {
      if (this.s_advanced && this.e_advanced) {
        this.e_advanced = this.me_comment.test(data) ? false : true;

      } else if (this.ms_comment.test(data) && !this.s_advanced) {
        this.s_advanced = true;

      } else if (this.me_comment.test(data) && this.e_advanced) {
        this.e_advanced = false;

      } else if (this.ms_comment.test(data) && this.me_comment.test(data)) {
        this.s_advanced && this.e_advanced ? this.output_box.push(data) : null; // JS
        // this.s_advanced && !this.e_advanced ? this.output_box.push(data) : null; // Python

      } else {
        // console.log(`[${n}] ${this.ms_comment.test(data)}/${this.me_comment.test(data)} : ${data}`);
        // console.log(`[${n}] ${this.s_advanced}/${this.e_advanced} : ${data}`);
        this.output_box.push(data);
      }
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

        this.Output_Data(this.output_box.join("\n"));
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

// const Load = new LoadData(
  // "E:/(新)下載點/TextEncryption.pyw",
  // "E:/(新)下載點/TE.pyw"
// );

const Load = new LoadData(
  "E:/(新)下載點/KemerEnhance.js",
  "E:/(新)下載點/KE.js"
);

Load.Read_data();
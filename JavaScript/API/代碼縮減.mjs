import path from "path";
import open from "fs";

/* 代碼縮短程式 v1.0.0

  開發環境
  Node.js: v21.6.1
  Npm: 9.8.1

  目前只寫 Python 和 JavaScript 的邏輯, 其他語言應該是不適用
  填寫輸入代碼路徑 與 輸出代碼路徑, 自動刪除代碼中(註解, 縮排, 多餘的空格)
*/

class LoadData {
    constructor(input, output) {
      this.input = input;
      this.output = output;
      this.extname = null;

      this.s_advanced = false;
      this.e_advanced = true;

      this.space = /^\s*\r$/; // 空白區
      this.tailspace = /\s+$/; // 尾部空白區
      this.comment = /^\s*(\/\/|#).+\r$/; // 單行註解
      this.ms_comment = /^\s*(\/\*|""")/;
      this.me_comment = /^.*("""|\*\/\r)\s*$/;
      this.tailcomment = /[\/\/#][^"'(){}<>,;:\\]*\r$/; // 尾部註解

      this.java = ["js", ".ts", "mjs", ".cjs", "java", ".coffee"];
      this.python = [".py", ".pyw"];

      this.output_box = [];
      this.processed_box = [];
    }

    Advanced_analysis(data) {
      if (this.s_advanced && this.e_advanced) {
        this.e_advanced = this.me_comment.test(data) ? false : true;

      } else if (this.ms_comment.test(data) && !this.s_advanced) {
        this.s_advanced = true;

      } else if (this.me_comment.test(data) && this.e_advanced) {
        this.e_advanced = false;

      } else if (this.ms_comment.test(data) && this.me_comment.test(data)) {
        if (this.java.includes(this.extname)) {
          this.s_advanced && this.e_advanced ? this.output_box.push(data) : null; // JS
        } else if (this.python.includes(this.extname)) {
          this.s_advanced && !this.e_advanced ? this.output_box.push(data) : null; // Python
        }
      } else {
        this.output_box.push(data);
      }
    }

    Read_data() {
      open.readFile(this.input, "utf-8", (err, data) => {
        if (err) {console.error(err);return;}

        for (const line of data.split("\n")) {
          this.processed_box.push(line);
        }

        this.extname = path.extname(this.input);

        for (const line of this.processed_box) {
          if (this.comment.test(line) || this.space.test(line)) {
            continue;
          } else {
            this.Advanced_analysis(line);
          }
        }

        this.Output_Data(
          this.output_box.map(
            line => line.replace(this.tailcomment, "").replace(this.tailspace, "")
          ).join("\n")
        );
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
  "輸入",
  "輸出"
);

Load.Read_data();
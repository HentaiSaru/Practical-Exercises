import path from "path";
import open from "fs";

/* 代碼縮短程式 [陣列排除版] v1.0.2

  開發環境
  Node.js: v21.6.1
  Npm: 9.8.1

  目前只寫 Python 和 JavaScript 的邏輯, 其他語言應該是不適用 (目前是有 BUG 的, 畢竟不是用語法分析)
  填寫輸入代碼路徑 與 輸出代碼路徑, 自動刪除代碼中(註解, 縮排, 多餘的空格)
*/

class LoadData {
    /**
     * @param {string} input  - 載入的文件路徑
     * @param {string} output - 輸出的文件路徑(不要加附檔名)
     * @param {boolean} debug - 顯示除錯資訊, 除錯狀態下不會輸出文件
     */
    constructor(input, output, debug=false) {
      this.input = input;
      this.output = output;
      this.extname = null;

      this.debug = debug;
      this.s_mark = false;
      this.e_mark = true;

      this.space = /^\s*\r$/; // 空白區
      this.tailspace = /\s+$/; // 尾部空白區
      this.comment = /^\s*(\/\/|#).+\r$/; // 單行註解
      this.ms_comment = /^\s*(\/\*|""")/; // 區域註解開頭
      this.mm_comment = /\s*\*/; // 區域註解中段
      this.me_comment = /\s*(\*\/|""")\r$/; // 區域註解結尾
      this.tailcomment = /[\/\/#][^"',:;?)}]*\r$/; // 尾部單行註解
      this.area_comment = /^[\s]*("""){1}|(\/\*){1}.*?(?=\*\/\r)|.*?(?=""")\r/ // 單行的區域註解

      this.java = ["js", "ts", "mjs", "cjs", "java", "coffee"];
      this.python = ["py", "pyw"];

      this.output_box = [];
      this.processed_box = [];

      /* 回傳 (前段/後段) 匹配狀態 */
      this.SC = (data) => {return this.ms_comment.test(data)}
      this.EC = (data) => {return this.me_comment.test(data)}
      /* 打印所有狀態值 (前匹配, 前標記, 後匹配, 後標記) */
      this.PD = (type, data, index) => {
        console.log("\x1b[32m%s\x1b[0m", `[Type ${type}][${index}](${this.SC(data)}|${this.s_mark}, ${this.EC(data)}|${this.e_mark}) : ${data}`)
      }

      /* 簡單的清理註解 */
      this.SimpleClean = (data) => {return this.comment.test(data) || this.area_comment.test(data) || this.space.test(data)}
      /* 回傳尾部註解 與 空格 清理 */
      this.TailClean = (data) => {return data.replace(this.tailcomment, "").replace(this.tailspace, "")}

      /* 傳入值保存到 output_box */
      this.OP = (data) => {this.output_box.push(data)};
      /* 取得附檔名 */
      this.Extension = (name) => {
        const match = name.match(/\.([^.]+)$/);
        return `.${match[1]}` || ".js";
      }
    }

    /* 進階處理邏輯 (待開發) */
    AdvancedClean(data, index) {
      if (this.s_mark && this.e_mark) {
        this.debug ? this.PD("A", data, index) : null;
        this.e_mark = this.EC(data) ? false : true;

      } else if (this.SC(data) && !this.s_mark) {
        this.debug ? this.PD("B", data, index) : null;
        this.s_mark = true;

      } else if (this.EC(data) && this.e_mark) {
        this.debug ? this.PD("C", data, index) : null;
        this.e_mark = false;

      } else if (this.SC(data) && this.EC(data)) {
        this.debug ? this.PD("D", data, index) : null;

        if (this.java.includes(this.extname)) {
          this.s_mark && this.e_mark ? this.OP(data) : null; // JS
        } else if (this.python.includes(this.extname)) {
          this.s_mark && !this.e_mark ? this.OP(data) : null; // Python
        }
      } else {
        this.OP(data);
      }
    }

    /* 讀取數據 */
    async Read_data() {
      open.readFile(this.input, "utf-8", (err, data) => {
        if (err) {console.error(err);return;}

        for (const line of data.split("\n")) {
          this.processed_box.push(line);
        }

        this.extname = path.extname(this.input);

        let index = 0;
        for (const line of this.processed_box) {
          if (this.SimpleClean(line)) {
            this.debug ? this.PD("Simple", line, ++index) : null;
            continue;
          } else {
            this.AdvancedClean(line, ++index);
          }
        }

        const merge = this.output_box.map(line => this.TailClean(line)).join("\n");
        if (!this.debug) {
          this.Output_Data(merge);
        } else {
          console.log("\n\x1b[36m\x1b[1m%s\x1b[0m", merge);
        }
      });
    }

    /* 輸出數據 */
    async Output_Data(data) {
      try {
        if (open.existsSync(path.dirname(this.output))) {
          open.writeFile(`${this.output}${this.Extension(this.input)}`, data, err => {
            err ? console.log("輸出失敗") : console.log("輸出成功");
          });
        } else {
          throw error;
        }
      } catch {console.log("請設置正確輸出路徑")}
    }
}

const Load = new LoadData(
  "C:/GitHubProject/Practical Exercises/JavaScript/Beta/ExDownloader.js", "R:/Simplify", false
);

Load.Read_data();
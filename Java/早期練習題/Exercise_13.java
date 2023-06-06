/* 題目說明

請撰寫程式，讓使用者輸入任意資料（單行），
輸出使用者的輸入內容並寫入至write.txt檔案中，每一次皆覆蓋上一次的資料，
若輸入空值，請輸出【error】，不進行資料寫入。

請使用print()方法，從write.txt中讀出檔案內容並輸出【write:xxx】。

輸入說明
任意資料

輸出說明
將使用者輸入內容寫入至write.txt檔案中。再輸出檔案中的內容（輸出最後一行後不自動換行）
________________________________________
範例輸入1
Jacky,male

範例輸出1
write:Jacky,male

*/

import java.util.*;
import java.io.*;

public class Exercise_13 {
    public static void main(String[] args){

        try{
            Scanner sc = new Scanner(System.in);
            String input = sc.next();

            if(input.equals(""))throw new Exception();

            FileWriter writer = new FileWriter("write.txt",true);
            writer.write(input);
            writer.close();

            print(input);

        }catch(Exception e){
            System.out.print("error");
            return;
        }
    }

    public static void print(String file){
        System.out.print("write:" + file);
    }
}
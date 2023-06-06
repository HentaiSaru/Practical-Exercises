/* 題目說明

專案目錄已提供read.txt，內含13位學生的資料，每列資料以半形逗號隔開，第一欄的數字代表編號。
請撰寫程式，輸入如1-13的數字，再將該數字代表的資料予以刪除，其餘未刪除之資料寫入write.txt，並輸出如【Delete:1 Nancy】。
若輸入文字或不在指定範圍的數字，請輸出【error】。

輸入說明
編號

輸出說明
已刪除的資料編號及姓名（輸出最後一行後不自動換行）
________________________________________
範例輸入1
1
範例輸出1
Delete:1 Nancy
 
範例輸入2
18
範例輸出2
error

*/

import java.util.*;
import java.io.*;

public class Exercise_15 {
    public static void main(String[] args){
        ArrayList<String> arr = new ArrayList<>();
        Scanner sc = new Scanner(System.in);

        try{
            File file = new File("read.txt");
            sc = new Scanner(file);

            while(sc.hasNextLine()){
                arr.add(sc.nextLine());
            }

            int input = sc.nextInt();

            if(input>=1 & input<=13){
                String[] date = arr.get(input-1).split(",");
                System.out.print("Delete:" +date[0]+ " " + date[1]);

                arr.remove(input-1);

                FileWriter fileWriter = new FileWriter("write.txt",true);
                for(String n: arr)fileWriter.write(n + "\n");
                fileWriter.close();
            }else{
                throw new Exception();
            }
        }catch(Exception e){
            System.out.print("error");
            return;
        }
    }
}
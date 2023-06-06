/* 題目說明

請撰寫程式，讓使用者輸入三個成績（
成績之間，以一個半形空格分隔，且0≦成績≦100），
將專案中名為new_student的陣列改成以半形逗號分隔的字串，
結合同樣以半形逗號分隔的三個成績字串，
以附加的方式寫入write.txt檔案中並輸出。
若輸入文字、成績未在0~100之間，或輸入格式不合規定的資料，
請輸出【error】。

輸入說明
三個成績（成績之間，以一個半形空格分隔，且0≦成績≦100）

輸出說明
new_student陣列資料及使用者輸入的成績
（輸出最後一行後不自動換行）
________________________________________
範例輸入1
90 90 90

範例輸出1
Sam,1981/10/1,A234567890,90,90,90
 
範例輸入2
90 90 KJ

範例輸出2
error

*/

import java.util.*;
import java.io.*;

public class Exercise_14{
    public static void main(String[] args){
        Scanner sc = new Scanner(System.in);
        String[] new_student = { "Sam", "1981/10/1", "A234567890" };
        String data = "" ;
        int number = 0;

        for(String n:new_student)data += (n + ",");

        try{

            for(String n:sc.nextLine().split(" ")){

                number = Integer.parseInt(n);

                if(number>=0 & number<=100){
                    data += (number + ",");
                }else{
                    throw new Exception();
                }

            }

            FileWriter file = new FileWriter("write.txt",true);
            data = data.replaceAll(",$", "");
            file.write(data);
            file.close();

            System.out.print(data);

        }catch(Exception e){
            System.out.print("error");
            return;
        }
    }
}
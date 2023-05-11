/* 題目說明

(1) 請撰寫一程式，建立名稱為weeks的文字陣列，此文字陣列內容為"Mon", "Tus", "Wed", "Thr", "Fri", "Sat", "Sun"。
(2) 讓使用者輸入一個0-6之間的整數n，輸出陣列中的第n+1個元素，若輸入有誤，請輸出【error】。

輸入說明
0-6的整數

輸出說明
陣列元素值（輸出最後一行後不自動換行）
________________________________________
範例輸入1
0
範例輸出1
Mon

範例輸入2
8
範例輸出2
error

*/

import java.util.*;

public class Exercise_07 {
    public static void main(String[] args){

        Scanner sc = new Scanner(System.in);
        String[] weeks = {"Mon", "Tus", "Wed", "Thr", "Fri", "Sat", "Sun"};

        try{
            System.out.print(weeks[sc.nextInt()]);
        }catch(Exception e){
            System.out.print("error");
        }
    }
}
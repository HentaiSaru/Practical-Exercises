/* 題目說明

請撰寫程式，讓使用者輸入一個數字，若數字為奇數，呼叫isodd方法並輸出【x is an odd number.】；
若是偶數，呼叫iseven方法並輸出【x is an even number.】；若輸入文字，請輸出【error】。

輸入說明
一個數字

輸出說明
奇偶數判斷結果（輸出最後一行後不自動換行）
________________________________________

範例輸入1
1256
範例輸出1
1256 is an even number.

範例輸入2
1599
範例輸出2
1599 is an odd number.

範例輸入3
tg135
範例輸出3
error

*/

import java.util.*;

public class Exercise_04{
    public static void main(String[] args){
        Scanner sc = new Scanner(System.in);
        isodd(sc.nextLine());
    }

    static void isodd(String number){
        try{
            int num = Integer.parseInt(number);
            if(num % 2 == 0)System.out.print(num + " is an even number.");
            else System.out.print(num + " is an odd number.");
        }catch(Exception e){
            System.out.print("error");
        }
    }

}
/* 題目說明

請撰寫程式，輸入一個1-100的數值做為亂數種子，請檢查不可超出1-100的邊界，否則輸出【error】。
取得10個不重複亂數並輸出，輸出格式如【10 20 33 90 88 19 35 87 91 45 】，數字間以半形空格隔開。

輸入說明
1個1-100的數值做為亂數種子

輸出說明
10個1-100不重複亂數（輸出最後一行後不自動換行）
________________________________________
範例輸入1
100

範例輸出1
16 51 75 89 92 67 37 24 14 23 

範例輸入2
50

範例輸出2
18 89 94 13 52 62 37 59 17 9 

範例輸入3
101

範例輸出3
error

*/

import java.util.*;

public class Exercise_12 {
    public static void main(String[] args){

        Scanner sc = new Scanner(System.in);
        List<Integer> arr= new ArrayList<Integer>();

        try{
            int input = sc.nextInt();
            if(input<1 || input>100)throw new Exception();

            Random ran = new Random(input);

            while(arr.size()<10){
                int n = ran.nextInt(100)+1;
                if(arr.contains(n))continue;// 重複的跳過
                arr.add(n);
            }

            for(int show:arr)System.out.print(show + " ");

        }catch(Exception e){
            System.out.print("error");
            return;
        }
    }
}
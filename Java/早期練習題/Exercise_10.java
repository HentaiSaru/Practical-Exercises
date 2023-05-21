/* 題目說明

請撰寫程式，讓使用者輸入兩個8位數的整數作為日期，計算二者相差的天數並輸出，若輸入文字或無法轉換，請輸出【error】。

輸入說明
兩個8位數的整數日期

輸出說明
兩日期的時間差（輸出最後一行後不自動換行）
________________________________________

範例輸入1
20190401
20190420

範例輸出1
19

範例輸入2
20190419
20160216

範例輸出2
1158

範例輸入3
20150101
20150199

範例輸出3
error

*/

import java.text.SimpleDateFormat;
import java.util.*;

public class Exercise_10 {
    public static void main(String[] args){

        Scanner sc = new Scanner(System.in);
        DateParsing par = new DateParsing();
        String date1 = sc.next() , date2 = sc.next();
        par.difference(date1,date2);
        
    }
}
class DateParsing{
    SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd");
    
    public void difference(String date1,String date2){
        try{
            sdf.setLenient(false); // 關閉寬鬆解析 只要格式不符就跳出例外

            Date data_1 = sdf.parse(date1);
            Date data_2 = sdf.parse(date2);

            int day = Math.abs((int)((data_1.getTime() - data_2.getTime())/(1000*3600*24)));
            System.out.print(day);
        }catch(Exception e){
            System.out.print("error");
        }
    }
}
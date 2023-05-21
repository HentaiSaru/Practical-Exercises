/* 題目說明

請撰寫程式，讓使用者輸入一個8位數的整數作為日期
計算並輸出此日期的上週起迄日，輸出格式如【xxxx/xx/xx-yyyy/yy/yy】（-及/皆為半形符號）
以星期一為第一天，星期日為最後一天。若輸入的日期剛好是星期日，則此星期日為上週起迄日的最後一天。
若輸入文字或無法轉換，請輸出【error】。

輸入說明
一個8位數的整數做為日期

輸出說明
上週的起迄日（輸出最後一行後不自動換行）
________________________________________

範例輸入1
20190422

範例輸出1
2019/04/15-2019/04/21

範例輸入2
20111332

範例輸出2
error

範例輸入3
20191110

範例輸出3
2019/11/04-2019/11/10

*/
import java.text.SimpleDateFormat;
import java.util.*;

public class Exercise_11 {
    public static void main(String[] args){

        Scanner sc = new Scanner(System.in);
        String EnterDate = sc.next();

        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd");
        sdf.setLenient(false);

        try{
            Date date = sdf.parse(EnterDate);
            sdf = new SimpleDateFormat("yyyy/MM/dd");
            EnterDate = sdf.format(date);

            Calendar cal = Calendar.getInstance();
            cal.setTime(date);

            int w = cal.get(Calendar.DAY_OF_WEEK)-1;

            if(w == 0){
                cal.add(Calendar.DAY_OF_YEAR,-6);
                Date dt1 = cal.getTime();

                String ReEnterDate = sdf.format(dt1);
                System.out.print(ReEnterDate + "-" + EnterDate);
            }else{
                cal.add(Calendar.DAY_OF_YEAR,-6-w);
                Date dt2 = cal.getTime();

                cal.add(Calendar.DAY_OF_YEAR,6);
                Date dt3 = cal.getTime();

                String StartDate = sdf.format(dt2);
                String EndDate = sdf.format(dt3);

                System.out.print(StartDate + "-" + EndDate);
            }
        }catch(Exception e){
            System.out.print("error");
            return;
        }
    }
}
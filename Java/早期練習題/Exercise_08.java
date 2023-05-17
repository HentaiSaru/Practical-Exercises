/* 題目說明

(1) 專案中已提供一個scores陣列，陣列中包含20個學生成績{ 100, 100, 95, 95, 92, 91, 90, 100, 88, 88, 87, 87, 90, 91, 85, 80, 81, 82, 82, 89 }。
(2) 請設計一程式，輸入一個欲移除成績，將所有與輸入值相同的成績從陣列中全數移除，並將剩餘的成績進行平均值計算，輸出格式如【80.12】，四捨五入至小數點第二位。

輸入說明
一個欲移除的成績

輸出說明
將剩餘的成績進行平均值計算（輸出最後一行後不自動換行）
________________________________________

範例輸入1
100
範例輸出1
87.82

範例輸入2
28
範例輸出2
89.65

*/
import java.util.*;

public class Exercise_08{
    public static void main(String[] args){

        int[] scores = { 100, 100, 95, 95, 92, 91, 90, 100, 88, 88, 87, 87, 90, 91, 85, 80, 81, 82, 82, 89 };
        Scanner sc = new Scanner(System.in);
        double sum = 0;

        try{

            int input = sc.nextInt() , count = 0 ;

            for(int sco : scores){

                if(input == sco){
                    continue;
                }else{
                    sum += sco;
                    count ++;
                }
            }

            System.out.printf("%.2f" , (sum/count));

        }catch(Exception e){
            return;
        }
    }
}
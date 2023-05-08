/* 題目說明

請撰寫一程式，讓使用者輸入四個數字x1、y1、x2、y2，分別代表兩個點的座標(x1 y1)、(x2 y2)。
使用Math.Sqrt方法計算兩點歐式距離，四捨五入輸出至小數點後第四位。

＊ 提示：歐式距離 =√((x1−x2)2+(y1−y2)2)

輸入說明
x1 y1 (x1 y1中間以一個半形空白分隔)
x2 y2 (x2 y2中間以一個半形空白分隔)

輸出說明
兩座標的歐式距離（輸出最後一行後不自動換行）
________________________________________

範例輸入1
2 1
5.5 8

範例輸出1
7.8262

*/

/*
 * 一樣為了複習使用較繁瑣的寫法
 */
import java.util.*;

public class Exercise_02{
    public static void main(String[] args){

        Scanner sc = new Scanner(System.in);
        calculate Enter = new calculate();

        Enter.InputCalculation(
            sc.nextDouble(),
            sc.nextDouble(),
            sc.nextDouble(),
            sc.nextDouble()
        );
        
        Enter.result();

    }

}

class calculate{
    private double Euclidean_distance = 0;

    public void InputCalculation(double x1,double y1,double x2,double y2){
        Euclidean_distance = Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2));
    }

    public void result(){
        System.out.printf("%.4f" , Euclidean_distance);
    }
}
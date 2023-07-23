/* 題目說明

專案已內含名為Car的類別，內含cc屬性，請建立int型態的seats、color、doors屬性，其中color屬性請使用列舉，RED=1、BLUE=2、WHITE=3。
於main()中撰寫程式，讓使用者依序輸入以半形空格隔開的車子的cc數、座位數量、顏色及車門數量。

輸出格式為【新車各項屬性：{車子cc數}cc{座位數量}{顏色}{車門數量}】，輸出字串中無任何空格，如：【1500cc4RED4】，若輸入不在規定範圍的顏色，請輸出【error】。
＊ 提示：{名稱}用來表示該名稱的變數，如：{車子cc數}=1500。

輸入說明
車子的cc數 座位數量 顏色 車門數量
(資料之間以半形空格隔開

輸出說明
格式化輸出新車各項屬性（輸出最後一行後不自動換行）
________________________________________
範例輸入1
1500 4 1 4

範例輸出1
1500cc4RED4

範例輸入2
2000 4 3 5

範例輸出2
2000cc4WHITE5

範例輸入3
1800 4 4 5

範例輸出3
error

*/

import java.util.*;

enum colors {
    RED,BLUE,WHITE;
}

class Car {
    int cc, seat, door;
    String n;

    String inCar(String cc,String seat,String color,String doors){
        n =  cc + "cc" + seat + colors.values()[Integer.parseInt(color)-1] + doors;
        return n;
    }
}

public class Exercise_16 {
    public static void main(String[] args){
        Car car = new Car();
        Scanner sc = new Scanner(System.in);

        try {
            String[] input = sc.nextLine().split(" ");
            System.out.print(car.inCar(input[0], input[1], input[2], input[3]));
        } catch (Exception e) {
            System.out.print("error");
            return;
        }
    }
}
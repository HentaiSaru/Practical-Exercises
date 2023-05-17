/* 題目說明

(1) main()方法中已宣告兩個二維陣列a、b，其中b陣列內容需由使用者輸入六個1-100之間的正整數，並且以半形空格隔開。
(2) 將a、b陣列傳遞給程式中已定義的compute()方法，在compute()方法中將二維陣列a、b加總，再傳遞給print()方法將其加總結果輸出，以陣列一維為一列輸出，共輸出兩列。
(3) 每個數字固定為四位數且靠右對齊，若輸入有誤，請輸出【error】。

輸入說明
六個1-100之間的正整數，以半形空格隔開

輸出說明
二維陣列加總
________________________________________

範例輸入1
9 8 7 6 5 4
範例輸出1
  10  10  10
  10  10  10

範例輸入2
11 23
範例輸出2
error

*/
import java.util.*;

public class Exercise_09 {
    public static void main(String[] args){

        int a[][] = { { 1, 2, 3 }, { 4, 5, 6 } };

        int b[][] = new int[2][3];

        int c[][] = new int[2][3];

        Scanner sc = new Scanner(System.in);

        String line = sc.nextLine();



    }
 
}
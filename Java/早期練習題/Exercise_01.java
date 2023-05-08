/* 題目說明

請撰寫程式，接收輸入的兩個數字，若兩個數字皆是整數且為偶數，輸出相加結果；若輸入的數字不符合要求，請轉換為數字0。

輸入說明
兩個數字

輸出說明
依輸入值判斷輸出結果（輸出最後一行後不自動換行）

範例輸入1
240
302
範例輸出1
542

範例輸入2
12.987
500
範例輸出2
500

範例輸入3
135
701
範例輸出3
0

*/

/*
 * 該程式可以使用很簡潔的方式撰寫
 * 但為了複習採用較完整性的寫法
*/
import java.util.*;

public class Exercise_01{
    public static void main(String[] args){

        Scanner sc = new Scanner(System.in);
        operate input = new operate();

        // 根據題目需求使用輸入兩次的迴圈
        for(int i=0;i<2;i++){
            input.validation(sc.nextLine()); // 將輸入傳入到操作驗證方法
        }

        System.out.print(input.result()); // 最後呼叫結果回傳

    }
}

class operate{
    List<Integer> list = new ArrayList<>();
    int sum = 0;

    // 接收一個字串進行驗證
    public void validation(String number){

        try{

            // 將字串解析成int型別 , 只要不是就會有例外錯誤
            int num = Integer.parseInt(number);

            // 只要不是偶數就添加0
            if(num % 2 != 0)
                list.add(0);
            else{
                list.add(num); // 是就直接添加
            }

        }catch(Exception e){
            list.add(0); // 發生例外也是添加0
        }

    }

    // 回傳最後的結果
    public int result(){

        // 遍歷list , 並將數值累加
        for(int n : list)
            sum += n;
        return sum;
    }
}
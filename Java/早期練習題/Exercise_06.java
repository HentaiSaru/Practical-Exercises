/* 題目說明

請撰寫程式，讓使用者輸入一個字串，尋找並計算此字串於常數dreams短文中出現的次數，輸出次數。

輸入說明
一個字串

輸出說明
字串出現次數（輸出最後一行後不自動換行）
________________________________________
範例輸入1
to do
範例輸出1
2

範例輸入2
when yu miss
範例輸出2
0

*/

import java.util.*;

public class Exercise_06 {
    public static void main(String[] args){

        Scanner sc = new Scanner(System.in);
        int index = 0 , count = 0;

        final String dreams = "There are moments in life when you miss someone so much that "
            + "you just want to pick them from your dreams and hug them for real! Dream what "
            + "you want to dream; go where you want to go; be what you want to be, because you have "
            + "only one life and one chance to do all the things you want to do";

        String search = sc.nextLine();

        while ((index = dreams.indexOf(search,index)) != -1) {
            count++;
            index += search.length();
        }
        System.out.print(count);
    }
}
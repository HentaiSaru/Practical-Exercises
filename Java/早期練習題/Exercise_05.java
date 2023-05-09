/*  題目說明

請撰寫程式，讓使用者輸入兩個介於1至100之間的整數，輸出兩數間的所有質數。
若輸入文字、帶有小數點的數字資料、小於等於0或大於100以外的數字，請輸出【error】。

＊ 提示：1不為質數。

輸入說明
兩個介於1至100之間的整數

輸出說明
兩數間的所有質數
________________________________________

範例輸入1
79
100

範例輸出1
79
83
89
97

範例輸入2
0
25

範例輸出2
error

*/

import java.util.*;

public class Exercise_05 {
    public static void main(String[] args){

        Scanner sc = new Scanner(System.in);
        calculate cal = new calculate();

        cal.verify(sc.next(),sc.next());

    }
    
}

class calculate {
    int p;

    public void verify(String sa,String sb){

        try{

            int a = Integer.parseInt(sa);
            int b = Integer.parseInt(sb);

            if(a <= 0 || a > 100 && b <= 0 || b > 100)throw new Exception();

            for (int i = a; i <= b; i++) {
                p = 1;
                for (int j = 2; j < i; j++) {
                    if (i % j == 0) {
                        p = 0;
                        continue;
                    }
                }
                if (p == 1 & i != 1)System.out.println(i);
            }

        }catch(Exception e){
            System.out.println("error");
        }

    }

}
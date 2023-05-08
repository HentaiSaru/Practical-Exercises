/* 題目說明

請撰寫程式，讓使用者輸入四個整數，以Math套件功能取得最大值及最小值，再傳至print方法
若輸入值為負數、帶有小數點的數字資料或非數字資料，請轉換為0。

＊ 提示1：輸入10.0，請轉換為0。
＊ 提示2：輸入10.，請轉換為0。

輸入說明
四個整數

輸出說明
最小值smallest
最大值largest（輸出最後一行後不自動換行）
________________________________________
範例輸入1
100
92011
2.
275

範例輸出1
smallest:0
largest:92011

範例輸入2
-1029
-90
12
1.1
範例輸出2
smallest:0
largest:12

範例輸入3
monday
9
kio
-9

範例輸出3
smallest:0
largest:9

*/
import java.util.*;

public class Exercise_03{
    public static void main(String[] args){

        Scanner sc = new Scanner(System.in);
        operate input = new operate();

        for(int i=0;i<4;i++){
            input.validation(sc.nextLine());
        }

        input.result();
    }
}

class operate{
    private List<Integer> list = new ArrayList<>();

    public void validation(String number){
        try{
            if(number.matches("\\d+")){
                int num = Integer.parseInt(number);
                list.add(num);
            }else{
                throw new Exception();
            }
        }catch(Exception e){
            list.add(0);
        }
    }

    public void result(){
        IntSummaryStatistics stats = list.stream().mapToInt(Integer::intValue).summaryStatistics();

        System.out.println("smallest:" + stats.getMin());
        System.out.print("largest:" + stats.getMax());
    }

}
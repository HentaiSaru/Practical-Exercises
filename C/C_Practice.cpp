#include <stdio.h>

int main(){
    // printf("Hello World");
    // printf("\ntest\nhihi");
    int a = 10;
    int b = 20;

    printf("%d\n",(a+b));

    float aa = 5.5;
    // C語言也是用字元陣列的方式,輸出字串
    /* %d %i = int , %f = float , %c = char , %s = char[] , %lf = double 格式化輸出 */
    char bb[10] = "test";

    printf("%.2f\n",aa);
    printf("%s\n",bb);

    /* 字串連結輸出 */
    printf("a=%d\nb=%d\n",a,b);

    int x=5,y=10,z=15;
    int sum = x + y + z;
    int e , d , f;
    e = d = f = 50;

    printf("sum=%d , e=%d , d=%d , f=%d\n",sum,e,d,f);

    double bbb = 20.5;

    printf("%lf",bbb);

    // const 常量宣告 , 無法改變值(通常常量變數名為全大寫)


    return 0;
}
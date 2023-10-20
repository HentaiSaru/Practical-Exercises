#include <stdio.h>

int main(){
    //Todo 運算賦值
    int number1 = 100 + 50;
    int number2 = number1 + 50;
    int number3 = number1 + number2;
    printf("%d | %d | %d", number1, number2, number3);

    //Todo 運算符大小
    int a;
    float b;
    double c;
    printf("\n%u | %u | %u", sizeof(a), sizeof(b), sizeof(c));

    /*
    Todo 運算符號

    +   加
    -   減
    *   乘
    /   除
    %   除求餘數
    ++  加1
    --  減1

    Todo 賦值運算符

    a = 5
    a += 5  等效於 a = a + 5
    a -= 5  等效於 a = a - 5
    a *= 5  等效於 a = a * 5
    a /= 5  等效於 a = a / 5
    a %= 5  等效於 a = a % 5
    a &= 5  等效於 a = a & 5 二進位 邏輯運算
    a |= 5  等效於 a = a | 5
    a ^= 5  等效於 a = a ^ 5
    a >>= 5  等效於 a = a >> 5 二進位 位移
    a <<= 5  等效於 a = a << 5

    Todo 比較運算符(回傳 True/False)

    a == 5
    a != 5
    a > 5
    a < 5
    a >= 5
    a <= 5

    Todo 邏輯運算符(回傳 True/False)

    AND => &&
    OR => ||
    NOT => !
    */


    return 0;
}
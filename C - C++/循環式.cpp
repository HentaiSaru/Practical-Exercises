#include <stdio.h>

int main() {

    int w = 0;

    //Todo [ While 循環式 ]
    while(w <= 5) {
        printf("%d ", w);
        w++;
    }printf("\n");

    while (true) {
        printf("%d ", w);
        w++;

        if (w > 10) {
            break; //? 當值大於 10 跳出迴圈
        }
    }printf("\n");

    //Todo [ Do While 循環式 (先做再判斷) ]
    w = 0;

    do {
        printf("%d ", w);
        w++;
    } while (w <= 5);

    //Todo [ For 循環式 ]
    int x, y;
    printf("\n");

    for (x=1; x<10; x++) {
        for (y=1; y<10; y++) {
            printf("%d x %d = %d ", y, x, x*y);
        }
        printf("\n");

    }

    for (int i=1; i<=20; i++) {
        if (i % 2 != 0) {
            continue; //? 是奇數就跳過該輪
        }
        printf("%d ", i);
    }

    return 0;
}
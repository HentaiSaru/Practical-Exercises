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
    int x, y, z;
    printf("\n");

    for (x=1; x<10; x++) {
        for (y=1; y<10; y++) {
            z = x * y;

            if (z < 10) {
                printf("%d x %d =  %d ", y, x, z);
            } else {
                printf("%d x %d = %d ", y, x, z);
            }
        }
        printf("\n");

    }

    for (int i=1; i<=20; i++) {
        if (i % 2 != 0) {
            continue; //? 是奇數就跳過該輪
        }
        printf("%d ", i);
    }

    //Todo [ 類似 Foreach 循環式]
    char test[] = "C 語言沒有 foreach";
    printf("\n");

    for (char s : test) {
        printf("%c", s);
    }

    return 0;
}
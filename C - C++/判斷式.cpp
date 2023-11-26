#include <stdio.h>

int main() {
    if (20 > 10) {
        printf("True");
    }

    // 三元式
    (true) ? printf("\n") : NULL;

    // 多判斷
    if (20 < 10) {
        printf("False");
    } else if (10 == 10) {
        printf("True");
    } else {
        printf("NULL");
    }

    // Switch
    int test = 2;
    switch (test) {
        case 1:
            break;
        case 2:
            printf("\nSwitch: %d", test);
            break;
        default:
            break;
    }

    return 0;
}
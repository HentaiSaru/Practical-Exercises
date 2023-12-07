#include <stdio.h>

int main() {

    int array[] = {10, 20, 30, 40, 50};

    //? 取的特定的索引元素
    printf("%d\n", array[2]);

    //? 遍歷數組
    int length = sizeof(array) / sizeof(array[0]); // c 語言沒有內建直接獲取列表長度的函數
    for(int i=0; i < length; i++) {
        printf("%d ", array[i]);
    }
    printf("\n");

    //? 另一種寫法
    for(int element : array) {
        printf("%d ", element);
    }

    //Todo 創建數組並賦值 (可以直接知道長度)
    int arr2[3];

    arr2[0] = 60;
    arr2[1] = 70;
    arr2[2] = 80;

    for(int element : arr2) {
        printf("%d ", element);
    }

    //Todo 二維陣列
    int arr3[3][3] = {{1, 2, 3}, {4, 5, 6}, {7, 8, 9}};
    //? 更改數值
    arr3[1][1] = 50;

    //? 遍歷
    printf("\n");
    for (int i=0; i<3; i++) {
        for (int j=0; j<3; j++) {
            printf("%d ", arr3[i][j]);
        }
    }

    return 0;
}
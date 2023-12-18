#include <stdio.h>

int main() {
    int user_num;
    char user_char;

    printf("輸入數字(1), 按下空格, 輸入單字(2): ");
    scanf("%d %c", &user_num, &user_char);
    printf("你輸入的數字: %d\n", user_num);
    printf("你輸入的單字: %c\n", user_char);

    char String[30];
    printf("輸入字串: ");
    scanf("%s", String); //! 無法讀取空白鍵後的訊息
    printf("輸入的字串: %s", String);

    fgets(String, sizeof(String), stdin); //? 透過這個函數在進行打印 空格後續的內容
    printf("%s", String);
}
#include <stdio.h>
#include <string.h> //? 導入字串函式

int main() {
    //Todo C 語言中沒有直接的字串 String 要使用字元陣列
    char String[] = "the is a string"; //! 字串使用雙引號, 字元使用單引號
    printf("%s\n", String);

    //? 訪問某個字元
    printf("%c\n", String[0]);

    //? 修改字串
    String[7] = 'b';

    //? 遍歷字串
    for(char s : String) {
        printf("%c", s);
    }

    //Todo 另一個創建字串的方式
    char String_b[] = {'t', 'h', 'e', ' ', 'i', 's', ' ', 'a', ' ', 's', 't', 'r', 'i', 'n', 'g'};

    printf("\n%s\n", String);
    printf("%s\n", String_b);

    //Todo -> 使用字串函數

    printf("字串長度: %d\n", strlen(String));

    //? 連接字串
    strcat(String, String_b);
    printf("%s\n", String);

    //? 複製字串
    strcpy(String_b, String);
    printf("%s\n", String_b);

    //? 比較字串 [相等為0, 不相等不為0的值]
    printf("%d\n", strcmp(String, String_b));

    return 0;
}
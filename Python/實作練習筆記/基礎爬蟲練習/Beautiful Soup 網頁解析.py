from bs4 import BeautifulSoup
import requests

url = "xxx.com"

result = requests.get(url)

# 進行Html數據解析
soup = BeautifulSoup(result.text, "html.parser")

# 獲得標題
title = soup.title

#Todo 搜索方法
# 以 CSS 選擇器的方式尋找指定的 tag
soup.select()

# 以所在的 tag 位置，尋找第一個找到的 tag
soup.find() 

# 以所在的 tag 位置，尋找內容裡所有指定的 tag
soup.find_all()

# 以所在的 tag 位置，尋找父層所有指定的 tag 或第一個找到的 tag
soup.find_parents()
soup.find_parent()

# 以所在的 tag 位置，尋找同一層後方所有指定的 tag 或第一個找到的 tag
soup.find_next_siblings()
soup.find_next_sibling()

# 以所在的 tag 位置，尋找同一層前方所有指定的 tag 或第一個找到的 tag
soup.find_previous_siblings()
soup.ind_previous_sibling()

# 以所在的 tag 位置，尋找後方內容裡所有指定的 tag 或第一個找到的 tag
soup.find_all_next()
soup.find_next()

# 所在的 tag 位置，尋找前方內容裡所有指定的 tag 或第一個找到的 tag
soup.find_all_previous()
soup.find_previous()

#Todo 搜索參數
"""
*  string	   搜尋 tag 包含的文字。
*  limit	   搜尋 tag 後只回傳多少個結果。
*  recursive   預設 True，會搜尋內容所有層，設定 False 只會搜尋下一層。
*  id	       搜尋 tag 的 id。
*  class_	   搜尋 tag class，因為 class 為 Python 保留字，所以後方要加上底線。
*  href	       搜尋 tag href。
*  attrs	   搜尋 tag attribute 屬性。
"""
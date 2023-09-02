from lxml import etree

Html = "一個網頁DOM"

# 解析請求數據
tree = etree.fromstring(Html.text , etree.HTMLParser())

#Todo 解析方式

# 此解析適用於網頁請求, 解析為 Element 對象
etree.fromstring(Html.text , etree.HTMLParser())
""" 其他解析器

(預設) [用於解析嚴格的XML文檔, 須配合 fromstring 使用]
etree.HTMLParser()

etree.XMLParser()

[直接解析XML文檔]
etree.XML()

[直接解析HTML字符串]
etree.HTML()

* 經過測試 etree.HTMLParser() 和 etree.HTML() 的解析速度沒有太大差異
"""

# 此解析適用於本地數據, 可進行數據的修改
etree.parse("document.xml")
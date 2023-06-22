from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.by import By
from selenium import webdriver

# Chrome 的驅動
driver = webdriver.Chrome()

# 開啟網頁
driver.get("url")

#Todo 元素的選擇
# 透過ID尋找
driver.find_element(By.ID, 'a')
# 透過Class尋找
driver.find_element(By.CLASS_NAME, 'a')
# 透過Css樣式尋找
driver.find_element(By.CSS_SELECTOR, 'a')
# 透過Name屬性尋找
driver.find_element(By.NAME, 'a')
# 透過Tag名稱尋找
driver.find_element(By.TAG_NAME, 'a')
# 透過連結文字尋找
driver.find_element(By.LINK_TEXT, 'a')
# 透過連結的部份文字尋找
driver.find_element(By.PARTIAL_LINK_TEXT, 'a')
# 透過XPATH位置尋找
driver.find_element(By.XPATH, 'a')

#Todo 控制操作

element = WebDriverWait(driver,0).until(EC.element_to_be_clickable((By.XPATH, "//div[@class='']")))

# 按下滑鼠左鍵
element.click()
# 按下滑鼠左鍵不放
element.click_and_hold()
# 連續按兩下滑鼠左鍵
element.double_click()
# 按下滑鼠右鍵
element.context_click()
# source, target 點擊 source 元素後，移動到 target 元素放開
element.drag_and_drop()
# source, x, y	點擊 source 元素後，移動到指定的座標位置放開
element.drag_and_drop_by_offset()
# x, y	移動滑鼠座標到指定位置
element.move_by_offset()
# 移動滑鼠到某個元素上
element.move_to_element()
# element, x, y	移動滑鼠到某個元素的相對座標位置
element.move_to_element_with_offset()
# 放開滑鼠
element.release()
# 送出某個鍵盤按鍵值
element.send_keys()
# element, values 向某個元素發送鍵盤按鍵值
element.send_keys_to_element()
# 按著鍵盤某個鍵
element.key_down()
# 放開鍵盤某個鍵
element.key_up()
# 暫停動作(等待延遲)
element.pause()
# 執行儲存
element.perform()

#Todo 獲取數據

element = WebDriverWait(driver,0).until(EC.element_to_be_clickable((By.XPATH, "//div[@class='']")))

# 元素文字
element.text
# 元素的某個 HTML 屬性值
element.get_attribute
# 元素的 id
element.id
# 元素的 tag 名稱
element.tag_name
# 元素的長寬尺寸
element.size
# 將某個元素截圖並儲存為 png
element.screenshot
# 元素是否顯示在網頁上
element.is_displayed()
# 元素是否可用
element.is_enabled()
# 元素是否被選取
element.is_selected()
# 元素的父元素
element.parent
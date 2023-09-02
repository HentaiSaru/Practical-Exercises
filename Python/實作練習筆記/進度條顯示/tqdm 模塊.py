from tqdm import tqdm
import time

"""
第一值可為 range()
或是 in 某個變數

bar_format : 自訂格式化字串
{l_bar} : 左側的進度條（已完成部分）。
{bar} : 整個進度條（包括已完成和未完成部分）。
{r_bar} : 右側的進度條（未完成部分）。
{n_fmt} : 迭代對象的當前進度。
{total_fmt} : 迭代對象的總數。
{elapsed} : 已經過的時間。
{remaining} : 賸餘時間。
{rate} : 進度條的更新速率。
{postfix} : 追加的信息。

左側進度條、整個進度條，以及當前進度和總數
bar_format="{l_bar}{bar}| {percentage:3.0f}%"
左側進度條、整個進度條，以及完成的百分比
bar_format="{l_bar}{bar}| {elapsed}/{total}"

(默認True)
leave : 進度條完成後是否保留於顯示 , False 的話跑完會直接消失

(默認為None 自適應)
ncols : 設置進度條的長度

(默認True)
ascii : False 進度條會顯示 #

(默認False)
dynamic_ncols : 動態調整進度條寬度
lock_args : 動態調整進度條高度

"""
for _ in tqdm(
    range(100),
    desc="我的進度條",
    ncols=130,
    colour='#FFBDF7',
    postfix="進度條後墜文字",
):time.sleep(0.02)

# pbar = tqdm(total=100,desc="另一種使用方式")
# for _ in range(100):
    # pbar.update(1)
    # time.sleep(0.05)
# pbar.close()
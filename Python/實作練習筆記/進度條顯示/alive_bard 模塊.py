from alive_progress import alive_bar
import time

"""
>>> (經過時間顯示) : elapsed

>>> bar 進度條樣式 =>
█ : 'smooth'
=> : 'classic' 
#. : 'classic2'
>> : 'brackets' 
▉ : 'blocks'
● : bubbles'
■ : 'solid' 
✓ : 'checks' 
●○ 'circles'
■□'squares'
♬ : 'notes'
>>> 特別效果 =>
萬聖節圖示 'halloween' 
.∙∙∙∙. : 'ruler' 
+∙∙∙∙+ : 'ruler2'
´¯`·.¸¸.·´¯` : 'fish' 
⠠⢀⡀⡀⢀⠄ : 'scuba'

!#########################################

>>> spinner 進度條效果圖示 =>
/ : 'classic'
* : 'stars'
↖ : 'twirl'
←↖ : 'twirls'
▊ : 'horizontal'
▂ :'vertical'
▃▅▇ : 'waves'
▆▅▂ : (更快)'waves2'
▇▂▇ : 'waves3'
⠐⠠⢀⡀⠄ : 'dots_waves'
⢀⠄⠁⠐⢀ : (更密集)'dots_waves2'
奇怪的圖案 : 'it'
 >< ><● : 'ball_belt'
●/~\_/~ : 'balls_belt'
⡀|  ▶▶  : (箭頭左右)'triangles'
<<< : (箭頭左右)'brackets'
○○○○○ : (球左右)'bubbles'
○○○○○● : 'circles'
■□□□ : 'squares'
一堆花 : 'flowers'

>>> 各種圖案和動畫效果
'elements'
'loving'
'notes'
'notes2'
'arrow'
'arrows'
'arrows2'
'arrows_in'
'arrows_out'
'radioactive'
'boat'
'fish'
'fish2'
'fishes'
'crab'
'alive'
'wait'
'wait2'
'wait3'
'wait4'
'pulse'

"""

with alive_bar(100 ,title='⿶【我的進度條】 ➣', length=70 , bar='blocks', spinner='arrows2' , elapsed=False) as bar:
    for _ in range(100):
        bar()
        time.sleep(0.1)
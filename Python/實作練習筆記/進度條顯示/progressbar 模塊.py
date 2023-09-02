import progressbar
import time

widgets = [
    'progressbar : ', progressbar.Percentage(),
    ' ', progressbar.Bar(marker='■', left='[', right=']'),
    ' ', progressbar.Counter(), '/100',
    ' ', progressbar.Timer(),
]

bar = progressbar.ProgressBar(widgets=widgets,max_value=100)
for i in range(100):
    bar.update(i)
    time.sleep(0.02)
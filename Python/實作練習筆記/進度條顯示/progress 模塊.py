from progress.bar import Bar
import time

bar = Bar('我的進度條', fill="░" , suffix="後墜文字")
for i in range(100):
    bar.next()
    time.sleep(0.01)
bar.finish()

"""
with Bar('另一種進度條用法', max=20) as bar:
    for i in range(20):
        bar.next()
"""
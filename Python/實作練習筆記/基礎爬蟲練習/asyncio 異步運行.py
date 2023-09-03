import asyncio
import time

async def task1():
    await asyncio.sleep(1)
    print("任務1 完成")

async def task2():
    await asyncio.sleep(1)
    print("任務2 完成")
    
#Todo 取得事件循環
loop = asyncio.get_event_loop()

# 將任務添加到事件循環
"""
? 1. 一個一個創建任務, 並添加到事件循環

loop.create_task(task1())
loop.create_task(task2())

? 2. 創建一個工作list, 將任務添加後, 進行調用

work = [loop.create_task(task1()), loop.create_task(task2())]

? 2-1. 另一種創建, create_task()會創建任務, asyncio.gather 只會等到任務完成, 如果用以下方法, 他會等到函數完成, 而不是任務
work = [task1(), task2()]

* --- 啟用任務 ---

? 1. 直接調用 [不會終止]

loop.run_forever()

? 2. 調用任務直到任務完成, 最後關閉

loop.run_until_complete(asyncio.gather(*work))
loop.close()

? 2-1. 另一種調用方式

loop.run_until_complete(loop.create_task(task1()))

? 3. 一個一個調用, 完成第一個才調用第二個 [這種方式可直接調用, 不用取得事件循環]

asyncio.run(task1())
asyncio.run(task2())
"""

async def work(task):
    await asyncio.sleep(1)
    return f"任務: {task} 完成"

#Todo 等待所有函數完成
async def task3():
    start = time.time()
    task = [work(i) for i in range(1, 11)]
    results = await asyncio.gather(*task) # 等待全部方法完成 (等待方法完成, 會確切的等到函數全部完成)
    
    print(f"完成任務數: {len(results)}, 完成時間 {time.time() - start}")
   
#Todo 等待所有任務完成     
async def task4():
    start = time.time()
    task = [asyncio.create_task(work(i)) for i in range(1, 11)]
    results = await asyncio.gather(*task) # 等待全部任務完成 (等待任務完成, 就算函數內沒處理完成, 也會算做完成)
    
    print(f"完成任務數: {len(results)}, 完成時間 {time.time() - start}")

#Todo 同時調用
ran_work = [task3(), task4()]
loop.run_until_complete(asyncio.gather(*ran_work))
loop.close()

#Todo 分別調用
asyncio.run(task3())
asyncio.run(task4())
import asyncio
import httpx

url = "xxx.com"

#Todo   請求方式
#httpx.get(url)

#! 後續使用方式大致與 Requests 雷同

#Todo   進階用法
async def reques(url):
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        print(response.status_code)

async def main():
    work = [
        reques("https://www.gamer.com.tw/index2.php?ad=N")
        for _ in range(10)
    ]
    await asyncio.gather(*work)

asyncio.run(main())
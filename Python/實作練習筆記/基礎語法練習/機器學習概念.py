from scipy import stats
import numpy

speed = [99, 86, 87, 88, 111, 86, 103, 87, 94, 78, 77, 85, 86]
average = numpy.mean(speed)
print(f"平均速度: {average}")
median = numpy.median(speed)
print(f"中間速度: {median}")
many = stats.mode(speed)
print(f"出現最多次: {many}")
deviation = numpy.std(speed)
print(f"標準差: {deviation}")
mutations = numpy.var(speed)
print(f"變異數: {mutations}")

ages = [5, 31, 43, 48, 50, 41, 7, 11, 15, 39, 80, 82, 32, 2, 8, 6, 25, 36, 27, 61, 31]

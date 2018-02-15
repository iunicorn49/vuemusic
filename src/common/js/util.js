function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

export function shuffle(list) { // 随机排序
  let arr = list.slice() // 拷贝一个数组,不影响原数组
  for (let i = 0; i < arr.length; i++) {
    let j = getRandomInt(0, i)
    let t = arr[i]
    arr[i] = arr[j]
    arr[j] = t
  }
  return arr
}

// 节流函数
export function debounce(func, delay) {
  let timer
  return function (...args) { // args(叫什么都没有关系)是$watch的参数
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      func.apply(this, args) // this 指向vue实例
    }, delay)
  }
}
